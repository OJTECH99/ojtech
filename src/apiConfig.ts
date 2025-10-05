/// <reference types="vite/client" />

// This file configures the API URL for the application
// Use environment variable with fallback
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Normalize the API base URL to remove trailing slashes
export const normalizedApiBaseUrl: string = (API_BASE_URL || '').replace(/\/+$/, '');