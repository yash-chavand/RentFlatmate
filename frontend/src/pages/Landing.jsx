import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Landing = () => {
  return (
    <div className="relative isolate overflow-hidden bg-gray-50 dark:bg-darkBg">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden blur-3xl">
        <div className="absolute top-1/4 left-1/4 h-80 w-[40rem] -translate-x-1/2 rotate-12 bg-gradient-to-tr from-pink-500 to-purple-600 opacity-15 dark:opacity-25 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 h-80 w-[35rem] translate-x-1/2 -rotate-12 bg-gradient-to-tr from-cyan-400 to-indigo-600 opacity-15 dark:opacity-20 rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/2 h-64 w-[30rem] -translate-x-1/2 bg-gradient-to-tr from-yellow-400 to-orange-500 opacity-10 dark:opacity-15 rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold tracking-tight text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 mb-6">
            <Sparkles size={14} /> AI-Powered Flatmate Matching
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl max-w-3xl mx-auto leading-[1.1]">
            Find Your Next Flatmate with{' '}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Confidence & Ease
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Calculate compatibility scores instantly. RentSync matches tenant preferences with listing features using Gemini AI, making flatmate hunting simple and stress-free.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/listings">
              <Button className="gap-2">
                Browse Listings <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">List Your Room</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-darkBorder">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Search Smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to find a home.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900 dark:text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <Sparkles size={20} />
                </div>
                AI Compatibility Scoring
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  Get a personalized compatibility score matching your budget, location, and move-in date to listing features, parsed instantly.
                </p>
              </dd>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900 dark:text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <MessageSquare size={20} />
                </div>
                Direct Live Chats
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  Once an owner accepts your interest request, a 1:1 chatroom is established. Connect in real time with our WebSockets.
                </p>
              </dd>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900 dark:text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <ShieldCheck size={20} />
                </div>
                Secure & Verified
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  Owners can upload verification credentials. User registration and cookie sessions are securely hashed and scoped.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
export default Landing;
