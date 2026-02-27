import type { FastifyInstance } from 'fastify';

import type { McpUserSummary } from '../mcp/userSummary';
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
}
