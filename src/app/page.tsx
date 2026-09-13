'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        // TODO: Fetch user role from Firestore
        setUserRole('user');
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRedirect = () => {
    if (isLoggedIn) {
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user/dashboard');
      }
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            🎓 IELTS Master Platform
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Complete IELTS preparation with AI-powered evaluations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Learn</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Vocabulary, Grammar, Reading, Listening & more
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Feedback</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Get instant AI-powered writing & speaking evaluation
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gamified</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Earn XP, badges, levels & compete on leaderboards
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Track Progress</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Detailed analytics & performance tracking
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoggedIn ? (
            <button
              onClick={handleRedirect}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <p className="mt-8 text-sm text-slate-600 dark:text-slate-400">
          Built with Next.js • Firebase • Gemini AI
        </p>
      </div>
    </div>
  );
}
