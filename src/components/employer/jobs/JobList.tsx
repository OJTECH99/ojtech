import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
import {
import {
import {
import { useToast } from "../../../hooks/use-toast";
import { deleteJob } from "../../../lib/actions/job";
import { Job } from "../../../lib/types/employer";
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

interface JobListState {
  // TODO: Add state properties
}

class JobList extends Component<JobListProps, JobListState> {
  constructor(props: JobListProps) {
    super(props);
    this.state = {
      // TODO: Initialize state from useState hooks
    };
  }

  render() {
    return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedStatus || "all"}
          onValueChange={(value) =>
            onStatusFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <Input
            placeholder="Search jobs..."
            value={searchInput}
            onChange={handleSearchInputChange}
            className="flex-1"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Button asChild>
          <Link href="/employer/jobs/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Job Listings */}
      {jobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {jobs.map((job) => (
            <EmployerJobCard
              key={job.id}
              job={job}
              onViewApplications={handleViewApplications}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
              isDeleting={deletingJobId === job.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No jobs match your search criteria"
                  : selectedStatus
                  ? `You don't have any ${selectedStatus} jobs`
                  : "You haven't posted any jobs yet"}
              </p>
              <Button asChild>
                <Link href="/employer/jobs/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Post a Job
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                size="default"
                onClick={(e) => {
                  e.preventDefault();
  }
}

export default JobList;
