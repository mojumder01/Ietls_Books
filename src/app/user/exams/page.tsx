'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  where,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface MockTest {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  questions: Question[];
  createdAt: Date;
}

interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  answers: Record<number, number>;
  timeTaken: number;
  completedAt: Date;
}

export default function ExamsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [takingTest, setTakingTest] = useState<MockTest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [testFinished, setTestFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTestsAndAttempts();
    }
  }, [userId]);

  useEffect(() => {
    if (!takingTest || !testStartTime) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
      const remaining = Math.max(0, takingTest.duration * 60 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        finishTest();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [takingTest, testStartTime]);

  const fetchTestsAndAttempts = async () => {
    setLoading(true);
    try {
      const testsSnap = await getDocs(
        query(collection(db, 'mock_tests'), orderBy('createdAt', 'desc'))
      );
      const fetchedTests = testsSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as MockTest[];
      setTests(fetchedTests);

      if (userId) {
        const attemptsSnap = await getDocs(
          query(
            collection(db, 'test_attempts'),
            where('userId', '==', userId),
            orderBy('completedAt', 'desc')
          )
        );
        const fetchedAttempts = attemptsSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as TestAttempt[];
        setAttempts(fetchedAttempts);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test: MockTest) => {
    setTakingTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setTestFinished(false);
    setTestStartTime(Date.now());
    setTimeRemaining(test.duration * 60);
  };

  const selectAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const goToNextQuestion = () => {
    if (takingTest && currentQuestion < takingTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = async () => {
    if (!takingTest || !userId) return;

    const questions = takingTest.questions;
    let correctCount = 0;

    Object.entries(answers).forEach(([index, selectedOption]) => {
      if (selectedOption === questions[parseInt(index)].correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round(
      (correctCount / questions.length) * 100
    );

    setScore(scorePercentage);
    setTestFinished(true);

    try {
      const timeTaken = Math.floor(
        (Date.now() - (testStartTime || 0)) / 1000
      );

      await addDoc(collection(db, 'test_attempts'), {
        testId: takingTest.id,
        userId,
        score: scorePercentage,
        totalQuestions: questions.length,
        answers,
        timeTaken,
        completedAt: new Date(),
      });

      await fetchTestsAndAttempts();
    } catch (error) {
      console.error('Error saving test attempt:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTestHistory = (testId: string) => {
    return attempts.filter((a) => a.testId === testId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">Loading exams...</p>
      </div>
    );
  }

  // Taking Test View
  if (takingTest && testStartTime) {
    const question = takingTest.questions[currentQuestion];
    const isAnswered = currentQuestion in answers;

    if (testFinished) {
      const passed = score >= takingTest.passingScore;

      return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <div
              className={`rounded-lg p-8 text-center ${
                passed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <h2
                className={`text-3xl font-bold mb-2 ${
                  passed
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}
              >
                {passed ? '🎉 Congratulations!' : '⚠️ Test Completed'}
              </h2>

              <div className="my-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Your Score
                </p>
                <p className="text-5xl font-bold text-slate-900 dark:text-white">
                  {score}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Passing Score
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {takingTest.passingScore}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Result
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      passed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {passed ? 'PASSED' : 'FAILED'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setTakingTest(null);
                  setTestFinished(false);
                  setAnswers({});
                  setTestStartTime(null);
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
              >
                Return to Tests
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {takingTest.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Question {currentQuestion + 1} / {takingTest.questions.length}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Time Remaining
                </p>
                <p
                  className={`text-2xl font-bold ${
                    timeRemaining < 60
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / takingTest.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition ${
                    answers[currentQuestion] === index
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === index
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-slate-400'
                      }`}
                    >
                      {answers[currentQuestion] === index && (
                        <span className="text-white font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-slate-900 dark:text-white">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-slate-400 hover:bg-slate-500 disabled:opacity-50 text-white font-bold rounded-lg transition"
            >
              ← Previous
            </button>

            <button
              onClick={() => finishTest()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
              Finish Test
            </button>

            <button
              onClick={goToNextQuestion}
              disabled={currentQuestion === takingTest.questions.length - 1}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tests List View
  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          📝 Practice Exams
        </h1>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              No practice exams available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => {
              const testHistory = getTestHistory(test.id);
              const bestScore = testHistory.length > 0
                ? Math.max(...testHistory.map((a) => a.score))
                : null;

              return (
                <div
                  key={test.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {test.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {test.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Duration
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {test.duration} min
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Questions
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {test.questions?.length || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        To Pass
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {test.passingScore}%
                      </p>
                    </div>
                  </div>

                  {bestScore !== null && (
                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Best Score
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {bestScore}% ({testHistory.length} attempt
                        {testHistory.length !== 1 ? 's' : ''})
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => startTest(test)}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                  >
                    {testHistory.length > 0 ? 'Retake' : 'Start'} Test
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* History */}
        {attempts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              📊 Your Performance History
            </h2>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Test
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Time Taken
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {attempts.map((attempt) => {
                      const test = tests.find((t) => t.id === attempt.testId);
                      const passed = attempt.score >= (test?.passingScore || 70);
                      const minutes = Math.floor(attempt.timeTaken / 60);
                      const seconds = attempt.timeTaken % 60;

                      return (
                        <tr
                          key={attempt.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                        >
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            {test?.title}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {attempt.score}%
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {minutes}m {seconds}s
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                passed
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
