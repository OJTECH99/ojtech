import { Component } from 'react';
import { Briefcase, Calendar, Building } from "lucide-react";

interface ApplicationCardProps {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  lastUpdated: string;
  onViewDetails: () => void;
}

interface ApplicationCardState {
  isExpanded: boolean;
}

export class ApplicationCard extends Component<ApplicationCardProps, ApplicationCardState> {
  constructor(props: ApplicationCardProps) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }

  toggleExpand = () => {
    this.setState(prevState => ({
      isExpanded: !prevState.isExpanded
    }));
  };

  getStatusColor = () => {
    const { status } = this.props;
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-gray-200 text-gray-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  render() {
    const { 
      jobTitle, 
      companyName, 
      companyLogo, 
      appliedDate, 
      status, 
      lastUpdated, 
      onViewDetails 
    } = this.props;
    
    
    return (
      <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={companyName} 
                  className="w-10 h-10 rounded-full object-contain bg-background"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-lg text-card-foreground">{jobTitle}</h3>
                <p className="text-sm text-muted-foreground">{companyName}</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${this.getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Applied: {appliedDate}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" />
              Updated: {lastUpdated}
            </div>
          </div>
          
          <div className="mt-4">
            <button 
              className="text-primary text-sm font-medium hover:underline"
              onClick={onViewDetails}
            >
              View Job Details
            </button>
          </div>
        </div>
      </div>
    );
  }
}
