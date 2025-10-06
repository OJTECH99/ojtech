import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, TrendingUp, Clock, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const SectionDetailsPage = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();

  const sectionData = {
    '1': {
      name: 'Grade 1 - Section A',
      students: [
        { id: '1', name: 'Juan Dela Cruz', score: 850, lessonsCompleted: 8, lastActive: '2 hours ago', status: 'active' },
        { id: '2', name: 'Maria Santos', score: 920, lessonsCompleted: 10, lastActive: '1 hour ago', status: 'active' },
        { id: '3', name: 'Pedro Garcia', score: 780, lessonsCompleted: 7, lastActive: '5 hours ago', status: 'active' },
        { id: '4', name: 'Ana Lopez', score: 890, lessonsCompleted: 9, lastActive: '3 hours ago', status: 'active' },
        { id: '5', name: 'Carlos Reyes', score: 650, lessonsCompleted: 5, lastActive: '1 day ago', status: 'inactive' },
      ],
    },
    '2': {
      name: 'Grade 1 - Section B',
      students: [
        { id: '6', name: 'Sofia Cruz', score: 950, lessonsCompleted: 11, lastActive: '30 mins ago', status: 'active' },
        { id: '7', name: 'Miguel Ramos', score: 820, lessonsCompleted: 8, lastActive: '2 hours ago', status: 'active' },
        { id: '8', name: 'Isabella Garcia', score: 880, lessonsCompleted: 9, lastActive: '1 hour ago', status: 'active' },
        { id: '9', name: 'Diego Santos', score: 760, lessonsCompleted: 7, lastActive: '4 hours ago', status: 'active' },
        { id: '10', name: 'Camila Lopez', score: 900, lessonsCompleted: 10, lastActive: '2 hours ago', status: 'active' },
      ],
    },
    '3': {
      name: 'Grade 2 - Section A',
      students: [
        { id: '11', name: 'Luis Martinez', score: 870, lessonsCompleted: 9, lastActive: '3 hours ago', status: 'active' },
        { id: '12', name: 'Emma Torres', score: 940, lessonsCompleted: 11, lastActive: '1 hour ago', status: 'active' },
        { id: '13', name: 'Rafael Diaz', score: 720, lessonsCompleted: 6, lastActive: '6 hours ago', status: 'active' },
        { id: '14', name: 'Valentina Reyes', score: 860, lessonsCompleted: 8, lastActive: '2 hours ago', status: 'active' },
        { id: '15', name: 'Mateo Cruz', score: 790, lessonsCompleted: 7, lastActive: '5 hours ago', status: 'active' },
      ],
    },
  };

  const section = sectionData[sectionId as keyof typeof sectionData];

  if (!section) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Section not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageScore = Math.round(
    section.students.reduce((sum, s) => sum + s.score, 0) / section.students.length
  );
  const activeStudents = section.students.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-primary">{section.name}</h1>
          <p className="text-muted-foreground">Detailed student performance and activity</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Section Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{section.students.length}</div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-success mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeStudents}</div>
                <div className="text-xs text-muted-foreground">Active Students</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-warm mr-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{averageScore}</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-accent mr-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    section.students.reduce((sum, s) => sum + s.lessonsCompleted, 0) /
                      section.students.length
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Avg Lessons</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Lessons Completed</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-warning" />
                        <span className="font-bold">{student.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.lessonsCompleted}/12</TableCell>
                    <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
