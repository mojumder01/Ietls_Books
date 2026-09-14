'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dictionary as DictionaryType } from '@/types';

export default function Dictionary() {
  const [entries, setEntries] = useState<DictionaryType[]>([]);
  const [filtered, setFiltered] = useState<DictionaryType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'dictionary'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DictionaryType[];
        setEntries(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching dictionary entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFiltered(entries);
    } else {
      const term = searchTerm.toLowerCase();
      setFiltered(
        entries.filter(
          (entry) =>
            entry.word.toLowerCase().includes(term) ||
            entry.definition.toLowerCase().includes(term) ||
            (entry.bangla && entry.bangla.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, entries]);

  if (loading) {
    return <div className="p-6">Loading dictionary...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📖 Dictionary</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{entry.word}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  {entry.pronunciation}
                </p>
              </div>
              {entry.partOfSpeech && (
                <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded-full font-medium">
                  {entry.partOfSpeech}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                  Definition
                </p>
                <p className="text-slate-900 dark:text-white">{entry.definition}</p>
              </div>

              {entry.bangla && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                    Bengali
                  </p>
                  <p className="text-slate-900 dark:text-white">{entry.bangla}</p>
                </div>
              )}

              {entry.example && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold mb-1">
                    Example
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 italic">{entry.example}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm ? 'No entries found for your search' : 'No dictionary entries available yet'}
          </p>
        </div>
      )}
    </div>
  );
}
