import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';
import type { CreateUserRequest } from '@/lib/api';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddUserDialog = ({ open, onOpenChange }: AddUserDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    section: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare payload expected by backend
      const payload: CreateUserRequest = {
        email: formData.email,
        fullName: formData.name,
        role:
          formData.role.toLowerCase() === 'teacher'
            ? 'TEACHER'
            : formData.role.toLowerCase() === 'admin'
            ? 'ADMIN'
            : 'STUDENT',
        // generate a temporary password for the created user
        password: Math.random().toString(36).slice(-8),
      };

      if (formData.role === 'student' && formData.section) {
        // include section identifier if applicable
        payload.section = formData.section;
      }

      await adminAPI.createUser(payload);

      toast({
        title: 'Success!',
        description: `User ${formData.name} has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'student',
        section: '',
      });

      // Close dialog (parent will refresh lists)
      onOpenChange(false);
    } catch (err: unknown) {
      console.error('Create user failed', err);
      const message = err instanceof Error ? err.message : 'Unexpected error';
      toast({
        title: 'Error creating user',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === 'student' && (
              <div className="grid gap-2">
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1a">Grade 1 - Section A</SelectItem>
                    <SelectItem value="1b">Grade 1 - Section B</SelectItem>
                    <SelectItem value="2a">Grade 2 - Section A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
