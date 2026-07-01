import React from 'react';

interface FifaTrophyLogoProps {
  className?: string;
  showText?: boolean;
}

export default function FifaTrophyLogo({ className = 'w-8 h-8', showText = false }: FifaTrophyLogoProps) {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      {/* Sleek, minimalist geometric trophy icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-indigo-400"
      >
        {/* Base */}
        <path
          d="M6 20H18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stand stem */}
        <path
          d="M12 17V20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main Cup Body */}
        <path
          d="M12 17C15.3137 17 18 14.3137 18 11V4H6V11C6 14.3137 8.68629 17 12 17Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left handle */}
        <path
          d="M6 7H4V10C4 11.5 5 12.5 6 12.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right handle */}
        <path
          d="M18 7H20V10C20 11.5 19 12.5 18 12.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase ml-2 font-mono">
          PANEL
        </span>
      )}
    </div>
  );
}
