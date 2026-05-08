"use client";

import { JobListing } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { renderSalary } from "@/lib/utils";
import { Badge } from "./Badge";

interface JobTableProps {
  jobs: JobListing[];
  onDelete: (id: string) => Promise<void>;
  isDeleting: Set<string>;
}

export default function JobTable({
  jobs,
  onDelete,
  isDeleting,
}: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No job listings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Role
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Company
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Location
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Seniority
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Remote
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Skills
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Salary
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Added
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const skillsToShow = job.skills_required.slice(0, 4);
            const moreSkills = Math.max(0, job.skills_required.length - 4);

            return (
              <tr
                key={job.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-gray-900">
                  {job.role}
                </td>
                <td className="py-3 px-4 text-gray-700">{job.company}</td>
                <td className="py-3 px-4 text-gray-700">{job.location}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    {job.seniority}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {job.remote_type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {skillsToShow.map((skill, idx) => (
                      <Badge key={idx}>{skill}</Badge>
                    ))}
                    {moreSkills > 0 && (
                      <span className="text-xs text-gray-500">
                        +{moreSkills}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {renderSalary(
                    job.salary_min,
                    job.salary_max,
                    job.salary_currency,
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">
                  {new Date(job.extracted_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onDelete(job.id)}
                    disabled={isDeleting.has(job.id)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
