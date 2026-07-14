import api from './api';

export const sendInterest = async ({ listingId, message }) => {
  const response = await api.post('/interests', { listingId, message });
  return response.data.data;
};

export const cancelInterest = async (id) => {
  const response = await api.patch(`/interests/${id}/cancel`);
  return response.data.data;
};

export const acceptInterest = async (id) => {
  const response = await api.patch(`/interests/${id}/accept`);
  return response.data.data;
};

export const rejectInterest = async (id) => {
  const response = await api.patch(`/interests/${id}/reject`);
  return response.data.data;
};

export const getSentInterests = async () => {
  const response = await api.get('/interests/sent');
  return response.data.data;
};

export const getReceivedInterests = async () => {
  const response = await api.get('/interests/received');
  return response.data.data;
};
