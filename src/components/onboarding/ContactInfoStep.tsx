import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';
import githubService from '../../lib/api/githubService';

interface StudentProfileData {
  phoneNumber?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  [key: string]: any;
}

interface ContactInfoStepProps {
  formData: StudentProfileData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default class ContactInfoStep extends Component<ContactInfoStepProps> {
  componentDidMount() {
    // Load saved contact info from localStorage
    const savedContact = localStorageManager.getStepData<any>('contact');
    
    // Determine if we need to derive GitHub URL from projects
    this.deriveGitHubUrl();
    
    if (savedContact) {
      // Check if we need to update any fields
      const updates: Partial<StudentProfileData> = {};
      let needsUpdate = false;
      
      if (savedContact.phoneNumber && !this.props.formData.phoneNumber) {
        updates.phoneNumber = savedContact.phoneNumber;
        needsUpdate = true;
      }
      
      if (savedContact.linkedinUrl && !this.props.formData.linkedinUrl) {
        updates.linkedinUrl = savedContact.linkedinUrl;
        needsUpdate = true;
      }
      
      if (savedContact.githubUrl && !this.props.formData.githubUrl) {
        updates.githubUrl = savedContact.githubUrl;
        needsUpdate = true;
      }
      
      if (savedContact.portfolioUrl && !this.props.formData.portfolioUrl) {
        updates.portfolioUrl = savedContact.portfolioUrl;
        needsUpdate = true;
      }
      
      // If we have updates, simulate changes for each field
      if (needsUpdate) {
        for (const [key, value] of Object.entries(updates)) {
          const mockEvent = {
            target: {
              name: key,
              value: value
            }
          } as ChangeEvent<HTMLInputElement>;
          this.props.onChange(mockEvent);
        }
      }
    }
  }

  deriveGitHubUrl = () => {
    // Only derive GitHub URL if it's not already set
    if (!this.props.formData.githubUrl) {
      const savedProjects = localStorageManager.getStepData<any[]>('githubProjects') || [];
      
      // Find the first GitHub project URL and extract the username
      if (savedProjects.length > 0) {
        for (const project of savedProjects) {
          if (project.url && project.url.includes('github.com')) {
            const username = githubService.extractGitHubUsername(project.url);
            if (username) {
              const githubUrl = `https://github.com/${username}`;
              
              // Update the form data with the derived GitHub URL
              const mockEvent = {
                target: {
                  name: 'githubUrl',
                  value: githubUrl
                }
              } as ChangeEvent<HTMLInputElement>;
              this.props.onChange(mockEvent);
              
              console.log('Derived GitHub URL from projects:', githubUrl);
              break;
            }
          }
        }
      }
    }
  };

  isValid = (): boolean => {
    const { formData } = this.props;
    return !!formData.phoneNumber;
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save contact info to localStorage
      localStorageManager.saveStepData('contact', {
        phoneNumber: this.props.formData.phoneNumber,
        linkedinUrl: this.props.formData.linkedinUrl,
        githubUrl: this.props.formData.githubUrl,
        portfolioUrl: this.props.formData.portfolioUrl
      });
      
      this.props.onNext();
    }
  };

  render() {
    const { formData, onChange, onPrev } = this.props;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Contact Information
          </h3>
          <p className="text-gray-400 mt-2">
            How can employers reach you?
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={onChange}
              required
              className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
              placeholder="Your phone number"
            />
          </div>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <h4 className="text-lg font-medium text-white mb-4">Professional Links <span className="text-gray-500 text-sm font-normal">(Optional)</span></h4>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="linkedinUrl"
                  id="linkedinUrl"
                  value={formData.linkedinUrl || ''}
                  onChange={onChange}
                  className="w-full bg-black/80 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <span>in/</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="githubUrl"
                  id="githubUrl"
                  value={formData.githubUrl || ''}
                  onChange={onChange}
                  className="w-full bg-black/80 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="https://github.com/yourusername"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <span>gh/</span>
                </div>
              </div>
              {formData.githubProjects && formData.githubProjects.length > 0 && !formData.githubUrl && (
                <p className="text-xs text-gray-400 mt-1 pl-1">
                  We recommend adding your GitHub profile to showcase all your projects.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                Portfolio Website
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="portfolioUrl"
                  id="portfolioUrl"
                  value={formData.portfolioUrl || ''}
                  onChange={onChange}
                  className="w-full bg-black/80 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="https://yourportfolio.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <span>🌐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={this.handleNext}
            disabled={!this.isValid()}
            className={`
              px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-300 shadow-lg
              ${!this.isValid() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Continue to Bio
          </button>
        </div>
      </div>
    );
  }
} 