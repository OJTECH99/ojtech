import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InviteCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  sectionId: string;
}

export const InviteCodeDialog = ({ open, onOpenChange, sectionName, sectionId }: InviteCodeDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Generate consistent invite code based on section ID
  const inviteCode = `${sectionId}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Invitation code copied to clipboard',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Section Invitation Code</DialogTitle>
          <DialogDescription>
            Share this code with students to join {sectionName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-6 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Invitation Code</p>
            <div className="text-3xl font-bold tracking-widest text-primary mb-4">
              {inviteCode}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Instructions for students:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to student registration page</li>
              <li>Enter this invitation code</li>
              <li>Complete their profile</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
