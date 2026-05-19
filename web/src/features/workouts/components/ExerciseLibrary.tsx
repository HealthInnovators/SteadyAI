'use client';

import { useAuth } from '@/auth';
import { SkeletonCard } from '@/components/SkeletonCard';
import { createApiClient, type ExerciseMedia } from '@/lib/api';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

export function ExerciseLibrary() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [media, setMedia] = useState<ExerciseMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return media;
    }
    return media.filter((item) => item.displayName.toLowerCase().includes(query) || item.normalizedName.toLowerCase().includes(query));
  }, [media, search]);

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
    return <SkeletonCard rows={7} className="min-h-80" />;
  }

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Exercise demos</p>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Exercise Library</h3>
        </div>
        <p className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold text-[#7a4b28]">{media.length} demos</p>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Search exercises</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-[22px] border border-[#d8c4b3] bg-white px-4 py-3 text-sm text-[#1d140d] outline-none ring-[#8a4b22]/20 placeholder:text-[#9a897a] focus:border-[#8a4b22] focus:ring-4"
          placeholder="Search squats, push-ups, planks..."
        />
      </label>
      {media.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {filteredMedia.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[26px] border border-white/80 bg-white/78 shadow-[0_12px_36px_rgba(80,48,24,0.08)]">
              <div className="relative bg-[#1d140d]/5">
                {item.gifUrl ? (
                  <Image
                    src={item.gifUrl}
                    alt={item.displayName}
                    width={420}
                    height={236}
                    sizes="(min-width: 1536px) 320px, (min-width: 640px) 46vw, 92vw"
                    className="aspect-video w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-[#f3e7da] px-4 text-center text-sm font-semibold text-[#7a4b28]">
                    {item.thumbnailLabel || item.displayName}
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-base font-bold tracking-[-0.03em] text-[#1d140d]">{item.displayName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.videoUrl ? (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#1d140d] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Watch video
                    </a>
                  ) : null}
                  {item.demoUrl ? (
                    <a
                      href={item.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#d8c4b3] bg-white px-3 py-2 text-xs font-semibold text-[#4e4035]"
                    >
                      Open demo
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {media.length > 0 && filteredMedia.length === 0 ? (
        <p className="mt-4 rounded-[24px] border border-dashed border-[#d8c4b3] bg-white/60 p-5 text-sm leading-6 text-[#5f5145]">
          No exercises matched that search.
        </p>
      ) : (
        null
      )}
      {media.length === 0 ? (
        <p className="mt-4 rounded-[24px] border border-dashed border-[#d8c4b3] bg-white/60 p-5 text-sm leading-6 text-[#5f5145]">
          No exercises found in the library.
        </p>
      ) : (
        null
      )}
    </section>
  );
}
