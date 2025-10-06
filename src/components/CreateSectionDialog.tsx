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
import { useToast } from '@/hooks/use-toast';

interface CreateSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSectionDialog = ({ open, onOpenChange }: CreateSectionDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    capacity: '30',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    toast({
      title: 'Section Created!',
      description: `${formData.name} has been created. Invite code: ${inviteCode}`,
    });

    setFormData({
      name: '',
      grade: '',
      capacity: '30',
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Section</DialogTitle>
          <DialogDescription>
            Create a new class section. An invitation code will be generated.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="section-name">Section Name *</Label>
              <Input
                id="section-name"
                placeholder="e.g., Section A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade Level *</Label>
              <Input
                id="grade"
                placeholder="e.g., Grade 1"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="capacity">Maximum Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Section</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
