'use client';

import { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vocabulary } from '@/types';
import { downloadCSVTemplate, parseCSV, VOCABULARY_CSV_HEADERS } from '@/utils/csvUtils';

export default function VocabularyManagement() {
  const [formData, setFormData] = useState<Partial<Vocabulary>>({
    word: '',
    bengaliMeaning: '',
    pronunciation: '',
    example: '',
    exampleBengali: '',
    difficulty: 'medium',
    level: 'B1',
    partOfSpeech: '',
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setMessage('❌ No valid data found in CSV');
        setCsvLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          await addDoc(collection(db, 'vocabulary'), {
            word: row.word || '',
            bengaliMeaning: row.bengaliMeaning || '',
            pronunciation: row.pronunciation || '',
            example: row.example || '',
            exampleBengali: row.exampleBengali || '',
            difficulty: row.difficulty || 'medium',
            level: row.level || 'B1',
            partOfSpeech: row.partOfSpeech || '',
            tags: [],
            createdAt: new Date(),
          });
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      setMessage(`✅ Uploaded ${successCount} words${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'vocabulary'), {
        ...formData,
        createdAt: new Date(),
      });

      setMessage('✅ Vocabulary added successfully!');
      setFormData({
        word: '',
        bengaliMeaning: '',
        pronunciation: '',
        example: '',
        exampleBengali: '',
        difficulty: 'medium',
        level: 'B1',
        partOfSpeech: '',
        tags: [],
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
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📚 Manage Vocabulary</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add New Word</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Word
              </label>
              <input
                type="text"
                value={formData.word || ''}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bangla Meaning
              </label>
              <input
                type="text"
                value={formData.bengaliMeaning || ''}
                onChange={(e) => setFormData({ ...formData, bengaliMeaning: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pronunciation
              </label>
              <input
                type="text"
                value={formData.pronunciation || ''}
                onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Example Sentence
              </label>
              <textarea
                value={formData.example || ''}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Example (Bangla)
              </label>
              <textarea
                value={formData.exampleBengali || ''}
                onChange={(e) => setFormData({ ...formData, exampleBengali: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty || 'medium'}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Level
                </label>
                <select
                  value={formData.level || 'B1'}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Part of Speech
              </label>
              <input
                type="text"
                value={formData.partOfSpeech || ''}
                onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., noun, verb, adjective"
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
              {loading ? 'Adding...' : 'Add Vocabulary'}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Instructions</h2>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Form Guidelines:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Word: English word to add</li>
                <li>Bangla Meaning: Bengali translation</li>
                <li>Pronunciation: IPA or phonetic spelling</li>
                <li>Examples: Real usage examples</li>
                <li>Difficulty: Easy/Medium/Hard for learners</li>
                <li>Level: IELTS level (A1-C2)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Batch Upload:</h3>
              <p>
                To add multiple words quickly, prepare a CSV file with columns:
                word, bengaliMeaning, pronunciation, example, exampleBengali, difficulty,
                level, partOfSpeech
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tips:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Use clear, simple examples</li>
                <li>Include both English and Bangla examples</li>
                <li>Ensure pronunciation is accurate</li>
                <li>Tag related words for easy discovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Upload Section */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📤 Batch Upload via CSV</h2>

        <div className="space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={() => downloadCSVTemplate('vocabulary_template.csv', VOCABULARY_CSV_HEADERS)}
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

          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.includes('✅')
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-white mb-2">CSV Format Example:</p>
            <code className="block bg-slate-200 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto">
word,bengaliMeaning,pronunciation,example,exampleBengali,difficulty,level,partOfSpeech
exemplify,উদাহরণ দেওয়া,ɪɡˈzɛmpləˌfaɪ,This story exemplifies bravery,এই গল্পটি সাহসিকতার উদাহরণ দেয়,medium,B2,verb
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
