import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Award, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Mock profile data - in real app, this would come from backend
  const profileData = {
    joinDate: 'January 2025',
    section: 'Grade 1 - Section A',
    totalScore: 850,
    lessonsCompleted: 8,
    totalLessons: 12,
    currentPhase: 'Phase 1',
    achievements: [
      { id: 1, name: 'First Lesson', icon: '🎯', earned: true },
      { id: 2, name: 'Perfect Score', icon: '💯', earned: true },
      { id: 3, name: '5 Lessons', icon: '📚', earned: true },
      { id: 4, name: '10 Lessons', icon: '🏆', earned: false },
      { id: 5, name: 'Quick Learner', icon: '⚡', earned: true },
      { id: 6, name: 'Phase Master', icon: '👑', earned: false },
    ],
    recentActivity: [
      { lesson: 'Pang-uri (Adjectives)', score: 85, date: '2 days ago' },
      { lesson: 'Pandiwa (Verbs)', score: 90, date: '5 days ago' },
      { lesson: 'Pangngalan (Nouns)', score: 92, date: '1 week ago' },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bumalik sa Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{user?.name}</h1>
                <p className="text-muted-foreground">{profileData.section}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Mag-logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profileData.totalScore}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-success mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profileData.lessonsCompleted}/{profileData.totalLessons}</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-warm mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profileData.currentPhase}</div>
                <div className="text-xs text-muted-foreground">Phase</div>
              </div>
            </CardContent>
          </Card>

          <Card className="learning-card">
            <CardContent className="flex items-center p-4">
              <div className="p-2 rounded-lg bg-gradient-accent mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold">{profileData.joinDate}</div>
                <div className="text-xs text-muted-foreground">Joined</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card className="learning-card">
            <CardHeader>
              <CardTitle>Mga Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {profileData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center p-4 rounded-lg ${
                      achievement.earned ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-muted/30 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-xs text-center font-medium">{achievement.name}</div>
                    {achievement.earned && (
                      <Badge variant="outline" className="mt-2 text-xs">Earned</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="learning-card">
            <CardHeader>
              <CardTitle>Kamakailang Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{activity.lesson}</div>
                    <div className="text-xs text-muted-foreground">{activity.date}</div>
                  </div>
                  <Badge variant={activity.score >= 80 ? 'default' : 'secondary'}>
                    {activity.score}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                <div className="font-semibold">{user?.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <div className="font-semibold">{user?.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Section</div>
                <div className="font-semibold">{profileData.section}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Student ID</div>
                <div className="font-semibold">{user?.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
