'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WritingPrompt } from '@/types';

interface WritingEvaluation {
  bandScore: number;
  lexicalResources: number;
  grammaticalAccuracy: number;
  cohesionCoherence: number;
  taskAchievement: number;
  feedback: string;
}

export default function Writing() {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'writing_practices'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WritingPrompt[];
        setPrompts(data);
      } catch (error) {
        console.error('Error fetching writing prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startPractice = (prompt: WritingPrompt) => {
    setSelectedPrompt(prompt);
    setUserAnswer('');
    setSubmitted(false);
    setEvaluation(null);
    setTimeLeft(60 * 60);
    setTimerActive(true);
  };

  const submitAnswer = async () => {
    if (!selectedPrompt || !userAnswer.trim()) return;

    setEvaluating(true);
    setTimerActive(false);

    try {
      const response = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: selectedPrompt.topic,
          answer: userAnswer,
          type: selectedPrompt.type,
        }),
      });

      const data = await response.json();
      setEvaluation(data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error evaluating writing:', error);
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
    return <div className="p-6">Loading writing prompts...</div>;
  }

  if (selectedPrompt && !submitted) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">✍️ Writing Practice</h1>
          <div
            className={`text-2xl font-bold ${
              timeLeft <= 300 ? 'text-red-600' : 'text-indigo-600'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {selectedPrompt.topic}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{selectedPrompt.description}</p>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📝 Type: <span className="font-medium">{selectedPrompt.type}</span>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📊 Difficulty: <span className="font-medium">{selectedPrompt.difficulty}</span>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📏 Word Limit: <span className="font-medium">{selectedPrompt.wordLimit} words</span>
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Answer ({userAnswer.length} words)
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                rows={12}
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Guidelines</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>✓ Use formal language</li>
              <li>✓ Maintain clear paragraph structure</li>
              <li>✓ Use variety of vocabulary</li>
              <li>✓ Check grammar and spelling</li>
              <li>✓ Meet the minimum word count</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPrompt && submitted && evaluation) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📊 Writing Evaluation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Band Score', value: evaluation.bandScore },
            { label: 'Lexical Resources', value: evaluation.lexicalResources },
            { label: 'Grammar', value: evaluation.grammaticalAccuracy },
            { label: 'Cohesion', value: evaluation.cohesionCoherence },
            { label: 'Task Achievement', value: evaluation.taskAchievement },
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Answer</h2>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{userAnswer}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setSelectedPrompt(null);
              setUserAnswer('');
              setSubmitted(false);
              setEvaluation(null);
            }}
            className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            Back to Prompts
          </button>
          <button
            onClick={() => startPractice(selectedPrompt)}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
          >
            Retry with Same Prompt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">✍️ Writing Practice</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{prompt.topic}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prompt.description}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded">
                {prompt.difficulty}
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                📝 Type: {prompt.type}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                📏 Word Limit: {prompt.wordLimit} words
              </p>
            </div>

            <button
              onClick={() => startPractice(prompt)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>

      {prompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No writing prompts available yet</p>
        </div>
      )}
    </div>
  );
}
