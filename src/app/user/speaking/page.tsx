'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SpeakingCueCard } from '@/types';

interface SpeakingEvaluation {
  score: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  feedback: string;
}

export default function Speaking() {
  const [cueCards, setCueCards] = useState<SpeakingCueCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<SpeakingCueCard | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [phase, setPhase] = useState<'prep' | 'speaking'>('prep');

  useEffect(() => {
    const fetchCueCards = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'speaking_practices'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SpeakingCueCard[];
        setCueCards(data);
      } catch (error) {
        console.error('Error fetching speaking cue cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCueCards();
  }, []);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          if (phase === 'prep') {
            setPhase('speaking');
            setTimeLeft(selectedCard?.timeLimit || 2 * 60);
            setTimerActive(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, phase, selectedCard]);

  const startPractice = (card: SpeakingCueCard) => {
    setSelectedCard(card);
    setUserAnswer('');
    setSubmitted(false);
    setEvaluation(null);
    setPhase('prep');
    setTimeLeft(60);
    setTimerActive(true);
  };

  const submitAnswer = async () => {
    if (!selectedCard || !userAnswer.trim()) return;

    setEvaluating(true);
    setTimerActive(false);

    try {
      const response = await fetch('/api/evaluate-speaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: selectedCard.topic,
          answer: userAnswer,
        }),
      });

      const data = await response.json();
      setEvaluation(data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error evaluating speaking:', error);
      alert('Error evaluating your answer. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-6">Loading speaking cue cards...</div>;
  }

  if (selectedCard && phase === 'prep' && !submitted) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">🎤 Speaking Practice</h1>
          <div className="text-2xl font-bold text-indigo-600">{formatTime(timeLeft)}</div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">PREPARATION TIME</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {selectedCard.topic}
            </h2>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-6 text-left">
              <p className="text-slate-900 dark:text-white whitespace-pre-line">
                {selectedCard.cueCard}
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Prepare your response. You have {formatTime(timeLeft)} remaining.
            </p>
            <button
              onClick={() => {
                setPhase('speaking');
                setTimeLeft(selectedCard.timeLimit * 60);
                setTimerActive(true);
              }}
              className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Start Speaking
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCard && phase === 'speaking' && !submitted) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">🎤 Speaking Practice</h1>
          <div
            className={`text-2xl font-bold ${
              timeLeft <= 30 ? 'text-red-600' : 'text-indigo-600'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {selectedCard.topic}
              </h2>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mt-4">
                <p className="text-slate-900 dark:text-white whitespace-pre-line text-sm">
                  {selectedCard.cueCard}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Response (speak naturally as if in an exam)
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type or paste your spoken response here..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                rows={10}
              />

              <button
                onClick={submitAnswer}
                disabled={evaluating || !userAnswer.trim()}
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
              >
                {evaluating ? 'Evaluating...' : 'Submit & Evaluate'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow h-fit">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>✓ Speak clearly and naturally</li>
              <li>✓ Answer all parts of the prompt</li>
              <li>✓ Use a variety of vocabulary</li>
              <li>✓ Check your grammar</li>
              <li>✓ Don't pause for too long</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCard && submitted && evaluation) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📊 Speaking Evaluation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Overall Score', value: evaluation.score },
            { label: 'Fluency', value: evaluation.fluency },
            { label: 'Vocabulary', value: evaluation.vocabulary },
            { label: 'Grammar', value: evaluation.grammar },
            { label: 'Pronunciation', value: evaluation.pronunciation },
          ].map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-indigo-600">{metric.value.toFixed(1)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Feedback</h2>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{evaluation.feedback}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Response</h2>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{userAnswer}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setSelectedCard(null);
              setUserAnswer('');
              setSubmitted(false);
              setEvaluation(null);
            }}
            className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            Back to Cue Cards
          </button>
          <button
            onClick={() => startPractice(selectedCard)}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
          >
            Retry with Same Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🎤 Speaking Practice</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cueCards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{card.topic}</h3>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded">
                {card.difficulty}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
              {card.cueCard}
            </p>

            <div className="mb-4 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ⏱️ Speaking Time: {card.timeLimit} minutes
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ✍️ Prep Time: 1 minute
              </p>
            </div>

            <button
              onClick={() => startPractice(card)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>

      {cueCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No speaking cue cards available yet</p>
        </div>
      )}
    </div>
  );
}
