import React from 'react';

interface JobListProps {
  jobs: any[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
  // TODO: Implement job list display
  return (
    <div className="space-y-4">
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      )}
    </div>
  );
};

export default JobList;
