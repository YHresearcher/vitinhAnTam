import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export function Logo({ className = 'h-10 w-auto', variant = 'light' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Stitch Shield Icon */}
      <div className="relative w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white"
        >
          <path
            d="M12 2l7 3.5v5.5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5.5L12 2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold text-base tracking-tight ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            VI TÍNH
          </span>
          <span className="font-extrabold text-base tracking-tight text-blue-600">
            AN TÂM
          </span>
        </div>
        <span className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Bán bằng tâm để bạn an tâm
        </span>
      </div>
    </div>
  );
}
