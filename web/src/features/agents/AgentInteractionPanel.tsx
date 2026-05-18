'use client';

import { useAuth } from '@/auth';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { logWorkoutPlanSession, requestAgentReply, type WorkoutFeedback } from './api';
import { AGENT_DISCLAIMER } from './data';
import type { AssistantIntent, ChatMessage, WorkoutPlan } from './types';

interface AgentInteractionPanelProps {
  embedded?: boolean;
  onIntentDetected?: (intent: AssistantIntent) => void;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: {
    transcript: string;
  };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

const PRIMARY_NAV_LINKS = [
  { href: '/workouts', label: 'Fitness Expert', icon: 'fitness' },
  { href: '/nutrition', label: 'Nutrition Expert', icon: 'nutrition' },
  { href: '/reports', label: 'Reports', icon: 'reports' },
  { href: '/community', label: 'Community', icon: 'community' },
  { href: '/store', label: 'Store', icon: 'store' }
];

export function AgentInteractionPanel({ embedded = false, onIntentDetected }: AgentInteractionPanelProps) {
  const { token, userId } = useAuth();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [workoutLogState, setWorkoutLogState] = useState<Record<string, { status: 'saving' | 'saved' | 'error'; message: string }>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceBaseInputRef = useRef('');
  const finalTranscriptRef = useRef('');

  const conversationMessages = messages.filter((message) => message.id !== 'system-assistant-hub');
  const shellClass = embedded
    ? 'w-full'
    : 'min-h-screen w-full bg-[#f7f3ed] text-[#1d140d]';

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceMessage('Listening...');
    };
    recognition.onend = () => {
      setIsListening(false);
      setVoiceMessage(finalTranscriptRef.current ? 'Voice input added.' : null);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(event.error === 'not-allowed' ? 'Microphone access was blocked.' : 'Voice input stopped. Please try again.');
    };
    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? '';
        if (result?.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      const voiceText = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      const base = voiceBaseInputRef.current.trim();
      setInput([base, voiceText].filter(Boolean).join(' '));
    };

