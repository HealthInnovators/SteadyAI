import { buildMcpUserSummary, type BuildMcpUserSummaryInput } from '../mcp/userSummary';

export interface GenerateMcpUserSummaryInput {
  profile: BuildMcpUserSummaryInput['profile'];
  communityEngagement?: BuildMcpUserSummaryInput['communityEngagement'];
  purchaseHistory?: BuildMcpUserSummaryInput['purchaseHistory'];
}

function hasRawHealthDataFields(input: unknown): boolean {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const source = input as Record<string, unknown>;
  const blockedKeys = ['rawHealthData', 'healthData', 'healthRecords', 'biometrics'];
  if (blockedKeys.some((key) => key in source)) {
    return true;
  }

  return Object.values(source).some((value) => hasRawHealthDataFields(value));
}

export function generateMcpUserSummary(input: GenerateMcpUserSummaryInput) {
  if (hasRawHealthDataFields(input)) {
    throw new Error('Raw health data is not allowed in MCP summary input');
  }

  return buildMcpUserSummary({
    profile: input.profile,
    communityEngagement: input.communityEngagement,
    purchaseHistory: input.purchaseHistory
  });
}
