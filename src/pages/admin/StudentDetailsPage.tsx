import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Separator from "../../components/ui/Separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Mail, Phone, GraduationCap, Eye, MapPin, FileText, Github, Star, GitFork, ExternalLink, Award, Briefcase, X } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import adminService from '../../lib/api/adminService';
import { formatDate } from '../../lib/utils';
import PDFViewer from '../../components/pdf/PDFViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import resumeHtmlGenerator from '../../lib/api/resumeHtmlGenerator';

interface GitHubProject {
  name: string;
  url: string;
  description?: string;
  technologies?: string[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  readme?: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  dateReceived?: string;
  expiryDate?: string;
  credentialUrl?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expirationDate?: string;
}

interface Experience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  profilePictureUrl?: string;
  verified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  hasCompletedOnboarding: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  preojtOrientationUrl?: string;
  skills?: string | string[];
  cvs?: any[];
  applications?: any[];
  certifications?: Certification[];
  experiences?: Experience[];
  githubProjects?: GitHubProject[];
  role?: string;
  [key: string]: any; // Allow for additional properties
}

// Resume HTML viewer component
const ResumeHtmlView: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [processedHtml, setProcessedHtml] = React.useState<string>(html);
  const [iframeLoaded, setIframeLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    const processHtml = (content: string) => {
      if (!content || content.trim() === '') {
        return `<!DOCTYPE html><html><head><title>Resume</title></head><body><h1>No Resume Content Available</h1></body></html>`;
      }
      
      const isHtml = content.includes('<!DOCTYPE html>') || content.includes('<html>');
      const isJson = (content.startsWith('{') && content.endsWith('}')) || content.includes('\\"');
      
      if (isHtml) return content;
      
      if (isJson) {
        try {
          let processedContent = content;
          if (processedContent.startsWith('"') && processedContent.endsWith('"')) {
            processedContent = processedContent.substring(1, processedContent.length - 1);
          }
          processedContent = processedContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          const jsonData = JSON.parse(processedContent);
          return resumeHtmlGenerator.generateResumeHtml(jsonData);
        } catch (error) {
          console.error('Error processing JSON:', error);
          return `<!DOCTYPE html><html><head><title>Resume</title></head><body><h1>Error Loading Resume</h1><p>Unable to parse resume data.</p></body></html>`;
        }
      }
      
      return `<!DOCTYPE html><html><head><title>Resume</title></head><body><pre>${content}</pre></body></html>`;
    };
    
    try {
      const processed = processHtml(html);
      setProcessedHtml(processed);
      setIframeLoaded(false);
    } catch (error) {
      console.error('Error processing HTML:', error);
      setProcessedHtml(`<!DOCTYPE html><html><head><title>Resume</title></head><body><h1>Error Loading Resume</h1></body></html>`);
    }
  }, [html]);

  return (
    <div className="relative">
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading resume...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Resume Preview"
        className="w-full h-[1000px] border-0 bg-white rounded"
        sandbox="allow-same-origin allow-scripts"
        srcDoc={processedHtml}
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
};

