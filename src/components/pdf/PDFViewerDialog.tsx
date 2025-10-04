import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import PDFViewer from './PDFViewer';

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
}

const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({
  isOpen,
  onClose,
  fileUrl,
  title = "PDF Document"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PDFViewer fileUrl={fileUrl} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog;
