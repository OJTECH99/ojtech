import React, { Component, createRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AuthContext } from '../providers/AuthProvider';
import { Loader2, Download, Code, FileText, Edit2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import cvGeneratorService from '../lib/api/cvGeneratorService';
import profileService from '../lib/api/profileService';
import { toast } from '../components/ui/toast-utils';
import { ToastContext } from '../providers/ToastContext';
import { ToastProps } from '../components/ui/use-toast';
import AlertDialog from '../components/ui/AlertDialog';
import resumeHtmlGenerator from '../lib/api/resumeHtmlGenerator';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

/**
 * ResumeManagementPage
 * 
 * This page handles the resume generation process using the Gemini AI API directly from the frontend.
 * The process follows these steps:
 * 
 * 1. User provides profile information (education, experience, skills, etc.)
 * 2. When the user clicks "Generate Resume", the frontend calls the Gemini API directly
 * 3. The AI generates ATS-optimized resume content following best practices from the Tech Interview Handbook
 * 4. The JSON response is saved to the backend database
 * 5. The resume is displayed to the user in a formatted HTML view
 * 6. User can download as PDF or view the raw JSON
 * 
 * The resume generation is optimized for Applicant Tracking Systems (ATS) with:
 * - Standard section headings (Summary, Experience, Education, Skills, etc.)
 * - Proper formatting and structure
 * - Action verbs and quantifiable achievements
 * - Keywords relevant to the user's field
 */

// Import the normalized API URL from apiConfig
import { normalizedApiBaseUrl } from '../apiConfig';

// Create an axios instance with the API base URL
const apiClient = axios.create({
  baseURL: normalizedApiBaseUrl
});

// Define the ResumeData interface to match the backend JSON structure
interface ResumeData {
  [key: string]: any;  // Add index signature
  professionalSummary: {
    summaryPoints: string[];
  };
  skills: {
    skillsList: string[];
  };
  experience: {
    experiences: {
      title: string;
      company: string;
      location?: string;
      dateRange: string;
      achievements: string[];
    }[];
  };
  projects: {
    projectsList: {
      name: string;
      technologies?: string;
      highlights: string[];
    }[];
  };
  education: {
    university: string;
    major: string;
    graduationYear?: string;
    location?: string;
  };
  certifications: {
    certificationsList: {
      name: string;
      issuer: string;
      dateReceived?: string;
    }[];
  };
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    address?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  personalInfo?: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
  };
}

// Add type definitions at the top of the file
interface User {
  id: string;
  roles: string[];
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  fetchUserProfile?: () => Promise<void>;
  // Add other context properties as needed
}

interface ResumeManagementPageProps {
  // Add any props if needed
}

interface ResumeManagementPageState {
  studentProfile: any | null;
  hasResume: boolean;
  cvData: any | null;
  resumeHtml: string | null;
  cvPreviewVisible: boolean;
  isGeneratingResume: boolean;
  loading: boolean;
  skills: string[];
  generatingCV: boolean;
  uploadLoading: boolean;
  isEditMode: boolean;
  editableData: ResumeData | null;
  showRegenerateConfirm: boolean;
}

// Student profile data structure
interface StudentProfileData {
  id?: number;
  activeCvId?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  skills?: string[];
  cvUrl?: string;
  cvFilename?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  hasCompletedOnboarding?: boolean;
  experiences?: any[];
  certifications?: any[];
  githubProjects?: any[];
}

