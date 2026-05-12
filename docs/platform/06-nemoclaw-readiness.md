# NemoClaw Readiness Specification

This document outlines the architectural and safety requirements for integrating NemoClaw as an alternative `AgentRuntime` in the future.

## 1. Status: Not a Core Dependency

NemoClaw is currently excluded from core dependencies for the following reasons:
- **Maturity & Stability**: The runtime has not yet reached a production-grade stability level suitable for the SteadyAI platform.
- **Resource Constraints**: Integrating an additional runtime would increase the complexity of deployment and maintenance.
- **Core Focus**: SteadyAI's immediate goal is to stabilize the existing platform and MCP integration.

## 2. Future Use Cases: Wearable/Mobile Event Response

NemoClaw is intended to handle high-frequency, event-driven scenarios that are impractical for current request-response agents:
- **Wearable Real-Time Monitoring**: Detecting physiological anomalies (e.g., erratic heart rate, sudden exertion) and triggering context-aware coaching responses.
- **Mobile Sensor Fusion**: Processing location and motion data to offer proactive suggestions based on user context.
- **Always-on Background Services**: Keeping agents "alive" in the background to react to external triggers without requiring constant LLM re-initialization.

## 3. Required Safety Controls

Before enabling always-on agents powered by NemoClaw, we must implement:
- **Rate-Limiting & Quotas**: Hard caps on agent invocation frequency to prevent runaway costs or excessive LLM utilization.
- **Permission Scoping**: Strict granularity in what data NemoClaw-managed agents can access.
- **Human-in-the-Loop Override**: A "kill switch" mechanism that allows users to instantly disable proactive agent actions.
- **Data Anonymization**: Automatic filtering of sensitive user identifiers before raw sensor data is processed by the runtime.

## 4. Proposed AgentRuntime Adapter Boundary

NemoClaw will be integrated via the `AgentRuntime` abstraction defined in `src/agents/runtime/types.ts`.

- **Adapter Implementation**: We will introduce a new `NemoClawRuntime` class implementing `AgentRuntime`.
- **Registration**: The `AgentService` will dispatch requests to `NemoClawRuntime` based on the agent's definition and the environment config.
- **Unified Logging**: It must bridge with the existing `AgentOps` service (`startAgentRun`, `logAgentEvent`) to maintain observability parity with existing agents.

## 5. Feature Flags & Environment Variables

- **`ENABLE_NEMOCLAW_RUNTIME`**: Boolean flag to toggle the runtime inclusion.
- **`NEMOCLAW_API_KEY`**: Required for runtime communication.
- **`NEMOCLAW_CAPABILITIES`**: JSON environment variable mapping available tool subsets to the runtime.
- **Feature Flagging**: Use a rollout strategy (e.g., percentage-based) to enable NemoClaw for a subset of users before global deployment.

## 6. Observability & Rollback Requirements

- **Observability**: NemoClaw must export structured logs and metrics to our central AgentOps pipeline, specifically tracking agent startup time, event latency, and error frequency.
- **Rollback**: We must be able to switch back to the `STEADYAI_INTERNAL` runtime via the feature flag instantly if anomalies are detected. Automated alerting must trigger on runtime errors.

## 7. Non-Goals for v1

- **Offline Mode**: Local on-device agent execution is not supported in the initial iteration.
- **Autonomous Device Control**: The agent will not have the permission to modify device hardware or OS settings.
- **Medical Diagnostics**: The runtime will not be permitted to perform medical analysis.
