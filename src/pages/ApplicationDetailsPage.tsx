import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { JobApplication } from '@/lib/types/application';
import jobApplicationService from '@/lib/api/jobApplicationService';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Briefcase, GraduationCap, Tag, FileText, MapPin, DollarSign, Building, Clock, User } from 'lucide-react';

const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await jobApplicationService.getApplicationDetails(id);
        setApplication(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError('Failed to load application details. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'REVIEWED':
        return 'bg-blue-500';
      case 'INTERVIEW':
        return 'bg-purple-500';
      case 'ACCEPTED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/track">Back to Applications</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The application you're looking for doesn't exist or you don't have permission to view it.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/track">Back to Applications</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/track" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Applications
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mb-2">Application Details</h1>
        <p className="text-muted-foreground">View the details of your job application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{application.jobTitle}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Building size={14} />
                    {application.employerCompanyName}
                  </CardDescription>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Calendar size={14} />
                    Applied on {formatDate(application.appliedAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {application.matchScore > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16">
                        {/* Background circle */}
                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                        {/* Progress circle with stroke-dasharray trick */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            strokeWidth="4" 
                            stroke={
                              application.matchScore < 30 ? "#ef4444" :  // red
                              application.matchScore < 60 ? "#f59e0b" :  // yellow
                              "#10b981"  // green
                            } 
                            fill="transparent"
                            strokeDasharray={`${application.matchScore * 1.76} 176`} 
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`font-bold text-sm ${
                            application.matchScore < 30 ? "text-red-500" :
                            application.matchScore < 60 ? "text-amber-500" :
                            "text-green-500"
                          }`}>
                            {application.matchScore.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">Match</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{application.jobDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h3 className="font-medium mb-2">Job Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span>{application.jobLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-muted-foreground" />
                      <span>{application.jobEmploymentType}</span>
                    </div>
                    {application.jobMinSalary && application.jobMaxSalary && (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-muted-foreground" />
                        <span>{formatSalary(application.jobMinSalary, application.jobMaxSalary, application.jobCurrency || 'USD')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>Posted on {formatDate(application.jobPostedAt || '')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {application.jobRequiredSkills?.split(',').map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Your Cover Letter</h3>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="whitespace-pre-line">{application.coverLetter}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
             
              
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={`${getStatusColor(application.status)} text-white`}>
                    {application.status}
                  </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="font-medium">{formatDate(application.appliedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(application.lastUpdatedAt)}</p>
              </div>
              
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{application.employerCompanyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{application.employerName}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span>{application.studentFullName}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Education & Skills</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-muted-foreground" />
                    <span>{application.studentMajor}, {application.studentUniversity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>Class of {application.studentGraduationYear}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag size={16} className="text-muted-foreground mt-1" />
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {application.studentSkills.split(',').map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-muted-foreground" />
                    <span>CV Attached</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage; 