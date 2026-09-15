'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { downloadCSVTemplate, parseCSV, SPEAKING_CSV_HEADERS } from '@/utils/csvUtils';

export default function SpeakingManagement() {
  const [formData, setFormData] = useState({
    topic: '',
    cueCard: '',
    difficulty: 'medium',
    timeLimit: 120,
    youtubeLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [speakingItems, setSpeakingItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchSpeakingItems();
  }, []);

  const fetchSpeakingItems = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'speaking_practices'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setSpeakingItems(items);
    } catch (error: any) {
      console.error('Error fetching speaking items:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this speaking prompt?')) return;

    try {
      await deleteDoc(doc(db, 'speaking_practices', itemId));
      setSpeakingItems(speakingItems.filter(item => item.id !== itemId));
      setMessage('✅ Speaking prompt deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error deleting item: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'speaking_practices'), {
        topic: formData.topic,
        cueCard: formData.cueCard,
        difficulty: formData.difficulty,
        timeLimit: parseInt(formData.timeLimit.toString()),
        youtubeLink: formData.youtubeLink,
        createdAt: new Date(),
      });

      setMessage('✅ Speaking cue card added!');
      setFormData({
        topic: '',
        cueCard: '',
        difficulty: 'medium',
        timeLimit: 120,
        youtubeLink: '',
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
          await addDoc(collection(db, 'speaking_practices'), {
            prompt: row.prompt || '',
            difficulty: row.difficulty || 'medium',
            level: row.level || 'B1',
            timeLimit: parseInt(row.timeLimit) || 120,
            createdAt: new Date(),
          });
          successCount++;
        } catch (error) {
          console.error('Error adding document:', error);
        }
      }

      setCsvMessage(`✅ Successfully added ${successCount} speaking prompts from CSV!`);
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
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">🗣️ Manage Speaking</h1>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cue Card
            </label>
            <textarea
              value={formData.cueCard}
              onChange={(e) => setFormData({ ...formData, cueCard: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Time Limit (sec)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Difficulty
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
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              YouTube Link (optional)
            </label>
            <input
              type="url"
              value={formData.youtubeLink}
              onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
            {loading ? 'Adding...' : 'Add Speaking Cue Card'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Batch Upload CSV</h2>

          <div className="space-y-4">
            <button
              onClick={() => downloadCSVTemplate('speaking_template.csv', SPEAKING_CSV_HEADERS)}
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
{`prompt,difficulty,level,timeLimit
"Describe a memorable holiday",medium,B1,120
"Talk about your favorite hobby",easy,A2,90
"Discuss environmental issues",hard,B2,180`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Speaking Items */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Manage Speaking Prompts</h2>

        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Total Prompts: <span className="font-bold text-slate-900 dark:text-white">{speakingItems.length}</span>
        </div>

        {dataLoading ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading speaking prompts...</div>
        ) : speakingItems.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">No speaking prompts yet. Add some using the form above or upload a CSV file.</div>
        ) : (
          <div className="space-y-3">
            {speakingItems.map((item) => (
              <div key={item.id} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-slate-900 dark:text-white font-medium">{item.topic}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-1">{item.cueCard}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded text-xs font-semibold whitespace-nowrap">{item.timeLimit}s</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      item.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {item.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition"
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
