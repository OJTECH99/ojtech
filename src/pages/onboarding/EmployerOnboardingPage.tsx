import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import profileService from '@/lib/api/profileService';
import { AuthContext } from '@/providers/AuthProvider';
import { ToastHelper } from '../../providers/ToastContext';

interface EmployerProfileData {
    companyName?: string;
    companySize?: string;
    industry?: string;
    companyWebsite?: string;
    companyDescription?: string;
    companyAddress?: string;
    contactPersonName?: string;
    contactPersonPosition?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    companyLogoUrl?: string;
    hasCompletedOnboarding?: boolean;
}

interface EmployerOnboardingState {
  formData: EmployerProfileData;
  logoFile: File | null;
  error: string | null;
  isLoading: boolean;
  redirectTo: string | null;
}

export class EmployerOnboardingPage extends Component<{}, EmployerOnboardingState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {
    companyName: '',
    companySize: '',
    industry: '',
    companyWebsite: '',
    companyDescription: '',
    companyAddress: '',
    contactPersonName: '',
    contactPersonPosition: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
      },
      logoFile: null,
      error: null,
      isLoading: false,
      redirectTo: null
    };
  }

  componentDidMount() {
    this.fetchProfile();
  }

  restoreFromLocalStorage = () => {
    const STORAGE_KEY = 'ojtech_employer_onboarding';
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.formData) {
          this.setState({
            formData: {
              ...this.state.formData,
              ...parsedData.formData
            }
          }, () => {
            console.log('Restored employer onboarding data from localStorage:', this.state.formData);
            ToastHelper.toast({
              title: "Progress Restored",
              description: "We've restored your previous progress. Continue from where you left off.",
              variant: "success"
            });
          });
        }
      }
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
    }
  };

  fetchProfile = async () => {
    const { user } = this.context || {};
    
    // First check for authentication
    if (!user) {
      console.log('No user found in context, redirecting to login');
      this.setState({ redirectTo: '/login' });
      return;
    }

    // Check if user has employer role
    if (!user.roles?.includes('ROLE_EMPLOYER')) {
      console.log('User is not an employer, redirecting to appropriate onboarding');
      if (user.roles?.includes('ROLE_STUDENT')) {
        this.setState({ redirectTo: '/onboarding/student' });
      } else {
        this.setState({ redirectTo: '/' });
      }
      return;
    }

    try {
      this.setState({ isLoading: true, error: null });
      console.log('Fetching employer profile...');
      
      // First try to restore any saved data from localStorage
      this.restoreFromLocalStorage();
      
      const profileData = await profileService.getCurrentEmployerProfile();
      console.log('Profile data received:', profileData);
      
      if (profileData) {
        // Update form data with profile data
        const updatedFormData = {
          companyName: profileData.companyName || '',
          companySize: profileData.companySize || '',
          industry: profileData.industry || '',
          companyWebsite: profileData.companyWebsite || '',
          companyDescription: profileData.companyDescription || '',
          companyAddress: profileData.companyAddress || '',
          contactPersonName: profileData.contactPersonName || '',
          contactPersonPosition: profileData.contactPersonPosition || '',
          contactPersonEmail: profileData.contactPersonEmail || '',
          contactPersonPhone: profileData.contactPersonPhone || '',
          companyLogoUrl: profileData.companyLogoUrl || undefined,
          hasCompletedOnboarding: profileData.hasCompletedOnboarding
        };

        this.setState({
          formData: updatedFormData,
          isLoading: false
        }, () => {
          console.log('State updated with profile data:', this.state.formData);
          
          // If onboarding is completed, redirect to jobs page
          if (profileData.hasCompletedOnboarding) {
            console.log('Profile is complete, redirecting to jobs page');
            this.setState({ redirectTo: '/employer/jobs' });
          }
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      
      // Only set error for non-404 responses
      if (err.response?.status !== 404) {
        const errorMessage = err.response?.data?.message || 'Failed to load employer profile data.';
        console.error('Setting error state:', errorMessage);
        this.setState({
          error: errorMessage,
          isLoading: false
        });
        
        ToastHelper.toast({
          title: "Error Loading Profile",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('No profile found (404), continuing with empty form');
        this.setState({ isLoading: false });
      }
    }
  };

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }), () => {
      // Save to localStorage after state update
      this.saveToLocalStorage();
    });
  };

  saveToLocalStorage = () => {
    const STORAGE_KEY = 'ojtech_employer_onboarding';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData: this.state.formData
      }));
      console.log('Saved employer onboarding data to localStorage:', this.state.formData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ logoFile: e.target.files[0] });
    }
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null, isLoading: true });
    
    try {
      await profileService.completeEmployerOnboarding(this.state.formData);
      
      if (this.state.logoFile) {
        await profileService.uploadEmployerLogo(this.state.logoFile);
      }
      
      // Clear localStorage data since onboarding is complete
      this.clearLocalStorage();
      
      this.setState({ redirectTo: '/employer/jobs' });
      
      ToastHelper.toast({
        title: "Profile Updated",
        description: "Your employer profile has been successfully updated.",
        variant: "success"
      });
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || 'Onboarding failed. Please try again.'
      });
      
      ToastHelper.toast({
        title: "Error",
        description: this.state.error || 'Onboarding failed. Please try again.',
        variant: "destructive"
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  clearLocalStorage = () => {
    const STORAGE_KEY = 'ojtech_employer_onboarding';
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared employer onboarding data from localStorage');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  render() {
    const { formData, error, isLoading, redirectTo } = this.state;
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (isLoading) { 
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-200">Loading Profile</h2>
            <p className="text-gray-400">Please wait while we fetch your profile data...</p>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-black/90 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-800">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 -mx-8 -mt-8 px-8 py-6 mb-8 border-b border-gray-800">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Complete Company Profile
          </h2>
          <p className="text-gray-400 mt-2">
            Help candidates learn more about your company and opportunities.
          </p>
        </div>

        <form onSubmit={this.handleSubmit} className="space-y-8">
          <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Company Information
            </h3>

            <div className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  value={formData.companyName}
                  onChange={this.handleChange}
                  required
                  className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your company name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-300 mb-2">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="companySize"
                    id="companySize"
                    value={formData.companySize}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="industry"
                    id="industry"
                    value={formData.industry}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Website <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="companyWebsite"
                    id="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="https://example.com"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <span>🌐</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Description <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-2">(Tell candidates about your company culture and mission)</span>
                </label>
                <textarea
                  name="companyDescription"
                  id="companyDescription"
                  rows={4}
                  value={formData.companyDescription}
                  onChange={this.handleChange}
                  required
                  className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  placeholder="Share your company's story, mission, and what makes it a great place to work..."
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Company Location & Branding
            </h3>

            <div className="space-y-6">
              <div>
                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="companyAddress"
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter your company's address"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <span>📍</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="logoFile" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Logo
                  <span className="text-gray-500 text-xs ml-2">(PNG or JPG, max 2MB)</span>
                </label>
                <div className="flex items-center space-x-4">
                  {formData.companyLogoUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={formData.companyLogoUrl} 
                        alt="Company Logo" 
                        className="h-16 w-16 rounded-lg object-cover border border-gray-700"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="logoFile"
                    id="logoFile"
                    onChange={this.handleLogoFileChange}
                    accept="image/*"
                    className="flex-1 bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Contact Person
            </h3>
          
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="contactPersonPosition" className="block text-sm font-medium text-gray-300 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPersonPosition"
                    id="contactPersonPosition"
                    value={formData.contactPersonPosition}
                    onChange={this.handleChange}
                    required
                    className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md px-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="e.g. HR Manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="contactPersonEmail"
                      id="contactPersonEmail"
                      value={formData.contactPersonEmail}
                      onChange={this.handleChange}
                      required
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="email@company.com"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <span>✉️</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="contactPersonPhone"
                      id="contactPersonPhone"
                      value={formData.contactPersonPhone}
                      onChange={this.handleChange}
                      required
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-md pl-10 pr-4 py-2 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <span>📱</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-shake">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-500">Error Saving Profile</h4>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-800">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-6 py-2.5 rounded-lg font-medium text-white
                transition-all duration-300 shadow-lg
                ${isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-900/20'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Changes...
                </span>
              ) : (
                formData.hasCompletedOnboarding ? 'Update Company Profile' : 'Complete Company Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  }
}
