'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import TopBar from './topbar';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  profilePictureUrl?: string;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (requireAuth) {
          router.push('/auth/login');
        }
      } catch (error) {
        if (requireAuth) {
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (requireAuth) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [router, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        {requireAuth && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            className="hidden md:block"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          {requireAuth && <TopBar user={user || undefined} />}

          {/* Page Content */}
          <main className={`flex-1 ${requireAuth ? 'p-6' : ''}`}>
            <div className={`${requireAuth ? 'max-w-7xl mx-auto' : ''}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
