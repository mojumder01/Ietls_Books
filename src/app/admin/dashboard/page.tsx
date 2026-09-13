'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVocabulary: 0,
    totalGrammar: 0,
    totalReading: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getDocs(collection(db, 'users'));
        const vocab = await getDocs(collection(db, 'vocabulary'));
        const grammar = await getDocs(collection(db, 'grammar'));
        const reading = await getDocs(collection(db, 'reading'));

        setStats({
          totalUsers: users.size,
          totalVocabulary: vocab.size,
          totalGrammar: grammar.size,
          totalReading: reading.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <p className="text-slate-600 dark:text-slate-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <p className="text-slate-600 dark:text-slate-400 text-sm">Vocabulary Items</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalVocabulary}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <p className="text-slate-600 dark:text-slate-400 text-sm">Grammar Topics</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalGrammar}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <p className="text-slate-600 dark:text-slate-400 text-sm">Reading Passages</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalReading}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/vocabulary"
            className="p-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition text-center"
          >
            <div className="text-2xl mb-2">🔤</div>
            <p className="font-medium text-slate-900 dark:text-white">Add Vocabulary</p>
          </a>
          <a
            href="/admin/grammar"
            className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition text-center"
          >
            <div className="text-2xl mb-2">📐</div>
            <p className="font-medium text-slate-900 dark:text-white">Add Grammar</p>
          </a>
          <a
            href="/admin/reading"
            className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition text-center"
          >
            <div className="text-2xl mb-2">📖</div>
            <p className="font-medium text-slate-900 dark:text-white">Add Reading</p>
          </a>
          <a
            href="/admin/listening"
            className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition text-center"
          >
            <div className="text-2xl mb-2">🎧</div>
            <p className="font-medium text-slate-900 dark:text-white">Add Listening</p>
          </a>
        </div>
      </div>
    </div>
  );
}
