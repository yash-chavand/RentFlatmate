import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useListings } from '../../hooks/useListings';
import { useDebounce } from '../../hooks/useDebounce';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CompatibilityBadge } from '../../components/common/CompatibilityBadge';
import { Search, MapPin, Compass, SlidersHorizontal } from 'lucide-react';

export const SearchListings = () => {
  const { listings, loading, total, fetchListings } = useListings();

  // Filter States (Draft values)
  const [location, setLocation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [roomType, setRoomType] = useState('');
  const [furnished, setFurnished] = useState('');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Snapshot of filters to execute query
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    fetchListings({
      ...appliedFilters,
      page,
      limit: 9,
    });
  }, [page, appliedFilters, fetchListings]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newFilters = {};
    if (location) newFilters.location = location;
    if (minRent) newFilters.minRent = minRent;
    if (maxRent) newFilters.maxRent = maxRent;
    if (roomType) newFilters.roomType = roomType;
    if (furnished !== '') newFilters.furnished = furnished;

    setAppliedFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setLocation('');
    setMinRent('');
    setMaxRent('');
    setRoomType('');
    setFurnished('');
    setAppliedFilters({});
    setPage(1);
  };

  const totalPages = Math.ceil(total / 9);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Filters Toggle */}
        <div className="flex items-center justify-between lg:hidden border-b border-gray-100 pb-4 dark:border-darkBorder">
          <span className="font-bold text-base">Listings ({total})</span>
          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            variant="secondary"
            className="text-xs py-2 h-auto gap-1.5"
          >
            <SlidersHorizontal size={14} /> Filters
          </Button>
        </div>

        {/* Filters Panel (Sidebar) */}
        <aside className={`w-full lg:w-64 shrink-0 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 dark:border-darkBorder">
              <span className="font-bold text-sm">Filter Search</span>
              <button onClick={handleResetFilters} className="text-xs text-primary-500 hover:underline">
                Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-4">
              {/* Location Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Neighborhood
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Brooklyn"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Monthly Rent (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  />
                  <input
                    type="number"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                  />
                </div>
              </div>

              {/* Room Type select */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Room Configuration
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                >
                  <option value="">Any Configuration</option>
                  <option value="SINGLE">Single Room</option>
                  <option value="SHARED">Shared Room</option>
                  <option value="STUDIO">Studio</option>
                  <option value="ONE_BHK">1 BHK</option>
                  <option value="TWO_BHK">2 BHK</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Furnishing toggle */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Furnishing
                </label>
                <select
                  value={furnished}
                  onChange={(e) => setFurnished(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white mb-2"
                >
                  <option value="">Any</option>
                  <option value="true">Fully Furnished</option>
                  <option value="false">Unfurnished</option>
                </select>
              </div>

              <Button type="submit" className="w-full text-xs py-2.5">
                Apply Filters
              </Button>
            </form>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1 space-y-6">
          <div className="hidden lg:flex items-center justify-between border-b border-gray-100 pb-3 dark:border-darkBorder">
            <span className="font-semibold text-sm text-gray-500 dark:text-gray-400">Showing {total} listing matches</span>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : listings.length === 0 ? (
            <Card className="text-center py-20">
              <Compass size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="font-bold text-gray-500 dark:text-gray-400 text-base">No listings match your search.</p>
              <p className="text-xs text-gray-400 mt-1">Try relaxing filters or changing location.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const getRoomTypeStyle = (type) => {
                    switch (type) {
                      case 'ONE_BHK':
                        return 'from-purple-500 to-indigo-600';
                      case 'TWO_BHK':
                        return 'from-fuchsia-500 to-purple-600';
                      case 'SINGLE':
                        return 'from-emerald-500 to-teal-600';
                      case 'SHARED':
                        return 'from-cyan-500 to-blue-600';
                      case 'STUDIO':
                        return 'from-indigo-500 to-blue-600';
                      default:
                        return 'from-slate-500 to-gray-600';
                    }
                  };

                  return (
                    <Link key={listing.id} to={`/listings/${listing.id}`}>
                      <Card className="flex flex-col justify-between h-full card-premium-hover cursor-pointer border border-gray-150 dark:border-darkBorder">
                        <div>
                          {/* Placeholder image */}
                          <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                            <img
                              src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'}
                              alt={listing.title}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className={`absolute right-3 top-3 rounded-xl bg-gradient-to-r ${getRoomTypeStyle(listing.roomType)} px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow-md`}>
                              {listing.roomType?.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-base font-black text-orange-600 dark:text-orange-400 block">
                                ₹{listing.rent}/mo
                              </span>
                              {listing.deposit !== undefined && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold block">
                                  Deposit: ₹{listing.deposit}
                                </span>
                              )}
                            </div>
                            {listing.compatibilityScore !== undefined && listing.compatibilityScore !== null && (
                              <CompatibilityBadge score={listing.compatibilityScore} className="scale-90 origin-right py-0.5 px-2" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mb-2">
                            <MapPin size={10} /> {listing.location}
                          </div>

                          <h3 className="font-bold text-sm mb-1.5 line-clamp-1 text-gray-800 dark:text-gray-150">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {listing.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-darkBorder text-[9px] font-bold tracking-tight">
                          <span className="rounded-full bg-blue-50/80 text-blue-700 px-2 py-0.5 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
                            Available: {new Date(listing.availableDate).toLocaleDateString()}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 border ${
                            listing.furnished
                              ? 'bg-green-50/80 text-green-700 border-green-100/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                              : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
                          }`}>
                            {listing.furnished ? 'Furnished' : 'Unfurnished'}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    variant="secondary"
                    className="text-xs py-1.5 h-auto"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-500 font-semibold">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    variant="secondary"
                    className="text-xs py-1.5 h-auto"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
export default SearchListings;
