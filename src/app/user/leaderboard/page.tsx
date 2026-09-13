'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, 'user_progress'), orderBy('xp', 'desc'), limit(100))
        );
        const data = snapshot.docs.map((doc, index) => ({
          rank: index + 1,
          ...doc.data(),
        }));
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-6">Loading leaderboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🏆 Leaderboard</h1>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Level
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                XP
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Badges
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {leaderboard.map((user) => (
              <tr key={user.userId} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 text-lg font-bold text-slate-900 dark:text-white">
                  #{user.rank}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                    Level {user.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                  {user.xp} XP
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                  {user.badges.length} 🏅
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No users on leaderboard yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
