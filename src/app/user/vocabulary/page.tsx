'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Vocabulary {
  id: string;
  word: string;
  bengaliMeaning: string;
  pronunciation: string;
  example: string;
  exampleBengali?: string;
  difficulty: string;
  level: string;
  partOfSpeech?: string;
  typeOfSentence?: string;
  typeOfTense?: string;
}

interface StudentProgress {
  vocabId: string;
  userId: string;
  completed: boolean;
  important: boolean;
  lastViewed: Date;
}

export default function VocabularyPractice() {
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [filtered, setFiltered] = useState<Vocabulary[]>([]);
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, StudentProgress>>({});
  const [sortBy, setSortBy] = useState<'word' | 'difficulty' | 'level'>('word');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showImportant, setShowImportant] = useState(false);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch vocabulary and progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vocabulary'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Vocabulary[];
        setVocab(data);
        setFiltered(data);

        // Fetch user progress
        if (userId) {
          const progressSnapshot = await getDocs(
            query(collection(db, 'user_vocabulary_progress'), where('userId', '==', userId))
          );
          const progressData: Record<string, StudentProgress> = {};
          progressSnapshot.docs.forEach(doc => {
            progressData[doc.data().vocabId] = doc.data() as StudentProgress;
          });
          setProgress(progressData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Apply filters and sorting
  useEffect(() => {
    let result = vocab;

    // Filter by difficulty
    if (difficulty !== 'all') {
      result = result.filter((v) => v.difficulty === difficulty);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (v) =>
          v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.bengaliMeaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by completion status
    if (!showCompleted) {
      result = result.filter((v) => !progress[v.id]?.completed);
    }

    // Filter by important
    if (showImportant) {
      result = result.filter((v) => progress[v.id]?.important);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'word') return a.word.localeCompare(b.word);
      if (sortBy === 'difficulty') {
        const diffOrder = { easy: 0, medium: 1, hard: 2 };
        return (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) - (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
      }
      if (sortBy === 'level') return (a.level || '').localeCompare(b.level || '');
      return 0;
    });

    setFiltered(result);
  }, [difficulty, searchQuery, vocab, progress, showCompleted, showImportant, sortBy]);

  const toggleCompleted = async (vocabId: string) => {
    if (!userId) return;

    const isCompleted = progress[vocabId]?.completed || false;
    const docId = `${userId}_${vocabId}`;

    try {
      await setDoc(
        doc(db, 'user_vocabulary_progress', docId),
        {
          vocabId,
          userId,
          completed: !isCompleted,
          important: progress[vocabId]?.important || false,
          lastViewed: new Date(),
        },
        { merge: true }
      );

      setProgress({
        ...progress,
        [vocabId]: {
          ...progress[vocabId],
          completed: !isCompleted,
          vocabId,
          userId,
          lastViewed: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const toggleImportant = async (vocabId: string) => {
    if (!userId) return;

    const isImportant = progress[vocabId]?.important || false;
    const docId = `${userId}_${vocabId}`;

    try {
      await setDoc(
        doc(db, 'user_vocabulary_progress', docId),
        {
          vocabId,
          userId,
          important: !isImportant,
          completed: progress[vocabId]?.completed || false,
          lastViewed: new Date(),
        },
        { merge: true }
      );

      setProgress({
        ...progress,
        [vocabId]: {
          ...progress[vocabId],
          important: !isImportant,
          vocabId,
          userId,
          lastViewed: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const pronounceWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading vocabulary...</div>;
  }

  const completedCount = Object.values(progress).filter(p => p.completed).length;

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">📚 Vocabulary Practice</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Completed: <span className="font-bold text-indigo-600">{completedCount}</span> / {vocab.length}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by word or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="word">Sort by Word</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="level">Sort by Level</option>
            </select>

            {/* Status Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`flex-1 px-4 py-2 rounded-lg transition font-semibold ${
                  showCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                ✓ Completed
              </button>
              <button
                onClick={() => setShowImportant(!showImportant)}
                className={`flex-1 px-4 py-2 rounded-lg transition font-semibold ${
                  showImportant
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                ⭐ Important
              </button>
            </div>
          </div>
        </div>

        {/* Vocabulary Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Word</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pronunciation</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Bengali Meaning</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Example</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Example (Bengali)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Difficulty</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Part of Speech</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Sentence Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tense</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((word, index) => (
                  <tr
                    key={word.id}
                    className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                      progress[word.id]?.completed ? 'bg-green-50 dark:bg-green-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{word.word}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{word.pronunciation}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{word.bengaliMeaning}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">{word.example}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">{word.exampleBengali}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1 rounded font-semibold whitespace-nowrap ${
                          word.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : word.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {word.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">{word.level}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{word.partOfSpeech}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{word.typeOfSentence}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{word.typeOfTense}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => pronounceWord(word.word)}
                          title="Pronounce"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                        >
                          🔊
                        </button>
                        <button
                          onClick={() => toggleCompleted(word.id)}
                          title="Mark as completed"
                          className={`px-3 py-1 text-sm rounded transition ${
                            progress[word.id]?.completed
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-green-600'
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => toggleImportant(word.id)}
                          title="Mark as important"
                          className={`px-3 py-1 text-sm rounded transition ${
                            progress[word.id]?.important
                              ? 'bg-yellow-500 text-white'
                              : 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-yellow-500'
                          }`}
                        >
                          ⭐
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No vocabulary found</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">Completed</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">{completedCount}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Important</p>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              {Object.values(progress).filter(p => p.important).length}
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Total Words</p>
            <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{vocab.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
