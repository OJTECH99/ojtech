import React, { Component, ChangeEvent, FormEvent } from 'react';
import PDFViewerDialog from '@/components/pdf/PDFViewerDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Checkbox } from '../ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import profileService from '../../lib/api/profileService';
import apiClient from '../../lib/api/apiClient';
import { ToastContext } from '../../providers/ToastContext';
import { PlusCircle, Trash2, Edit2, Save, X } from 'lucide-react';

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
    skills?: string[] | string;
    university?: string;
    major?: string;
    graduationYear?: number;
    role?: string;
    hasCompletedOnboarding?: boolean;
    githubProjects?: GithubProject[];
    certifications?: Certification[];
    experiences?: Experience[];
    preojtOrientationUrl?: string;
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
    preojtOrientationUrl?: string;
  };
  isSubmitting: boolean;
  skillInput: string;
  newGithubProject: GithubProject;
  newCertification: Certification;
  newExperience: Experience;
  techInput: string;
  activeTab: 'personal' | 'education' | 'skills' | 'certifications' | 'experience' | 'contact' | 'bio' | 'documents';
  editingCertification: number | null;
  editingExperience: number | null;
  uploadingPdf: boolean;
  isPdfDialogOpen: boolean;
}

class ProfileEditModalClass extends Component<ProfileEditModalProps, ProfileEditModalState> {
  static contextType = ToastContext;
  declare context: React.ContextType<typeof ToastContext>;

  constructor(props: ProfileEditModalProps) {
    super(props);
    
    // Convert skills string to array if it's a string
    const initialSkills = Array.isArray(props.initialData.skills)
      ? props.initialData.skills
      : typeof props.initialData.skills === 'string' && props.initialData.skills
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
        preojtOrientationUrl: props.initialData.preojtOrientationUrl || '',
      },
      isSubmitting: false,
      skillInput: '',
      techInput: '',
      activeTab: 'personal',
      editingCertification: null,
      editingExperience: null,
      uploadingPdf: false,
      isPdfDialogOpen: false,
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
    const { skillInput } = this.state;
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
    const { techInput } = this.state;
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
  setActiveTab = (tab: 'personal' | 'education' | 'skills' | 'certifications' | 'experience' | 'contact' | 'bio' | 'documents') => {
    this.setState({ activeTab: tab });
  };

