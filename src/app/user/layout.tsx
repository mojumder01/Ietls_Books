'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';

function NavLink({ href, label, isActive, onClick }: { href: string; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2 rounded-lg transition font-medium ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
      }`}
    >
      {label}
    </Link>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        router.push('/login');
      } else {
        setUser(authUser);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          console.log('User document exists:', userDoc.exists());
          if (userDoc.exists()) {
            console.log('User data:', userDoc.data());
            console.log('User role:', userDoc.data().role);
            if (userDoc.data().role === 'admin') {
              console.log('Setting admin to true');
              setIsAdmin(true);
            }
          } else {
            console.log('User document does not exist for UID:', authUser.uid);
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

        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          <NavLink href="/user/dashboard" label="📊 Dashboard" isActive={isActive("/user/dashboard")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/vocabulary" label="🔤 Vocabulary" isActive={isActive("/user/vocabulary")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/grammar" label="📐 Grammar" isActive={isActive("/user/grammar")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/reading" label="📖 Reading" isActive={isActive("/user/reading")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/listening" label="🎧 Listening" isActive={isActive("/user/listening")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/writing" label="✍️ Writing" isActive={isActive("/user/writing")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/speaking" label="🗣️ Speaking" isActive={isActive("/user/speaking")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/dictionary" label="📚 Dictionary" isActive={isActive("/user/dictionary")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/books" label="📕 Books" isActive={isActive("/user/books")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/spelling" label="✏️ Spelling" isActive={isActive("/user/spelling")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/pronunciation" label="🔊 Pronunciation" isActive={isActive("/user/pronunciation")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/tongue-twisters" label="🌪️ Tongue Twisters" isActive={isActive("/user/tongue-twisters")} onClick={() => setIsOpen(false)} />
          <NavLink href="/user/leaderboard" label="🏆 Leaderboard" isActive={isActive("/user/leaderboard")} onClick={() => setIsOpen(false)} />

          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-200 dark:border-slate-700"></div>
              <div className="px-4 py-2 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Admin
              </div>
              <NavLink href="/admin" label="⚙️ Admin Panel" isActive={isActive("/admin")} onClick={() => setIsOpen(false)} />
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
