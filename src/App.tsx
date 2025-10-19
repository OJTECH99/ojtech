import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider, ToastHelper } from './providers/ToastContext';
import { Toaster } from './components/ui/Toaster';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OnboardingLayout } from './components/layouts/OnboardingLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GitHubCallbackPage } from './pages/GitHubCallbackPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobApplicationPage } from './pages/JobApplicationPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import { PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { StudentOnboardingPage } from './pages/onboarding/StudentOnboardingPage';
import { EmployerOnboardingPage } from './pages/onboarding/EmployerOnboardingPage';
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage';
import { JobFormPage } from './pages/employer/JobFormPage';
import { JobDetailsPage } from './pages/employer/JobDetailsPage';
import { useAuth } from './providers/AuthProvider';
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { UsersAdminPage } from "./pages/admin/UsersAdminPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";
import NLOStudentVerificationPage from "./components/nlo/StudentVerificationPage";
import CompanyManagementPage from "./components/nlo/CompanyManagementPage";
import { TrackApplicationsPage } from './pages/TrackApplicationsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import ResumeManagementPage from './pages/ResumeManagementPage';
import './index.css';

// Main layout with navigation for all non-auth pages
const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Check onboarding status ONLY - don't fetch profile here as it's already done by AuthProvider
  React.useEffect(() => {
    // Don't do anything while loading or if no user
    if (isLoading || !user) {
      return;
    }

    // Safe paths that should be accessible regardless of onboarding status
    const safePaths = [
      '/profile',
      '/resume', 
      '/onboarding', 
      '/login', 
      '/register', 
      '/auth',
      '/privacy',
      '/terms',
      '/admin',
      '/nlo',
      '/change-password',
      '/applications',
      '/opportunities',
      '/application',
      '/employer',
      '/'
    ];
    
    // Check if current path is in safe paths
    const isOnSafePath = safePaths.some(path => location.pathname.startsWith(path));
    
    // Check if user is an admin - admins don't need onboarding
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    
    // Only redirect if onboarding isn't complete AND we're not on a safe path AND not an admin
    if (user.hasCompletedOnboarding === false && !isOnSafePath && !isAdmin) {
      // User has NOT completed onboarding, redirect to appropriate onboarding page
      const studentOnboardingPath = '/onboarding/student';
      const employerOnboardingPath = '/onboarding/employer';
      
      if (user?.roles?.includes('ROLE_STUDENT') && 
          location.pathname !== studentOnboardingPath) {
        console.log('Redirecting to student onboarding from:', location.pathname);
        window.location.replace(studentOnboardingPath);
      } else if (user?.roles?.includes('ROLE_NLO') && 
                location.pathname !== employerOnboardingPath) {
        console.log('Redirecting to employer onboarding from:', location.pathname);
        window.location.replace(employerOnboardingPath);
      }
    }
  }, [user?.hasCompletedOnboarding, user?.roles, isLoading, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className={`flex-grow ${location.pathname !== '/' ? 'container mx-auto px-4 py-8' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Auth layout without navigation for auth pages
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

// Email verification redirect component
const EmailVerificationRedirect: React.FC = () => {
  const { user } = useAuth();
  
  // Determine where to redirect based on user role
  if (user) {
    if (user.roles?.includes('ROLE_STUDENT')) {
      return <Navigate to="/onboarding/student" replace />;
    } else if (user.roles?.includes('ROLE_NLO')) {
      return <Navigate to="/onboarding/employer" replace />;
    }
  }
  
  // Default redirect to login if no user is found
  return <Navigate to="/login" replace />;
};

// Main App component
export const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        <ToastHelper />
        <Routes>
          {/* Auth routes without navigation - public only */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Keep verify-email route for backward compatibility, but redirect to appropriate page */}
              <Route path="/verify-email" element={<EmailVerificationRedirect />} />
            </Route>
          </Route>
          
          {/* GitHub OAuth Callback - doesn't need PublicOnlyRoute as it handles auth */}
          <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
          
          {/* All non-auth routes with the main layout and navbar */}
          <Route element={<MainLayout />}>
            {/* Password change route - accessible to all authenticated users */}
            <Route path="/change-password" element={<ChangePasswordPage />} />
            
            {/* For Pre Testing mockdata */}
              <Route path="/" element={<HomePage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:id" element={<JobDetailPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/applications" element={<TrackApplicationsPage />} />
              <Route path="/application/:id" element={<ApplicationDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ResumeManagementPage />} />
              <Route path="/employer/jobs" element={<EmployerJobsPage />} />
              <Route path="/employer/jobs/create" element={<JobFormPage />} />
              <Route path="/employer/jobs/:jobId" element={<JobDetailsPage />} />
              <Route path="/employer/jobs/edit/:jobId" element={<JobFormPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/profile" element={<AdminProfilePage />} />
              <Route path="/admin/users" element={<UsersAdminPage />} />
              <Route path="/nlo/students/verification" element={<NLOStudentVerificationPage />} />
              <Route path="/nlo/students/:id" element={<StudentDetailsPage />} />
              <Route path="/nlo/companies" element={<CompanyManagementPage />} />
              <Route path="/opportunities/apply/:id" element={<JobApplicationPage />} />
          </Route>
          
          {/* Onboarding routes without navbar */}
          <Route element={<OnboardingLayout />}>
            <Route path="/onboarding/student" element={<StudentOnboardingPage />} />
            <Route path="/onboarding/employer" element={<EmployerOnboardingPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </ToastProvider>
    </ThemeProvider>
  );
}
