'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { downloadCSVTemplate, parseCSV, PRONUNCIATION_CSV_HEADERS } from '@/utils/csvUtils';

export default function PronunciationManagement() {
  const [formData, setFormData] = useState({
    title: '',
    explanation: '',
    audioUrl: '',
    examples: '',
    tips: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pronunciationItems, setPronunciationItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchPronunciationItems();
  }, []);

  const fetchPronunciationItems = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'pronunciation_words'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setPronunciationItems(items);
    } catch (error: any) {
      console.error('Error fetching pronunciation items:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this pronunciation word?')) return;

    try {
      await deleteDoc(doc(db, 'pronunciation_words', itemId));
      setPronunciationItems(pronunciationItems.filter(item => item.id !== itemId));
      setMessage('✅ Pronunciation word deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error deleting word: ${error.message}`);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'pronunciation_words', itemId), editFormData);
      setPronunciationItems(pronunciationItems.map(item =>
        item.id === itemId ? { ...item, ...editFormData } : item
      ));
      setEditingId(null);
      setMessage('✅ Pronunciation word updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error updating word: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const examplesArray = formData.examples
        .split('\n')
        .filter((ex) => ex.trim())
        .map((ex) => ex.trim());

      const tipsArray = formData.tips
        .split('\n')
        .filter((tip) => tip.trim())
        .map((tip) => tip.trim());

      await addDoc(collection(db, 'pronunciation_lessons'), {
        title: formData.title,
        explanation: formData.explanation,
        audioUrl: formData.audioUrl,
        examples: examplesArray,
        tips: tipsArray,
        createdAt: new Date(),
      });

      setMessage('✅ Pronunciation lesson added!');
      setFormData({
        title: '',
        explanation: '',
        audioUrl: '',
        examples: '',
        tips: '',
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
          await addDoc(collection(db, 'pronunciation_words'), {
            word: row.word || '',
            pronunciation: row.pronunciation || '',
            meaning: row.meaning || '',
            level: row.level || 'A1',
            createdAt: new Date(),
          });
          successCount++;
        } catch (error) {
          console.error('Error adding document:', error);
        }
      }

      setCsvMessage(`✅ Successfully added ${successCount} pronunciation words from CSV!`);
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
        🔊 Manage Pronunciation Lessons
      </h1>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Lesson Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., 'TH Sound - Voiced vs Unvoiced'"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Explanation
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain the pronunciation rule or technique..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Audio URL (optional)
            </label>
            <input
              type="url"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              placeholder="https://example.com/audio.mp3"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Examples (one per line)
            </label>
            <textarea
              value={formData.examples}
              onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
              placeholder="this
that
thread"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tips (one per line)
            </label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Place your tongue between your teeth
Practice slowly first"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={4}
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
            {loading ? 'Adding...' : 'Add Pronunciation Lesson'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Batch Upload CSV</h2>

          <div className="space-y-4">
            <button
              onClick={() => downloadCSVTemplate('pronunciation_template.csv', PRONUNCIATION_CSV_HEADERS)}
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
{`word,pronunciation,meaning,level
"thought","/θɔːt/","past tense of think",B1
"through","/θruː/","preposition indicating movement",A2
"though","/ðoʊ/","even though",B1`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Pronunciation Words */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Manage Pronunciation Words</h2>

        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Total Words: <span className="font-bold text-slate-900 dark:text-white">{pronunciationItems.length}</span>
        </div>

        {dataLoading ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading pronunciation words...</div>
        ) : pronunciationItems.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">No pronunciation words yet. Add some by uploading a CSV file.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-600">
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Word</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Pronunciation</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Meaning</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Level</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pronunciationItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    {editingId === item.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.word || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, word: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.pronunciation || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, pronunciation: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.meaning || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, meaning: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editFormData.level || 'A1'}
                            onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                            className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          >
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                            <option value="C1">C1</option>
                            <option value="C2">C2</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 space-x-2 flex">
                          <button
                            onClick={() => handleUpdateItem(item.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold rounded transition"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.word}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.pronunciation}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.meaning}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs font-semibold">
                            {item.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-2 flex">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
