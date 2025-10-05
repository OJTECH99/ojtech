import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/button';
import { Loader2, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import authService from '../lib/api/authService';
import { toast } from '../components/ui/toast-utils';

interface ChangePasswordPageState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  redirectTo: string | null;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong' | null;
}

export class ChangePasswordPage extends Component<{}, ChangePasswordPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  state: ChangePasswordPageState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    redirectTo: null,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordStrength: null,
  };

  componentDidMount() {
    // If user doesn't require password reset, redirect based on role
    if (this.context && !this.context.requiresPasswordReset) {
      this.redirectBasedOnRole();
    }
  }

  redirectBasedOnRole = () => {
    const { user } = this.context;
    if (user && user.roles) {
      if (user.roles.includes('ROLE_ADMIN')) {
        this.setState({ redirectTo: '/admin/dashboard' });
      } else if (user.roles.includes('ROLE_EMPLOYER')) {
        this.setState({ redirectTo: '/employer/dashboard' });
      } else {
        this.setState({ redirectTo: '/dashboard' });
      }
    }
  };

  checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    this.setState({
      newPassword,
      passwordStrength: newPassword ? this.checkPasswordStrength(newPassword) : null,
    });
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = this.state;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.setState({ error: 'All fields are required' });
      toast.destructive({
        title: 'Validation Error',
        description: 'Please fill in all fields',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      this.setState({ error: 'New password must be at least 6 characters' });
      toast.destructive({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      toast.destructive({
        title: 'Validation Error',
        description: 'New password and confirmation do not match',
      });
      return;
    }
    
    if (currentPassword === newPassword) {
      this.setState({ error: 'New password must be different from current password' });
      toast.destructive({
        title: 'Validation Error',
        description: 'New password must be different from current password',
      });
      return;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      toast.success({
        title: 'Password Changed',
        description: 'Your password has been successfully updated',
      });
      
      // Update auth context to clear requiresPasswordReset flag
      if (this.context && this.context.updateProfile) {
        this.context.updateProfile({ requiresPasswordReset: false });
      }
      
      // Redirect based on role
      this.redirectBasedOnRole();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      this.setState({ error: errorMessage, isLoading: false });
      toast.destructive({
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  render() {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      isLoading,
      error,
      redirectTo,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordStrength,
    } = this.state;

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    const { user } = this.context;
    const isFirstLogin = user?.requiresPasswordReset;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {isFirstLogin ? 'Set New Password' : 'Change Password'}
            </h2>
            {isFirstLogin && (
              <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    For security reasons, you must change your password before accessing the system.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={this.handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => this.setState({ currentPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => this.setState({ showCurrentPassword: !showCurrentPassword })}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={this.handleNewPasswordChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => this.setState({ showNewPassword: !showNewPassword })}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'weak'
                            ? 'w-1/3 bg-red-500'
                            : passwordStrength === 'medium'
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength === 'weak'
                          ? 'text-red-600 dark:text-red-400'
                          : passwordStrength === 'medium'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                </div>
              )}
              
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use at least 8 characters with a mix of letters, numbers, and symbols
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => this.setState({ confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => this.setState({ showConfirmPassword: !showConfirmPassword })}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (confirmPassword && newPassword !== confirmPassword)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }
}

