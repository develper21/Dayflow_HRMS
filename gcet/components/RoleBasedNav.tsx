'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredRoles?: string[];
}

export default function RoleBasedNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      requiredRoles: ['employee', 'hr', 'admin']
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      requiredRoles: ['employee', 'hr', 'admin']
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      requiredRoles: ['hr', 'admin']
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      requiredRoles: ['employee', 'hr', 'admin']
    },
    {
      name: 'Leave',
      href: '/leave',
      icon: Calendar,
      requiredRoles: ['employee', 'hr', 'admin']
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: DollarSign,
      requiredRoles: ['employee', 'hr', 'admin']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      requiredRoles: ['hr', 'admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      requiredRoles: ['admin']
    }
  ];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch {
      router.push('/auth/login');
    }
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.requiredRoles || (user && item.requiredRoles.includes(user.role))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                HRMS
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.firstName} {user.lastName}</span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <div className="text-base font-medium text-gray-800">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="mt-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
