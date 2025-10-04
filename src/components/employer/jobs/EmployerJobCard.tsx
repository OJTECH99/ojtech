import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Job } from "../../../lib/types/employer";
import { cn } from "../../../lib/utils";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/DropdownMenu";
import { Briefcase, MapPin, MoreVertical, Eye, Edit, Trash2, Users, Clock, ExternalLink, AlertCircle, CheckCircle2, XCircle, Building } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface EmployerJobCardProps {
  job: Job;
  onViewApplications: (jobId: string) => void;
  onEditJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  isDeleting: boolean;
}

export class EmployerJobCard extends Component<EmployerJobCardProps> {
  getStatusBadge = (status: string) => {
    let badgeVariant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | null
      | undefined = "secondary";
    let textColor = "text-foreground";
    let icon = null;

    switch (status) {
      case "active":
        badgeVariant = "default";
        textColor = "text-primary-foreground";
        icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
        status = "Active";
        break;
      case "draft":
        badgeVariant = "secondary";
        textColor = "text-muted-foreground";
        icon = <AlertCircle className="mr-1 h-3 w-3" />;
        status = "Draft";
        break;
      case "expired":
        badgeVariant = "destructive";
        icon = <XCircle className="mr-1 h-3 w-3" />;
        status = "Expired";
        break;
      case "closed":
        badgeVariant = "outline";
        textColor = "text-muted-foreground";
        status = "Closed";
        break;
    }

    return (
      <Badge variant={badgeVariant} className={cn("capitalize", textColor)}>
        {icon}
        {status}
      </Badge>
    );
  };

  render() {
    const { job, onViewApplications, onEditJob, onDeleteJob, isDeleting } = this.props;
    const createdDate = new Date(job.created_at);
    const formattedDate = formatDistanceToNow(createdDate, { addSuffix: true });

    return (
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-md bg-muted/50 flex items-center justify-center">
                {job.company_logo ? (
                  <img 
                    src={job.company_logo} 
                    alt={job.company} 
                    className="h-10 w-10 object-contain" 
                  />
                ) : (
                  <Building className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <Link to={`/employer/jobs/${job.id}`} className="text-lg font-medium hover:text-primary transition-colors">
                  {job.title}
                </Link>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {this.getStatusBadge(job.status)}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewApplications(job.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Applications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditJob(job.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Job
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteJob(job.id)}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="mr-2 h-4 w-4" />
                {job.job_type}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Posted {formattedDate}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <div className="flex items-center text-sm text-muted-foreground mr-2">
                <Users className="mr-1 h-4 w-4" />
                {job.applications_count || 0} Applications
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewApplications(job.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Applications
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => onEditJob(job.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
