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
