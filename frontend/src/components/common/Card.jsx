import React from 'react';

export const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-darkBorder dark:bg-darkCard ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
