import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { 
  User, Briefcase, Award, Github, Linkedin, Globe, 
  Mail, Phone, MapPin, School, CheckCircle, XCircle, Code
} from 'lucide-react';
import StudentCvFormatter from './StudentCvFormatter';

interface StudentProfileFormatterProps {
  studentProfile: any;
}

/**
 * StudentProfileFormatter component for displaying student profile details
 * This component is used on the admin side to view and manage student profiles
 */
const StudentProfileFormatter: React.FC<StudentProfileFormatterProps> = ({ 
  studentProfile
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!studentProfile) {
    return <div>No student profile data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with basic info */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {studentProfile.profilePictureUrl ? (
              <img 
                src={studentProfile.profilePictureUrl} 
                alt={`${studentProfile.firstName} ${studentProfile.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{studentProfile.fullName}</h2>
                <p className="text-gray-600">{studentProfile.university} • {studentProfile.major}</p>
                <p className="text-sm text-gray-500">Graduation Year: {studentProfile.graduationYear}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={studentProfile.verified ? "default" : "outline"} className={studentProfile.verified ? "bg-green-500" : ""}>
                  {studentProfile.verified ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Unverified</>
                  )}
                </Badge>
                
                <Badge variant={studentProfile.hasCompletedOnboarding ? "default" : "secondary"}>
                  {studentProfile.hasCompletedOnboarding ? "Onboarded" : "Incomplete Profile"}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {studentProfile.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{studentProfile.email}</span>
                </div>
              )}
              
              {studentProfile.phoneNumber && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{studentProfile.phoneNumber}</span>
                </div>
              )}
              
              {studentProfile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{studentProfile.location}</span>
                </div>
              )}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {studentProfile.githubUrl && (
                <a 
                  href={studentProfile.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              
              {studentProfile.linkedinUrl && (
                <a 
                  href={studentProfile.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              
              {studentProfile.portfolioUrl && (
                <a 
                  href={studentProfile.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">GitHub Projects</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            <div className="flex items-start gap-3">
              <School className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="font-medium">{studentProfile.major}</p>
                <p>{studentProfile.university}</p>
                <p className="text-sm text-gray-600">Graduation Year: {studentProfile.graduationYear}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {studentProfile.skills && studentProfile.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
              {(!studentProfile.skills || studentProfile.skills.length === 0) && (
                <p className="text-gray-500 italic">No skills listed</p>
              )}
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Certifications</h3>
            {studentProfile.certifications && studentProfile.certifications.length > 0 ? (
              <div className="space-y-4">
                {studentProfile.certifications.map((cert: any) => (
                  <div key={cert.id} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm">Issued by {cert.issuer}</p>
                      {cert.dateReceived && (
                        <p className="text-sm text-gray-600">
                          Received: {new Date(cert.dateReceived).toLocaleDateString()}
                          {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No certifications listed</p>
            )}
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Application Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{studentProfile.applicationCount || 0}</p>
                <p className="text-sm text-gray-600">Job Applications</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{studentProfile.cvCount || 0}</p>
                <p className="text-sm text-gray-600">CVs</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{studentProfile.certificationCount || 0}</p>
                <p className="text-sm text-gray-600">Certifications</p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
            {studentProfile.experiences && studentProfile.experiences.length > 0 ? (
              <div className="space-y-6">
                {studentProfile.experiences.map((exp: any) => (
                  <div key={exp.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium">{exp.title}</p>
                        <p>{exp.company} {exp.location && `• ${exp.location}`}</p>
                        <p className="text-sm text-gray-600">
                          {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - 
                          {exp.current ? ' Present' : exp.endDate && ` ${new Date(exp.endDate).toLocaleDateString()}`}
                        </p>
                        <p className="mt-2">{exp.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No work experience listed</p>
            )}
          </Card>
        </TabsContent>
        
        {/* GitHub Projects Tab */}
        <TabsContent value="projects">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">GitHub Projects</h3>
            {studentProfile.githubProjects && studentProfile.githubProjects.length > 0 ? (
              <div className="space-y-6">
                {studentProfile.githubProjects.map((project: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-lg">{project.name}</h4>
                      <div className="text-sm text-gray-500">
                        <span className="mr-3">⭐ {project.stars}</span>
                        <span>🍴 {project.forks}</span>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-700">{project.description}</p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.technologies.map((tech: string, i: number) => (
                          <Badge key={i} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Github className="w-4 h-4" />
                        View Repository
                      </a>
                      
                      {project.lastUpdated && (
                        <span className="text-xs text-gray-500">
                          Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No GitHub projects found</p>
            )}
          </Card>
        </TabsContent>
        
        {/* Resume Tab */}
        <TabsContent value="resume">
          {studentProfile.cvs && studentProfile.cvs.length > 0 ? (
            <div className="space-y-6">
              {studentProfile.cvs.map((cv: any, index: number) => (
                <Card key={cv.id} className="overflow-hidden">
                  <div className="bg-gray-100 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">
                        Resume {index + 1}
                        {cv.active && <Badge className="ml-2" variant="default">Active</Badge>}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(cv.lastUpdated).toLocaleString()}
                        {cv.template && ` • Template: ${cv.template}`}
                      </p>
                    </div>
                  </div>
                  
                  {cv.htmlContent ? (
                    <StudentCvFormatter 
                      cvHtml={cv.htmlContent} 
                      studentProfile={studentProfile} 
                    />
                  ) : cv.parsedResume ? (
                    <div className="p-4">
                      <p className="mb-2">This CV has JSON data but no HTML content.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(cv.parsedResume, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${studentProfile.firstName}_${studentProfile.lastName}_CV_data.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Code className="h-4 w-4" />
                        Download JSON Data
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 italic">This CV has no content</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-500 italic">No resumes available</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfileFormatter;
