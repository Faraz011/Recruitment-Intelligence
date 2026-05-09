"use client";

import { useState, useCallback } from "react";

interface FilterBarProps {
  type: "listings" | "scorecards";
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export default function FilterBar({ type, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  const handleChange = useCallback(
    (key: string, value: string) => {
      const newFilters = {
        ...filters,
        [key]: value || undefined,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    onFilterChange({});
  }, [onFilterChange]);

  if (type === "listings") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Role / Company
            </label>
            <input
              type="text"
              placeholder="Search roles or companies..."
              value={filters.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., New York, Remote..."
              value={filters.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Seniority
            </label>
            <select
              value={filters.seniority || ""}
              onChange={(e) => handleChange("seniority", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Remote Type
            </label>
            <select
              value={filters.remote_type || ""}
              onChange={(e) => handleChange("remote_type", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors border border-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
            Candidate / Role
          </label>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
            Hire Recommendation
          </label>
          <select
            value={filters.hire_recommendation || ""}
            onChange={(e) => handleChange("hire_recommendation", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all appearance-none cursor-pointer"
          >
            <option value="">All</option>
            <option value="Strong Yes">Strong Yes</option>
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
            <option value="Strong No">Strong No</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors border border-gray-300"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
