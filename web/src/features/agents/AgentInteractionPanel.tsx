'use client';

import { useAuth } from '@/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { logWorkoutPlanSession, requestAgentReply, type WorkoutFeedback } from './api';
import { AGENT_DISCLAIMER, STARTER_PROMPT_GROUPS, STARTER_PROMPTS } from './data';
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

const INTENT_ROUTES: Partial<Record<AssistantIntent, string>> = {
  FITNESS: '/workouts',
  NUTRITION: '/nutrition',
  COMMUNITY: '/community',
  REPORTS: '/reports',
  STORE: '/store',
  TRACKING: '/reports',
  CHECK_IN: '/check-in',
  EDUCATION: '/agents'
};

const WORKSPACE_LINKS = [
  { href: '/workouts', label: 'Workouts' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/reports', label: 'Reports' },
  { href: '/community', label: 'Community' },
  { href: '/store', label: 'Store' },
  { href: '/settings', label: 'Settings' }
];

const INTENT_LABELS: Record<AssistantIntent, string> = {
  FITNESS: 'workout planning',
  NUTRITION: 'nutrition support',
  TRACKING: 'progress tracking',
  CHECK_IN: 'daily check-ins',
  COMMUNITY: 'community support',
  REPORTS: 'weekly progress',
  STORE: 'coach feedback',
  EDUCATION: 'health education',
  GENERAL: 'your health routine'
};

const INTENT_ACTION_LABELS: Record<AssistantIntent, string> = {
  FITNESS: 'View workout tools',
  NUTRITION: 'Open nutrition tools',
  TRACKING: 'Review progress',
  CHECK_IN: 'Open check-in',
  COMMUNITY: 'Open community',
  REPORTS: 'View reports',
  STORE: 'Explore coach feedback',
  EDUCATION: 'Keep asking here',
  GENERAL: 'Continue here'
};

export function AgentInteractionPanel({ embedded = false, onIntentDetected }: AgentInteractionPanelProps) {
  const router = useRouter();
  const { token, userId } = useAuth();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [workoutLogState, setWorkoutLogState] = useState<Record<string, { status: 'saving' | 'saved' | 'error'; message: string }>>({});
  const [activePromptGroup, setActivePromptGroup] = useState<(typeof STARTER_PROMPT_GROUPS)[number]['id']>(
    STARTER_PROMPT_GROUPS[0].id
  );
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);
  const [activeIntent, setActiveIntent] = useState<AssistantIntent>('GENERAL');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceBaseInputRef = useRef('');
  const finalTranscriptRef = useRef('');

  const visibleGroup = STARTER_PROMPT_GROUPS.find((group) => group.id === activePromptGroup) || STARTER_PROMPT_GROUPS[0];
  const suggestedRoute = activeIntent === 'GENERAL' ? null : INTENT_ROUTES[activeIntent] || null;
  const shellClass = embedded
    ? 'w-full'
    : 'min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.9),_rgba(246,236,226,0.94)_35%,_#f4efe8_82%)] p-4 sm:p-6 lg:p-8';

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
      setActiveIntent(nextIntent);
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

  function openSuggestedWorkspace() {
    if (!suggestedRoute) {
      return;
    }

    startTransition(() => {
      router.push(suggestedRoute);
    });
  }

  const lastAgentMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'agent'),
    [messages]
  );

  return (
    <section className={shellClass}>
      <div className={`mx-auto grid w-full gap-4 ${embedded ? '' : 'max-w-7xl lg:grid-cols-[1fr_340px]'}`}>
        <div className="flex min-h-[72vh] flex-col overflow-hidden rounded-[34px] border border-white/70 bg-[#fffaf5]/88 shadow-[0_28px_100px_rgba(80,48,24,0.12)] backdrop-blur">
          <header className="border-b border-[#ead9ca] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8a4b22]">Your health companion</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#1d140d] sm:text-4xl">
                  What would you like help with today?
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5145]">
                  Ask for a workout, meal idea, progress summary, check-in, or a simple next step. SteadyAI turns your request
                  into a practical plan you can use right away.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl border border-[#ead9ca] bg-white/75 px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8a4b22]">Currently helping with</p>
                  <p className="mt-1 font-semibold text-[#1d140d]">{INTENT_LABELS[activeIntent]}</p>
                </div>
                <Link
                  href="/"
                  className="rounded-full border border-[#d8c4b3] bg-white/70 px-4 py-2 text-center text-xs font-semibold text-[#4e4035] hover:bg-white"
                >
                  Public site
                </Link>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.map((message) => (
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

          <form
            onSubmit={handleSubmit}
            className="border-t border-[#ead9ca] bg-[linear-gradient(180deg,_rgba(255,250,245,0.72),_rgba(255,237,213,0.92))] p-4 sm:p-5"
          >
            <div className="relative rounded-[32px] border-2 border-[#8a4b22] bg-[#fffcf8] p-4 shadow-[0_0_0_6px_rgba(245,201,158,0.28),0_24px_60px_rgba(80,48,24,0.18)]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Ask SteadyAI here</p>
                <p className="rounded-full bg-[#1d140d] px-3 py-1 text-[11px] font-semibold text-white">
                  Type or speak
                </p>
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
                placeholder="Example: Create a low-impact workout, log my lunch, summarize my week, or draft a community check-in..."
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
        </div>

        {!embedded ? (
          <aside className="space-y-4">
            <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Your tools</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {WORKSPACE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-[#ead9ca] bg-[#fffaf5] px-3 py-3 text-center text-xs font-semibold text-[#4e4035] hover:bg-[#f3e7da]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Helpful next step</p>
              <p className="mt-2 text-sm leading-6 text-[#5f5145]">
                Based on your last message, SteadyAI is focused on{' '}
                <span className="font-semibold text-[#1d140d]">{INTENT_LABELS[activeIntent]}</span>.
              </p>
              {suggestedRoute ? (
                <button
                  type="button"
                  onClick={openSuggestedWorkspace}
                  className="mt-4 w-full rounded-full bg-[#1d140d] px-4 py-3 text-sm font-semibold text-white"
                >
                  {INTENT_ACTION_LABELS[activeIntent]}
                </button>
              ) : (
                <p className="mt-4 rounded-2xl bg-[#f7efe6] p-3 text-sm leading-6 text-[#5f5145]">
                  Ask what you want to do next, and SteadyAI will suggest the most useful place to continue.
                </p>
              )}
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.08)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Try asking</p>
                <button
                  type="button"
                  className="rounded-full border border-[#d8c4b3] px-3 py-1 text-xs text-[#5f5145]"
                  onClick={() => {
                    const randomPrompt = STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
                    if (randomPrompt) {
                      void sendPrompt(randomPrompt);
                    }
                  }}
                >
                  Random
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {STARTER_PROMPT_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActivePromptGroup(group.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      activePromptGroup === group.id
                        ? 'border-[#1d140d] bg-[#1d140d] text-white'
                        : 'border-[#e6d9cc] bg-[#fffaf5] text-[#1d140d] hover:border-[#c4ad98]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{group.label}</span>
                    <span className={`mt-1 block text-xs ${activePromptGroup === group.id ? 'text-[#f2e8dd]' : 'text-[#77685d]'}`}>
                      {group.description}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {visibleGroup.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      void sendPrompt(prompt);
                    }}
                    className="w-full rounded-2xl border border-[#ead9ca] bg-[#fffaf5] p-3 text-left text-sm leading-5 text-[#4e4035] hover:bg-[#f3e7da]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </section>

            {lastAgentMessage?.cards?.length ? (
              <section className="rounded-[30px] border border-white/70 bg-[#1d140d] p-5 text-white shadow-[0_18px_70px_rgba(29,20,13,0.14)]">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f3c99f]">Agent output</p>
                <p className="mt-2 text-sm leading-6 text-[#fff6ee]">
                  The latest response includes {lastAgentMessage.cards.length} structured card
                  {lastAgentMessage.cards.length === 1 ? '' : 's'} for summary, reasoning, and next actions.
                </p>
              </section>
            ) : null}
          </aside>
        ) : null}
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
