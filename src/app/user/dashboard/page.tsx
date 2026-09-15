'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProgress } from '@/types';
import { APP_VERSION } from '@/config/version';

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const progressDoc = await getDoc(doc(db, 'user_progress', userId));
        if (progressDoc.exists()) {
          setProgress(progressDoc.data() as UserProgress);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!progress) {
    return <div className="flex items-center justify-center h-full">No progress data found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Level</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{progress.level}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        {/* XP */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total XP</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{progress.xp}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Study Streak</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {progress.studyStreak}
              </p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Badges</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {progress.badges.length}
              </p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Progress Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Learning Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Vocabulary
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {progress.vocabularyLearned.length} words
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(progress.vocabularyLearned.length * 2, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Grammar
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {progress.grammarCompleted.length} topics
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(progress.grammarCompleted.length * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Writing
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {progress.writingSubmissions.length} submissions
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${Math.min(progress.writingSubmissions.length * 20, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Speaking
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {progress.speakingSubmissions.length} submissions
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min(progress.speakingSubmissions.length * 20, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Badges & Achievements
          </h2>
          {progress.badges.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {progress.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  <span className="text-3xl">🏅</span>
                  <span className="text-xs text-center mt-2 text-slate-600 dark:text-slate-400">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Keep learning to earn badges! 🚀
            </p>
          )}
        </div>
      </div>

      {/* Daily Quests */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Daily Quests</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Learn 5 new words</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">0/5 completed</p>
            </div>
            <span className="text-xl">📚</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Complete 1 grammar exercise</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">0/1 completed</p>
            </div>
            <span className="text-xl">📐</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Read 1 passage</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">0/1 completed</p>
            </div>
            <span className="text-xl">📖</span>
          </div>
        </div>
      </div>

      {/* Version Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          IELTS Master v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
