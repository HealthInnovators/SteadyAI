import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { ChallengeStatus, NotificationDeliveryStatus, NotificationType, ParticipationStatus, PostType } from '@prisma/client';
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

  it('POST /api/onboarding assigns rule-based group and 30-day challenge, returning full profile', async () => {
    const user = await createUser('onboarding-user');

    const response = await app.inject({
      method: 'POST',
      url: '/api/onboarding',
      headers: {
        'x-test-user-id': user.id,
        'x-test-user-email': user.email
      },
      payload: {
        primaryGoal: 'Build muscle',
        experienceLevel: 'Beginner',
        dietaryPreferences: ['high-protein'],
        timeAvailability: '45 min/day'
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.equal(body.id, user.id);
    assert.equal(body.email, user.email);
    assert.equal(body.primaryGoal, 'Build muscle');
    assert.equal(body.experienceLevel, 'Beginner');
    assert.equal(body.onboardingCompleted, true);
    assert.ok(body.assignedCommunityGroupId);
    assert.ok(body.assignedChallengeId);
    assert.ok(body.participation);
    assert.equal(body.participation.status, ParticipationStatus.JOINED);
    assert.equal(body.participation.challenge.status, ChallengeStatus.ACTIVE);
    assert.equal(body.participation.challenge.group.name, 'Strength Builders');

    const startsAt = new Date(body.participation.challenge.startsAt);
    const endsAt = new Date(body.participation.challenge.endsAt);
    const durationMs = endsAt.getTime() - startsAt.getTime();
    const minDurationMs = 29 * 24 * 60 * 60 * 1000;
    const maxDurationMs = 31 * 24 * 60 * 60 * 1000;
    assert.ok(durationMs >= minDurationMs && durationMs <= maxDurationMs);
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

  it('POST /api/challenges/enroll marks user enrolled and creates default participation', async () => {
    const user = await createUser('enroll-user');

    const response = await app.inject({
      method: 'POST',
      url: '/api/challenges/enroll',
      payload: {
        userId: user.id
      }
    });

    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.userId, user.id);
    assert.equal(body.enrolled, true);
    assert.ok(body.challengeId);
    assert.ok(body.groupId);
    assert.ok(body.participation?.id);
    assert.equal(body.participation?.status, ParticipationStatus.JOINED);

    const participationCount = await getPrismaClient().challengeParticipation.count({
      where: { userId: user.id }
    });
    assert.equal(participationCount, 1);
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

  it('POST /api/community/posts/:postId/reactions upserts reaction and updates count', async () => {
    const user = await createUser('reaction-user');
    const membership = await createActiveChallengeContext(user.id);

    const post = await getPrismaClient().post.create({
      data: {
        authorId: user.id,
        groupId: membership.groupId,
        challengeId: membership.challengeId,
        type: PostType.WIN,
        content: 'Reaction target post'
      },
      select: { id: true }
    });

    const first = await app.inject({
      method: 'POST',
      url: `/api/community/posts/${post.id}/reactions`,
      headers: {
        'x-test-user-id': user.id
      },
      payload: {
        type: 'LIKE'
      }
    });

    assert.equal(first.statusCode, 200);
    const firstBody = first.json();
    assert.equal(firstBody.reactions.length, 1);
    assert.equal(firstBody.reactions[0].type, 'LIKE');

    const second = await app.inject({
      method: 'POST',
      url: `/api/community/posts/${post.id}/reactions`,
      headers: {
        'x-test-user-id': user.id
      },
      payload: {
        type: 'SUPPORT'
      }
    });

    assert.equal(second.statusCode, 200);
    const secondBody = second.json();
    assert.equal(secondBody.reactions.length, 1);
    assert.equal(secondBody.reactions[0].type, 'SUPPORT');
  });

  it('POST /api/notifications/daily-check-in/schedule stores settings and logs SENT when dispatchNow=true', async () => {
    const prisma = getPrismaClient();
    const user = await createUser('notify-daily-sent');

    const response = await app.inject({
      method: 'POST',
      url: '/api/notifications/daily-check-in/schedule',
      headers: {
        'x-test-user-id': user.id
      },
      payload: {
        optIn: {
          dailyCheckInReminder: true,
          weeklyReflection: false,
          communityReplies: true
        },
        schedule: {
          timezone: 'UTC',
          dailyReminderHourLocal: 9,
          weeklyReflectionDayLocal: 1,
          weeklyReflectionHourLocal: 18
        },
        dispatchNow: true
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.scheduled, true);
    assert.ok(body.job);
    assert.ok(body.dispatched);
    assert.equal(body.dispatched.delivered, true);

    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: user.id }
    });
    assert.ok(settings);
    assert.equal(settings?.dailyCheckInReminder, true);
    assert.equal(settings?.communityReplies, true);
    assert.equal(settings?.timezone, 'UTC');

    const sentLog = await prisma.notificationDispatchLog.findFirst({
      where: {
        userId: user.id,
        type: NotificationType.DAILY_CHECK_IN_REMINDER,
        status: NotificationDeliveryStatus.SENT
      }
    });
    assert.ok(sentLog);
  });

  it('POST /api/notifications/replies/event logs SKIPPED when target user is opted out', async () => {
    const prisma = getPrismaClient();
    const actor = await createUser('notify-reply-actor-optout');
    const target = await createUser('notify-reply-target-optout');

    await prisma.userNotificationSettings.create({
      data: {
        userId: target.id,
        communityReplies: false,
        timezone: 'UTC'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/notifications/replies/event',
      headers: {
        'x-test-user-id': actor.id
      },
      payload: {
        targetUserId: target.id,
        replyCount: 1
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.notified, false);
    assert.match(String(body.reason), /not opted in/i);

    const skippedLog = await prisma.notificationDispatchLog.findFirst({
      where: {
        userId: target.id,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SKIPPED
      },
      orderBy: { createdAt: 'desc' }
    });
    assert.ok(skippedLog);
    assert.match(String(skippedLog?.reason), /not opted in/i);
  });

  it('POST /api/notifications/replies/event logs SKIPPED on cooldown', async () => {
    const prisma = getPrismaClient();
    const actor = await createUser('notify-reply-actor-cooldown');
    const target = await createUser('notify-reply-target-cooldown');

    await prisma.userNotificationSettings.create({
      data: {
        userId: target.id,
        communityReplies: true,
        timezone: 'UTC',
        communityReplyCooldownMinutes: 30
      }
    });

    await prisma.notificationDispatchLog.create({
      data: {
        userId: target.id,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SENT,
        channel: 'IN_APP',
        scheduledAtUtc: new Date(Date.now() - 2 * 60 * 1000),
        dispatchedAtUtc: new Date(Date.now() - 2 * 60 * 1000),
        dedupeKey: `seed-cooldown-${Date.now()}`
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/notifications/replies/event',
      headers: {
        'x-test-user-id': actor.id
      },
      payload: {
        targetUserId: target.id,
        replyCount: 2
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.notified, false);
    assert.match(String(body.reason), /cooldown/i);

    const cooldownLog = await prisma.notificationDispatchLog.findFirst({
      where: {
        userId: target.id,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SKIPPED,
        reason: { contains: 'Cooldown' }
      },
      orderBy: { createdAt: 'desc' }
    });
    assert.ok(cooldownLog);
  });

  it('POST /api/notifications/replies/event logs SKIPPED on hourly cap and SENT when allowed', async () => {
    const prisma = getPrismaClient();
    const actor = await createUser('notify-reply-actor-limit');
    const target = await createUser('notify-reply-target-limit');

    await prisma.userNotificationSettings.create({
      data: {
        userId: target.id,
        communityReplies: true,
        timezone: 'UTC',
        communityReplyCooldownMinutes: 1
      }
    });

    const now = Date.now();
    await prisma.notificationDispatchLog.createMany({
      data: [
        {
          userId: target.id,
          type: NotificationType.COMMUNITY_REPLIES,
          status: NotificationDeliveryStatus.SENT,
          channel: 'IN_APP',
          scheduledAtUtc: new Date(now - 50 * 60 * 1000),
          dispatchedAtUtc: new Date(now - 50 * 60 * 1000),
          dedupeKey: `seed-hourly-1-${now}`
        },
        {
          userId: target.id,
          type: NotificationType.COMMUNITY_REPLIES,
          status: NotificationDeliveryStatus.SENT,
          channel: 'IN_APP',
          scheduledAtUtc: new Date(now - 40 * 60 * 1000),
          dispatchedAtUtc: new Date(now - 40 * 60 * 1000),
          dedupeKey: `seed-hourly-2-${now}`
        },
        {
          userId: target.id,
          type: NotificationType.COMMUNITY_REPLIES,
          status: NotificationDeliveryStatus.SENT,
          channel: 'IN_APP',
          scheduledAtUtc: new Date(now - 30 * 60 * 1000),
          dispatchedAtUtc: new Date(now - 30 * 60 * 1000),
          dedupeKey: `seed-hourly-3-${now}`
        }
      ]
    });

    const limited = await app.inject({
      method: 'POST',
      url: '/api/notifications/replies/event',
      headers: {
        'x-test-user-id': actor.id
      },
      payload: {
        targetUserId: target.id,
        replyCount: 1
      }
    });

    assert.equal(limited.statusCode, 200);
    const limitedBody = limited.json();
    assert.equal(limitedBody.notified, false);
    assert.match(String(limitedBody.reason), /hourly/i);

    await prisma.notificationDispatchLog.deleteMany({
      where: {
        userId: target.id,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SENT
      }
    });

    const allowed = await app.inject({
      method: 'POST',
      url: '/api/notifications/replies/event',
      headers: {
        'x-test-user-id': actor.id
      },
      payload: {
        targetUserId: target.id,
        replyCount: 3
      }
    });

    assert.equal(allowed.statusCode, 200);
    const allowedBody = allowed.json();
    assert.equal(allowedBody.notified, true);
    assert.ok(allowedBody.job);
    assert.ok(allowedBody.dispatch);

    const sentLog = await prisma.notificationDispatchLog.findFirst({
      where: {
        userId: target.id,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SENT
      },
      orderBy: { createdAt: 'desc' }
    });
    assert.ok(sentLog);
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
