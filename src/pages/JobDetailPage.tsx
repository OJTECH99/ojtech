import React, { Component } from 'react';
import { Link, useParams, useNavigate, NavigateFunction, useLocation, Location } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Loader2, MapPin, Briefcase, DollarSign, ArrowLeft, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import apiClient from '../lib/api/apiClient';
import authService from '../lib/api/authService';

// Application interface
interface JobApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
  lastUpdatedAt: string;
  active: boolean;
}

// Job Match interface
interface JobMatch {
  id: string;
  createdAt: string;
  updatedAt: string;
  matchScore: number;
  matchedAt: string;
  matchDetails: string;
  detailedAnalysis: string;
  viewed: boolean;
  active: boolean;
}

// Base Job interface
interface Job {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  location: string | null;
  requiredSkills: string;
  employmentType: string;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  postedAt: string;
  active: boolean;
  applications?: JobApplication[];
  jobMatches?: JobMatch[];
  match_score?: number | null;
}

// Props for the JobDetailPage component
interface JobDetailPageProps {
  jobId?: string;
  navigate: NavigateFunction;
  location: Location;
}

// State for the JobDetailPage component
interface JobDetailPageState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  showMatchDetails: boolean;
}

// Helper function to get match score color
const getScoreColor = (score: number | null): string => {
  if (score === null || score === undefined) return "text-gray-400";
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
};

// Helper function to get human-readable match score label
const getScoreLabel = (score: number | null): string => {
  if (score === null || score === undefined) return "No match data";
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Potential Match";
  return "Low Match";
};

// Format salary range
const formatSalary = (min: number | null, max: number | null, currency: string | null): string => {
  if (min === null && max === null) return "Not specified";
  
  const currencySymbol = currency === "USD" ? "$" : 
                         currency === "EUR" ? "€" : 
                         currency === "GBP" ? "£" : 
                         currency || "";
  
  if (min !== null && max !== null) {
    return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
  } else if (min !== null) {
    return `From ${currencySymbol}${min.toLocaleString()}`;
  } else if (max !== null) {
    return `Up to ${currencySymbol}${max.toLocaleString()}`;
  }
  
  return "Not specified";
};

