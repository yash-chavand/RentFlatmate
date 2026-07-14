import { useState, useCallback } from 'react';
import * as listingService from '../services/listing.service';

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchListings = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.searchListings(filters);
      setListings(data.listings || []);
      setTotal(data.total || 0);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch listings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    listings,
    loading,
    error,
    total,
    fetchListings,
  };
};
