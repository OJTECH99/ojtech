import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

import { 
  AdminJobSearchDto, 
  AdminJobFilterDto,
  JOB_STATUSES,
  JOB_TYPES,
  WORK_MODES,
  MODERATION_STATUSES
} from '@/lib/types/adminJob';
import { Filter, X, Search, RotateCcw } from 'lucide-react';

interface AdminJobFiltersProps {
  filters: AdminJobFilterDto | null;
  searchCriteria: AdminJobSearchDto;
  onSearchChange: (criteria: AdminJobSearchDto) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const AdminJobFilters: React.FC<AdminJobFiltersProps> = ({
  filters,
  searchCriteria,
  onSearchChange,
  onClearFilters,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCriteria, setLocalCriteria] = useState<AdminJobSearchDto>(searchCriteria);

  const handleInputChange = (field: keyof AdminJobSearchDto, value: any) => {
    const newCriteria = { ...localCriteria, [field]: value };
    setLocalCriteria(newCriteria);
  };

  const handleArrayChange = (field: keyof AdminJobSearchDto, value: string, checked: boolean) => {
    const currentArray = (localCriteria[field] as string[]) || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    const newCriteria = { ...localCriteria, [field]: newArray };
    setLocalCriteria(newCriteria);
  };

  const applyFilters = () => {
    onSearchChange(localCriteria);
  };

  const resetFilters = () => {
    const emptyCriteria: AdminJobSearchDto = {};
    setLocalCriteria(emptyCriteria);
    onSearchChange(emptyCriteria);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localCriteria.keywords) count++;
    if (localCriteria.employerId) count++;
    if (localCriteria.categoryId) count++;
    if (localCriteria.status?.length) count++;
    if (localCriteria.jobType?.length) count++;
    if (localCriteria.workMode?.length) count++;
    if (localCriteria.location) count++;
    if (localCriteria.moderationStatus?.length) count++;
    if (localCriteria.isFeatured !== undefined) count++;
    if (localCriteria.salaryMin || localCriteria.salaryMax) count++;
    if (localCriteria.postedAfter || localCriteria.postedBefore) count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick Search */}
        <div className="flex space-x-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs by title, description, or company..."
              value={localCriteria.keywords || ''}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={applyFilters} disabled={isLoading}>
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-6">
            {/* Employer and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employer</label>
                <Select
                  value={localCriteria.employerId || ''}
                  onValueChange={(value) => handleInputChange('employerId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employers</SelectItem>
                    {filters?.employers.map(employer => (
                      <SelectItem key={employer.id} value={employer.id}>
                        {employer.name} ({employer.jobCount} jobs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={localCriteria.categoryId || ''}
                  onValueChange={(value) => handleInputChange('categoryId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {filters?.categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.jobCount} jobs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Job Status</label>
                <div className="space-y-2">
                  {JOB_STATUSES.map(status => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={localCriteria.status?.includes(status.value) || false}
                        onCheckedChange={(checked) => 
                          handleArrayChange('status', status.value, checked as boolean)
                        }
                      />
                      <label htmlFor={`status-${status.value}`} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Moderation Status</label>
                <div className="space-y-2">
                  {MODERATION_STATUSES.map(status => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`moderation-${status.value}`}
                        checked={localCriteria.moderationStatus?.includes(status.value) || false}
                        onCheckedChange={(checked) => 
                          handleArrayChange('moderationStatus', status.value, checked as boolean)
                        }
                      />
                      <label htmlFor={`moderation-${status.value}`} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Type and Work Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Job Type</label>
                <div className="space-y-2">
                  {JOB_TYPES.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`jobtype-${type.value}`}
                        checked={localCriteria.jobType?.includes(type.value) || false}
                        onCheckedChange={(checked) => 
                          handleArrayChange('jobType', type.value, checked as boolean)
                        }
                      />
                      <label htmlFor={`jobtype-${type.value}`} className="text-sm">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Work Mode</label>
                <div className="space-y-2">
                  {WORK_MODES.map(mode => (
                    <div key={mode.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`workmode-${mode.value}`}
                        checked={localCriteria.workMode?.includes(mode.value) || false}
                        onCheckedChange={(checked) => 
                          handleArrayChange('workMode', mode.value, checked as boolean)
                        }
                      />
                      <label htmlFor={`workmode-${mode.value}`} className="text-sm">
                        {mode.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  placeholder="Enter location"
                  value={localCriteria.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Salary</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localCriteria.salaryMin || ''}
                  onChange={(e) => handleInputChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Salary</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localCriteria.salaryMax || ''}
                  onChange={(e) => handleInputChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Posted After</label>
                <Input
                  type="date"
                  value={localCriteria.postedAfter ? localCriteria.postedAfter.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('postedAfter', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Posted Before</label>
                <Input
                  type="date"
                  value={localCriteria.postedBefore ? localCriteria.postedBefore.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('postedBefore', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
            </div>

            {/* Special Filters */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={localCriteria.isFeatured || false}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked as boolean)}
                />
                <label htmlFor="featured" className="text-sm">
                  Featured jobs only
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasNotes"
                  checked={localCriteria.hasAdminNotes || false}
                  onCheckedChange={(checked) => handleInputChange('hasAdminNotes', checked as boolean)}
                />
                <label htmlFor="hasNotes" className="text-sm">
                  Has admin notes
                </label>
              </div>
            </div>

            {/* Apply/Reset Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={resetFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
              <Button onClick={applyFilters} disabled={isLoading}>
                <Search className="w-4 h-4 mr-1" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminJobFilters;