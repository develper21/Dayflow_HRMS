'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EnterpriseCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export default function EnterpriseCard({
  children,
  className,
  hover = false,
  padding = 'md',
  border = true,
  shadow = 'sm'
}: EnterpriseCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg',
        border && 'border border-gray-200',
        shadowClasses[shadow],
        hover && 'hover:shadow-md transition-shadow duration-200',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface EnterpriseCardHeaderProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function EnterpriseCardHeader({ children, className, border = true }: EnterpriseCardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        border && 'pb-4 mb-4 border-b border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}

interface EnterpriseCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function EnterpriseCardTitle({ children, className }: EnterpriseCardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
}

interface EnterpriseCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function EnterpriseCardDescription({ children, className }: EnterpriseCardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)}>
      {children}
    </p>
  );
}

interface EnterpriseCardContentProps {
  children: ReactNode;
  className?: string;
}

export function EnterpriseCardContent({ children, className }: EnterpriseCardContentProps) {
  return (
    <div className={cn('text-gray-700', className)}>
      {children}
    </div>
  );
}

interface EnterpriseCardFooterProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function EnterpriseCardFooter({ children, className, border = true }: EnterpriseCardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        border && 'pt-4 mt-4 border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}
