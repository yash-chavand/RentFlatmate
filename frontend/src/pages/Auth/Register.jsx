import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/common/Button';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TENANT'); // DEFAULT
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({ name, email, password, role, phone: phone || undefined });
      if (user.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Find flatmates and rooms using AI matchmaking.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Role Selector (Owner / Tenant) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            I want to...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('TENANT')}
              className={`rounded-xl border py-3 text-sm font-semibold tracking-tight transition ${
                role === 'TENANT'
                  ? 'border-primary-600 bg-primary-50/50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/20 dark:text-primary-400'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-darkBorder dark:hover:bg-gray-800'
              }`}
            >
              Find a Flat / Flatmate
            </button>
            <button
              type="button"
              onClick={() => setRole('OWNER')}
              className={`rounded-xl border py-3 text-sm font-semibold tracking-tight transition ${
                role === 'OWNER'
                  ? 'border-primary-600 bg-primary-50/50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/20 dark:text-primary-400'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-darkBorder dark:hover:bg-gray-800'
              }`}
            >
              List a Flat / Room
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Password (min 8 characters)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          Create Account
        </Button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
export default Register;
