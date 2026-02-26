'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  endsAt?: string;
  status: string;
  createdAt: string;
}

export default function ChallengeDetailsPage() {
  const params = useParams();
  const challengeId = params.id as string;
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    async function fetchChallenge() {
      if (!challengeId) return;
      
      try {
        setIsLoading(true);
        const api = createApiClient();
        const data = await api.get<Challenge>(`/api/challenges/${challengeId}`);
        setChallenge(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch challenge');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenge();
  }, [challengeId]);

  const handleJoinChallenge = async () => {
    if (!challenge) return;
    
    try {
      setIsJoining(true);
      // TODO: Implement join challenge endpoint
      alert('Join challenge feature coming soon!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg h-12 shadow"></div>
            <div className="bg-white rounded-lg h-64 shadow"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-red-600 text-lg mb-4">Challenge not found</p>
            <Link
              href="/challenges"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Back to Challenges
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isJoined = challenge.participations && challenge.participations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Steady AI
            </Link>
            <div className="space-x-4">
              <Link href="/challenges" className="text-indigo-600 font-semibold">
                Challenges
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Link
          href="/challenges"
          className="inline-block mb-6 text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          ← Back to Challenges
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
              <p className="text-lg text-gray-600">
                Group: <span className="font-semibold">{challenge.group.name}</span>
              </p>
            </div>
            {isJoined && (
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                ✓ Joined
              </span>
            )}
          </div>

          {challenge.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About this Challenge</h2>
              <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
            </div>
          )}

          {challenge.dailyTaskDescription && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Daily Task</h2>
              <p className="text-gray-700">{challenge.dailyTaskDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8 py-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Creator</p>
              <p className="font-semibold text-gray-900">{challenge.creator.displayName || challenge.creator.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-gray-900">{challenge.status}</p>
            </div>
            {challenge.startsAt && (
              <div>
                <p className="text-sm text-gray-600">Starts</p>
                <p className="font-semibold text-gray-900">
                  {new Date(challenge.startsAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {challenge.endsAt && (
              <div>
                <p className="text-sm text-gray-600">Ends</p>
                <p className="font-semibold text-gray-900">
                  {new Date(challenge.endsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {!isJoined && (
            <button
              onClick={handleJoinChallenge}
              disabled={isJoining}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isJoining ? 'Joining...' : 'Join Challenge'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
