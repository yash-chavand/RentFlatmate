import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-darkBg dark:text-gray-100">
      {/* Left panel: Info & brand (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-700 to-indigo-900 p-12 text-white lg:flex">
        {/* Decorative blur elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]"></div>

        <div className="relative z-10">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            RentSync
          </Link>
        </div>

        <div className="relative z-10 max-w-md animate-float">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Find the perfect flatmate match.
          </h1>
          <p className="mt-4 text-primary-100/90 font-medium">
            RentSync uses AI-powered matchmaking to score compatibility between owners, listings, and tenants. Keep your search stress-free.
          </p>
        </div>

        <div className="relative z-10 text-xs text-primary-200/80">
          © {new Date().getFullYear()} RentSync. AI-powered flatmate matching.
        </div>
      </div>

      {/* Right panel: Form container */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 sm:px-12 lg:px-20 relative">
        {/* Theme toggle in top right */}
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-darkBorder dark:bg-darkCard">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