    recognitionRef.current = recognition;
    setIsVoiceSupported(true);

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  async function sendPrompt(promptText: string): Promise<void> {
    const prompt = promptText.trim();
    if (!prompt || isSending) {
      return;
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${now}`,
      role: 'user',
      text: prompt,
      createdAt: new Date().toISOString()
    };
    const pendingId = `pending-${now}`;
    const pendingMessage: ChatMessage = {
      id: pendingId,
      role: 'system',
      text: 'Thinking through your intent and choosing the right SteadyAI agent...',
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await requestAgentReply(prompt, token);
      const nextIntent = reply.intent || 'GENERAL';
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: reply.text,
        routedIntent: nextIntent,
        reasoning: reply.reasoning,
        cards: reply.cards,
        workoutPlan: reply.workoutPlan,
        mealPlan: reply.mealPlan,
        nutritionLog: reply.nutritionLog,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => prev.filter((message) => message.id !== pendingId).concat(agentMessage));
      if (nextIntent !== 'GENERAL') {
        onIntentDetected?.(nextIntent);
      }
    } catch (error) {
      const fallbackText =
        error instanceof DOMException && error.name === 'AbortError'
          ? 'The assistant request timed out. Please retry in a few seconds.'
          : error instanceof Error && error.message
            ? `Assistant request failed: ${error.message}`
            : 'Assistant is temporarily unavailable. Please retry in a few seconds.';

      setMessages((prev) =>
        prev.filter((message) => message.id !== pendingId).concat({
          id: `fallback-${Date.now()}`,
          role: 'agent',
          text: fallbackText,
          createdAt: new Date().toISOString()
        })
      );
    } finally {
      setIsSending(false);
    }
  }

  async function logWorkout(plan: WorkoutPlan, feedback: WorkoutFeedback = 'JUST_RIGHT'): Promise<void> {
    setWorkoutLogState((prev) => ({
      ...prev,
      [plan.planId]: { status: 'saving', message: 'Saving workout session...' }
    }));

    try {
      await logWorkoutPlanSession({
        plan,
        token,
        userId,
        feedback
      });
      setWorkoutLogState((prev) => ({
        ...prev,
        [plan.planId]: { status: 'saved', message: 'Workout session saved.' }
      }));
    } catch (error) {
      setWorkoutLogState((prev) => ({
        ...prev,
        [plan.planId]: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to save workout session.'
        }
      }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendPrompt(input);
  }

  function toggleVoiceInput(): void {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setVoiceMessage('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      voiceBaseInputRef.current = input;
      finalTranscriptRef.current = '';
      setVoiceMessage('Listening...');
      recognition.start();
    } catch {
      setVoiceMessage('Voice input is already active. Please try again.');
    }
  }

  return (
    <section className={shellClass}>
      <div className={embedded ? 'mx-auto flex min-h-[72vh] w-full max-w-5xl flex-col' : 'flex min-h-screen w-full'}>
        {!embedded ? (
          <aside
            className={`hidden shrink-0 flex-col border-r border-[#e2d6c9] bg-[#fbf7f1] px-3 py-5 transition-[width] duration-200 md:flex ${
              isSidebarCollapsed ? 'w-20' : 'w-72'
            }`}
          >
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isSidebarCollapsed ? (
                <Link href="/agents" className="rounded-2xl px-3 py-2 text-lg font-semibold tracking-[-0.03em] text-[#1d140d]">
                  SteadyAI
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((value) => !value)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8c4b3] bg-white text-[#4e4035] hover:bg-[#f3e7da]"
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!isSidebarCollapsed}
              >
                <Icon name="menu" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMessages([welcomeMessage()]);
              }}
              className={`mt-5 inline-flex items-center gap-3 rounded-2xl border border-[#d8c4b3] bg-white px-4 py-3 text-sm font-semibold text-[#4e4035] hover:bg-[#f3e7da] ${
                isSidebarCollapsed ? 'justify-center px-0' : 'text-left'
              }`}
              aria-label="New chat"
            >
              <Icon name="new-chat" />
              {!isSidebarCollapsed ? <span>New chat</span> : null}
            </button>
            <nav className="mt-6 space-y-1">
              {PRIMARY_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#4e4035] hover:bg-[#f3e7da] ${
                    isSidebarCollapsed ? 'justify-center px-0' : ''
                  }`}
                  aria-label={link.label}
                >
                  <Icon name={link.icon} />
                  {!isSidebarCollapsed ? <span>{link.label}</span> : null}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-1 border-t border-[#ead9ca] pt-4">
              <Link
                href="/settings"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#4e4035] hover:bg-[#f3e7da] ${
                  isSidebarCollapsed ? 'justify-center px-0' : ''
                }`}
                aria-label="Settings"
              >
                <Icon name="settings" />
                {!isSidebarCollapsed ? <span>Settings</span> : null}
              </Link>
            </div>
          </aside>
        ) : null}

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#ead9ca] bg-[#f7f3ed]/90 px-4 py-3 backdrop-blur md:hidden">
            <Link href="/agents" className="font-semibold text-[#1d140d]">
              SteadyAI
            </Link>
            <Link href="/settings" className="rounded-full border border-[#d8c4b3] px-3 py-1.5 text-sm text-[#4e4035]">
              Settings
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className={`mx-auto flex min-h-full w-full max-w-4xl flex-col ${conversationMessages.length ? 'justify-start' : 'justify-center'}`}>
              {conversationMessages.length ? (
                <div className="space-y-5 pb-8">
                  {conversationMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      workoutLogState={message.workoutPlan ? workoutLogState[message.workoutPlan.planId] : undefined}
                      onLogWorkout={(plan, feedback) => {
                        void logWorkout(plan, feedback);
                      }}
                      onAction={(prompt) => {
                        void sendPrompt(prompt);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-auto mb-8 max-w-2xl text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8a4b22]">Your health companion</p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#1d140d] sm:text-5xl">
                    What would you like help with today?
                  </h1>
                  <p className="mt-4 text-base leading-7 text-[#5f5145]">
                    Ask for a workout, meal idea, progress summary, check-in, or a simple next step.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
                <div className="rounded-[32px] border-2 border-[#8a4b22] bg-[#fffcf8] p-4 shadow-[0_0_0_6px_rgba(245,201,158,0.28),0_24px_60px_rgba(80,48,24,0.18)]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Ask SteadyAI here</p>
                    <p className="rounded-full bg-[#1d140d] px-3 py-1 text-[11px] font-semibold text-white">Type or speak</p>
                  </div>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void sendPrompt(input);
                      }
                    }}
                    className="min-h-28 w-full resize-none rounded-[22px] border border-[#ead9ca] bg-white p-4 text-lg leading-7 text-[#1d140d] outline-none ring-[#8a4b22]/20 transition placeholder:text-[#9a897a] focus:border-[#8a4b22] focus:ring-4"
                    placeholder="Example: Create a low-impact workout, log my lunch, summarize my week..."
                  />
                  <div className="flex flex-col gap-3 border-t border-[#ead9ca] pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs leading-5 text-[#7a4b28]">{AGENT_DISCLAIMER}</p>
                      {voiceMessage ? <p className="mt-1 text-xs font-medium text-[#8a4b22]">{voiceMessage}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isVoiceSupported ? (
                        <button
                          type="button"
                          onClick={toggleVoiceInput}
                          disabled={isSending}
                          className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                            isListening
                              ? 'border-[#b45309] bg-[#fff7ed] text-[#8a4b22]'
                              : 'border-[#d8c4b3] bg-white text-[#4e4035] hover:bg-[#f3e7da]'
                          } disabled:opacity-60`}
                          aria-pressed={isListening}
                          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                        >
                          {isListening ? 'Stop voice' : 'Speak'}
                        </button>
                      ) : null}
                      <button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className="rounded-full bg-[#1d140d] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,20,13,0.2)] disabled:bg-[#ab9a8c]"
                      >
                        {isSending ? 'Working...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="mx-auto mt-4 flex w-full max-w-3xl flex-wrap justify-center gap-2">
                {PRIMARY_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8c4b3] bg-white/80 px-4 py-2 text-sm font-semibold text-[#4e4035] shadow-sm hover:bg-[#f3e7da]"
                  >
                    <Icon name={link.icon} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

function MessageBubble({
  message,
  workoutLogState,
  onLogWorkout,
  onAction
}: {
  message: ChatMessage;
  workoutLogState?: { status: 'saving' | 'saved' | 'error'; message: string };
  onLogWorkout: (plan: WorkoutPlan, feedback: WorkoutFeedback) => void;
  onAction: (prompt: string) => void;
}) {
  const isUser = message.role === 'user';
  const isPending = message.role === 'system';

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[92%] rounded-[28px] border p-4 text-sm leading-6 sm:max-w-[78%] ${
          isUser
            ? 'border-[#1d140d] bg-[#1d140d] text-white'
            : isPending
              ? 'border-[#ead9ca] bg-[#f7efe6] text-[#7a4b28]'
              : 'border-[#ead9ca] bg-white text-[#1d140d]'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {!isUser && message.routedIntent && message.routedIntent !== 'GENERAL' ? (
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a4b22]">
            Intent: {message.routedIntent}
          </p>
        ) : null}
        {!isUser && message.workoutPlan ? (
          <WorkoutPlanCard plan={message.workoutPlan} logState={workoutLogState} onLogWorkout={onLogWorkout} />
        ) : null}
        {!isUser && message.mealPlan ? <MealPlanCard plan={message.mealPlan} /> : null}
        {!isUser && message.nutritionLog ? <NutritionLogCard log={message.nutritionLog} /> : null}
        {message.cards?.length ? (
          <div className="mt-4 space-y-3">
            {message.cards
              .filter((card) => card.type !== 'summary' && card.type !== 'reasoning')
              .map((card) => (
                <div key={`${message.id}-${card.id}`} className="rounded-2xl border border-[#ead9ca] bg-[#fffaf5] p-3 text-xs text-[#5f5145]">
                  <p className="font-semibold text-[#1d140d]">{card.title}</p>
                  {card.body ? <p className="mt-1 leading-5">{card.body}</p> : null}
                  {card.items?.length ? (
                    <ul className="mt-2 space-y-1">
                      {card.items.map((item) => (
                        <li key={item} className="leading-5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {card.actions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {card.actions.map((action) => (
                        <button
                          key={`${card.id}-${action.label}`}
                          type="button"
                          className="rounded-full border border-[#dccbbb] bg-white px-3 py-1.5 text-xs font-medium text-[#4e4035] hover:bg-[#f3e7da]"
                          onClick={() => {
                            if (message.workoutPlan && action.label.toLowerCase().includes('log')) {
                              onLogWorkout(message.workoutPlan, 'JUST_RIGHT');
                              return;
                            }
                            onAction(action.prompt);
                          }}
                        >
                          {message.workoutPlan && action.label.toLowerCase().includes('log') && workoutLogState?.status === 'saving'
                            ? 'Saving...'
                            : action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Icon({ name }: { name: string }) {
  const className = "h-5 w-5 shrink-0";

  if (name === 'menu') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'new-chat') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'reports') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 19V5M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 16v-5M13 16V8M17 16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'community') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
        <path d="M3.5 19c.8-3.2 2.4-5 4.5-5s3.7 1.8 4.5 5M12.5 18c.7-2.4 1.9-3.7 3.5-3.7 1.7 0 3 1.3 3.7 3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'fitness') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'nutrition') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21c4.5-4.2 7-7.7 7-11.1A5.8 5.8 0 0 0 13.2 4c-1.6 0-2.8.7-3.6 1.7A4.4 4.4 0 0 0 6 4C3.8 4 2 5.8 2 8c0 3.8 3.7 6.8 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 7.5c1.2 0 2.2.8 2.6 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'store') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 10h12l-1 10H7L6 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 10V8a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3v2M12 19v2M4.2 7.5l1.7 1M18.1 15.5l1.7 1M4.2 16.5l1.7-1M18.1 8.5l1.7-1M3 12h2M19 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NutritionLogCard({ log }: { log: NonNullable<ChatMessage['nutritionLog']> }) {
  return (
    <section className="mt-4 overflow-hidden rounded-[26px] border border-[#d8c4b3] bg-[#fffaf5] shadow-[0_18px_44px_rgba(80,48,24,0.12)]">
      <div className="bg-[linear-gradient(135deg,_#34512a,_#8a4b22)] p-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f5d7b8]">Nutrition logged</p>
        <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{log.mealText}</h3>
        <p className="mt-2 text-sm text-[#fff4e8]">
          Saved {new Date(log.consumedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-4">
        {[
          { label: 'Calories', value: `${log.totals.calories}` },
          { label: 'Protein', value: `${log.totals.proteinG}g` },
          { label: 'Carbs', value: `${log.totals.carbsG}g` },
          { label: 'Fat', value: `${log.totals.fatG}g` }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#ead9ca] bg-white p-3 text-center">
            <p className="text-xl font-semibold text-[#1d140d]">{item.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a6555]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#ead9ca] bg-white/70 p-4">
        <p className="text-sm font-semibold text-[#1d140d]">Today&apos;s total</p>
        <p className="mt-1 text-sm leading-6 text-[#5f5145]">
          {log.todaySummary.calories} calories across {log.todaySummary.entries} nutrition{' '}
          {log.todaySummary.entries === 1 ? 'entry' : 'entries'}.
        </p>
      </div>
    </section>
  );
}

function MealPlanCard({ plan }: { plan: NonNullable<ChatMessage['mealPlan']> }) {
  return (
    <section className="mt-4 overflow-hidden rounded-[26px] border border-[#d8c4b3] bg-[#fffaf5] shadow-[0_18px_44px_rgba(80,48,24,0.12)]">
      <div className="bg-[linear-gradient(135deg,_#26351f,_#7a4b28)] p-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f5d7b8]">Meal ideas</p>
        <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{plan.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#fff4e8]">{plan.goal}</p>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-3">
        {plan.options.map((option, index) => (
          <article key={`${plan.planId}-${option.name}-${index}`} className="overflow-hidden rounded-[22px] border border-[#ead9ca] bg-white shadow-[0_10px_24px_rgba(80,48,24,0.08)]">
            <div className="relative h-40 overflow-hidden bg-[#26351f]">
              <img
                className="h-full w-full object-cover"
                src={option.imageUrl}
                alt={option.name}
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-sm font-semibold leading-5 text-white">{option.name}</p>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-[#f7efe6] px-2 py-2">
                  <p className="text-sm font-bold text-[#1d140d]">{option.calories}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#7a6555]">cal</p>
                </div>
                <div className="rounded-2xl bg-[#f7efe6] px-2 py-2">
                  <p className="text-sm font-bold text-[#1d140d]">{option.proteinG}g</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#7a6555]">protein</p>
                </div>
                <div className="rounded-2xl bg-[#f7efe6] px-2 py-2">
                  <p className="text-sm font-bold text-[#1d140d]">{option.prepTimeMin}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#7a6555]">min</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {option.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#edf4e8] px-2 py-1 text-[11px] font-semibold text-[#34512a]">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#8a4b22]">Ingredients</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-[#5f5145]">
                {option.ingredients.slice(0, 4).map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>

              <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#8a4b22]">Quick prep</p>
              <ol className="mt-2 space-y-1 text-xs leading-5 text-[#5f5145]">
                {option.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <p className="mt-3 rounded-2xl bg-[#fff7ed] p-3 text-xs leading-5 text-[#5f5145]">{option.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkoutPlanCard({
  plan,
  logState,
  onLogWorkout
}: {
  plan: WorkoutPlan;
  logState?: { status: 'saving' | 'saved' | 'error'; message: string };
  onLogWorkout: (plan: WorkoutPlan, feedback: WorkoutFeedback) => void;
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-[26px] border border-[#d8c4b3] bg-[#fff7ed] shadow-[0_18px_44px_rgba(80,48,24,0.12)]">
      <div className="bg-[linear-gradient(135deg,_#1d140d,_#70421f)] p-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f5c99e]">Workout card</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.03em]">{plan.title}</h3>
            <p className="mt-1 text-sm text-[#fff0df]">{plan.focus}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-center">
            <p className="text-2xl font-semibold leading-none">{plan.estimatedTotalMin}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5c99e]">minutes</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2">
        {plan.exercises.map((exercise, index) => (
          <ExerciseCard key={`${plan.planId}-${exercise.name}-${index}`} exercise={exercise} index={index} />
        ))}
      </div>

      <div className="border-t border-[#ead9ca] bg-white/70 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4b22]">Log this session</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { feedback: 'TOO_EASY' as const, label: 'Too easy' },
            { feedback: 'JUST_RIGHT' as const, label: 'Just right' },
            { feedback: 'TOO_HARD' as const, label: 'Too hard' }
          ].map((option) => (
            <button
              key={option.feedback}
              type="button"
              disabled={logState?.status === 'saving'}
              onClick={() => onLogWorkout(plan, option.feedback)}
              className="rounded-full border border-[#dccbbb] bg-[#fffaf5] px-3 py-2 text-xs font-semibold text-[#4e4035] hover:bg-[#f3e7da] disabled:opacity-60"
            >
              {logState?.status === 'saving' ? 'Saving...' : option.label}
            </button>
          ))}
        </div>
        {logState ? (
          <p className={`mt-3 text-xs ${logState.status === 'error' ? 'text-red-700' : 'text-[#5f5145]'}`}>
            {logState.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ExerciseCard({
  exercise,
  index
}: {
  exercise: NonNullable<ChatMessage['workoutPlan']>['exercises'][number];
  index: number;
}) {
  const mediaUrl = exercise.gifUrl || exercise.videoUrl || null;
  const mediaLabel = exercise.thumbnailLabel || exercise.name;

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#ead9ca] bg-white shadow-[0_10px_24px_rgba(80,48,24,0.08)]">
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[#1d140d]">
        {mediaUrl ? (
          exercise.videoUrl && !exercise.gifUrl ? (
            <video
              className="h-full w-full object-cover"
              src={exercise.videoUrl}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label={`${exercise.name} video demonstration`}
            />
          ) : (
            <img
              className="h-full w-full object-cover"
              src={mediaUrl}
              alt={`${exercise.name} demonstration`}
              loading="lazy"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,_#f5c99e,_#70421f_45%,_#1d140d)] px-4 text-center">
            <p className="text-sm font-semibold text-white">{mediaLabel}</p>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#1d140d]">
          {index + 1}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold leading-5 text-[#1d140d]">{exercise.name}</h4>
            <p className="mt-1 text-xs text-[#7a6555]">{exercise.reps}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#f3e7da] px-2.5 py-1 text-xs font-semibold text-[#70421f]">
            {exercise.durationMin} min
          </span>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#5f5145]">{exercise.note}</p>
        {exercise.demoUrl || exercise.videoUrl || exercise.gifUrl ? (
          <a
            href={exercise.demoUrl || exercise.videoUrl || exercise.gifUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-full border border-[#dccbbb] px-3 py-1.5 text-xs font-semibold text-[#4e4035] hover:bg-[#f3e7da]"
          >
            Open demo
          </a>
        ) : null}
      </div>
    </article>
  );
}

function welcomeMessage(): ChatMessage {
  return {
    id: 'system-assistant-hub',
    role: 'system',
    text:
      'Start with intent, not navigation. Tell me what you want done: plan a workout, reason about a meal, summarize progress, draft a check-in, or decide what to do next.',
    createdAt: new Date().toISOString()
  };
}
