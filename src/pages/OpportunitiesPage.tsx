import { Component, createRef, RefObject } from "react";
import TinderCard from "react-tinder-card";
import { Loader2, Briefcase, MapPin, Calendar, DollarSign, Info, HelpCircle, ChevronRight, AlertTriangle, FileText, Clock, Target, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmailDraftModal } from "../components/EmailDraftModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/Popover";
import jobApplicationService, { EmailDraft } from "../lib/api/jobApplicationService";
import profileService from "../lib/api/profileService";

// Job types
interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  required_skills: string[];
  preferred_skills: Record<string, any> | null;
  application_deadline: string | null;
  created_at: string;
  updated_at: string | null;
  status: string;
  is_active: boolean;
}

// Extended job type with match score and company logo
interface JobWithMatchScore extends Job {
  match_score: number | null;
  company_logo_url: string | null;
  viewed: boolean;
  original_id?: string; // Add original job ID for API calls
}

// Define the toast interface (simplified for now)
interface Toast {
  title: string;
  description: string;
  variant?: string;
}

interface StudentProfile {
  preojtOrientationUrl: string | null;
  verified: boolean;
  verifiedAt: string | null;
  verificationNotes: string | null;
}

interface OpportunitiesPageState {
  jobs: JobWithMatchScore[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  lastRemovedJob: {
    job: JobWithMatchScore;
    direction: "left" | "right";
  } | null;
  expandedJobId: string | null;
  isProcessingCV: boolean;
  studentProfile: StudentProfile | null;
  profileLoading: boolean;
  emailModalOpen: boolean;
  emailDraft: EmailDraft | null;
  pendingApplicationId: string | null;
  currentJobForEmail: JobWithMatchScore | null;
  showMatchingInfo: boolean;
  appliedJobIds: Set<string>;
  applicationsLoading: boolean;
}

export class OpportunitiesPage extends Component<{}, OpportunitiesPageState> {
  // Refs for controlling cards programmatically
  private childRefs: RefObject<any>[] = [];
  
  constructor(props: {}) {
    super(props);
    this.state = {
      jobs: [],
      loading: true,
      error: null,
      currentIndex: 0,
      lastRemovedJob: null,
      expandedJobId: null,
      isProcessingCV: false,
      studentProfile: null,
      profileLoading: true,
      emailModalOpen: false,
      emailDraft: null,
      pendingApplicationId: null,
      currentJobForEmail: null,
      showMatchingInfo: false,
      appliedJobIds: new Set<string>(),
      applicationsLoading: true
    };
  }
  
  componentDidMount() {
    this.fetchStudentProfile();
    this.checkCVProcessingStatus();
    this.fetchUserApplications();
    this.fetchJobs();
  }
  
  // Fetch user applications to track applied job IDs
  fetchUserApplications = async () => {
    try {
      const applications = await jobApplicationService.getStudentApplications();
      const appliedJobIds = new Set(applications.map(app => app.jobId));
      this.setState({ 
        appliedJobIds,
        applicationsLoading: false 
      });
      console.log('Fetched applied job IDs:', Array.from(appliedJobIds));
    } catch (error) {
      console.error("Error fetching user applications:", error);
      // Don't block the page if applications fetch fails
      this.setState({ 
        appliedJobIds: new Set<string>(),
        applicationsLoading: false 
      });
    }
  };
  
  // Fetch student profile to check verification status
  fetchStudentProfile = async () => {
    try {
      const profile = await profileService.getCurrentUserProfileSmart();
      this.setState({ 
        studentProfile: {
          preojtOrientationUrl: profile.preojtOrientationUrl || null,
          verified: profile.verified || false,
          verifiedAt: profile.verifiedAt || null,
          verificationNotes: profile.verificationNotes || null
        },
        profileLoading: false 
      });
    } catch (error) {
      console.error("Error fetching student profile:", error);
      // Don't block the page if profile fetch fails, just continue without profile data
      this.setState({ 
        studentProfile: null,
        profileLoading: false 
      });
    }
  };
  
  componentDidUpdate(prevProps: {}, prevState: OpportunitiesPageState) {
    // Update refs if jobs array changes
    if (prevState.jobs.length !== this.state.jobs.length) {
      this.childRefs = Array(this.state.jobs.length)
        .fill(0)
        .map(() => createRef<any>());
    }
  }
  
