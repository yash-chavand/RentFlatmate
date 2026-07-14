import api, { setAccessToken } from './api';

export const register = async ({ email, password, role, name, phone }) => {
  const response = await api.post('/auth/register', { email, password, role, name, phone });
  const { user, accessToken } = response.data.data;
  setAccessToken(accessToken);
  return user;
};

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  const { user, accessToken } = response.data.data;
  setAccessToken(accessToken);
  return user;
};

export const logout = async () => {
  await api.post('/auth/logout');
  setAccessToken(null);
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

export const silentRefresh = async () => {
  const response = await api.post('/auth/refresh');
  const { user, accessToken } = response.data.data;
  setAccessToken(accessToken);
  return { user, accessToken };
};
