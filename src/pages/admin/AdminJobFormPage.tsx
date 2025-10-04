import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminJobForm } from '@/components/admin/AdminJobForm';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const AdminJobFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  const handleSave = () => {
    // Navigate back to jobs list after successful save
    navigate('/admin/jobs');
  };

  const handleCancel = () => {
    navigate('/admin/jobs');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        
        <h1 className="text-3xl font-bold">
          {jobId ? 'Edit Job' : 'Create New Job'}
        </h1>
      </div>

      <AdminJobForm
        jobId={jobId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AdminJobFormPage;
