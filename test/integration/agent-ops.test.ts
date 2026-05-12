import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { getPrismaClient, disconnectPrisma } from '../../src/db/prisma';
import { assertIntegrationDbSafety, resetIntegrationDb } from './helpers';
import type { User } from '@prisma/client';
import { startAgentRun, logAgentEvent, finishAgentRun, failAgentRun } from '../../src/services/agent-ops.service';
import { AgentEventType, AgentRunStatus } from '@prisma/client';

describe('AgentOps Service', () => {
    let user: User;

    before(async () => {
        assertIntegrationDbSafety();
    });

    beforeEach(async () => {
        await resetIntegrationDb();
        user = await getPrismaClient().user.create({
            data: {
                email: 'agent-ops-user@steady.test',
                username: 'agent-ops-user',
            }
        });
    });

    after(async () => {
        await disconnectPrisma();
    });

    it('should start an agent run', async () => {
        const run = await startAgentRun('test-agent', user.id, { input: 'test' });
        assert.ok(run);
        assert.equal(run.userId, user.id);
        assert.equal(run.status, AgentRunStatus.RUNNING);
    });

    it('should log an event for a run', async () => {
        const run = await startAgentRun('test-agent', user.id, { input: 'test' });
        const event = await logAgentEvent(run.id, AgentEventType.INFO, { message: 'test event' });
        assert.ok(event);
        assert.equal(event.runId, run.id);
        assert.equal(event.type, AgentEventType.INFO);
    });

    it('should finish an agent run', async () => {
        const run = await startAgentRun('test-agent', user.id, { input: 'test' });
        const finishedRun = await finishAgentRun(run.id, { output: 'test' });
        assert.ok(finishedRun);
        assert.equal(finishedRun.status, AgentRunStatus.SUCCESS);
        assert.ok(finishedRun.endedAt);
    });

    it('should fail an agent run', async () => {
        const run = await startAgentRun('test-agent', user.id, { input: 'test' });
        const failedRun = await failAgentRun(run.id, { error: 'test error' });
        assert.ok(failedRun);
        assert.equal(failedRun.status, AgentRunStatus.FAILURE);
        assert.ok(failedRun.endedAt);
    });
});
