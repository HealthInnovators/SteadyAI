import { disconnectPrisma, getPrismaClient } from '../db/prisma';
import { normalizeExerciseName } from '../services/exercise-media.service';

export const DEFAULT_PUBLIC_BUCKET_BASE_URL =
  'https://jgaraelrtrrovzsffccp.supabase.co/storage/v1/object/public/exercise-media';

export const PUBLIC_BUCKET_BASE_URL = (process.env.EXERCISE_MEDIA_PUBLIC_BASE_URL || DEFAULT_PUBLIC_BUCKET_BASE_URL).replace(/\/$/, '');

export type ExerciseMediaSeed = {
  displayName: string;
  slug: string;
  thumbnailLabel?: string;
  hasGif?: boolean;
  demoQuery?: string;
};

export function mediaUrl(folder: 'gifs' | 'mp4', slug: string, extension: 'gif' | 'mp4'): string {
  return `${PUBLIC_BUCKET_BASE_URL}/${folder}/${slug}.${extension}`;
}

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export const EXERCISE_MEDIA_CATALOG: ExerciseMediaSeed[] = [
  // Existing bodyweight/low-impact catalog.
  { displayName: 'March in Place', slug: 'march-in-place', hasGif: true },
  { displayName: 'Jumping Jacks', slug: 'jumping-jacks', hasGif: true },
  { displayName: 'Bodyweight Box Squat', slug: 'bodyweight-box-squat', hasGif: true },
  { displayName: 'Bodyweight Squat', slug: 'bodyweight-squat', hasGif: true },
  { displayName: 'Push-Up + Shoulder Tap', slug: 'push-up-shoulder-tap', hasGif: true },
  { displayName: 'Push-Up', slug: 'push-up', hasGif: true },
  { displayName: 'Glute Bridge', slug: 'glute-bridge', hasGif: true },
  { displayName: 'Reverse Lunge', slug: 'reverse-lunge', hasGif: true },
  { displayName: 'Forearm Plank', slug: 'forearm-plank', hasGif: true },
  { displayName: 'Mountain Climbers', slug: 'mountain-climbers', hasGif: true },

  // Gym strength catalog: chest and triceps.
  { displayName: 'Bench Press', slug: 'bench-press' },
  { displayName: 'Barbell Bench Press', slug: 'barbell-bench-press' },
  { displayName: 'Dumbbell Bench Press', slug: 'dumbbell-bench-press' },
  { displayName: 'Incline Bench Press', slug: 'incline-bench-press' },
  { displayName: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press' },
  { displayName: 'Chest Press Machine', slug: 'chest-press-machine' },
  { displayName: 'Pec Deck', slug: 'pec-deck' },
  { displayName: 'Cable Chest Fly', slug: 'cable-chest-fly' },
  { displayName: 'Dumbbell Fly', slug: 'dumbbell-fly' },
  { displayName: 'Assisted Dip', slug: 'assisted-dip' },
  { displayName: 'Triceps Pushdown', slug: 'triceps-pushdown' },
  { displayName: 'Rope Triceps Pushdown', slug: 'rope-triceps-pushdown' },
  { displayName: 'Overhead Triceps Extension', slug: 'overhead-triceps-extension' },
  { displayName: 'Skull Crusher', slug: 'skull-crusher' },

  // Back and biceps.
  { displayName: 'Lat Pulldown', slug: 'lat-pulldown' },
  { displayName: 'Assisted Pull-Up', slug: 'assisted-pull-up' },
  { displayName: 'Seated Cable Row', slug: 'seated-cable-row' },
  { displayName: 'Chest Supported Row', slug: 'chest-supported-row' },
  { displayName: 'T-Bar Row', slug: 't-bar-row' },
  { displayName: 'One-Arm Dumbbell Row', slug: 'one-arm-dumbbell-row' },
  { displayName: 'Straight-Arm Pulldown', slug: 'straight-arm-pulldown' },
  { displayName: 'Face Pull', slug: 'face-pull' },
  { displayName: 'Barbell Curl', slug: 'barbell-curl' },
  { displayName: 'Dumbbell Curl', slug: 'dumbbell-curl' },
  { displayName: 'Hammer Curl', slug: 'hammer-curl' },
  { displayName: 'Preacher Curl', slug: 'preacher-curl' },
  { displayName: 'Cable Curl', slug: 'cable-curl' },

  // Legs and glutes.
  { displayName: 'Back Squat', slug: 'back-squat' },
  { displayName: 'Barbell Back Squat', slug: 'barbell-back-squat' },
  { displayName: 'Front Squat', slug: 'front-squat' },
  { displayName: 'Smith Machine Squat', slug: 'smith-machine-squat' },
  { displayName: 'Leg Press', slug: 'leg-press' },
  { displayName: 'Hack Squat', slug: 'hack-squat' },
  { displayName: 'Leg Extension', slug: 'leg-extension' },
  { displayName: 'Seated Leg Curl', slug: 'seated-leg-curl' },
  { displayName: 'Lying Leg Curl', slug: 'lying-leg-curl' },
  { displayName: 'Romanian Deadlift', slug: 'romanian-deadlift' },
  { displayName: 'Dumbbell Romanian Deadlift', slug: 'dumbbell-romanian-deadlift' },
  { displayName: 'Barbell Deadlift', slug: 'barbell-deadlift' },
  { displayName: 'Hip Thrust', slug: 'hip-thrust' },
  { displayName: 'Cable Kickback', slug: 'cable-kickback' },
  { displayName: 'Hip Abduction Machine', slug: 'hip-abduction-machine' },
  { displayName: 'Hip Adduction Machine', slug: 'hip-adduction-machine' },
  { displayName: 'Bulgarian Split Squat', slug: 'bulgarian-split-squat' },
  { displayName: 'Walking Lunge', slug: 'walking-lunge' },
  { displayName: 'Step-Up', slug: 'step-up' },
  { displayName: 'Standing Calf Raise', slug: 'standing-calf-raise' },
  { displayName: 'Seated Calf Raise', slug: 'seated-calf-raise' },

  // Shoulders.
  { displayName: 'Shoulder Press', slug: 'shoulder-press' },
  { displayName: 'Dumbbell Shoulder Press', slug: 'dumbbell-shoulder-press' },
  { displayName: 'Machine Shoulder Press', slug: 'machine-shoulder-press' },
  { displayName: 'Lateral Raise', slug: 'lateral-raise' },
  { displayName: 'Cable Lateral Raise', slug: 'cable-lateral-raise' },
  { displayName: 'Rear Delt Fly', slug: 'rear-delt-fly' },
  { displayName: 'Upright Row', slug: 'upright-row' },
  { displayName: 'Landmine Press', slug: 'landmine-press' },

  // Core.
  { displayName: 'Cable Crunch', slug: 'cable-crunch' },
  { displayName: 'Hanging Knee Raise', slug: 'hanging-knee-raise' },
  { displayName: 'Captain Chair Knee Raise', slug: 'captain-chair-knee-raise' },
  { displayName: 'Ab Crunch Machine', slug: 'ab-crunch-machine' },
  { displayName: 'Pallof Press', slug: 'pallof-press' },
  { displayName: 'Cable Woodchop', slug: 'cable-woodchop' },

  // Conditioning and functional gym movements.
  { displayName: 'Treadmill Walk', slug: 'treadmill-walk' },
  { displayName: 'Incline Treadmill Walk', slug: 'incline-treadmill-walk' },
  { displayName: 'Stationary Bike', slug: 'stationary-bike' },
  { displayName: 'Elliptical', slug: 'elliptical' },
  { displayName: 'Rowing Machine', slug: 'rowing-machine' },
  { displayName: 'Stair Climber', slug: 'stair-climber' },
  { displayName: 'Kettlebell Swing', slug: 'kettlebell-swing' },
  { displayName: 'Goblet Squat', slug: 'goblet-squat' },
  { displayName: 'Farmer Carry', slug: 'farmer-carry' },
  { displayName: 'Sled Push', slug: 'sled-push' },
  { displayName: 'Battle Ropes', slug: 'battle-ropes' },
  { displayName: 'TRX Row', slug: 'trx-row' },
  { displayName: 'Medicine Ball Slam', slug: 'medicine-ball-slam' },
  { displayName: 'Landmine Row', slug: 'landmine-row' }
];

async function main(): Promise<void> {
  const prisma = getPrismaClient();

  for (const entry of EXERCISE_MEDIA_CATALOG) {
    const demoQuery = entry.demoQuery || `${entry.displayName} exercise form`;
    const primaryMediaUrl = mediaUrl('mp4', entry.slug, 'mp4');

    await prisma.exerciseMedia.upsert({
      where: {
        normalizedName: normalizeExerciseName(entry.displayName)
      },
      update: {
        displayName: entry.displayName,
        thumbnailLabel: entry.thumbnailLabel || entry.displayName,
        mediaUrl: primaryMediaUrl,
        mediaType: 'MP4',
        gifUrl: entry.hasGif ? mediaUrl('gifs', entry.slug, 'gif') : null,
        videoUrl: primaryMediaUrl,
        demoUrl: youtubeSearchUrl(demoQuery)
      },
      create: {
        normalizedName: normalizeExerciseName(entry.displayName),
        displayName: entry.displayName,
        thumbnailLabel: entry.thumbnailLabel || entry.displayName,
        mediaUrl: primaryMediaUrl,
        mediaType: 'MP4',
        gifUrl: entry.hasGif ? mediaUrl('gifs', entry.slug, 'gif') : null,
        videoUrl: primaryMediaUrl,
        demoUrl: youtubeSearchUrl(demoQuery)
      }
    });
  }

  console.log(`Seeded ${EXERCISE_MEDIA_CATALOG.length} exercise media records.`);
  console.log(`Media base URL: ${PUBLIC_BUCKET_BASE_URL}`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await disconnectPrisma();
    });
}
