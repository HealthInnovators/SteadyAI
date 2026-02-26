import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { ChallengeStatus, ParticipationStatus, PostType } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app';
import { disconnectPrisma, getPrismaClient } from '../../src/db/prisma';
import { assertIntegrationDbSafety, resetIntegrationDb } from './helpers';

describe('API integration', () => {
  let app: FastifyInstance;

  before(async () => {
    assertIntegrationDbSafety();
    app = await buildApp();
  });

  beforeEach(async () => {
    await resetIntegrationDb();
  });

  after(async () => {
    await app.close();
    await disconnectPrisma();
  });

  it('POST /api/challenges/check-in stores first entry and blocks duplicate same-day check-in', async () => {
    const prisma = getPrismaClient();
    const user = await createUser('checkin-user');
    await createActiveChallengeContext(user.id);

    const first = await app.inject({
      method: 'POST',
      url: '/api/challenges/check-in',
      headers: {
        'x-test-user-id': user.id
      },
      payload: {
        status: 'COMPLETED'
      }
    });

    assert.equal(first.statusCode, 201);
    const firstBody = first.json();
    assert.equal(firstBody.counts.total, 1);
    assert.equal(firstBody.counts.completed, 1);

    const duplicate = await app.inject({
      method: 'POST',
      url: '/api/challenges/check-in',
      headers: {
        'x-test-user-id': user.id
      },
      payload: {
        status: 'PARTIAL'
      }
    });

    assert.equal(duplicate.statusCode, 409);
    const duplicateBody = duplicate.json();
    assert.match(String(duplicateBody.error), /already submitted/i);

    const totalRows = await prisma.challengeCheckIn.count();
    assert.equal(totalRows, 1);
  });

  it('GET /api/community/feed returns posts from user group and active challenge scope', async () => {
    const user = await createUser('feed-user');
    const membership = await createActiveChallengeContext(user.id);

    await getPrismaClient().post.create({
      data: {
        authorId: user.id,
        groupId: membership.groupId,
        challengeId: membership.challengeId,
        type: PostType.WIN,
        content: 'Challenge scoped post'
      }
    });

    await getPrismaClient().post.create({
      data: {
        authorId: user.id,
        groupId: membership.groupId,
        challengeId: null,
        type: PostType.QUESTION,
        content: 'Group scoped post'
      }
    });

    const otherUser = await createUser('feed-other-user');
    const otherMembership = await createActiveChallengeContext(otherUser.id);

    await getPrismaClient().post.create({
      data: {
        authorId: otherUser.id,
        groupId: otherMembership.groupId,
        challengeId: otherMembership.challengeId,
        type: PostType.CHECK_IN,
        content: 'Should not appear in feed'
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/community/feed?limit=20',
      headers: {
        'x-test-user-id': user.id
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.groupId, membership.groupId);
    assert.equal(body.activeChallengeId, membership.challengeId);
    assert.equal(body.items.length, 2);
    assert.ok(body.items.every((item: { group: { id: string } }) => item.group.id === membership.groupId));
  });

  it('POST /api/community/posts creates a post for active member and normalizes content', async () => {
    const user = await createUser('post-user');
    const membership = await createActiveChallengeContext(user.id);

    const response = await app.inject({
      method: 'POST',
      url: '/api/community/posts',
      headers: {
        'x-test-user-id': user.id
      },
      payload: {
        type: 'WIN',
        content: '  I   finished   my session   '
      }
    });

    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.type, 'WIN');
    assert.equal(body.content, 'I finished my session');
    assert.equal(body.group.id, membership.groupId);
    assert.equal(body.challenge.id, membership.challengeId);
    assert.equal(body.author.id, user.id);
  });
});

async function createUser(slug: string) {
  const suffix = `${slug}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return getPrismaClient().user.create({
    data: {
      email: `${suffix}@steady.test`,
      username: suffix,
      onboardingCompleted: true
    },
    select: {
      id: true,
      email: true,
      username: true
    }
  });
}

async function createActiveChallengeContext(userId: string): Promise<{ groupId: string; challengeId: string; participationId: string }> {
  const prisma = getPrismaClient();

  const group = await prisma.communityGroup.create({
    data: {
      name: `Group-${Date.now()}`,
      ownerId: userId
    },
    select: {
      id: true
    }
  });

  const challenge = await prisma.challenge.create({
    data: {
      groupId: group.id,
      creatorId: userId,
      title: 'Active challenge',
      status: ChallengeStatus.ACTIVE
    },
    select: {
      id: true
    }
  });

  const participation = await prisma.challengeParticipation.create({
    data: {
      challengeId: challenge.id,
      userId,
      status: ParticipationStatus.JOINED
    },
    select: {
      id: true
    }
  });

  return {
    groupId: group.id,
    challengeId: challenge.id,
    participationId: participation.id
  };
}
