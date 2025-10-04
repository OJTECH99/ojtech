
// This file configures the API URL for the application
// Use environment variable with fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Remove trailing slash if present
export const normalizedApiBaseUrl = API_BASE_URL.endsWith('/')
  ? API_BASE_URL.slice(0, -1)
  : API_BASE_URL;