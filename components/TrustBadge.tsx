'use client';

import React from 'react';

interface TrustBadgeProps {
  label: string;
  variant: 'grade' | 'warranty' | 'test' | 'os' | 'support' | 'new' | 'used';
  size?: 'sm' | 'md';
}

const variantStyles: Record<TrustBadgeProps['variant'], string> = {
  grade: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warranty: 'bg-blue-50 text-blue-800 border-blue-200',
  test: 'bg-amber-50 text-amber-800 border-amber-200',
  os: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  support: 'bg-rose-50 text-rose-800 border-rose-200',
  new: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  used: 'bg-amber-50 text-amber-800 border-amber-200',
};

const variantIcons: Record<TrustBadgeProps['variant'], React.ReactNode> = {
  grade: <span className="w-3 h-3 bg-emerald-500 rounded-full" aria-hidden="true" />,
  warranty: <span className="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true" />,
  test: <span className="w-3 h-3 bg-amber-500 rounded-full" aria-hidden="true" />,
  os: <span className="w-3 h-3 bg-indigo-500 rounded-full" aria-hidden="true" />,
  support: <span className="w-3 h-3 bg-rose-500 rounded-full" aria-hidden="true" />,
  new: <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />,
  used: <span className="w-3 h-3 bg-amber-500 rounded-full" aria-hidden="true" />,
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export function TrustBadge({ label, variant, size = 'md' }: TrustBadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
      role="img"
      aria-label={label}
    >
      {variantIcons[variant]}
      <span>{label}</span>
    </span>
  );
}