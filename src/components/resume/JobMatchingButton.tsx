import React, { Component } from 'react';
import { Button } from "../ui/Button";
import { toast } from "../ui/toast-utils";
import { Loader2, RefreshCw, Check } from "lucide-react";

interface JobMatchingButtonProps {
  cvId: string;
}

interface JobMatchingButtonState {
  loading: boolean;
  upToDate: boolean;
}

export class JobMatchingButton extends Component<JobMatchingButtonProps, JobMatchingButtonState> {
  constructor(props: JobMatchingButtonProps) {
    super(props);
    this.state = {
      loading: false,
      upToDate: false
    };
  }

  handleMatchJobs = async () => {
    try {
      this.setState({ 
        loading: true,
        upToDate: false
      });
      
      // Add force refresh header if user is explicitly requesting an update
      const forceRefresh = !this.state.loading;
      
      const response = await fetch("/api/job-matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(forceRefresh ? { "x-force-refresh": "true" } : {})
        },
        body: JSON.stringify({ cvId: this.props.cvId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to match jobs");
      }

      if (data.success) {
        // Check if matching was skipped because CV is up-to-date
        if (data.data?.upToDate) {
          this.setState({ upToDate: true });
          
          toast({
            title: "Already up-to-date",
            description: "Your job matches are already up-to-date with your current resume.",
          });
          return;
        }
        
        const totalMatches = 
          (data.data?.matchesCreated || 0) + 
          (data.data?.matchesUpdated || 0);
          
        toast({
          title: "Job matching complete",
          description: `Found ${totalMatches} potential job matches.`,
        });
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error matching jobs:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to match jobs",
        variant: "destructive",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, upToDate } = this.state;
    
    return (
    <Button 
        onClick={this.handleMatchJobs} 
      disabled={loading}
      variant={upToDate ? "outline" : "default"}
      className="flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Finding Matches...</span>
        </>
      ) : upToDate ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>Matches Up-to-date</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Find Job Matches</span>
        </>
      )}
    </Button>
  );
  }
}
