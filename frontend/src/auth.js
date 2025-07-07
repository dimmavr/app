// src/auth.js

const TOKEN_KEY = 'access_token';

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};
