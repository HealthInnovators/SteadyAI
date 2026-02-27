import { NutritionEntryStatus, NutritionInputType, type Prisma } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';
import { estimateNutrition, type EstimatedNutritionItem, type NutritionEstimationResult } from './nutrition-ai.service';
import { uploadNutritionImage } from './supabase-storage.service';

export interface NutritionIngestInput {
  userId: string;
  inputType: NutritionInputType;
  rawText?: string;
  consumedAt?: string;
  items?: EstimatedNutritionItem[];
  imageUrls?: string[];
}

function toItemCreateInput(item: EstimatedNutritionItem): Prisma.NutritionItemCreateWithoutEntryInput {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    calories: item.calories,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
    confidence: item.confidence
  };
}

export async function ingestNutrition(input: NutritionIngestInput) {
  const prisma = getPrismaClient();

  const consumedAt = input.consumedAt ? new Date(input.consumedAt) : new Date();
  if (Number.isNaN(consumedAt.getTime())) {
    throw new Error('Invalid consumedAt date format');
  }

  let items = input.items;
  let estimationMeta: NutritionEstimationResult | null = null;
  const imageUrls = input.imageUrls ?? [];

  if (!items || items.length === 0) {
    if ((!input.rawText || input.rawText.trim().length === 0) && imageUrls.length === 0) {
      throw new Error('Provide items, rawText, or imageUrls');
    }
    estimationMeta = await estimateNutrition(input.rawText ?? '', imageUrls);
    items = estimationMeta.items;
  }

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinG = items.reduce((sum, item) => sum + (item.proteinG ?? 0), 0);
  const totalCarbsG = items.reduce((sum, item) => sum + (item.carbsG ?? 0), 0);
  const totalFatG = items.reduce((sum, item) => sum + (item.fatG ?? 0), 0);

  const createdEntry = await prisma.nutritionEntry.create({
    data: {
      userId: input.userId,
      inputType: input.inputType,
      rawText: input.rawText,
      consumedAt,
      status: NutritionEntryStatus.PROCESSED,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      images: imageUrls.length > 0 ? { create: imageUrls.map((storageUrl) => ({ storageUrl })) } : undefined,
      items: {
        create: items.map(toItemCreateInput)
      },
      analyses: {
        create: {
          modelName: estimationMeta?.modelName ?? 'manual-input',
          promptVersion: estimationMeta?.promptVersion ?? 'manual-input-v1',
          status: NutritionEntryStatus.PROCESSED,
          confidence: estimationMeta?.confidence ?? 1,
          rawResponse: estimationMeta?.rawResponse ?? { source: 'manual-input', itemCount: items.length }
        }
      }
    },
    include: {
      images: true,
      items: true,
      analyses: true
    }
  });

  return createdEntry;
}

export async function addNutritionImageToEntry(params: {
  userId: string;
  entryId: string;
  fileBuffer: Buffer;
  mimeType: string;
  fileName?: string;
}) {
  const prisma = getPrismaClient();

  const entry = await prisma.nutritionEntry.findFirst({
    where: {
      id: params.entryId,
      userId: params.userId
    }
  });

  if (!entry) {
    throw new Error('Nutrition entry not found for user');
  }

  const uploaded = await uploadNutritionImage({
    userId: params.userId,
    entryId: params.entryId,
    buffer: params.fileBuffer,
    mimeType: params.mimeType,
    fileName: params.fileName
  });

  const createdImage = await prisma.nutritionImage.create({
    data: {
      entryId: params.entryId,
      storageUrl: uploaded.storageUrl,
      mimeType: uploaded.mimeType
    }
  });

  return createdImage;
}
