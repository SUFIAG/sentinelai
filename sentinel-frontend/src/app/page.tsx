'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          router.replace('/login');
          return;
        }
        
        // Validate token with backend
        const response = await fetch('http://localhost:8081/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Organization-Id': '550e8400-e29b-41d4-a716-446655440000'
          }
        });

        if (response.ok) {
          router.replace('/dashboard');
        } else {
          // Token invalid, clear and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, assume token invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    }
    
    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-[#8CCF00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

