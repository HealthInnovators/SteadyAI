import type { FastifyInstance } from 'fastify';
import { PurchaseStatus } from '@prisma/client';

import type { McpUserSummary } from '../mcp/userSummary';
import { getPrismaClient } from '../db/prisma';
import { authenticateRequest } from '../middleware/auth';
import { buildSoftProductRecommendations } from '../services/product-recommendation.service';
import { getStoreProducts } from '../services/store-product.service';

export async function storeRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/store/products', async (request, reply) => {
    try {
      const products = await getStoreProducts();
      return reply.status(200).send({ items: products });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch products' });
    }
  });

  fastify.post<{ Body: McpUserSummary }>(
    '/store/recommendations',
    async (request, reply) => {
      const summary = request.body;

      if (!summary || typeof summary !== 'object') {
        return reply.status(400).send({ error: 'MCP user summary is required' });
      }

      if (!summary.profile || typeof summary.profile !== 'object' || typeof summary.userId !== 'string') {
        return reply.status(400).send({ error: 'Invalid MCP user summary payload' });
      }

      try {
        const recommendations = await buildSoftProductRecommendations(summary);
        return reply.status(200).send(recommendations);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to build product suggestions' });
      }
    }
  );

  fastify.get(
    '/store/coach-feedback/my',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      try {
        const prisma = getPrismaClient();
        const requests = await prisma.coachFeedbackRequest.findMany({
          where: { userId },
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        });
        return reply.status(200).send({ items: requests });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch coach feedback requests' });
      }
    }
  );

  fastify.post<{
    Body: {
      productId: string;
      topic: string;
      context?: string;
      preferredOutcome?: string;
    };
  }>(
    '/store/coach-feedback',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { productId, topic, context, preferredOutcome } = request.body ?? {};
      if (!productId || typeof productId !== 'string') {
        return reply.status(400).send({ error: 'productId is required' });
      }
      if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
        return reply.status(400).send({ error: 'topic must be at least 5 characters' });
      }

      try {
        const prisma = getPrismaClient();
        const product = await prisma.product.findFirst({
          where: {
            id: productId,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            priceCents: true
          }
        });

        if (!product) {
          return reply.status(404).send({ error: 'Product not found' });
        }

        const productName = product.name.toLowerCase();
        const isCoachService = productName.includes('coach') || productName.includes('review') || productName.includes('plan');
        if (!isCoachService) {
          return reply.status(400).send({ error: 'Selected product is not a coach feedback service' });
        }

        const result = await prisma.$transaction(async (tx) => {
          const purchase = await tx.purchase.create({
            data: {
              buyerId: userId,
              productId: product.id,
              quantity: 1,
              totalCents: product.priceCents,
              status: PurchaseStatus.PAID
            },
            select: { id: true, totalCents: true, purchasedAt: true }
          });

          const feedbackRequest = await tx.coachFeedbackRequest.create({
            data: {
              userId,
              productId: product.id,
              purchaseId: purchase.id,
              topic: topic.trim(),
              context: typeof context === 'string' ? context.trim() || null : null,
              preferredOutcome: typeof preferredOutcome === 'string' ? preferredOutcome.trim() || null : null
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });

          return { purchase, feedbackRequest };
        });

        return reply.status(201).send({
          message: 'Coach feedback request submitted.',
          request: result.feedbackRequest,
          purchase: result.purchase
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to submit coach feedback request' });
      }
    }
  );
}
