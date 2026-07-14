import api from './api';

export const getCompatibility = async (listingId) => {
  const response = await api.get(`/compatibility/${listingId}`);
  return response.data.data; // { score, explanation, pros, cons, source }
};
