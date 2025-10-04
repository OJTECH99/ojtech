import React, { Component, ChangeEvent } from 'react';
import githubService from '../../lib/api/githubService';
import localStorageManager from '../../lib/utils/localStorageManager';

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

interface GitHubProjectsStepProps {
  projectsData: GitHubProject[];
  onProjectsChange: (projects: GitHubProject[]) => void;
  onNext: () => void;
}

interface GitHubProjectsStepState {
  projects: GitHubProject[];
  currentProjectUrl: string;
  isValidating: boolean;
  error: string | null;
  urlError: boolean;
  currentProjectDescription: string;
  currentProjectTechnologies: string;
  isEnhancing: boolean;
}

export default class GitHubProjectsStep extends Component<GitHubProjectsStepProps, GitHubProjectsStepState> {
  constructor(props: GitHubProjectsStepProps) {
    super(props);
    this.state = {
      projects: props.projectsData || [],
      currentProjectUrl: '',
      isValidating: false,
      error: null,
      urlError: false,
      currentProjectDescription: '',
      currentProjectTechnologies: '',
      isEnhancing: false
    };
  }

  componentDidMount() {
    // Load saved projects from localStorage if available
    const savedProjects = localStorageManager.getStepData<GitHubProject[]>('githubProjects');
    if (savedProjects && savedProjects.length > 0) {
      this.setState({ projects: savedProjects });
    }
  }

  isValidGitHubUrl = (url: string): boolean => {
    // GitHub URLs follow the pattern: https://github.com/username/repository
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    return githubUrlPattern.test(url);
  }

  handleAddProject = async () => {
    const { 
      currentProjectUrl, 
      projects, 
      currentProjectDescription, 
      currentProjectTechnologies 
    } = this.state;
    
    if (projects.length >= 4) {
      this.setState({ error: 'You can add a maximum of 4 projects' });
      return;
    }
    
    if (!currentProjectUrl.trim()) {
      this.setState({ error: 'Please enter a GitHub repository URL' });
      return;
    }
    
    if (!this.isValidGitHubUrl(currentProjectUrl)) {
      this.setState({ 
        error: 'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)',
        urlError: true
      });
      return;
    }
    
    // Check if the URL is already in the list
    if (projects.some(project => project.url === currentProjectUrl)) {
      this.setState({ error: 'This repository has already been added' });
      return;
    }
    
    this.setState({ isValidating: true, error: null, urlError: false });
    
    try {
      // Fetch details from GitHub API
      this.setState({ isEnhancing: true });
      const newProject = await githubService.fetchRepositoryDetails(currentProjectUrl);
      
      // If user provided a description, use it instead of GitHub's
      if (currentProjectDescription.trim()) {
        // Enhance description with GitHub stats if available
        newProject.description = githubService.enhanceProjectDescription(
          currentProjectDescription,
          newProject.technologies || [],
          { 
            stars: newProject.stars, 
            forks: newProject.forks, 
            lastUpdated: newProject.lastUpdated 
          }
        );
      } else if (newProject.readme) {
        // If no user description but we have a README, extract a summary
        const readmeSummary = githubService.extractReadmeSummary(newProject.readme, 250);
        if (readmeSummary) {
          // If we got a good summary from README, use it and enhance with stats
          newProject.description = githubService.enhanceProjectDescription(
            readmeSummary,
            newProject.technologies || [],
            { 
              stars: newProject.stars, 
              forks: newProject.forks, 
              lastUpdated: newProject.lastUpdated 
            }
          );
        }
      }
      
      // If user provided technologies, merge with GitHub's
      if (currentProjectTechnologies.trim()) {
        const userTechs = currentProjectTechnologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
        newProject.technologies = [...new Set([...userTechs, ...(newProject.technologies || [])])];
      }
      
      this.setState({ isEnhancing: false });
      
      const updatedProjects = [...projects, newProject];
      this.setState({ 
        projects: updatedProjects,
        currentProjectUrl: '',
        currentProjectDescription: '',
        currentProjectTechnologies: '',
        isValidating: false 
      });
      
      // Pass updated projects to parent component
      this.props.onProjectsChange(updatedProjects);
      
      // Save projects to localStorage
      localStorageManager.saveStepData('githubProjects', updatedProjects);
    } catch (error) {
      this.setState({ 
        error: 'Failed to validate repository. Please check the URL and try again.',
        isValidating: false,
        isEnhancing: false
      });
    }
  };

  handleRemoveProject = (index: number) => {
    const updatedProjects = [...this.state.projects];
    updatedProjects.splice(index, 1);
    this.setState({ projects: updatedProjects });
    
    // Pass updated projects to parent component
    this.props.onProjectsChange(updatedProjects);
    
    // Update localStorage
    localStorageManager.saveStepData('githubProjects', updatedProjects);
  };

  handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ 
      currentProjectUrl: e.target.value,
      error: null,
      urlError: false
    });
  };

  handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ 
      currentProjectDescription: e.target.value,
      error: null
    });
  };

  handleTechnologiesChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ 
      currentProjectTechnologies: e.target.value,
      error: null
    });
  };

  handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleAddProject();
    }
  };

  handleNextStep = () => {
    const { projects } = this.state;
    const { onNext, onProjectsChange } = this.props;
    
    // Save projects to localStorage
    localStorageManager.saveStepData('githubProjects', projects);
    
    // Pass to parent component
    onProjectsChange(projects);
    
    // Move to next step
    onNext();
  };

  render() {
    const { 
      projects, 
      currentProjectUrl, 
      isValidating, 
      error, 
      urlError,
      currentProjectDescription,
      currentProjectTechnologies,
      isEnhancing
    } = this.state;
    const { onNext } = this.props;

    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Showcase Your GitHub Projects
          </h3>
          <p className="text-gray-400 mt-2">
            Add up to 4 projects that highlight your coding skills
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="github-url" className="block text-sm font-medium text-gray-300">
                Project URL <span className="text-gray-400">*</span>
              </label>
            </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <input
                    type="url"
                    id="github-url"
                    value={currentProjectUrl}
                    onChange={this.handleUrlChange}
                    onKeyPress={this.handleKeyPress}
                    placeholder="https://github.com/username/repository"
                    className={`w-full pl-10 bg-black/80 border ${urlError ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${urlError ? 'focus:ring-red-500/50' : 'focus:ring-gray-500/50'} focus:border-transparent transition-all duration-300`}
                  />
                </div>
            
            {/* Brief Description Input */}
            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-2">
                Brief Description
              </label>
              <textarea
                id="project-description"
                value={currentProjectDescription}
                onChange={this.handleDescriptionChange}
                placeholder="1-2 sentences about what the project does"
                rows={2}
                className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
              />
              <div className="text-xs text-gray-500 mt-1 pl-1">
                Optional: Add your own description or we'll use GitHub's README and project details
              </div>
            </div>
            
            {/* Technologies Used Input */}
            <div>
              <label htmlFor="project-tech" className="block text-sm font-medium text-gray-300 mb-2">
                Technologies Used
              </label>
              <input
                type="text"
                id="project-tech"
                value={currentProjectTechnologies}
                onChange={this.handleTechnologiesChange}
                placeholder="e.g., React, TypeScript, Node.js"
                className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
              />
              <div className="text-xs text-gray-500 mt-1 pl-1">
                Optional: Add your own or we'll detect from GitHub
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
                <button
                  onClick={this.handleAddProject}
                disabled={isValidating || isEnhancing}
                  className={`
                    px-5 py-3 rounded-lg font-medium text-white flex items-center
                    transition-all duration-300 
                  ${(isValidating || isEnhancing)
                      ? 'bg-gray-900/50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:shadow-lg hover:shadow-black/20 hover:scale-105'
                    }
                  `}
                >
                  {isValidating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Validating...
                    </span>
                ) : isEnhancing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enhancing Details...
                  </span>
                  ) : 'Add Project'}
                </button>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 mt-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
          </div>
        </div>
        
        {projects.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your Projects ({projects.length}/4)
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project, index) => (
                <div 
                  key={index} 
                  className="group bg-gradient-to-br from-gray-900/80 to-black/90 rounded-xl p-5 border border-gray-800/50 flex flex-col hover:shadow-lg hover:shadow-black/20 hover:border-gray-700/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <h5 className="font-bold text-white text-lg">{project.name}</h5>
                    </div>
                    <button
                      onClick={() => this.handleRemoveProject(index)}
                      className="text-gray-500/60 hover:text-red-400 transition-colors p-1 opacity-70 group-hover:opacity-100"
                      title="Remove project"
                    >
                      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Project Description */}
                  {project.description && (
                    <p className="text-sm text-gray-400 mt-3">
                      {project.description}
                    </p>
                  )}
                  
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-gray-300 mt-3 hover:underline truncate"
                  >
                    {project.url}
                  </a>
                  
                  {/* Stats display if available */}
                  {(project.stars !== undefined || project.lastUpdated) && (
                    <div className="flex gap-3 mt-3">
                      {project.stars !== undefined && (
                        <span className="text-xs flex items-center gap-1 text-gray-400">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {project.stars}
                        </span>
                      )}
                      {project.lastUpdated && (
                        <span className="text-xs flex items-center gap-1 text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {new Date(project.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {project.technologies.slice(0, 5).map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="text-xs px-2 py-1 rounded-full bg-gray-800/50 text-gray-300 border border-gray-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-800/50 text-gray-300 border border-gray-700/50">
                          +{project.technologies.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800/30 rounded-xl p-6 shadow-inner">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="text-lg font-medium text-white mb-2">No projects added yet</h5>
              <p className="text-gray-400 max-w-md">
                Add your best projects to showcase your coding skills and experience to potential employers
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-6">
          <button
            onClick={this.handleNextStep}
            className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 flex items-center gap-2"
          >
            Continue to Personal Information
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
} 