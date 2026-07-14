import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Users, FileText, Activity, ShieldAlert, Trash2, UserX } from 'lucide-react';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, listingsRes, logsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/logs'),
      ]);
      setUsers(usersRes.data.data.users || usersRes.data.data || []);
      setListings(listingsRes.data.data.listings || listingsRes.data.data || []);
      setLogs(logsRes.data.data.logs || logsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeactivateUser = async (id, currentStatus) => {
    const actionText = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${actionText} this user?`)) {
      try {
        await api.patch(`/admin/users/${id}/deactivate`, { isActive: !currentStatus });
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
        );
        fetchAdminData(); // refresh logs
      } catch (err) {
        console.error('Failed to update user active status', err);
      }
    }
  };

  const handleForceDeleteListing = async (id) => {
    if (window.confirm('Are you sure you want to FORCE delete this listing? This action is permanent.')) {
      try {
        await api.delete(`/admin/listings/${id}`);
        setListings((prev) => prev.filter((l) => l.id !== id));
        fetchAdminData(); // refresh logs
      } catch (err) {
        console.error('Failed to delete listing', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Admin Console</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">System management, auditing, and platform control.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Registered Users</div>
            <div className="text-2xl font-black">{users.length}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Listings</div>
            <div className="text-2xl font-black">{listings.length}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Logged Actions</div>
            <div className="text-2xl font-black">{logs.length}</div>
          </div>
        </Card>
      </div>

      {/* Grid: User Control & Listing Control */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Management */}
        <Card className="flex flex-col h-full">
          <h2 className="text-base font-extrabold mb-4 border-b border-gray-50 pb-2 dark:border-darkBorder flex items-center gap-2">
            <Users size={18} className="text-primary-500" /> User Management
          </h2>
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 dark:border-darkBorder">
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider">Name</th>
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider">Role</th>
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-darkBorder">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 font-medium">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3 font-bold">{u.role}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        u.isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/20'
                      }`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          onClick={() => handleDeactivateUser(u.id, u.isActive)}
                          variant="secondary"
                          className="px-2 py-1 h-auto text-[10px] gap-1 hover:text-red-500"
                        >
                          <UserX size={12} /> {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Listings Moderation */}
        <Card className="flex flex-col h-full">
          <h2 className="text-base font-extrabold mb-4 border-b border-gray-50 pb-2 dark:border-darkBorder flex items-center gap-2">
            <ShieldAlert size={18} className="text-primary-500" /> Listing Moderation
          </h2>
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 dark:border-darkBorder">
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider">Title</th>
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider">Rent</th>
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-2 pb-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-darkBorder">
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 font-medium">
                      <div className="line-clamp-1">{l.title}</div>
                      <div className="text-[10px] text-gray-400">{l.location}</div>
                    </td>
                    <td className="py-3 font-black">${l.rent}</td>
                    <td className="py-3 uppercase font-bold">{l.status}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleForceDeleteListing(l.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <h2 className="text-base font-extrabold mb-4 border-b border-gray-50 pb-2 dark:border-darkBorder flex items-center gap-2">
          <Activity size={18} className="text-primary-500" /> Platform Audit Logs
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">No logs found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg border border-gray-50 p-3 text-xs dark:border-darkBorder bg-gray-50/30 dark:bg-darkCard/30">
                <div>
                  <span className="font-bold text-primary-600 dark:text-primary-400 mr-2 uppercase tracking-wide">
                    {log.action}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    on target: <strong>{log.target}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 shrink-0">
                  <span>Actor: {log.actor?.name || 'System'}</span>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
export default AdminDashboard;
