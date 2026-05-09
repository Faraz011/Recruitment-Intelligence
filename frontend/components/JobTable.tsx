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
      <div className="text-center py-16 bg-gray-800/30 backdrop-blur rounded-xl border border-gray-700/50">
        <p className="text-gray-400 text-lg">📭 No job listings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur shadow-xl">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-700/50 bg-gray-800/50">
          <tr>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Role
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Company
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Location
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Seniority
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Remote
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Skills
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Salary
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Added
            </th>
            <th className="text-center py-4 px-4 font-semibold text-gray-200">
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
                className="border-b border-gray-700/50 hover:bg-blue-500/10 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-gray-100">
                  {job.role}
                </td>
                <td className="py-4 px-4 text-gray-300">{job.company}</td>
                <td className="py-4 px-4 text-gray-300">{job.location}</td>
                <td className="py-4 px-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                    {job.seniority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    {job.remote_type}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {skillsToShow.map((skill, idx) => (
                      <Badge key={idx}>{skill}</Badge>
                    ))}
                    {moreSkills > 0 && (
                      <span className="text-xs text-gray-400">
                        +{moreSkills}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {renderSalary(
                    job.salary_min,
                    job.salary_max,
                    job.salary_currency,
                  )}
                </td>
                <td className="py-4 px-4 text-xs text-gray-400">
                  {new Date(job.extracted_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onDelete(job.id)}
                    disabled={isDeleting.has(job.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/20 p-2 rounded-lg disabled:opacity-50 transition-all"
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
