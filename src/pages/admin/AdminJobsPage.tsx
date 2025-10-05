import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/Checkbox';
import { AdminJobCard } from '../../components/admin/AdminJobCard';
import { AdminJobFilters } from '../../components/admin/AdminJobFilters';
import { AdminBulkActions } from '../../components/admin/AdminBulkActions';
import Pagination from '../../components/ui/Pagination';
import { 
  AdminJobSearchDto, 
  AdminJobsPageState,
} from '@/lib/types/adminJob';
import { adminJobService } from '@/lib/api/adminJobService';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  RefreshCw,
  BarChart3,
  Download,
  Eye,
  Grid,
  List
} from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [state, setState] = useState<AdminJobsPageState>({
    jobs: [],
    filters: null,
    searchCriteria: {},
    selectedJobs: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 12,
    },
    bulkOperation: {
      isProcessing: false,
      operation: null,
      result: null,
    },
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load jobs
  const loadJobs = async (page = 0, searchCriteria: AdminJobSearchDto = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let response;
      if (Object.keys(searchCriteria).length > 0) {
        response = await adminJobService.searchJobs(searchCriteria, page, state.pagination.itemsPerPage);
      } else {
        response = await adminJobService.getAllJobs(page, state.pagination.itemsPerPage);
      }

      setState(prev => ({
        ...prev,
        jobs: response.jobs,
        pagination: {
          ...prev.pagination,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
        },
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load jobs';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Load filters
  const loadFilters = async () => {
    try {
      const filters = await adminJobService.getJobFilters();
      setState(prev => ({ ...prev, filters }));
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs();
    loadFilters();
  }, []);

  // Handle search
  const handleSearch = (searchCriteria: AdminJobSearchDto) => {
    setState(prev => ({ ...prev, searchCriteria }));
    loadJobs(0, searchCriteria);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadJobs(page - 1, state.searchCriteria);
  };

  // Handle job selection
  const handleJobSelect = (jobId: string) => {
    setState(prev => ({
      ...prev,
      selectedJobs: prev.selectedJobs.includes(jobId)
        ? prev.selectedJobs.filter(id => id !== jobId)
        : [...prev.selectedJobs, jobId],
    }));
  };

  const handleSelectAll = () => {
    setState(prev => ({
      ...prev,
      selectedJobs: prev.selectedJobs.length === prev.jobs.length ? [] : prev.jobs.map(job => job.id),
    }));
  };

  const handleClearSelection = () => {
    setState(prev => ({ ...prev, selectedJobs: [] }));
  };

  // Handle bulk operations
  const handleBulkOperation = async (operation: string, parameters?: Record<string, any>) => {
    if (state.selectedJobs.length === 0) {
      toast({
        title: 'No jobs selected',
        description: 'Please select jobs to perform bulk operations',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({
      ...prev,
      bulkOperation: { ...prev.bulkOperation, isProcessing: true, operation },
    }));

    try {
      const result = await adminJobService.performBulkOperation(operation, state.selectedJobs, parameters);
      
      setState(prev => ({
        ...prev,
        bulkOperation: {
          isProcessing: false,
          operation: null,
          result,
        },
        selectedJobs: [],
      }));

      toast({
        title: 'Bulk operation completed',
        description: `Successfully processed ${result.successfulJobs} out of ${result.totalJobs} jobs`,
        variant: result.failedJobs > 0 ? 'destructive' : 'default',
      });

      // Reload jobs after bulk operation
      loadJobs(state.pagination.currentPage, state.searchCriteria);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bulk operation failed';
      setState(prev => ({
        ...prev,
        bulkOperation: { isProcessing: false, operation: null, result: null },
      }));
      
      toast({
        title: 'Bulk operation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Handle individual job actions
  const handleJobAction = async (jobId: string, action: string) => {
    switch (action) {
      case 'view':
        navigate(`/admin/jobs/${jobId}`);
        break;
      case 'edit':
        navigate(`/admin/jobs/${jobId}/edit`);
        break;
      case 'delete':
        try {
          await adminJobService.deleteJob(jobId);
          toast({
            title: 'Job deleted',
            description: 'Job has been successfully deleted',
          });
          loadJobs(state.pagination.currentPage, state.searchCriteria);
        } catch (error) {
          toast({
            title: 'Delete failed',
            description: error instanceof Error ? error.message : 'Failed to delete job',
            variant: 'destructive',
          });
        }
        break;
      case 'moderate':
        navigate(`/admin/jobs/${jobId}/moderate`);
        break;
      case 'toggle-featured':
        // This would be implemented as a quick toggle
        try {
          const job = state.jobs.find(j => j.id === jobId);
          if (job) {
            await adminJobService.performBulkOperation(
              job.isFeatured ? 'UNFEATURE' : 'FEATURE',
              [jobId]
            );
            toast({
              title: 'Job updated',
              description: `Job ${job.isFeatured ? 'unfeatured' : 'featured'} successfully`,
            });
            loadJobs(state.pagination.currentPage, state.searchCriteria);
          }
        } catch (error) {
          toast({
            title: 'Update failed',
            description: error instanceof Error ? error.message : 'Failed to update job',
            variant: 'destructive',
          });
        }
        break;
    }
  };

  const handleRefresh = () => {
    loadJobs(state.pagination.currentPage, state.searchCriteria);
  };

  const handleExport = async () => {
    try {
      const blob = await adminJobService.exportJobs('csv', state.searchCriteria);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export completed',
        description: 'Jobs data has been exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export jobs',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and moderate all job postings across the platform
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/jobs/analytics')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={state.loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/admin/jobs/new')}>
            <Plus className="w-4 h-4 mr-1" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{state.pagination.totalItems}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold">{state.selectedJobs.length}</p>
              </div>
              <Checkbox className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">
                  {state.jobs.filter(job => job.status === 'ACTIVE').length}
                </p>
              </div>
              <Badge variant="default" className="h-8 px-3">Active</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {state.jobs.filter(job => job.moderationStatus === 'PENDING').length}
                </p>
              </div>
              <Badge variant="outline" className="h-8 px-3 border-yellow-500 text-yellow-700">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AdminJobFilters
        filters={state.filters}
        searchCriteria={state.searchCriteria}
        onSearchChange={handleSearch}
        onClearFilters={() => handleSearch({})}
        isLoading={state.loading}
      />

      {/* Bulk Actions */}
      <AdminBulkActions
        selectedJobIds={state.selectedJobs}
        onBulkOperation={handleBulkOperation}
        bulkOperationResult={state.bulkOperation.result}
        isProcessing={state.bulkOperation.isProcessing}
        onClearSelection={handleClearSelection}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={state.selectedJobs.length === state.jobs.length && state.jobs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">
              Select All ({state.jobs.length} jobs)
            </span>
          </div>
          
          {state.selectedJobs.length > 0 && (
            <Badge variant="secondary">
              {state.selectedJobs.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Jobs Grid/List */}
      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading jobs...</span>
        </div>
      ) : state.error ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">{state.error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      ) : state.jobs.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">No jobs found matching your criteria</p>
            <Button onClick={() => handleSearch({})}>Clear Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {state.jobs.map(job => (
            <AdminJobCard
              key={job.id}
              job={job}
              isSelected={state.selectedJobs.includes(job.id)}
              onSelect={handleJobSelect}
              onEdit={(jobId) => handleJobAction(jobId, 'edit')}
              onDelete={(jobId) => handleJobAction(jobId, 'delete')}
              onModerate={(jobId) => handleJobAction(jobId, 'moderate')}
              onViewDetails={(jobId) => handleJobAction(jobId, 'view')}
              onToggleFeatured={(jobId) => handleJobAction(jobId, 'toggle-featured')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {state.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={state.pagination.currentPage + 1}
            totalPages={state.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;