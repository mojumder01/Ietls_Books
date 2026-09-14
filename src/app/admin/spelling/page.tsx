'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SpellingManagement() {
  const [formData, setFormData] = useState({
    pronunciation: '',
    correctSpelling: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'spelling_practice'), {
        pronunciation: formData.pronunciation,
        correctSpelling: formData.correctSpelling,
        createdAt: new Date(),
      });

      setMessage('✅ Spelling practice added!');
      setFormData({
        pronunciation: '',
        correctSpelling: '',
      });

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">✏️ Manage Spelling Practice</h1>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pronunciation (How it sounds)
            </label>
            <input
              type="text"
              value={formData.pronunciation}
              onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
              placeholder="e.g., 'si-mon-ee' or 'or-chid'"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Correct Spelling
            </label>
            <input
              type="text"
              value={formData.correctSpelling}
              onChange={(e) => setFormData({ ...formData, correctSpelling: e.target.value })}
              placeholder="e.g., ceremony or orchid"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
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
            {loading ? 'Adding...' : 'Add Spelling Practice'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Create multiple pronunciation/spelling pairs to build a comprehensive spelling practice quiz.
          </p>
        </div>
      </div>
    </div>
  );
}
