'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { downloadCSVTemplate, parseCSV, BOOKS_CSV_HEADERS } from '@/utils/csvUtils';

export default function BooksManagement() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pdfUrl: '',
    type: 'Cambridge',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [bookItems, setBookItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setBookItems(items);
    } catch (error: any) {
      console.error('Error fetching books:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await deleteDoc(doc(db, 'books', itemId));
      setBookItems(bookItems.filter(item => item.id !== itemId));
      setMessage('✅ Book deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error deleting book: ${error.message}`);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'books', itemId), editFormData);
      setBookItems(bookItems.map(item =>
        item.id === itemId ? { ...item, ...editFormData } : item
      ));
      setEditingId(null);
      setMessage('✅ Book updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error updating book: ${error.message}`);
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
      let pdfUrl = formData.pdfUrl;

      if (pdfFile) {
        setUploadingPDF(true);
        const timestamp = Date.now();
        const fileName = `${timestamp}_${pdfFile.name}`;
        const storageRef = ref(storage, `books/${fileName}`);

        await uploadBytes(storageRef, pdfFile);
        pdfUrl = await getDownloadURL(storageRef);
        setUploadingPDF(false);
      }

      if (!pdfUrl) {
        setMessage('❌ Please provide either a PDF file or URL');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'books'), {
        title: formData.title,
        author: formData.author,
        pdfUrl,
        type: formData.type,
        description: formData.description,
        createdAt: new Date(),
      });

      setMessage('✅ Book added successfully!');
      setFormData({
        title: '',
        author: '',
        pdfUrl: '',
        type: 'Cambridge',
        description: '',
      });
      setPdfFile(null);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      await fetchBooks();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      setUploadingPDF(false);
    } finally {
      setLoading(false);
    }
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
        setMessage('❌ No valid data found in CSV file');
        return;
      }

      let successCount = 0;
      for (const row of rows) {
        try {
          await addDoc(collection(db, 'books'), {
            title: row.title || '',
            author: row.author || '',
            description: row.description || '',
            difficulty: row.difficulty || 'medium',
            level: row.level || 'B1',
            coverUrl: row.coverUrl || '',
            createdAt: new Date(),
          });
          successCount++;
        } catch (error) {
          console.error('Error adding document:', error);
        }
      }

      setMessage(`✅ Successfully added ${successCount} books from CSV!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setMessage(''), 4000);
    } catch (error: any) {
      setMessage(`❌ Error processing CSV: ${error.message}`);
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📕 Manage Books</h1>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              PDF File or URL
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Upload PDF File:</label>
                <input
                  type="file"
                  accept=".pdf"
                  ref={pdfInputRef}
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  disabled={uploadingPDF}
                />
                {pdfFile && <p className="text-xs text-green-600 mt-1">✓ {pdfFile.name}</p>}
              </div>
              <div className="text-center text-slate-500 dark:text-slate-400">OR</div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">External PDF URL:</label>
                <input
                  type="url"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="https://example.com/book.pdf"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., Cambridge, Makkar, Rachel Mitchell"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            disabled={loading || uploadingPDF}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {uploadingPDF ? 'Uploading PDF...' : loading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>

      {/* Batch Upload Section */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📤 Batch Upload via CSV</h2>

        <div className="space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={() => downloadCSVTemplate('books_template.csv', BOOKS_CSV_HEADERS)}
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
title,author,description,difficulty,level,coverUrl
"Cambridge IELTS 17","Cambridge","Official IELTS exam practice",medium,B2,https://example.com/cover.jpg
            </code>
          </div>
        </div>
      </div>

      {/* Manage Books */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Manage Books</h2>

        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Total Books: <span className="font-bold text-slate-900 dark:text-white">{bookItems.length}</span>
        </div>

        {dataLoading ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading books...</div>
        ) : bookItems.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">No books yet. Add some using the form above or upload a CSV file.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-600">
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Title</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Author</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Type</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Description</th>
                  <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    {editingId === item.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.title || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.author || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editFormData.type || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={editFormData.description || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                            rows={2}
                          />
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
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.title}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.author}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded text-xs font-semibold">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 truncate max-w-xs">{item.description}</td>
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
