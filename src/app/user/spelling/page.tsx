'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SpellingPractice } from '@/types';

export default function Spelling() {
  const [practices, setPractices] = useState<SpellingPractice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'spelling_practice'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SpellingPractice[];
        setPractices(data);
      } catch (error) {
        console.error('Error fetching spelling practices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, []);

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleNext = () => {
    const practice = practices[currentIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: currentAnswer,
    }));

    if (currentIndex < practices.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer(userAnswers[currentIndex + 1] || '');
    }
  };

  const handleSubmit = () => {
    const practice = practices[currentIndex];
    const finalAnswers = {
      ...userAnswers,
      [currentIndex]: currentAnswer,
    };

    let correct = 0;
    practices.forEach((p, index) => {
      const userAnswer = (finalAnswers[index] || '').trim().toLowerCase();
      const correctAnswer = (p.correctSpelling || '').trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / practices.length) * 100);
    setScore(percentage);
    setUserAnswers(finalAnswers);
    setSubmitted(true);
  };

  if (loading) {
    return <div className="p-6">Loading spelling practice...</div>;
  }

  if (practices.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">✏️ Spelling Practice</h1>
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No spelling practice available yet</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📊 Spelling Results</h1>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">{score}%</div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              You got {Math.round((score / 100) * practices.length)} out of {practices.length} correct
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {practices.map((practice, index) => {
            const userAnswer = userAnswers[index] || '';
            const isCorrect =
              userAnswer.trim().toLowerCase() ===
              (practice.correctSpelling || '').trim().toLowerCase();

            return (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${
                  isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p className="font-medium text-slate-900 dark:text-white mb-2">Word {index + 1}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{practice.pronunciation}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your Answer:</p>
                    <p className="text-slate-900 dark:text-white font-medium">{userAnswer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Correct Spelling:</p>
                    <p className="text-slate-900 dark:text-white font-medium">{practice.correctSpelling}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setUserAnswers({});
            setSubmitted(false);
            setCurrentAnswer('');
            setScore(0);
          }}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const practice = practices[currentIndex];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">✏️ Spelling Practice</h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <div className="mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Word {currentIndex + 1} of {practices.length}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / practices.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Listen to the pronunciation:</p>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{practice.pronunciation}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Spell the word:
            </label>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type the spelling..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleNext}
              disabled={currentIndex === practices.length - 1}
              className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
