import axios from 'axios';
import { API_BASE_URL } from '../../apiConfig';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_API_URL = `${API_BASE_URL}/auth`;

interface SignupData {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  hasCompletedOnboarding?: boolean;
  requiresPasswordReset?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}



const register = async (data: SignupData) => {
  console.log('Sending registration data:', JSON.stringify(data, null, 2));
  console.log('To URL:', `${AUTH_API_URL}/signup`);
  try {
    const response = await axios.post(`${AUTH_API_URL}/signup`, data);
    console.log('Registration response status:', response.status);
    console.log('Registration response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration API error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

const login = async (data: LoginData) => {
  console.log('Login function called with raw data:', data);
  
  const loginData = {
    usernameOrEmail: data.usernameOrEmail,
    password: data.password
  };
  
  console.log('Sending login request with data:', JSON.stringify(loginData, null, 2));
  console.log('To URL:', `${AUTH_API_URL}/signin`);
  
  try {
    const response = await axios.post(`${AUTH_API_URL}/signin`, loginData);
    console.log('Login response status:', response.status);
    console.log('Login response data structure:', Object.keys(response.data));
    
    if (response.data.accessToken) {
      console.log('Access token received (first 10 chars):', response.data.accessToken.substring(0, 10) + '...');
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('User data stored in localStorage with key "user"');
      
      // Verify storage
      const storedData = localStorage.getItem('user');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Verified localStorage - token exists:', !!parsedData.accessToken);
      }
    } else {
      console.warn('No access token in response data');
    }
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

const googleLogin = async (tokenId: string) => {
  console.log('Google login function called with token (first 10 chars):', tokenId.substring(0, 10) + '...');
  
  try {
    const response = await axios.post(`${AUTH_API_URL}/oauth2/google`, { tokenId });
    
    console.log('Google auth backend response:', response.data);
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Invalid response from backend OAuth endpoint');
    }
  } catch (error: any) {
    console.error('Google authentication error:', error);
    let errorMessage = error.response?.data?.message || 'Failed to authenticate with Google';
    throw new Error(errorMessage);
  }
};

const githubLogin = async (code: string) => {
  console.log('GitHub login function called with code (first 10 chars):', code.substring(0, 10) + '...');
  
  try {
    const response = await axios.post(`${AUTH_API_URL}/github`, { code });
    
    console.log('GitHub auth backend response:', response.data);
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Invalid response from backend OAuth endpoint');
    }
  } catch (error: any) {
    console.error('GitHub authentication error:', error);
    let errorMessage = error.response?.data?.message || 'Failed to authenticate with GitHub';
    throw new Error(errorMessage);
  }
};

const logout = () => {
  localStorage.removeItem('user');
  console.log('User logged out, localStorage user data cleared');
};

const getCurrentUser = (): UserData | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr) as UserData;
     
      return userData;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

// Add this function to check authentication status
const checkAuthStatus = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      console.log('Auth check - User found in localStorage:', {
        username: userData.username,
        email: userData.email,
        roles: userData.roles,
        hasToken: !!userData.accessToken,
        tokenStart: userData.accessToken ? userData.accessToken.substring(0, 10) + '...' : 'No token'
      });
      return true;
    } catch (error) {
      console.error('Auth check - Error parsing user data:', error);
      return false;
    }
  } else {
    console.warn('Auth check - No user data found in localStorage');
    return false;
  }
};

const changePassword = async (data: ChangePasswordRequest) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const response = await axios.post(
      `${AUTH_API_URL}/change-password`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      }
    );
    
    console.log('Password changed successfully');
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

const authService = {
  register,
  login,
  googleLogin,
  githubLogin,
  logout,
  getCurrentUser,
  checkAuthStatus,
  changePassword,
};

export default authService; 