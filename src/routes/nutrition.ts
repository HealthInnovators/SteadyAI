import { NutritionInputType } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

import { authenticateRequest } from '../middleware/auth';
import { addNutritionImageToEntry, ingestNutrition } from '../services/nutrition.service';

interface NutritionIngestBody {
  inputType: NutritionInputType;
  rawText?: string;
  consumedAt?: string;
  imageUrls?: string[];
  items?: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    calories: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    confidence?: number;
  }>;
}

export async function nutritionRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: NutritionIngestBody }>(
    '/nutrition/ingest',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { inputType, rawText, consumedAt, imageUrls, items } = request.body;
      const userId = request.userId;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (!inputType || !Object.values(NutritionInputType).includes(inputType)) {
        return reply.status(400).send({ error: 'Valid inputType is required' });
      }

      try {
        const entry = await ingestNutrition({
          userId,
          inputType,
          rawText,
          consumedAt,
          imageUrls,
          items
        });

        return reply.status(201).send({
          id: entry.id,
          userId: entry.userId,
          totalCalories: entry.totalCalories,
          totalProteinG: entry.totalProteinG,
          totalCarbsG: entry.totalCarbsG,
          totalFatG: entry.totalFatG,
          status: entry.status,
          itemCount: entry.items.length,
          consumedAt: entry.consumedAt,
          createdAt: entry.createdAt
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to ingest nutrition' });
      }
    }
  );

  fastify.post<{ Params: { entryId: string } }>(
    '/nutrition/:entryId/images',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;
      const { entryId } = request.params;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      try {
        const file = await request.file();

        if (!file) {
          return reply.status(400).send({ error: 'No file uploaded. Use multipart/form-data with field name "file".' });
        }

        if (!file.mimetype.startsWith('image/')) {
          return reply.status(400).send({ error: 'Only image files are allowed' });
        }

        const fileBuffer = await file.toBuffer();
        const createdImage = await addNutritionImageToEntry({
          userId,
          entryId,
          fileBuffer,
          mimeType: file.mimetype,
          fileName: file.filename
        });

        return reply.status(201).send({
          id: createdImage.id,
          entryId: createdImage.entryId,
          storageUrl: createdImage.storageUrl,
          mimeType: createdImage.mimeType,
          createdAt: createdImage.createdAt
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to upload nutrition image' });
      }
    }
  );
}