// HTML Resume view component with iframe to safely render HTML content
const ResumeHtmlView: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [processedHtml, setProcessedHtml] = React.useState<string>(html);
  const [iframeLoaded, setIframeLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Helper function to generate HTML from JSON data
    const generateHTMLFromJSON = (jsonData: any): string => {
      try {
        return resumeHtmlGenerator.generateResumeHtml(jsonData);
      } catch (error) {
        console.error('Error in generateHTMLFromJSON:', error);
        return `
          <!DOCTYPE html>
          <html>
          <head><title>Resume</title></head>
          <body>
            <h1>Resume Generation Error</h1>
            <p>There was an error generating your resume. Please try again or contact support.</p>
          </body>
          </html>
        `;
      }
    };
    
    // Process HTML content - handle both JSON and HTML formats
    const processHtml = (content: string) => {
      console.log('Processing HTML content, length:', content.length);
      
      if (!content || content.trim() === '') {
        console.warn('Empty HTML content received');
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Resume</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                padding: 20px; 
                text-align: center;
                color: #4a5568;
                line-height: 1.6;
              }
              h1 { color: #2d3748; }
            </style>
          </head>
          <body>
            <h1>No Resume Content Available</h1>
            <p>Please try regenerating your resume.</p>
          </body>
          </html>
        `;
      }
      
      // Check if it looks like HTML
      const isHtml = content.includes('<!DOCTYPE html>') || 
                    content.includes('<html>') || 
                    (content.includes('<') && content.includes('</'));
      
      // Check if it looks like JSON
      const isJson = (content.startsWith('{') && content.endsWith('}')) || 
                     (content.includes('\\\"') && content.includes('\\\"'));
                   
      console.log('Content appears to be:', isHtml ? 'HTML' : isJson ? 'JSON' : 'Unknown format');
      
      // If it's already HTML, use it directly
      if (isHtml) {
        return content;
      }
      
      // If it might be JSON, try to parse and convert
      if (isJson) {
        try {
          // Handle multiple levels of escaping
          let processedContent = content;
          
          // Handle string with quotes at start and end
          if (processedContent.startsWith('"') && processedContent.endsWith('"')) {
            processedContent = processedContent.substring(1, processedContent.length - 1);
          }
          
          // Handle escaped quotes and backslashes
          processedContent = processedContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          
          // Parse the JSON data
          const jsonData = JSON.parse(processedContent);
          console.log('Successfully parsed JSON data:', Object.keys(jsonData));
          
          // Use our resumeHtmlGenerator to create HTML
          try {
            const htmlContent = resumeHtmlGenerator.generateResumeHtml(jsonData);
            console.log('Generated HTML from JSON with resumeHtmlGenerator, length:', htmlContent.length);
            return htmlContent;
          } catch (generatorError) {
            console.error('Error using resumeHtmlGenerator:', generatorError);
            // If the generator fails, fall back to legacy method
            const htmlContent = generateHTMLFromJSON(jsonData);
            console.log('Fallback: Generated HTML from JSON with legacy method, length:', htmlContent.length);
            return htmlContent;
          }
        } catch (error) {
          console.error('Error processing JSON content:', error);
          // If parsing fails, return a fallback HTML
          return `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Resume</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  padding: 20px; 
                  line-height: 1.6;
                }
                .error { 
                  color: #e53e3e; 
                  margin-bottom: 1rem;
                  padding: 1rem;
                  border-left: 4px solid #e53e3e;
                  background-color: #fff5f5;
                }
                h1 { color: #2d3748; }
                pre {
                  background-color: #f7fafc;
                  padding: 1rem;
                  border-radius: 0.25rem;
                  overflow: auto;
                  font-size: 0.875rem;
                }
              </style>
            </head>
            <body>
              <h1>Resume Parsing Error</h1>
              <p class="error">There was an error processing your resume data. Please try regenerating it.</p>
              <pre>${content.substring(0, 200)}...</pre>
            </body>
            </html>
          `;
        }
      }
      
      // If we couldn't determine the format, wrap it in basic HTML
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #2d3748;
            }
            pre {
              background-color: #f7fafc;
              padding: 1rem;
              border-radius: 0.25rem;
              overflow: auto;
              font-size: 0.875rem;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
        </body>
        </html>
      `;
    };
    
    // Process the HTML content and update state
    try {
      const processed = processHtml(html);
      console.log('Setting processed HTML, length:', processed.length);
      setProcessedHtml(processed);
      setIframeLoaded(false); // Reset loaded state when content changes
    } catch (error) {
      console.error('Error processing HTML:', error);
      // Set a fallback HTML on error
      setProcessedHtml(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
            }
            .error { 
              color: #e53e3e; 
              padding: 1rem;
              border-left: 4px solid #e53e3e;
              background-color: #fff5f5;
            }
          </style>
        </head>
        <body>
          <h1>Error Loading Resume</h1>
          <p class="error">There was an error processing your resume. Please try regenerating it.</p>
        </body>
        </html>
      `);
    }
  }, [html]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Iframe loaded!');
    setIframeLoaded(true);
    
    // Check if iframe content is loaded correctly
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const bodyContent = iframeDoc.body.innerHTML;
          console.log('Iframe body content length:', bodyContent.length);
        }
      } catch (e) {
        console.error('Error checking iframe content:', e);
      }
    }
  };

  return (
    <div className="relative">
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-center text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white mx-auto mb-4"></div>
            <p>Loading resume...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Resume Preview"
        className="w-full h-[800px] border-0 bg-white rounded-b-lg"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={processedHtml}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

// Create a default resume data structure
const createEmptyResumeData = (): ResumeData => ({
  professionalSummary: {
    summaryPoints: []
  },
  skills: {
    skillsList: []
  },
  experience: {
    experiences: []
  },
  projects: {
    projectsList: []
  },
  education: {
    university: '',
    major: '',
    graduationYear: '',
    location: ''
  },
  certifications: {
    certificationsList: []
  },
  contactInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: ''
  }
});

// EditableResumeView component for editing resume content
const EditableResumeView: React.FC<{
  data: ResumeData;
  onSave: (data: ResumeData) => void;
  onCancel: () => void;
}> = ({ data, onSave, onCancel }) => {
  const [editedData, setEditedData] = React.useState<ResumeData>(data || createEmptyResumeData());

  const handleChange = (section: keyof ResumeData, field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: keyof ResumeData, index: number, field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [Array.isArray(prev[section]) ? index : field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(editedData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <div className="flex justify-end gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col">
        {/* Header - Full Name and Professional Title */}
        <div className="mb-6 text-center bg-background ">
          <Input
            value={editedData.contactInfo.name}
            onChange={(e) => handleChange('contactInfo', 'name', e.target.value)}
            placeholder="Full Name"
            className="text-center text-2xl font-bold uppercase mb-2"
          />
          <Input
            placeholder="Professional Title"
            className="text-center"
            value="PROFESSIONAL"
         
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Contact and Skills */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">CONTACT</h2>
              <div className="space-y-3">
                <Input
                  value={editedData.contactInfo.email}
                  onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                  placeholder="Email"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.contactInfo.phone || ''}
                  onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                  placeholder="Phone"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.contactInfo.location || ''}
                  onChange={(e) => handleChange('contactInfo', 'location', e.target.value)}
                  placeholder="Location"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.contactInfo.github || ''}
                  onChange={(e) => handleChange('contactInfo', 'github', e.target.value)}
                  placeholder="GitHub URL"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.contactInfo.linkedin || ''}
                  onChange={(e) => handleChange('contactInfo', 'linkedin', e.target.value)}
                  placeholder="LinkedIn URL"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.contactInfo.portfolio || ''}
                  onChange={(e) => handleChange('contactInfo', 'portfolio', e.target.value)}
                  placeholder="Portfolio URL"
                  className='bg-white text-gray-800'
                />
              </div>
            </section>

            {/* Skills */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">SKILLS</h2>
              <div className="space-y-3">
                {editedData.skills.skillsList.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...editedData.skills.skillsList];
                        newSkills[index] = e.target.value;
                        handleChange('skills', 'skillsList', newSkills);
                      }}
                      placeholder={`Skill ${index + 1}`}
                      className="flex-1 bg-white text-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSkills = editedData.skills.skillsList.filter((_, i) => i !== index);
                        handleChange('skills', 'skillsList', newSkills);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSkills = [...editedData.skills.skillsList, ''];
                    handleChange('skills', 'skillsList', newSkills);
                  }}
                >
                  Add Skill
                </Button>
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">EDUCATION</h2>
              <div className="space-y-3">
                <Input
                  value={editedData.education.university}
                  onChange={(e) => handleChange('education', 'university', e.target.value)}
                  placeholder="University"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.education.major}
                  onChange={(e) => handleChange('education', 'major', e.target.value)}
                  placeholder="Major"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.education.graduationYear || ''}
                  onChange={(e) => handleChange('education', 'graduationYear', e.target.value)}
                  placeholder="Graduation Year"
                  className='bg-white text-gray-800'
                />
                <Input
                  value={editedData.education.location || ''}
                  onChange={(e) => handleChange('education', 'location', e.target.value)}
                  placeholder="Location"
                  className='bg-white text-gray-800'
                />
              </div>
            </section>
          </div>

          {/* Right Column - Professional Summary, Experience, Projects */}
          <div className="w-full md:w-2/3 space-y-8">
            {/* Professional Summary */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">PROFESSIONAL SUMMARY</h2>
              <div className="space-y-3">
                {editedData.professionalSummary.summaryPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...editedData.professionalSummary.summaryPoints];
                        newPoints[index] = e.target.value;
                        handleChange('professionalSummary', 'summaryPoints', newPoints);
                      }}
                      placeholder={`Summary point ${index + 1}`}
                      className=" w-full bg-white text-gray-800"
                    
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPoints = editedData.professionalSummary.summaryPoints.filter((_, i) => i !== index);
                        handleChange('professionalSummary', 'summaryPoints', newPoints);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPoints = [...editedData.professionalSummary.summaryPoints, ''];
                    handleChange('professionalSummary', 'summaryPoints', newPoints);
                  }}
                >
                  Add Summary Point
                </Button>
              </div>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">EXPERIENCE</h2>
              <div className="space-y-6">
                {editedData.experience.experiences.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="space-y-3">
                      <Input
                        value={exp.title}
                        onChange={(e) => {
                          const newExp = [...editedData.experience.experiences];
                          newExp[index] = { ...newExp[index], title: e.target.value };
                          handleChange('experience', 'experiences', newExp);
                        }}
                        placeholder="Job Title"
                        label="Title"
                      />
                      <Input
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...editedData.experience.experiences];
                          newExp[index] = { ...newExp[index], company: e.target.value };
                          handleChange('experience', 'experiences', newExp);
                        }}
                        placeholder="Company"
                        label="Company"
                      />
                      <div className="flex gap-3">
                        <Input
                          value={exp.location}
                          onChange={(e) => {
                            const newExp = [...editedData.experience.experiences];
                            newExp[index] = { ...newExp[index], location: e.target.value };
                            handleChange('experience', 'experiences', newExp);
                          }}
                          placeholder="Location"
                          label="Location"
                          className="flex-1"
                        />
                        <Input
                          value={exp.dateRange}
                          onChange={(e) => {
                            const newExp = [...editedData.experience.experiences];
                            newExp[index] = { ...newExp[index], dateRange: e.target.value };
                            handleChange('experience', 'experiences', newExp);
                          }}
                          placeholder="Date Range"
                          label="Date Range"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Achievements</label>
                      {exp.achievements.map((achievement, achIndex) => (
                        <div key={achIndex} className="flex gap-2">
                          <Textarea
                            value={achievement}
                            onChange={(e) => {
                              const newExp = [...editedData.experience.experiences];
                              newExp[index].achievements[achIndex] = e.target.value;
                              handleChange('experience', 'experiences', newExp);
                            }}
                            placeholder={`Achievement ${achIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newExp = [...editedData.experience.experiences];
                              newExp[index].achievements = newExp[index].achievements.filter((_, i) => i !== achIndex);
                              handleChange('experience', 'experiences', newExp);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newExp = [...editedData.experience.experiences];
                          newExp[index].achievements.push('');
                          handleChange('experience', 'experiences', newExp);
                        }}
                      >
                        Add Achievement
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newExp = editedData.experience.experiences.filter((_, i) => i !== index);
                        handleChange('experience', 'experiences', newExp);
                      }}
                    >
                      Remove Experience
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newExp = [...editedData.experience.experiences, {
                      title: '',
                      company: '',
                      location: '',
                      dateRange: '',
                      achievements: []
                    }];
                    handleChange('experience', 'experiences', newExp);
                  }}
                >
                  Add Experience
                </Button>
              </div>
            </section>

            {/* Projects */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">PROJECTS</h2>
              <div className="space-y-6">
                {editedData.projects.projectsList.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="space-y-3">
                      <Input
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...editedData.projects.projectsList];
                          newProjects[index] = { ...newProjects[index], name: e.target.value };
                          handleChange('projects', 'projectsList', newProjects);
                        }}
                        placeholder="Project Name"
                        label="Name"
                        className='bg-white text-gray-800'
                      />
                      <Input
                        value={project.technologies || ''}
                        onChange={(e) => {
                          const newProjects = [...editedData.projects.projectsList];
                          newProjects[index] = { ...newProjects[index], technologies: e.target.value };
                          handleChange('projects', 'projectsList', newProjects);
                        }}
                        placeholder="Technologies Used"
                        label="Technologies"
                        className="bg-white text-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Highlights</label>
                      {project.highlights.map((highlight, hlIndex) => (
                        <div key={hlIndex} className="flex gap-2">
                          <Textarea
                            value={highlight}
                            onChange={(e) => {
                              const newProjects = [...editedData.projects.projectsList];
                              newProjects[index].highlights[hlIndex] = e.target.value;
                              handleChange('projects', 'projectsList', newProjects);
                            }}
                            placeholder={`Highlight ${hlIndex + 1}`}
                            className="flex-1  bg-white text-gray-800"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newProjects = [...editedData.projects.projectsList];
                              newProjects[index].highlights = newProjects[index].highlights.filter((_, i) => i !== hlIndex);
                              handleChange('projects', 'projectsList', newProjects);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProjects = [...editedData.projects.projectsList];
                          newProjects[index].highlights.push('');
                          handleChange('projects', 'projectsList', newProjects);
                        }}
                      >
                        Add Highlight
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newProjects = editedData.projects.projectsList.filter((_, i) => i !== index);
                        handleChange('projects', 'projectsList', newProjects);
                      }}
                    >
                      Remove Project
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newProjects = [...editedData.projects.projectsList, {
                      name: '',
                      technologies: '',
                      highlights: []
                    }];
                    handleChange('projects', 'projectsList', newProjects);
                  }}
                >
                  Add Project
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export class ResumeManagementPage extends Component<ResumeManagementPageProps, ResumeManagementPageState> {
  declare context: AuthContextType;
  static contextType = AuthContext;
  
  private readonly API_BASE_URL: string;
  
  constructor(props: ResumeManagementPageProps) {
    super(props);
    this.API_BASE_URL = normalizedApiBaseUrl;
    
    // Ensure API URL is properly set
    console.log('Resume Management page using API base URL:', this.API_BASE_URL);
    
    // Bind methods to this instance
    this.parseResumeContent = this.parseResumeContent.bind(this);
    this.loadResumeData = this.loadResumeData.bind(this);
    this.loadStudentProfile = this.loadStudentProfile.bind(this);
    this.loadUserProfile = this.loadUserProfile.bind(this);
    this.handleGenerateCV = this.handleGenerateCV.bind(this);
    this.handleDownloadCV = this.handleDownloadCV.bind(this);
    this.handleLogResumeData = this.handleLogResumeData.bind(this);
    this.toggleCVPreview = this.toggleCVPreview.bind(this);
    this.handleViewRawJSON = this.handleViewRawJSON.bind(this);
    
    this.state = {
      studentProfile: null,
      hasResume: false,
      cvData: null,
      resumeHtml: null,
      cvPreviewVisible: true,
      isGeneratingResume: false,
      loading: true,
      skills: [],
      generatingCV: false,
      uploadLoading: false,
      isEditMode: false,
      editableData: null,
      showRegenerateConfirm: false
    };
  }
  
  componentDidMount() {
    this.loadUserProfile();
  }
  
  // Get the token from localStorage or context
  getAuthToken = (): string | null => {
    // First try from context
    const { user } = this.context || {};
    if (user?.accessToken) {
      return user.accessToken;
    }
    
    // Then try from localStorage as standalone token
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
    
    // Finally, try to parse from the user object in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData?.accessToken) {
          return userData.accessToken;
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    return null;
  };
  
  // Load user profile data
  loadUserProfile = async () => {
    try {
      const { user, fetchUserProfile } = this.context || {};
      
      if (!user) {
        console.log("User not found in context, attempting to refresh");
        // Instead of immediately logging out, try to refresh the user profile
        try {
          // Call the fetchUserProfile method from AuthContext to refresh authentication
          if (fetchUserProfile) {
            await fetchUserProfile();
            // After refreshing, check again
            const refreshedUser = this.context?.user;
            if (!refreshedUser) {
              console.log("Still not authenticated after refresh, redirecting to login");
              window.location.href = '/login';
              return;
            }
          } else {
            window.location.href = '/login';
            return;
          }
        } catch (refreshError) {
          console.error("Failed to refresh user data:", refreshError);
          window.location.href = '/login';
          return;
        }
      }
      
      const token = this.getAuthToken();
      if (!token) {
        console.log("No token found anywhere, redirecting to login");
        window.location.href = '/login';
        return;
      }
      
      // Determine if the user is a student or employer
      const currentUser = user || (this.context && this.context.user);
      const isStudent = currentUser?.roles?.includes('ROLE_STUDENT');
      
      if (isStudent) {
        try {
          await this.loadStudentProfile(token);
          await this.loadResumeData(token);
        } catch (profileError) {
          console.error('Error loading student profile:', profileError);
          // Don't log out immediately for profile errors
          // The profile might not exist yet, but authentication could still be valid
        }
      } else {
        // Not a student, redirect to profile
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't redirect to login here - just show an error state
    } finally {
      this.setState({ loading: false });
    }
  };
  
  // Load student profile
  loadStudentProfile = async (token: string) => {
    try {
      console.log('Attempting to load student profile data');
      
      // Use smart profile fetching that adapts to user role
      const profileData = await profileService.getCurrentUserProfileSmart();
      
      if (profileData) {
        console.log('Profile loaded:', profileData);
        
        // Parse GitHub projects if they come as a string
        let githubProjects = profileData.githubProjects;
        if (typeof githubProjects === 'string') {
          try {
            githubProjects = JSON.parse(githubProjects);
          } catch (e) {
            console.error('Error parsing GitHub projects JSON:', e);
            githubProjects = [];
          }
        }
        
        // Create a properly formatted student profile object with safe defaults
        const studentProfileData: StudentProfileData = {
          id: profileData.id || null,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phoneNumber: profileData.phoneNumber || '',
          location: profileData.location || '',
          address: profileData.address || '',
          university: profileData.university || '',  
          major: profileData.major || '',
          graduationYear: profileData.graduationYear || null,
          bio: profileData.bio || '',
          linkedinUrl: profileData.linkedinUrl || '',
          githubUrl: profileData.githubUrl || '',
          portfolioUrl: profileData.portfolioUrl || '',
          hasCompletedOnboarding: profileData.hasCompletedOnboarding || false,
          skills: Array.isArray(profileData.skills) ? profileData.skills : [],
          experiences: Array.isArray(profileData.experiences) ? profileData.experiences : [],
          certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
          githubProjects: Array.isArray(githubProjects) ? githubProjects : []
        };
        
        console.log('Processed profile data:', studentProfileData);
        
        this.setState({ 
          studentProfile: studentProfileData,
          skills: Array.isArray(profileData.skills) ? profileData.skills : []
        });
      }
    } catch (error: any) {
      console.error('Error loading student profile (primary):', error);
      
      // If 404 errors, try a fallback to the profiles/me endpoint
      if (error.response && error.response.status === 404) {
        try {
          console.log('Student profile not found, trying fallback endpoint');
          const fallbackResponse = await apiClient.get('/profiles/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (fallbackResponse.data) {
            console.log('Fallback profile loaded:', fallbackResponse.data);
            
            // Parse GitHub projects if they come as a string
            let githubProjects = fallbackResponse.data.githubProjects;
            if (typeof githubProjects === 'string') {
              try {
                githubProjects = JSON.parse(githubProjects);
              } catch (e) {
                console.error('Error parsing GitHub projects JSON in fallback:', e);
                githubProjects = [];
              }
            }
            
            // Convert the generic profile data to student profile format with safe defaults
            const profileData: StudentProfileData = {
              id: fallbackResponse.data.id || null,
              firstName: fallbackResponse.data.firstName || '',
              lastName: fallbackResponse.data.lastName || '',
              phoneNumber: fallbackResponse.data.phoneNumber || '',
              location: fallbackResponse.data.location || '',
              address: fallbackResponse.data.address || '',
              university: fallbackResponse.data.university || '',
              major: fallbackResponse.data.major || '',
              graduationYear: fallbackResponse.data.graduationYear || null,
              bio: fallbackResponse.data.bio || '',
              linkedinUrl: fallbackResponse.data.linkedinUrl || '',
              githubUrl: fallbackResponse.data.githubUrl || '',
              portfolioUrl: fallbackResponse.data.portfolioUrl || '',
              hasCompletedOnboarding: fallbackResponse.data.hasCompletedOnboarding || false,
              skills: Array.isArray(fallbackResponse.data.skills) ? fallbackResponse.data.skills : [],
              experiences: Array.isArray(fallbackResponse.data.experiences) ? fallbackResponse.data.experiences : [],
              certifications: Array.isArray(fallbackResponse.data.certifications) ? fallbackResponse.data.certifications : [],
              githubProjects: Array.isArray(githubProjects) ? githubProjects : []
            };
            
            this.setState({ 
              studentProfile: profileData,
              skills: Array.isArray(fallbackResponse.data.skills) ? fallbackResponse.data.skills : []
            });
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback profile load also failed:', fallbackError);
          // Set empty profile state
          this.setState({ 
            studentProfile: {
              firstName: '',
              lastName: '',
              university: '',
              major: '',
              bio: '',
              phoneNumber: '',
              skills: [],
              experiences: [],
              certifications: [],
              githubProjects: []
            } 
          });
        }
      }
    }
  };
  
  // Load resume data
  loadResumeData = async (token: string | null) => {
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    try {
      const response = await apiClient.get(`/cvs/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Resume data loaded:', response.data);
      
      if (response.data && response.data.length > 0) {
        const cvData = response.data[0]; // Get the first CV if array
        this.setState({ 
          cvData: cvData,
          hasResume: true
        });
        
        // Make sure we have a valid ID before loading the content
        if (cvData.id) {
          // Load the CV content
          try {
            const contentResponse = await apiClient.get(`/cvs/${cvData.id}/content`, {
              headers: { 'Authorization': `Bearer ${token}` },
              responseType: 'text',
              // Accept any status code to handle errors gracefully
              validateStatus: (status) => true
            });
            
            // Check if the response was successful
            if (contentResponse.status >= 200 && contentResponse.status < 300) {
              if (contentResponse.data) {
                const contentStr = contentResponse.data;
                console.log('Resume content loaded, length:', contentStr.length);
                
                // Check if it looks like HTML
                const isHtml = contentStr.includes('<!DOCTYPE html>') || 
                              contentStr.includes('<html>') || 
                              (contentStr.includes('<') && contentStr.includes('</'));
                
                // If it's HTML, use it directly
                if (isHtml) {
                  console.log('Content is HTML, using directly');
                  this.setState({
                    resumeHtml: contentStr,
                    cvPreviewVisible: true
                  });
                  return;
                }
                
                // Otherwise, treat as JSON
                try {
                  // Parse and convert to HTML
                  const jsonData = JSON.parse(contentStr);
                  const resumeHtml = this.generateHTMLFromJSON(jsonData);
                  console.log('Parsed JSON data and generated HTML, length:', resumeHtml.length);
                  
                  // Save the generated HTML back to the backend for future use
                  try {
                    await cvGeneratorService.saveResumeHtml(cvData.id, resumeHtml);
                    console.log('Successfully saved HTML content to backend');
                  } catch (saveError) {
                    console.error('Error saving HTML content to backend:', saveError);
                    // Continue even if saving fails
                  }
                  
                  this.setState({
                    resumeHtml,
                    cvPreviewVisible: true
                  });
                } catch (e) {
                  console.error('Error parsing JSON content:', e);
                  this.setState({ 
                    resumeHtml: contentStr, // Fall back to raw content
                    cvPreviewVisible: true
                  });
                }
              } else {
                console.warn('CV content response was empty');
                this.setState({ 
                  resumeHtml: null,
                  cvPreviewVisible: false
                });
              }
            } else {
              // Handle error responses
              console.error(`Error loading CV content, status: ${contentResponse.status}`, contentResponse.data);
              
              if (contentResponse.status === 500) {
                // For server errors, try to regenerate a fresh CV
                this.showToast({
                  title: "Resume Data Issue",
                  description: "There was a problem loading your existing resume. You may need to regenerate it.",
                  variant: "destructive"
                });
              }
              
              // Keep the CV data but don't show content
              this.setState({ 
                resumeHtml: null,
                cvPreviewVisible: false
              });
            }
          } catch (contentError) {
            console.error('Error loading CV content:', contentError);
            this.setState({ 
              resumeHtml: null,
              cvPreviewVisible: false
            });
          }
        } else {
          console.warn('CV data missing ID, cannot load content');
        }
      } else if (response.data && !Array.isArray(response.data)) {
        // Handle case where response.data is a single object, not an array
        const cvData = response.data;
        this.setState({ 
          cvData: cvData,
          hasResume: true
        });
        
        // Make sure we have a valid ID before loading the content
        if (cvData.id) {
          // Load the CV content
          try {
            const contentResponse = await apiClient.get(`/cvs/${cvData.id}/content`, {
              headers: { 'Authorization': `Bearer ${token}` },
              responseType: 'text',
              // Accept any status code to handle errors gracefully
              validateStatus: (status) => true
            });
            
            // Check if the response was successful
            if (contentResponse.status >= 200 && contentResponse.status < 300) {
              if (contentResponse.data) {
                const contentStr = contentResponse.data;
                console.log('Resume content loaded, length:', contentStr.length);
                
                // Check if it looks like HTML
                const isHtml = contentStr.includes('<!DOCTYPE html>') || 
                              contentStr.includes('<html>') || 
                              (contentStr.includes('<') && contentStr.includes('</'));
                
                // If it's HTML, use it directly
                if (isHtml) {
                  console.log('Content is HTML, using directly');
                  this.setState({
                    resumeHtml: contentStr,
                    cvPreviewVisible: true
                  });
                  return;
                }
                
                // Otherwise, treat as JSON
                try {
                  // Parse and convert to HTML
                  const jsonData = JSON.parse(contentStr);
                  const resumeHtml = this.generateHTMLFromJSON(jsonData);
                  console.log('Parsed JSON data and generated HTML, length:', resumeHtml.length);
                  
                  // Save the generated HTML back to the backend for future use
                  try {
                    await cvGeneratorService.saveResumeHtml(cvData.id, resumeHtml);
                    console.log('Successfully saved HTML content to backend');
                  } catch (saveError) {
                    console.error('Error saving HTML content to backend:', saveError);
                    // Continue even if saving fails
                  }
                  
                  this.setState({
                    resumeHtml,
                    cvPreviewVisible: true
                  });
                } catch (e) {
                  console.error('Error parsing JSON content:', e);
                  this.setState({ 
                    resumeHtml: contentStr, // Fall back to raw content
                    cvPreviewVisible: true
                  });
                }
              } else {
                console.warn('CV content response was empty');
                this.setState({ 
                  resumeHtml: null,
                  cvPreviewVisible: false
                });
              }
            } else {
              // Handle error responses
              console.error(`Error loading CV content, status: ${contentResponse.status}`, contentResponse.data);
              
              if (contentResponse.status === 500) {
                // For server errors, try to regenerate a fresh CV
                this.showToast({
                  title: "Resume Data Issue",
                  description: "There was a problem loading your existing resume. You may need to regenerate it.",
                  variant: "destructive"
                });
              }
              
              // Keep the CV data but don't show content
              this.setState({ 
                resumeHtml: null,
                cvPreviewVisible: false
              });
            }
          } catch (contentError) {
            console.error('Error loading CV content:', contentError);
            this.setState({ 
              resumeHtml: null,
              cvPreviewVisible: false
            });
          }
        } else {
          console.warn('CV data missing ID, cannot load content');
        }
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      this.setState({ hasResume: false });
    } finally {
      this.setState({ loading: false });
    }
  };
  
  // Handle generate/regenerate CV button click
  handleGenerateCVClick = () => {
    const { resumeHtml } = this.state;
    
    // If CV already exists, show confirmation modal
    if (resumeHtml) {
      this.setState({ showRegenerateConfirm: true });
    } else {
      // If no CV exists, generate directly
      this.handleGenerateCV();
    }
  };

  // Handle generating CV using Gemini API
  handleGenerateCV = async () => {
    const { studentProfile } = this.state;
    const { user } = this.context || {};
    
    if (!studentProfile) {
      this.showToast({
        title: "Error",
        description: "Please complete your profile information first",
        variant: "destructive"
      });
      return;
    }
    
    this.setState({ generatingCV: true });
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Starting CV generation process with token:', token.substring(0, 15) + '...');
      
      // Prepare the profile data for CV generation
      const profileData: Record<string, any> = {
        firstName: studentProfile.firstName || '',
        lastName: studentProfile.lastName || '',
        email: user?.email || '',
        phoneNumber: studentProfile.phoneNumber || '',
        location: studentProfile.location || '',
        address: studentProfile.address || '',
        university: studentProfile.university || '',
        major: studentProfile.major || '',
        graduationYear: studentProfile.graduationYear || '',
        bio: studentProfile.bio || '',
        githubUrl: studentProfile.githubUrl || '',
        linkedinUrl: studentProfile.linkedinUrl || '',
        portfolioUrl: studentProfile.portfolioUrl || '',
        skills: Array.isArray(studentProfile.skills) ? studentProfile.skills : [],
        experiences: Array.isArray(studentProfile.experiences) ? studentProfile.experiences : [],
        certifications: Array.isArray(studentProfile.certifications) ? studentProfile.certifications : [],
        githubProjects: Array.isArray(studentProfile.githubProjects) ? studentProfile.githubProjects : []
      };
      
      console.log('Resume Generation - Profile Data:', profileData);
      
      // Use the cvGeneratorService instead of direct API call
      const result = await cvGeneratorService.generateCV(profileData);
      
      console.log('CV Generation Result:', result);
      
      if (result && result.id) {
        // Store the CV ID for future reference
        const cvId = result.id;
        
        try {
          // Wait a moment for the backend to process the data
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Fetch the CV content directly from the API to ensure we get the latest data
          console.log('Fetching newly created CV content from API');
          const contentStr = await cvGeneratorService.getCVContent(cvId, token, 3);
          
          console.log('Successfully retrieved CV content, length:', contentStr?.length || 0);
          
          // Generate HTML from the retrieved data
          let resumeHtml = '';
          
          // Try to parse the content as JSON if it looks like JSON
          if (contentStr && (contentStr.trim().startsWith('{') || contentStr.trim().startsWith('['))) {
            try {
              const jsonData = JSON.parse(contentStr);
              resumeHtml = this.generateHTMLFromJSON(jsonData);
              console.log('Parsed content as JSON and generated HTML');
              
              // Save the HTML content back to the server
              try {
                await cvGeneratorService.saveResumeHtml(cvId, resumeHtml);
                console.log('Successfully saved HTML content to backend');
              } catch (saveError) {
                console.error('Error saving HTML content to backend:', saveError);
                // Continue even if saving fails
              }
            } catch (e) {
              console.error('Error parsing content as JSON:', e);
              // If it's not valid JSON, use the raw content
              resumeHtml = contentStr;
            }
          } else if (contentStr) {
            // If it's not JSON, use the raw content
            resumeHtml = contentStr;
          } else if (result.jsonContent) {
            // Fallback: If API fetch failed but we have jsonContent from the generation result
            resumeHtml = this.generateHTMLFromJSON(result.jsonContent);
            console.log('Using jsonContent from generation result, generated HTML length:', resumeHtml.length);
            
            // Save the HTML content back to the server
            try {
              await cvGeneratorService.saveResumeHtml(cvId, resumeHtml);
              console.log('Successfully saved HTML content to backend');
            } catch (saveError) {
              console.error('Error saving HTML content to backend:', saveError);
              // Continue even if saving fails
            }
          }
          
          // Update state with the CV data and HTML content
          this.setState({
            hasResume: true,
            resumeHtml,
            cvPreviewVisible: true,
            cvData: {
              id: cvId,
              parsedResume: typeof result.jsonContent === 'object' ? 
                JSON.stringify(result.jsonContent) : result.jsonContent
            }
          });
          
          this.showToast({
            title: "Success",
            description: "Resume generated successfully",
            variant: "default"
          });
        } catch (contentError) {
          console.error('Error fetching CV content after generation:', contentError);
          
          // Fallback to using the result.jsonContent if API fetch failed
          if (result.jsonContent) {
            const htmlContent = this.generateHTMLFromJSON(result.jsonContent);
            console.log('Fallback: Generated HTML from jsonContent, length:', htmlContent.length);
            
            // Save the HTML content back to the server
            try {
              await cvGeneratorService.saveResumeHtml(cvId, htmlContent);
              console.log('Successfully saved HTML content to backend');
            } catch (saveError) {
              console.error('Error saving HTML content to backend:', saveError);
              // Continue even if saving fails
            }
            
            this.setState({
              hasResume: true,
              resumeHtml: htmlContent,
              cvPreviewVisible: true,
              cvData: {
                id: cvId,
                parsedResume: typeof result.jsonContent === 'object' ? 
                  JSON.stringify(result.jsonContent) : result.jsonContent
              }
            });
            
            this.showToast({
              title: "Success",
              description: "Resume generated successfully (using local data)",
              variant: "default"
            });
          } else {
            throw new Error('Failed to retrieve CV content after generation');
          }
        }
      } else {
        throw new Error('Failed to generate resume - no data returned');
      }
    } catch (error: any) {
      console.error('Error generating CV:', error);
      
      // Check for specific error messages
      if (error.message && error.message.includes('API key is not configured')) {
        this.showToast({
          title: "Configuration Error",
          description: "Gemini API key is not configured. Please check your environment settings.",
          variant: "destructive"
        });
      } else if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.error) {
          this.showToast({
            title: "Error",
            description: errorData.error,
            variant: "destructive"
          });
        } else {
          this.showToast({
            title: "Error",
            description: "Failed to generate resume. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        this.showToast({
          title: "Error",
          description: "Failed to generate resume. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      this.setState({ generatingCV: false });
    }
  };
  
  // Handle viewing the raw JSON response
  handleViewRawJSON = async () => {
    const { cvData } = this.state;
    const token = this.getAuthToken();
    
    if (!cvData || !cvData.id || !token) {
      this.showToast({
        title: "Error",
        description: "No CV data available",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Getting raw JSON for CV ID:', cvData.id);
      
      // First try to use the cached parsedResume if available
      let contentStr = '';
      let jsonData = null;
      let fetchSuccessful = false;
      
      // Try to fetch from API first
      try {
        console.log('Attempting to fetch CV content from API');
        // Fetch the raw content from the API
        const response = await apiClient.get(`/cvs/${cvData.id}/content`, {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'text'
        });
        
        if (response.data) {
          contentStr = response.data;
          console.log('Raw content loaded from API, length:', contentStr.length);
          fetchSuccessful = true;
        }
      } catch (fetchError) {
        console.error('Error fetching CV content from API:', fetchError);
        // Continue to fallback
      }
      
      // If API fetch failed, try to use the cached data
      if (!fetchSuccessful && cvData.parsedResume) {
        console.log('Using cached parsed resume data');
        contentStr = typeof cvData.parsedResume === 'string' ? 
          cvData.parsedResume : JSON.stringify(cvData.parsedResume);
      }
      
      // If we still don't have content, show an error
      if (!contentStr) {
        this.showToast({
          title: "Error",
          description: "No resume content available",
          variant: "destructive"
        });
        return;
      }
      
      // Try to parse and format the JSON
      try {
        // If it's a string starting with { or [, parse it
        if (typeof contentStr === 'string' && 
            (contentStr.trim().startsWith('{') || contentStr.trim().startsWith('['))) {
          jsonData = JSON.parse(contentStr);
        } else {
          jsonData = { content: contentStr };
        }
        
        // Format the JSON with indentation
        const formattedJson = JSON.stringify(jsonData, null, 2);
        
        // Open in a new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Raw Resume JSON</title>
              <style>
                body { 
                  background-color: #1e1e1e; 
                  color: #d4d4d4; 
                  font-family: 'Consolas', 'Monaco', monospace;
                  padding: 20px;
                  margin: 0;
                }
                pre { 
                  white-space: pre-wrap; 
                  word-wrap: break-word;
                  margin: 0;
                  padding: 20px;
                  background-color: #252526;
                  border-radius: 4px;
                  overflow: auto;
                }
                .json-key { color: #9cdcfe; }
                .json-string { color: #ce9178; }
                .json-number { color: #b5cea8; }
                .json-boolean { color: #569cd6; }
                .json-null { color: #569cd6; }
              </style>
            </head>
            <body>
              <pre>${this.syntaxHighlight(formattedJson)}</pre>
            </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          console.error('Failed to open new window');
          this.showToast({
            title: "Error",
            description: "Failed to open window. Please check your popup blocker settings.",
            variant: "destructive"
          });
        }
      } catch (e) {
        console.error('Error parsing or displaying JSON:', e);
        this.showToast({
          title: "Error",
          description: "Failed to parse JSON content",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in handleViewRawJSON:', error);
      this.showToast({
        title: "Error",
        description: "Failed to load raw JSON",
        variant: "destructive"
      });
    }
  };
  
  // Helper method to syntax highlight JSON
  syntaxHighlight = (json: string): string => {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
        (match) => {
          let cls = 'json-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'json-key';
            } else {
              cls = 'json-string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
          } else if (/null/.test(match)) {
            cls = 'json-null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };
  
  // Download the generated CV as PDF
  handleDownloadCV = async () => {
    const { resumeHtml, studentProfile } = this.state;
    
    if (!resumeHtml) {
      this.showToast({
        title: "Error",
        description: "No resume content to download",
        variant: "destructive"
      });
      return;
    }
    
    try {
      this.setState({ uploadLoading: true });
      
      // Generate a filename based on the student's name
      let firstName = studentProfile?.firstName || 'Resume';
      let lastName = studentProfile?.lastName || '';
      
      const filename = `${firstName}_${lastName}_Resume.pdf`.replace(/\s+/g, '_');
      
      // Process the HTML content if needed
      const processHtmlForPdf = (content: string): string => {
        // Check if content is HTML
        const isHtml = content.includes('<!DOCTYPE html>') || 
                      content.includes('<html>') || 
                      (content.includes('<') && content.includes('</'));
        
        // If it's already HTML, use it directly
        if (isHtml) {
          return content;
        }
        
        // Check if it's JSON
        const isJson = (content.startsWith('{') && content.endsWith('}')) || 
                       (content.includes('\\\"') && content.includes('\\\"'));
                       
        // If it might be JSON, try to parse and convert
        if (isJson) {
          try {
            // Handle multiple levels of escaping
            let processedContent = content;
            
            // Handle string with quotes at start and end
            if (processedContent.startsWith('"') && processedContent.endsWith('"')) {
              processedContent = processedContent.substring(1, processedContent.length - 1);
            }
            
            // Handle escaped quotes and backslashes
            processedContent = processedContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            
            // Parse the JSON data
            const jsonData = JSON.parse(processedContent);
            
            // Use our existing function from ResumeHtmlView component
            // Create a temporary div to render the component
            const tempDiv = document.createElement('div');
            document.body.appendChild(tempDiv);
            
            // Create a simple HTML representation of the JSON data
            const personalInfo = jsonData.personalInfo || {};
            const html = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <title>Resume</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 30px; line-height: 1.6; }
                  h1 { margin-bottom: 10px; }
                  h2 { margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                  ul { padding-left: 20px; }
                </style>
              </head>
              <body>
                <h1>${personalInfo.name || 'Resume'}</h1>
                <p>${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${personalInfo.location || ''}</p>
                ${personalInfo.bio ? `<p>${personalInfo.bio}</p>` : ''}
                
                ${jsonData.education && jsonData.education.length > 0 ? `
                  <h2>Education</h2>
                  ${jsonData.education.map((edu: any) => `
                    <div>
                      <h3>${edu.institution || ''}</h3>
                      <p>${edu.degree || ''} ${edu.year ? `(${edu.year})` : ''}</p>
                      ${edu.description ? `<p>${edu.description}</p>` : ''}
                    </div>
                  `).join('')}
                ` : ''}
                
                ${jsonData.experience && jsonData.experience.length > 0 ? `
                  <h2>Experience</h2>
                  ${jsonData.experience.map((exp: any) => `
                    <div>
                      <h3>${exp.title || ''} at ${exp.company || ''}</h3>
                      <p>${exp.location || ''}</p>
                      <p>${exp.startDate || ''} ${exp.endDate ? `- ${exp.endDate}` : ''}</p>
                      <p>${exp.description ? exp.description.replace(/\\n/g, '<br>') : ''}</p>
                    </div>
                  `).join('')}
                ` : ''}
                
                ${jsonData.skills && jsonData.skills.length > 0 ? `
                  <h2>Skills</h2>
                  <ul>
                    ${jsonData.skills.map((skill: string) => `<li>${skill}</li>`).join('')}
                  </ul>
                ` : ''}
                
                ${jsonData.projects && jsonData.projects.length > 0 ? `
                  <h2>Projects</h2>
                  ${jsonData.projects.map((project: any) => `
                    <div>
                      <h3>${project.name || ''}</h3>
                      <p>${project.description || ''}</p>
                      ${project.technologies && Array.isArray(project.technologies) ? 
                        `<p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>` : ''}
                      ${project.url ? `<p><a href="${project.url}">${project.url}</a></p>` : ''}
                    </div>
                  `).join('')}
                ` : ''}
                
                ${jsonData.certifications && jsonData.certifications.length > 0 ? `
                  <h2>Certifications</h2>
                  ${jsonData.certifications.map((cert: any) => `
                    <div>
                      <h3>${cert.name || ''}</h3>
                      <p>Issuer: ${cert.issuer || ''} ${cert.date ? `(${cert.date})` : ''}</p>
                    </div>
                  `).join('')}
                ` : ''}
              </body>
              </html>
            `;
            
            document.body.removeChild(tempDiv);
            return html;
          } catch (error) {
            console.error('Error processing JSON for PDF:', error);
            // If parsing fails, use the original content
            return content;
          }
        }
        
        // If we couldn't determine the format, wrap it in basic HTML
        return `
          <!DOCTYPE html>
          <html>
          <head><title>Resume</title></head>
          <body>${content}</body>
          </html>
        `;
      };
      
      // Process the HTML content
      const processedHtml = processHtmlForPdf(resumeHtml);
      
      // Use html2pdf to convert the HTML to PDF
      const element = document.createElement('div');
      element.innerHTML = processedHtml;
      document.body.appendChild(element);
      
      // Import html2pdf dynamically
      const options = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
      };
      
      const html2pdf = (await import('html2pdf.js')).default;
      
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          // Clean up the temporary element
          document.body.removeChild(element);
          this.showToast({
            title: "Success",
            description: "Resume downloaded as PDF",
            variant: "default"
          });
        })
        .catch((error: any) => {
          console.error('Error generating PDF:', error);
          document.body.removeChild(element);
          this.showToast({
            title: "Error",
            description: "Failed to generate PDF",
            variant: "destructive"
          });
        })
        .finally(() => {
          this.setState({ uploadLoading: false });
        });
    } catch (error) {
      console.error('Error in handleDownloadCV:', error);
      this.setState({ uploadLoading: false });
      this.showToast({
        title: "Error",
        description: "Failed to download resume",
        variant: "destructive"
      });
    }
  };
  
  // Toggle CV preview visibility
  toggleCVPreview = () => {
    this.setState(prevState => ({ 
      cvPreviewVisible: !prevState.cvPreviewVisible 
    }));
  };
  
  // Handle logging resume data
  handleLogResumeData = () => {
    const { cvData, resumeHtml } = this.state;
    
    if (!resumeHtml) {
      this.showToast({
        title: "Error",
        description: "Please generate a CV first",
        variant: "destructive"
      });
      return;
    }
    
    console.log('CV Data:', cvData);
    console.log('Resume Data:', resumeHtml);
    
    try {
      if (cvData && cvData.parsedResume) {
        console.log('parsedResume (raw):', cvData.parsedResume.substring(0, 100) + '...');
        
        if (typeof cvData.parsedResume === 'string') {
          try {
            const parsed = JSON.parse(cvData.parsedResume);
            console.log('parsedResume (JSON parsed):', typeof parsed, parsed.substring(0, 100) + '...');
          } catch (e) {
            console.log('Not valid JSON:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error logging resume data:', e);
    }
    
    console.log('Logging raw resume data:');
    cvGeneratorService.logResumeStructure(JSON.stringify(resumeHtml));
    
    this.showToast({
      title: "Resume Data Logged",
      description: "Raw resume data has been logged to the console."
    });
  };
  
  // Helper to parse the JSON resume content
  parseResumeContent = (content: string): ResumeData => {
    if (!content) {
      return this.createEmptyResumeData();
    }
    
    console.log('Parsing resume content, input type:', typeof content);
    
    try {
      // Handle already parsed objects
      if (typeof content !== 'string') {
        console.log('Content is not a string, returning as is');
        return content as ResumeData;
      }
      
      // Helper function to recursively parse JSON strings
      const recursivelyParse = (jsonString: string, depth = 0): any => {
        if (depth > 5) {
          console.warn('Maximum parsing depth reached, returning current value');
          return jsonString; // Prevent infinite recursion
        }
        
        try {
          // Try to parse the current string
          const parsed = JSON.parse(jsonString);
          
          // If the result is another string that looks like JSON, parse again
          if (typeof parsed === 'string') {
            console.log(`Parsed level ${depth}, got another string, trying again`);
            
            if ((parsed.startsWith('"') && parsed.endsWith('"')) || 
                (parsed.startsWith('{') && parsed.endsWith('}')) || 
                (parsed.startsWith('[') && parsed.endsWith(']'))) {
              return recursivelyParse(parsed, depth + 1);
            }
          }
          
          // Return the parsed result
          return parsed;
        } catch (e) {
          console.log(`Error parsing at depth ${depth}:`, e);
          // If parsing fails, return the input
          return jsonString;
        }
      };
      
      // Start the recursive parsing
      const result = recursivelyParse(content);
      
      console.log('Resume parsing complete, result type:', typeof result);
      
      // Check if result is an error message instead of resume data
      if (result && typeof result === 'object' && result.error && result.message) {
        console.warn('Received error instead of resume data:', result);
        return this.createEmptyResumeData();
      }
      
      // Ensure all expected properties exist
      const resumeData = result as ResumeData;
      return this.ensureCompleteResumeData(resumeData);
    } catch (e) {
      console.error('Error in main parseResumeContent method:', e);
      return this.createEmptyResumeData();
    }
  };
  
  // Helper method to ensure all resume data properties exist
  private ensureCompleteResumeData = (data: Partial<ResumeData>): ResumeData => {
    const emptyData = this.createEmptyResumeData();
    
    // Handle personalInfo vs contactInfo differences with proper type handling
    let processedContactInfo: any = emptyData.contactInfo;
    
    if (data.contactInfo) {
      if ('name' in data.contactInfo) {
        processedContactInfo = data.contactInfo;
      } else if ('firstName' in data.contactInfo) {
        const firstName = data.contactInfo.firstName || '';
        const lastName = data.contactInfo.lastName || '';
        processedContactInfo = {
          name: `${firstName} ${lastName}`.trim(),
          email: data.contactInfo.email || '',
          phone: data.contactInfo.phoneNumber,
          location: undefined,
          address: undefined,
          linkedin: undefined, 
          github: undefined,
          portfolio: undefined
        };
      }
    } else if (data.personalInfo) {
      processedContactInfo = {
        name: data.personalInfo.name || '',
        email: data.personalInfo.email || '',
        phone: data.personalInfo.phone,
        location: data.personalInfo.location,
        address: undefined,
        linkedin: undefined,
        github: undefined,
        portfolio: undefined
      };
    }
    
    // Handle different skills formats
    const skills = data.skills ? 
      (Array.isArray(data.skills) ? 
        { skillsList: data.skills } : 
        data.skills) : 
      emptyData.skills;
    
    // Handle different experience formats
    let processedExperience: any = emptyData.experience;
    
    if (data.experience) {
      if (Array.isArray(data.experience)) {
        processedExperience = { 
          experiences: data.experience.map(exp => ({
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location,
            dateRange: `${exp.startDate || ''}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`,
            achievements: [exp.description].filter(Boolean)
          }))
        };
      } else if ('experiences' in data.experience) {
        processedExperience = data.experience;
      }
    }
    
    return {
      contactInfo: processedContactInfo,
      personalInfo: data.personalInfo,
      professionalSummary: data.professionalSummary || emptyData.professionalSummary,
      skills,
      experience: processedExperience,
      education: data.education || emptyData.education,
      projects: data.projects || emptyData.projects,
      certifications: data.certifications || emptyData.certifications
    };
  };
  
  // Helper method to create an empty resume data object
  private createEmptyResumeData = (): ResumeData => {
    return {
      contactInfo: { 
        name: '', 
        email: '' 
      },
      professionalSummary: { 
        summaryPoints: [] 
      },
      skills: { 
        skillsList: [] 
      },
      experience: { 
        experiences: [] 
      },
      education: { 
        university: '', 
        major: '' 
      },
      projects: { 
        projectsList: [] 
      },
      certifications: { 
        certificationsList: [] 
      }
    };
  };
  
  // Helper method to show toasts
  private showToast = (props: ToastProps) => {
    const toastContext = this.context as unknown as { toast?: (props: ToastProps) => void };
    toastContext.toast?.(props);
  };
  
  // Generate HTML from JSON resume data
  generateHTMLFromJSON = (jsonData: any): string => {
    try {
      console.log('Class Method - Generating HTML from JSON data of type:', typeof jsonData);
      
      // Use the new resumeHtmlGenerator for all HTML generation
      try {
        const html = resumeHtmlGenerator.generateResumeHtml(jsonData);
        console.log('Generated HTML with resumeHtmlGenerator, length:', html.length);
        return html;
      } catch (e) {
        console.error('Error using resumeHtmlGenerator:', e);
        // Fall back to a simple error page
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Resume Error</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                padding: 20px; 
                text-align: center;
                color: #4a5568;
                line-height: 1.6;
              }
              h1 { color: #e53e3e; }
              .message {
                padding: 20px;
                border-left: 4px solid #e53e3e;
                background-color: #fff5f5;
                text-align: left;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <h1>Resume Generation Error</h1>
            <div class="message">
              <p>There was an error generating your resume. Please try regenerating it.</p>
              <p>Error details: ${e instanceof Error ? e.message : String(e)}</p>
            </div>
          </body>
          </html>
        `;
      }
    } catch (error) {
      console.error('Error in generateHTMLFromJSON:', error);
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Resume Error</title></head>
        <body>
          <h1>Resume Generation Error</h1>
          <p>There was an error generating your resume. Please try again.</p>
        </body>
        </html>
      `;
    }
  };

  // Add new methods for handling edit mode
  handleEditClick = () => {
    const { cvData } = this.state;
    if (cvData) {
      let parsedData: ResumeData;
      try {
        parsedData = this.parseResumeContent(cvData.parsedResume);
      } catch (e) {
        parsedData = this.createEmptyResumeData();
      }
      this.setState({
        isEditMode: true,
        editableData: parsedData
      });
    }
  };

  handleSaveEdit = async (editedData: ResumeData) => {
    try {
      const { cvData } = this.state;
      if (!cvData || !cvData.id) {
        throw new Error('No CV data available');
      }

      // Convert edited data back to HTML
      const resumeHtml = this.generateHTMLFromJSON(editedData);

      // Save to backend
      await cvGeneratorService.saveResumeHtml(cvData.id, resumeHtml);

      // Update state
      this.setState({
        isEditMode: false,
        resumeHtml,
        cvData: {
          ...cvData,
          parsedResume: JSON.stringify(editedData)
        }
      });

      this.showToast({
        title: "Success",
        description: "Resume updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving edited resume:', error);
      this.showToast({
        title: "Error",
        description: "Failed to save resume changes",
        variant: "destructive"
      });
    }
  };

  handleCancelEdit = () => {
    this.setState({
      isEditMode: false,
      editableData: null
    });
  };

  render() {
    const { 
      loading, 
      studentProfile, 
      resumeHtml, 
      cvPreviewVisible,
      generatingCV,
      isEditMode,
      editableData,
      showRegenerateConfirm
    } = this.state;
    
    const { user } = this.context || {};
    
    // Check for user and roles first
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400">Please log in to manage your resume.</p>
            <Link to="/login" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Go to Login
            </Link>
          </div>
        </div>
      );
    }
    
    const isStudent = Array.isArray(user.roles) && user.roles.includes('ROLE_STUDENT');
    
    if (!isStudent) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Student Access Only</h2>
            <p className="text-gray-600 dark:text-gray-400">Only students can access the CV management page.</p>
            <Link to="/profile" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Return to Profile
            </Link>
          </div>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading Resume Data...</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your resume data.</p>
          </div>
        </div>
      );
    }
    
    return (
      <>
        {/* Full-screen loading overlay during CV generation */}
        {generatingCV && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="mb-6">
                <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Generating Your CV</h3>
              <p className="text-gray-300 mb-2">Please wait while we create your professional resume...</p>
              <p className="text-gray-400 text-sm">This may take a few moments. Do not close or navigate away from this page.</p>
            </div>
          </div>
        )}

        {/* Confirmation modal for regenerating CV */}
        <AlertDialog
          open={showRegenerateConfirm}
          onOpenChange={(open) => this.setState({ showRegenerateConfirm: open })}
          title="Regenerate CV?"
          description="Are you sure you want to regenerate your CV? This will replace your current CV with a new version based on your latest profile information."
          cancelText="Cancel"
          confirmText="Regenerate"
          onCancel={() => this.setState({ showRegenerateConfirm: false })}
          onConfirm={() => {
            this.setState({ showRegenerateConfirm: false });
            this.handleGenerateCV();
          }}
        />

      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">CV Management</h1>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 p-6 rounded-lg border border-gray-800/50 shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">CV Builder</h3>
              <p className="text-gray-400 text-sm mt-1">
                Generate a professional, ATS-optimized CV based on your profile
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Powered by Google Gemini 2.5 AI to create exceptional resumes that stand out
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleGenerateCVClick} 
                disabled={generatingCV}
                className="bg-gradient-to-r from-gray-600 to-gray-800 text-white border-0 flex items-center gap-2 hover:from-gray-700 hover:to-gray-900"
              >
                {generatingCV ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>{resumeHtml ? 'Regenerate CV' : 'Generate CV'}</span>
                  </>
                )}
              </Button>
              
              {resumeHtml && !isEditMode && (
                <>
                  <Button 
                    onClick={this.handleEditClick}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit CV</span>
                  </Button>
                  
                  <Button 
                    onClick={this.handleDownloadCV}
                    variant="outline"
                    disabled={this.state.uploadLoading}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
                  >
                    {this.state.uploadLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* CV Preview/Edit */}
        {resumeHtml && (
          <div className="bg-gray-900/80 rounded-lg border border-gray-800/50 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800/50">
              <h4 className="font-medium text-white">
                {isEditMode ? 'Edit CV' : 'CV Preview'}
              </h4>
              {!isEditMode && (
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={this.toggleCVPreview}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    {cvPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              )}
            </div>
            
            {cvPreviewVisible && (
              <div className="bg-white">
                {isEditMode && editableData ? (
                  <EditableResumeView
                    data={editableData}
                    onSave={this.handleSaveEdit}
                    onCancel={this.handleCancelEdit}
                  />
                ) : (
                  <ResumeHtmlView html={resumeHtml} />
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Instructions for better resume */}
        {!resumeHtml && (
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Tips for a Great Resume</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex gap-2">
                <span className="text-gray-500">•</span>
                <span>Complete your profile with detailed work experiences and projects</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500">•</span>
                <span>Quantify your achievements with specific metrics (e.g., "increased efficiency by 30%" or "reduced load time from 5s to 1.2s")</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500">•</span>
                <span>Use numbers to show scale and impact (e.g., "managed database with 500,000 records" or "saved team 15 hours weekly")</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500">•</span>
                <span>Add technical skills relevant to the positions you're applying for</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500">•</span>
                <span>Include your education details and relevant certifications</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-500">•</span>
                <span>For technical projects, highlight business impact (e.g., "implemented feature used by 80% of users")</span>
              </li>
            </ul>
          </div>
        )}
      </div>
      </>
    );
  }
}

// Wrapper component using the contexts
export function ResumeManagementPageWrapper() {
  return (
    <ToastContext.Consumer>
      {(toastContext) => (
        <AuthContext.Consumer>
          {(authContext) => (
            <ResumeManagementPage />
          )}
        </AuthContext.Consumer>
      )}
    </ToastContext.Consumer>
  );
}

export default ResumeManagementPageWrapper;
