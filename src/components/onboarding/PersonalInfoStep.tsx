import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

interface StudentProfileData {
  firstName?: string;
  lastName?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phoneNumber?: string;
  [key: string]: any;
}

const PHILIPPINE_PROVINCES = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao', 'Aurora',
  'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
  'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
  'Cotabato', 'Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental',
  'Dinagat Islands', 'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo',
  'Isabela', 'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte',
  'Maguindanao del Norte', 'Maguindanao del Sur', 'Marinduque', 'Masbate', 'Misamis Occidental',
  'Misamis Oriental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental', 'Northern Samar',
  'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga',
  'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar (Western Samar)', 'Sarangani',
  'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Tarlac',
  'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'
];

interface PersonalInfoStepProps {
  formData: StudentProfileData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default class PersonalInfoStep extends Component<PersonalInfoStepProps> {
  componentDidMount() {
    // Load saved personal info from localStorage
    const savedPersonalInfo = localStorageManager.getStepData<any>('personalInfo');
    if (savedPersonalInfo) {
      // Check if we need to update any fields
      const updates: Partial<StudentProfileData> = {};
      let needsUpdate = false;
      
      if (savedPersonalInfo.firstName && !this.props.formData.firstName) {
        updates.firstName = savedPersonalInfo.firstName;
        needsUpdate = true;
      }
      
      if (savedPersonalInfo.lastName && !this.props.formData.lastName) {
        updates.lastName = savedPersonalInfo.lastName;
        needsUpdate = true;
      }
      
      if (savedPersonalInfo.city && !this.props.formData.city) {
        updates.city = savedPersonalInfo.city;
        needsUpdate = true;
      }
      
      if (savedPersonalInfo.province && !this.props.formData.province) {
        updates.province = savedPersonalInfo.province;
        needsUpdate = true;
      }
      
      if (savedPersonalInfo.postalCode && !this.props.formData.postalCode) {
        updates.postalCode = savedPersonalInfo.postalCode;
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
        
        console.log('Restored personal info from localStorage:', updates);
      }
    }
  }

  isValid = (): boolean => {
    const { formData } = this.props;
    return !!(
      formData.firstName && 
      formData.lastName && 
      formData.city && 
      formData.province && 
      formData.postalCode
    );
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save personal info to localStorage
      localStorageManager.saveStepData('personalInfo', {
        firstName: this.props.formData.firstName,
        lastName: this.props.formData.lastName,
        city: this.props.formData.city,
        province: this.props.formData.province,
        postalCode: this.props.formData.postalCode
      });
      
      this.props.onNext();
    }
  };

  render() {
    const { formData, onChange, onPrev } = this.props;

    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Personal Information
          </h3>
          <p className="text-gray-400 mt-2">
            Let's get to know you better
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                First Name <span className="text-gray-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={onChange}
                  required
                  className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Your first name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                Last Name <span className="text-gray-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={onChange}
                  required
                  className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Your last name"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Address</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  City <span className="text-gray-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city || ''}
                    onChange={onChange}
                    required
                    className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="e.g. Cebu City"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-300 mb-2">
                    Province <span className="text-gray-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <select
                      name="province"
                      id="province"
                      value={formData.province || ''}
                      onChange={onChange}
                      required
                      className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300 appearance-none"
                    >
                      <option value="">Select province</option>
                      {PHILIPPINE_PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-2">
                    Postal Code <span className="text-gray-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={formData.postalCode || ''}
                      onChange={onChange}
                      onKeyPress={(e) => {
                        // Only allow numbers
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      required
                      maxLength={4}
                      pattern="[0-9]{4}"
                      className="w-full pl-10 bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                      placeholder="e.g. 6000"
                    />
                  </div>
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
                Your name will be visible to employers when you apply for internships. Make sure it matches your legal name.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-lg font-medium text-white border border-gray-700/50 hover:bg-gray-900/30 transition-all duration-300 flex items-center gap-2"
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
                ? 'bg-gray-900/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Continue to Education
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
} 