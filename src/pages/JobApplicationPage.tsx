import React, { Component } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';
import VerificationBanner from '../components/student/VerificationBanner';

// Interface for the job details
interface Job {
  id: string;
  title: string;
  company_name: string | null;
}

// Props for the application page component
interface JobApplicationPageProps {
  jobId: string;
  navigate: (path: string) => void;
}

// State for the application page
interface JobApplicationPageState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    experience: string;
    coverLetter: string;
  };
  submitting: boolean;
  submitError: string | null;
}

class JobApplicationPageClass extends Component<JobApplicationPageProps, JobApplicationPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  constructor(props: JobApplicationPageProps) {
    super(props);
    this.state = {
      job: null,
      loading: true,
      error: null,
      formData: {
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        coverLetter: ''
      },
      submitting: false,
      submitError: null
    };
  }
  
  componentDidMount() {
    this.fetchJobDetails();
    
    // Try to pre-fill form with user data if available
    const { user } = this.context || {};
    if (user) {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          fullName: user.username || '',
          email: user.email || ''
        }
      }));
    }
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
    
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${this.API_BASE_URL}/jobs/${jobId}`, {
        headers
      });
      
      if (response.data) {
        this.setState({
          job: {
            id: response.data.id,
            title: response.data.title,
            company_name: response.data.companyName
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
  
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };
  
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    this.setState({ submitting: true, submitError: null });
    
    try {
      const { jobId } = this.props;
      const { formData } = this.state;
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("You must be logged in to apply");
      }
      
      const response = await axios.post(
        `${this.API_BASE_URL}/applications/apply/${jobId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        // Success! Redirect to applications tracking page
        this.props.navigate('/track');
      } else {
        this.setState({
          submitError: "Failed to submit application. Please try again.",
          submitting: false
        });
      }
    } catch (err: any) {
      console.error("Application submission error:", err);
      
      let errorMessage = "Failed to submit application. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      this.setState({
        submitError: errorMessage,
        submitting: false
      });
    }
  };
  
  render() {
    const { job, loading, error, formData, submitting, submitError } = this.state;
    
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-2xl mx-auto my-8">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/opportunities" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse other opportunities
          </Link>
        </div>
      );
    }
    
    if (!job) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 max-w-2xl mx-auto my-8">
          <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
          <p>The job you're looking for could not be found.</p>
          <Link to="/opportunities" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse other opportunities
          </Link>
        </div>
      );
    }
    
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center">
            <Link to={`/opportunities/${job.id}`} className="inline-flex">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Job Details</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col space-y-6 p-4 md:p-6 bg-white rounded-lg shadow-sm">
            <VerificationBanner onlyShowIfUnverified={true} />
            
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-gray-600">{job.company_name}</p>
            </div>
            
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {submitError}
              </div>
            )}
            
            <form onSubmit={this.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="experience" className="text-sm font-medium text-gray-700 block">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={this.handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="coverLetter" className="text-sm font-medium text-gray-700 block">
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={this.handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us why you're interested in this position and how your experience makes you a good fit..."
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => this.props.navigate(`/opportunities/${this.props.jobId}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }
}

// Wrapper component to use hooks with class component
export function JobApplicationPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = params.id || '';
  
  return <JobApplicationPageClass jobId={jobId} navigate={navigate} />;
} 