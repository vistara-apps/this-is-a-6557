import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If token is invalid, remove it
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Login mutation
  const loginMutation = useMutation(
    async ({ email, password }) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    {
      onSuccess: (data) => {
        const { token, user } = data.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        toast.success('Welcome back!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    async ({ firstName, lastName, email, password }) => {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        const { token, user } = data.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        toast.success('Account created successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
      },
    }
  );

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  // Forgot password mutation
  const forgotPasswordMutation = useMutation(
    async ({ email }) => {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Password reset email sent!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to send reset email';
        toast.error(message);
      },
    }
  );

  // Reset password mutation
  const resetPasswordMutation = useMutation(
    async ({ token, password }) => {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Password reset successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to reset password';
        toast.error(message);
      },
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (profileData) => {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setUser(data.data.user);
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      },
    }
  );

  const value = {
    user,
    loading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    isRegistering: registerMutation.isLoading,
    isForgettingPassword: forgotPasswordMutation.isLoading,
    isResettingPassword: resetPasswordMutation.isLoading,
    isUpdatingProfile: updateProfileMutation.isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
