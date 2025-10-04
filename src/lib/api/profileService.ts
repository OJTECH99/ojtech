import axios from 'axios';
import authService from './authService';
import { API_BASE_URL } from '../../apiConfig';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_URL = `${API_BASE_URL}/profiles`;

const getAuthHeaders = () => {
  // First, try to get the token from the user object
  const user = authService.getCurrentUser();
  if (user && user.accessToken) {
    
    return { Authorization: 'Bearer ' + user.accessToken };
  }
  
  // If not found, check if there's a standalone token
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Found standalone token in localStorage');
    return { Authorization: 'Bearer ' + token };
  }
  
  console.warn('No authentication token found');
  return {};
};

// Helper function to get user role
const getUserRole = (): string | null => {
  const user = authService.getCurrentUser();
  if (user && user.roles && user.roles.length > 0) {
    // Return the first role, or check for specific role hierarchy
    if (user.roles.includes('ROLE_ADMIN')) return 'ADMIN';
    if (user.roles.includes('ROLE_EMPLOYER')) return 'EMPLOYER';
    if (user.roles.includes('ROLE_STUDENT')) return 'STUDENT';
    return user.roles[0]; // fallback to first role
  }
  return null;
};

// Generic profile endpoint
const getCurrentProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching general profile:", error.message);
    throw error;
  }
};

