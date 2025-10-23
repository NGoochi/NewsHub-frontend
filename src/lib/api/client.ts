import axios from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '@/types';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  timeout: 10000, // 10 seconds for normal requests
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials removed - we send token in Authorization header, not cookies
});

// TEMPORARY REQUEST INTERCEPTOR FOR DEBUGGING NEWS API CALLS
apiClient.interceptors.request.use(
  (config) => {
    // Log all requests that might be related to news/article operations
    if (config.url?.includes('import') || config.url?.includes('newsapi') || config.url?.includes('articles')) {
      console.log('=== API Client Request Debug Info ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method?.toUpperCase());
      console.log('Data:', config.data);
      console.log('Params:', config.params);
      console.log('=== End API Client Request Debug Info ===');
    }
    return config;
  },
  (error) => {
    console.log('=== API Client Request Error ===');
    console.log('Request Error:', error);
    console.log('=== End API Client Request Error ===');
    return Promise.reject(error);
  }
);

// Create separate axios instance for long-running operations (analysis)
export const analysisApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  timeout: 600000, // 10 minutes for analysis operations
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials removed - we send token in Authorization header, not cookies
});

// Request interceptor to attach token from cookies to Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Client] Attaching token to ${config.url}`);
    } else {
      console.warn('[API Client] No auth token found in cookies');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Apply the same request interceptor to analysis client
analysisApiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle standard API format
apiClient.interceptors.response.use(
  (response) => {
    // The API returns { success, data, error } format
    const apiResponse: ApiResponse<any> = response.data;
    
    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      // If success is false, throw an error with the error message
      throw new Error(apiResponse.error || 'API request failed');
    }
  },
  (error) => {
    // Handle authentication errors - redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('[API Client] Authentication error:', error.response?.status, error.response?.data);
      // Clear auth token
      Cookies.remove('authToken');
      // Redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Authentication required'));
    }
    
    // Handle network errors or other axios errors
    if (error.response) {
      // Server responded with error status
      console.error('[API Client] Server error:', error.response.status, error.response.data);
      const apiResponse: ApiResponse<any> = error.response.data;
      throw new Error(apiResponse.error || `HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Client] Network error - no response received');
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      console.error('[API Client] Request setup error:', error.message);
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Apply the same response interceptor to analysis client
analysisApiClient.interceptors.response.use(
  (response) => {
    const apiResponse: ApiResponse<any> = response.data;
    
    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.error || 'API request failed');
    }
  },
  (error) => {
    // Handle authentication errors - redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth token
      Cookies.remove('authToken');
      // Redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Authentication required'));
    }
    
    if (error.response) {
      const apiResponse: ApiResponse<any> = error.response.data;
      throw new Error(apiResponse.error || `HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export default apiClient;
