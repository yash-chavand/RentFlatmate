import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { User, Sparkles, Home, DollarSign, Mic } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  
  // Profile state
  const [bio, setBio] = useState('');
  
  // Tenant Profile specific states
  const [preferredLocation, setPreferredLocation] = useState('');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(2000);
  const [moveInDate, setMoveInDate] = useState('');
  const [roomTypePreference, setRoomTypePreference] = useState('SINGLE');
  const [furnishedPref, setFurnishedPref] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Check if profile exists already
  const [profileExists, setProfileExists] = useState(false);

  // Speech Recognition voice bot states
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = voiceLang;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setBio((prev) => prev + finalTranscript);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        if (user.role === 'TENANT') {
          try {
            const res = await api.get('/tenants/profile');
            const profile = res.data.data;
            if (profile) {
              setProfileExists(true);
              setBio(profile.bio || '');
              setPreferredLocation(profile.preferredLocation || '');
              setBudgetMin(profile.budgetMin || 0);
              setBudgetMax(profile.budgetMax || 2000);
              setRoomTypePreference(profile.roomTypePreference || 'SINGLE');
              setFurnishedPref(profile.furnishedPref || false);
              if (profile.moveInDate) {
                setMoveInDate(new Date(profile.moveInDate).toISOString().split('T')[0]);
              }
            }
          } catch (err) {
            // Profile not created yet
            setProfileExists(false);
          }
        } else if (user.role === 'OWNER') {
          // Owner profile bio
          try {
            const meRes = await api.get('/auth/me');
            const profile = meRes.data.data.user.ownerProfile;
            if (profile) {
              setProfileExists(true);
              setBio(profile.bio || '');
            }
          } catch (err) {
            setProfileExists(false);
          }
        }
      } catch (err) {
        console.error('Failed to load profile details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (user.role === 'TENANT') {
        const payload = {
          preferredLocation,
          budgetMin: parseInt(budgetMin, 10),
          budgetMax: parseInt(budgetMax, 10),
          moveInDate: moveInDate ? new Date(moveInDate).toISOString() : new Date().toISOString(),
          roomTypePreference,
          furnishedPref,
          bio,
        };

        if (profileExists) {
          await api.patch('/tenants/profile', payload);
        } else {
          await api.post('/tenants/profile', payload);
          setProfileExists(true);
        }
      } else {
        // Owner Profile
        const payload = { bio };
        if (profileExists) {
          await api.patch('/owners/profile', payload);
        } else {
          await api.post('/owners/profile', payload);
          setProfileExists(true);
        }
      }
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile preferences');
    } finally {
      setSaving(false);
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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure your match preferences and bios.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className="rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Bio input (Shared by Owner & Tenant) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label htmlFor="bio" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                My Personal Biography (Bio)
              </label>
              
              {/* Voice input speech recognition bot */}
              <div className="flex items-center gap-2">
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                >
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi (हिंदी)</option>
                  <option value="mr-IN">Marathi (मराठी)</option>
                  <option value="es-ES">Spanish (Español)</option>
                  <option value="fr-FR">French (Français)</option>
                </select>
                
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition duration-200 border ${
                    isListening
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 animate-pulse'
                      : 'bg-primary-50 text-primary-600 border-primary-100 hover:bg-primary-100 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900/30'
                  }`}
                >
                  <Mic size={13} className={isListening ? 'animate-bounce text-red-500' : ''} />
                  {isListening ? 'Stop' : 'Speak'}
                </button>
              </div>
            </div>

            <textarea
              id="bio"
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce yourself, your habits, cleanup preferences, work schedule..."
              className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
            />
          </div>

          {/* Tenant-specific configuration preferences */}
          {user.role === 'TENANT' && (
            <div className="space-y-4 border-t border-gray-50 pt-6 dark:border-darkBorder">
              <h3 className="font-extrabold text-sm flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-primary-500" /> Match Matchmaker Preferences
              </h3>

              <div>
                <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Preferred Location / Neighborhood
                </label>
                <input
                  id="location"
                  type="text"
                  required
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Brooklyn, NY"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minBudget" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Min Budget (₹)
                  </label>
                  <input
                    id="minBudget"
                    type="number"
                    required
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="maxBudget" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Max Budget (₹)
                  </label>
                  <input
                    id="maxBudget"
                    type="number"
                    required
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="moveIn" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Target Move-in Date
                  </label>
                  <input
                    id="moveIn"
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="roomPref" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Room Type Preference
                  </label>
                  <select
                    id="roomPref"
                    value={roomTypePreference}
                    onChange={(e) => setRoomTypePreference(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  >
                    <option value="SINGLE">Single Room</option>
                    <option value="SHARED">Shared Room</option>
                    <option value="STUDIO">Studio</option>
                    <option value="ONE_BHK">1 BHK</option>
                    <option value="TWO_BHK">2 BHK</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  id="furnishingPref"
                  type="checkbox"
                  checked={furnishedPref}
                  onChange={(e) => setFurnishedPref(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="furnishingPref" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prefer Fully Furnished Rooms
                </label>
              </div>
            </div>
          )}

          <Button type="submit" loading={saving} className="w-full">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default ProfilePage;
