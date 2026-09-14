'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TongueTwister } from '@/types';

export default function TongueTwisters() {
  const [twisters, setTwisters] = useState<TongueTwister[]>([]);
  const [selectedTwister, setSelectedTwister] = useState<TongueTwister | null>(null);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState('slow');

  useEffect(() => {
    const fetchTwisters = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tongue_twisters'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TongueTwister[];
        setTwisters(data);
      } catch (error) {
        console.error('Error fetching tongue twisters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTwisters();
  }, []);

  if (loading) {
    return <div className="p-6">Loading tongue twisters...</div>;
  }

  if (selectedTwister) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedTwister(null)}
          className="mb-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ← Back to Twisters
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              🌪️ Tongue Twister
            </h1>

            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-6">
              <p className="text-2xl text-slate-900 dark:text-white font-semibold leading-relaxed">
                {selectedTwister.text}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Practice Speed:
              </label>
              <div className="flex gap-2">
                {['slow', 'normal', 'fast'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-4 py-2 rounded-lg transition capitalize ${
                      speed === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {selectedTwister.difficulty && (
              <div className="mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📊 Difficulty:{' '}
                  <span
                    className={`font-medium ${
                      selectedTwister.difficulty === 'easy'
                        ? 'text-green-600'
                        : selectedTwister.difficulty === 'medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {selectedTwister.difficulty}
                  </span>
                </p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">💡 Tips:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Start slowly and gradually increase speed</li>
                <li>• Focus on clear pronunciation</li>
                <li>• Practice reading aloud multiple times</li>
                <li>• Pay attention to similar sounds</li>
                <li>• Repeat challenging parts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🌪️ Tongue Twisters</h1>

      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Practice pronunciation and fluency by repeating these challenging tongue twisters!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {twisters.map((twister) => (
          <div
            key={twister.id}
            onClick={() => setSelectedTwister(twister)}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer"
          >
            <p className="text-lg text-slate-900 dark:text-white mb-4 line-clamp-2">
              {twister.text}
            </p>

            {twister.difficulty && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  twister.difficulty === 'easy'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : twister.difficulty === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {twister.difficulty}
              </span>
            )}

            <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
              Practice
            </button>
          </div>
        ))}
      </div>

      {twisters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No tongue twisters available yet</p>
        </div>
      )}
    </div>
  );
}
