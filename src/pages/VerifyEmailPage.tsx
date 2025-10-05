import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Mail } from 'lucide-react';
import { AuthLayout } from '../components/layouts/AuthLayout';

interface VerifyEmailPageState {
  email: string | null;
  fullName: string | null;
}

export class VerifyEmailPage extends Component<{}, VerifyEmailPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: null,
      fullName: null
    };
  }
  
  componentDidMount() {
    // Try to get user information from session storage if available
    const email = sessionStorage.getItem('registrationEmail');
    const fullName = sessionStorage.getItem('registrationFullName');
    
    if (email || fullName) {
      this.setState({ email, fullName });
    }
  }
  
  render() {
    const { email, fullName } = this.state;
    
    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-16 h-16 flex items-center justify-center">
              <Mail className="h-8 w-8 text-gray-600 dark:text-gray-300" />
            </div>
            
            <h1 className="text-2xl font-bold">Check your email</h1>
            
            {fullName && (
              <p className="text-muted-foreground">
                Thanks, <span className="font-medium text-gray-800 dark:text-gray-300">{fullName}</span>!
              </p>
            )}
            
            <p className="text-muted-foreground">
              We've sent you a verification link to complete your registration.
              {email && (
                <span className="font-medium block mt-1">
                  Please check <span className="text-gray-800 dark:text-gray-300">{email}</span> and click the link to verify your account.
                </span>
              )}
              {!email && (
                <span>
                  Please check your email inbox and click the link to verify your account.
                </span>
              )}
            </p>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p>The email might take a few minutes to arrive.</p>
              <p>Be sure to check your spam folder if you don't see it.</p>
              <p className="mt-2">After verification, you'll be able to complete your profile with additional information.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }
} 