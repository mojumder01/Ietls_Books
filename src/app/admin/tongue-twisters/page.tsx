'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TongueTwistersManagement() {
  const [formData, setFormData] = useState({
    text: '',
    difficulty: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'tongue_twisters'), {
        text: formData.text,
        difficulty: formData.difficulty,
        createdAt: new Date(),
      });

      setMessage('✅ Tongue twister added!');
      setFormData({
        text: '',
        difficulty: 'medium',
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
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        🌪️ Manage Tongue Twisters
      </h1>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tongue Twister Text
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="e.g., 'She sells seashells by the sea shore'"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
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
            {loading ? 'Adding...' : 'Add Tongue Twister'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Examples:</strong>
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li>• "She sells seashells by the sea shore"</li>
            <li>• "Peter Piper picked a peck of pickled peppers"</li>
            <li>• "How much wood would a woodchuck chuck if a woodchuck could chuck wood?"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
