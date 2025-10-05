import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import profileService from '../../lib/api/profileService';
import { AuthContext } from '../../providers/AuthProvider';
import GitHubProjectsStep from '../../components/onboarding/GitHubProjectsStep';
import PersonalInfoStep from '../../components/onboarding/PersonalInfoStep';
import EducationStep from '../../components/onboarding/EducationStep';
import SkillsStep from '../../components/onboarding/SkillsStep';
import ContactInfoStep from '../../components/onboarding/ContactInfoStep';
import BioStep from '../../components/onboarding/BioStep';
import ReviewStep from '../../components/onboarding/ReviewStep';
import CertificationsStep, { Certification } from '../../components/onboarding/CertificationsStep';
import ExperiencesStep, { WorkExperience } from '../../components/onboarding/ExperiencesStep';
import localStorageManager from '../../lib/utils/localStorageManager';
import { ToastHelper } from '../../providers/ToastContext';

// Types for github project
interface GitHubProject {
  name: string;
  url: string;
  description?: string;
  technologies?: string[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  readme?: string;
}

// Define an interface for the student profile data from the backend
interface StudentProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    university?: string;
    major?: string;
    graduationYear?: number;
    bio?: string;
    skills?: string[]; // Assuming skills are stored as an array of strings
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    hasCompletedOnboarding?: boolean;
    githubProjects?: GitHubProject[];
    certifications?: Certification[];
    experiences?: WorkExperience[];
    location?: string;
}

interface StudentOnboardingState {
  currentStep: number;
  formData: StudentProfileData;
  error: string | null;
  isLoading: boolean;
  skillsInput: string;
  redirectTo: string | null;
  projectsData: GitHubProject[];
}

