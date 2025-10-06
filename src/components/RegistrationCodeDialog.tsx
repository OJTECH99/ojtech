import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

interface RegistrationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegistrationCodeDialog: React.FC<RegistrationCodeDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { registerStudent, isLoading } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length < 6) {
      setError('Registration code must be at least 6 characters');
      return;
    }

    try {
      await registerStudent(code);
      toast({
        title: 'Success!',
        description: 'You have been successfully registered to your section.',
      });
      onOpenChange(false);
    } catch (err) {
      setError('Invalid registration code. Please check with your teacher.');
      toast({
        title: 'Error',
        description: 'Invalid registration code',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <span>Enter Registration Code</span>
          </DialogTitle>
          <DialogDescription>
            Please enter the registration code provided by your teacher to access your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="regCode">Registration Code</Label>
            <Input
              id="regCode"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Enter 6-digit code"
              className="text-lg tracking-widest text-center font-semibold"
              maxLength={10}
              autoFocus
              required
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-2">📌 Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ask your teacher for the registration code</li>
              <li>The code is usually 6-10 characters</li>
              <li>Enter it exactly as provided</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            className="w-full" 
            disabled={isLoading || code.length < 6}
          >
            {isLoading ? 'Verifying...' : 'Submit Code'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