const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPreOjtViewer, setShowPreOjtViewer] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);
  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!id) {
        setError('Student ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentData = await adminService.getStudentDetails(id);
        setStudent(studentData);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to load student details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  const handleVerifyClick = () => {
    if (!student) return;
    
    // Open a confirmation dialog
    if (confirm(`Are you sure you want to verify ${student.fullName}?`)) {
      verifyStudent();
    }
  };

  const handleUnverifyClick = () => {
    if (!student) return;
    
    // Open a confirmation dialog
    if (confirm(`Are you sure you want to unverify ${student.fullName}?`)) {
      unverifyStudent();
    }
  };

  const verifyStudent = async () => {
    if (!student || !id) return;

    try {
      const notes = prompt('Add verification notes (optional):', student.verificationNotes || '');
      await adminService.verifyStudent(id, notes || '');
      toast({
        title: 'Student Verified',
        description: `${student.fullName} has been verified successfully`,
        variant: 'default',
      });
      setStudent(prev => prev ? { 
        ...prev, 
        verified: true, 
        verifiedAt: new Date().toISOString(), 
        verificationNotes: notes || prev.verificationNotes 
      } : null);
    } catch (err) {
      console.error('Error verifying student:', err);
      toast({
        title: 'Error',
        description: 'Failed to verify student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const unverifyStudent = async () => {
    if (!student || !id) return;

    try {
      const notes = prompt('Add unverification reason (optional):', student.verificationNotes || '');
      await adminService.unverifyStudent(id, notes || '');
      toast({
        title: 'Student Unverified',
        description: `${student.fullName} has been unverified`,
        variant: 'default',
      });
      setStudent(prev => prev ? { 
        ...prev, 
        verified: false, 
        verifiedAt: undefined, 
        verificationNotes: notes || prev.verificationNotes 
      } : null);
    } catch (err) {
      console.error('Error unverifying student:', err);
      toast({
        title: 'Error',
        description: 'Failed to unverify student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error || 'Student not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  // Normalize skills defensively in the UI as well (in case API shape varies)
  const skillsArray: string[] = Array.isArray(student.skills)
    ? student.skills
    : typeof student.skills === 'string'
      ? student.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/admin/students/verification" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Student List
          </Link>
          <h1 className="text-3xl font-bold">{student.fullName}</h1>
        </div>
        <div>
          {student.verified ? (
            <Button
              variant="outline"
              onClick={handleUnverifyClick}
              className="flex items-center gap-1"
            >
              <XCircle className="h-4 w-4" />
              Unverify Student
            </Button>
          ) : (
            <Button
              onClick={handleVerifyClick}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Verify Student
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="h-32 w-32 rounded-full overflow-hidden mb-4 bg-muted flex items-center justify-center">
                  {student.profilePictureUrl ? (
                    <img 
                      src={student.profilePictureUrl} 
                      alt={student.fullName} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-medium">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">{student.fullName}</h2>
                <p className="text-muted-foreground">{student.university || 'No University'}</p>
                
                <div className="mt-2">
                  {student.verified ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">Not Verified</Badge>
                  )}
                </div>
                
                {student.verified && student.verifiedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Verified on {formatDate(student.verifiedAt)}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{student.email}</span>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{student.phoneNumber || (student as any).phone || 'No phone number'}</span>
                </div>
                
                {student.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{student.location}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{student.major || 'No major'} ({student.graduationYear || 'N/A'})</span>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">External Profiles</h3>
                  <div className="flex gap-2">
                    {student.linkedinUrl && (
                      <a 
                        href={student.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                        </svg>
                      </a>
                    )}
                    
                    {student.githubUrl && (
                      <a 
                        href={student.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                      </a>
                    )}
                    
                    {student.portfolioUrl && (
                      <a 
                        href={student.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                          <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                
                {student.verificationNotes && (
                  <div>
                    <h3 className="font-medium mb-2">Verification Notes</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {student.verificationNotes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Tabs with Details */}
        <div className="md:col-span-2">
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0">
                <TabsList className="grid grid-cols-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="projects">
                    Projects ({student.githubProjects?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="applications">
                    Applications ({student.applications?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="experiences">
                    Experience ({student.experiences?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="certifications">
                    Certs ({student.certifications?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    Documents
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="profile">
                  <div className="space-y-6">
                    {student.bio && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Bio</h3>
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{student.bio}</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillsArray.length > 0 ? (
                          skillsArray.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No skills listed</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">CVs / Resumes</h3>
                      {student.cvs && student.cvs.length > 0 ? (
                        <div className="space-y-2">
                          {student.cvs.map((cv, index) => (
                            <div key={cv.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                              <div>
                                <p className="font-medium">Resume {index + 1}</p>
                                <p className="text-xs text-muted-foreground">
                                  Last updated: {formatDate(cv.lastUpdated)}
                                  {cv.active && <Badge className="ml-2" variant="default">Active</Badge>}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedCv(cv);
                                  setShowCvPreview(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Preview CV
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No CVs uploaded</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="projects">
                  {student.githubProjects && student.githubProjects.length > 0 ? (
                    <div className="space-y-6">
                      {student.githubProjects.map((project, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold flex items-center gap-2">
                                <Github className="h-5 w-5" />
                                {project.name}
                              </h4>
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                              >
                                View Repository
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {project.stars || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork className="h-4 w-4" />
                                {project.forks || 0}
                              </span>
                            </div>
                          </div>
                          
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          )}
                          
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.technologies.map((tech, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {project.lastUpdated && (
                            <p className="text-xs text-muted-foreground">
                              Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No GitHub projects found</p>
                  )}
                </TabsContent>
                
                <TabsContent value="applications">
                  {student.applications && student.applications.length > 0 ? (
                    <div className="space-y-4">
                      {student.applications.map(app => (
                        <div key={app.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{app.jobTitle}</h4>
                              <p className="text-sm text-muted-foreground">
                                Applied on {formatDate(app.appliedAt)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                app.status === 'ACCEPTED' ? 'default' :
                                app.status === 'REJECTED' ? 'destructive' :
                                app.status === 'INTERVIEW' ? 'secondary' : 'outline'
                              }
                            >
                              {app.status.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/application/${app.id}`}
                            >
                              View Application
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No job applications</p>
                  )}
                </TabsContent>
                
                <TabsContent value="experiences">
                  {student.experiences && student.experiences.length > 0 ? (
                    <div className="space-y-6">
                      {student.experiences.map((exp, index) => (
                        <div key={exp.id || index} className="border-l-2 border-primary pl-4 relative">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">{exp.title}</h4>
                              <p className="text-sm font-medium">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                              <p className="text-xs text-muted-foreground">
                                {exp.startDate ? formatDate(exp.startDate) : 'N/A'} - {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'N/A'}
                              </p>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No work experience listed</p>
                  )}
                </TabsContent>
                
                <TabsContent value="certifications">
                  {student.certifications && student.certifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {student.certifications.map((cert, index) => (
                        <div key={cert.id || index} className="p-4 border rounded-md">
                          <div className="flex items-start gap-2">
                            <Award className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm">Issued by {cert.issuer || cert.issuingOrganization}</p>
                              <p className="text-xs text-muted-foreground">
                                {cert.dateReceived && `Issued: ${formatDate(cert.dateReceived)}`}
                                {cert.issueDate && !cert.dateReceived && `Issued: ${formatDate(cert.issueDate)}`}
                                {cert.expiryDate && ` • Expires: ${formatDate(cert.expiryDate)}`}
                                {cert.expirationDate && !cert.expiryDate && ` • Expires: ${formatDate(cert.expirationDate)}`}
                              </p>
                              {cert.credentialUrl && (
                                <a 
                                  href={cert.credentialUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                >
                                  View Credential
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No certifications listed</p>
                  )}
                </TabsContent>
                
                <TabsContent value="documents">
                  <div className="space-y-6">
                    {/* PreOJT Orientation Document */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">PreOJT Orientation Certificate</h3>
                      {student.preojtOrientationUrl ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                <p className="font-medium">PreOJT Orientation Certificate</p>
                                <p className="text-xs text-muted-foreground">PDF Document</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreOjtViewer(!showPreOjtViewer)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {showPreOjtViewer ? 'Hide Document' : 'View Document'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(student.preojtOrientationUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open in New Tab
                              </Button>
                            </div>
                          </div>
                          
                          {showPreOjtViewer && (
                            <div className="mt-4">
                              <PDFViewer 
                                fileUrl={student.preojtOrientationUrl}
                                onClose={() => setShowPreOjtViewer(false)}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No PreOJT orientation certificate uploaded</p>
                      )}
                    </div>
                    
                    <Separator />
                    
                   
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* CV Preview Modal */}
      <Dialog open={showCvPreview} onOpenChange={setShowCvPreview}>
        <DialogContent className="w-[95vw] max-w-[1600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>CV Preview</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCvPreview(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto">
            {selectedCv && selectedCv.htmlContent ? (
              <ResumeHtmlView html={selectedCv.htmlContent} />
            ) : selectedCv && selectedCv.parsedResume ? (
              <ResumeHtmlView html={JSON.stringify(selectedCv.parsedResume)} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No resume content available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailsPage;
