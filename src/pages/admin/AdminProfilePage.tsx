import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Loader2, Eye, EyeOff, User, Mail, Shield, Lock } from 'lucide-react';
import authService from '../../lib/api/authService';
import { toast } from '../../components/ui/toast-utils';

interface AdminProfilePageState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong' | null;
}

export class AdminProfilePage extends Component<{}, AdminProfilePageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  state: AdminProfilePageState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordStrength: null,
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

  handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = this.state;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.destructive({
        title: 'Validation Error',
        description: 'Please fill in all password fields',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast.destructive({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.destructive({
        title: 'Validation Error',
        description: 'New password and confirmation do not match',
      });
      return;
    }
    
    if (currentPassword === newPassword) {
      toast.destructive({
        title: 'Validation Error',
        description: 'New password must be different from current password',
      });
      return;
    }
    
    this.setState({ isLoading: true });
    
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
      
      // Clear form
      this.setState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isLoading: false,
        passwordStrength: null,
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      this.setState({ isLoading: false });
      toast.destructive({
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  render() {
    const { user } = this.context || {};
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      isLoading,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordStrength,
    } = this.state;

    // Redirect if not logged in or not admin
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/" />;
    }

    return (
      <div className="container mx-auto py-6 space-y-6 min-h-screen max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and security
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Administrator
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Reset Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={this.handlePasswordReset} className="space-y-4">
                {/* Current Password */}
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => this.setState({ currentPassword: e.target.value })}
                      disabled={isLoading}
                      className="pr-10"
                      placeholder="Enter your current password"
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
                      disabled={isLoading}
                      className="pr-10"
                      placeholder="Enter your new password"
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
                      disabled={isLoading}
                      className="pr-10"
                      placeholder="Confirm your new password"
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

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || (confirmPassword && newPassword !== confirmPassword) || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default AdminProfilePage;
