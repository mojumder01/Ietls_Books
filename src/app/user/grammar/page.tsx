'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grammar } from '@/types';

export default function GrammarPage() {
  const [topics, setTopics] = useState<Grammar[]>([]);
  const [filtered, setFiltered] = useState<Grammar[]>([]);
  const [difficulty, setDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState<Grammar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'grammar'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Grammar[];
        setTopics(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching grammar topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    if (difficulty === 'all') {
      setFiltered(topics);
    } else {
      setFiltered(topics.filter((t) => t.difficulty === difficulty));
    }
  }, [difficulty, topics]);

  if (loading) {
    return <div className="p-6">Loading grammar topics...</div>;
  }

  if (selectedTopic) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedTopic(null)}
          className="mb-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ← Back to Topics
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedTopic.title}</h1>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                selectedTopic.difficulty === 'easy'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : selectedTopic.difficulty === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              {selectedTopic.difficulty}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Content</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{selectedTopic.content}</p>
            </div>

            {selectedTopic.rules && selectedTopic.rules.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Rules & Examples</h2>
                <div className="space-y-3">
                  {selectedTopic.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-indigo-600"
                    >
                      <p className="text-slate-900 dark:text-white whitespace-pre-line">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📖 Grammar Topics</h1>

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setDifficulty('all')}
          className={`px-4 py-2 rounded-lg transition ${
            difficulty === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
          }`}
        >
          All ({topics.length})
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
        {filtered.map((topic) => (
          <div
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex-1">{topic.title}</h3>
              <span
                className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                  topic.difficulty === 'easy'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : topic.difficulty === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {topic.difficulty}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
              {topic.content}
            </p>

            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
              Learn More
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No grammar topics found</p>
        </div>
      )}
    </div>
  );
}
