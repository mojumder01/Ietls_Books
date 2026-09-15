'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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

  const [vocabularyItems, setVocabularyItems] = useState<(Vocabulary & { id: string })[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Vocabulary>>({});

  useEffect(() => {
    fetchVocabularyItems();
  }, []);

  const fetchVocabularyItems = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'vocabulary'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        ...doc.data() as Vocabulary,
        id: doc.id
      }));
      setVocabularyItems(items);
    } catch (error: any) {
      console.error('Error fetching vocabulary items:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) return;

    try {
      await deleteDoc(doc(db, 'vocabulary', itemId));
      setVocabularyItems(vocabularyItems.filter(item => item.id !== itemId));
      setMessage('✅ Vocabulary item deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error deleting item: ${error.message}`);
    }
  };

  const handleEditItem = (item: Vocabulary & { id: string }) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'vocabulary', itemId), editFormData);
      setVocabularyItems(vocabularyItems.map(item =>
        item.id === itemId ? { ...item, ...editFormData } : item
      ));
      setEditingId(null);
      setMessage('✅ Vocabulary item updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error updating item: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

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

      {/* Manage Vocabulary Items */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Manage Vocabulary Items</h2>

        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Total Items: <span className="font-bold text-slate-900 dark:text-white">{vocabularyItems.length}</span>
        </div>

        {dataLoading ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading vocabulary items...</div>
        ) : vocabularyItems.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">No vocabulary items yet. Add some using the form above or upload a CSV file.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-600">
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Word</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Bengali</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Pronunciation</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Difficulty</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Level</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vocabularyItems.map((item) => (
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
                            value={editFormData.bengaliMeaning || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, bengaliMeaning: e.target.value })}
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
                          <select
                            value={editFormData.difficulty || 'medium'}
                            onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value as any })}
                            className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editFormData.level || 'B1'}
                            onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value as any })}
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
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.bengaliMeaning}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.pronunciation}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {item.difficulty}
                          </span>
                        </td>
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
