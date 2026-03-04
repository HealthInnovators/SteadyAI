'use client';

import { useState } from 'react';
import { requestAgentReply } from './api';
import { AGENT_DISCLAIMER, STARTER_PROMPTS } from './data';
import type { ChatMessage } from './types';

export function AgentInteractionPanel() {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);

  async function sendPrompt(promptText: string): Promise<void> {
    const prompt = promptText.trim();
    if (!prompt || isSending) {
      return;
    }

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

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await requestAgentReply(prompt);
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: reply.text,
        reasoning: reply.reasoning,
        cards: reply.cards,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => prev.filter((m) => m.id !== pendingId).concat(agentMessage));
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== pendingId).concat({
          id: `fallback-${Date.now()}`,
          role: 'agent',
          text: 'Assistant is temporarily unavailable. Please retry in a few seconds.',
          createdAt: new Date().toISOString()
        })
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Assistant Hub</h1>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="note" aria-live="polite">
          {AGENT_DISCLAIMER}
        </p>
      </header>

      <section aria-label="Starter prompts" className="rounded-xl border border-gray-200 bg-white p-3">
        <p className="mb-2 text-sm font-medium text-gray-900">Try one:</p>
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                void sendPrompt(prompt);
              }}
              className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-800 hover:bg-gray-100"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white" aria-label="Assistant conversation">
        <ul className="max-h-[55vh] space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <li key={message.id} className="space-y-2">
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    isUser ? 'ml-auto max-w-[85%] border-black bg-black text-white' : 'max-w-[92%] border-gray-200 bg-gray-50 text-gray-900'
                  }`}
                >
                  {message.text}
                </div>
                {message.cards?.length ? (
                  <div className="max-w-[92%] space-y-2">
                    {message.cards.map((card) => (
                      <div key={`${message.id}-${card.id}`} className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700">
                        <p className="font-semibold">{card.title}</p>
                        {card.body ? <p className="mt-1">{card.body}</p> : null}
                        {card.items?.length ? (
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {card.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                        {card.actions?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {card.actions.map((action) => (
                              <button
                                key={`${card.id}-${action.label}`}
                                type="button"
                                className="rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-[11px] text-gray-800 hover:bg-gray-100"
                                onClick={() => {
                                  void sendPrompt(action.prompt);
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Compose message" className="rounded-xl border border-gray-200 bg-white p-3">
        <label htmlFor="assistant-input" className="mb-2 block text-sm font-medium">
          Ask anything about habit, meals, community, or myths
        </label>
        <div className="flex gap-2">
          <textarea
            id="assistant-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-20 w-full rounded-md border border-gray-300 p-2 text-sm"
            placeholder="Type your question or context"
          />
          <button
            type="button"
            className="h-fit rounded-md bg-black px-4 py-2 text-sm text-white disabled:bg-gray-400"
            disabled={!input.trim() || isSending}
            onClick={() => {
              void sendPrompt(input);
            }}
          >
            {isSending ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </section>
    </main>
  );
}

function welcomeMessage(): ChatMessage {
  return {
    id: 'system-assistant-hub',
    role: 'system',
    text: 'Assistant Hub is ready. One conversation can route to meal planning, habit coaching, community guidance, or educator clarification.',
    createdAt: new Date().toISOString()
  };
}
