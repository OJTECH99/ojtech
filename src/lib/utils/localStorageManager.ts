/**
 * Local Storage Manager for Onboarding Data
 * Handles saving, loading, and clearing onboarding data from localStorage
 */

const STORAGE_KEY = 'ojtech_student_onboarding';

interface OnboardingStep {
  githubProjects?: any[];
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    location?: string;
  };
  education?: {
    university?: string;
    major?: string;
    graduationYear?: number;
  };
  skills?: string[];
  contact?: {
    phoneNumber?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  bio?: string;
  certifications?: any[];
  experiences?: any[];
}

/**
 * Saves onboarding step data to localStorage
 * @param step The name of the step
 * @param data The data to save
 */
const saveStepData = (step: keyof OnboardingStep, data: any): void => {
  try {
    // Get existing data
    const existingData = getOnboardingData();
    
    // Update with new data
    const updatedData = {
      ...existingData,
      [step]: data
    };
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    console.log(`Saved ${step} data to localStorage:`, data);
    
    // If this is personalInfo, log specifically for debugging
    if (step === 'personalInfo') {
      console.log(`Saved personal info with firstName="${data.firstName}", lastName="${data.lastName}", location="${data.location || ''}"`);
    }
  } catch (error) {
    console.error('Error saving onboarding data to localStorage:', error);
  }
};

/**
 * Gets all onboarding data from localStorage
 */
const getOnboardingData = (): OnboardingStep => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsedData = data ? JSON.parse(data) : {};
    
    // Special debug for personalInfo to track name loading issues
    if (parsedData.personalInfo) {
      console.log('Retrieved personalInfo from localStorage:', 
        `firstName="${parsedData.personalInfo.firstName}", lastName="${parsedData.personalInfo.lastName}", location="${parsedData.personalInfo.location || ''}"`);
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading onboarding data from localStorage:', error);
    return {};
  }
};

/**
 * Gets specific step data from localStorage
 * @param step The name of the step
 */
const getStepData = <T>(step: keyof OnboardingStep): T | undefined => {
  const data = getOnboardingData();
  
  // Special debug for personalInfo to track name loading issues
  if (step === 'personalInfo' && data[step]) {
    console.log(`Retrieved ${step} data:`, data[step]);
  }
  
  return data[step] as T;
};

/**
 * Clears all onboarding data from localStorage
 */
const clearOnboardingData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Cleared all onboarding data from localStorage');
};

/**
 * Extracts unique technologies from GitHub projects to use as skills
 * @param projects Array of GitHub projects
 * @returns Array of unique skills
 */
const extractSkillsFromProjects = (projects: any[]): string[] => {
  if (!projects || !projects.length) return [];

  // Collect all technologies from all projects
  const allTechnologies = projects.reduce((acc: string[], project) => {
    if (project.technologies && Array.isArray(project.technologies)) {
      return [...acc, ...project.technologies];
    }
    return acc;
  }, []);

  // Return unique technologies
  return [...new Set(allTechnologies)];
};

export default {
  saveStepData,
  getOnboardingData,
  getStepData,
  clearOnboardingData,
  extractSkillsFromProjects
}; 