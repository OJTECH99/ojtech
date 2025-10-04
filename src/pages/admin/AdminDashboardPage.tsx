import React, { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Users, Briefcase, FilePlus2, LineChart } from "lucide-react";
import { Skeleton } from "../../components/ui/Skeleton";
import { Navigate, Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import adminService from "../../lib/api/adminService";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}

class StatsCard extends Component<StatsCardProps> {
  render() {
    const { title, value, icon, loading } = this.props;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                <p className="text-3xl font-bold">{value}</p>
              )}
            </div>
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

interface DashboardStats {
  totalUsers: number;
  userDistribution: {
    admin: number;
    employer: number;
    student: number;
  };
  totalJobs: number;
  totalApplications: number;
  loading: boolean;
}

export class AdminDashboardPage extends Component<{}, DashboardStats> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      totalUsers: 0,
      userDistribution: {
        admin: 0,
        employer: 0,
        student: 0
      },
      totalJobs: 0,
      totalApplications: 0,
      loading: true,
    };
  }
  
  componentDidMount() {
    this.fetchStats();
  }
  
  async fetchStats() {
    try {
      const detailedStats = await adminService.getDetailedStats();
      
      this.setState({
        totalUsers: detailedStats.totalUsers,
        userDistribution: detailedStats.userDistribution,
        totalJobs: detailedStats.totalJobs,
        totalApplications: detailedStats.totalApplications,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      this.setState({ loading: false });
    }
  }
  
  render() {
    const { user } = this.context || {};
    
    // Redirect if not logged in or not admin
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/" />;
    }
    
    const { totalUsers, userDistribution, totalJobs, totalApplications, loading } = this.state;
    
    return (
      <div className="container mx-auto py-6 space-y-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor platform activity and manage key metrics.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Users" 
            value={totalUsers} 
            icon={<Users className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Students" 
            value={userDistribution.student} 
            icon={<Users className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Employers" 
            value={userDistribution.employer} 
            icon={<Briefcase className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Applications" 
            value={totalApplications} 
            icon={<FilePlus2 className="h-6 w-6" />} 
            loading={loading} 
          />
          <StatsCard 
            title="Job Listings" 
            value={totalJobs} 
            icon={<FilePlus2 className="h-6 w-6" />} 
            loading={loading} 
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between font-medium">
                <span>Recent Activity</span>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <LineChart className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm text-muted-foreground">Activity tracking coming soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between font-medium">
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Link 
                  to="/admin/users" 
                  className="block w-full py-3 px-4 bg-gray-800 text-white rounded-md text-center hover:bg-gray-700 transition-colors"
                >
                  Manage Users & Employers
                </Link>
                <Link 
                  to="/admin/students/verification" 
                  className="block w-full py-3 px-4 bg-green-700 text-white rounded-md text-center hover:bg-green-600 transition-colors"
                >
                  Verify Student Profiles
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
