import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
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
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
        // Handled reactively by AuthProvider/ProtectedRoute
      }
    }
    return Promise.reject(error);
  }
);
