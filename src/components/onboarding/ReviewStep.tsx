import React, { Component, FormEvent } from 'react';
import { Certification } from './CertificationsStep';
import { WorkExperience } from './ExperiencesStep';

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

interface StudentProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubProjects?: GitHubProject[];
  certifications?: Certification[];
  experiences?: WorkExperience[];
  location?: string;
  [key: string]: any;
}

interface ReviewStepProps {
  formData: StudentProfileData;
  projectsData: GitHubProject[];
  onSubmit: (e: FormEvent) => void;
  onPrev: () => void;
  isLoading: boolean;
}

export default class ReviewStep extends Component<ReviewStepProps> {
  state = {
    expandedReadme: null as number | null
  };

  toggleReadme = (index: number) => {
    this.setState(prevState => ({
      expandedReadme: prevState.expandedReadme === index ? null : index
    }));
  };

  render() {
    const { formData, projectsData, onSubmit, onPrev, isLoading } = this.props;
    const { expandedReadme } = this.state;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white">
            Review Your Profile
          </h3>
          <p className="text-gray-400 mt-2">
            Please review all your information before submitting
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-medium text-white mb-4">Personal Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">First Name</div>
                <div className="text-white">{formData.firstName}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Name</div>
                <div className="text-white">{formData.lastName}</div>
              </div>
              
              {formData.location && (
                <div className="col-span-1 md:col-span-2">
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formData.location}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-medium text-white mb-4">Educational Background</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">University/School</div>
                <div className="text-white">{formData.university}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Major/Course</div>
                <div className="text-white">{formData.major}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Graduation Year</div>
                <div className="text-white">{formData.graduationYear}</div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-medium text-white mb-4">Skills</h4>
            
            <div className="flex flex-wrap gap-2">
              {formData.skills && formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800/70 text-gray-300 border border-gray-700/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          {formData.certifications && formData.certifications.length > 0 && (
            <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-medium text-white mb-4">Professional Certifications</h4>
              
              <div className="space-y-4">
                {formData.certifications.map((cert, index) => (
                  <div key={cert.id || index} className="bg-gray-800/50 rounded-md p-4 border border-gray-700">
                    <h5 className="font-medium text-white">{cert.name}</h5>
                    <p className="text-sm text-gray-400">Issued by {cert.issuer}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>Issued: {new Date(cert.date).toLocaleDateString()}</span>
                      {cert.expiryDate && (
                        <span className="ml-3">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {cert.credentialUrl && (
                      <a 
                        href={cert.credentialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-300 hover:underline mt-2 inline-block"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience Section */}
          {formData.experiences && formData.experiences.length > 0 && (
            <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-medium text-white mb-4">Work Experience</h4>
              
              <div className="space-y-4">
                {formData.experiences.map((exp, index) => (
                  <div key={exp.id || index} className="bg-gray-800/50 rounded-md p-4 border border-gray-700">
                    <h5 className="font-medium text-white">{exp.title}</h5>
                    <p className="text-sm text-gray-400">{exp.company}</p>
                    {exp.location && (
                      <p className="text-xs text-gray-500">{exp.location}</p>
                    )}
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>
                        {new Date(exp.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })} - {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Projects Section */}
          <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-medium text-white mb-4">GitHub Projects</h4>
            
            {projectsData.length > 0 ? (
              <div className="space-y-4">
                {projectsData.map((project, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-800/50 rounded-md p-4 border border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <h5 className="font-medium text-white">{project.name}</h5>
                      
                      {/* GitHub stars if available */}
                      {project.stars !== undefined && (
                        <div className="flex items-center ml-auto">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-gray-400 ml-1">{project.stars}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Project description if available */}
                    {project.description && (
                      <p className="text-sm text-gray-400 mt-2 mb-2">{project.description}</p>
                    )}
                    
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-gray-300 hover:underline"
                    >
                      {project.url}
                    </a>
                    
                    {/* README expand/collapse section */}
                    {project.readme && (
                      <div className="mt-2">
                        <button
                          onClick={() => this.toggleReadme(index)}
                          className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d={expandedReadme === index 
                                ? "M19 9l-7 7-7-7" 
                                : "M9 5l7 7-7 7"} 
                            />
                          </svg>
                          {expandedReadme === index ? 'Hide README' : 'View Full README'}
                        </button>
                        
                        {expandedReadme === index && (
                          <div className="mt-3 p-3 bg-gray-900/80 rounded-md border border-gray-700/50 overflow-auto max-h-60">
                            <div className="prose prose-sm prose-invert">
                              <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono">
                                {project.readme}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Last updated date if available */}
                    {project.lastUpdated && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(project.lastUpdated).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short',
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="text-xs px-2 py-1 rounded-full bg-gray-800/70 text-gray-300 border border-gray-700/50"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 italic">No projects added</div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-medium text-white mb-4">Contact Information</h4>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Phone Number</div>
                <div className="text-white">{formData.phoneNumber}</div>
              </div>
              
              {formData.linkedinUrl && (
                <div>
                  <div className="text-sm text-gray-500">LinkedIn</div>
                  <div className="text-white">
                    <a 
                      href={formData.linkedinUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-300 hover:underline"
                    >
                      {formData.linkedinUrl}
                    </a>
                  </div>
                </div>
              )}
              
              {formData.githubUrl && (
                <div>
                  <div className="text-sm text-gray-500">GitHub</div>
                  <div className="text-white">
                    <a 
                      href={formData.githubUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-300 hover:underline"
                    >
                      {formData.githubUrl}
                    </a>
                  </div>
                </div>
              )}
              
              {formData.portfolioUrl && (
                <div>
                  <div className="text-sm text-gray-500">Portfolio Website</div>
                  <div className="text-white">
                    <a 
                      href={formData.portfolioUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-300 hover:underline"
                    >
                      {formData.portfolioUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-gradient-to-r from-gray-900/70 to-gray-900/90 rounded-lg p-6 border border-gray-800">
            <h4 className="text-lg font-medium text-white mb-4">About You</h4>
            
            <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
              <p className="text-gray-300 whitespace-pre-wrap">{formData.bio}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-2.5 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-white
              transition-all duration-300 shadow-lg
              ${isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-green-900/20'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : 'Complete Onboarding'}
          </button>
        </div>
      </div>
    );
  }
} 