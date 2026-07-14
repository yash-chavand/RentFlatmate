import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, User, Settings, FileText, Home, MessageSquare } from 'lucide-react';
import { MainLayout } from './MainLayout';

export const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getSidebarLinks = () => {
    const common = [
      { to: '/profile', label: 'My Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ];

    if (user?.role === 'OWNER') {
      return [
        { to: '/owner/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/listings', label: 'Search Listings', icon: Home },
        { to: '/chat', label: 'My Chats', icon: MessageSquare },
        ...common,
      ];
    } else if (user?.role === 'TENANT') {
      return [
        { to: '/tenant/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/listings', label: 'Search Listings', icon: Home },
        { to: '/chat', label: 'My Chats', icon: MessageSquare },
        ...common,
      ];
    } else if (user?.role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Admin Console', icon: LayoutDashboard },
        { to: '/profile', label: 'My Profile', icon: User },
        { to: '/settings', label: 'Settings', icon: Settings },
      ];
    }

    return common;
  };

  const links = getSidebarLinks();

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-darkBorder dark:bg-darkCard">
              {/* User summary card */}
              <div className="mb-6 flex flex-col items-center border-b border-gray-100 pb-6 text-center dark:border-darkBorder">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-bold text-base leading-tight">{user?.name}</h2>
                <span className="mt-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary-700 uppercase dark:bg-primary-950/30 dark:text-primary-400">
                  {user?.role}
                </span>
                <p className="mt-1 text-[11px] text-gray-400">{user?.email}</p>
              </div>

              {/* Sidebar Menu */}
              <nav className="flex flex-col gap-1.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/10 dark:text-primary-400'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content pane */}
          <div className="min-w-0 flex-1">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
