import { getPrismaClient } from '../db/prisma';
import { AgentEventType, AgentRunStatus, type Prisma } from '@prisma/client';

function toJsonValue(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export async function startAgentRun(agentId: string, userId: string, input: unknown) {
    const prisma = getPrismaClient();

    const definition = await prisma.agentDefinition.upsert({
        where: { agentId },
        create: { agentId, description: `Definition for ${agentId}` },
        update: {},
    });

    const run = await prisma.agentRun.create({
        data: {
            agentDefinitionId: definition.id,
            userId,
            status: AgentRunStatus.RUNNING,
            input: toJsonValue(input),
        },
    });

    return run;
}

export async function logAgentEvent(runId: string, type: AgentEventType, payload: unknown) {
    const prisma = getPrismaClient();

    const event = await prisma.agentEvent.create({
        data: {
            runId,
            type,
            payload: toJsonValue(payload),
        },
    });

    return event;
}

export async function finishAgentRun(runId: string, output: unknown) {
    const prisma = getPrismaClient();

    const run = await prisma.agentRun.update({
        where: { id: runId },
        data: {
            status: AgentRunStatus.SUCCESS,
            output: toJsonValue(output),
            endedAt: new Date(),
        },
    });

    return run;
}

export async function failAgentRun(runId: string, error: unknown) {
    const prisma = getPrismaClient();

    const run = await prisma.agentRun.update({
        where: { id: runId },
        data: {
            status: AgentRunStatus.FAILURE,
            error: toJsonValue(error),
            endedAt: new Date(),
        },
    });

    return run;
}
