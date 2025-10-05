import React, { Component, ChangeEvent, FormEvent } from 'react';
import jobService from '@/lib/api/jobService';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, FileText, Code, Plus, X } from "lucide-react";

// Tech stack suggestions
const techSuggestions = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift",
  // Frontend
  "React", "Vue.js", "Angular", "Next.js", "Svelte", "HTML", "CSS", "Sass", "Tailwind CSS", "Bootstrap",
  // Backend
  "Node.js", "Express.js", "Django", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET", "FastAPI",
  // Database
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Oracle", "Microsoft SQL Server", "Elasticsearch",
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub Actions", "CircleCI",
  // Mobile
  "React Native", "Flutter", "iOS", "Android", "Kotlin", "SwiftUI", "Xamarin",
  // Testing
  "Jest", "Cypress", "Selenium", "JUnit", "PyTest", "Mocha", "Testing Library",
  // Other
  "GraphQL", "REST API", "WebSocket", "Redux", "Vuex", "Machine Learning", "AI", "Blockchain"
];

interface JobFormData {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  minSalary?: string;
  maxSalary?: string;
  currency: string;
  requiredSkills: string[];
  skillsPreferred: string[];
  closingDate?: string;
  active: boolean;
}

interface JobFormPageProps {
  jobId?: string;
  navigate: (path: string) => void;
}

interface EmployerData {
  id: string;
  username: string;
  email: string;
  hasCompletedOnboarding: boolean;
  roles: string[];
  profile: {
    id: string;
    fullName: string;
    companyName: string;
    companySize: string;
    industry: string;
    companyDescription: string;
    websiteUrl: string;
    logoUrl: string;
    location: string;
    role: string;
    active: boolean;
    hasCompletedOnboarding: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface JobFormPageState {
  formData: JobFormData;
  requiredSkillInput: string;
  preferredSkillInput: string;
  isLoading: boolean;
  error: string | null;
  redirectTo: string | null;
  showSuggestions: boolean;
  employer: EmployerData | null;
}

class JobFormPageClass extends Component<JobFormPageProps, JobFormPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: JobFormPageProps) {
    super(props);
    this.state = {
      formData: {
        title: '',
        description: '',
        location: 'Remote',
        employmentType: 'FULL_TIME',
        minSalary: '',
        maxSalary: '',
        currency: 'USD',
        requiredSkills: [],
        skillsPreferred: [],
        closingDate: '',
        active: true,
      },
      requiredSkillInput: '',
      preferredSkillInput: '',
      isLoading: false,
      error: null,
      redirectTo: null,
      showSuggestions: false,
      employer: null
    };
  }

  componentDidMount() {
    const { user } = this.context || {};
    
    if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
      this.setState({ redirectTo: '/login' });
      return;
    }
    
    this.fetchEmployerData();
    
