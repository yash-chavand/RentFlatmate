import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as listingService from '../../services/listing.service';
import * as compatibilityService from '../../services/compatibility.service';
import * as interestService from '../../services/interest.service';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CompatibilityBadge } from '../../components/common/CompatibilityBadge';
import { MapPin, Calendar, CheckSquare, Sparkles, Send, ArrowLeft, Mail, Phone, Lock, MessageSquare } from 'lucide-react';

export const ListingDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [interestStatus, setInterestStatus] = useState(null); // 'PENDING' / 'ACCEPTED' / 'REJECTED' / null
  const [activeInterest, setActiveInterest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compLoading, setCompLoading] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  
  // Send interest form
  const [interestMsg, setInterestMsg] = useState("Hi! I'm interested in your flat/room and would love to connect to discuss details.");
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const details = await listingService.getListingDetails(id);
        setListing(details);

        if (isAuthenticated && user?.role === 'TENANT') {
          // Fetch compatibility
          setCompLoading(true);
          try {
            const compData = await compatibilityService.getCompatibility(id);
            setCompatibility(compData);
          } catch (compErr) {
            console.error('Failed to load compatibility score', compErr);
          } finally {
            setCompLoading(false);
          }

          // Check if interest request already exists
          try {
            const sentInterests = await interestService.getSentInterests();
            const matchingInterest = sentInterests.find((i) => i.listingId === id);
            if (matchingInterest) {
              setInterestStatus(matchingInterest.status);
              setActiveInterest(matchingInterest);
            }
          } catch (intErr) {
            console.error('Failed to load sent interests', intErr);
          }
        }
      } catch (err) {
        console.error('Failed to fetch listing details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated, user]);

  const handleSendInterest = async (e) => {
    e.preventDefault();
    setInterestLoading(true);
    try {
      const response = await interestService.sendInterest({ listingId: id, message: interestMsg });
      setInterestStatus(response.status || 'PENDING');
      setActiveInterest(response);
      setSentSuccess(true);
    } catch (err) {
      console.error('Failed to send interest request', err);
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Listing not found</h2>
        <Link to="/listings" className="text-sm text-primary-500 hover:underline mt-4 inline-block">
          Go back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Images, Specs, Description */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Photo Gallery */}
          <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-gray-150 shadow-inner dark:bg-darkCard">
            <img
              src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute right-4 top-4 rounded-xl bg-black/60 px-3 py-1 text-xs font-bold text-white uppercase backdrop-blur-sm">
              {listing.roomType}
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-2">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={16} /> {listing.location}</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> Available from: {new Date(listing.availableDate).toLocaleDateString()}</span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-darkBorder" />

          {/* Specifications Grid */}
          <div>
            <h2 className="text-base font-extrabold mb-4 uppercase tracking-wider text-gray-500 dark:text-gray-400">Room Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 flex flex-col justify-center">
                <div className="text-xs text-gray-400">Monthly Rent</div>
                <div className="text-2xl font-black text-primary-600 dark:text-primary-400 mt-1">
                  ₹{listing.rent}
                </div>
              </Card>

              <Card className="p-4 flex flex-col justify-center">
                <div className="text-xs text-gray-400">Security Deposit</div>
                <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                  ₹{listing.deposit || 0}
                </div>
              </Card>

              <Card className="p-4 flex flex-col justify-center">
                <div className="text-xs text-gray-400">Furnishing Style</div>
                <div className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-1">
                  {listing.furnished ? 'Fully Furnished' : 'Unfurnished'}
                </div>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-base font-extrabold mb-3 uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</h2>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <hr className="border-gray-100 dark:border-darkBorder" />

          {/* Location Map */}
          <div>
            <h2 className="text-base font-extrabold mb-3 uppercase tracking-wider text-gray-500 dark:text-gray-400">Property Location</h2>
            <div className="w-full h-64 overflow-hidden rounded-2xl border border-gray-150 dark:border-darkBorder bg-gray-50 shadow-inner">
              <iframe
                title="Property Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>
        </div>

        {/* Right Side: AI Match & Requests Form */}
        <div className="space-y-6">
          
          {/* AI Match Module */}
          {isAuthenticated && user?.role === 'TENANT' && (
            <Card className="bg-gradient-to-br from-primary-900/10 to-indigo-900/5 border-primary-500/10 relative overflow-hidden">
              <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-primary-500" /> AI Compatibility Match
              </h3>

              {compLoading ? (
                <div className="py-6 text-center text-xs text-gray-400">Analyzing matching parameters...</div>
              ) : compatibility ? (
                <div className="space-y-4">
                  <div className="flex justify-center py-2">
                    <CompatibilityBadge score={compatibility.score} className="text-sm px-4 py-2" />
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Gemini Explanation</h4>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {compatibility.explanation}
                    </p>
                  </div>

                  {compatibility.pros?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-green-600 dark:text-green-400 mb-1">Pros</h4>
                      <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {compatibility.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {compatibility.cons?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 mb-1">Cons</h4>
                      <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {compatibility.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">Failed to compute compatibility score.</div>
              )}
            </Card>
          )}

          {/* Interest Action Panel */}
          <Card>
            <h3 className="font-extrabold text-base mb-4">Connect with Owner</h3>
            
            {!isAuthenticated ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-center"><Lock size={12} /> Sign in to send requests</p>
                <Link to="/login" className="block">
                  <Button className="w-full text-xs py-2">Sign In to Request</Button>
                </Link>
              </div>
            ) : user?.role === 'OWNER' ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center text-xs text-gray-500 dark:bg-darkBg/30 dark:border-darkBorder">
                  You are viewing this listing as an OWNER.
                </div>
                {listing.ownerProfile?.user && (
                  <div className="text-xs text-gray-400 space-y-1">
                    <div><strong>Listed by:</strong> {listing.ownerProfile.user.name}</div>
                    <div><strong>Email:</strong> {listing.ownerProfile.user.email}</div>
                  </div>
                )}
              </div>
            ) : (
              // Tenant Views
              <div className="space-y-4">
                {interestStatus ? (
                  // Request already sent
                  <div className="space-y-4 text-center">
                    <div className="bg-primary-50/50 border border-primary-100 p-4 rounded-xl text-xs dark:bg-primary-950/10 dark:border-darkBorder">
                      <span className="font-semibold block mb-1">Interest Request Sent</span>
                      Status: <strong className="uppercase">{interestStatus}</strong>
                    </div>

                    {interestStatus === 'ACCEPTED' && activeInterest?.chatRoom?.id && (
                      <Link to={`/chat?roomId=${activeInterest.chatRoom.id}`}>
                        <Button className="w-full text-xs py-2 gap-1.5">
                          <MessageSquare size={14} /> Open Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  // Send Request Form
                  <form onSubmit={handleSendInterest} className="space-y-3">
                    {sentSuccess && (
                      <div className="rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700">
                        Interest sent successfully!
                      </div>
                    )}
                    <div>
                      <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Introduce Yourself
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        required
                        value={interestMsg}
                        onChange={(e) => setInterestMsg(e.target.value)}
                        placeholder="Hi! I am interested..."
                        className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                      />
                    </div>
                    <Button type="submit" loading={interestLoading} className="w-full text-xs py-2 gap-1.5">
                      <Send size={12} /> Send Interest Request
                    </Button>
                  </form>
                )}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
export default ListingDetails;
