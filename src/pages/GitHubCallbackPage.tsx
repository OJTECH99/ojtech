import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { toast } from '../components/ui/toast-utils';

interface GitHubCallbackPageState {
  isProcessing: boolean;
  redirectTo: string | null;
  error: string | null;
}

export class GitHubCallbackPage extends Component<{}, GitHubCallbackPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      isProcessing: true,
      redirectTo: null,
      error: null,
    };
  }

  componentDidMount() {
    this.handleGitHubCallback();
  }

  handleGitHubCallback = async () => {
    try {
      // Get the authorization code from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // Check if user denied access
      if (error) {
        const errorMessage = errorDescription || 'GitHub authentication was cancelled';
        toast.destructive({
          title: "Authentication Cancelled",
          description: errorMessage
        });
        this.setState({
          isProcessing: false,
          error: errorMessage,
          redirectTo: '/login',
        });
        return;
      }

      // Check if code exists
      if (!code) {
        toast.destructive({
          title: "Authentication Error",
          description: "No authorization code received from GitHub"
        });
        this.setState({
          isProcessing: false,
          error: "No authorization code received",
          redirectTo: '/login',
        });
        return;
      }

      // Ensure context is available
      if (!this.context || !this.context.githubLogin) {
        toast.destructive({
          title: "Authentication Error",
          description: "GitHub authentication service is not available"
        });
        this.setState({
          isProcessing: false,
          error: "Authentication service not available",
          redirectTo: '/login',
        });
        return;
      }

      // Authenticate with GitHub using the code
      console.log('Processing GitHub authentication with code...');
      const user = await this.context.githubLogin(code);

      // Show success toast
      toast.success({
        title: "Login Successful",
        description: "You have been successfully signed in with GitHub."
      });

      // Redirect based on user role and onboarding status
      if (user.roles?.includes('ROLE_ADMIN')) {
        this.setState({
          isProcessing: false,
          redirectTo: '/admin/dashboard',
        });
      } else if (user.roles?.includes('ROLE_NLO') && !user.hasCompletedOnboarding) {
        this.setState({
          isProcessing: false,
          redirectTo: '/onboarding/employer',
        });
      } else if (user.roles?.includes('ROLE_STUDENT') && !user.hasCompletedOnboarding) {
        this.setState({
          isProcessing: false,
          redirectTo: '/onboarding/student',
        });
      } else if (user.roles?.includes('ROLE_STUDENT') && user.hasCompletedOnboarding) {
        this.setState({
          isProcessing: false,
          redirectTo: '/track',
        });
      } else if (user.roles?.includes('ROLE_NLO') && user.hasCompletedOnboarding) {
        this.setState({
          isProcessing: false,
          redirectTo: '/employer/jobs',
        });
      } else {
        this.setState({
          isProcessing: false,
          redirectTo: '/',
        });
      }
    } catch (error: any) {
      console.error('GitHub authentication error:', error);
      
      const errorMessage = error.message || 'GitHub authentication failed. Please try again.';
      
      toast.destructive({
        title: "Authentication Error",
        description: errorMessage
      });

      this.setState({
        isProcessing: false,
        error: errorMessage,
        redirectTo: '/login',
      });
    }
  };

  render() {
    const { isProcessing, redirectTo, error } = this.state;

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {isProcessing ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authenticating with GitHub...</h2>
              <p className="text-gray-600">Please wait while we complete your sign in.</p>
            </>
          ) : error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
              <p className="text-gray-600">{error}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to login page...</p>
            </>
          ) : null}
        </div>
      </div>
    );
  }
}

