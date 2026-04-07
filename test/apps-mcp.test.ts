import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { FastifyInstance } from 'fastify';

import { buildApp } from '../src/app';
import { env } from '../src/config/env';
import { disconnectPrisma } from '../src/db/prisma';

describe('Apps MCP route behavior', () => {
  let app: FastifyInstance;
  const serviceToken = 'test-shared-token';

  before(async () => {
    env.APPS_MCP_API_KEY = serviceToken;
    app = await buildApp();
  });

  after(async () => {
    await app.close();
    await disconnectPrisma();
  });

  it('initialize advertises both tools and resources capabilities', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
      payload: {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {}
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(body.error, undefined);
    assert.equal(body.result.protocolVersion, '2024-11-05');
    assert.deepEqual(body.result.capabilities.tools, {});
    assert.deepEqual(body.result.capabilities.resources, {});
  });

  it('resources/read is available without auth for static widget templates', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
      payload: {
        jsonrpc: '2.0',
        id: 2,
        method: 'resources/read',
        params: {
          uri: 'ui://widget/steadyai-agent-card.html'
        }
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(body.error, undefined);
    assert.equal(body.result.contents.length, 1);
    assert.equal(body.result.contents[0].uri, 'ui://widget/steadyai-agent-card.html');
    assert.match(String(body.result.contents[0].mimeType), /text\/html;profile=mcp-app/i);
    assert.match(String(body.result.contents[0].text), /SteadyAI Agent Card/i);
  });

  it('tools/list exposes workout and nutrition tools with widget metadata', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
      payload: {
        jsonrpc: '2.0',
        id: 22,
        method: 'tools/list',
        params: {}
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(body.error, undefined);
    const tools = body.result.tools as Array<{ name: string; _meta?: Record<string, unknown> }>;
    const workout = tools.find((tool) => tool.name === 'steadyai.workout_coach');
    const nutrition = tools.find((tool) => tool.name === 'steadyai.nutrition_coach');
    assert.ok(workout);
    assert.ok(nutrition);
    assert.equal(workout?._meta?.['openai/outputTemplate'], 'ui://widget/steadyai-workout-card.html');
    assert.equal(nutrition?._meta?.['openai/outputTemplate'], 'ui://widget/steadyai-nutrition-card-v3.html');
  });

  it('get_current_user_context returns none when called with service auth and no user context', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
      headers: {
        authorization: `Bearer ${serviceToken}`
      },
      payload: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'steadyai.get_current_user_context',
          arguments: {}
        }
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(body.error, undefined);
    assert.equal(body.result.content[0].text, 'No user found.');
    assert.deepEqual(body.result.structuredContent, {
      userId: null,
      source: 'none'
    });
  });

  it('generate_checkin_draft returns a deterministic CHECK_IN draft without auth', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
      headers: {
        authorization: `Bearer ${serviceToken}`
      },
      payload: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'steadyai.generate_checkin_draft',
          arguments: {
            totalDurationMinutes: 20,
            completedExercises: 4,
            totalExercises: 4,
            feedback: 'JUST_RIGHT'
          }
        }
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(body.error, undefined);
    assert.match(String(body.result.content[0].text), /check-in|workout|session/i);
    assert.equal(body.result.structuredContent.type, 'CHECK_IN');
    assert.equal(typeof body.result.structuredContent.content, 'string');
  });

  it('protected tools return 401 without auth', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
      payload: {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'steadyai.get_current_user_context',
          arguments: {}
        }
      }
    });

    assert.equal(response.statusCode, 401);
  });
});