export class StudentOnboardingPage extends Component<{}, StudentOnboardingState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      currentStep: 1,
      formData: {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        university: '',
        major: '',
        graduationYear: undefined,
        bio: '',
        skills: [],
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        certifications: [],
        experiences: [],
        location: ''
      },
      error: null,
      isLoading: false,
      skillsInput: '',
      redirectTo: null,
      projectsData: []
    };
  }

  componentDidMount() {
    // Remove toast.dismissAll() call to prevent clearing important notifications
    
    // Continue with the rest of the componentDidMount logic
    this.restoreFromLocalStorage();
    this.fetchProfile();
  }
  
  restoreFromLocalStorage = () => {
    // Get all saved onboarding data
    const savedData = localStorageManager.getOnboardingData();
    console.log('Restoring from localStorage:', savedData);
    
    // If we have data, restore the form state
    if (Object.keys(savedData).length > 0) {
      let updatedFormData = { ...this.state.formData };
      
      // GitHub projects
      if (savedData.githubProjects) {
        updatedFormData.githubProjects = savedData.githubProjects;
        this.setState({ projectsData: savedData.githubProjects });
        console.log('Restored GitHub projects from localStorage');
      }
      
      // Personal info
      if (savedData.personalInfo) {
        if (savedData.personalInfo.firstName) {
          updatedFormData.firstName = savedData.personalInfo.firstName;
          console.log('Restored first name from localStorage:', savedData.personalInfo.firstName);
        }
        
        if (savedData.personalInfo.lastName) {
          updatedFormData.lastName = savedData.personalInfo.lastName;
          console.log('Restored last name from localStorage:', savedData.personalInfo.lastName);
        }
        
        if (savedData.personalInfo.location) {
          updatedFormData.location = savedData.personalInfo.location;
          console.log('Restored location from localStorage:', savedData.personalInfo.location);
        }
      }
      
      // Education
      if (savedData.education) {
        if (savedData.education.university) {
          updatedFormData.university = savedData.education.university;
        }
        
        if (savedData.education.major) {
          updatedFormData.major = savedData.education.major;
        }
        
        if (savedData.education.graduationYear) {
          updatedFormData.graduationYear = savedData.education.graduationYear;
        }
        
        console.log('Restored education data from localStorage');
      }
      
      // Skills
      if (savedData.skills) {
        updatedFormData.skills = savedData.skills;
        this.setState({ 
          skillsInput: savedData.skills.join(', ')
        });
        console.log('Restored skills from localStorage');
      }
      
      // Contact info
      if (savedData.contact) {
        if (savedData.contact.phoneNumber) {
          updatedFormData.phoneNumber = savedData.contact.phoneNumber;
        }
        
        if (savedData.contact.githubUrl) {
          updatedFormData.githubUrl = savedData.contact.githubUrl;
        }
        
        if (savedData.contact.linkedinUrl) {
          updatedFormData.linkedinUrl = savedData.contact.linkedinUrl;
        }
        
        if (savedData.contact.portfolioUrl) {
          updatedFormData.portfolioUrl = savedData.contact.portfolioUrl;
        }
        
        console.log('Restored contact info from localStorage');
      }
      
      // Certifications
      if (savedData.certifications) {
        updatedFormData.certifications = savedData.certifications;
        console.log('Restored certifications from localStorage');
      }
      
      // Experiences
      if (savedData.experiences) {
        updatedFormData.experiences = savedData.experiences;
        console.log('Restored experiences from localStorage');
      }
      
      // Bio
      if (savedData.bio) {
        updatedFormData.bio = savedData.bio;
        console.log('Restored bio from localStorage');
      }
      
      // Update the form data with all restored values
      this.setState({ formData: updatedFormData }, () => {
        console.log('Updated formData state with localStorage values:', this.state.formData);
      });
      
      // Show toast if we have progress
      if (Object.keys(savedData).length > 0) {
        ToastHelper.toast({
          title: "Onboarding Progress Restored",
          description: "We've restored your previous progress. Continue from where you left off.",
          variant: "success"
        });
      }
    }
  };

  fetchProfile = async () => {
    const { user } = this.context || {};
    
    if (!user) {
      this.setState({ redirectTo: '/login' });
      return;
    }

    try {
      this.setState({ isLoading: true, error: null });
      
      const profileData = await profileService.getCurrentStudentProfile();
      
      if (profileData) {
        // First get any existing localStorage data that should take priority
        const savedData = localStorageManager.getOnboardingData();
        
        // Create updated form data by merging profile data with any existing local storage data
        const updatedFormData = {
          // Start with API profile data
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phoneNumber: profileData.phoneNumber || '',
            university: profileData.university || '',
            major: profileData.major || '',
            graduationYear: profileData.graduationYear || undefined,
            bio: profileData.bio || '',
            skills: profileData.skills || [],
            githubUrl: profileData.githubUrl || '',
            linkedinUrl: profileData.linkedinUrl || '',
            portfolioUrl: profileData.portfolioUrl || '',
            hasCompletedOnboarding: profileData.hasCompletedOnboarding,
          githubProjects: profileData.githubProjects || [],
          certifications: profileData.certifications || [],
            experiences: profileData.experiences || [],
            location: profileData.location || ''
        };
        
        // Now override with localStorage data if it exists
        if (savedData.personalInfo) {
          if (savedData.personalInfo.firstName) {
            updatedFormData.firstName = savedData.personalInfo.firstName;
          }
          if (savedData.personalInfo.lastName) {
            updatedFormData.lastName = savedData.personalInfo.lastName;
          }
        }
        
        // Any other localStorage overrides...
        
        this.setState({
          formData: updatedFormData
        });

        if (profileData.skills && profileData.skills.length > 0) {
          this.setState({
            skillsInput: profileData.skills.join(', ')
          });
        }
    
        if (profileData.hasCompletedOnboarding) {
          ToastHelper.toast({
            title: "Profile Successfully Loaded",
            description: "Your profile is already complete. You can review and update your information as needed.",
            variant: "success"
          });
        }
        
        console.log('Final formData after API fetch:', this.state.formData);
      }
    } catch (err: any) {
      console.error("Error in fetchProfile:", err);
      
      // Only show errors for non-404 responses
      if (err.response) {
        if (err.response.status === 404) {
          console.log("No profile found - this is normal for new users");
          // No need for a toast for new users - they'll see the onboarding steps
        } else {
          let errorMsg = err.response.data?.message || "Failed to load profile data. Please try again or contact support if the problem persists.";
          ToastHelper.toast({
            title: "Error Loading Profile Data",
            description: `${errorMsg} (Status: ${err.response.status})`,
            variant: "destructive"
          });
          this.setState({ error: errorMsg });
        }
      } else if (err.request) {
        let errorMsg = "No response received from server. Please check your network connection and try again.";
        ToastHelper.toast({
          title: "Network Connection Error",
          description: errorMsg,
          variant: "destructive"
        });
        this.setState({ error: errorMsg });
      } else {
        let errorMsg = "Failed to load profile data. Please try again or contact support if the problem persists.";
        ToastHelper.toast({
          title: "Unexpected Error",
          description: errorMsg,
          variant: "destructive"
        });
        this.setState({ error: errorMsg });
      }
    } finally {
      this.setState({ isLoading: false });
    }
  };

  nextStep = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep + 1 });
  };

  prevStep = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep - 1 });
  };

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: name === 'graduationYear' ? (value ? parseInt(value) : undefined) : value
      }
    }));
  };

  handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const skillsInput = e.target.value;
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    this.setState({
      skillsInput,
      formData: {
        ...this.state.formData,
        skills
      }
    });
  };

  handleProjectsChange = (projects: GitHubProject[]) => {
    this.setState({
      projectsData: projects,
      formData: {
        ...this.state.formData,
        githubProjects: projects
      }
    });
  };

  handleCertificationsChange = (certifications: any[]) => {
    this.setState({
      formData: {
        ...this.state.formData,
        certifications
      }
    });
  };

  handleExperiencesChange = (experiences: any[]) => {
    this.setState({
      formData: {
        ...this.state.formData,
        experiences
      }
    });
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null, isLoading: true });
    
    try {
      ToastHelper.toast({
        title: "Saving Your Profile",
        description: "Please wait while we save your complete profile information to our database.",
        variant: "default"
      });
      
      // Make sure education data is properly formatted for backend
      const { formData } = this.state;
      const educationData = {
        university: formData.university || '',
        major: formData.major || '',
        graduationYear: formData.graduationYear || null
      };
      
      // Combine all the data from the steps
      const completeFormData = {
        ...this.state.formData,
        githubProjects: this.state.projectsData,
        education: educationData, // Add education data in the expected format
        location: this.state.formData.location || '' // Explicitly include location
      };
      
      console.log('Submitting complete form data with education:', completeFormData);
      
      // Submit the onboarding data
     
      // Clear localStorage after successful onboarding
      localStorageManager.clearOnboardingData();
      
      // Refresh the auth context to update onboarding status
      if (this.context && this.context.fetchUserProfile) {
        await this.context.fetchUserProfile();
        console.log('Auth context refreshed after onboarding completion');
      }
      
      ToastHelper.toast({
        title: "Onboarding Successfully Completed",
        description: "Your student profile has been saved. You can now explore internship opportunities and apply for positions.",
        variant: "success"
      });
      
      this.setState({ redirectTo: '/track' });
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      
      let errorMsg = "We couldn't save your profile information. Please ensure all required fields are completed and try again.";
      
      if (err.response) {
        errorMsg = err.response.data?.message || errorMsg;
        ToastHelper.toast({
          title: "Error Saving Profile",
          description: `${errorMsg} (Status: ${err.response.status})`,
          variant: "destructive"
        });
      } else if (err.request) {
        errorMsg = "No response received from server. Please check your network connection and try again.";
        ToastHelper.toast({
          title: "Network Connection Error",
          description: errorMsg,
          variant: "destructive"
        });
      } else {
        ToastHelper.toast({
          title: "Profile Submission Error",
          description: "Please complete all required fields in each step before submitting your profile.",
          variant: "destructive"
        });
      }
      
      this.setState({ error: errorMsg });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  renderStep() {
    const { currentStep, formData, skillsInput, projectsData } = this.state;

    switch (currentStep) {
      case 1:
        return (
          <GitHubProjectsStep 
            projectsData={projectsData}
            onProjectsChange={this.handleProjectsChange}
            onNext={this.nextStep}
          />
        );
      case 2:
        return (
          <PersonalInfoStep 
            formData={formData}
            onChange={this.handleChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 3:
        return (
          <EducationStep 
            formData={formData}
            onChange={this.handleChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 4:
        return (
          <SkillsStep 
            skillsInput={skillsInput}
            skills={formData.skills || []}
            onChange={this.handleSkillsChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 5:
        return (
          <CertificationsStep 
            certifications={formData.certifications || []}
            onCertificationsChange={this.handleCertificationsChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 6:
        return (
          <ExperiencesStep 
            experiences={formData.experiences || []}
            onExperiencesChange={this.handleExperiencesChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 7:
        return (
          <ContactInfoStep 
            formData={formData}
            onChange={this.handleChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 8:
        return (
          <BioStep 
            bio={formData.bio || ''}
            onChange={this.handleChange}
            onNext={this.nextStep}
            onPrev={this.prevStep}
          />
        );
      case 9:
        return (
          <ReviewStep 
            formData={formData}
            projectsData={projectsData}
            onSubmit={this.handleSubmit}
            onPrev={this.prevStep}
            isLoading={this.state.isLoading}
          />
        );
      default:
        return <Navigate to="/profile" />;
    }
  }

  render() {
    const { error, isLoading, redirectTo } = this.state;
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (isLoading && this.state.currentStep === 1) { // Show full page loading only on initial load
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-4 border-t-gray-400 border-r-transparent border-b-gray-600 border-l-transparent animate-spin mb-5"></div>
            <p className="text-gray-400 font-medium tracking-wide">Loading your profile...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-4xl mx-auto">
        
          {/* Main container */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
            {/* Header section */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 px-8 py-10 border-b border-gray-800">
              <h2 className="text-3xl font-bold text-white">
                Complete Your Profile
              </h2>
              <p className="text-gray-400 mt-2 max-w-2xl">
                Tell us about yourself to help connect you with the best internship opportunities.
              </p>
              
              {/* Progress indicator with improved alignment */}
              <div className="mt-12 mb-8 px-4">
                <div className="relative">
                  {/* Base line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-800 rounded-full"></div>
                  
                  {/* Progress line */}
                  <div 
                    className="absolute top-6 left-0 h-1 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((this.state.currentStep - 1) / 8) * 100}%`
                    }}
                  ></div>
                  
                  {/* Step circles */}
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
                      <div key={step} className="flex flex-col items-center">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative z-10
                            ${this.state.currentStep === step 
                              ? 'bg-gradient-to-br from-gray-500 to-gray-700 text-white ring-4 ring-gray-700/30 shadow-lg shadow-black/40 scale-110' 
                              : this.state.currentStep > step 
                                ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white ring-2 ring-gray-600/20' 
                                : 'bg-black text-gray-500 border border-gray-700/30'
                            }`}
                        >
                          {this.state.currentStep > step ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : step}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${this.state.currentStep === step ? 'text-gray-300' : 'text-gray-500'}`}>
                          {step === 1 && 'GitHub'}
                          {step === 2 && 'Personal'}
                          {step === 3 && 'Education'}
                          {step === 4 && 'Skills'}
                          {step === 5 && 'Certs'}
                          {step === 6 && 'Experience'}
                          {step === 7 && 'Contact'}
                          {step === 8 && 'Bio'}
                          {step === 9 && 'Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="p-10 bg-black/90 backdrop-blur-lg">
              {error && (
                <div className="bg-red-900/10 border border-red-700/50 rounded-xl p-5 mb-8 animate-pulse">
                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-base font-medium text-red-400">Error Saving Profile</h4>
                      <p className="text-sm text-red-300/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {this.renderStep()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
