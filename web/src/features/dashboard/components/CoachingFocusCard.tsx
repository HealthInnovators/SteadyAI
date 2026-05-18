'use client';

import { AgentInteractionPanel } from '@/features/agents';
import type { AssistantIntent } from '@/features/agents/types';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';


function mapIntentToFocus(intent: AssistantIntent): string {
    switch (intent) {
      case 'FITNESS':
      case 'NUTRITION':
        return '/ai-coach';
      case 'COMMUNITY':
        return '/community';
      case 'REPORTS':
        return '/reports';
      case 'STORE':
        return '/ai-coach';
      default:
        return '/ai-coach';
    }
}

export function CoachingFocusCard() {
    const router = useRouter();

    function handleAssistantIntent(intent: AssistantIntent) {
        const nextPath = mapIntentToFocus(intent);
        startTransition(() => {
            router.push(nextPath);
        });
    }

    return (
        <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
             <h3 className="text-lg font-semibold mb-4">Coaching Focus</h3>
            <AgentInteractionPanel embedded onIntentDetected={handleAssistantIntent} />
        </div>
    );
}
