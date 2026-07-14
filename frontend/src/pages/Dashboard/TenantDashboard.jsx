import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as interestService from '../../services/interest.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Sparkles, MessageSquare, Compass, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const TenantDashboard = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      const data = await interestService.getSentInterests();
      setInterests(data || []);
    } catch (err) {
      console.error('Failed to fetch tenant dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const handleCancelInterest = async (id) => {
    if (window.confirm('Are you sure you want to cancel this interest request?')) {
      try {
        await interestService.cancelInterest(id);
        setInterests((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error('Failed to cancel interest request', err);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'REJECTED':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusColors = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
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
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Tenant Console</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your sent requests and matches.</p>
        </div>
        <Link to="/listings">
          <Button className="gap-2">
            <Compass size={16} /> Explore Listings
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sent Interests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-darkBorder">
            <Send size={18} className="text-primary-500" />
            <h2 className="font-extrabold text-lg bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">Sent Interest Requests ({interests.length})</h2>
          </div>

          {interests.length === 0 ? (
            <Card className="text-center py-16">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You haven't shown interest in any flats or rooms yet.
              </p>
              <Link to="/listings">
                <Button variant="secondary">Browse Listings</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {interests.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between sm:flex-row sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{item.listing?.title}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusColors(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Location:</strong> {item.listing?.location} | <strong>Rent:</strong> ₹{item.listing?.rent}/mo
                    </p>
                    <p className="text-xs text-gray-400 italic">
                      My message: "{item.message || 'I am interested in this room.'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'ACCEPTED' ? (
                      <Link to="/chat">
                        <Button className="text-xs py-2 h-auto gap-1">
                          <MessageSquare size={14} /> Open Chat
                        </Button>
                      </Link>
                    ) : null}
                    {item.status === 'PENDING' ? (
                      <Button
                        onClick={() => handleCancelInterest(item.id)}
                        variant="secondary"
                        className="text-xs py-2 h-auto hover:text-red-500"
                      >
                        Cancel Request
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-darkBorder">
            <Sparkles size={18} className="text-primary-500" />
            <h2 className="font-bold text-lg">AI Compatibility</h2>
          </div>

          <Card className="bg-gradient-to-br from-primary-900/10 to-indigo-900/5 border-primary-500/10">
            <h3 className="font-bold text-sm text-primary-800 dark:text-primary-400 mb-2">How it works</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              When you view a listing detail, RentSync automatically compares your tenant profile preferences (budget, location, and move-in date) with the owner's property configuration. We run an analysis using Gemini AI to score and break down matches!
            </p>
            <Link to="/profile" className="text-xs text-primary-600 font-bold hover:underline dark:text-primary-400">
              Update Tenant Preferences →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default TenantDashboard;
