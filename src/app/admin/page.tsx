'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return <div>Redirecting to Admin Dashboard...</div>;
}
