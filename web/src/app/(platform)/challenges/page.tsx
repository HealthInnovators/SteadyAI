'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createApiClient } from '@/lib/api';

interface Challenge {
  id: string;
  title: string;
  description?: string;
  dailyTaskDescription?: string;
  group: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    username: string;
    displayName?: string;
  };
  participations?: Array<{
    status: string;
  }>;
  startsAt?: string;
  createdAt: string;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChallenges() {
      try {
        setIsLoading(true);
        const api = createApiClient();
        const data = await api.get<Challenge[]>('/api/challenges');
        setChallenges(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenges();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg h-32 shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Active Challenges</h1>
        <p className="text-lg text-gray-600 mb-8">Join challenges to improve your wellness</p>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {challenges.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No active challenges available right now</p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Group: <span className="font-semibold">{challenge.group.name}</span>
                    </p>
                  </div>
                  {challenge.participations && challenge.participations.length > 0 && (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Joined
                    </span>
                  )}
                </div>

                {challenge.description && (
                  <p className="text-gray-700 mb-4">{challenge.description}</p>
                )}

                {challenge.dailyTaskDescription && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Daily Task:</span> {challenge.dailyTaskDescription}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    By <span className="font-semibold">{challenge.creator.displayName || challenge.creator.username}</span>
                  </div>
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
