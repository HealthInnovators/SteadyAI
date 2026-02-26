import type { FastifyInstance } from 'fastify';

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
}
