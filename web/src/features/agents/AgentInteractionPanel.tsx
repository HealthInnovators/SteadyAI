'use client';

import { useMemo, useState } from 'react';
import { requestAgentReply } from './api';
import { AGENT_DISCLAIMER, AGENTS } from './data';
import { buildAgentReply } from './engine';
import type { AgentType, ChatMessage } from './types';

export function AgentInteractionPanel() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('MEAL_PLANNER');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [threads, setThreads] = useState<Record<AgentType, ChatMessage[]>>(() => ({
    MEAL_PLANNER: [welcomeMessage('Meal Planner')],
    HABIT_COACH: [welcomeMessage('Habit Coach')],
    COMMUNITY_GUIDE: [welcomeMessage('Community Guide')]
  }));

  const messages = useMemo(() => threads[selectedAgent] || [], [selectedAgent, threads]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Agent Interaction</h1>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="note" aria-live="polite">
          {AGENT_DISCLAIMER}
        </p>
      </header>

      <section aria-label="Agent selector" className="flex flex-wrap gap-2">
        {AGENTS.map((agent) => {
          const selected = selectedAgent === agent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgent(agent.id)}
              aria-pressed={selected}
              className={`rounded-md border px-3 py-2 text-left text-sm ${
                selected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-900'
              }`}
              title={agent.subtitle}
            >
              {agent.label}
            </button>
          );
        })}
      </section>

      <section
        className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white"
        aria-label="Chat conversation"
      >
        <ul className="max-h-[55vh] space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <li key={message.id} className="space-y-2">
                <div className={`rounded-lg border p-3 text-sm ${isUser ? 'ml-auto max-w-[85%] border-black bg-black text-white' : 'max-w-[92%] border-gray-200 bg-gray-50 text-gray-900'}`}>
                  {message.text}
                </div>
                {message.reasoning?.length ? (
                  <details className="max-w-[92%] rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700">
                    <summary className="cursor-pointer font-medium">Reasoning</summary>
                    <ul className="mt-2 space-y-1">
                      {message.reasoning.map((step) => (
                        <li key={`${message.id}-${step.title}`}>
                          <span className="font-medium">{step.title}:</span> {step.detail}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Compose message" className="rounded-xl border border-gray-200 bg-white p-3">
        <label htmlFor="agent-input" className="mb-2 block text-sm font-medium">
          Ask the selected agent
        </label>
        <div className="flex gap-2">
          <textarea
            id="agent-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-20 w-full rounded-md border border-gray-300 p-2 text-sm"
            placeholder="Type your question or context"
          />
          <button
            type="button"
            className="h-fit rounded-md bg-black px-4 py-2 text-sm text-white disabled:bg-gray-400"
            disabled={!input.trim() || isSending}
            onClick={async () => {
              const prompt = input.trim();
              if (!prompt) {
                return;
              }

              const agentAtSend = selectedAgent;
              const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                text: prompt,
                createdAt: new Date().toISOString()
              };
              const pendingId = `pending-${Date.now()}`;
              const pendingMessage: ChatMessage = {
                id: pendingId,
                role: 'system',
                text: 'Thinking...',
                createdAt: new Date().toISOString()
              };
              setIsSending(true);
              setThreads((prev) => ({
                ...prev,
                [agentAtSend]: [...(prev[agentAtSend] || []), userMessage, pendingMessage]
              }));
              setInput('');

              try {
                const reply = await requestAgentReply(agentAtSend, prompt);
                const agentMessage: ChatMessage = {
                  id: `agent-${Date.now()}`,
                  role: 'agent',
                  text: reply.text,
                  reasoning: reply.reasoning,
                  createdAt: new Date().toISOString()
                };

                setThreads((prev) => ({
                  ...prev,
                  [agentAtSend]: (prev[agentAtSend] || []).filter((message) => message.id !== pendingId).concat(agentMessage)
                }));
              } catch {
                const fallback = buildAgentReply(agentAtSend, prompt);
                const fallbackMessage: ChatMessage = {
                  ...fallback,
                  text: `Live response unavailable right now. ${fallback.text}`
                };
                setThreads((prev) => ({
                  ...prev,
                  [agentAtSend]: (prev[agentAtSend] || [])
                    .filter((message) => message.id !== pendingId)
                    .concat(fallbackMessage)
                }));
              } finally {
                setIsSending(false);
              }
            }}
          >
            {isSending ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </section>
    </main>
  );
}

function welcomeMessage(agentLabel: string): ChatMessage {
  return {
    id: `system-${agentLabel}`,
    role: 'system',
    text: `${agentLabel} is ready. Share your context to get structured guidance.` ,
    createdAt: new Date().toISOString()
  };
}
