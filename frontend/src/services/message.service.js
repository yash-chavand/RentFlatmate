import api from './api';

export const getMessages = async (chatRoomId, params) => {
  const response = await api.get(`/messages/${chatRoomId}`, { params });
  return response.data.data; // { messages, total, page, limit }
};

export const sendMessage = async (chatRoomId, content) => {
  const response = await api.post(`/messages/${chatRoomId}`, { content });
  return response.data.data;
};
