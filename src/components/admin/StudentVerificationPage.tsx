import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Textarea } from "../../components/ui/Textarea";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, XCircle, ExternalLink, Github, Linkedin, Loader2 } from "lucide-react";
import adminService from '../../lib/api/adminService';
import { useToast } from "../../components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string; // API uses phoneNumber instead of phone
  phone?: string; // Keep for backward compatibility
  university: string;
  major: string;
  graduationYear: number;
  profilePictureUrl?: string;
  verified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  hasCompletedOnboarding: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  cvCount?: number;
  applicationCount?: number;
  certificationCount?: number;
  experienceCount?: number;
  // Additional fields from API response
  createdAt?: string;
  updatedAt?: string;
  location?: string;
  role?: string;
  skills?: string;
  certifications?: any[];
  experiences?: any[];
  githubProjects?: string;
  onboardingCompleted?: boolean;
  active?: boolean;
}

const StudentVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('unverified');
  const [unverifiedStudents, setUnverifiedStudents] = useState<Student[]>([]);
  const [verifiedStudents, setVerifiedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'unverify'>('verify');
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const unverified = await adminService.getStudentsForVerification(false);
      const verified = await adminService.getStudentsForVerification(true);
      
      // Ensure we always have arrays, even if API returns unexpected data
      setUnverifiedStudents(Array.isArray(unverified) ? unverified : []);
      setVerifiedStudents(Array.isArray(verified) ? verified : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
      // Set empty arrays on error to prevent map errors
      setUnverifiedStudents([]);
      setVerifiedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleVerifyClick = (student: Student) => {
    setSelectedStudent(student);
    setActionType('verify');
    setNotes('');
    setDialogOpen(true);
  };

  const handleUnverifyClick = (student: Student) => {
    setSelectedStudent(student);
    setActionType('unverify');
    setNotes('');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleVerificationAction = async () => {
    if (!selectedStudent) return;

    try {
      if (actionType === 'verify') {
        await adminService.verifyStudent(selectedStudent.id, notes);
        toast({
          title: 'Student Verified',
          description: `${selectedStudent.fullName} has been verified successfully`,
          variant: 'default',
        });
      } else {
        await adminService.unverifyStudent(selectedStudent.id, notes);
        toast({
          title: 'Student Unverified',
          description: `${selectedStudent.fullName} has been unverified`,
          variant: 'default',
        });
      }
      
      handleDialogClose();
      fetchStudents(); // Refresh the lists
    } catch (err) {
      console.error(`Error ${actionType === 'verify' ? 'verifying' : 'unverifying'} student:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${actionType} student. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const renderStudentTable = (students: Student[]) => {
    // Safety check: ensure students is an array
    const safeStudents = Array.isArray(students) ? students : [];
    
    return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>University</TableHead>
            <TableHead>Major</TableHead>
            <TableHead>Grad. Year</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeStudents.length === 0 ? (
            <TableRow>
              <TableCell className="text-center" style={{textAlign: 'center'}} {...{colSpan: 6}}>
                <p className="text-muted-foreground">
                  No students found
                </p>
              </TableCell>
            </TableRow>
          ) : (
            safeStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                      {student.profilePictureUrl ? (
                        <img 
                          src={student.profilePictureUrl} 
                          alt={student.fullName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">{student.email || 'No email'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.university || 'N/A'}</TableCell>
                <TableCell>{student.major || 'N/A'}</TableCell>
                <TableCell>{student.graduationYear || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {student.linkedinUrl && (
                      <a 
                        href={student.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {student.githubUrl && (
                      <a 
                        href={student.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {student.portfolioUrl && (
                      <a 
                        href={student.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Badge variant={(student.cvCount || 0) > 0 ? "default" : "outline"} className="text-xs">
                      {student.cvCount || 0} CVs
                    </Badge>
                    <Badge variant={(student.experienceCount || 0) > 0 ? "default" : "outline"} className="text-xs">
                      {student.experienceCount || 0} Exp
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    {/* {student.verified ? (
                      <Button
                        variant="outline"
                        onClick={() => handleUnverifyClick(student)}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleVerifyClick(student)}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                    )} */}
                    <Button
                      variant="secondary"
                      className="flex items-center gap-1"
                      onClick={() => window.location.href = `/admin/students/${student.id}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Student Verification</h1>
        <p className="text-muted-foreground">
          Verify student profiles to allow them to apply for jobs and view job matches.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive">
          {error}
        </div>
      )}

      <Card>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unverified">
                Pending Verification ({unverifiedStudents.length})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified Students ({verifiedStudents.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="unverified">
                  {renderStudentTable(unverifiedStudents)}
                </TabsContent>
                <TabsContent value="verified">
                  {renderStudentTable(verifiedStudents)}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'verify' ? 'Verify Student' : 'Unverify Student'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <>
              <p className="text-base">
                {actionType === 'verify'
                  ? `Are you sure you want to verify ${selectedStudent.fullName}?`
                  : `Are you sure you want to unverify ${selectedStudent.fullName}?`}
              </p>
              <p className="text-sm text-muted-foreground">
                {actionType === 'verify'
                  ? 'This will allow the student to apply for jobs and view job matches.'
                  : 'This will prevent the student from applying for jobs and viewing job matches.'}
              </p>
              <Textarea
                placeholder="Add verification notes (optional)"
                className="mt-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={handleVerificationAction} 
              variant={actionType === 'verify' ? 'default' : 'destructive'}
            >
              {actionType === 'verify' ? 'Verify' : 'Unverify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentVerificationPage;
