import React, { Component } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Edit3,
  CheckCircle,
  XCircle,
  Building2,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import jobService from '@/lib/api/jobService';

interface Company {
  id: string;
  name: string;
  website?: string;
  description?: string;
  location?: string;
  email: string;
  phone?: string;
  industry?: string;
  companySize?: string;
  logoUrl?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  active: boolean;
}

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
  closingDate?: string;
  skillsPreferred?: string;
  company?: Company;
}

interface JobDetailsPageProps {
  jobId: string;
  navigate: (path: string) => void;
}

interface JobDetailsPageState {
  job: Job | null;
  isLoading: boolean;
  error: string | null;
  redirectTo: string | null;
}

class JobDetailsPageClass extends Component<JobDetailsPageProps, JobDetailsPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: JobDetailsPageProps) {
    super(props);
    this.state = {
      job: null,
      isLoading: true,
      error: null,
      redirectTo: null,
    };
  }

  componentDidMount() {
    this.fetchJobDetails();
  }

  fetchJobDetails = async () => {
    const { user } = this.context || {};
    
    if (!user || !user.roles.includes('ROLE_NLO')) {
      this.setState({ redirectTo: '/login' });
      return;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      const data = await jobService.getEmployerJobById(this.props.jobId);
      this.setState({ job: data });
    } catch (err: any) {
      this.setState({
        error: err.message || 'Failed to fetch job details.'
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Not specified';
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  render() {
    const { job, isLoading, error, redirectTo } = this.state;
    const { navigate } = this.props;
    const { user } = this.context || {};

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      );
    }

    if (error || !job) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error || 'Job not found'}</p>
            <Button onClick={() => navigate('/employer/jobs')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/employer/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant={job.active ? 'default' : 'destructive'}>
                  {job.active ? (
                    <><CheckCircle className="mr-1 h-3 w-3" /> Active</>
                  ) : (
                    <><XCircle className="mr-1 h-3 w-3" /> Inactive</>
                  )}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Posted on {this.formatDate(job.postedAt)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="default" 
                onClick={() => navigate(`/employer/jobs/edit/${job.id}`)}
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit Job
              </Button>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {job.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {job.requiredSkills ? (
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.split(',').map((skill: string) => (
                      <Badge key={skill.trim()} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No required skills specified.</p>
                )}
              </CardContent>
            </Card>

            {job.skillsPreferred && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferred Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsPreferred.split(',').map((skill: string) => (
                      <Badge key={skill.trim()} variant="outline">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                    <p className="text-gray-900 dark:text-white">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employment Type</p>
                    <p className="text-gray-900 dark:text-white">{job.employmentType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salary Range</p>
                    <p className="text-gray-900 dark:text-white">
                      {this.formatSalary(job.minSalary, job.maxSalary, job.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posted Date</p>
                    <p className="text-gray-900 dark:text-white">{this.formatDate(job.postedAt)}</p>
                  </div>
                </div>

                {job.closingDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closing Date</p>
                      <p className="text-gray-900 dark:text-white">{this.formatDate(job.closingDate)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.company.logoUrl && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={job.company.logoUrl} 
                        alt={`${job.company.name} logo`}
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.company.name}</p>
                  </div>

                  {job.company.industry && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry</p>
                      <p className="text-gray-900 dark:text-white">{job.company.industry}</p>
                    </div>
                  )}

                  {job.company.companySize && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Size</p>
                      <p className="text-gray-900 dark:text-white">{job.company.companySize}</p>
                    </div>
                  )}

                  {job.company.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                        <p className="text-gray-900 dark:text-white">{job.company.location}</p>
                      </div>
                    </div>
                  )}

                  {job.company.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</p>
                        <a 
                          href={job.company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {job.company.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {job.company.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                        <a 
                          href={`mailto:${job.company.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {job.company.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {job.company.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</p>
                        <a 
                          href={`tel:${job.company.phone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {job.company.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {job.company.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">About</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{job.company.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/employer/jobs/edit/${job.id}`)}
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Job Posting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

// Wrapper component to use React Router hooks
export const JobDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  if (!jobId) {
    return <Navigate to="/employer/jobs" />;
  }

  return <JobDetailsPageClass jobId={jobId} navigate={navigate} />;
};
