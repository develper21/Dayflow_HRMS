'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({
  children,
  variant = 'primary',
  size = 'md',
  className
}: StatusBadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-600'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending' | 'present' | 'absent' | 'leave';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  size = 'md',
  className
}: StatusIndicatorProps) {
  const statusConfig = {
    active: { color: 'green', text: 'Active' },
    inactive: { color: 'gray', text: 'Inactive' },
    pending: { color: 'yellow', text: 'Pending' },
    present: { color: 'green', text: 'Present' },
    absent: { color: 'red', text: 'Absent' },
    leave: { color: 'blue', text: 'On Leave' }
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        `bg-${config.color}-100 text-${config.color}-800`,
        sizeClasses[size],
        className
      )}
    >
      {config.text}
    </span>
  );
}

interface CountBadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CountBadge({
  count,
  maxCount = 99,
  variant = 'primary',
  size = 'sm',
  className
}: CountBadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    danger: 'bg-red-600 text-white'
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {displayCount}
    </span>
  );
}

// Legacy exports for backward compatibility
export default StatusBadge;
