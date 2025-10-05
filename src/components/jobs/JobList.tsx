import { Component } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PenSquare, Trash2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  job_type: string;
  created_at: string;
  status: string;
  applications_count: number;
}

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  onJobDeleted?: (jobId: string) => void;
}

interface JobListState {
  deletingJobId: string | null;
}

export class JobList extends Component<JobListProps, JobListState> {
  constructor(props: JobListProps) {
    super(props);
    this.state = {
      deletingJobId: null
    };
  }

  handleDeleteJob = async (jobId: string) => {
    this.setState({ deletingJobId: jobId });
    
    try {
      // Simulate delete API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Notify parent
      if (this.props.onJobDeleted) {
        this.props.onJobDeleted(jobId);
      }
      
      // Show toast (would implement with your toast system)
      console.log('Job deleted successfully');
    } catch (error) {
      console.error('Failed to delete job:', error);
    } finally {
      this.setState({ deletingJobId: null });
    }
  };

  render() {
    const { jobs, isLoading } = this.props;
    const { deletingJobId } = this.state;
    
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border shadow-sm rounded-lg p-4">
              <div className="pb-2">
                <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="py-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="pt-2">
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (!jobs || jobs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No jobs found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="border shadow-sm rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">
                    <Link to={`/employer/jobs/${job.id}`} className="hover:text-gray-400">
                      {job.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500">{job.company}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${job.status === 'active' ? 'bg-green-100 text-green-800' : 
                    job.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                    job.status === 'archived' ? 'bg-amber-100 text-amber-800' : 
                    'bg-gray-200 text-gray-800'}`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  <div className="ml-2 relative">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                    {/* Dropdown would go here */}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {job.applications_count} applications
                </span>
                <span className="mx-2">•</span>
                <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link to={`/employer/jobs/${job.id}/applications`}>
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    View Applications
                  </button>
                </Link>
                <div className="flex space-x-2">
                  <Link to={`/employer/jobs/${job.id}/edit`}>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <PenSquare className="h-4 w-4 text-gray-500" />
                    </button>
                  </Link>
                  <button 
                    className="p-1 rounded hover:bg-gray-100" 
                    onClick={() => this.handleDeleteJob(job.id)}
                    disabled={deletingJobId === job.id}
                  >
                    {deletingJobId === job.id ? (
                      <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
