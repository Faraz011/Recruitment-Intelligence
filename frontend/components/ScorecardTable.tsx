"use client";

import { InterviewScorecard } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { renderStars, hireBadgeColors } from "@/lib/utils";

interface ScorecardTableProps {
  scorecards: InterviewScorecard[];
  onDelete: (id: string) => Promise<void>;
  isDeleting: Set<string>;
}

export default function ScorecardTable({
  scorecards,
  onDelete,
  isDeleting,
}: ScorecardTableProps) {
  if (scorecards.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-800/30 backdrop-blur rounded-xl border border-gray-700/50">
        <p className="text-gray-400 text-lg">📭 No interview scorecards found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur shadow-xl">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-700/50 bg-gray-800/50">
          <tr>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Candidate
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Role
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Rating
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Recommendation
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Technical
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Communication
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-200">
              Culture Fit
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
          {scorecards.map((scorecard) => {
            const badgeColor =
              hireBadgeColors[scorecard.hire_recommendation] ||
              hireBadgeColors["Not mentioned"];

            return (
              <tr
                key={scorecard.id}
                className="border-b border-gray-700/50 hover:bg-purple-500/10 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-gray-100">
                  {scorecard.candidate_name}
                </td>
                <td className="py-4 px-4 text-gray-300">{scorecard.role}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {renderStars(scorecard.overall_rating)}
                    <span className="text-sm font-semibold text-gray-200">
                      {scorecard.overall_rating}/5
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`badge px-3 py-1 text-xs font-semibold rounded-full border ${badgeColor}`}
                  >
                    {scorecard.hire_recommendation}
                  </span>
                </td>
                <td className="py-4 px-4 font-medium text-gray-300">
                  {scorecard.technical_score || "N/A"}/5
                </td>
                <td className="py-4 px-4 font-medium text-gray-300">
                  {scorecard.communication_score || "N/A"}/5
                </td>
                <td className="py-4 px-4 font-medium text-gray-300">
                  {scorecard.culture_fit_score || "N/A"}/5
                </td>
                <td className="py-4 px-4 text-xs text-gray-400">
                  {new Date(scorecard.extracted_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onDelete(scorecard.id)}
                    disabled={isDeleting.has(scorecard.id)}
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
