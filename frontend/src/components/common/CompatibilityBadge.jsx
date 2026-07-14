import React from 'react';

export const CompatibilityBadge = ({ score, className = '' }) => {
  const getBadgeColors = () => {
    if (score >= 80) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
    }
    if (score >= 50) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    }
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-tight shadow-sm ${getBadgeColors()} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {score}% Match
    </span>
  );
};
