import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

interface StudentProfileData {
  university?: string;
  major?: string;
  graduationYear?: number;
  [key: string]: any;
}

interface EducationStepProps {
  formData: StudentProfileData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default class EducationStep extends Component<EducationStepProps> {
  componentDidMount() {
    // Load saved education info from localStorage
    const savedEducation = localStorageManager.getStepData<any>('education');
    if (savedEducation) {
      // Check if we need to update any fields
      const updates: Partial<StudentProfileData> = {};
      let needsUpdate = false;
      
      if (savedEducation.university && !this.props.formData.university) {
        updates.university = savedEducation.university;
        needsUpdate = true;
      }
      
      if (savedEducation.major && !this.props.formData.major) {
        updates.major = savedEducation.major;
        needsUpdate = true;
      }
      
      if (savedEducation.graduationYear && !this.props.formData.graduationYear) {
        updates.graduationYear = savedEducation.graduationYear;
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
          } as ChangeEvent<HTMLInputElement | HTMLSelectElement>;
          this.props.onChange(mockEvent);
        }
        
        console.log('Restored education info from localStorage:', updates);
      }
    }
  }

  isValid = (): boolean => {
    const { formData } = this.props;
    return !!(formData.university && formData.major && formData.graduationYear);
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save education data to localStorage
      localStorageManager.saveStepData('education', {
        university: this.props.formData.university,
        major: this.props.formData.major,
        graduationYear: this.props.formData.graduationYear
      });
      
      this.props.onNext();
    }
  };

  render() {
    const { formData, onChange, onPrev } = this.props;
    const currentYear = new Date().getFullYear();

    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Educational Background
          </h3>
          <p className="text-gray-400 mt-2">
            Tell us about your academic journey
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="university" className="block text-sm font-medium text-gray-300">
                  University/School <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="university"
                    id="university"
                    value={formData.university || ''}
                    onChange={onChange}
                    required
                    className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Your university or school"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="major" className="block text-sm font-medium text-gray-300">
                  Major/Course <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="major"
                    id="major"
                    value={formData.major || ''}
                    onChange={onChange}
                    required
                    className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Your field of study"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-300">
                Expected Graduation Year <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  name="graduationYear"
                  id="graduationYear"
                  value={formData.graduationYear || ''}
                  onChange={onChange}
                  required
                  className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300 appearance-none"
                >
                  <option value="">Select graduation year</option>
                  {Array.from({ length: 7 }, (_, i) => currentYear + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-900/40 border border-gray-800/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-400">
                This information helps employers match you with relevant internship opportunities in your field of study.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <button
            onClick={this.handleNext}
            disabled={!this.isValid()}
            className={`
              px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-300 flex items-center gap-2
              ${!this.isValid() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Continue to Skills
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
} 