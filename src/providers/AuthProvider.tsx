import React, { Component, createContext, useContext, ReactNode } from 'react';
import authService, { UserData } from '@/lib/api/authService';
import profileService from '@/lib/api/profileService'; // Import profile service

export interface AppUser extends UserData {
  // Add profile specific fields here, or a nested profile object
  profile?: any; // Generic profile for now, can be StudentProfileData or EmployerProfileData
  hasCompletedOnboarding?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  login: (usernameOrEmail: string, password: string) => Promise<AppUser>;
  register: (data: any) => Promise<any>;
  googleLogin: (tokenId: string) => Promise<AppUser>;
  githubLogin: (code: string) => Promise<AppUser>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: any;
  needsOnboarding: boolean;
  requiresPasswordReset: boolean;
  fetchUserProfile: () => Promise<void>; // Added to manually refresh profile
  updateProfile: (profile: any) => void; // Added to update user/profile
}

// Create context outside of any component
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthProviderState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: any | null;
  needsOnboarding: boolean;
  requiresPasswordReset: boolean;
}

// Export the class component separately
class AuthProviderComponent extends Component<AuthProviderProps, AuthProviderState> {
  // Add private property for throttling
  private _lastFetchTimestamp: number = 0;

  constructor(props: AuthProviderProps) {
    super(props);
    this.state = {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      profile: null,
      needsOnboarding: true,
      requiresPasswordReset: false,
    };
  }

  componentDidMount() {
    this.initializeAuth();
  }

  fetchUserProfileData = async (userData: UserData): Promise<AppUser> => {
    try {
      // Skip profile fetch for admin users
      if (userData.roles.includes('ROLE_ADMIN')) {
        const user: AppUser = {
          ...userData,
          profile: null,
          hasCompletedOnboarding: true, // Admins don't need onboarding
        };

        this.setState({
          isLoading: false,
          isAuthenticated: true,
          user,
          profile: null,
          needsOnboarding: false,
        });

        return user;
      }

      // Use a throttle mechanism to prevent excessive calls
      const now = Date.now();
      if (this._lastFetchTimestamp && now - this._lastFetchTimestamp < 5000) {
        // 5 second throttle
        
        if (this.state.user) {
          return this.state.user;
        }
      }

      // Update the fetch timestamp
      this._lastFetchTimestamp = now;

      
      let profile = null;
      try {
        profile = await profileService.getCurrentStudentProfile();
       
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Don't throw, continue with null profile
      }

      // Check if hasCompletedOnboarding explicitly exists in profile
      // Strictly check for boolean true to avoid type coercion issues
      const hasCompletedOnboarding = profile && profile.hasCompletedOnboarding === true;
      

      const user: AppUser = {
        ...userData,
        profile: profile || null,
        hasCompletedOnboarding,
      };

      this.setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        profile: profile || null,
        needsOnboarding: !hasCompletedOnboarding,
      });

