import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { adminJobService } from '@/lib/api/adminJobService';
import { AdminJobDetailsResponse } from '@/lib/types/adminJob';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Flag,
  Eye,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  RefreshCw,
  Building,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminJobDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  
  const [details, setDetails] = useState<AdminJobDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  const loadJobDetails = async () => {
    if (!jobId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminJobService.getJobDetails(jobId);
      setDetails(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job details';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jobId || !confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await adminJobService.deleteJob(jobId);
      toast({
        title: 'Job deleted',
        description: 'Job has been successfully deleted',
      });
      navigate('/admin/jobs');
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Failed to delete job',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
            <Button onClick={() => navigate('/admin/jobs')}>Back to Jobs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { job, metadata, metrics, auditTrail } = details;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mt-2">
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {job.employer?.companyName || 'Unknown Company'}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/jobs/${jobId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/jobs/${jobId}/moderate`)}
            >
              <Flag className="w-4 h-4 mr-2" />
              Moderate
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Job Type</h3>
                  <Badge variant="outline">{job.jobType?.replace('_', ' ') || 'N/A'}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Work Mode</h3>
                  <Badge variant="outline">{job.workMode?.replace('_', ' ') || 'N/A'}</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Salary Range</h3>
                <div className="flex items-center text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {job.salaryMin && job.salaryMax 
                    ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                    : 'Not disclosed'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Metadata */}
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metadata.adminNotes && (
                  <div>
                    <h3 className="font-semibold mb-1">Admin Notes</h3>
                    <p className="text-gray-700">{metadata.adminNotes}</p>
                  </div>
                )}
                
                {metadata.internalTags && metadata.internalTags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Internal Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {metadata.internalTags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Quality Score</h3>
                    <p className="text-2xl font-bold text-blue-600">{metadata.qualityScore}/100</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Source Channel</h3>
                    <p className="text-gray-700">{metadata.sourceChannel || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          {auditTrail && auditTrail.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditTrail.slice(0, 5).map((audit) => (
                    <div key={audit.id} className="border-l-2 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{audit.action}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(audit.changedAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      {audit.fieldName && (
                        <p className="text-sm text-gray-600">
                          Field: {audit.fieldName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">By: {audit.changedBy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Job Status</p>
                <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Moderation Status</p>
                <Badge variant={job.moderationStatus === 'APPROVED' ? 'default' : 'outline'}>
                  {job.moderationStatus}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <p className="text-2xl font-bold">{job.priority}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {job.isFeatured && (
                  <Badge variant="default" className="flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {metadata?.isHighPriority && (
                  <Badge variant="destructive" className="flex items-center">
                    <Flag className="w-3 h-3 mr-1" />
                    High Priority
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{metrics.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Applications</span>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{metrics.applicationCount}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Click-through Rate</span>
                    <span className="font-semibold">{(metrics.clickThroughRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-semibold">{(metrics.conversionRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Posted</p>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(job.postedAt), 'MMM dd, yyyy')}
                </div>
              </div>
              
              {job.expiresAt && (
                <div>
                  <p className="text-sm text-gray-600">Expires</p>
                  <div className="flex items-center text-sm text-orange-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {format(new Date(job.expiresAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
              
              {job.lastModeratedAt && (
                <div>
                  <p className="text-sm text-gray-600">Last Moderated</p>
                  <div className="flex items-center text-sm">
                    <Flag className="w-4 h-4 mr-1" />
                    {format(new Date(job.lastModeratedAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetailsPage;
