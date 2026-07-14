import React, { useState, useEffect } from 'react';
import * as listingService from '../../services/listing.service';
import * as interestService from '../../services/interest.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Trash2, Home, UserCheck, MessageSquare, Check, X, FileText, CheckCircle2 } from 'lucide-react';

export const OwnerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New listing form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [roomType, setRoomType] = useState('SINGLE');
  const [furnished, setFurnished] = useState(false);
  const [listingImageUrl, setListingImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Photo management modal state
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [selectedListingForPhotos, setSelectedListingForPhotos] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageLoading, setNewImageLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [listingsData, interestsData] = await Promise.all([
        listingService.getMyListings(),
        interestService.getReceivedInterests(),
      ]);
      setListings(listingsData || []);
      setInterests(interestsData || []);
    } catch (err) {
      console.error('Failed to fetch owner dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddListing = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const isoDate = new Date(availableDate).toISOString();
      const newListing = await listingService.createListing({
        title,
        description,
        location,
        rent,
        deposit: deposit ? parseInt(deposit, 10) : 0,
        availableDate: isoDate,
        roomType,
        furnished,
      });

      if (listingImageUrl.trim()) {
        try {
          await listingService.uploadListingImage(newListing.id, {
            url: listingImageUrl.trim(),
            publicId: 'custom-' + Date.now(),
          });
        } catch (imgErr) {
          console.error('Failed to upload listing image on creation:', imgErr);
        }
      }

      setIsAddModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setRent('');
      setDeposit('');
      setAvailableDate('');
      setRoomType('SINGLE');
      setFurnished(false);
      setListingImageUrl('');
      // Refresh
      await fetchDashboardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingService.deleteListing(id);
        setListings((prev) => prev.filter((l) => l.id !== id));
      } catch (err) {
        console.error('Failed to delete listing', err);
      }
    }
  };

  const handleOpenPhotosModal = (listing) => {
    setSelectedListingForPhotos(listing);
    setIsPhotosModalOpen(true);
    setNewImageUrl('');
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setNewImageLoading(true);
    try {
      const newImg = await listingService.uploadListingImage(selectedListingForPhotos.id, {
        url: newImageUrl.trim(),
        publicId: 'custom-' + Date.now(),
      });
      setSelectedListingForPhotos((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImg],
      }));
      setNewImageUrl('');
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to add photo', err);
      alert('Failed to add photo. Please try a valid URL.');
    } finally {
      setNewImageLoading(false);
    }
  };

  const handleDeletePhoto = async (imageId) => {
    try {
      await listingService.removeListingImage(selectedListingForPhotos.id, imageId);
      setSelectedListingForPhotos((prev) => ({
        ...prev,
        images: (prev.images || []).filter((img) => img.id !== imageId),
      }));
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete photo', err);
      alert('Failed to delete photo.');
    }
  };

  const handleInterestAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await interestService.acceptInterest(id);
      } else {
        await interestService.rejectInterest(id);
      }
      // Update state
      setInterests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: action.toUpperCase() } : item))
      );
    } catch (err) {
      console.error(`Failed to ${action} interest`, err);
    }
  };

  const handleMarkAsFilled = async (id) => {
    try {
      await listingService.markAsFilled(id);
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'FILLED' } : item))
      );
    } catch (err) {
      console.error('Failed to mark listing as filled', err);
      alert('Failed to mark listing as filled');
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
      {/* Title & action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Owner Console</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage listings and view tenant connections.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus size={16} /> Add Listing
        </Button>
      </div>

      {/* Grid: Listings vs Received Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Listings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-darkBorder">
            <Home size={18} className="text-primary-500" />
            <h2 className="font-extrabold text-lg bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">My Listings ({listings.length})</h2>
          </div>

          {listings.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">You haven't listed any rooms yet.</p>
              <Button onClick={() => setIsAddModalOpen(true)} variant="secondary" className="mt-4">
                Create Your First Listing
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="flex flex-col justify-between h-full">
                  <div>
                    {listing.images?.[0] && (
                      <div className="w-full h-32 overflow-hidden rounded-xl mb-3 bg-gray-100 dark:bg-darkCard">
                        <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        listing.status === 'AVAILABLE'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {listing.status}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400 block">
                          ₹{listing.rent}/mo
                        </span>
                        {listing.deposit !== undefined && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold block">
                            Deposit: ₹{listing.deposit}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-base mb-1.5 line-clamp-1">{listing.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {listing.description}
                    </p>
                    <div className="text-xs text-gray-400 mb-4">
                      <strong>Location:</strong> {listing.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto dark:border-darkBorder">
                    <button
                      onClick={() => handleOpenPhotosModal(listing)}
                      className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    >
                      <Plus size={12} /> Manage Photos ({listing.images?.length || 0})
                    </button>
                    <div className="flex items-center gap-2">
                      {listing.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleMarkAsFilled(listing.id)}
                          className="text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        >
                          Mark Filled
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Interests */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-darkBorder">
            <UserCheck size={18} className="text-primary-500" />
            <h2 className="font-extrabold text-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">Tenant Interests ({interests.length})</h2>
          </div>

          {interests.length === 0 ? (
            <Card className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              No interest requests received yet.
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {interests.map((item) => (
                <Card key={item.id} className="relative">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-sm">{item.tenantProfile?.user?.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      item.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                        : item.status === 'ACCEPTED'
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/20'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
                    "{item.message || 'Hi, I am interested in this flat!'}"
                  </p>

                  <div className="text-[11px] text-gray-400 border-t border-gray-50 pt-2 dark:border-darkBorder mb-3">
                    <div><strong>Listing:</strong> {item.listing?.title}</div>
                    <div><strong>Preferred Location:</strong> {item.tenantProfile?.preferredLocation}</div>
                    <div><strong>Budget:</strong> ${item.tenantProfile?.budgetMin}-${item.tenantProfile?.budgetMax}</div>
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleInterestAction(item.id, 'accept')}
                        className="w-full text-xs py-1.5 h-auto gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check size={14} /> Accept
                      </Button>
                      <Button
                        onClick={() => handleInterestAction(item.id, 'reject')}
                        variant="danger"
                        className="w-full text-xs py-1.5 h-auto gap-1"
                      >
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold justify-center bg-green-50 dark:bg-green-950/10 py-1.5 rounded-lg">
                      <CheckCircle2 size={14} /> Approved
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Listing Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Listing">
        <form onSubmit={handleAddListing} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Listing Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spacious Double Room in Downtown Apartment"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the room configuration, flatmate habits, amenities..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="rent" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Monthly Rent (₹)
              </label>
              <input
                id="rent"
                type="number"
                required
                min={1}
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="e.g. 750"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="deposit" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Deposit (₹)
              </label>
              <input
                id="deposit"
                type="number"
                min={0}
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="availableDate" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Available Date
              </label>
              <input
                id="availableDate"
                type="date"
                required
                value={availableDate}
                onChange={(e) => setAvailableDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="roomType" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Room Configuration
              </label>
              <select
                id="roomType"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
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

            <div>
              <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Neighborhood / Location
              </label>
              <input
                id="location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Brooklyn, NY"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
            </div>
          </div>

          <InteractiveMapPicker value={location} onChange={(val) => setLocation(val)} />

          <div className="flex items-center gap-3 py-2">
            <input
              id="furnished"
              type="checkbox"
              checked={furnished}
              onChange={(e) => setFurnished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="furnished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fully Furnished
            </label>
          </div>

          <div>
            <label htmlFor="listingImageFile" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Listing Main Photo (Optional)
            </label>
            <input
              id="listingImageFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setListingImageUrl(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-darkBg dark:file:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-darkBorder">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Create Listing
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Photos Modal */}
      <Modal
        isOpen={isPhotosModalOpen}
        onClose={() => {
          setIsPhotosModalOpen(false);
          setSelectedListingForPhotos(null);
        }}
        title={`Manage Photos: ${selectedListingForPhotos?.title || ''}`}
      >
        <div className="space-y-6">
          {/* Add photo form */}
          <div className="space-y-3">
            <div>
              <label htmlFor="newImageFile" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Upload New Photo
              </label>
              <input
                id="newImageFile"
                type="file"
                accept="image/*"
                disabled={newImageLoading}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setNewImageLoading(true);
                  try {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      try {
                        const newImg = await listingService.uploadListingImage(selectedListingForPhotos.id, {
                          url: reader.result,
                          publicId: 'custom-' + Date.now(),
                        });
                        setSelectedListingForPhotos((prev) => ({
                          ...prev,
                          images: [...(prev.images || []), newImg],
                        }));
                        await fetchDashboardData();
                      } catch (err) {
                        console.error('Failed to add photo', err);
                        alert('Failed to add photo.');
                      } finally {
                        setNewImageLoading(false);
                        e.target.value = '';
                      }
                    };
                    reader.readAsDataURL(file);
                  } catch (err) {
                    setNewImageLoading(false);
                    console.error(err);
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-darkBg dark:file:text-white"
              />
            </div>
          </div>

          {/* Current photos list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Uploaded Photos ({selectedListingForPhotos?.images?.length || 0})
            </h4>
            {selectedListingForPhotos?.images?.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-150 rounded-xl dark:border-darkBorder">
                No photos uploaded yet for this room.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {selectedListingForPhotos?.images?.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-darkCard">
                    <img src={img.url} alt="Room" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(img.id)}
                      className="absolute right-1 top-1 bg-red-600 text-white rounded-lg p-1.5 opacity-90 hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-darkBorder">
            <Button onClick={() => {
              setIsPhotosModalOpen(false);
              setSelectedListingForPhotos(null);
            }}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InteractiveMapPicker = ({ value, onChange }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markerRef = React.useRef(null);

  React.useEffect(() => {
    // Load Leaflet CSS CDN dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS CDN dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;

      // Fix Leaflet CDN default markers issue
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Default coords centered on Pune, India
      const defaultLatLng = [18.5204, 73.8567];

      // Initialize Map
      const map = L.map(mapRef.current).setView(defaultLatLng, 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add draggable pin
      const marker = L.marker(defaultLatLng, { draggable: true }).addTo(map);
      markerRef.current = marker;

      const performReverseGeocode = async (lat, lng) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'RentSync'
            }
          });
          const data = await res.json();
          if (data && data.display_name) {
            const addr = data.address;
            const sub = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.village || addr.subdistrict;
            const city = addr.city || addr.town || addr.county;
            const state = addr.state;
            const cleanAddress = [sub, city, state].filter(Boolean).join(', ');
            onChange(cleanAddress || data.display_name);
          }
        } catch (err) {
          console.error('Map reverse geocoding failed:', err);
        }
      };

      // Click on map to move pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        performReverseGeocode(lat, lng);
      });

      // Drag pin to move
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        performReverseGeocode(lat, lng);
      });
    };

    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="space-y-2 mt-4 z-10">
      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        📍 Point / Drag Pin on Map (Auto-fills location)
      </span>
      <div 
        ref={mapRef} 
        className="w-full h-44 rounded-xl border border-gray-200 dark:border-darkBorder bg-gray-100"
        style={{ minHeight: '176px' }}
      />
    </div>
  );
};

export default OwnerDashboard;
