'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'user'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">👥 Users Management</h1>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {user.joinDate?.toDate?.().toLocaleDateString() || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-medium">
                    Beginner
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No users yet</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Total Users: <span className="font-bold">{users.length}</span>
        </p>
      </div>
    </div>
  );
}
