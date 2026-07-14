import api from './api';

export const createListing = async (data) => {
  const response = await api.post('/listings', data);
  return response.data.data;
};

export const updateListing = async (id, data) => {
  const response = await api.patch(`/listings/${id}`, data);
  return response.data.data;
};

export const deleteListing = async (id) => {
  const response = await api.delete(`/listings/${id}`);
  return response.data.data;
};

export const markAsFilled = async (id) => {
  const response = await api.patch(`/listings/${id}/fill`);
  return response.data.data;
};

export const searchListings = async (params) => {
  const response = await api.get('/listings', { params });
  return response.data.data; // { listings, total, page, limit }
};

export const getListingDetails = async (id) => {
  const response = await api.get(`/listings/${id}`);
  return response.data.data;
};

export const getMyListings = async () => {
  const response = await api.get('/listings/me/listings');
  return response.data.data;
};

export const uploadListingImage = async (listingId, { url, publicId }) => {
  const response = await api.post(`/listings/${listingId}/images`, { url, publicId });
  return response.data.data;
};

export const removeListingImage = async (listingId, imageId) => {
  const response = await api.delete(`/listings/${listingId}/images/${imageId}`);
  return response.data.data;
};
