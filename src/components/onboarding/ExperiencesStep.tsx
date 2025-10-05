import { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ExperiencesStepProps {
  experiences: WorkExperience[];
  onExperiencesChange: (experiences: WorkExperience[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ExperiencesStepState {
  experiences: WorkExperience[];
  currentExperience: WorkExperience;
  isEditing: boolean;
  editIndex: number | null;
  formErrors: Record<string, string>;
}

export default class ExperiencesStep extends Component<ExperiencesStepProps, ExperiencesStepState> {
  constructor(props: ExperiencesStepProps) {
    super(props);
    this.state = {
      experiences: props.experiences || [],
      currentExperience: this.getEmptyExperience(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    };
  }

  componentDidMount() {
    // Load saved experiences from localStorage if available
    const savedExperiences = localStorageManager.getStepData<WorkExperience[]>('experiences');
    if (savedExperiences && savedExperiences.length > 0) {
      this.setState({ experiences: savedExperiences });
      // Update parent component
      this.props.onExperiencesChange(savedExperiences);
    }
  }

  // Creates an empty work experience with a unique ID
  getEmptyExperience = (): WorkExperience => {
    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
  };

  // Handle form field changes
  handleExperienceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      currentExperience: {
        ...prevState.currentExperience,
        [name]: value
      },
      formErrors: {
        ...prevState.formErrors,
        [name]: this.validateField(name, value)
      }
    }));
  };

  // Handle checkbox for current position
  handleCurrentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    this.setState(prevState => ({
      currentExperience: {
        ...prevState.currentExperience,
        current: checked,
        // Clear end date if currently employed
        endDate: checked ? '' : prevState.currentExperience.endDate
      }
    }));
  };

  // Validate individual fields
  validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        return value.trim() === '' ? 'Job title is required' : '';
      case 'company':
        return value.trim() === '' ? 'Company name is required' : '';
      case 'startDate':
        return value.trim() === '' ? 'Start date is required' : '';
      case 'endDate':
        // End date is only required if not currently employed
        if (!this.state.currentExperience.current && value.trim() === '') {
          return 'End date is required unless currently employed';
        }
        return '';
      case 'description':
        return value.trim() === '' ? 'Job description is required' : '';
      default:
        return '';
    }
  };

  // Validate the entire form
  validateForm = (): boolean => {
    const { title, company, startDate, endDate, current, description } = this.state.currentExperience;
    const errors: Record<string, string> = {};
    
    errors.title = this.validateField('title', title);
    errors.company = this.validateField('company', company);
    errors.startDate = this.validateField('startDate', startDate);
    
    // Only validate end date if not currently employed
    if (!current) {
      errors.endDate = this.validateField('endDate', endDate || '');
    }
    
    errors.description = this.validateField('description', description);
    
    this.setState({ formErrors: errors });
    
    // Check if we have any errors
    return !Object.values(errors).some(error => error !== '');
  };

  // Add a new work experience
  handleAddExperience = () => {
    if (!this.validateForm()) {
      return;
    }
    
    const { experiences, currentExperience, isEditing, editIndex } = this.state;
    let updatedExperiences: WorkExperience[];
    
    if (isEditing && editIndex !== null) {
      // Update existing experience
      updatedExperiences = [...experiences];
      updatedExperiences[editIndex] = currentExperience;
    } else {
      // Add new experience
      updatedExperiences = [...experiences, currentExperience];
    }
    
    this.setState({
      experiences: updatedExperiences,
      currentExperience: this.getEmptyExperience(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    });
    
    // Update parent component
    this.props.onExperiencesChange(updatedExperiences);
    
    // Save to localStorage
    localStorageManager.saveStepData('experiences', updatedExperiences);
  };

  // Edit an existing work experience
  handleEditExperience = (index: number) => {
    this.setState({
      currentExperience: { ...this.state.experiences[index] },
      isEditing: true,
      editIndex: index,
      formErrors: {}
    });
  };

  // Delete a work experience
  handleDeleteExperience = (index: number) => {
    const updatedExperiences = [...this.state.experiences];
    updatedExperiences.splice(index, 1);
    
    this.setState({ experiences: updatedExperiences });
    
    // Update parent component
    this.props.onExperiencesChange(updatedExperiences);
    
    // Save to localStorage
    localStorageManager.saveStepData('experiences', updatedExperiences);
  };

  // Cancel the current edit
  handleCancelEdit = () => {
    this.setState({
      currentExperience: this.getEmptyExperience(),
      isEditing: false,
      editIndex: null,
      formErrors: {}
    });
  };

  // Move to next step
  handleNext = () => {
    // Save experiences to localStorage
    localStorageManager.saveStepData('experiences', this.state.experiences);
    this.props.onNext();
  };

  // Format date for display
  formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  render() {
    const { experiences, currentExperience, isEditing, formErrors } = this.state;
    const { onPrev } = this.props;

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Work Experience
          </h3>
          <p className="text-gray-400 mt-2">
            Add your professional work history
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentExperience.title}
                  onChange={this.handleExperienceChange}
                  className={`w-full bg-black/80 border ${formErrors.title ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                  placeholder="e.g., Software Engineer Intern"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={currentExperience.company}
                  onChange={this.handleExperienceChange}
                  className={`w-full bg-black/80 border ${formErrors.company ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                  placeholder="e.g., Tech Solutions Inc."
                />
                {formErrors.company && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.company}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                Location <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={currentExperience.location || ''}
                onChange={this.handleExperienceChange}
                className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={currentExperience.startDate}
                  onChange={this.handleExperienceChange}
                  className={`w-full bg-black/80 border ${formErrors.startDate ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                />
                {formErrors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                    End Date
                    {!currentExperience.current && <span className="text-red-500">*</span>}
                  </label>
                </div>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={currentExperience.endDate || ''}
                  onChange={this.handleExperienceChange}
                  disabled={currentExperience.current}
                  className={`w-full bg-black/80 border ${formErrors.endDate ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300 ${currentExperience.current ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {formErrors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>
                )}
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="current"
                    name="current"
                    checked={currentExperience.current}
                    onChange={this.handleCurrentChange}
                    className="w-4 h-4 bg-black border-gray-700 rounded focus:ring-gray-600 text-gray-600 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="current" className="ml-2 text-sm text-gray-400">
                    I currently work here
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={currentExperience.description}
                onChange={this.handleExperienceChange}
                rows={4}
                className={`w-full bg-black/80 border ${formErrors.description ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300`}
                placeholder="Describe your responsibilities, achievements, and technologies used"
              />
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
              )}
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              {isEditing && (
                <button
                  onClick={this.handleCancelEdit}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-gray-800 hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={this.handleAddExperience}
                className="px-5 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition-all duration-300"
              >
                {isEditing ? 'Update Experience' : 'Add Experience'}
              </button>
            </div>
          </div>
        </div>

        {experiences.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              Your Work Experience
            </h4>
            
            <div className="space-y-3">
              {experiences.map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="bg-gray-900/40 rounded-lg p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="text-white font-medium">{exp.title}</h5>
                      <p className="text-gray-400">{exp.company}</p>
                      {exp.location && (
                        <p className="text-gray-500 text-sm">{exp.location}</p>
                      )}
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span>{this.formatDate(exp.startDate)} - {exp.current ? 'Present' : this.formatDate(exp.endDate || '')}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{exp.description}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => this.handleEditExperience(index)}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-1"
                        title="Edit experience"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => this.handleDeleteExperience(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete experience"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h5 className="text-gray-300 font-medium">No work experience added yet</h5>
            <p className="text-gray-500 text-sm mt-1">Add your internship or job experiences to demonstrate your professional background</p>
          </div>
        )}

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
            className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 flex items-center gap-2"
          >
            Continue to Contact Information
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
} 