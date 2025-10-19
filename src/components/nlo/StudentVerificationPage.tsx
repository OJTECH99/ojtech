import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Textarea } from "../ui/Textarea";
import { Badge } from "../ui/badge";
import { Input } from "../ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Checkbox } from "../ui/Checkbox";
import { CheckCircle, XCircle, ExternalLink, Github, Linkedin, Loader2, Search, Filter, Users, TrendingUp } from "lucide-react";
import nloService, { Student, VerificationStats } from '../../lib/api/nloService';
import { useToast } from "../ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";

const NLOStudentVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('unverified');
  const [unverifiedStudents, setUnverifiedStudents] = useState<Student[]>([]);
  const [verifiedStudents, setVerifiedStudents] = useState<Student[]>([]);
  const [filteredUnverified, setFilteredUnverified] = useState<Student[]>([]);
  const [filteredVerified, setFilteredVerified] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'unverify'>('verify');
  const [searchTerm, setSearchTerm] = useState('');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [graduationYearFilter, setGraduationYearFilter] = useState('all');
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unverified, verified, verificationStats] = await Promise.all([
        nloService.getStudentsForVerification(false),
        nloService.getStudentsForVerification(true),
        nloService.getVerificationStats()
      ]);
      
      setUnverifiedStudents(Array.isArray(unverified) ? unverified : []);
      setVerifiedStudents(Array.isArray(verified) ? verified : []);
      setFilteredUnverified(Array.isArray(unverified) ? unverified : []);
      setFilteredVerified(Array.isArray(verified) ? verified : []);
      setStats(verificationStats);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
      setUnverifiedStudents([]);
      setVerifiedStudents([]);
      setFilteredUnverified([]);
      setFilteredVerified([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search and filter criteria
  useEffect(() => {
    const filterStudents = (students: Student[]) => {
      return students.filter(student => {
        const matchesSearch = !searchTerm || 
          student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.major?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesUniversity = universityFilter === 'all' || 
          student.university?.toLowerCase().includes(universityFilter.toLowerCase());
        
        const matchesMajor = majorFilter === 'all' || 
          student.major?.toLowerCase().includes(majorFilter.toLowerCase());
        
        const matchesGradYear = graduationYearFilter === 'all' || 
          student.graduationYear?.toString() === graduationYearFilter;
        
        return matchesSearch && matchesUniversity && matchesMajor && matchesGradYear;
      });
    };

    setFilteredUnverified(filterStudents(unverifiedStudents));
    setFilteredVerified(filterStudents(verifiedStudents));
  }, [searchTerm, universityFilter, majorFilter, graduationYearFilter, unverifiedStudents, verifiedStudents]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedStudents(new Set());
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

  const handleBatchAction = (action: 'verify' | 'unverify') => {
    if (selectedStudents.size === 0) {
      toast({
        title: 'No Students Selected',
        description: 'Please select at least one student for batch action.',
        variant: 'destructive',
      });
      return;
    }
    setActionType(action);
    setNotes('');
    setBatchDialogOpen(true);
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = (students: Student[], checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    students.forEach(student => {
      if (checked) {
        newSelected.add(student.id);
      } else {
        newSelected.delete(student.id);
      }
    });
    setSelectedStudents(newSelected);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setBatchDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleVerificationAction = async () => {
    if (!selectedStudent) return;

    try {
      if (actionType === 'verify') {
        await nloService.verifyStudent(selectedStudent.id, notes);
        toast({
          title: 'Student Verified',
          description: `${selectedStudent.fullName} has been verified successfully by NLO`,
          variant: 'default',
        });
      } else {
        await nloService.unverifyStudent(selectedStudent.id, notes);
        toast({
          title: 'Student Unverified',
          description: `${selectedStudent.fullName} has been unverified by NLO`,
          variant: 'default',
        });
      }
      
      handleDialogClose();
      fetchStudents();
    } catch (err) {
      console.error(`Error ${actionType === 'verify' ? 'verifying' : 'unverifying'} student:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${actionType} student. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleBatchVerificationAction = async () => {
    const studentIds = Array.from(selectedStudents);
    
    try {
      if (actionType === 'verify') {
        await nloService.batchVerifyStudents(studentIds, notes);
        toast({
          title: 'Students Verified',
          description: `${studentIds.length} students have been verified successfully by NLO`,
          variant: 'default',
        });
      } else {
        await nloService.batchUnverifyStudents(studentIds, notes);
        toast({
          title: 'Students Unverified',
          description: `${studentIds.length} students have been unverified by NLO`,
          variant: 'default',
        });
      }
      
      setSelectedStudents(new Set());
      handleDialogClose();
      fetchStudents();
    } catch (err) {
      console.error(`Error batch ${actionType === 'verify' ? 'verifying' : 'unverifying'} students:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${actionType} students. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUniversityFilter('all');
    setMajorFilter('all');
    setGraduationYearFilter('all');
  };

  const getUniqueValues = (students: Student[], field: keyof Student) => {
    const values = students.map(s => s[field]).filter(Boolean) as string[];
    return [...new Set(values)].sort();
  };

  const renderStudentTable = (students: Student[]) => {
    const safeStudents = Array.isArray(students) ? students : [];
    const currentStudents = activeTab === 'unverified' ? filteredUnverified : filteredVerified;
    const allSelected = currentStudents.length > 0 && currentStudents.every(s => selectedStudents.has(s.id));
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(currentStudents, checked as boolean)}
                  aria-label="Select all students"
                />
              </TableHead>
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
                <TableCell className="text-center" style={{textAlign: 'center'}} {...{colSpan: 7}}>
                  <p className="text-muted-foreground">
                    No students found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              safeStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                      aria-label={`Select ${student.fullName}`}
                    />
                  </TableCell>
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
                        onClick={() => window.location.href = `/nlo/students/${student.id}`}
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
        <h1 className="text-2xl font-bold tracking-tight">NLO Student Verification</h1>
        <p className="text-muted-foreground">
          Verify student profiles to enable job applications and opportunities matching.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{stats.verifiedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.unverifiedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verification Rate</p>
                  <p className="text-2xl font-bold">{stats.verificationRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Search & Filter</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={universityFilter} onValueChange={setUniversityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {getUniqueValues([...unverifiedStudents, ...verifiedStudents], 'university').map(university => (
                  <SelectItem key={university} value={university}>{university}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Major" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Majors</SelectItem>
                {getUniqueValues([...unverifiedStudents, ...verifiedStudents], 'major').map(major => (
                  <SelectItem key={major} value={major}>{major}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={graduationYearFilter} onValueChange={setGraduationYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Grad Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getUniqueValues([...unverifiedStudents, ...verifiedStudents], 'graduationYear').map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive">
          {error}
        </div>
      )}

      <Card>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="unverified">
                  Pending Verification ({filteredUnverified.length})
                </TabsTrigger>
                <TabsTrigger value="verified">
                  Verified Students ({filteredVerified.length})
                </TabsTrigger>
              </TabsList>
              
              {/* Batch Action Buttons */}
              {selectedStudents.size > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBatchAction('verify')}
                    className="flex items-center gap-1"
                    disabled={activeTab === 'verified'}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Verify Selected ({selectedStudents.size})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleBatchAction('unverify')}
                    className="flex items-center gap-1"
                    disabled={activeTab === 'unverified'}
                  >
                    <XCircle className="h-4 w-4" />
                    Unverify Selected ({selectedStudents.size})
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="unverified">
                  {renderStudentTable(filteredUnverified)}
                </TabsContent>
                <TabsContent value="verified">
                  {renderStudentTable(filteredVerified)}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>

      {/* Single Student Verification Dialog */}
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

      {/* Batch Verification Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'verify' ? 'Batch Verify Students' : 'Batch Unverify Students'}
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-base">
            {actionType === 'verify'
              ? `Are you sure you want to verify ${selectedStudents.size} students?`
              : `Are you sure you want to unverify ${selectedStudents.size} students?`}
          </p>
          <p className="text-sm text-muted-foreground">
            {actionType === 'verify'
              ? 'This will allow all selected students to apply for jobs and view job matches.'
              : 'This will prevent all selected students from applying for jobs and viewing job matches.'}
          </p>
          <Textarea
            placeholder="Add verification notes for all selected students (optional)"
            className="mt-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={handleBatchVerificationAction} 
              variant={actionType === 'verify' ? 'default' : 'destructive'}
            >
              {actionType === 'verify' ? `Verify ${selectedStudents.size} Students` : `Unverify ${selectedStudents.size} Students`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NLOStudentVerificationPage;