// Smart profile updating based on user role
const updateProfile = async (data: any) => {
  try {
    const userRole = getUserRole();
    console.log(`Updating profile for user with role: ${userRole}`);
    
    let endpoint = '';
    let formattedData: any = {};
    
    switch (userRole) {
      case 'STUDENT':
        endpoint = `${API_BASE_URL}/student-profiles/me`;
        // Format student-specific data
        formattedData = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`.trim(),
          phoneNumber: data.phoneNumber || null,
          location: data.location || null,
          address: data.address || null,
          bio: data.bio || null,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          // Education fields
          university: data.university || null,
          major: data.major || null,
          graduationYear: data.graduationYear || null,
          // Role and onboarding status
      role: data.role || 'STUDENT',
          // Complex fields
          githubProjects: data.githubProjects || [],
          certifications: data.certifications || [],
          experiences: data.experiences || [],
          // Convert skills array to comma-separated string if needed by backend
          skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',') : [])
        };
        break;
        
      case 'EMPLOYER':
        endpoint = `${API_BASE_URL}/employer-profiles/me`;
        // Format employer-specific data
        formattedData = {
          companyName: data.companyName,
          companySize: data.companySize || null,
          industry: data.industry || null,
          websiteUrl: data.websiteUrl || data.companyWebsite || null,
          companyDescription: data.companyDescription || null,
          companyAddress: data.companyAddress || null,
          contactPersonName: data.contactPersonName || null,
          contactPersonPosition: data.contactPersonPosition || null,
          contactPersonEmail: data.contactPersonEmail || null,
          contactPersonPhone: data.contactPersonPhone || null,
          companyLogoUrl: data.companyLogoUrl || null,
          logoUrl: data.logoUrl || data.companyLogoUrl || null,
      // Do not include hasCompletedOnboarding in generic updates; handled by onboarding endpoints
        };
        break;
        
      case 'ADMIN':
      default:
        // Use generic endpoint for admin or unknown roles
        endpoint = `${API_BASE_URL}/profiles/me`;
        formattedData = data; // Pass data as-is for generic endpoint
        break;
    }

    console.log(`Sending formatted data to ${endpoint}:`, formattedData);

    const response = await axios.put(
      endpoint,
      formattedData,
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    if (error.response) {
      console.error("Server error details:", error.response.data);
    }
    throw error;
  }
};

// Update employer profile
const updateEmployerProfile = async (data: any) => {
  try {
    // Format the data to match backend expectations
    const formattedData = {
      companyName: data.companyName,
      companySize: data.companySize || null,
      industry: data.industry || null,
      websiteUrl: data.websiteUrl || data.companyWebsite || null, // Use websiteUrl or fall back to companyWebsite
      companyDescription: data.companyDescription || null,
      companyAddress: data.companyAddress || null,
      contactPersonName: data.contactPersonName || null,
      contactPersonPosition: data.contactPersonPosition || null,
      contactPersonEmail: data.contactPersonEmail || null,
      contactPersonPhone: data.contactPersonPhone || null,
      companyLogoUrl: data.companyLogoUrl || null,
      logoUrl: data.logoUrl || data.companyLogoUrl || null
    };

    console.log('Sending formatted employer data to backend:', formattedData);

    const response = await axios.put(
      `${API_BASE_URL}/employer-profiles/me`,
      formattedData,
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Employer profile update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating employer profile:", error.message);
    if (error.response) {
      console.error("Server error details:", error.response.data);
    }
    throw error;
  }
};

// Create initial profile after registration
const createInitialProfile = async (fullName: string) => {
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error("User must be logged in to create profile");
    }
    
    console.log(`Creating initial profile for user ${user.username} with full name: ${fullName}`);
    
    // First check if profile already exists to avoid duplicate creation
    try {
      const existingProfile = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      console.log('Profile already exists:', existingProfile.data);
      
      // If profile exists but doesn't have a fullName, update it
      if (existingProfile.data && (!existingProfile.data.fullName || existingProfile.data.fullName.trim() === '')) {
        console.log('Updating existing profile with full name');
        return await axios.post(`${API_URL}/update`, 
          { fullName },
          { headers: getAuthHeaders() }
        );
      }
      
      return existingProfile.data;
    } catch (error: any) {
      // If profile doesn't exist (404) or other error, create a new one
      if (error.response?.status === 404 || !error.response) {
        console.log('No existing profile found, creating new profile');
        const response = await axios.post(`${API_URL}/create`, 
          { fullName },
          { headers: getAuthHeaders() }
        );
        console.log('Profile creation response:', response.data);
        return response.data;
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Error creating initial profile:", error.message);
    if (error.response?.data) {
      console.error("Server error details:", error.response.data);
    }
    throw error;
  }
};

// Student Profile
const completeStudentOnboarding = async (data: any) => {
  try {
    console.log('Sending student onboarding data:', data);
    
    // First, check if the user already has a profile
    let profileExists = false;
    try {
      const checkResponse = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (checkResponse && checkResponse.data) {
        profileExists = true;
        console.log('Existing profile found:', checkResponse.data);
      }
    } catch (error: any) {
      // If 404, profile doesn't exist, which is fine
      if (error.response?.status !== 404) {
        console.error("Error checking existing profile:", error);
      } else {
        console.log('No existing profile found (404 response)');
      }
    }
    
    // If no profile exists yet, create a simple profile first
    if (!profileExists) {
      try {
        console.log('Creating initial student profile...');
        
        // Extract education data properly
        const education = data.education || {};
        
        const initialProfileData = {
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          location: data.location || '',
          // Include education data
          university: education.university || data.university || '',
          major: education.major || data.major || '',
          graduationYear: education.graduationYear || data.graduationYear || null,
          // Include contact info and professional links
          phoneNumber: data.phoneNumber || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          // Include bio
          bio: data.bio || '',
          // Include other minimal required fields
          skills: data.skills || []
        };
        
        console.log('Initial profile data:', initialProfileData);
        await axios.post(`${API_URL}/create`, initialProfileData, { headers: getAuthHeaders() });
        console.log('Created initial profile successfully');
      } catch (error: any) {
        console.error("Error creating initial profile:", error);
        if (error.response?.data) {
          console.error("Server error details:", error.response.data);
        }
      }
    }
    
    // Ensure token is still valid before continuing
    const authHeaders = getAuthHeaders();
    console.log('Using auth headers for onboarding submission:', authHeaders);
    
    // Explicitly set hasCompletedOnboarding to true
    const onboardingData = {
      ...data,
      hasCompletedOnboarding: true
    };
    
    // Now proceed with the onboarding data submission
    const userRole = getUserRole();
    console.log(`Completing onboarding for user with role: ${userRole}`);
    
    let onboardingEndpoint = '';
    let updateEndpoint = '';
    
    switch (userRole) {
      case 'STUDENT':
        onboardingEndpoint = `${API_BASE_URL}/student-profiles/complete-onboarding`;
        updateEndpoint = `${API_BASE_URL}/student-profiles/me`;
        break;
      case 'EMPLOYER':
        // Employer onboarding might use a different endpoint
        onboardingEndpoint = `${API_BASE_URL}/employer-profiles/complete-onboarding`;
        updateEndpoint = `${API_BASE_URL}/employer-profiles/me`;
        break;
      case 'ADMIN':
      default:
        // Use generic endpoint for admin or unknown roles
        onboardingEndpoint = `${API_BASE_URL}/profiles/complete-onboarding`;
        updateEndpoint = `${API_BASE_URL}/profiles/me`;
        break;
    }
    
    console.log(`Submitting complete onboarding data to ${onboardingEndpoint} with hasCompletedOnboarding set to true`);
    const response = await axios.post(onboardingEndpoint, onboardingData, { headers: authHeaders });
    console.log('Onboarding successful response:', response.data);
    
    // Also update the profile directly to ensure the status is updated
    try {
      await axios.put(
        updateEndpoint,
        { hasCompletedOnboarding: true },
        { headers: authHeaders }
      );
      console.log('Explicitly updated hasCompletedOnboarding status');
    } catch (updateError) {
      console.error('Error updating onboarding status:', updateError);
      // Continue even if this fails, as the main onboarding was successful
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error completing student onboarding:", error);
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
    }
    throw error;
  }
};

const uploadStudentCv = async (cvFile: File) => {
  const formData = new FormData();
  formData.append('cvFile', cvFile);
  try {
    const response = await axios.post(`${API_URL}/student/cv`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error uploading student CV:", error.message);
    throw error;
  }
};

// Smart profile fetching based on user role
const getCurrentUserProfileSmart = async () => {
  try {
    const userRole = getUserRole();
    console.log(`Fetching profile for user with role: ${userRole}`);
    
    let endpoint = '';
    
    switch (userRole) {
      case 'STUDENT':
        endpoint = `${API_BASE_URL}/student-profiles/me`;
        break;
      case 'EMPLOYER':
        endpoint = `${API_BASE_URL}/employer-profiles/me`;
        break;
      case 'ADMIN':
        // Admin can use the generic endpoint or student endpoint depending on needs
        endpoint = `${API_BASE_URL}/profiles/me`;
        break;
      default:
        // Fallback to generic endpoint for unknown roles
        console.warn(`Unknown user role: ${userRole}, using generic endpoint`);
        endpoint = `${API_BASE_URL}/profiles/me`;
        break;
    }
    
    console.log(`Making request to: ${endpoint}`);
    const response = await axios.get(endpoint, { headers: getAuthHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    
    // If the role-specific endpoint fails, try the generic endpoint as fallback
    if (error.response?.status === 403 || error.response?.status === 404) {
      console.warn("Role-specific endpoint failed, trying generic endpoint as fallback");
      try {
        const fallbackResponse = await axios.get(`${API_BASE_URL}/profiles/me`, { headers: getAuthHeaders() });
        return fallbackResponse.data;
      } catch (fallbackError: any) {
        console.error("Fallback endpoint also failed:", fallbackError.message);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

// Keep the old function for backward compatibility but redirect to smart version
const getCurrentStudentProfile = async () => {
  console.warn("getCurrentStudentProfile is deprecated, use getCurrentUserProfileSmart instead");
  return getCurrentUserProfileSmart();
};

const submitStudentOnboarding = async (data: any) => {
  try {
    console.log('Submitting student onboarding data:', data);
    
    // First, check if the user already has a profile
    let profileExists = false;
    try {
      const checkResponse = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      if (checkResponse && checkResponse.data) {
        profileExists = true;
        console.log('Existing profile found:', checkResponse.data);
      }
    } catch (error: any) {
      // If 404, profile doesn't exist, which is fine
      if (error.response?.status !== 404) {
        console.error("Error checking existing profile:", error);
      } else {
        console.log('No existing profile found (404 response)');
      }
    }
    
    // If no profile exists yet, create a simple profile first
    if (!profileExists) {
      try {
        console.log('Creating initial student profile...');
        
        // Extract education data properly
        const education = data.education || {};
        
        const initialProfileData = {
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          location: data.location || '',
          // Include education data
          university: education.university || data.university || '',
          major: education.major || data.major || '',
          graduationYear: education.graduationYear || data.graduationYear || null,
          // Include contact info and professional links
          phoneNumber: data.phoneNumber || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          // Include bio
          bio: data.bio || '',
          // Include other minimal required fields
          skills: data.skills || []
        };
        
        console.log('Initial profile data:', initialProfileData);
        await axios.post(`${API_URL}/create`, initialProfileData, { headers: getAuthHeaders() });
        console.log('Created initial profile successfully');
      } catch (error: any) {
        console.error("Error creating initial profile:", error);
        if (error.response?.data) {
          console.error("Server error details:", error.response.data);
        }
      }
    }
    
    // Ensure token is still valid before continuing
    const authHeaders = getAuthHeaders();
    console.log('Using auth headers for onboarding submission:', authHeaders);
    
    // Explicitly set hasCompletedOnboarding to true
    const onboardingData = {
      ...data,
      hasCompletedOnboarding: true
    };
    
    // Now proceed with the onboarding data submission
    console.log('Submitting complete onboarding data with hasCompletedOnboarding set to true');
    const response = await axios.post(`${API_BASE_URL}/student-profiles/complete-onboarding`, onboardingData, { headers: authHeaders });
    console.log('Student onboarding successful response:', response.data);
    
    // Also update the profile directly to ensure the status is updated
    try {
      await axios.put(
        `${API_BASE_URL}/student-profiles/me`,
        { hasCompletedOnboarding: true },
        { headers: authHeaders }
      );
      console.log('Explicitly updated hasCompletedOnboarding status');
    } catch (updateError) {
      console.error('Error updating onboarding status:', updateError);
      // Continue even if this fails, as the main onboarding was successful
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error submitting student onboarding:', error.message);
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
    }
    throw error;
  }
};

// Employer Profile
const completeEmployerOnboarding = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/employer/onboarding`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Error completing employer onboarding:", error.message);
    throw error;
  }
};

const uploadEmployerLogo = async (logoFile: File) => {
  const formData = new FormData();
  formData.append('file', logoFile);
  try {
    const response = await axios.post(`${API_BASE_URL}/employer-profiles/logo`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error uploading employer logo:", error.message);
    throw error;
  }
};

const getCurrentEmployerProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/employer-profiles/me`, { headers: getAuthHeaders() });
    console.log('Employer profile response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching employer profile:", error.message);
    throw error;
  }
};

const updateEducationInfo = async (educationData: any) => {
  try {
    console.log('Updating education info:', educationData);
    
    // Format the education data for the API
    const updateData = {
      university: educationData.university || '',
      major: educationData.major || '',
      graduationYear: educationData.graduationYear || null
    };
    
    // Update the profile via the API
    const response = await axios.put(`${API_URL}/me`, updateData, { headers: getAuthHeaders() });
    console.log('Education info updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating education info:', error.message);
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
    }
    throw error;
  }
};

// Check verification status for students
const getVerificationStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/student-profiles/verification-status`, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching verification status:", error.message);
    throw error;
  }
};

const profileService = {
  getCurrentProfile,
  updateProfile,
  createInitialProfile,
  completeStudentOnboarding,
  uploadStudentCv,
  getCurrentStudentProfile,
  getCurrentUserProfileSmart, // Add the new smart function
  submitStudentOnboarding,
  completeEmployerOnboarding,
  uploadEmployerLogo,
  getCurrentEmployerProfile,
  updateEducationInfo,
  updateEmployerProfile,
  getVerificationStatus,
};

export default profileService;