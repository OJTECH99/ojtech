import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, Settings, TrendingUp, UserPlus, Shield, Database, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddUserDialog } from './AddUserDialog';
import { adminAPI } from '@/lib/api';

interface SystemStats {
  totalUsers: number;
  activeStudents: number;
  totalSections: number;
  systemHealth: number;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const systemStatsDisplay = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: GraduationCap },
    { label: 'Total Sections', value: stats?.totalSections || 0, icon: BookOpen },
    { label: 'System Health', value: `${stats?.systemHealth || 0}%`, icon: TrendingUp },
  ];

  const handleUserAdded = () => {
    // Refresh stats and recent users after adding a new user
    const fetchData = async () => {
      try {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse);
        const usersResponse = await adminAPI.getUsers(0, 5);
        setRecentUsers(usersResponse.content || usersResponse);
      } catch (error) {
        console.error('Failed to refresh stats:', error);
      }
    };
    fetchData();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse);
        const usersResponse = await adminAPI.getUsers(0, 5);
        setRecentUsers(usersResponse.content || usersResponse);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">System Overview & Management, {user?.name} 🛡️</p>
          </div>
          <div className="flex items-center space-x-3">
           
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="learning-card">
                <CardContent className="flex items-center p-4">
                  <div className="p-2 rounded-lg bg-gradient-primary mr-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">
                      <span>{stat.label}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button variant="activity" onClick={() => setShowAddUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            
            <Card className="learning-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                ) : (
                  recentUsers.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          userData.role === 'TEACHER' ? 'bg-gradient-warm' : 
                          userData.role === 'ADMIN' ? 'bg-gradient-primary' : 
                          'bg-gradient-success'
                        }`}>
                          {userData.role === 'TEACHER' ? 
                            <GraduationCap className="h-4 w-4 text-white" /> : 
                            userData.role === 'ADMIN' ? 
                            <Shield className="h-4 w-4 text-white" /> :
                            <Users className="h-4 w-4 text-white" />
                          }
                        </div>
                        <div>
                          <div className="font-medium text-sm">{userData.fullName}</div>
                          <div className="text-xs text-muted-foreground">{userData.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={userData.isActive ? 'default' : 'secondary'}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {userData.role.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full mt-4">
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">System Overview</h2>
            <Card className="learning-card">
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Users</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.totalUsers}</div>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active Students</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.activeStudents}</div>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Sections</span>
                        <div className="text-right">
                          <div className="font-bold">{stats.totalSections}</div>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">System Health</span>
                        <div className="text-right">
                          <div className="font-bold text-success">{stats.systemHealth}%</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Tools */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Management Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button variant="outline" className="h-24 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">User Management</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Content Management</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span className="text-sm">System Settings</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2">
                <Database className="h-6 w-6" />
                <span className="text-sm">Database</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs - Coming Soon */}
        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Activity logs will be available soon</p>
              <p className="text-sm mt-1">System tracking and monitoring in development</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog 
        open={showAddUser} 
        onOpenChange={(open) => {
          setShowAddUser(open);
          if (!open) {
            handleUserAdded();
          }
        }}
      />
    </div>
  );
};