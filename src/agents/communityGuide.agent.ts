import { createLlmClientFromEnv } from '../services/llm';
import {
  buildCommunityGuidePrompt,
  COMMUNITY_GUIDE_SCHEMA_VERSION,
  type CommunityPeerProfile,
  type McpCommunityEngagementSummaryInput
} from './communityGuide.prompt';

export interface SuggestedPost {
  title: string;
  contentPrompt: string;
  reason: string;
}

export interface SuggestedPeer {
  peerUserId: string;
  outreachPrompt: string;
  reason: string;
}

export interface CommunityGuideResult {
  schemaVersion: 'v1';
  suggestedPosts: SuggestedPost[];
  suggestedPeers: SuggestedPeer[];
  engagementApproach: string;
  fairness: {
    noPopularityBias: true;
    noRankingApplied: true;
  };
}

function compactText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function parseJsonObject(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  try {
    return asObject(JSON.parse(trimmed));
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return asObject(JSON.parse(trimmed.slice(start, end + 1)));
    }
    throw new Error('Community guide output is not valid JSON');
  }
}

function normalizeSuggestedPosts(value: unknown): SuggestedPost[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const source = asObject(item);
      return {
        title: compactText(source.title, 'Share a quick update'),
        contentPrompt: compactText(source.contentPrompt, 'Share one recent win or challenge and what helped.'),
        reason: compactText(source.reason, 'Encourages consistent participation.')
      };
    })
    .slice(0, 3);
}

function normalizeSuggestedPeers(value: unknown, availablePeers: CommunityPeerProfile[]): SuggestedPeer[] {
  const allowedPeerIds = new Set(availablePeers.map((peer) => peer.peerUserId));
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: SuggestedPeer[] = [];
  for (const item of value) {
    const source = asObject(item);
    const peerUserId = compactText(source.peerUserId, '');
    if (!peerUserId || !allowedPeerIds.has(peerUserId)) {
      continue;
    }

    normalized.push({
      peerUserId,
      outreachPrompt: compactText(source.outreachPrompt, 'Send a short check-in and ask how their week is going.'),
      reason: compactText(source.reason, 'Supports consistent peer connection without ranking.')
    });
  }

  return normalized.slice(0, 3);
}

function buildFallbackPosts(input: McpCommunityEngagementSummaryInput): SuggestedPost[] {
  const topic = input.focusTopics?.[0] ?? 'weekly progress';

  return [
    {
      title: 'Weekly check-in',
      contentPrompt: `Share one update about your ${topic} and one next step for tomorrow.`,
      reason: 'A structured prompt makes posting easier and more consistent.'
    },
    {
      title: 'Small win reflection',
      contentPrompt: 'Post one small win from this week and what made it possible.',
      reason: 'Highlighting small wins encourages steady engagement.'
    }
  ];
}

function buildFallbackPeers(input: McpCommunityEngagementSummaryInput): SuggestedPeer[] {
  const peers = (input.availablePeers ?? [])
    .slice()
    .sort((a, b) => a.peerUserId.localeCompare(b.peerUserId))
    .slice(0, 3);

  return peers.map((peer) => ({
    peerUserId: peer.peerUserId,
    outreachPrompt: 'Send a short supportive message and ask about their current routine.',
    reason: 'Selected in stable order without popularity or ranking signals.'
  }));
}

function buildDeterministicFallback(input: McpCommunityEngagementSummaryInput): CommunityGuideResult {
  return {
    schemaVersion: 'v1',
    suggestedPosts: buildFallbackPosts(input),
    suggestedPeers: buildFallbackPeers(input),
    engagementApproach: 'Encourage small, regular interactions and simple post prompts to build consistency.',
    fairness: {
      noPopularityBias: true,
      noRankingApplied: true
    }
  };
}

function normalizeResult(
  raw: Record<string, unknown>,
  input: McpCommunityEngagementSummaryInput,
  fallback: CommunityGuideResult
): CommunityGuideResult {
  const posts = normalizeSuggestedPosts(raw.suggestedPosts);
  const peers = normalizeSuggestedPeers(raw.suggestedPeers, input.availablePeers ?? []);

  return {
    schemaVersion: COMMUNITY_GUIDE_SCHEMA_VERSION,
    suggestedPosts: posts.length > 0 ? posts : fallback.suggestedPosts,
    suggestedPeers: peers.length > 0 ? peers : fallback.suggestedPeers,
    engagementApproach: compactText(raw.engagementApproach, fallback.engagementApproach),
    fairness: {
      noPopularityBias: true,
      noRankingApplied: true
    }
  };
}

export async function generateCommunityGuide(input: McpCommunityEngagementSummaryInput): Promise<CommunityGuideResult> {
  const llm = createLlmClientFromEnv();
  const prompt = buildCommunityGuidePrompt(input);
  const fallback = buildDeterministicFallback(input);

  try {
    const response = await llm.generateText({
      prompt,
      systemPrompt:
        'Return strict JSON only. Do not rank users. Do not use popularity signals. Keep suggestions encouraging and neutral.',
      temperature: 0.1,
      maxOutputTokens: 900
    });

    const parsed = parseJsonObject(response.text);
    return normalizeResult(parsed, input, fallback);
  } catch {
    return fallback;
  }
}
