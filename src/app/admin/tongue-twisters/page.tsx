'use client';

import { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { downloadCSVTemplate, parseCSV, TONGUETWISTERS_CSV_HEADERS } from '@/utils/csvUtils';

export default function TongueTwistersManagement() {
  const [formData, setFormData] = useState({
    text: '',
    difficulty: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    setCsvMessage('');

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setCsvMessage('❌ No valid data found in CSV file');
        return;
      }

      let successCount = 0;
      for (const row of rows) {
        try {
          await addDoc(collection(db, 'tongue_twisters'), {
            text: row.text || '',
            difficulty: row.difficulty || 'medium',
            level: row.level || 'B1',
            createdAt: new Date(),
          });
          successCount++;
        } catch (error) {
          console.error('Error adding document:', error);
        }
      }

      setCsvMessage(`✅ Successfully added ${successCount} tongue twisters from CSV!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setCsvMessage(''), 4000);
    } catch (error: any) {
      setCsvMessage(`❌ Error processing CSV: ${error.message}`);
    } finally {
      setCsvLoading(false);
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

        <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Batch Upload CSV</h2>

          <div className="space-y-4">
            <button
              onClick={() => downloadCSVTemplate('tonguetwisters_template.csv', TONGUETWISTERS_CSV_HEADERS)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Download CSV Template
            </button>

            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVUpload}
                disabled={csvLoading}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={csvLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {csvLoading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>

            {csvMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  csvMessage.includes('✅')
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {csvMessage}
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">CSV Format Example:</p>
              <pre className="text-xs text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 p-2 rounded overflow-x-auto">
{`text,difficulty,level
"She sells seashells by the sea shore",easy,A2
"Peter Piper picked a peck of pickled peppers",medium,B1
"How much wood would a woodchuck chuck if a woodchuck could chuck wood",hard,B2`}
              </pre>
            </div>
          </div>
        </div>

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

      {/* Batch Upload Section */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📤 Batch Upload via CSV</h2>

        <div className="space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={() => downloadCSVTemplate('tonguetwisters_template.csv', TONGUETWISTERS_CSV_HEADERS)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              📥 Download CSV Template
            </button>

            <label className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition cursor-pointer flex items-center gap-2">
              📁 Upload CSV File
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={csvLoading}
                className="hidden"
              />
            </label>
          </div>

          {csvMessage && (
            <div
              className={`p-4 rounded-lg text-sm ${
                csvMessage.includes('✅')
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              {csvMessage}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-white mb-2">CSV Format Example:</p>
            <code className="block bg-slate-200 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto">
text,difficulty,level
"She sells seashells by the seashore",easy,A2
"How much wood would a woodchuck chuck",hard,C1
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
