import type { FastifyInstance } from 'fastify';

import { generateEducatorLesson, generateMythCorrection } from '../services/educator.service';

interface EducatorBody {
  userQuestion?: string;
  threadContext?: string;
  communityPostText?: string;
}

export async function educatorRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: EducatorBody }>(
    '/educator',
    async (request, reply) => {
      const { userQuestion, threadContext, communityPostText } = request.body ?? {};

      if (!communityPostText && !userQuestion) {
        return reply.status(400).send({ error: 'Either userQuestion or communityPostText is required' });
      }

      if (communityPostText !== undefined && (typeof communityPostText !== 'string' || communityPostText.trim().length === 0)) {
        return reply.status(400).send({ error: 'communityPostText must be a non-empty string when provided' });
      }

      if (userQuestion !== undefined && (typeof userQuestion !== 'string' || userQuestion.trim().length === 0)) {
        return reply.status(400).send({ error: 'userQuestion must be a non-empty string when provided' });
      }

      if (threadContext !== undefined && typeof threadContext !== 'string') {
        return reply.status(400).send({ error: 'threadContext must be a string when provided' });
      }

      try {
        if (communityPostText) {
          const result = await generateMythCorrection({
            communityPostText,
            threadContext
          });
          return reply.status(200).send({
            mode: 'myth-correction',
            ...result
          });
        }

        const result = await generateEducatorLesson({ userQuestion: userQuestion as string, threadContext });

        return reply.status(200).send({
          mode: 'lesson',
          ...result
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to generate lesson' });
      }
    }
  );
}
