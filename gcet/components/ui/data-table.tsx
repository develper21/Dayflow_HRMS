'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DataTableProps {
  children: ReactNode;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  bordered?: boolean;
}

export default function DataTable({
  children,
  className,
  striped = false,
  hover = false,
  compact = false,
  bordered = true
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table
        className={cn(
          'w-full',
          striped && 'divide-y divide-gray-200',
          hover && 'hover:divide-gray-300',
          compact ? 'text-sm' : 'text-base',
          className
        )}
      >
        {children}
      </table>
    </div>
  );
}

interface DataTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DataTableHeader({
  children,
  className
}: DataTableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50', className)}>
      <tr>{children}</tr>
    </thead>
  );
}

interface DataTableHeaderCellProps {
  children: ReactNode;
  className?: string;
}

export function DataTableHeaderCell({
  children,
  className
}: DataTableHeaderCellProps) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
}

interface DataTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
}

interface DataTableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function DataTableRow({
  children,
  className,
  hover = true,
  onClick
}: DataTableRowProps) {
  return (
    <tr
      className={cn(
        hover && 'hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: ReactNode;
  className?: string;
}

export function DataTableCell({
  children,
  className
}: DataTableCellProps) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
      {children}
    </td>
  );
}

interface DataTableEmptyProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function DataTableEmpty({
  title,
  description,
  icon,
  action,
  className
}: DataTableEmptyProps) {
  return (
    <div className={cn('px-12 py-8 text-center', className)}>
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
}
