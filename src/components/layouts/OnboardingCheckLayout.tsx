import React, { Component } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { Loader2 } from "lucide-react";

interface OnboardingCheckLayoutProps {
  children: React.ReactNode;
}

interface OnboardingCheckLayoutState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  error: string | null;
}

// Paths that should be accessible without onboarding completion
const EXEMPT_PATHS = [
  "/onboarding",
  "/", // Home page
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/login",
  "/register",
  "/verify-email"
];

export class OnboardingCheckLayout extends Component<OnboardingCheckLayoutProps, OnboardingCheckLayoutState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: OnboardingCheckLayoutProps) {
    super(props);
    this.state = {
      isLoading: true,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      error: null
    };
  }

  async componentDidMount() {
    await this.checkAuth();
  }

  // Check auth and onboarding status
  async checkAuth() {
    try {
      // Skip onboarding checks if not authenticated
      if (!this.context?.user) {
        this.setState({ 
          isLoading: false, 
          isAuthenticated: false
        });
        return;
      }

      // User is authenticated, check onboarding status
        this.setState({ 
          isAuthenticated: true,
      });

      // Check if onboarding is already completed
      const { user, isLoading } = this.context;
      
      // Wait for auth context to be ready
      if (isLoading) {
        // Keep the loading state true until auth context is ready
        return;
      }

      // Get current path
      const pathname = window.location.pathname;
      
      // Skip checks if path is exempt (public pages, auth pages, onboarding pages)
      const isExemptPath = EXEMPT_PATHS.some(path => pathname.startsWith(path));

      // Skip checks for exempt paths
      if (isExemptPath) {
        this.setState({ isLoading: false });
        return;
      }

      // Get onboarding status from user profile
      const hasCompletedOnboarding = this.context.onboardingCompleted || false;
      
          this.setState({
            isLoading: false,
        hasCompletedOnboarding
        });
    } catch (error) {
      // Global error handling
      console.error('Error in authentication check:', error);
      this.setState({
        isLoading: false,
        error: 'An error occurred during authentication check'
      });
    }
  }

  render() {
    const { isLoading, isAuthenticated, hasCompletedOnboarding } = this.state;
    
    if (isLoading) {
      return (
        <div className="flex h-[90vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    // Get current path to determine where to redirect
    const pathname = window.location.pathname;
    
    // Skip redirects for onboarding pages
    if (pathname.startsWith('/onboarding')) {
      return this.props.children;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    // If onboarding is not completed and not on an exempt path,
    // redirect to the appropriate onboarding page
    const userRole = this.context.userRole;
    
    if (!hasCompletedOnboarding) {
      if (userRole === 'STUDENT') {
        return <Navigate to="/onboarding/student" replace />;
      } else if (userRole === 'EMPLOYER') {
        return <Navigate to="/onboarding/employer" replace />;
      } else if (userRole === 'ADMIN') {
        return <Navigate to="/onboarding/admin" replace />;
    }
    }
    
    // All checks passed, render children
    return <>{this.props.children}</>;
  }
}
