import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/Textarea';
import { adminJobService } from '@/lib/api/adminJobService';
import { AdminJob } from '@/lib/types/adminJob';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Flag,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const AdminJobModeratePage: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  
  const [job, setJob] = useState<AdminJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'REJECT' | 'FLAG' | 'UNFLAG' | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;
    
    setLoading(true);
    
    try {
      const details = await adminJobService.getJobDetails(jobId);
      setJob(details.job);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load job',
        variant: 'destructive',
      });
      navigate('/admin/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (action: 'APPROVE' | 'REJECT' | 'FLAG' | 'UNFLAG') => {
    if (!jobId) return;

    setSubmitting(true);
    setSelectedAction(action);

    try {
      await adminJobService.moderateJob(jobId, {
        action,
        notes: notes.trim() || undefined,
      });

      toast({
        title: 'Moderation successful',
        description: `Job has been ${action.toLowerCase()}ed`,
      });

      navigate('/admin/jobs');
    } catch (err) {
      toast({
        title: 'Moderation failed',
        description: err instanceof Error ? err.message : 'Failed to moderate job',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setSelectedAction(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading job...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">Job not found</p>
            <Button onClick={() => navigate('/admin/jobs')}>Back to Jobs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
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
        
        <h1 className="text-3xl font-bold">Moderate Job</h1>
        <p className="text-gray-600 mt-1">Review and moderate this job posting</p>
      </div>

      {/* Job Preview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{job.title}</CardTitle>
            <Badge variant={job.moderationStatus === 'APPROVED' ? 'default' : 'outline'}>
              {job.moderationStatus}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{job.employer?.companyName} • {job.location}</p>
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

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{job.jobType?.replace('_', ' ')}</Badge>
            <Badge variant="outline">{job.workMode?.replace('_', ' ')}</Badge>
            <Badge variant="secondary">{job.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Moderation Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your moderation decision..."
              rows={4}
              disabled={submitting}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Select an action:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start border-2 hover:border-green-500"
                onClick={() => handleModerate('APPROVE')}
                disabled={submitting}
              >
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  <span className="font-semibold">Approve</span>
                </div>
                <span className="text-xs text-gray-600">
                  Job meets quality standards and can be published
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start border-2 hover:border-red-500"
                onClick={() => handleModerate('REJECT')}
                disabled={submitting}
              >
                <div className="flex items-center mb-2">
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold">Reject</span>
                </div>
                <span className="text-xs text-gray-600">
                  Job violates policies or doesn't meet standards
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start border-2 hover:border-orange-500"
                onClick={() => handleModerate('FLAG')}
                disabled={submitting}
              >
                <div className="flex items-center mb-2">
                  <Flag className="w-5 h-5 mr-2 text-orange-600" />
                  <span className="font-semibold">Flag for Review</span>
                </div>
                <span className="text-xs text-gray-600">
                  Job needs further review or has potential issues
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start border-2 hover:border-blue-500"
                onClick={() => handleModerate('UNFLAG')}
                disabled={submitting || job.moderationStatus !== 'FLAGGED'}
              >
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-semibold">Remove Flag</span>
                </div>
                <span className="text-xs text-gray-600">
                  Clear the flag and restore normal status
                </span>
              </Button>
            </div>

            {submitting && selectedAction && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-600">Processing {selectedAction.toLowerCase()}...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Metadata */}
      {job.adminMetadata && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {job.adminMetadata.adminNotes && (
              <div>
                <p className="text-sm font-medium text-gray-600">Previous Admin Notes</p>
                <p className="text-gray-700">{job.adminMetadata.adminNotes}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-lg font-bold">{job.adminMetadata.qualityScore}/100</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Priority</p>
                <div className="flex items-center">
                  <Badge variant={job.adminMetadata.isHighPriority ? 'destructive' : 'secondary'}>
                    {job.adminMetadata.isHighPriority ? 'High' : 'Normal'}
                  </Badge>
                </div>
              </div>
            </div>

            {job.adminMetadata.internalTags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Internal Tags</p>
                <div className="flex flex-wrap gap-2">
                  {job.adminMetadata.internalTags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminJobModeratePage;