      return user;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);

      if (error.response && error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        this.logout();
        throw error; // Rethrow to handle in calling code
      } else {
        // Other error - still authenticated but no profile
        const user: AppUser = {
          ...userData,
          profile: null,
          hasCompletedOnboarding: false,
        };

        this.setState({
          isLoading: false,
          isAuthenticated: true,
          user,
          profile: null,
          needsOnboarding: true,
        });

        return user;
      }
    }
  };

  initializeAuth = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
       
        const fullUser = await this.fetchUserProfileData(currentUser);

        // Explicitly check if onboarding is completed (ensure it's boolean true)
        const hasCompletedOnboarding = fullUser.hasCompletedOnboarding === true;
      
        this.setState({
          user: fullUser,
          isLoading: false,
          isAuthenticated: true,
          needsOnboarding: !hasCompletedOnboarding,
        });
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.setState({ isLoading: false });
    }
  };

  login = async (usernameOrEmail: string, password: string) => {
    try {
      this.setState({ isLoading: true });
      const baseUserData = await authService.login({
        usernameOrEmail,
        password,
      });

      console.log('Login successful, fetching user profile');
      const fullUser = await this.fetchUserProfileData(baseUserData);

      // Explicitly check onboarding status
      const hasCompletedOnboarding = fullUser.hasCompletedOnboarding === true;
      
      // Check password reset requirement
      const requiresPasswordReset = fullUser.requiresPasswordReset === true;
      
      console.log('Login complete. Onboarding status:', hasCompletedOnboarding, 'Password Reset:', requiresPasswordReset);

      this.setState({
        isLoading: false,
        isAuthenticated: true,
        user: fullUser,
        profile: fullUser.profile,
        needsOnboarding: !hasCompletedOnboarding,
        requiresPasswordReset: requiresPasswordReset,
      });

      return fullUser;
    } catch (error: any) {
      this.setState({ isLoading: false });
      throw error;
    }
  };

  googleLogin = async (tokenId: string) => {
    try {
      this.setState({ isLoading: true });
      const userData = await authService.googleLogin(tokenId);

      // Since we're now using the Google token directly and not calling the backend,
      // we'll set profile data directly based on the Google information
      const user: AppUser = {
        ...userData,
        profile: {
          // Add basic profile data
          id: userData.id,
          userId: userData.id,
          name: userData.name || userData.username,
          email: userData.email,
          picture: userData.picture || null,
          hasCompletedOnboarding: false, // New Google users need to complete onboarding
        },
        hasCompletedOnboarding: false,
      };

      this.setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        profile: user.profile,
        needsOnboarding: true, // Google users should always go through onboarding
      });

      return user;
    } catch (error: any) {
      this.setState({ isLoading: false });
      throw error;
    }
  };

  githubLogin = async (code: string) => {
    try {
      this.setState({ isLoading: true });
      const userData = await authService.githubLogin(code);

      console.log('GitHub login successful, fetching user profile');
      const fullUser = await this.fetchUserProfileData(userData);

      // Check onboarding status from the backend response
      const hasCompletedOnboarding = fullUser.hasCompletedOnboarding === true;
      console.log('GitHub login complete. Onboarding status:', hasCompletedOnboarding);

      this.setState({
        isLoading: false,
        isAuthenticated: true,
        user: fullUser,
        profile: fullUser.profile,
        needsOnboarding: !hasCompletedOnboarding,
      });

      return fullUser;
    } catch (error: any) {
      this.setState({ isLoading: false });
      throw error;
    }
  };

  register = async (data: any) => {
    try {
      // Register the user
      const registrationResponse = await authService.register(data);
      
      // Store the email for login
      console.log('Registration successful for email:', data.email);
      console.log('Registration response:', registrationResponse);

      // Add a small delay before attempting login to ensure backend processing is complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Automatically log in after registration
      // Use the email for login instead of username, as that's what the backend expects
      console.log('Attempting automatic login with email:', data.email);

      try {
        const loginResponse = await this.login(data.email, data.password);
        // Return both the user data from login and the userId from registration
        return {
          ...loginResponse,
          userId: registrationResponse.userId
        };
      } catch (error: any) {
        console.error('Automatic login failed after registration:', error);

        // If login fails with 403, create a minimal user object to return
        // This allows the user to proceed without having to manually log in
        if (error.response?.status === 403) {
          console.log('Creating minimal user object after 403 error');
          const minimalUser: AppUser = {
            id: 0, // Placeholder ID
            username: data.username,
            email: data.email,
            roles: ['ROLE_STUDENT'], // Assuming student role for new registrations
            accessToken: '', // Empty token
            profile: null,
            hasCompletedOnboarding: false,
          };

          // Update state to show as authenticated but needing onboarding
          this.setState({
            user: minimalUser,
            isAuthenticated: true,
            isLoading: false,
            needsOnboarding: true,
            profile: null,
          });

          // Return both the minimal user and the userId from registration
          return {
            ...minimalUser,
            userId: registrationResponse.userId
          };
        }

        // For other errors, redirect to login page
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  logout = () => {
    authService.logout();
    this.setState({ 
      user: null,
      isAuthenticated: false,
      profile: null,
      needsOnboarding: true,
      isLoading: false
    });
    
    // Use replace instead of href to avoid adding to history
    window.location.replace('/');
  };

  fetchUserProfile = async () => {
    const { user } = this.state;
    if (user) {
      // Check if we recently fetched the profile to prevent excessive calls
      const now = Date.now();
      if (this._lastFetchTimestamp && now - this._lastFetchTimestamp < 5000) {
        // 5 second throttle
        
        return; // Skip the fetch
      }

      // Only set loading state if we're actually going to make an API call
      this.setState({ isLoading: true });

      try {
       
        const fullUser = await this.fetchUserProfileData(user);

        // Additional check to ensure onboarding status is correctly set
        
        this.setState({
          user: fullUser,
          isLoading: false,
          profile: fullUser.profile || null,
          needsOnboarding: fullUser.hasCompletedOnboarding !== true,
          requiresPasswordReset: fullUser.requiresPasswordReset === true,
        });
      } catch (error) {
        console.error('Error refreshing user profile:', error);
        this.setState({ isLoading: false });
      }
    }
  };

  updateProfile = (updatedData: any) => {
    this.setState((prevState) => ({
      user: prevState.user ? { ...prevState.user, ...updatedData } : null,
      profile: updatedData.profile || prevState.profile,
      requiresPasswordReset: updatedData.requiresPasswordReset !== undefined 
        ? updatedData.requiresPasswordReset 
        : prevState.requiresPasswordReset,
    }));
  };

  render() {
    const { user, isLoading } = this.state;
    const value: AuthContextType = {
      user,
      login: this.login,
      register: this.register,
      googleLogin: this.googleLogin,
      githubLogin: this.githubLogin,
      logout: this.logout,
      isLoading,
      isAuthenticated: this.state.isAuthenticated,
      profile: this.state.profile,
      needsOnboarding: this.state.needsOnboarding,
      requiresPasswordReset: this.state.requiresPasswordReset,
      fetchUserProfile: this.fetchUserProfile,
      updateProfile: this.updateProfile,
    };

    return <AuthContext.Provider value={value}>{this.props.children}</AuthContext.Provider>;
  }
}

// Export a function component wrapper for the class component
export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  return <AuthProviderComponent {...props} />;
};

// Export the hook and context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };