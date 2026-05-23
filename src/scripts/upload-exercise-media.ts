import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../config/env';
import { disconnectPrisma, getPrismaClient } from '../db/prisma';
import { normalizeExerciseName } from '../services/exercise-media.service';
import { EXERCISE_MEDIA_CATALOG, mediaUrl, youtubeSearchUrl } from './seed-exercise-media';

type MediaKind = 'gif' | 'mp4';

const EXERCISE_MEDIA_BUCKET = process.env.EXERCISE_MEDIA_STORAGE_BUCKET || 'exercise-media';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const positionalArgs = args.filter((arg) => !arg.startsWith('-'));
const localMediaDir = path.resolve(positionalArgs[0] || process.env.EXERCISE_MEDIA_LOCAL_DIR || 'exercise-media');

function assertSupabaseConfig(): void {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to upload exercise media');
  }
}

function contentTypeFor(kind: MediaKind): string {
  return kind === 'gif' ? 'image/gif' : 'video/mp4';
}

function storagePathFor(kind: MediaKind, slug: string): string {
  return kind === 'gif' ? `gifs/${slug}.gif` : `mp4/${slug}.mp4`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findLocalMediaFile(slug: string, kind: MediaKind): Promise<string | null> {
  const extension = kind === 'gif' ? 'gif' : 'mp4';
  const folder = kind === 'gif' ? 'gifs' : 'mp4';
  const candidates = [
    path.join(localMediaDir, folder, `${slug}.${extension}`),
    path.join(localMediaDir, `${slug}.${extension}`)
  ];

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function uploadObject(storagePath: string, filePath: string, contentType: string): Promise<void> {
  const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${EXERCISE_MEDIA_BUCKET}/${storagePath}`;
  const buffer = await readFile(filePath);

  if (dryRun) {
    console.log(`[dry-run] upload ${filePath} -> ${EXERCISE_MEDIA_BUCKET}/${storagePath}`);
    return;
  }

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to upload ${storagePath}: ${response.status} ${errorBody}`);
  }
}

async function main(): Promise<void> {
  if (!dryRun) {
    assertSupabaseConfig();
  }

  const prisma = dryRun ? null : getPrismaClient();
  let uploaded = 0;
  let missing = 0;

  console.log(`Using local media directory: ${localMediaDir}`);
  console.log(`Using Supabase storage bucket: ${EXERCISE_MEDIA_BUCKET}`);

  for (const entry of EXERCISE_MEDIA_CATALOG) {
    const gifPath = entry.hasGif ? await findLocalMediaFile(entry.slug, 'gif') : null;
    const mp4Path = await findLocalMediaFile(entry.slug, 'mp4');
    const gifUrl = entry.hasGif ? mediaUrl('gifs', entry.slug, 'gif') : null;
    const videoUrl = mediaUrl('mp4', entry.slug, 'mp4');
    const primaryMediaUrl = videoUrl;

    if (entry.hasGif) {
      if (gifPath) {
        await uploadObject(storagePathFor('gif', entry.slug), gifPath, contentTypeFor('gif'));
        uploaded += 1;
      } else {
        console.warn(`Missing GIF: ${entry.slug}.gif`);
        missing += 1;
      }
    }

    if (mp4Path) {
      await uploadObject(storagePathFor('mp4', entry.slug), mp4Path, contentTypeFor('mp4'));
      uploaded += 1;
    } else {
      console.warn(`Missing MP4: ${entry.slug}.mp4`);
      missing += 1;
    }

    if (prisma) {
      await prisma.exerciseMedia.upsert({
        where: {
          normalizedName: normalizeExerciseName(entry.displayName)
        },
        update: {
          displayName: entry.displayName,
          thumbnailLabel: entry.thumbnailLabel || entry.displayName,
          mediaUrl: primaryMediaUrl,
          mediaType: 'MP4',
          gifUrl,
          videoUrl,
          demoUrl: youtubeSearchUrl(entry.demoQuery || `${entry.displayName} exercise form`)
        },
        create: {
          normalizedName: normalizeExerciseName(entry.displayName),
          displayName: entry.displayName,
          thumbnailLabel: entry.thumbnailLabel || entry.displayName,
          mediaUrl: primaryMediaUrl,
          mediaType: 'MP4',
          gifUrl,
          videoUrl,
          demoUrl: youtubeSearchUrl(entry.demoQuery || `${entry.displayName} exercise form`)
        }
      });
    }
  }

  console.log(`${dryRun ? 'Checked' : 'Uploaded'} ${uploaded} media file(s).`);
  console.log(`Missing expected file(s): ${missing}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (!dryRun) {
      await disconnectPrisma();
    }
  });
