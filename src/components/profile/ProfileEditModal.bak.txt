import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Checkbox } from '../ui/Checkbox';
import { Card, CardContent } from '../ui/Card';
import profileService from '../../lib/api/profileService';
import { ToastContext } from '../../providers/ToastContext';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Calendar from '../ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { cn } from '../../lib/utils';

interface GithubProject {
  name: string;
  url: string;
  description: string;
  technologies: string[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  readme?: string;
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrentPosition?: boolean;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phoneNumber?: string;
    location?: string;
    address?: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    skills?: string[];
    university?: string;
    major?: string;
    graduationYear?: number;
    role?: string;
    hasCompletedOnboarding?: boolean;
    githubProjects?: GithubProject[];
    certifications?: Certification[];
    experiences?: Experience[];
  };
}

interface ProfileEditModalState {
  formData: {
    id?: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    phoneNumber: string;
    location: string;
    address: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    portfolioUrl: string;
    skills: string[];
    university: string;
    major: string;
    graduationYear?: number;
    role?: string;
    hasCompletedOnboarding?: boolean;
    githubProjects: GithubProject[];
    certifications: Certification[];
    experiences: Experience[];
  };
  isSubmitting: boolean;
  skillInput: string;
  newGithubProject: GithubProject;
  newCertification: Certification;
  newExperience: Experience;
  techInput: string;
  activeTab: 'basic' | 'education' | 'projects' | 'certifications' | 'experience';
}

class ProfileEditModalClass extends Component<ProfileEditModalProps, ProfileEditModalState> {
  static contextType = ToastContext;
  declare context: React.ContextType<typeof ToastContext>;

