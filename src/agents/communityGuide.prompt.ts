export interface CommunityPeerProfile {
  peerUserId: string;
  sharedContext?: string;
}

export interface McpCommunityEngagementSummaryInput {
  userId: string;
  postsCount: number;
  reactionsGivenCount: number;
  reactionsReceivedCount: number;
  lastPostAt: string | null;
  focusTopics?: string[];
  availablePeers?: CommunityPeerProfile[];
}

export const COMMUNITY_GUIDE_SCHEMA_VERSION = 'v1';

export function buildCommunityGuidePrompt(input: McpCommunityEngagementSummaryInput): string {
  return [
    'You are a community engagement guide for a wellness app.',
    'Generate practical, encouraging suggestions to help the user engage in community.',
    'Return strict JSON only.',
    'Do not rank people or use popularity metrics.',
    'Do not reference likes, follower counts, or top users.',
    'Use neutral, encouraging language.',
    'Output schema:',
    '{',
    '  "schemaVersion": "v1",',
    '  "suggestedPosts": [',
    '    { "title": "string", "contentPrompt": "string", "reason": "string" }',
    '  ],',
    '  "suggestedPeers": [',
    '    { "peerUserId": "string", "outreachPrompt": "string", "reason": "string" }',
    '  ],',
    '  "engagementApproach": "string"',
    '}',
    `Input summary: ${JSON.stringify(input)}`
  ].join('\n');
}
