import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store';
import { addNotification } from '../store/slices/uiSlice';

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ParticipantResponse {
  id: number;
  name: string;
  age: number;
  gender: string;
  // Add other participant fields as needed
}

export interface AssessmentResponse {
  id: string;
  participantId: number;
  assessmentType: string;
  data: any;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://your-api-base-url.com/api', // Replace with your actual API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = store.getState().ui?.authToken; // You might want to add auth to your UI slice
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Create enhanced error object
    const enhancedError = {
      ...error,
      isNetworkError: !error.response,
      isServerError: error.response?.status >= 500,
      isClientError: error.response?.status >= 400 && error.response?.status < 500,
      isAuthError: error.response?.status === 401,
      isForbiddenError: error.response?.status === 403,
      isNotFoundError: error.response?.status === 404,
      isTimeoutError: error.code === 'ECONNABORTED',
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    };
    
    // Handle common errors with specific messages
    if (enhancedError.isAuthError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'Authentication required. Please login again.'
      }));
    } else if (enhancedError.isForbiddenError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'Access denied. You do not have permission to perform this action.'
      }));
    } else if (enhancedError.isNotFoundError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'The requested resource was not found.'
      }));
    } else if (enhancedError.isServerError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'Server error. Please try again later.'
      }));
    } else if (enhancedError.isNetworkError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'Network error. Please check your connection.'
      }));
    } else if (enhancedError.isTimeoutError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'Request timeout. Please try again.'
      }));
    } else if (enhancedError.isClientError) {
      store.dispatch(addNotification({
        type: 'error',
        message: 'Invalid request. Please check your input.'
      }));
    } else {
      store.dispatch(addNotification({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      }));
    }
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;
