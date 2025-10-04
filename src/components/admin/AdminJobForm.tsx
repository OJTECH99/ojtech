import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  AdminJobFormData, 
  AdminJobFormState,
  JOB_STATUSES,
  JOB_TYPES,
  WORK_MODES
} from '@/lib/types/adminJob';
import { adminJobService } from '@/lib/api/adminJobService';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  X,
  AlertCircle,
  Star,
  Flag,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Settings
} from 'lucide-react';

interface AdminJobFormProps {
  jobId?: string;
  onSave: (job: any) => void;
  onCancel: () => void;
}

export const AdminJobForm: React.FC<AdminJobFormProps> = ({
  jobId,
  onSave,
  onCancel,
}) => {
  const { toast } = useToast();
  
  const [state, setState] = useState<AdminJobFormState>({
    formData: {
      title: '',
      description: '',
      requirements: '',
      location: '',
      jobType: 'FULL_TIME',
      workMode: 'ON_SITE',
      salaryMin: undefined,
      salaryMax: undefined,
      currency: 'USD',
      categoryId: '',
      expiresAt: '',
      employerId: '',
      status: 'ACTIVE',
      isFeatured: false,
      featuredUntil: '',
      priority: 1,
      adminNotes: '',
      internalTags: [],
      qualityScore: 80,
      isHighPriority: false,
      sourceChannel: '',
    },
    employers: [],
    categories: [],
    loading: false,
    saving: false,
    errors: {},
    isEditMode: !!jobId,
  });

  const [newTag, setNewTag] = useState('');

  // Load initial data
  useEffect(() => {
    loadFormData();
  }, [jobId]);

  const loadFormData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Load employers and categories
      const [employers, categories] = await Promise.all([
        adminJobService.getEmployers(),
        adminJobService.getJobCategories(),
      ]);

      setState(prev => ({
        ...prev,
        employers,
        categories,
      }));
      // Load job data if editing
      if (jobId) {
        const jobDetails = await adminJobService.getJobDetails(jobId);
        const job = jobDetails.job;
        
        setState(prev => ({
          ...prev,
          formData: {
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            location: job.location,
            jobType: job.jobType || 'FULL_TIME',
            workMode: job.workMode || 'ON_SITE',
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            currency: job.currency,
            categoryId: job.category?.id || '',
            expiresAt: job.expiresAt ? job.expiresAt.split('T')[0] : '',
            employerId: job.employer?.id || '',
            status: job.status,
            isFeatured: job.isFeatured,
            featuredUntil: job.featuredUntil ? job.featuredUntil.split('T')[0] : '',
            priority: job.priority,
            adminNotes: job.adminMetadata?.adminNotes || '',
            internalTags: job.adminMetadata?.internalTags || [],
            qualityScore: job.adminMetadata?.qualityScore || 80,
            isHighPriority: job.adminMetadata?.isHighPriority || false,
            sourceChannel: job.adminMetadata?.sourceChannel || '',
          },
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load form data';
      setState(prev => ({ 
        ...prev, 
        loading: false,
        errors: { general: errorMessage }
      }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof AdminJobFormData, value: any) => {
    const newErrors = { ...state.errors };
    if (newErrors[field]) {
      delete newErrors[field];
    }
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: newErrors,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !state.formData.internalTags.includes(newTag.trim())) {
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, internalTags: [...prev.formData.internalTags, newTag.trim()] },
      }));
      handleInputChange('internalTags', [...state.formData.internalTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('internalTags', state.formData.internalTags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!state.formData.title.trim()) {
      errors.title = 'Job title is required';
    }

    if (!state.formData.description.trim()) {
      errors.description = 'Job description is required';
    }

    if (!state.formData.requirements.trim()) {
      errors.requirements = 'Job requirements are required';
    }

    if (!state.formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!state.formData.employerId) {
      errors.employerId = 'Employer is required';
    }

    if (state.formData.salaryMin && state.formData.salaryMax && 
        state.formData.salaryMin > state.formData.salaryMax) {
      errors.salaryMax = 'Maximum salary must be greater than minimum salary';
    }

    if (state.formData.qualityScore < 0 || state.formData.qualityScore > 100) {
      errors.qualityScore = 'Quality score must be between 0 and 100';
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({ ...prev, saving: true }));

    try {
      let result;
      if (state.isEditMode && jobId) {
        result = await adminJobService.updateJob(jobId, state.formData);
      } else {
        result = await adminJobService.createJob(state.formData);
      }

      toast({
        title: 'Success',
        description: `Job ${state.isEditMode ? 'updated' : 'created'} successfully`,
      });

      onSave(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save job';
      setState(prev => ({ ...prev, saving: false }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getFieldError = (field: string) => state.errors[field];
  const hasError = (field: string) => !!state.errors[field];

  if (state.loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading form data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            {state.isEditMode ? 'Edit Job' : 'Create New Job'}
          </CardTitle>
          {state.errors.general && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {state.errors.general}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Title *
            </label>
            <Input
              value={state.formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter job title"
              className={hasError('title') ? 'border-red-500' : ''}
            />
            {hasError('title') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('title')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <Textarea
              value={state.formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job description"
              rows={6}
              className={hasError('description') ? 'border-red-500' : ''}
            />
            {hasError('description') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('description')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Requirements *
            </label>
            <Textarea
              value={state.formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Enter job requirements"
              rows={4}
              className={hasError('requirements') ? 'border-red-500' : ''}
            />
            {hasError('requirements') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('requirements')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Employer *
              </label>
              <Select
                value={state.formData.employerId}
                onValueChange={(value) => handleInputChange('employerId', value)}
              >
                <SelectTrigger className={hasError('employerId') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employer" />
                </SelectTrigger>
                <SelectContent>
                  {state.employers.map(employer => (
                    <SelectItem key={employer.id} value={employer.id}>
                      {employer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError('employerId') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('employerId')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>
              <Select
                value={state.formData.categoryId || 'none'}
                onValueChange={(value) => handleInputChange('categoryId', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {state.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Type
              </label>
              <Select
                value={state.formData.jobType}
                onValueChange={(value) => handleInputChange('jobType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Work Mode
              </label>
              <Select
                value={state.formData.workMode}
                onValueChange={(value) => handleInputChange('workMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <Select
                value={state.formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <Input
              value={state.formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter job location"
              className={hasError('location') ? 'border-red-500' : ''}
            />
            {hasError('location') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('location')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Min Salary
              </label>
              <Input
                type="number"
                value={state.formData.salaryMin || ''}
                onChange={(e) => handleInputChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Salary
              </label>
              <Input
                type="number"
                value={state.formData.salaryMax || ''}
                onChange={(e) => handleInputChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
                className={hasError('salaryMax') ? 'border-red-500' : ''}
              />
              {hasError('salaryMax') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('salaryMax')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Currency
              </label>
              <Select
                value={state.formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="PHP">PHP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expires At
            </label>
            <Input
              type="date"
              value={state.formData.expiresAt}
              onChange={(e) => handleInputChange('expiresAt', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Flag className="w-5 h-5 mr-2" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Priority Level (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={state.formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quality Score (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={state.formData.qualityScore}
                onChange={(e) => handleInputChange('qualityScore', parseInt(e.target.value) || 0)}
                className={hasError('qualityScore') ? 'border-red-500' : ''}
              />
              {hasError('qualityScore') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('qualityScore')}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={state.formData.isFeatured}
                onCheckedChange={(checked) => handleInputChange('isFeatured', checked as boolean)}
              />
              <label htmlFor="featured" className="text-sm flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Featured Job
              </label>
            </div>

            {state.formData.isFeatured && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Featured Until
                </label>
                <Input
                  type="date"
                  value={state.formData.featuredUntil}
                  onChange={(e) => handleInputChange('featuredUntil', e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="highPriority"
                checked={state.formData.isHighPriority}
                onCheckedChange={(checked) => handleInputChange('isHighPriority', checked as boolean)}
              />
              <label htmlFor="highPriority" className="text-sm flex items-center">
                <Flag className="w-4 h-4 mr-1 text-red-500" />
                High Priority
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Source Channel
            </label>
            <Input
              value={state.formData.sourceChannel}
              onChange={(e) => handleInputChange('sourceChannel', e.target.value)}
              placeholder="e.g., Direct, Agency, External Board"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Internal Tags
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add internal tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.formData.internalTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Admin Notes
            </label>
            <Textarea
              value={state.formData.adminNotes}
              onChange={(e) => handleInputChange('adminNotes', e.target.value)}
              placeholder="Internal notes for admin reference"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={state.saving}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={state.saving}
        >
          <Save className="w-4 h-4 mr-1" />
          {state.saving ? 'Saving...' : state.isEditMode ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </div>
  );
};

export default AdminJobForm;