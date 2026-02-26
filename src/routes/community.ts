import { PostType } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

import { authenticateRequest } from '../middleware/auth';
import { getCommunityFeed } from '../services/community-feed.service';
import { ALLOWED_POST_TYPES, createCommunityPost } from '../services/community-post.service';

interface CommunityFeedQuery {
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

interface CreateCommunityPostBody {
  type: PostType;
  content: string;
}

export async function communityRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: CommunityFeedQuery }>(
    '/community/feed',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      try {
        const feed = await getCommunityFeed({
          userId,
          limit: request.query.limit,
          cursorCreatedAt: request.query.cursorCreatedAt,
          cursorId: request.query.cursorId
        });

        return reply.status(200).send(feed);
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to fetch community feed' });
      }
    }
  );

  fastify.post<{ Body: CreateCommunityPostBody }>(
    '/community/posts',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { type, content } = request.body;

      if (!type || !ALLOWED_POST_TYPES.has(type)) {
        return reply.status(400).send({ error: 'type must be one of WIN, QUESTION, CHECK_IN' });
      }

      if (typeof content !== 'string' || content.trim().length === 0) {
        return reply.status(400).send({ error: 'content is required' });
      }

      try {
        const post = await createCommunityPost({
          userId,
          type,
          content
        });

        return reply.status(201).send(post);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create post';

        if (message.includes('active member')) {
          return reply.status(403).send({ error: message });
        }

        request.log.error(error);
        return reply.status(400).send({ error: message });
      }
    }
  );
}
