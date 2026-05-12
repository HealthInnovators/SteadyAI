import type { AgentEventType } from '@prisma/client';

export type AgentRuntimeId = 'STEADYAI_INTERNAL';

export type AgentCapabilityId =
  | 'steadyai.ask_agent'
  | 'steadyai.educator_help'
  | 'steadyai.workout_coach'
  | 'steadyai.nutrition_coach';

export interface AgentRuntimeCapability {
  agentId: string;
  title: string;
  description: string;
  runtimeId: AgentRuntimeId;
  readOnly: boolean;
  supportsUserContext: boolean;
}

export interface AgentRuntimeExecutionContext {
  runtimeId: AgentRuntimeId;
  agentId: string;
  runId: string | null;
  logEvent: (type: AgentEventType, payload: unknown) => Promise<void>;
}

export interface AgentRunOptions<TInput, TOutput> {
  agentId: AgentCapabilityId;
  userId?: string | null;
  input: TInput;
  execute: (context: AgentRuntimeExecutionContext) => Promise<TOutput>;
}

export interface AgentRunResult<TOutput> {
  runtimeId: AgentRuntimeId;
  runId: string | null;
  output: TOutput;
}

export interface AgentRuntime {
  readonly runtimeId: AgentRuntimeId;
  readonly capabilities: AgentRuntimeCapability[];
  supports(agentId: string): boolean;
  runAgent<TInput, TOutput>(options: AgentRunOptions<TInput, TOutput>): Promise<AgentRunResult<TOutput>>;
}
