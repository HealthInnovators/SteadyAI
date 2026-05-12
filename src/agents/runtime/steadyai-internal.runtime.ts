import { AgentEventType } from '@prisma/client';

import {
  failAgentRun,
  finishAgentRun,
  logAgentEvent,
  startAgentRun
} from '../../services/agent-ops.service';
import { getPrismaClient } from '../../db/prisma';
import type {
  AgentCapabilityId,
  AgentRunOptions,
  AgentRunResult,
  AgentRuntime,
  AgentRuntimeCapability,
  AgentRuntimeExecutionContext
} from './types';

const CAPABILITIES: AgentRuntimeCapability[] = [
  {
    agentId: 'steadyai.ask_agent',
    title: 'SteadyAI general coaching agent',
    description: 'Routes meal planning, habit coaching, and community guidance through existing SteadyAI agent logic.',
    runtimeId: 'STEADYAI_INTERNAL',
    readOnly: true,
    supportsUserContext: false
  },
  {
    agentId: 'steadyai.educator_help',
    title: 'SteadyAI educator',
    description: 'Generates health and fitness education or myth-correction responses.',
    runtimeId: 'STEADYAI_INTERNAL',
    readOnly: true,
    supportsUserContext: false
  },
  {
    agentId: 'steadyai.workout_coach',
    title: 'SteadyAI workout coach',
    description: 'Builds workout plans from current prompt, preferences, history, and exercise media.',
    runtimeId: 'STEADYAI_INTERNAL',
    readOnly: true,
    supportsUserContext: true
  },
  {
    agentId: 'steadyai.nutrition_coach',
    title: 'SteadyAI nutrition coach',
    description: 'Analyzes meal text and returns nutrition estimates, tips, and widget data.',
    runtimeId: 'STEADYAI_INTERNAL',
    readOnly: true,
    supportsUserContext: true
  }
];

function summarizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 2000)
    };
  }

  return {
    message: String(error)
  };
}

async function getLoggableUserId(userId?: string | null): Promise<string | null> {
  if (!userId) {
    return null;
  }

  try {
    const existing = await getPrismaClient().user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    return existing?.id ?? null;
  } catch {
    return null;
  }
}

async function startRunIfPossible(agentId: AgentCapabilityId, runtimeId: 'STEADYAI_INTERNAL', userId?: string | null, input?: unknown) {
  const loggableUserId = await getLoggableUserId(userId);
  if (!loggableUserId) {
    return null;
  }

  try {
    return await startAgentRun(agentId, loggableUserId, {
      runtimeId,
      input
    });
  } catch {
    return null;
  }
}

export class SteadyAiInternalRuntime implements AgentRuntime {
  readonly runtimeId = 'STEADYAI_INTERNAL' as const;
  readonly capabilities = CAPABILITIES;

  supports(agentId: string): agentId is AgentCapabilityId {
    return this.capabilities.some((capability) => capability.agentId === agentId);
  }

  async runAgent<TInput, TOutput>(options: AgentRunOptions<TInput, TOutput>): Promise<AgentRunResult<TOutput>> {
    if (!this.supports(options.agentId)) {
      throw new Error(`Agent not supported by ${this.runtimeId}: ${options.agentId}`);
    }

    const run = await startRunIfPossible(options.agentId, this.runtimeId, options.userId, options.input);

    const context: AgentRuntimeExecutionContext = {
      runtimeId: this.runtimeId,
      agentId: options.agentId,
      runId: run?.id ?? null,
      logEvent: async (type: AgentEventType, payload: unknown) => {
        if (run?.id) {
          try {
            await logAgentEvent(run.id, type, payload);
          } catch {
            // AgentOps logging is best-effort and must not alter tool behavior.
          }
        }
      }
    };

    try {
      await context.logEvent(AgentEventType.INFO, {
        message: 'Agent execution started',
        runtimeId: this.runtimeId,
        agentId: options.agentId
      });

      const output = await options.execute(context);

      await context.logEvent(AgentEventType.INFO, {
        message: 'Agent execution completed',
        runtimeId: this.runtimeId,
        agentId: options.agentId
      });

      if (run?.id) {
        try {
          await finishAgentRun(run.id, {
            runtimeId: this.runtimeId,
            output
          });
        } catch {
          // AgentOps logging is best-effort and must not alter tool behavior.
        }
      }

      return {
        runtimeId: this.runtimeId,
        runId: run?.id ?? null,
        output
      };
    } catch (error) {
      const summarized = summarizeError(error);
      await context.logEvent(AgentEventType.ERROR, summarized);
      if (run?.id) {
        try {
          await failAgentRun(run.id, summarized);
        } catch {
          // Preserve the original tool error.
        }
      }
      throw error;
    }
  }
}

export const steadyAiInternalRuntime = new SteadyAiInternalRuntime();
