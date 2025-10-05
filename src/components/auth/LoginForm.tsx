import React, { Component, FormEvent } from 'react';
import { Button } from '../ui/button';
import { AuthContext } from '../../providers/AuthProvider';

interface LoginFormState {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
}

export class LoginForm extends Component<{}, LoginFormState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
      isLoading: false
    };
  }

  handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { email, password } = this.state;
    
    if (!email || !password) {
      this.setState({ error: 'Please enter both email and password' });
      return;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      const { error } = await this.context!.signIn(email, password);
      
      if (error) {
        this.setState({ 
          error: error.message || 'Failed to sign in', 
          isLoading: false 
        });
        return;
      }
      
      // Successful login will be handled by the auth provider
    } catch (err) {
      console.error('Login error:', err);
      this.setState({ 
        error: 'An unexpected error occurred', 
        isLoading: false 
      });
    }
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      ...this.state,
      [e.target.name]: e.target.value
    });
  };

  render() {
    const { email, password, error, isLoading } = this.state;

    return (
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Log In</h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={this.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={this.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
      </div>
    );
  }
} 