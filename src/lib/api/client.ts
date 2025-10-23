import axios from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000, // 10 seconds for normal requests
  headers: {
    'Content-Type': 'application/json',
  },
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
  baseURL: 'http://localhost:8080',
  timeout: 600000, // 10 minutes for analysis operations
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    // Handle network errors or other axios errors
    if (error.response) {
      // Server responded with error status
      const apiResponse: ApiResponse<any> = error.response.data;
      throw new Error(apiResponse.error || `HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
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
