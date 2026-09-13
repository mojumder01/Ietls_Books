'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vocabulary } from '@/types';

export default function VocabularyPractice() {
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [filtered, setFiltered] = useState<Vocabulary[]>([]);
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vocabulary'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Vocabulary[];
        setVocab(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching vocabulary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVocab();
  }, []);

  useEffect(() => {
    if (difficulty === 'all') {
      setFiltered(vocab);
    } else {
      setFiltered(vocab.filter((v) => v.difficulty === difficulty));
    }
  }, [difficulty, vocab]);

  if (loading) {
    return <div className="p-6">Loading vocabulary...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🔤 Vocabulary Practice</h1>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setDifficulty('all')}
          className={`px-4 py-2 rounded-lg transition ${
            difficulty === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
          }`}
        >
          All ({vocab.length})
        </button>
        <button
          onClick={() => setDifficulty('easy')}
          className={`px-4 py-2 rounded-lg transition ${
            difficulty === 'easy'
              ? 'bg-green-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
          }`}
        >
          Easy
        </button>
        <button
          onClick={() => setDifficulty('medium')}
          className={`px-4 py-2 rounded-lg transition ${
            difficulty === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setDifficulty('hard')}
          className={`px-4 py-2 rounded-lg transition ${
            difficulty === 'hard'
              ? 'bg-red-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
          }`}
        >
          Hard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((word) => (
          <div key={word.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{word.word}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{word.pronunciation}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded">
                {word.level}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Bengali Meaning</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{word.bengaliMeaning}</p>
              </div>

              {word.example && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Example</p>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300">{word.example}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    word.difficulty === 'easy'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : word.difficulty === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}
                >
                  {word.difficulty}
                </span>
                {word.partOfSpeech && (
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                    {word.partOfSpeech}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No vocabulary found</p>
        </div>
      )}
    </div>
  );
}
