"use client";

import { JobListing } from "@/lib/api";
import { renderSalary } from "@/lib/utils";
import { Badge, Pill } from "./Badge";

export default function ExtractionCard({ job }: { job: JobListing }) {
  const skillsToShow = job.skills_required.slice(0, 15);
  const moreSkills = Math.max(0, job.skills_required.length - 15);

  return (
    <div className="fade-in bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{job.role}</h2>
          <p className="text-lg text-gray-600">{job.company}</p>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Location
            </p>
            <p className="text-sm font-medium text-gray-900">{job.location}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Seniority
            </p>
            <Pill>{job.seniority}</Pill>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Type
            </p>
            <p className="text-sm font-medium text-gray-900">
              {job.employment_type}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Remote
            </p>
            <Pill>{job.remote_type}</Pill>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Experience
            </p>
            <p className="text-sm font-medium text-gray-900">
              {job.experience_years_min && job.experience_years_max
                ? `${job.experience_years_min}–${job.experience_years_max}y`
                : "Not mentioned"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Salary
            </p>
            <p className="text-sm font-medium text-gray-900">
              {renderSalary(
                job.salary_min,
                job.salary_max,
                job.salary_currency,
              )}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Skills Required
          </p>
          <div className="flex flex-wrap gap-2">
            {skillsToShow.map((skill, idx) => (
              <Badge key={idx}>{skill}</Badge>
            ))}
            {moreSkills > 0 && (
              <span className="text-sm text-gray-600 font-medium">
                +{moreSkills} more
              </span>
            )}
          </div>
        </div>

        {/* Source URL */}
        {job.source_url && (
          <div className="pt-2 border-t border-gray-200">
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View original source →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
