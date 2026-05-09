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
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No interview scorecards found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Candidate
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Role
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Rating
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Recommendation
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Technical
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Communication
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Culture Fit
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Strengths
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Weaknesses
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
          {scorecards.map((scorecard) => {
            const colors = hireBadgeColors[scorecard.hire_recommendation] ||
              hireBadgeColors["Not mentioned"];
            return (
              <tr
                key={scorecard.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-gray-900">
                  {scorecard.candidate_name}
                </td>
                <td className="py-3 px-4 text-gray-700">{scorecard.role}</td>
                <td className="py-3 px-4 text-gray-900">
                  {renderStars(scorecard.overall_rating)}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors}`}>
                    {scorecard.hire_recommendation}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  {scorecard.technical_score}/10
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  {scorecard.communication_score}/10
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  {scorecard.culture_fit_score}/10
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">
                  {scorecard.strengths.slice(0, 2).join(", ")}
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">
                  {scorecard.weaknesses.slice(0, 2).join(", ")}
                </td>
                <td className="py-3 px-4 text-gray-600 text-xs">
                  {new Date(scorecard.extracted_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onDelete(scorecard.id)}
                    disabled={isDeleting.has(scorecard.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 disabled:opacity-50 transition-all"
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
