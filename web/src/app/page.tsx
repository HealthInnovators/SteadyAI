'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('steadyai.jwt');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Steady AI</h1>
            <p className="text-xl text-gray-600">Your personal wellness companion</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">Get started with Steady AI to achieve your health and wellness goals.</p>
            
            <Link
              href="/onboarding"
              className="w-full block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Start Onboarding
            </Link>
            
            <Link
              href="/settings/api-keys"
              className="w-full block bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-3 px-4 rounded-lg border border-indigo-600 transition duration-200"
            >
              Configure API Keys
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Steady AI</h1>
            <div className="space-x-4">
              <Link href="/agents" className="text-gray-600 hover:text-indigo-600">Agents</Link>
              <Link href="/check-in" className="text-gray-600 hover:text-indigo-600">Check-In</Link>
              <Link href="/challenges" className="text-gray-600 hover:text-indigo-600">Challenges</Link>
              <Link href="/community" className="text-gray-600 hover:text-indigo-600">Community</Link>
              <Link href="/settings/api-keys" className="text-gray-600 hover:text-indigo-600">Settings</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Steady AI</h2>
          <p className="text-lg text-gray-600 mb-8">
            Your personal wellness companion powered by AI. Start exploring our features to improve your health and wellness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/agents" className="block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🤖 Agents</h3>
              <p className="text-gray-600">AI-powered health coaches and guides</p>
            </Link>

            <Link href="/check-in" className="block p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">✅ Check-In</h3>
              <p className="text-gray-600">Log your daily progress and habits</p>
            </Link>

            <Link href="/challenges" className="block p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🎯 Challenges</h3>
              <p className="text-gray-600">Join challenges and build streaks</p>
            </Link>

            <Link href="/community" className="block p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">👥 Community</h3>
              <p className="text-gray-600">Connect with others on their wellness journey</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
