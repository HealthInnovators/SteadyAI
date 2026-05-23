import { getPrismaClient } from '../db/prisma';

type ExerciseMediaTarget = {
  name: string;
  thumbnailLabel?: string;
  mediaUrl?: string;
  mediaType?: 'GIF' | 'MP4' | 'IMAGE' | 'NONE';
  gifUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
};

export function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^finisher:\s*/i, '')
    .replace(/[+]/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeExerciseName(name: string): Set<string> {
  const weakTokens = new Set(['the', 'and', 'or', 'with', 'machine', 'barbell', 'dumbbell', 'cable']);
  return new Set(
    normalizeExerciseName(name)
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !weakTokens.has(token))
  );
}

function findBestExerciseMediaMatch<T extends ExerciseMediaTarget>(
  exercise: T,
  rows: Array<{ normalizedName: string }>
): string | null {
  const normalized = normalizeExerciseName(exercise.name);
  const exact = rows.find((row) => row.normalizedName === normalized);
  if (exact) {
    return exact.normalizedName;
  }

  const tokens = tokenizeExerciseName(exercise.name);
  if (tokens.size === 0) {
    return null;
  }

  let bestMatch: { name: string; score: number } | null = null;

  for (const row of rows) {
    const rowTokens = tokenizeExerciseName(row.normalizedName);
    const overlap = Array.from(tokens).filter((token) => rowTokens.has(token)).length;
    const score = overlap / Math.max(tokens.size, rowTokens.size, 1);

    if (overlap >= 2 && score >= 0.5 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { name: row.normalizedName, score };
    }
  }

  return bestMatch?.name ?? null;
}

export async function attachExerciseMedia<T extends ExerciseMediaTarget>(exercises: T[]): Promise<T[]> {
  const normalizedNames = Array.from(
    new Set(
      exercises
        .map((exercise) => normalizeExerciseName(exercise.name))
        .filter((value) => value.length > 0)
    )
  );

  if (normalizedNames.length === 0) {
    return exercises;
  }

  const prisma = getPrismaClient();
  const rows = await prisma.exerciseMedia.findMany();

  const byName = new Map(rows.map((row) => [row.normalizedName, row]));

  return exercises.map((exercise) => {
    const matchKey = findBestExerciseMediaMatch(exercise, rows);
    const match = matchKey ? byName.get(matchKey) : null;
    if (!match) {
      return {
        ...exercise,
        thumbnailLabel: exercise.thumbnailLabel ?? exercise.name
      };
    }

    return {
      ...exercise,
      thumbnailLabel: match.thumbnailLabel ?? match.displayName ?? exercise.thumbnailLabel ?? exercise.name,
      mediaUrl: match.mediaUrl ?? match.videoUrl ?? match.gifUrl ?? exercise.mediaUrl,
      mediaType:
        match.mediaType !== 'NONE'
          ? match.mediaType
          : match.videoUrl
            ? 'MP4'
            : match.gifUrl
              ? 'GIF'
              : exercise.mediaType,
      gifUrl: match.gifUrl ?? exercise.gifUrl,
      videoUrl: match.videoUrl ?? exercise.videoUrl,
      demoUrl: match.demoUrl ?? exercise.demoUrl
    };
  });
}