    if (this.props.jobId) {
      this.fetchJobData();
    }
  }
  
  fetchEmployerData = async () => {
    try {
      // Get current user data from context
      const { user } = this.context || {};
      if (user) {
        // Cast the user object to EmployerData since it contains employer data
        this.setState({
          employer: user as any as EmployerData
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch employer data:', err);
    }
  };

  fetchJobData = async () => {
    const { jobId } = this.props;
    
    if (!jobId) return;
    
    this.setState({ isLoading: true });
    
    try {
      const job = await jobService.getEmployerJobById(jobId);
      
      // Convert salary numbers to strings for form state
      const minSalary = job.minSalary ? job.minSalary.toString() : '';
      const maxSalary = job.maxSalary ? job.maxSalary.toString() : '';
      
      // Parse required skills from string to array if needed
      const requiredSkills = typeof job.requiredSkills === 'string' 
        ? job.requiredSkills.split(',').map((skill: string) => skill.trim())
        : job.requiredSkills || [];

      this.setState({
        formData: {
          title: job.title || '',
          description: job.description || '',
          location: job.location || 'Remote',
          employmentType: job.employmentType || 'FULL_TIME',
          minSalary,
          maxSalary,
          currency: job.currency || 'USD',
          requiredSkills,
          skillsPreferred: job.skillsPreferred || [],
          closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : '',
          active: job.active === undefined ? true : job.active,
        },
        requiredSkillInput: '',
        preferredSkillInput: ''
      });
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || 'Failed to load job data.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      this.setState(prev => ({
        formData: { ...prev.formData, [name]: checked }
      }));
    } else if (name === 'minSalary' || name === 'maxSalary') {
      // Only allow numbers for salary fields
      const numericValue = value.replace(/\D/g, '');
      this.setState(prev => ({
        formData: { ...prev.formData, [name]: numericValue }
      }));
    } else {
      this.setState(prev => ({
        formData: { ...prev.formData, [name]: value }
      }));
    }
  };

  handleLocationChange = (value: string) => {
    this.setState(prev => ({
      formData: { ...prev.formData, location: value }
    }));
  };

  handleRequiredSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      requiredSkillInput: value,
      showSuggestions: value.length > 0
    });
  };

  handleSuggestionSelect = (suggestion: string) => {
    const { formData } = this.state;
    if (!formData.requiredSkills.includes(suggestion)) {
      this.setState({
        formData: {
          ...formData,
          requiredSkills: [...formData.requiredSkills, suggestion]
        },
        requiredSkillInput: '',
        showSuggestions: false
      });
    }
  };

  handlePreferredSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      preferredSkillInput: value,
      showSuggestions: value.length > 0
    });
  };

  handlePreferredSkillSelect = (tech: string): void => {
    const { formData } = this.state;
    if (!formData.skillsPreferred.includes(tech)) {
      this.setState({
        formData: {
          ...formData,
          skillsPreferred: [...formData.skillsPreferred, tech]
        },
        preferredSkillInput: '',
        showSuggestions: false
      });
    }
  };

  removeRequiredSkill = (skillToRemove: string): void => {
    this.setState(prev => ({
      formData: {
        ...prev.formData,
        requiredSkills: prev.formData.requiredSkills.filter((skill) => skill !== skillToRemove)
      }
    }));
  };

  removePreferredSkill = (skillToRemove: string): void => {
    this.setState(prev => ({
      formData: {
        ...prev.formData,
        skillsPreferred: prev.formData.skillsPreferred.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  addRequiredSkill = () => {
    const { requiredSkillInput, formData } = this.state;
    if (!requiredSkillInput.trim()) return;
    
    const newSkill = requiredSkillInput.trim();
    if (!formData.requiredSkills.includes(newSkill)) {
      this.setState({
        formData: {
          ...formData,
          requiredSkills: [...formData.requiredSkills, newSkill]
        },
        requiredSkillInput: ''
      });
    }
  };

  addPreferredSkill = (): void => {
    const { preferredSkillInput, formData } = this.state;
    if (!preferredSkillInput.trim()) return;
    
    const newSkill = preferredSkillInput.trim();
    if (!formData.skillsPreferred.includes(newSkill)) {
      this.setState({
        formData: {
          ...formData,
          skillsPreferred: [...formData.skillsPreferred, newSkill]
        },
        preferredSkillInput: ''
      });
    }
  };

  validateForm = (): { isValid: boolean; error: string | null } => {
    const { formData } = this.state;
    
    // Validate title (3-100 chars, no special characters except -, &, and spaces)
    if (!formData.title.trim() || formData.title.length < 3 || formData.title.length > 100) {
      return {
        isValid: false,
        error: "Job title must be between 3 and 100 characters"
      };
    }
    if (!/^[a-zA-Z0-9\s\-&]+$/.test(formData.title)) {
      return {
        isValid: false,
        error: "Job title can only contain letters, numbers, spaces, hyphens, and &"
      };
    }

    // Validate description (minimum 100 characters)
    if (!formData.description.trim() || formData.description.length < 100) {
      return {
        isValid: false,
        error: "Job description must be at least 100 characters long"
      };
    }

    // Validate salary range
    if (formData.minSalary && formData.maxSalary) {
      const min = parseInt(formData.minSalary);
      const max = parseInt(formData.maxSalary);
      if (min >= max) {
        return {
          isValid: false,
          error: "Minimum salary must be less than maximum salary"
        };
      }
      if (min < 0 || max < 0) {
        return {
          isValid: false,
          error: "Salary values cannot be negative"
        };
      }
    }

    // Validate required skills
    if (formData.requiredSkills.length === 0) {
      return {
        isValid: false,
        error: "At least one required skill must be specified"
      };
    }

    return { isValid: true, error: null };
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ error: null });

    // Validate form
    const { isValid, error } = this.validateForm();
    if (!isValid) {
      this.setState({ error });
      return;
    }

    this.setState({ isLoading: true });

    // Construct salary range from min and max
    const salaryRange = this.state.formData.minSalary || this.state.formData.maxSalary 
      ? `PHP ${this.state.formData.minSalary || '0'} - PHP ${this.state.formData.maxSalary || '0'}`
      : '';

    // Prepare payload
    const { minSalary, maxSalary, requiredSkills, ...rest } = this.state.formData;
    
    const payload = {
      ...rest,
      minSalary: minSalary ? parseInt(minSalary) : undefined,
      maxSalary: maxSalary ? parseInt(maxSalary) : undefined,
      requiredSkills: requiredSkills.join(', '),
      closingDate: this.state.formData.closingDate ? new Date(this.state.formData.closingDate).toISOString() : null,
    };

    const isEditMode = Boolean(this.props.jobId);

    try {
      if (isEditMode && this.props.jobId) {
        await jobService.updateJob(this.props.jobId, payload);
      } else {
        await jobService.createJob(payload);
      }
      this.props.navigate('/employer/jobs');
    } catch (err: any) {
      this.setState({
        error: err.response?.data?.message || (isEditMode ? 'Failed to update job.' : 'Failed to create job.')
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { formData, requiredSkillInput, preferredSkillInput, isLoading, error, redirectTo, employer } = this.state;
    const isEditMode = Boolean(this.props.jobId);
    
    // Use employer location or fallback to default
    const officeLocation = employer?.profile?.location || " ";
    
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
  
    if (isLoading && isEditMode) {
      return <div className="min-h-screen flex items-center justify-center"><p>Loading job details...</p></div>;
    }

    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-black5 rounded-lg p-6 mb-6">
              <h1 className="text-white text-2xl font-bold mb-2">
                {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h1>
              <p className="text-blue-100">
                Fill out the form below to create a compelling job posting. Take your time to provide detailed information
                to attract the right candidates.
              </p>
            </div>
          </div>

          <form onSubmit={this.handleSubmit} className="space-y-6">
            {/* Job Details Card */}
            <Card className="bg-black border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-200">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={this.handleChange}
                    required
                    className="bg-gray-900/70 border-gray-700 text-white placeholder:text-gray-400"
                    placeholder="e.g. Senior React Developer"
                    pattern="^[a-zA-Z0-9\s\-&]+$"
                    maxLength={100}
                  />
                </div>

                {/* Job Location */}
                <div className="space-y-3">
                  <Label className="text-gray-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Job Location <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup.Root
                    value={formData.location}
                    onValueChange={this.handleLocationChange}
                    className="space-y-3"
                  >
                    <div className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${
                      formData.location === "Remote" 
                        ? 'border-white bg-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <RadioGroup.Item 
                        value="Remote" 
                        id="location-remote"
                        className="aspect-square h-4 w-4 rounded-full border border-white cursor-pointer relative
                          before:content-[''] before:block before:w-2 before:h-2 before:rounded-full 
                          before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                          before:bg-blue-500 before:scale-0 data-[state=checked]:before:scale-100
                          before:transition-transform hover:border-blue-400"
                      />
                      <Label htmlFor="location-remote" className="font-medium text-white cursor-pointer">
                        Remote - Work from anywhere
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${
                      formData.location === officeLocation
                        ? 'border-gray-500 bg-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <RadioGroup.Item 
                        value={officeLocation} 
                        id="location-office"
                        className="aspect-square h-4 w-4 rounded-full border border-gray-400 cursor-pointer relative
                          before:content-[''] before:block before:w-2 before:h-2 before:rounded-full 
                          before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                          before:bg-gray-500 before:scale-0 data-[state=checked]:before:scale-100
                          before:transition-transform hover:border-gray-400"
                      />
                      <Label htmlFor="location-office" className="font-medium text-white cursor-pointer">
                        Office-based - {officeLocation}
                      </Label>
                    </div>
                  </RadioGroup.Root>
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <Label className="text-gray-200 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Job Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="employmentType"
                    value={formData.employmentType}
                    onValueChange={(value: string) => this.handleChange({ target: { name: 'employmentType', value } } as any)}
                  >
                    <SelectTrigger className="bg-gray-900/70 border-gray-700 text-white">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minSalary" className="text-gray-200 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Minimum Salary
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        PHP
                      </div>
                      <Input
                        type="number"
                        name="minSalary"
                        id="minSalary"
                        value={formData.minSalary}
                        onChange={this.handleChange}
                        min="0"
                        className="pl-12 bg-gray-900/70 border-gray-700 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g. 20000"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Optional - minimum salary offered</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSalary" className="text-gray-200">
                      Maximum Salary
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        PHP
                      </div>
                      <Input
                        type="number"
                        name="maxSalary"
                        id="maxSalary"
                        value={formData.maxSalary}
                        onChange={this.handleChange}
                        min="0"
                        className="pl-12 bg-gray-900/70 border-gray-700 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g. 30000"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Optional - maximum salary offered</p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200 flex items-center justify-between">
                    <span>Job Description <span className="text-red-500">*</span></span>
                    <span className={`text-sm ${formData.description.length >= 100 ? 'text-green-500' : 'text-gray-500'}`}>
                      {formData.description.length}/100 min characters
                    </span>
                  </Label>
                  <Textarea
                    name="description"
                    id="description"
                    rows={8}
                    value={formData.description}
                    onChange={this.handleChange}
                    required
                    className={`bg-gray-900/70 border-gray-700 text-white resize-none ${
                      formData.description.length > 0 && formData.description.length < 100
                        ? 'border-yellow-500'
                        : formData.description.length >= 100
                        ? 'border-green-500'
                        : ''
                    }`}
                    placeholder="Describe the role in detail, including:&#13;&#10;• Key responsibilities&#13;&#10;• Required experience&#13;&#10;• Technical requirements&#13;&#10;• Benefits and perks"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Required Skills Card */}
            <Card className="bg-black border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Required Skills <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Skills Input */}
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={requiredSkillInput}
                          onChange={this.handleRequiredSkillsChange}
                          className="w-full bg-gray-900/70 border-gray-700 text-white"
                          placeholder="Search or enter a skill"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              this.addRequiredSkill();
                            }
                          }}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search skills..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup heading="Popular Technologies">
                            {techSuggestions
                              .filter((tech) => 
                                tech.toLowerCase().includes(requiredSkillInput.toLowerCase()) &&
                                !formData.requiredSkills.includes(tech)
                              )
                              .map((tech, index) => (
                                <CommandItem
                                  key={index}
                                  value={tech}
                                  onSelect={() => this.handleSuggestionSelect(tech)}
                                  className="cursor-pointer"
                                >
                                  {tech}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button 
                    type="button" 
                    onClick={this.addRequiredSkill}
                    className="whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-primary shadow-sm shadow-black/5 hover:bg-primary/90 h-9 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white border-0 flex items-center gap-2 hover:from-gray-700 hover:to-gray-900"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Selected Skills */}
                {formData.requiredSkills.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-200">Selected Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-500/30 text-white-300 border border-gray-700 hover:bg-gray-900/50 cursor-pointer"
                          onClick={() => this.removeRequiredSkill(skill)}
                        >
                          {skill}
                          <button className="ml-2 hover:text-blue-100">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Skills */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Popular Technologies</Label>
                  <div className="flex flex-wrap gap-2">
                    {techSuggestions
                      .filter(skill => !formData.requiredSkills.includes(skill))
                      .slice(0, 15)
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer transition-colors border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                          onClick={() => this.handleSuggestionSelect(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Status Card */}
            

            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 h-9 px-4 py-2"
                onClick={() => this.props.navigate('/employer/jobs')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-primary shadow-sm shadow-black/5 hover:bg-primary/90 h-9 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white border-0 flex items-center gap-2 hover:from-gray-700 hover:to-gray-900"
                  >
                {isLoading 
                  ? (isEditMode ? 'Saving Changes...' : 'Creating Job...') 
                  : (isEditMode ? 'Save Changes' : 'Create Job')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

// Wrapper component to handle routing props
export const JobFormPage: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  
  return <JobFormPageClass jobId={jobId} navigate={navigate} />;
};
