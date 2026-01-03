'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Bell,
  Settings,
  FileText,
  BarChart,
  Building,
  UserCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'employees',
    label: 'Employees',
    href: '/employees',
    icon: Users,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    href: '/attendance',
    icon: Clock,
  },
  {
    id: 'leaves',
    label: 'Time Off',
    href: '/leave',
    icon: Calendar,
  },
  {
    id: 'payroll',
    label: 'Payroll',
    href: '/payroll',
    icon: DollarSign,
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: BarChart,
  },
  {
    id: 'documents',
    label: 'Documents',
    href: '/documents',
    icon: FileText,
  },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ className, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          "md:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed && "w-16",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">DF</span>
              </div>
              {!collapsed && (
                <span className="text-lg font-semibold text-gray-900">Dayflow</span>
              )}
            </div>
            {onCollapse && (
              <button
                onClick={() => onCollapse(!collapsed)}
                className="hidden md:flex p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleItemClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    active
                      ? "bg-blue-50 text-blue-700 border-l-3 border-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-5 w-5", collapsed ? "mx-0" : "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <Link
              href="/notifications"
              onClick={handleItemClick}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                pathname.startsWith('/notifications')
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Notifications" : undefined}
            >
              <Bell className={cn("h-5 w-5", collapsed ? "mx-0" : "mr-3")} />
              {!collapsed && (
                <>
                  <span className="flex-1">Notifications</span>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                    3
                  </span>
                </>
              )}
            </Link>
            
            <Link
              href="/settings"
              onClick={handleItemClick}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                pathname.startsWith('/settings')
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className={cn("h-5 w-5", collapsed ? "mx-0" : "mr-3")} />
              {!collapsed && <span className="flex-1">Settings</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
