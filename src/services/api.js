import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
          
        case 403:
          toast.error('Access denied. Please check your permissions.');
          break;
          
        case 404:
          toast.error('Resource not found.');
          break;
          
        case 422:
          // Validation errors
          if (data.details && Array.isArray(data.details)) {
            data.details.forEach(detail => {
              toast.error(detail.msg || detail.message);
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
};

export const postsAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  duplicatePost: (id) => api.post(`/posts/${id}/duplicate`),
  getPostAnalytics: (id) => api.get(`/posts/${id}/analytics`),
};

export const socialAccountsAPI = {
  getAccounts: () => api.get('/social-accounts'),
  getAccount: (id) => api.get(`/social-accounts/${id}`),
  disconnectAccount: (id) => api.delete(`/social-accounts/${id}`),
  connectAccount: (platform) => api.get(`/social-accounts/connect/${platform}`),
};

export const engagementsAPI = {
  getEngagements: (params) => api.get('/engagements', { params }),
  markAsRead: (id) => api.put(`/engagements/${id}/read`),
  reply: (id, content) => api.post(`/engagements/${id}/reply`, { content }),
  getStats: (params) => api.get('/engagements/stats', { params }),
};

export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getPosts: (params) => api.get('/analytics/posts', { params }),
  getEngagements: (params) => api.get('/analytics/engagements', { params }),
};

export const aiAPI = {
  getContentSuggestions: (data) => api.post('/ai/content-suggestions', data),
  getOptimalTiming: (data) => api.post('/ai/optimal-timing', data),
  getHashtagSuggestions: (data) => api.post('/ai/hashtag-suggestions', data),
};

export const subscriptionsAPI = {
  getCurrent: () => api.get('/subscriptions/current'),
  createCheckout: (data) => api.post('/subscriptions/checkout', data),
  cancel: () => api.post('/subscriptions/cancel'),
};

export default api;
