import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2 } from 'lucide-react';

interface SignOutPageState {
  isSignedOut: boolean;
  error: string | null;
}

export class SignOutPage extends Component<{}, SignOutPageState> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      isSignedOut: false,
      error: null
    };
  }

  async componentDidMount() {
    try {
      // Access the auth context and signOut method
      if (this.context && this.context.signOut) {
        await this.context.signOut();
        this.setState({ isSignedOut: true });
      } else {
        this.setState({ error: 'Authentication context not available' });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      this.setState({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred while signing out'
      });
    }
  }

  render() {
    const { isSignedOut, error } = this.state;

    if (isSignedOut) {
      return <Navigate to="/" replace />;
    }

    return (
      <AuthLayout>
        <Card className="w-full max-w-md p-6 space-y-6">
          {error ? (
            <>
              <div className="text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">
                  Error Signing Out
                </h1>
                <p className="text-muted-foreground">
                  {error}
                </p>
              </div>
              <Button 
                onClick={() => this.setState({ isSignedOut: true })}
                className="w-full"
              >
                Go to Home Page
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Signing out...</p>
            </div>
          )}
        </Card>
      </AuthLayout>
    );
  }
} 