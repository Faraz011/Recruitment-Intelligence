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
        <div className="flex flex-wrap gap-4 p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role / Company
            </label>
            <input
              type="text"
              placeholder="Search roles or companies..."
              value={filters.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., New York, Remote..."
              value={filters.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seniority
            </label>
            <select
              value={filters.seniority || ""}
              onChange={(e) => handleChange("seniority", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Remote Type
            </label>
            <select
              value={filters.remote_type || ""}
              onChange={(e) => handleChange("remote_type", e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
              className="px-4 py-3 bg-gray-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-300 rounded-lg text-sm font-medium transition-all border border-gray-600 hover:border-red-500/50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Candidate / Role
          </label>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hire Recommendation
          </label>
          <select
            value={filters.hire_recommendation || ""}
            onChange={(e) => handleChange("hire_recommendation", e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
            className="px-4 py-3 bg-gray-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-300 rounded-lg text-sm font-medium transition-all border border-gray-600 hover:border-red-500/50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
