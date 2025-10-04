import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { PlusCircle, Edit3, Trash2, Eye, MapPin, Briefcase, Calendar, Clock, X } from 'lucide-react';
import jobService from '@/lib/api/jobService';
import AlertDialog from '@/components/ui/AlertDialog';

// Define interfaces for the Job data structure from backend
interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requiredSkills: string;
  employmentType: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  postedAt: string;
  active: boolean;
  applications: JobApplication[];
}

interface JobApplication {
  id: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
  lastUpdatedAt: string;
  active: boolean;
}

interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

interface EmployerJobsPageState {
  jobsPage: Page<Job> | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  redirectTo: string | null;
  showDeleteAlert: boolean;
  jobToDelete: string | null;
  filters: {
    status: 'ALL' | 'ACTIVE' | 'INACTIVE';
    searchTerm: string;
    sortBy: 'postedAt' | 'title' | 'applications';
    sortDirection: 'asc' | 'desc';
  };
}


export class EmployerJobsPage extends Component<{}, EmployerJobsPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      jobsPage: {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 5,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true,
          },
          offset: 0,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalPages: 0,
        totalElements: 0,
        first: true,
        size: 5,
        number: 0,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        numberOfElements: 0,
        empty: true,
      },
      isLoading: true,
      error: null,
      currentPage: 0,
      redirectTo: null,
      showDeleteAlert: false,
      jobToDelete: null,
      filters: {
        status: 'ACTIVE',
        searchTerm: '',
        sortBy: 'postedAt',
        sortDirection: 'desc'
      }
    };
  }

  componentDidMount() {
    this.fetchJobs(this.state.currentPage);
  }

  fetchJobs = async (page: number) => {
    const { user } = this.context || {};
    
    if (!user || !user.roles.includes('ROLE_EMPLOYER')) {
      this.setState({ redirectTo: '/login' });
      return;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      const data = await jobService.getEmployerJobs(page, 5);
      // Convert array response to Page<Job> format
      const pageData: Page<Job> = {
        content: Array.isArray(data) ? data : [],
        pageable: {
          pageNumber: page,
          pageSize: 5,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true,
          },
          offset: page * 5,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalPages: 1,
        totalElements: Array.isArray(data) ? data.length : 0,
        first: page === 0,
        size: 5,
        number: page,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        numberOfElements: Array.isArray(data) ? data.length : 0,
        empty: Array.isArray(data) ? data.length === 0 : true,
      };
      
      this.setState({
        jobsPage: pageData,
        currentPage: page
      });
    } catch (err: any) {
      this.setState({
        error: err.message || 'Failed to fetch jobs.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleDelete = (jobId: string) => {
    this.setState({
      showDeleteAlert: true,
      jobToDelete: jobId
    });
  };

  confirmDelete = async () => {
    const { jobToDelete } = this.state;
    if (!jobToDelete) return;

    this.setState({ isLoading: true, showDeleteAlert: false });
    
    try {
      await jobService.deleteJob(jobToDelete);
      // Refresh the job list
      this.fetchJobs(this.state.currentPage);
      toast.success({
        title: "Success",
        description: "Job posting deleted successfully"
      });
    } catch (err: any) {
      toast.destructive({
        title: "Error",
        description: "Failed to delete job posting"
      });
      this.setState({
        error: err.message || 'Failed to delete job.'
      });
    } finally {
      this.setState({ isLoading: false, jobToDelete: null });
    }
  };

  cancelDelete = () => {
    this.setState({
      showDeleteAlert: false,
      jobToDelete: null
    });
  };
  
  handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage }, () => {
      this.fetchJobs(newPage);
    });
  };

  handleFilterChange = (filterType: keyof EmployerJobsPageState['filters'], value: any) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [filterType]: value
      }
    }));
  };

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.handleFilterChange('searchTerm', e.target.value);
  };

  handleStatusFilterChange = (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    this.handleFilterChange('status', status);
  };

  handleSortChange = (sortBy: 'postedAt' | 'title' | 'applications') => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        sortBy,
        sortDirection: prevState.filters.sortBy === sortBy && prevState.filters.sortDirection === 'desc' ? 'asc' : 'desc'
      }
    }));
  };

  handleResetFilters = () => {
    this.setState({
      filters: {
        status: 'ACTIVE',
        searchTerm: '',
        sortBy: 'postedAt',
        sortDirection: 'desc'
      }
    });
  };

  getFilteredJobs = () => {
    const { jobsPage } = this.state;
    if (!jobsPage || !jobsPage.content) return [];
    
    const { status, searchTerm, sortBy, sortDirection } = this.state.filters;

    // First filter by status and search term
    let filtered = jobsPage.content.filter(job => {
      // Filter by status
      if (status !== 'ALL') {
        const isActive = status === 'ACTIVE';
        if (job.active !== isActive) {
          return false;
        }
      }

      // Filter by search term
      if (searchTerm && !this.matchesSearchTerm(job, searchTerm)) {
        return false;
      }

      return true;
    });

    // Then sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'postedAt':
          comparison = new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'applications':
          comparison = (a.applications?.length || 0) - (b.applications?.length || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  matchesSearchTerm = (job: Job, searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.description?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term) ||
      job.requiredSkills?.toLowerCase().includes(term) ||
      job.employmentType?.toLowerCase().includes(term)
    );
  };

  render() {
    const { jobsPage, isLoading, error, currentPage, redirectTo } = this.state;
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    return (
      <>
        <AlertDialog
          open={this.state.showDeleteAlert}
          onOpenChange={() => this.setState({ showDeleteAlert: false, jobToDelete: null })}
          title="Are you sure?"
          description="You want to stop accepting applications?."
          cancelText="Cancel"
          confirmText="Confirm"
          onCancel={this.cancelDelete}
          onConfirm={this.confirmDelete}
        />

    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Job Postings</h1>
        <Link to="/employer/jobs/create">
          <Button variant="default">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Job
          </Button>
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, description, skills..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={this.state.filters.searchTerm}
              onChange={this.handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select 
                className="appearance-none bg-background border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                value={this.state.filters.status}
                onChange={(e) => this.handleStatusFilterChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none bg-background border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                value={this.state.filters.sortBy}
                onChange={(e) => this.handleSortChange(e.target.value as 'postedAt' | 'title' | 'applications')}
              >
                <option value="postedAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="applications">Sort by Applications</option>
              </select>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => this.handleSortChange(this.state.filters.sortBy)}
              title={`Sort ${this.state.filters.sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {this.state.filters.sortDirection === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </Button>
          </div>
        </div>
        
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={this.state.filters.status === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => this.handleStatusFilterChange('ALL')}
          >
            All
          </Button>
          <Button
            variant={this.state.filters.status === 'ACTIVE' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => this.handleStatusFilterChange('ACTIVE')}
          >
            Active
          </Button>
          <Button
            variant={this.state.filters.status === 'INACTIVE' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => this.handleStatusFilterChange('INACTIVE')}
          >
            Inactive
          </Button>
          
          {(this.state.filters.status !== 'ACTIVE' || 
            this.state.filters.searchTerm !== '' || 
            this.state.filters.sortBy !== 'postedAt' || 
            this.state.filters.sortDirection !== 'desc') && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full ml-auto"
              onClick={this.handleResetFilters}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filters
            </Button>
          )}
        </div>
        
        {/* Results count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {this.getFilteredJobs().length} of {jobsPage?.content?.length || 0} job postings
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-600 dark:text-gray-400">Loading jobs...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && jobsPage?.content?.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">You haven't posted any jobs yet.</p>
      )}

      {jobsPage && jobsPage.content?.length > 0 && this.getFilteredJobs().length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">No jobs match your current filters.</p>
      )}

      {jobsPage && jobsPage.content?.length > 0 && this.getFilteredJobs().length > 0 && (
        <div className="space-y-4">
          {this.getFilteredJobs().map((job) => (
            <Card key={job.id} className="dark:bg-gray-800 border-0 shadow-md overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      job.active ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 
                      'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                    }`}>
                      {job.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.employmentType}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Posted: {new Date(job.postedAt).toLocaleDateString('en-US', { 
                        month: 'numeric', day: 'numeric', year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-gray-700 dark:text-gray-300">{job.description || 'No description available.'}</p>
                  
                  {job.requiredSkills && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-400">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.split(',').map((skill: string) => (
                          <span key={skill.trim()} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
              <CardFooter className="flex justify-between items-center py-3 bg-gray-750 dark:bg-gray-850">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  
                  <span className="text-sm"></span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/employer/jobs/applications/${job.id}`}> 
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" /> View Apps
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {job.applications?.length || 0}
                      </span>
                    </Button>
                  </Link>
                  <Link to={`/employer/jobs/edit/${job.id}`}> 
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => this.handleDelete(job.id)} disabled={isLoading}>
                    <X className="mr-1 h-4 w-4" /> Close
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {jobsPage && jobsPage.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button 
            variant="outline" 
              onClick={() => this.handlePageChange(currentPage - 1)} 
            disabled={currentPage === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage + 1} of {jobsPage.totalPages}
          </span>
          <Button 
            variant="outline" 
              onClick={() => this.handlePageChange(currentPage + 1)} 
            disabled={currentPage === jobsPage.totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
      </>
    );
  }
}
