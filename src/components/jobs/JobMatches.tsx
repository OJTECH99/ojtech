import React, { Component, createRef } from 'react';
import { Button } from "../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/Card";
import { toast } from "../ui/toast-utils";
import { Loader2, BriefcaseIcon, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";

interface JobMatch {
  id: string;
  job_id: string;
  student_id: string;
  match_score: number;
  status: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    required_skills: string[];
  };
}

interface JobMatchesProps {
  userId: string;
  initialMatches?: JobMatch[];
}

interface JobMatchesState {
  matches: JobMatch[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export class JobMatches extends Component<JobMatchesProps, JobMatchesState> {
  private timeoutRef: ReturnType<typeof setTimeout> | null = null;

  constructor(props: JobMatchesProps) {
    super(props);
    this.state = {
      matches: props.initialMatches || [],
      loading: !props.initialMatches,
      refreshing: false,
      error: null
    };
  }

  componentDidMount() {
    // Load matches on initial render if not provided
    if (!this.props.initialMatches && !this.state.loading && !this.state.error) {
      this.loadJobMatches();
    }
    
    // Add a loading timeout to prevent infinite loading
    if (this.state.loading && !this.state.refreshing) {
      // Clear any existing timeout
      if (this.timeoutRef) {
        clearTimeout(this.timeoutRef);
      }
      
      this.timeoutRef = setTimeout(() => {
        this.setState({
          loading: false,
          error: "Loading job matches timed out. The service might be experiencing high demand."
        });
        
        toast({
          title: "Timeout",
          description: "Loading job matches is taking too long. Please try again later.",
          variant: "destructive",
        });
      }, 15000); // 15 second timeout
    }
  }

  componentWillUnmount() {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
  }

  // Load job matches
  loadJobMatches = async (forceRefresh = false) => {
    try {
      this.setState({
        refreshing: forceRefresh,
        loading: !forceRefresh,
        error: null
      });

      // Add a controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/job-matches?userId=${this.props.userId}`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": forceRefresh ? "no-cache" : "default"
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to load job matches");
      }

      this.setState({ matches: data.data || [] });
      
      if (forceRefresh) {
        toast({
          title: "Matches updated",
          description: `Found ${data.data?.length || 0} job matches.`,
        });
      }
    } catch (error) {
      console.error("Error loading job matches:", error);
      
      // Handle specific error types
      let errorMessage = "Failed to load job matches";
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out. The service might be experiencing high demand.";
        } else {
          errorMessage = error.message;
        }
      }
      
      this.setState({ error: errorMessage });
      
      if (!forceRefresh) {
        toast({
          title: "Error loading matches",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      if (this.timeoutRef) {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = null;
      }
      
      this.setState({
        loading: false,
        refreshing: false
      });
    }
  };

  // Handle refresh button click
  handleRefresh = () => {
    this.loadJobMatches(true);
  };
  
  // Get match score color based on the score
  getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };
  
  // Get match badge color based on the score
  getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-50 text-green-600 border-green-200";
    if (score >= 60) return "bg-blue-50 text-blue-600 border-blue-200";
    if (score >= 40) return "bg-amber-50 text-amber-600 border-amber-200";
    return "bg-red-50 text-red-600 border-red-200";
  };

  render() {
    const { matches, loading, error, refreshing } = this.state;

    if (loading) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>
              AI-powered job matches based on your resume
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your job matches...</p>
          </CardContent>
        </Card>
      );
    }
    
    if (error) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>
              There was an error loading your job matches
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => this.loadJobMatches(true)} disabled={loading || refreshing}>
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Trying Again...</span>
                </>
              ) : (
                <span>Try Again</span>
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!matches || matches.length === 0) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>
              No job matches found for your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We couldn't find any job matches for your profile. This could be because:
            </p>
            <ul className="list-disc pl-5 mb-4 text-muted-foreground space-y-1">
              <li>You haven't uploaded a resume yet</li>
              <li>Your resume doesn't contain enough information</li>
              <li>There are no active jobs matching your skills</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Try uploading a detailed resume or checking back later for new opportunities.
            </p>
            <Button 
              onClick={() => this.loadJobMatches(true)} 
              disabled={refreshing}
              className="mt-2"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Check Again</span>
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>
              AI-powered job matches based on your resume
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRefresh}
            disabled={refreshing}
            className="h-8 px-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </Button>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/opportunities/${match.job_id}`}>
                      <h3 className="font-medium hover:underline">{match.job.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {match.job.company} • {match.job.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold ${this.getScoreColor(match.match_score)}`}>
                      {match.match_score}%
                    </span>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                </div>
                
                {match.job.required_skills && match.job.required_skills.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {match.job.required_skills.slice(0, 5).map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-50">
                          {skill}
                        </Badge>
                      ))}
                      {match.job.required_skills.length > 5 && (
                        <Badge variant="outline" className="bg-gray-50">
                          +{match.job.required_skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link to={`/opportunities/${match.job_id}`}>
                    <Button size="sm">View Job</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
}
