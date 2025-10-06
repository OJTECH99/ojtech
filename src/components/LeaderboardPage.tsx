import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

export const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();

  const sectionData = {
    '1': {
      name: 'Grade 1 - Section A',
      students: [
        { id: '2', name: 'Maria Santos', score: 920, lessonsCompleted: 10, rank: 1 },
        { id: '4', name: 'Ana Lopez', score: 890, lessonsCompleted: 9, rank: 2 },
        { id: '1', name: 'Juan Dela Cruz', score: 850, lessonsCompleted: 8, rank: 3 },
        { id: '3', name: 'Pedro Garcia', score: 780, lessonsCompleted: 7, rank: 4 },
        { id: '5', name: 'Carlos Reyes', score: 650, lessonsCompleted: 5, rank: 5 },
      ],
    },
    '2': {
      name: 'Grade 1 - Section B',
      students: [
        { id: '6', name: 'Sofia Cruz', score: 950, lessonsCompleted: 11, rank: 1 },
        { id: '10', name: 'Camila Lopez', score: 900, lessonsCompleted: 10, rank: 2 },
        { id: '8', name: 'Isabella Garcia', score: 880, lessonsCompleted: 9, rank: 3 },
        { id: '7', name: 'Miguel Ramos', score: 820, lessonsCompleted: 8, rank: 4 },
        { id: '9', name: 'Diego Santos', score: 760, lessonsCompleted: 7, rank: 5 },
      ],
    },
    '3': {
      name: 'Grade 2 - Section A',
      students: [
        { id: '12', name: 'Emma Torres', score: 940, lessonsCompleted: 11, rank: 1 },
        { id: '11', name: 'Luis Martinez', score: 870, lessonsCompleted: 9, rank: 2 },
        { id: '14', name: 'Valentina Reyes', score: 860, lessonsCompleted: 8, rank: 3 },
        { id: '15', name: 'Mateo Cruz', score: 790, lessonsCompleted: 7, rank: 4 },
        { id: '13', name: 'Rafael Diaz', score: 720, lessonsCompleted: 6, rank: 5 },
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-warning" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-accent" />;
    return <Award className="h-6 w-6 text-muted-foreground/50" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-warm';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400';
    if (rank === 3) return 'bg-gradient-accent';
    return 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-warning" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
              <p className="text-muted-foreground">{section.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {section.students.slice(0, 3).sort((a, b) => a.rank - b.rank).map((student, index) => {
            const positions = [1, 0, 2]; // Center first place
            const actualIndex = positions[index];
            const isFirst = student.rank === 1;
            
            return (
              <div 
                key={student.id} 
                className={`flex flex-col items-center ${actualIndex === 0 ? 'order-2' : actualIndex === 1 ? 'order-1 mt-8' : 'order-3 mt-8'}`}
              >
                <Card className={`learning-card w-full ${isFirst ? 'ring-2 ring-warning' : ''}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${getRankBadge(student.rank)} flex items-center justify-center`}>
                      {getRankIcon(student.rank)}
                    </div>
                    <div className="text-3xl font-bold mb-1">#{student.rank}</div>
                    <div className="font-semibold mb-2">{student.name}</div>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Award className="h-4 w-4 text-warning" />
                      <span className="text-2xl font-bold text-primary">{student.score}</span>
                    </div>
                    <Badge variant={isFirst ? 'default' : 'secondary'}>
                      {student.lessonsCompleted} lessons
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Rest of Rankings */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.students.map((student) => (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-4 rounded-lg ${
                  student.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${getRankBadge(student.rank)} flex items-center justify-center font-bold`}>
                    {student.rank <= 3 ? getRankIcon(student.rank) : `#${student.rank}`}
                  </div>
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.lessonsCompleted} lessons completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-warning" />
                    <span className="text-2xl font-bold text-primary">{student.score}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
