import { randomUUID } from 'node:crypto';

import { env } from '../config/env';

export interface UploadNutritionImageInput {
  userId: string;
  entryId: string;
  buffer: Buffer;
  mimeType: string;
  fileName?: string;
}

export interface UploadNutritionImageResult {
  storagePath: string;
  storageUrl: string;
  mimeType: string;
}

function getExtensionFromMimeType(mimeType: string): string {
  const lookup: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic'
  };

  return lookup[mimeType] ?? 'bin';
}

export async function uploadNutritionImage(input: UploadNutritionImageInput): Promise<UploadNutritionImageResult> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for image upload');
  }

  const ext = getExtensionFromMimeType(input.mimeType);
  const objectName = `${input.userId}/${input.entryId}/${randomUUID()}.${ext}`;
  const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_STORAGE_BUCKET}/${objectName}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': input.mimeType,
      'x-upsert': 'false'
    },
    body: input.buffer
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase storage upload failed: ${response.status} ${errorBody}`);
  }

  return {
    storagePath: objectName,
    storageUrl: `${env.SUPABASE_URL}/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/${objectName}`,
    mimeType: input.mimeType
  };
}
