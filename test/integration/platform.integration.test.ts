import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/app';
import { disconnectPrisma, getPrismaClient } from '../../src/db/prisma';
import { assertIntegrationDbSafety, resetIntegrationDb } from './helpers';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';

describe('Platform API', () => {
  let app: FastifyInstance;
  let user: User;

  before(async () => {
    assertIntegrationDbSafety();
    app = await buildApp();
  });

  beforeEach(async () => {
    await resetIntegrationDb();
    user = await getPrismaClient().user.create({
        data: {
            email: 'platform-user@steady.test',
            username: 'platform-user',
            displayName: 'Platform User',
            onboardingCompleted: true,
        }
    });
  });

  after(async () => {
    await app.close();
    await disconnectPrisma();
  });

  it('GET /api/platform/context returns the platform context and backfills a personal workspace', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/platform/context',
      headers: {
        'x-test-user-id': user.id,
      },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.deepStrictEqual(body.userIdentity, {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      onboardingCompleted: user.onboardingCompleted,
    });

    assert.equal(body.workspace.name, "Platform User's Personal Space");
    assert.equal(body.workspace.role, UserRole.MEMBER);
    assert.ok(Array.isArray(body.enabledModules));
  });

  it('GET /api/platform/context returns the correct role for a coach', async () => {
    const prisma = getPrismaClient();
    const workspace = await prisma.workspace.create({
        data: { name: 'Coach Workspace', ownerId: user.id }
    });
    await prisma.workspaceMember.create({
        data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: UserRole.COACH,
        }
    });

    const response = await app.inject({
        method: 'GET',
        url: '/api/platform/context',
        headers: {
            'x-test-user-id': user.id,
        },
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.workspace.role, UserRole.COACH);
  });

  it('GET /api/platform/context returns 401 for an unauthenticated user', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/platform/context',
    });

    assert.equal(response.statusCode, 401);
  });
});