  constructor(props: ProfileEditModalProps) {
    super(props);
    
    // Convert skills string to array if it's a string
    const initialSkills = Array.isArray(props.initialData.skills)
      ? props.initialData.skills
      : typeof props.initialData.skills === 'string'
        ? props.initialData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
        : [];
    
    this.state = {
      formData: {
        id: props.initialData.id,
        firstName: props.initialData.firstName || '',
        lastName: props.initialData.lastName || '',
        fullName: props.initialData.fullName || '',
        phoneNumber: props.initialData.phoneNumber || '',
        location: props.initialData.location || '',
        address: props.initialData.address || '',
        bio: props.initialData.bio || '',
        githubUrl: props.initialData.githubUrl || '',
        linkedinUrl: props.initialData.linkedinUrl || '',
        portfolioUrl: props.initialData.portfolioUrl || '',
        skills: initialSkills,
        university: props.initialData.university || '',
        major: props.initialData.major || '',
        graduationYear: props.initialData.graduationYear,
        role: props.initialData.role || 'STUDENT',
        hasCompletedOnboarding: props.initialData.hasCompletedOnboarding || false,
        githubProjects: props.initialData.githubProjects || [],
        certifications: props.initialData.certifications || [],
        experiences: props.initialData.experiences || [],
      },
      isSubmitting: false,
      skillInput: '',
      techInput: '',
      activeTab: 'basic',
      newGithubProject: {
        name: '',
        url: '',
        description: '',
        technologies: [],
      },
      newCertification: {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      },
      newExperience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrentPosition: false,
      },
    };
  }
  
  handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };
  
  handleSkillInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ skillInput: e.target.value });
  };
  
  handleAddSkill = () => {
    const { skillInput, formData } = this.state;
    if (skillInput.trim()) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          skills: [...prevState.formData.skills, skillInput.trim()]
        },
        skillInput: ''
      }));
    }
  };
  
  handleRemoveSkill = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        skills: prevState.formData.skills.filter((_, i) => i !== index)
      }
    }));
  };
  
  // GitHub Projects methods
  handleGithubProjectInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newGithubProject: {
        ...prevState.newGithubProject,
        [name]: value
      }
    }));
  };
  
  handleTechInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ techInput: e.target.value });
  };
  
  handleAddTech = () => {
    const { techInput, newGithubProject } = this.state;
    if (techInput.trim()) {
      this.setState(prevState => ({
        newGithubProject: {
          ...prevState.newGithubProject,
          technologies: [...prevState.newGithubProject.technologies, techInput.trim()]
        },
        techInput: ''
      }));
    }
  };
  
  handleRemoveTech = (index: number) => {
    this.setState(prevState => ({
      newGithubProject: {
        ...prevState.newGithubProject,
        technologies: prevState.newGithubProject.technologies.filter((_, i) => i !== index)
      }
    }));
  };
  
  handleAddGithubProject = () => {
    const { newGithubProject } = this.state;
    if (newGithubProject.name && newGithubProject.url) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          githubProjects: [...prevState.formData.githubProjects, newGithubProject]
        },
        newGithubProject: {
          name: '',
          url: '',
          description: '',
          technologies: [],
        }
      }));
    }
  };
  
  handleRemoveGithubProject = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        githubProjects: prevState.formData.githubProjects.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Certification methods
  handleCertificationInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newCertification: {
        ...prevState.newCertification,
        [name]: value
      }
    }));
  };
  
  handleAddCertification = () => {
    const { newCertification } = this.state;
    if (newCertification.name && newCertification.issuer && newCertification.issueDate) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          certifications: [...prevState.formData.certifications, newCertification]
        },
        newCertification: {
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: '',
        }
      }));
    }
  };
  
  handleRemoveCertification = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        certifications: prevState.formData.certifications.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Experience methods
  handleExperienceInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newExperience: {
        ...prevState.newExperience,
        [name]: value
      }
    }));
  };
  
  handleExperienceCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    this.setState(prevState => ({
      newExperience: {
        ...prevState.newExperience,
        isCurrentPosition: checked,
        endDate: checked ? '' : prevState.newExperience.endDate
      }
    }));
  };
  
  handleAddExperience = () => {
    const { newExperience } = this.state;
    if (newExperience.title && newExperience.company && newExperience.startDate) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          experiences: [...prevState.formData.experiences, newExperience]
        },
        newExperience: {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          isCurrentPosition: false,
        }
      }));
    }
  };
  
  handleRemoveExperience = (index: number) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        experiences: prevState.formData.experiences.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Tab navigation
  setActiveTab = (tab: 'basic' | 'education' | 'projects' | 'certifications' | 'experience') => {
    this.setState({ activeTab: tab });
  };
  
  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ isSubmitting: true });
    
    try {
      await profileService.updateProfile(this.state.formData);
      this.context?.toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      this.props.onSaved();
      this.props.onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      this.context?.toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };
  
  render() {
    const { isOpen, onClose } = this.props;
    const { formData, isSubmitting, skillInput, techInput, activeTab, newExperience, newGithubProject, newCertification } = this.state;
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => this.setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="certifications">Certificates</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={this.handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={this.handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={this.handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={this.handleInputChange}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={this.handleInputChange}
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={this.handleInputChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={this.handleInputChange}
                placeholder="https://portfolio.com"
              />
            </div>
            
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={this.handleSkillInputChange}
                  placeholder="Enter a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), this.handleAddSkill())}
                />
                <Button type="button" onClick={this.handleAddSkill}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => this.handleRemoveSkill(index)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add New Experience</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newExperience.title}
                    onChange={this.handleExperienceInputChange}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={newExperience.company}
                    onChange={this.handleExperienceInputChange}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={newExperience.location}
                  onChange={this.handleExperienceInputChange}
                  placeholder="City, Country"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newExperience.startDate}
                    onChange={this.handleExperienceInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newExperience.endDate}
                    onChange={this.handleExperienceInputChange}
                    disabled={newExperience.isCurrentPosition}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isCurrentPosition" 
                  checked={newExperience.isCurrentPosition}
                  onCheckedChange={(checked) => {
                    this.setState(prevState => ({
                      newExperience: {
                        ...prevState.newExperience,
                        isCurrentPosition: checked === true,
                        endDate: checked === true ? '' : prevState.newExperience.endDate
                      }
                    }));
                  }}
                />
                <Label htmlFor="isCurrentPosition">I currently work here</Label>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newExperience.description}
                  onChange={this.handleExperienceInputChange}
                  placeholder="Describe your responsibilities and achievements"
                  rows={3}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={this.handleAddExperience}
                disabled={!newExperience.title || !newExperience.company || !newExperience.startDate}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Your Experiences</h3>
              {formData.experiences.length === 0 ? (
                <p className="text-muted-foreground text-sm">No experiences added yet.</p>
              ) : (
                formData.experiences.map((exp, index) => (
                  <Card key={index} className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2"
                      onClick={() => this.handleRemoveExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{exp.title}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p>{exp.location}</p>
                          <p className="text-muted-foreground">
                            {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            {' - '}
                            {exp.isCurrentPosition ? 'Present' : 
                              exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add New Project</h3>
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newGithubProject.name}
                  onChange={this.handleGithubProjectInputChange}
                  placeholder="My Awesome Project"
                />
              </div>
              
              <div>
                <Label htmlFor="url">Project URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={newGithubProject.url}
                  onChange={this.handleGithubProjectInputChange}
                  placeholder="https://github.com/username/project"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newGithubProject.description}
                  onChange={this.handleGithubProjectInputChange}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Technologies Used</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={this.handleTechInputChange}
                    placeholder="Enter a technology"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), this.handleAddTech())}
                  />
                  <Button type="button" onClick={this.handleAddTech}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newGithubProject.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => this.handleRemoveTech(index)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={this.handleAddGithubProject}
                disabled={!newGithubProject.name || !newGithubProject.url}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Your Projects</h3>
              {formData.githubProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm">No projects added yet.</p>
              ) : (
                formData.githubProjects.map((project, index) => {
                  <Card key={index} className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2"
                      onClick={() => this.handleRemoveGithubProject(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="pt-6">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {project.url}
                        </a>
                      </div>
                      {project.description && (
                        <p className="text-sm mt-2">{project.description}</p>
                      )}
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span 
                              key={techIndex}
                              className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add New Certification</h3>
              <div>
                <Label htmlFor="name">Certification Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newCertification.name}
                  onChange={this.handleCertificationInputChange}
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              
              <div>
                <Label htmlFor="issuer">Issuing Organization</Label>
                <Input
                  id="issuer"
                  name="issuer"
                  value={newCertification.issuer}
                  onChange={this.handleCertificationInputChange}
                  placeholder="Amazon Web Services"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={newCertification.issueDate}
                    onChange={this.handleCertificationInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={newCertification.expiryDate}
                    onChange={this.handleCertificationInputChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                <Input
                  id="credentialId"
                  name="credentialId"
                  value={newCertification.credentialId}
                  onChange={this.handleCertificationInputChange}
                  placeholder="ABC123XYZ"
                />
              </div>
              
              <div>
                <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
                <Input
                  id="credentialUrl"
                  name="credentialUrl"
                  value={newCertification.credentialUrl}
                  onChange={this.handleCertificationInputChange}
                  placeholder="https://verify.example.com/cert/123"
                />
              </div>
              
              <Button 
                type="button" 
                onClick={this.handleAddCertification}
                disabled={!newCertification.name || !newCertification.issuer || !newCertification.issueDate}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Your Certifications</h3>
              {formData.certifications.length === 0 ? (
                <p className="text-muted-foreground text-sm">No certifications added yet.</p>
              ) : (
                formData.certifications.map((cert, index) => {
                  <Card key={index} className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2"
                      onClick={() => this.handleRemoveCertification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p>Issued: {cert.issueDate && new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                          {cert.expiryDate && (
                            <p>Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                          )}
                        </div>
                      </div>
                      {cert.credentialId && (
                        <p className="text-sm mt-2">Credential ID: {cert.credentialId}</p>
                      )}
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline block mt-1"
                        >
                          View Credential
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

// Wrap the class component with ToastContext
const ProfileEditModal = (props: ProfileEditModalProps) => {
  return (
    <ToastContext.Consumer>
      {(toastContext) => <ProfileEditModalClass {...props} />}
    </ToastContext.Consumer>
  );
};

export default ProfileEditModal;