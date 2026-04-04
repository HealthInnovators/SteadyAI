import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { FastifyInstance } from 'fastify';

import { buildApp } from '../src/app';
import { disconnectPrisma } from '../src/db/prisma';

describe('Apps MCP route behavior', () => {
  let app: FastifyInstance;

  before(async () => {
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

  it('get_current_user_context returns none without auth or explicit userId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apps/mcp',
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
});