  // Check if CV is currently being processed
  checkCVProcessingStatus = async () => {
    try {
      // For now we'll just set isProcessing to false
      // This would be replaced with a real API call in the future
      this.setState({ isProcessingCV: false });
    } catch (error) {
      console.error("Error checking CV processing status:", error);
      this.setState({ isProcessingCV: false });
    }
  };
  
  // Fetch jobs for the current user using the API
  fetchJobs = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // Call the job matching API to get matched jobs
      const matchedJobsData = await jobApplicationService.getStudentJobMatches();
      
      if (matchedJobsData && Array.isArray(matchedJobsData)) {
        // Track seen job IDs to prevent duplicates
        const seenIds = new Set<string>();
        
        // Map API response to our JobWithMatchScore interface
        const matchedJobs: JobWithMatchScore[] = matchedJobsData
          .filter(match => !match.viewed) // Filter out viewed jobs
          .filter(match => {
            // Filter out jobs that user has already applied to
            const jobId = match.job?.id;
            return jobId && !this.state.appliedJobIds.has(jobId);
          })
          .map((match: any) => {
            // Handle the nested structure from the API response
            const job = match.job || {};
            const employer = job.employer || {};
            
            // Ensure unique job ID
            let jobId = job.id;
            const originalJobId = jobId; // Store the original job ID for API calls
            if (seenIds.has(jobId)) {
              jobId = `${jobId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            }
            seenIds.add(jobId);
            
            return {
              id: jobId,
              original_id: originalJobId, // Store the original job ID
              employer_id: employer.id || '',
              title: job.title || 'Untitled Position',
              description: job.description || null,
              company_name: employer.companyName || null,
              company_logo_url: employer.logoUrl || null,
              location: job.location || null,
              job_type: job.employmentType || null,
              salary_range: job.minSalary && job.maxSalary ? 
                `${job.currency || '$'}${job.minSalary.toLocaleString()} - ${job.currency || '$'}${job.maxSalary.toLocaleString()}` : 
                null,
              required_skills: job.requiredSkills ? job.requiredSkills.split(',') : [],
              preferred_skills: null,
              application_deadline: null,
              created_at: job.postedAt || new Date().toISOString(),
              updated_at: null,
              status: "active",
              is_active: true,
              match_score: match.matchScore,
              viewed: match.viewed
            };
          });
        
        // Set jobs and update current index
        this.setState({
          jobs: matchedJobs,
          currentIndex: matchedJobs.length - 1,
          loading: false
        });
        
        // Initialize refs
        this.childRefs = Array(matchedJobs.length)
          .fill(0)
          .map(() => createRef<any>());
      } else {
        // Handle empty or invalid response
        this.setState({
          jobs: [],
          currentIndex: -1,
          loading: false,
          error: "No job matches found. Try again later."
        });
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
      this.setState({
        jobs: [],
        currentIndex: -1,
        loading: false,
        error: "Failed to load job matches. Please try again."
      });
    }
  };
  
  // Find jobs using simple search
  findJobs = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // Call the simple find jobs API
      const jobsData = await jobApplicationService.findJobs();
      
      if (jobsData && Array.isArray(jobsData)) {
        // Filter out jobs that user has already applied to, then map to our interface
        const mappedJobs: JobWithMatchScore[] = jobsData
          .filter(job => {
            // Filter out jobs that user has already applied to
            const jobId = job.id;
            return jobId && !this.state.appliedJobIds.has(jobId);
          })
          .map((job: any) => {
          const employer = job.employer || {};
          const jobId = job.id;
          
          return {
            id: jobId,
            original_id: jobId, // Store the original job ID
            employer_id: employer.id || '',
            title: job.title || 'Untitled Position',
            description: job.description || null,
            company_name: employer.companyName || null,
            company_logo_url: employer.logoUrl || null,
            location: job.location || null,
            job_type: job.employmentType || null,
            salary_range: job.minSalary && job.maxSalary ? 
              `${job.currency || '$'}${job.minSalary.toLocaleString()} - ${job.currency || '$'}${job.maxSalary.toLocaleString()}` : 
              null,
            required_skills: job.requiredSkills ? job.requiredSkills.split(',') : [],
            preferred_skills: null,
            application_deadline: null,
            created_at: job.postedAt || new Date().toISOString(),
            updated_at: null,
            status: "active",
            is_active: true,
            match_score: null,
            viewed: false
          };
        });
        
        // Set jobs and update current index
        this.setState({
          jobs: mappedJobs,
          currentIndex: mappedJobs.length - 1,
          loading: false
        });
        
        // Initialize refs
        this.childRefs = Array(mappedJobs.length)
          .fill(0)
          .map(() => createRef<any>());
      } else {
        // Handle empty or invalid response
        this.setState({
          jobs: [],
          currentIndex: -1,
          loading: false,
          error: "No jobs found. Try again later."
        });
      }
    } catch (err) {
      console.error("Find jobs error:", err);
      this.setState({
        jobs: [],
        currentIndex: -1,
        loading: false,
        error: "Failed to find jobs. Please try again."
      });
    }
  };
  
  // Apply for a job using the API
  applyForJob = async (jobId: string) => {
    try {
      // Find the job in our state to get the original ID if available
      const job = this.state.jobs.find(j => j.id === jobId);
      const apiJobId = job?.original_id || jobId;
      
      // This uses the endpoint /api/applications/apply/{jobID} as defined in jobApplicationService
      const response = await jobApplicationService.applyForJob(apiJobId, {});
      console.log("Job application submitted successfully:", response);
      
      // Add the job ID to applied jobs set to prevent showing it again
      this.setState(prevState => ({
        appliedJobIds: new Set([...prevState.appliedJobIds, apiJobId])
      }));
      
      return { success: true, data: response };
    } catch (error) {
      console.error("Error applying for job:", error);
      return { success: false, error: "Failed to apply for job" };
    }
  };
  
  // Open email modal with draft
  openEmailModal = async (applicationId: string, job: JobWithMatchScore) => {
    try {
      const emailDraft = await jobApplicationService.prepareApplicationEmail(applicationId);
      this.setState({
        emailModalOpen: true,
        emailDraft,
        pendingApplicationId: applicationId,
        currentJobForEmail: job
      });
    } catch (error) {
      console.error("Error preparing email:", error);
      this.toast({
        title: "Error",
        description: "Failed to prepare email. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Send application email
  sendApplicationEmail = async (emailBody: string, subject: string, attachments?: File[]) => {
    const { pendingApplicationId } = this.state;
    if (!pendingApplicationId) return;
    
    try {
      const result = await jobApplicationService.sendApplicationEmail(
        pendingApplicationId, 
        {
          subject,
          emailBody
        },
        attachments
      );
      
      this.toast({
        title: "Email Sent Successfully!",
        description: `${result.message}. Emails sent today: ${result.emailsSentToday}/10`
      });
      
      this.setState({
        emailModalOpen: false,
        emailDraft: null,
        pendingApplicationId: null,
        currentJobForEmail: null
      });
    } catch (error: any) {
      throw error; // Re-throw to be handled by modal
    }
  };
  
  // Decline a job
  declineJob = async (jobId: string) => {
    try {
      // Find the job in our state to get the original ID if available
      const job = this.state.jobs.find(j => j.id === jobId);
      const apiJobId = job?.original_id || jobId;
      
      // This would be replaced with a real API call in the future
      console.log(`Declined job ${apiJobId}`);
      return { success: true, data: {} };
    } catch (error) {
      console.error("Error declining job:", error);
      return { success: false, error: "Failed to decline job" };
    }
  };
  
  // Simple toast function (would be replaced with a real toast component)
  toast = (toast: Toast) => {
    console.log(`TOAST: ${toast.title} - ${toast.description}`);
    // Here you would use a real toast notification system
  };
  
  // Handle card swipe
  handleSwipe = async (direction: string, job: Job, index: number) => {
    try {
      // Ensure direction is only left or right before processing
      if (direction !== 'left' && direction !== 'right') return;
      
      console.log(`Swiped ${direction} on ${job.title}`);
      this.setState(prevState => ({ 
        currentIndex: index - 1,
        lastRemovedJob: { job: job as JobWithMatchScore, direction: direction as 'left' | 'right' }
      }));
      
      if (direction === 'right') {
        const result = await this.applyForJob(job.id);
        if (result.success && result.data) {
          // Show email modal after successful application
          await this.openEmailModal(result.data.id, job as JobWithMatchScore);
        } else {
          this.toast({
            title: "Application Failed",
            description: result.error || "Failed to apply for job",
            variant: "destructive"
          });
        }
      } else {
        const result = await this.declineJob(job.id);
        if (result.success) {
          this.toast({
            title: `Declined ${job.title}`,
            description: "We won't show you this job again."
          });
        } else {
          this.toast({
            title: "Decline Failed",
            description: result.error || "Failed to decline job",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
      this.toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Handle when a card goes out of frame
  outOfFrame = (jobTitle: string, index: number) => {
    console.log(`${jobTitle} left the screen at index ${index}`);
    // Consider removing the job from the state here if performance is an issue
  };
  
  // Programmatically swipe a card
  swipe = async (dir: "left" | "right") => {
    const { currentIndex } = this.state;
    if (currentIndex < 0 || currentIndex >= this.state.jobs.length) return; // No more cards
    if (!this.childRefs[currentIndex]?.current) {
      console.warn("Card ref not available for swiping");
      return;
    }
    await this.childRefs[currentIndex].current.swipe(dir); // Swipe the current card
  };
  
  // Implement undo swipe functionality
  undoSwipe = async () => {
    const { lastRemovedJob } = this.state;
    if (!lastRemovedJob) return;
    
    // Re-add the job to the state and update the index
    this.setState(prevState => {
      const newJobs = [...prevState.jobs];
      // Reset the viewed status and ensure unique ID by adding timestamp
      const jobToRestore = {
        ...lastRemovedJob.job, 
        viewed: false,
        id: `${lastRemovedJob.job.id}-${Date.now()}`,
        // Preserve the original ID for API calls
        original_id: lastRemovedJob.job.original_id || lastRemovedJob.job.id
      };
      // Add the job back to the stack
      newJobs.splice(prevState.currentIndex + 1, 0, jobToRestore);
      
      return {
        jobs: newJobs,
        currentIndex: prevState.currentIndex + 1,
        lastRemovedJob: null
      };
    });
    
    // Try to reset the viewed status on the server
    try {
      // This would need a new API endpoint to unmark a job as viewed
      // For now, we just update the UI state
      console.log("Would reset viewed status for job:", lastRemovedJob.job.id);
    } catch (error) {
      console.error("Error resetting viewed status:", error);
    }
    
    this.toast({
      title: "Undo Swipe",
      description: `Brought back ${lastRemovedJob.job.title}. You can now re-decide.`
    });
  };
  
  // Helper function to get match score color
  getScoreColor = (score: number | null): string => {
    if (score === null || score === undefined) return "text-gray-400";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Helper function to get human-readable match score label
  getScoreLabel = (score: number | null): string => {
    if (score === null || score === undefined) return "No match data";
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Potential Match";
    return "Low Match";
  };
  
  render() {
    const { jobs, loading, error, currentIndex, lastRemovedJob, expandedJobId, isProcessingCV, studentProfile, profileLoading, emailModalOpen, emailDraft, currentJobForEmail } = this.state;
    
    if (loading || profileLoading || this.state.applicationsLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <main className="min-h-screen container mx-auto py-4 sm:py-6 md:py-8 px-4 flex flex-col items-center relative overflow-hidden">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center">New Job Matches</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 text-center px-2">Swipe right to apply, left to pass.</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 w-full sm:w-auto px-2 sm:px-0">
          <Button onClick={this.fetchJobs} className="w-full sm:w-auto text-sm sm:text-base">
            Find Matched Jobs
          </Button>
          <Button onClick={this.findJobs} variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
            Find More Jobs
          </Button>
        </div>
        
        {/* Error Banner - Show inline instead of full screen */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-2 sm:gap-3 max-w-xl w-full mx-2 sm:mx-0">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1">Error Loading Jobs</p>
              <p className="mb-2 sm:mb-3">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" onClick={this.fetchJobs} variant="default" className="text-xs sm:text-sm">
                  Retry Matched Jobs
                </Button>
                <Button size="sm" onClick={this.findJobs} variant="outline" className="text-xs sm:text-sm">
                  Try Find More Jobs
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* CV Processing Warning */}
        {isProcessingCV && (
          <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-yellow-800 flex items-center gap-2 max-w-xl w-full mx-2 sm:mx-0">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Your CV is still being processed</p>
              <p className="mt-1">
                Matches may not be fully accurate until processing is complete. Check back soon!
              </p>
            </div>
          </div>
        )}
        
        {/* Warning: Missing Pre-OJT Orientation Document */}
        {studentProfile && !studentProfile.preojtOrientationUrl && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-2 sm:gap-3 max-w-xl w-full mx-2 sm:mx-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1">Pre-OJT Orientation Document Required</p>
              <p className="mb-2 sm:mb-3">
                You need to upload your Pre-OJT Orientation Document to find a job. This document is required for verification.
              </p>
              <Link to="/profile">
                <Button size="sm" variant="default" className="text-xs sm:text-sm">
                  Upload Document
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Warning: Pending Admin Verification */}
        {studentProfile && studentProfile.preojtOrientationUrl && !studentProfile.verified && (
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-800 flex items-start gap-2 sm:gap-3 max-w-xl w-full mx-2 sm:mx-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1">Account Verification in Progress</p>
              <p>
                Admin is verifying your account. Please wait while we review your Pre-OJT Orientation Document. 
                You'll be notified once verification is complete.
              </p>
            </div>
          </div>
        )}
        
        {/* Block job viewing if not verified */}
        {studentProfile && (!studentProfile.preojtOrientationUrl || !studentProfile.verified) ? (
          <div className="flex flex-col items-center justify-center mt-8 text-center max-w-md">
            <Info className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {!studentProfile.preojtOrientationUrl 
                ? "Action Required" 
                : "Verification Pending"}
            </h2>
            <p className="text-gray-600 mb-6">
              {!studentProfile.preojtOrientationUrl 
                ? "You need to upload your Pre-OJT Orientation Document before you can view job opportunities." 
                : "Your account is currently under review. You'll be able to view job opportunities once your account is verified by admin."}
            </p>
            {!studentProfile.preojtOrientationUrl && (
              <Link to="/profile">
                <Button>
                  Go to Profile
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* How matching works tooltip */}
            <div className="mb-6 sm:mb-8">
              <Popover open={this.state.showMatchingInfo} onOpenChange={(open) => this.setState({ showMatchingInfo: open })}>
                <PopoverTrigger asChild>
                  <button 
                    className="text-sm text-primary flex items-center gap-1.5 hover:underline cursor-pointer transition-all hover:gap-2 group"
                    onClick={() => this.setState({ showMatchingInfo: !this.state.showMatchingInfo })}
                  >
                    <HelpCircle size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">How matching works</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 sm:w-96 p-0 overflow-hidden" align="center">
                  <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950 p-4 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg">AI-Powered Job Matching</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Our intelligent system analyzes your profile to find the best opportunities
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* How it works */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h5 className="font-semibold text-sm">What We Analyze</h5>
                      </div>
                      <ul className="text-xs space-y-1.5 ml-6 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>Your technical skills vs. job requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>Education background and major</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>Work experience and projects</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>Additional certifications and achievements</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Match score guide */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary" />
                        <h5 className="font-semibold text-sm">Match Score Guide</h5>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-12 h-1.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                          <span className="font-bold text-green-600">80-100%</span>
                          <span className="text-muted-foreground">Strong Match</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-14">
                          Excellent fit! You have most or all required skills. Apply with confidence.
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs mt-3">
                          <div className="w-12 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          <span className="font-bold text-blue-600">60-79%</span>
                          <span className="text-muted-foreground">Good Match</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-14">
                          Great opportunity! You meet many requirements. Highlight relevant skills in your application.
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs mt-3">
                          <div className="w-12 h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
                          <span className="font-bold text-yellow-600">40-59%</span>
                          <span className="text-muted-foreground">Potential Match</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-14">
                          Worth considering! You have some relevant skills. Emphasize transferable experience.
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs mt-3">
                          <div className="w-12 h-1.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                          <span className="font-bold text-red-600">&lt;40%</span>
                          <span className="text-muted-foreground">Growth Opportunity</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-14">
                          Challenge yourself! May require learning new skills. Great for career growth.
                        </p>
                      </div>
                    </div>
                    
                    {/* Tips */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mt-4">
                      <p className="text-xs text-blue-900 dark:text-blue-100 flex items-start gap-2">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Pro Tip:</strong> Keep your profile updated with new skills and projects to get better matches!
                        </span>
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 text-center max-w-md">
            <Info className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No New Job Matches</h2>
            <p className="text-gray-600 mb-6">
              You've viewed all available job matches. Check back later for new opportunities.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Matches
            </Button>
          </div>
        ) : (
          <div className="relative h-[480px] sm:h-[520px] w-full max-w-[90vw] sm:max-w-md">
            {jobs.map((job, index) => (
              <div className="absolute" key={`${job.id}-${index}`}>
                <TinderCard
                  ref={this.childRefs[index]}
                  className="absolute cursor-grab active:cursor-grabbing touch-none"
                  onSwipe={(dir) => this.handleSwipe(dir, job, index)}
                  onCardLeftScreen={() => this.outOfFrame(job.title, index)}
                  preventSwipe={["up", "down"]}
                >
                  <div 
                    className={`bg-gray-900 p-4 sm:p-6 w-[85vw] sm:w-[360px] max-w-[400px] h-[480px] sm:h-[500px] rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col ${
                      expandedJobId === job.id ? 'max-h-none overflow-y-auto' : ''
                    }`}
                  >
                    {/* Avatar, Company & Location */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        {job.company_logo_url ? (
                          <img
                            src={job.company_logo_url}
                            alt={`${job.company_name} logo`}
                            className="w-10 h-10 object-contain rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-medium text-purple-800">
                            {job.company_name ? job.company_name.charAt(0) : 'A'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-base">{job.company_name}</h3>
                        <p className="text-sm text-gray-600">{job.location}</p>
                      </div>
                      <div className="ml-auto">
                        <div className={`${this.getScoreColor(job.match_score)} px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-10 bg-current`}>
                          {job.match_score != null && <span className="text-white">{job.match_score.toFixed(2)}% </span>}
                        </div>
                      </div>
                    </div>

                    {/* Job Title & Subtitle */}
                    <div className="text-center mb-3">
                      <h2 className="text-xl font-medium mb-1">{job.title}</h2>
                      <p className="text-sm text-white-600">
                        {job.job_type || "Subtitle"}
                      </p>
                    </div>

                    {/* Job Description - Limited to 50 chars */}
                    <div className="mb-3">
                      <p className="text-sm text-white-700 leading-relaxed">
                        {job.description 
                          ? (job.description.length > 190 
                             ? job.description.substring(0, 190) + '...' 
                             : job.description)
                          : "No description provided."}
                      </p>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 gap-1.5 mb-3">
                      {job.location && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      {job.job_type && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <Briefcase className="w-3 h-3" />
                          <span>{job.job_type}</span>
                        </div>
                      )}
                      
                      {job.salary_range && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <DollarSign className="w-3 h-3" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                      
                      {job.application_deadline && (
                        <div className="flex items-center gap-2 text-xs text-white-700">
                          <Calendar className="w-3 h-3" />
                          <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Required Skills */}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1.5">Required Skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map((skill, i) => (
                            <span
                              key={`${skill}-${i}`}
                              className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="mt-auto pt-2">
                      <Link to={`/opportunities/${job.original_id}`} className="block w-full">
                        <Button variant="outline" className="w-full flex items-center justify-center text-sm">
                          View Full Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TinderCard>
              </div>
            ))}
          </div>
        )}
        
        {/* Email Draft Modal */}
        {emailModalOpen && emailDraft && currentJobForEmail && (
          <EmailDraftModal
            isOpen={emailModalOpen}
            onClose={() => this.setState({ 
              emailModalOpen: false, 
              emailDraft: null, 
              pendingApplicationId: null,
              currentJobForEmail: null 
            })}
            emailDraft={emailDraft}
            onSend={this.sendApplicationEmail}
            jobTitle={currentJobForEmail.title}
            companyName={currentJobForEmail.company_name || 'Unknown Company'}
          />
        )}
          </>
        )}
      </main>
    );
  }
}