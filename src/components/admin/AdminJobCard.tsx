import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Checkbox } from '../ui/Checkbox';
import { 
  Eye, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Flag,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { AdminJob, JOB_STATUSES, MODERATION_STATUSES } from '@/lib/types/adminJob';
import { formatDistanceToNow, format } from 'date-fns';

interface AdminJobCardProps {
  job: AdminJob;
  isSelected: boolean;
  onSelect: (jobId: string) => void;
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onModerate: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
  onToggleFeatured: (jobId: string) => void;
}

export const AdminJobCard: React.FC<AdminJobCardProps> = ({
  job,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onModerate,
  onViewDetails,
  onToggleFeatured,
}) => {
  const statusConfig = JOB_STATUSES.find(s => s.value === job.status);
  const moderationConfig = MODERATION_STATUSES.find(s => s.value === job.moderationStatus);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) {
      return;
    }
    onViewDetails(job.id);
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${currency} ${min.toLocaleString()}`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Salary not disclosed';
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${job.isFeatured ? 'border-yellow-300 bg-yellow-50/30' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(job.id)}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                {job.isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                {job.adminMetadata?.isHighPriority && (
                  <Flag className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span className="font-medium">{job.employer?.companyName || 'Unknown Company'}</span>
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {job.location || 'Unknown Location'}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant={statusConfig?.color === 'green' ? 'default' : 'secondary'}>
                  {statusConfig?.label}
                </Badge>
                <Badge 
                  variant={moderationConfig?.color === 'green' ? 'default' : 'outline'}
                  className={
                    moderationConfig?.color === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                    moderationConfig?.color === 'red' ? 'border-red-500 text-red-700' :
                    moderationConfig?.color === 'orange' ? 'border-orange-500 text-orange-700' : ''
                  }
                >
                  {moderationConfig?.label}
                </Badge>
                {job.jobType && (
                  <Badge variant="outline">{job.jobType.replace('_', ' ')}</Badge>
                )}
                {job.workMode && (
                  <Badge variant="outline">{job.workMode.replace('_', ' ')}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-1" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewDetails(job.id)}
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(job.id)}
              title="Edit Job"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onToggleFeatured(job.id)}
              title={job.isFeatured ? 'Unfeature' : 'Feature'}
            >
              <Star className={`w-4 h-4 ${job.isFeatured ? 'fill-current text-yellow-500' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onModerate(job.id)}
              title="Moderate"
            >
              <Flag className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(job.id)}
              title="Delete"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="space-y-2">
          <div className="text-sm text-gray-700 line-clamp-2">
            {job.description}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-green-600">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </span>
            <span className="text-gray-500">
              Priority: {job.priority}
            </span>
          </div>

          {job.adminMetadata?.internalTags && job.adminMetadata.internalTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.adminMetadata.internalTags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {job.adminMetadata.internalTags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.adminMetadata.internalTags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {(job.viewCount || 0).toLocaleString()} views
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {job.applicationCount || 0} applications
            </div>
            {job.adminMetadata?.qualityScore && (
              <div className="flex items-center">
                <span>Quality: {job.adminMetadata.qualityScore}/100</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {job.expiresAt && (
              <div className="flex items-center text-orange-600">
                <Clock className="w-3 h-3 mr-1" />
                Expires {format(new Date(job.expiresAt), 'MMM dd')}
              </div>
            )}
            {job.lastModeratedAt && (
              <span>
                Moderated {formatDistanceToNow(new Date(job.lastModeratedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminJobCard;