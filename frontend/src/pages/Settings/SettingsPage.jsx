import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Bell, Lock, Shield, Eye } from 'lucide-react';

export const SettingsPage = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Settings updated successfully!');
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure account preferences and security options.</p>
      </div>

      <Card>
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {message && (
            <div className="rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-700">
              {message}
            </div>
          )}

          {/* Section: Notifications */}
          <div>
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2 border-b border-gray-50 pb-2 dark:border-darkBorder">
              <Bell size={16} className="text-primary-500" /> Notifications Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email Notifications</div>
                  <p className="text-xs text-gray-400 mt-1">Receive high compatibility matches and accepted interest updates via email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Push Notifications</div>
                  <p className="text-xs text-gray-400 mt-1">Get real-time alerts inside the app on new comments or message sends.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Privacy */}
          <div>
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2 border-b border-gray-50 pb-2 dark:border-darkBorder">
              <Shield size={16} className="text-primary-500" /> Privacy & Visibility
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Public Profile Visibility</div>
                <p className="text-xs text-gray-400 mt-1">Allow owners or tenants to view your personal biography before matching.</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Password placeholder section */}
          <div>
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2 border-b border-gray-50 pb-2 dark:border-darkBorder">
              <Lock size={16} className="text-primary-500" /> Account Security
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Change Password
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="password"
                    disabled
                    placeholder="Current Password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs bg-gray-50 cursor-not-allowed dark:border-darkBorder dark:bg-darkBg dark:text-gray-400"
                  />
                  <input
                    type="password"
                    disabled
                    placeholder="New Password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs bg-gray-50 cursor-not-allowed dark:border-darkBorder dark:bg-darkBg dark:text-gray-400"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1.5 block">Password changing is locked in demonstration mode.</span>
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Save System Settings
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default SettingsPage;