class JobDetailPageClass extends Component<JobDetailPageProps, JobDetailPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: JobDetailPageProps) {
    super(props);
    this.state = {
      job: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      userRole: null,
      showMatchDetails: false
    };
  }
  
  componentDidMount() {
    // Check authentication status
    if (this.context?.user) {
      this.setState({
        isAuthenticated: true,
        userRole: this.context.user.roles?.[0] || null
      });
    }
    
    // Check auth status in localStorage
    authService.checkAuthStatus();
    
    this.fetchJobDetails();
  }
  
  fetchJobDetails = async () => {
    const { jobId } = this.props;
    if (!jobId) {
      this.setState({
        error: "Job ID is missing",
        loading: false
      });
      return;
    }
    
    this.setState({ loading: true, error: null });
    
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      
      if (response.data) {
        const jobData = response.data;
        
        // Find the user's match score if available
        let userMatchScore = null;
        if (jobData.jobMatches && jobData.jobMatches.length > 0) {
          // Get the first match score for now (could be filtered by current user ID in the future)
          userMatchScore = jobData.jobMatches[0].matchScore;
        }
        
        this.setState({
          job: {
            ...jobData,
            match_score: userMatchScore
          },
          loading: false
        });
      } else {
        this.setState({
          error: "Job not found",
          loading: false
        });
      }
    } catch (err) {
      console.error("Fetch job details error:", err);
      this.setState({
        error: "Failed to load job details",
        loading: false
      });
    }
  };
  
  toggleMatchDetails = () => {
    this.setState(prevState => ({
      showMatchDetails: !prevState.showMatchDetails
    }));
  };
  
  handleApplyClick = async () => {
    const { job } = this.state;
    const { navigate } = this.props;
    const { isAuthenticated, userRole } = this.state;
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnUrl: `/opportunities/${job?.id}` } });
      return;
    }
    
    if (!job) return;
    
    // Get the context safely
    const authContext = this.context;
    if (!authContext) {
      console.error("Auth context is undefined");
      return;
    }
    
    const { user } = authContext;
    
    if (!user) {
      // Redirect to login page
      navigate('/login', { state: { returnUrl: `/opportunities/${job?.id}` } });
      return;
    }
    
    // Check if user is a student
    if (user.roles && user.roles.includes('ROLE_STUDENT')) {
      try {
        const response = await apiClient.post(
          `/api/job-applications/apply`,
          { jobId: job.id }
        );
        
        // Redirect to applications tracking page
        navigate('/track');
      } catch (err) {
        console.error("Error applying for job:", err);
        // Show error notification
      }
    } else {
      // Show message that only students can apply
      console.error("Only students can apply for jobs");
    }
  };
  
  render() {
    const { job, loading, error, showMatchDetails } = this.state;
    
    if (loading) {
      return (
        <div className="container max-w-4xl mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-lg">Loading job details...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-red-600 text-xl font-semibold mb-2">Error Loading Job</h2>
            <p className="text-red-800">{error}</p>
            <Link to="/opportunities">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunities
            </Button>
          </Link>
          </div>
        </div>
      );
    }

    if (!job) {
    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <h2 className="text-amber-600 text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-amber-800">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/opportunities">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunities
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/opportunities">
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Button>
          </Link>
        </div>
                
        <div className="bg-black rounded-xl border border-gray-800 shadow-sm overflow-hidden text-white">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-white">{job.title}</h1>
                <p className="text-sm text-gray-400 mt-1">Posted on {new Date(job.postedAt).toLocaleDateString()}</p>
              </div>
                
              {job.match_score !== undefined && job.match_score !== null && (
                <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800 text-center min-w-[100px]">
                  <span className={`text-2xl font-bold ${getScoreColor(job.match_score)}`}>
                    {job.match_score.toFixed(1)}%
                  </span>
                  <p className="text-xs text-gray-400">{getScoreLabel(job.match_score)}</p>
                  {job.jobMatches && job.jobMatches.length > 0 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-xs p-0 h-auto mt-1 text-blue-400 hover:text-blue-300"
                      onClick={this.toggleMatchDetails}
                    >
                      {showMatchDetails ? 'Hide details' : 'View match details'}
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Match Details Section */}
            {showMatchDetails && job.jobMatches && job.jobMatches.length > 0 && (
              <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-md font-medium mb-2 text-white">Match Analysis</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800 p-3 rounded border border-gray-700">
                  {job.jobMatches[0].detailedAnalysis}
                </pre>
              </div>
            )}
            
            <div className="flex flex-wrap gap-y-2 text-gray-400">
                {job.location && (
                <div className="flex items-center mr-6">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                )}
                
                {job.employmentType && (
                <div className="flex items-center mr-6">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{job.employmentType}</span>
                </div>
                )}
                
                {(job.minSalary !== null || job.maxSalary !== null) && (
                <div className="flex items-center mr-6">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{formatSalary(job.minSalary, job.maxSalary, job.currency)}</span>
                </div>
                )}
                
              
              </div>
              
            
          </div>
          
          {/* Description Section */}
          <div className="p-6 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">About this position</h2>
            <div className="prose max-w-none prose-invert">
              {job.description ? (
                <p className="text-gray-300">{job.description}</p>
              ) : (
                <p className="text-gray-500">No description provided.</p>
              )}
            </div>
          </div>
              
          {/* Skills Section */}
          {job.requiredSkills && (
            <div className="p-6 border-t border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-white">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 text-blue-400 rounded-full text-sm border border-gray-700"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Application Status Section - Show if user has applied */}
          {job.applications && job.applications.length > 0 && this.state.isAuthenticated && (
            <div className="p-6 border-t border-gray-800 bg-gray-900">
              <h2 className="text-xl font-semibold mb-4 text-white">Your Application Status</h2>
              <div className="flex items-center">
                {job.applications[0].status === 'PENDING' && (
                  <>
                    <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                    <span className="font-medium text-yellow-400">Application Pending Review</span>
                  </>
                )}
                {job.applications[0].status === 'REVIEWED' && (
                  <>
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="font-medium text-blue-400">Application Reviewed</span>
                  </>
                )}
                {job.applications[0].status === 'INTERVIEW' && (
                  <>
                    <Users className="h-5 w-5 mr-2 text-purple-500" />
                    <span className="font-medium text-purple-400">Interview Stage</span>
                  </>
                )}
                {job.applications[0].status === 'ACCEPTED' && (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span className="font-medium text-green-400">Application Accepted</span>
                  </>
                )}
                {job.applications[0].status === 'REJECTED' && (
                  <>
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                    <span className="font-medium text-red-400">Application Rejected</span>
                  </>
                )}
                <span className="ml-auto text-sm text-gray-400">
                  Applied on {new Date(job.applications[0].appliedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
              
         
        
        </div>
      </div>
    );
  }
}

// React Router v6 wrapper using hooks
export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <JobDetailPageClass 
      jobId={id} 
      navigate={navigate}
      location={location}
    />
  );
} 