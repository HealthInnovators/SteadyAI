import type { FastifyReply, FastifyRequest } from 'fastify';

import { env } from '../config/env';

interface SupabaseUserResponse {
  id: string;
  email?: string;
}

function getBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function resolveUserFromSupabaseToken(token: string): Promise<SupabaseUserResponse> {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase auth env is not configured');
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_PUBLISHABLE_KEY
    }
  });

  if (!response.ok) {
    throw new Error('Invalid or expired access token');
  }

  const user = (await response.json()) as SupabaseUserResponse;
  if (!user.id) {
    throw new Error('Supabase token missing user id');
  }

  return user;
}

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (env.NODE_ENV === 'test') {
    const testUserId = request.headers['x-test-user-id'];
    if (typeof testUserId === 'string' && testUserId.trim()) {
      request.userId = testUserId.trim();
      request.userEmail = request.headers['x-test-user-email'] as string | undefined;
      return;
    }
  }

  const token = getBearerToken(request);

  if (!token) {
    await reply.status(401).send({ error: 'Missing Bearer token' });
    return;
  }

  try {
    const user = await resolveUserFromSupabaseToken(token);
    request.userId = user.id;
    request.userEmail = user.email;
  } catch (error) {
    request.log.warn({ err: error }, 'Auth failed');
    await reply.status(401).send({ error: 'Unauthorized' });
  }
}
export async function optionalAuthenticateRequest(request: FastifyRequest): Promise<void> {
  if (env.NODE_ENV === 'test') {
    const testUserId = request.headers['x-test-user-id'];
    if (typeof testUserId === 'string' && testUserId.trim()) {
      request.userId = testUserId.trim();
      request.userEmail = request.headers['x-test-user-email'] as string | undefined;
      return;
    }
  }

  const token = getBearerToken(request);

  if (!token) {
    // No token provided - allow unauthenticated access
    return;
  }

  try {
    const user = await resolveUserFromSupabaseToken(token);
    request.userId = user.id;
    request.userEmail = user.email;
  } catch (error) {
    request.log.warn({ err: error }, 'Optional auth failed, continuing as unauthenticated');
    // Don't fail on auth error for optional auth
  }
}