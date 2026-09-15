'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number; // percentage
  questions: Question[];
  createdAt: Date;
}

export default function ExamManagement() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 70,
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  const [editFormData, setEditFormData] = useState<any>({});
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'mock_tests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedTests = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as MockTest[];
      setTests(fetchedTests);
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      setMessage('❌ Error loading tests');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.title) {
        setMessage('❌ Please enter test title');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'mock_tests'), {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        passingScore: formData.passingScore,
        questions: [],
        createdAt: new Date(),
      });

      setMessage('✅ Mock test created successfully!');
      setFormData({
        title: '',
        description: '',
        duration: 60,
        passingScore: 70,
      });
      await fetchTests();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Delete this mock test? This cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'mock_tests', testId));
      setTests(tests.filter((t) => t.id !== testId));
      setMessage('✅ Mock test deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleEditTest = (test: MockTest) => {
    setEditingId(test.id);
    setEditFormData(test);
  };

  const handleUpdateTest = async (testId: string) => {
    try {
      await updateDoc(doc(db, 'mock_tests', testId), {
        title: editFormData.title,
        description: editFormData.description,
        duration: editFormData.duration,
        passingScore: editFormData.passingScore,
      });
      setTests(tests.map((t) =>
        t.id === testId ? { ...t, ...editFormData } : t
      ));
      setEditingId(null);
      setMessage('✅ Mock test updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          📝 Mock Tests Management
        </h1>
      </div>

      {/* Create Test Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Create New Mock Test
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Test Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., IELTS Academic Test 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                min="5"
                max="300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={formData.passingScore}
                onChange={(e) =>
                  setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={3}
              placeholder="Describe the test..."
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes('✅')
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Mock Test'}
          </button>
        </form>
      </div>

      {/* Mock Tests List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Mock Tests ({tests.length})
        </h2>

        {dataLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">
              No mock tests yet. Create one using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 hover:shadow-lg transition"
              >
                {editingId === test.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editFormData.title || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="number"
                      value={editFormData.duration || 60}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateTest(test.id)}
                        className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-3 py-1 bg-slate-400 hover:bg-slate-500 text-white text-sm rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      {test.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {test.description}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {test.duration} min
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Questions</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {test.questions?.length || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Pass %</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {test.passingScore}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTest(test)}
                        className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> To manage questions for each test, go to the individual test's edit page.
          You can add, edit, and delete questions from there.
        </p>
      </div>
    </div>
  );
}
