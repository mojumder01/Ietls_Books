'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listening as ListeningType } from '@/types';

export default function Listening() {
  const [practices, setPractices] = useState<ListeningType[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<ListeningType | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'listening'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ListeningType[];
        setPractices(data);
      } catch (error) {
        console.error('Error fetching listening practices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
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

  const startPractice = (practice: ListeningType) => {
    setSelectedPractice(practice);
    setUserAnswers({});
    setSubmitted(false);
    setScorePercentage(0);
    setTimeLeft(practice.timeLimit * 60);
    setTimerActive(true);
    setAudioPlaying(false);
  };

  const handleAnswerChange = (index: number, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const submitAnswers = () => {
    if (!selectedPractice) return;

    let correct = 0;
    const questions = selectedPractice.questions || [];

    questions.forEach((question, index) => {
      const userAnswer = (userAnswers[index] || '').trim().toLowerCase();
      const correctAnswer = (question.correctAnswer || '').trim().toLowerCase();

      if (userAnswer === correctAnswer) {
        correct++;
      }
    });

    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScorePercentage(percentage);
    setSubmitted(true);
    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-6">Loading listening practices...</div>;
  }

  if (selectedPractice && !submitted) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">🎧 Listening Practice</h1>
          <div
            className={`text-2xl font-bold ${
              timeLeft <= 60 ? 'text-red-600' : 'text-indigo-600'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Audio Player</h2>

            <audio
              src={selectedPractice.audioUrl}
              controls
              className="w-full mb-6 rounded-lg"
              onPlay={() => setAudioPlaying(true)}
              onPause={() => setAudioPlaying(false)}
            />

            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Transcript</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selectedPractice.transcript}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Questions</h3>
            <div className="space-y-4">
              {(selectedPractice.questions || []).map((question, index) => (
                <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Q{index + 1}: {question.question}
                  </p>
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={userAnswers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={submitAnswers}
              className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Submit Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPractice && submitted) {
    const questions = selectedPractice.questions || [];
    const correctAnswers = Object.entries(userAnswers).filter(([index, answer]) => {
      const question = questions[parseInt(index)];
      return (
        question &&
        answer.trim().toLowerCase() === (question.correctAnswer || '').trim().toLowerCase()
      );
    }).length;

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📊 Results</h1>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">{scorePercentage}%</div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              You got {correctAnswers} out of {questions.length} correct
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[index] || '';
            const isCorrect =
              userAnswer.trim().toLowerCase() ===
              (question.correctAnswer || '').trim().toLowerCase();

            return (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${
                  isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p className="font-medium text-slate-900 dark:text-white mb-2">
                  Q{index + 1}: {question.question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your Answer:</p>
                    <p className="text-slate-900 dark:text-white font-medium">{userAnswer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Correct Answer:</p>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {question.correctAnswer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setSelectedPractice(null);
              setUserAnswers({});
              setSubmitted(false);
              setScorePercentage(0);
            }}
            className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            Back to Practices
          </button>
          <button
            onClick={() => startPractice(selectedPractice)}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
          >
            Retry Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🎧 Listening Practice</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {practices.map((practice) => (
          <div key={practice.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Listening Practice</h3>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded">
                {practice.difficulty}
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ⏱️ Time Limit: {practice.timeLimit} minutes
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ❓ Questions: {practice.questions?.length || 0}
              </p>
            </div>

            <button
              onClick={() => startPractice(practice)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>

      {practices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No listening practices available yet</p>
        </div>
      )}
    </div>
  );
}
