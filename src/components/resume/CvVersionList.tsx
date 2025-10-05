import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Loader2 } from "lucide-react";

interface CvVersionListProps {
  activeCvId?: string;
  onVersionChange?: () => void;
}

const CvVersionList: React.FC<CvVersionListProps> = () => {
  // TODO: Implement CV version list functionality
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Versions</CardTitle>
        <CardDescription>View and manage your resume versions</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
};

export default CvVersionList;
