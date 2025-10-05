import React from 'react';
import { Loader2 } from "lucide-react";

interface JobFormProps {
  job?: any;
  isEditing?: boolean;
}

const JobForm: React.FC<JobFormProps> = () => {
  // TODO: Implement job form with react-hook-form
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default JobForm;
