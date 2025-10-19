import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // e.g. ['ROLE_ADMIN', 'ROLE_NLO']
  children?: React.ReactNode;
  isOnboardingPath?: boolean;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  isOnboardingPath = false,
  requireOnboarding = true
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading session...</p></div>;
  }

  if (!user) {
    // Preserve the intended location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      // Not authorized for this role
      return <Navigate to="/" replace />; // Or an unauthorized page
    }
  }

  // For routes other than onboarding, check if onboarding is complete
  // Skip this check if isOnboardingPath is true or requireOnboarding is false
  if (requireOnboarding && !isOnboardingPath && !user.hasCompletedOnboarding) {
    // Redirect to appropriate onboarding page based on role
    if (user.roles?.includes('ROLE_STUDENT')) {
      return <Navigate to="/onboarding/student" replace />;
    }
    if (user.roles?.includes('ROLE_NLO')) {
      return <Navigate to="/onboarding/employer" replace />;
    }
    // Fallback if role is unclear but onboarding needed (should ideally not happen)
    return <Navigate to="/" replace />; 
  }

  // Return children if provided, otherwise use Outlet
  return children ? <>{children}</> : <Outlet />;
};

interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

// A route that is only accessible to unauthenticated users
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show a loading spinner
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      );
    }

    // If authenticated, redirect based on role and onboarding status
  if (user) {
      // If onboarding is not completed, redirect to the appropriate onboarding page
    if (!user.hasCompletedOnboarding) {
      if (user.roles?.includes('ROLE_STUDENT')) {
          return <Navigate to="/onboarding/student" replace />;
      } else if (user.roles?.includes('ROLE_NLO')) {
          return <Navigate to="/onboarding/employer" replace />;
      } else if (user.roles?.includes('ROLE_ADMIN')) {
          return <Navigate to="/onboarding/admin" replace />;
        }
      } else {
        // If onboarding is completed, redirect to the appropriate dashboard
      if (user.roles?.includes('ROLE_STUDENT')) {
          return <Navigate to="/applications" replace />;
      } else if (user.roles?.includes('ROLE_NLO')) {
          return <Navigate to="/employer/jobs" replace />;
      } else if (user.roles?.includes('ROLE_ADMIN')) {
          return <Navigate to="/admin/dashboard" replace />;
      }
    }
    // Default redirect if none of the specific roles matched
    return <Navigate to="/" replace />;
  }

  // If not authenticated, show the public route
  return children ? <>{children}</> : <Outlet />;
};

// Role-specific route components for easier usage
export const StudentRoute: React.FC<Omit<ProtectedRouteProps, 'allowedRoles'>> = (props) => {
  return <ProtectedRoute {...props} allowedRoles={['ROLE_STUDENT']} />;
};

export const EmployerRoute: React.FC<Omit<ProtectedRouteProps, 'allowedRoles'>> = (props) => {
  return <ProtectedRoute {...props} allowedRoles={['ROLE_NLO']} />;
};

export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'allowedRoles'>> = (props) => {
  return <ProtectedRoute {...props} allowedRoles={['ROLE_ADMIN']} />;
};

// A route that requires any authentication
export const AuthenticatedRoute: React.FC<Omit<ProtectedRouteProps, 'allowedRoles'>> = (props) => {
  return <ProtectedRoute {...props} />;
};

// A special route for onboarding paths
export const OnboardingRoute: React.FC<Omit<ProtectedRouteProps, 'isOnboardingPath' | 'requireOnboarding'>> = (props) => {
  return <ProtectedRoute {...props} isOnboardingPath={true} requireOnboarding={false} />;
}; 