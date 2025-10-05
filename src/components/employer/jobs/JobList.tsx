import {Job} from '@/lib/types';
import { EmployerJobCard } from "./EmployerJobCard";

interface JobListProps {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: string | null) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  selectedStatus: string | null;
  searchQuery: string;
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
  // TODO: Implement filters, search, and pagination
  return (
    <div className="space-y-6">
      {/* Job Listings */}
      {jobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {jobs.map((job) => (
            <EmployerJobCard
              key={job.id}
              job={job}
              onViewApplications={() => {}}
              onEditJob={() => {}}
              onDeleteJob={() => {}}
              isDeleting={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      )}
    </div>
  );
};

export default JobList;
