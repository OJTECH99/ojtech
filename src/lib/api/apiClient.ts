import axios from 'axios';
import { toast } from '../../components/ui/toast-utils';
import { API_BASE_URL } from '../../apiConfig';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get the user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Extract the access token from user data
        if (userData && userData.accessToken) {
          console.log('Adding auth token to request:', config.url);
          config.headers.Authorization = `Bearer ${userData.accessToken}`;
        } else {
          console.warn('No accessToken found in user data for request:', config.url);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    } else {
      console.warn('No user data found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // Handle different status codes
      if (response.status === 401 || response.status === 403) {
        // Unauthorized or forbidden
        toast.destructive({
          title: 'Authentication Error',
          description: 'Your session has expired. Please sign in again.',
        });
        // Optionally redirect to login or clear auth state
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (response.status === 404) {
        toast.destructive({
          title: 'Not Found',
          description: 'The requested resource was not found.',
        });
      } else if (response.status >= 500) {
        toast.destructive({
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
        });
      } else {
        // Generic error message for other status codes
        const errorMessage = response.data?.message || 'An error occurred. Please try again.';
        toast.destructive({
          title: 'Error',
          description: errorMessage,
        });
      }
    } else {
      // Network errors or other issues
      toast.destructive({
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 