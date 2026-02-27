import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';

import { env } from './config/env';
import { disconnectPrisma } from './db/prisma';
import { registerRoutes } from './routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: env.NODE_ENV !== 'test' });
  
  // Register CORS
  await app.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true
  });
  
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 5
    }
  });

  app.addHook('onClose', async () => {
    await disconnectPrisma();
  });

  // Root health check endpoint
  app.get('/', async () => {
    return { status: 'ok', message: 'SteadyAI Backend is running' };
  });

  await app.register(registerRoutes, { prefix: '/api' });

  return app;
}
