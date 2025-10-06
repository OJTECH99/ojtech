import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, TrendingUp, Settings, Plus, Eye, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateSectionDialog } from './CreateSectionDialog';
import { InviteCodeDialog } from './InviteCodeDialog';

export const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ id: string; name: string } | null>(null);

  const sections = [
    {
      id: '1',
      name: 'Grade 1 - Section A',
      students: 25,
      activeStudents: 18,
      averageProgress: 65,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Grade 1 - Section B',
      students: 22,
      activeStudents: 20,
      averageProgress: 72,
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'Grade 2 - Section A',
      students: 28,
      activeStudents: 15,
      averageProgress: 45,
      status: 'active' as const,
    },
  ];

  const recentActivity = [
    {
      student: 'Juan Dela Cruz',
      activity: 'Nakumpleto ang "Pangngalan - Multiple Choice"',
      score: 85,
      time: '2 hours ago',
    },
    {
      student: 'Maria Santos',
      activity: 'Nagsimula sa "Pandiwa - Drag & Drop"',
      score: null,
      time: '3 hours ago',
    },
    {
      student: 'Pedro Garcia',
      activity: 'Nakumpleto ang "Story Comprehension"',
      score: 92,
      time: '5 hours ago',
    },
  ];

  const stats = [
    { label: 'Kabuuang Estudyante', value: '75', icon: Users, color: 'text-primary' },
    { label: 'Active na Sections', value: '3', icon: BookOpen, color: 'text-success' },
    { label: 'Average Progress', value: '61%', icon: TrendingUp, color: 'text-warning' },
    { label: 'Activities Created', value: '12', icon: Plus, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}! 👩‍🏫</p>
          </div>
          <div className="flex items-center space-x-3">
            
            <Button variant="ghost" onClick={logout}>
              Mag-logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="learning-card">
                <CardContent className="flex items-center p-4">
                  <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mga Section</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateSection(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
            
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.id} className="learning-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{section.name}</h3>
                      <Badge variant="secondary">
                        {section.activeStudents}/{section.students} active
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Progress</span>
                        <span className="font-medium">{section.averageProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${section.averageProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/teacher/section/${section.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/teacher/leaderboard/${section.id}`)}
                        className="flex-1"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Rankings
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSection({ id: section.id, name: section.name });
                          setShowInviteCode(true);
                        }}
                        className="flex-1"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Student Activity</h2>
            <Card className="learning-card">
              <CardHeader>
                <CardTitle className="text-lg">Latest Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {activity.student.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.student}</div>
                      <div className="text-sm text-muted-foreground">{activity.activity}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                        {activity.score && (
                          <Badge variant={activity.score >= 80 ? "default" : "secondary"}>
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      {/* Dialogs */}
      <CreateSectionDialog open={showCreateSection} onOpenChange={setShowCreateSection} />
      {selectedSection && (
        <InviteCodeDialog 
          open={showInviteCode} 
          onOpenChange={setShowInviteCode}
          sectionName={selectedSection.name}
          sectionId={selectedSection.id}
        />
      )}
    </div>
  );
};