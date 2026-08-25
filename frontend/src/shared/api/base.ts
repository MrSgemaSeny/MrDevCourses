import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized: user session expired or missing
      if (window.location.pathname !== '/auth') {
        // Option to redirect or notify
      }
    }
    return Promise.reject(error);
  }
);
