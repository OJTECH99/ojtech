import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';

interface OnboardingCheckProps {
  children: React.ReactNode;
  skipPaths?: string[];
}

export class OnboardingCheck extends Component<OnboardingCheckProps> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // Public routes that don't require authentication or onboarding
  static defaultProps = {
    skipPaths: [
      '/',
      '/opportunities',
      '/opportunities/', // Include with trailing slash for path matching
      '/login',
      '/register',
      '/verify-email',
      '/auth/signout',
      '/api-info'
    ]
  };
  
  componentDidMount() {
    this.checkOnboardingStatus();
  }
  
  componentDidUpdate() {
    this.checkOnboardingStatus();
  }
  
  checkOnboardingStatus() {
    if (!this.context) return;
    
    const { isAuthenticated, userRole, onboardingCompleted } = this.context;
    const currentPath = window.location.pathname;
    
    // Debug information to help troubleshoot navigation
    console.debug('OnboardingCheck status:', { 
      isAuthenticated, 
      userRole,
      onboardingCompleted,
      currentPath,
      shouldRedirect: this.shouldRedirect()
    });
  }
  
  shouldRedirect() {
    if (!this.context) return false;
    
    const { isAuthenticated, userRole, onboardingCompleted } = this.context;
    
    // Don't check if user is not authenticated
    if (!isAuthenticated) {
      return false;
    }
    
    // Don't redirect if onboarding is completed
    if (onboardingCompleted) {
      return false;
    }
    
    // Get the current path
    const currentPath = window.location.pathname;
    
    // Check if current path is already an onboarding path for the user's role
    if (this.isCorrectOnboardingPath(currentPath, userRole)) {
      return false;
    }
    
    // Check if the current path is in the skip list (public routes)
    if (this.isPublicRoute(currentPath)) {
      return false;
    }
    
    // At this point, the user is authenticated, hasn't completed onboarding,
    // isn't on their onboarding path, and isn't on a public route
    // So we should redirect them to the appropriate onboarding page
    return true;
  }
  
  isPublicRoute(path: string) {
    return this.props.skipPaths?.some(skipPath => {
      // Exact match for root and auth routes
      if (skipPath === path) {
        return true;
      }
      
      // Special case for opportunity details pages
      if (skipPath === '/opportunities' && path.startsWith('/opportunities/')) {
        // Allow viewing individual opportunities, but not application
        return !path.includes('/apply/');
      }
      
      return false;
    }) || false;
  }
  
  isCorrectOnboardingPath(path: string, role: string | null) {
    switch (role) {
      case 'STUDENT':
        return path === '/onboarding/student';
      case 'EMPLOYER':
        return path === '/onboarding/employer';
      case 'ADMIN':
        return path === '/onboarding/admin';
      default:
        return false;
    }
  }
  
  getRedirectPath() {
    if (!this.context) return '/';
    
    const { userRole } = this.context;
    
    switch (userRole) {
      case 'STUDENT':
        return '/onboarding/student';
      case 'EMPLOYER':
        return '/onboarding/employer';
      case 'ADMIN':
        return '/onboarding/admin';
      default:
        return '/';
    }
  }
  
  render() {
    if (this.shouldRedirect()) {
      const redirectPath = this.getRedirectPath();
      console.log(`Redirecting to onboarding: ${redirectPath}`);
      return <Navigate to={redirectPath} replace />;
    }
    
    return this.props.children;
  }
} 