  // PDF Upload handler
  handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      this.context?.toast({
        title: "Invalid File Type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.context?.toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    this.setState({ uploadingPdf: true });

    try {
      let cloudRes: Response;
      let cloudJson: any;

      try {
        // Try signed upload first
        const { data: signed } = await apiClient.get('/public/cloudinary/signed-params');

        const cloudForm = new FormData();
        cloudForm.append('file', file);
        cloudForm.append('timestamp', String(signed.timestamp));
        cloudForm.append('api_key', signed.apiKey);
        cloudForm.append('signature', signed.signature);
        cloudForm.append('folder', signed.folder);
        cloudForm.append('resource_type', signed.resourceType || 'raw');
        cloudForm.append('use_filename', String(signed.useFilename));
        cloudForm.append('unique_filename', String(signed.uniqueFilename));
        cloudForm.append('access_mode', 'public');

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType || 'raw'}/upload`;
        cloudRes = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudForm,
        });
        cloudJson = await cloudRes.json();
      } catch (signedError) {
        console.warn('Signed upload failed, trying unsigned preset upload:', signedError);
        
        // Fallback to unsigned upload with preset
        const { data: unsigned } = await apiClient.get('/public/cloudinary/unsigned-params');
        
        const presetForm = new FormData();
        presetForm.append('file', file);
        presetForm.append('upload_preset', unsigned.uploadPreset);
        presetForm.append('folder', unsigned.folder);
        presetForm.append('resource_type', 'raw');

        const presetUrl = `https://api.cloudinary.com/v1_1/${unsigned.cloudName}/raw/upload`;
        cloudRes = await fetch(presetUrl, {
          method: 'POST',
          body: presetForm,
        });
        cloudJson = await cloudRes.json();
      }
      
      if (!cloudRes.ok) {
        throw new Error(cloudJson?.error?.message || 'Cloudinary upload failed');
      }

      const uploadedUrl: string | undefined = cloudJson.secure_url || cloudJson.url;
      if (!uploadedUrl) throw new Error('Cloudinary did not return a URL');

      // Notify backend of the uploaded URL to persist
      const backendForm = new FormData();
      backendForm.append('fileUrl', uploadedUrl);
      const persistRes = await apiClient.post('/student-profiles/preojt-orientation', backendForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = persistRes.data;
      const finalUrl = result?.fileUrl || uploadedUrl;

      // Update the form data with the new PDF URL
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          preojtOrientationUrl: finalUrl,
        }
      }));

      this.context?.toast({
        title: "Success",
        description: "PreOJT Orientation PDF uploaded successfully",
      });

    } catch (error) {
      console.error('PDF upload error:', error);
      this.context?.toast({
        title: "Upload Failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      this.setState({ uploadingPdf: false });
      // Reset the input
      event.target.value = '';
    }
  };

  // Certification editing methods
  handleEditCertification = (index: number) => {
    const cert = this.state.formData.certifications[index];
    this.setState({
      editingCertification: index,
      newCertification: { ...cert }
    });
  };

  handleSaveCertification = () => {
    const { editingCertification, newCertification, formData } = this.state;
    if (editingCertification !== null) {
      const updatedCertifications = [...formData.certifications];
      updatedCertifications[editingCertification] = newCertification;
      this.setState({
        formData: { ...formData, certifications: updatedCertifications },
        editingCertification: null,
        newCertification: {
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: '',
        }
      });
    }
  };

  handleCancelEditCertification = () => {
    this.setState({
      editingCertification: null,
      newCertification: {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      }
    });
  };

  // Experience editing methods
  handleEditExperience = (index: number) => {
    const exp = this.state.formData.experiences[index];
    this.setState({
      editingExperience: index,
      newExperience: { ...exp }
    });
  };

  handleSaveExperience = () => {
    const { editingExperience, newExperience, formData } = this.state;
    if (editingExperience !== null) {
      const updatedExperiences = [...formData.experiences];
      updatedExperiences[editingExperience] = newExperience;
      this.setState({
        formData: { ...formData, experiences: updatedExperiences },
        editingExperience: null,
        newExperience: {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          isCurrentPosition: false,
        }
      });
    }
  };

  handleCancelEditExperience = () => {
    this.setState({
      editingExperience: null,
      newExperience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrentPosition: false,
      }
    });
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
    const { formData, isSubmitting, skillInput, activeTab, editingCertification, editingExperience, newCertification, newExperience } = this.state;
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={this.handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => this.setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="certifications">Certs</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="bio">Bio</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4">
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={this.handleInputChange}
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={this.handleInputChange}
                    placeholder="Full address"
                  />
                </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-4">
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={this.handleInputChange}
                    placeholder="University name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={this.handleInputChange}
                    placeholder="Field of study"
                  />
                </div>
                
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    value={formData.graduationYear || ''}
                    onChange={this.handleInputChange}
                    placeholder="2024"
                  />
                </div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-4">
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={skillInput}
                      onChange={this.handleSkillInputChange}
                      placeholder="Enter a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), this.handleAddSkill())}
                    />
                    <Button type="button" onClick={this.handleAddSkill}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => this.handleRemoveSkill(index)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Certifications Tab */}
              <TabsContent value="certifications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Certifications</Label>
                  <Button type="button" onClick={this.handleAddCertification} size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>

                {/* Add New Certification Form */}
                {editingCertification === null && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Add New Certification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="certName">Certification Name</Label>
                          <Input
                            id="certName"
                            name="name"
                            value={newCertification.name}
                            onChange={this.handleCertificationInputChange}
                            placeholder="AWS Solutions Architect"
                          />
                        </div>
                        <div>
                          <Label htmlFor="certIssuer">Issuer</Label>
                          <Input
                            id="certIssuer"
                            name="issuer"
                            value={newCertification.issuer}
                            onChange={this.handleCertificationInputChange}
                            placeholder="Amazon Web Services"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="certIssueDate">Issue Date</Label>
                          <Input
                            id="certIssueDate"
                            name="issueDate"
                            type="date"
                            value={newCertification.issueDate}
                            onChange={this.handleCertificationInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="certExpiryDate">Expiry Date (Optional)</Label>
                          <Input
                            id="certExpiryDate"
                            name="expiryDate"
                            type="date"
                            value={newCertification.expiryDate}
                            onChange={this.handleCertificationInputChange}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="certUrl">Credential URL (Optional)</Label>
                        <Input
                          id="certUrl"
                          name="credentialUrl"
                          value={newCertification.credentialUrl}
                          onChange={this.handleCertificationInputChange}
                          placeholder="https://credly.com/badges/..."
                        />
                      </div>
                      <Button type="button" onClick={this.handleAddCertification} size="sm">
                        Add Certification
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Certifications */}
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        {editingCertification === index ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Certification Name</Label>
                                <Input
                                  name="name"
                                  value={newCertification.name}
                                  onChange={this.handleCertificationInputChange}
                                />
                              </div>
                              <div>
                                <Label>Issuer</Label>
                                <Input
                                  name="issuer"
                                  value={newCertification.issuer}
                                  onChange={this.handleCertificationInputChange}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" onClick={this.handleSaveCertification} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button type="button" onClick={this.handleCancelEditCertification} variant="outline" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{cert.name}</h4>
                              <p className="text-sm text-gray-600">{cert.issuer}</p>
                              <p className="text-xs text-gray-500">{cert.issueDate}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={() => this.handleEditCertification(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => this.handleRemoveCertification(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Work Experience</Label>
                  <Button type="button" onClick={this.handleAddExperience} size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                {/* Add New Experience Form */}
                {editingExperience === null && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Add New Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expTitle">Job Title</Label>
                          <Input
                            id="expTitle"
                            name="title"
                            value={newExperience.title}
                            onChange={this.handleExperienceInputChange}
                            placeholder="Software Developer"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expCompany">Company</Label>
                          <Input
                            id="expCompany"
                            name="company"
                            value={newExperience.company}
                            onChange={this.handleExperienceInputChange}
                            placeholder="Tech Corp"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="expLocation">Location</Label>
                        <Input
                          id="expLocation"
                          name="location"
                          value={newExperience.location}
                          onChange={this.handleExperienceInputChange}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expStartDate">Start Date</Label>
                          <Input
                            id="expStartDate"
                            name="startDate"
                            type="date"
                            value={newExperience.startDate}
                            onChange={this.handleExperienceInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expEndDate">End Date</Label>
                          <Input
                            id="expEndDate"
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
                          id="currentPosition"
                          checked={newExperience.isCurrentPosition}
                          onCheckedChange={(checked) => 
                            this.setState(prev => ({
                              newExperience: {
                                ...prev.newExperience,
                                isCurrentPosition: checked as boolean,
                                endDate: checked ? '' : prev.newExperience.endDate
                              }
                            }))
                          }
                        />
                        <Label htmlFor="currentPosition">Current Position</Label>
                      </div>
                      <div>
                        <Label htmlFor="expDescription">Description</Label>
                        <Textarea
                          id="expDescription"
                          name="description"
                          value={newExperience.description}
                          onChange={this.handleExperienceInputChange}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={3}
                        />
                      </div>
                      <Button type="button" onClick={this.handleAddExperience} size="sm">
                        Add Experience
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Experiences */}
                <div className="space-y-3">
                  {formData.experiences.map((exp, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        {editingExperience === index ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Job Title</Label>
                                <Input
                                  name="title"
                                  value={newExperience.title}
                                  onChange={this.handleExperienceInputChange}
                                />
                              </div>
                              <div>
                                <Label>Company</Label>
                                <Input
                                  name="company"
                                  value={newExperience.company}
                                  onChange={this.handleExperienceInputChange}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" onClick={this.handleSaveExperience} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button type="button" onClick={this.handleCancelEditExperience} variant="outline" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{exp.title}</h4>
                              <p className="text-sm text-gray-600">{exp.company}</p>
                              <p className="text-xs text-gray-500">
                                {exp.startDate} - {exp.isCurrentPosition ? 'Present' : exp.endDate}
                              </p>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={() => this.handleEditExperience(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => this.handleRemoveExperience(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={this.handleInputChange}
                    placeholder="+1 (555) 123-4567"
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
              </TabsContent>

              {/* Bio Tab */}
              <TabsContent value="bio" className="space-y-4">
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={this.handleInputChange}
                    rows={8}
                    placeholder="Write a brief professional bio that highlights your background, skills, and career goals..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This will be displayed on your profile and visible to potential employers.
                  </p>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold">Documents</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your required documents for the OJT program.
                  </p>
                </div>

                {/* PreOJT Orientation PDF Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">PreOJT Orientation Certificate</CardTitle>
                    <p className="text-sm text-gray-600">
                      Upload your PreOJT Orientation completion certificate (PDF only, max 10MB)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.preojtOrientationUrl ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800">PDF Uploaded Successfully</p>
                            <p className="text-xs text-green-600">Click to view or download</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => this.setState({ isPdfDialogOpen: true })}
                          >
                            View PDF
                          </Button>
                          <Label htmlFor="pdfUpload" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>Replace</span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">No PDF uploaded yet</p>
                        <Label htmlFor="pdfUpload" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>Upload PDF</span>
                          </Button>
                        </Label>
                      </div>
                    )}
                    
                    <input
                      id="pdfUpload"
                      type="file"
                      accept=".pdf"
                      onChange={this.handlePdfUpload}
                      className="hidden"
                      disabled={this.state.uploadingPdf}
                    />
                    
                    {this.state.uploadingPdf && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Uploading PDF...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* PDF Viewer Dialog */}
            {formData.preojtOrientationUrl && (
              <PDFViewerDialog
                isOpen={this.state.isPdfDialogOpen}
                onClose={() => this.setState({ isPdfDialogOpen: false })}
                fileUrl={formData.preojtOrientationUrl}
                title="PreOJT Orientation Certificate"
              />
            )}
            
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
}

// Wrap the class component with ToastContext
const ProfileEditModal = (props: ProfileEditModalProps) => {
  return <ProfileEditModalClass {...props} />;
};

export default ProfileEditModal; 