'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        router.push('/login');
      } else {
        setUser(authUser);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-50 w-64 h-screen bg-white dark:bg-slate-800 shadow-lg transition-transform duration-300`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">🎓 IELTS</h1>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/user/dashboard"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/user/vocabulary"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            🔤 Vocabulary
          </Link>
          <Link
            href="/user/grammar"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            📐 Grammar
          </Link>
          <Link
            href="/user/reading"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            📖 Reading
          </Link>
          <Link
            href="/user/listening"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            🎧 Listening
          </Link>
          <Link
            href="/user/writing"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            ✍️ Writing
          </Link>
          <Link
            href="/user/speaking"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            🗣️ Speaking
          </Link>
          <Link
            href="/user/dictionary"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            📚 Dictionary
          </Link>
          <Link
            href="/user/books"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            📕 Books
          </Link>
          <Link
            href="/user/spelling"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            ✏️ Spelling
          </Link>
          <Link
            href="/user/pronunciation"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            🔊 Pronunciation
          </Link>
          <Link
            href="/user/tongue-twisters"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            🌪️ Tongue Twisters
          </Link>
          <Link
            href="/user/leaderboard"
            className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            🏆 Leaderboard
          </Link>

          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-200 dark:border-slate-700"></div>
              <div className="px-4 py-2 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Admin
              </div>
              <Link
                href="/admin"
                className="block px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition font-semibold"
              >
                ⚙️ Admin Panel
              </Link>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 shadow p-4 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="flex-1 text-center">
            <p className="text-slate-600 dark:text-slate-400">Welcome, {user.email}</p>
          </div>
          <div></div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
