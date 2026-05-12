'use client';

import { useAuth } from '@/auth';
import { createApiClient, type ExerciseMedia } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

export function ExerciseLibrary() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [media, setMedia] = useState<ExerciseMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        setLoading(true);
        const mediaList = await api.getExerciseMedia();
        setMedia(mediaList);
      } catch (error) {
        console.error('Failed to load exercise media:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [api]);

  if (loading) {
    return <div className="p-4 text-center">Loading exercise library...</div>;
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Exercise Library</h3>
      {media.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-lg border border-white/70 bg-white/50 p-2 text-center">
              {item.gifUrl && (
                <img src={item.gifUrl} alt={item.displayName} className="w-full h-auto rounded-md aspect-square object-cover" />
              )}
              <p className="mt-2 text-xs font-semibold text-[#4e4035]">{item.displayName}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#5f5145]">No exercises found in the library.</p>
      )}
    </div>
  );
}
