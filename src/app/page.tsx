'use client';

export const dynamic = 'force-dynamic';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎓</span>
          <span className="text-2xl font-bold text-white">IELTS Master</span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button
              onClick={handleRedirect}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-2 text-white font-semibold hover:text-indigo-400 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          {/* Animated Badge */}
          <div className="mb-8 inline-block">
            <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 text-sm font-semibold animate-pulse">
              ✨ Master IELTS with AI
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="inline-block animate-slide-up" style={{animationDelay: '0s'}}>
              Complete IELTS
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-up" style={{animationDelay: '0.1s'}}>
              Preparation Platform
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Learn smarter, not harder. AI-powered feedback, gamified learning, and comprehensive IELTS prep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{animationDelay: '0.3s'}}>
            {isLoggedIn ? (
              <button
                onClick={handleRedirect}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 text-lg"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 text-lg"
                >
                  Login Now
                </Link>
                <Link
                  href="/signup"
                  className="px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all duration-300 border border-slate-600 hover:border-indigo-500/50 transform hover:scale-105 text-lg"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              { icon: '📚', title: 'Learn', desc: 'Vocabulary, Grammar, Reading, Listening & more' },
              { icon: '🤖', title: 'AI Feedback', desc: 'Instant writing & speaking evaluation' },
              { icon: '🏆', title: 'Gamified', desc: 'Earn XP, badges, levels & compete' },
              { icon: '📊', title: 'Track Progress', desc: 'Detailed analytics & performance' }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl hover:border-indigo-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 animate-slide-up"
                style={{animationDelay: `${0.4 + i * 0.1}s`}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:to-indigo-500/5 rounded-xl transition-all duration-300"></div>
                <div className="relative">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Text */}
          <p className="mt-20 text-sm text-slate-500 animate-fade-in" style={{animationDelay: '0.8s'}}>
            Built with Next.js • Firebase • Gemini AI
          </p>
        </div>
      </div>

      {/* Animated Gradient Background */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
