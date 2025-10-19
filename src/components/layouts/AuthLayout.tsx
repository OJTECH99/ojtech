import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export class AuthLayout extends Component<AuthLayoutProps> {
  render() {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="w-full bg-black text-white border-b border-gray-800">
          <div className="container mx-auto px-4 flex h-14 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="font-bold text-lg mr-8">
                OJTech
              </Link>
            </div>
            <Link to="/">
              <Button variant="ghost" className="text-white flex items-center gap-1">
                <Home size={16} />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md mx-auto">
            {this.props.children}
          </div>
        </main>
      </div>
    );
  }
} 