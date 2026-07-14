import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import { Sun, Moon, Bell, Menu, X, LogOut, User as UserIcon, Settings as SettingsIcon, MessageSquare, Search } from 'lucide-react';

export const MainLayout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-darkBg dark:text-gray-100">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-darkBorder dark:bg-darkCard/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary-600 dark:text-primary-500">
              <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-indigo-400">
                RentSync
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/listings" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                <Search size={16} /> Search Listings
              </Link>
              {isAuthenticated && (
                <>
                  <Link to={user.role === 'OWNER' ? '/owner/dashboard' : '/tenant/dashboard'} className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                    Dashboard
                  </Link>
                  <Link to="/chat" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                    <MessageSquare size={16} /> Chats
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-darkBorder dark:bg-darkCard">
                      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 pb-2 dark:border-darkBorder">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-gray-400">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 text-xs transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                !n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{n.title}</span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400">{n.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 hover:bg-gray-50 dark:border-darkBorder dark:hover:bg-gray-800"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      <UserIcon size={16} />
                    </div>
                    <span className="hidden text-sm font-medium sm:block">{user.name}</span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-darkBorder dark:bg-darkCard">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <UserIcon size={16} /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <SettingsIcon size={16} /> Settings
                      </Link>
                      <hr className="my-1 border-gray-100 dark:border-darkBorder" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-sm font-semibold hover:text-primary-500">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="border-t border-gray-200 bg-white px-4 py-2 shadow-inner dark:border-darkBorder dark:bg-darkCard md:hidden">
            <nav className="flex flex-col gap-2">
              <Link
                to="/listings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Search size={18} /> Search Listings
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={user.role === 'OWNER' ? '/owner/dashboard' : '/tenant/dashboard'}
                    onClick={() => setShowMobileMenu(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <MessageSquare size={18} /> Chats
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 dark:border-darkBorder">
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex justify-center rounded-lg border border-gray-200 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-darkBorder"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex justify-center rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 dark:border-darkBorder dark:bg-darkCard">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RentSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
