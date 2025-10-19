import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Loader2, Github, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import profileService from '../lib/api/profileService';
import { toast } from '../components/ui/toast-utils';
import { GoogleLogin } from '@react-oauth/google';

interface LoginPageState {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  isGoogleLoading: boolean;
  redirectTo: string | null;
  showPassword: boolean;
}

export class LoginPage extends Component<{}, LoginPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  // GitHub OAuth Configuration
  private GITHUB_CLIENT_ID = 'Ov23li4gxkGK900aEkLs';
  private GITHUB_REDIRECT_URI = `${window.location.origin}/auth/github/callback`;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
      isLoading: false,
      isGoogleLoading: false,
      redirectTo: null,
      showPassword: false
    };
  }
  
  componentDidMount() {
    // Check if already logged in
    if (this.context && this.context.user) {
      this.setState({ redirectTo: '/' });
    }
    
    // Use stored email from registration
    const storedEmail = sessionStorage.getItem('registrationEmail');
    
    if (storedEmail) {
      this.setState({ email: storedEmail });
    }
    
    // Check if redirected from registration
    const urlParams = new URLSearchParams(window.location.search);
    const fromRegistration = urlParams.get('fromRegistration');
    if (fromRegistration === 'true') {
      const email = sessionStorage.getItem('registrationEmail');
      const message = email 
        ? `Registration successful! Please log in with your email "${email}" and password.`
        : 'Registration successful! Please log in with your credentials.';
      
      // Show toast notification only
      toast.success({
        title: "Registration Successful",
        description: message
      });
    }
  }
  
  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ 
      ...this.state, 
      [name]: value,
      error: null
    } as Pick<LoginPageState, keyof LoginPageState>);
  };
  
  // Helper method to create initial profile if needed
  createInitialProfileIfNeeded = async () => {
    try {
      // Check if we have stored full name from registration
      const fullName = sessionStorage.getItem('registrationFullName');
      
      if (fullName) {
        console.log('Creating initial profile with stored full name:', fullName);
        
        try {
          // Try to create the initial profile
          await profileService.createInitialProfile(fullName);
          console.log('Successfully created initial profile');
          
          // Clear stored registration data after successful profile creation
          sessionStorage.removeItem('registrationEmail');
          sessionStorage.removeItem('registrationFullName');
          
          // Refresh user data to get updated profile information
          if (this.context && this.context.fetchUserProfile) {
            await this.context.fetchUserProfile();
          }
        } catch (error) {
          console.error('Error creating initial profile:', error);
          // Don't block the login flow if this fails
        }
      }
    } catch (error) {
      console.error('Error in createInitialProfileIfNeeded:', error);
      // Don't block the login flow if this fails
    }
  };
  
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { email, password } = this.state;
    
    // Make sure the context is defined
    if (!this.context || !this.context.login) {
      toast.destructive({
        title: "Authentication Error",
        description: "Authentication service not available"
      });
      this.setState({ error: "Authentication service not available" });
      return;
    }
    
    const { login } = this.context;
    
    this.setState({ error: null, isLoading: true });
    
    try {
      // Use the login method from AuthContext with email and password as separate parameters
      await login(email, password);
      
      // Show success toast
      toast.success({
        title: "Login Successful",
        description: "You have been successfully logged in."
      });
      
      // After successful login, try to create initial profile if needed
      await this.createInitialProfileIfNeeded();
      
      // Check user role and determine where to redirect
      if (this.context && this.context.user) {
        const { user } = this.context;
        
        console.log('Login redirect logic - User:', user);
        console.log('hasCompletedOnboarding:', user.hasCompletedOnboarding);
        console.log('needsOnboarding:', this.context.needsOnboarding);
        
        // PRIORITY CHECK: Password reset requirement (highest priority)
        if (this.context.requiresPasswordReset) {
          this.setState({ redirectTo: '/change-password' });
          return;
        }
        
        // SECOND PRIORITY: Onboarding requirement
        // Check BOTH needsOnboarding AND hasCompletedOnboarding to be safe
        if (this.context.needsOnboarding && user.hasCompletedOnboarding !== true) {
          console.log('User needs onboarding, redirecting...');
          if (user.roles?.includes('ROLE_NLO')) {
            this.setState({ redirectTo: '/onboarding/employer' });
          } else if (user.roles?.includes('ROLE_STUDENT')) {
            this.setState({ redirectTo: '/onboarding/student' });
          } else {
            this.setState({ redirectTo: '/onboarding' });
          }
          return;
        }
        
        // FINAL: Role-based redirect after onboarding is complete
        console.log('User has completed onboarding, redirecting to role-based page...');
        if (user.roles?.includes('ROLE_ADMIN')) {
          this.setState({ redirectTo: '/admin/dashboard' });
        } else if (user.roles?.includes('ROLE_NLO')) {
          this.setState({ redirectTo: '/employer/jobs' });
        } else if (user.roles?.includes('ROLE_STUDENT')) {
          this.setState({ redirectTo: '/applications' });
        } else {
          this.setState({ redirectTo: '/' });
        }
      } else {
        // If context or user is not available after login, redirect to home
        this.setState({ redirectTo: '/' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more helpful error message for 403 errors
      if (error.response?.status === 403) {
        const email = sessionStorage.getItem('registrationEmail');
        const errorMessage = email 
          ? `Invalid credentials. Please use your email "${email}" and password.` 
          : "Invalid email or password. Please make sure you're using the email address you registered with.";
        
        // Show toast notification
        toast.destructive({
          title: "Login Failed",
          description: errorMessage
        });
        
        this.setState({ 
          error: errorMessage,
          isLoading: false
        });
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
        
        // Show toast notification
        toast.destructive({
          title: "Login Error",
          description: errorMessage
        });
        
        this.setState({ 
          error: errorMessage,
          isLoading: false
        });
      }
    }
  };

  handleGoogleLogin = async (tokenId: string) => {
    if (!this.context || !this.context.googleLogin) {
      const errorMessage = 'Google authentication service is not available';
      
      toast.destructive({
        title: "Authentication Error",
        description: errorMessage
      });
      
      this.setState({ 
        error: errorMessage
      });
      return;
    }
    
    this.setState({ isGoogleLoading: true, error: null });
    
    try {
      await this.context.googleLogin(tokenId);
      
      // Show success toast
      toast.success({
        title: "Login Successful",
        description: "You have been successfully signed in with Google."
      });
      
      // Check user role and determine where to redirect
      if (this.context && this.context.user) {
        const { user } = this.context;
        
        // Redirect based on user role and onboarding status
        if (user.roles?.includes('ROLE_ADMIN')) {
          this.setState({ redirectTo: '/admin/dashboard' });
        } else if (user.roles?.includes('ROLE_NLO') && !user.hasCompletedOnboarding) {
          this.setState({ redirectTo: '/onboarding/employer' });
        } else if (user.roles?.includes('ROLE_STUDENT') && !user.hasCompletedOnboarding) {
          this.setState({ redirectTo: '/onboarding/student' });
        } else if (user.roles?.includes('ROLE_STUDENT') && user.hasCompletedOnboarding) {
          // Redirect students with completed onboarding to applications page
          this.setState({ redirectTo: '/applications' });
        } else if (user.roles?.includes('ROLE_NLO') && user.hasCompletedOnboarding) {
          // Redirect employers with completed onboarding to jobs page
          this.setState({ redirectTo: '/employer/jobs' });
        } else {
          // Default fallback
          this.setState({ redirectTo: '/' });
        }
      } else {
        // If context or user is not available after login, redirect to home
        this.setState({ redirectTo: '/' });
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      
      const errorMessage = error.message || 'Google authentication failed. Please try again.';
      
      toast.destructive({
        title: "Authentication Error",
        description: errorMessage
      });
      
      this.setState({ 
        error: errorMessage,
        isGoogleLoading: false
      });
    }
  };
  
  togglePasswordVisibility = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  };

  handleGitHubLogin = () => {
    // Construct GitHub OAuth URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(this.GITHUB_REDIRECT_URI)}&scope=user:email`;
    
    // Redirect to GitHub for authorization
    window.location.href = githubAuthUrl;
  };
  
  render() {
    const { email, password, error, isLoading, isGoogleLoading, redirectTo, showPassword } = this.state;
    
    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }
    
    return (
      <AuthLayout>
        <Card className="w-full p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={this.handleInputChange}
                  required
                  className="mt-1"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={this.handleInputChange}
                    required
                    className="mt-1 pr-10"
                  />
                  <button
                    type="button"
                    onClick={this.togglePasswordVisibility}
                    className="absolute right-3 top-[calc(50%+2px)] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              {isGoogleLoading ? (
                <Button variant="outline" className="w-full flex items-center justify-center" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Google...
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      this.handleGoogleLogin(credentialResponse.credential);
                    }
                  }}
                  onError={() => {
                    toast.destructive({
                      title: "Google Login Error",
                      description: "Google authentication failed. Please try again."
                    });
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  logo_alignment="center"
                  text="signin_with"
                  shape="rectangular"
                />
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={this.handleGitHubLogin}
              type="button"
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </AuthLayout>
    );
  }
} 