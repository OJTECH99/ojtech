import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, GraduationCap } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const demoUsers = [
    { role: 'Admin', email: 'admin@filipino.edu', icon: Users, color: 'bg-gradient-primary' },
    { role: 'Teacher', email: 'teacher@filipino.edu', icon: GraduationCap, color: 'bg-gradient-warm' },
    { role: 'Student', email: 'student@filipino.edu', icon: BookOpen, color: 'bg-gradient-success' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-2">FiliUp</h1>
          <p className="text-white/80">Mag-aral ng Filipino nang masaya!</p>
        </div>

        <Card className="learning-card">
          <CardHeader>
            <CardTitle>Mag-login sa inyong account</CardTitle>
            <CardDescription>
              Piliin ang inyong user type sa ibaba o mag-login gamit ang email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ilagay ang inyong email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ilagay ang inyong password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="hero" 
                className="w-full btn-bounce" 
                disabled={isLoading}
              >
                {isLoading ? 'Naglo-login...' : 'Mag-login'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-sm text-muted-foreground text-center mb-4">
                Demo Accounts (Password: any)
              </div>
              <div className="grid gap-3">
                {demoUsers.map((user) => {
                  const Icon = user.icon;
                  return (
                    <Button
                      key={user.role}
                      variant="outline"
                      className="justify-start space-x-3"
                      onClick={() => {
                        setEmail(user.email);
                        setPassword('demo');
                      }}
                    >
                      <div className={`p-2 rounded-md ${user.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{user.role}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};