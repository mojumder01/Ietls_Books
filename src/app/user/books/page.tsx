'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Book } from '@/types';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'books'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Book[];
        setBooks(data);
        setFiltered(data);

        const uniqueTypes = Array.from(new Set(data.map((b) => b.type))).filter(Boolean);
        setTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedType === 'all') {
      setFiltered(books);
    } else {
      setFiltered(books.filter((b) => b.type === selectedType));
    }
  }, [selectedType, books]);

  if (loading) {
    return <div className="p-6">Loading books...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📚 Books Library</h1>

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedType === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
          }`}
        >
          All ({books.length})
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedType === type
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book) => (
          <div key={book.id} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            <div className="bg-indigo-100 dark:bg-indigo-900/20 h-32 flex items-center justify-center">
              <span className="text-4xl">📖</span>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{book.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">by {book.author}</p>

              {book.description && (
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
                  {book.description}
                </p>
              )}

              <div className="mb-4">
                <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded">
                  {book.type}
                </span>
              </div>

              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
              >
                View PDF
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No books available yet</p>
        </div>
      )}
    </div>
  );
}
