"use client";

import { InterviewScorecard } from "@/lib/api";
import { renderStars, hireBadgeColors } from "@/lib/utils";
import { Badge } from "./Badge";

export default function ScorecardCard({
  scorecard,
}: {
  scorecard: InterviewScorecard;
}) {
  const badgeColorClass =
    hireBadgeColors[scorecard.hire_recommendation] ||
    hireBadgeColors["Not mentioned"];

  return (
    <div className="fade-in bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {scorecard.candidate_name}
          </h2>
          <p className="text-lg text-gray-600">{scorecard.role}</p>
          {scorecard.interviewer && (
            <p className="text-sm text-gray-500">
              Interviewer: {scorecard.interviewer}
            </p>
          )}
        </div>

        {/* Overall Rating & Recommendation */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Overall Rating
            </p>
            <div className="flex items-center gap-2">
              {renderStars(scorecard.overall_rating)}
              <span className="text-lg font-bold text-gray-900">
                {scorecard.overall_rating}/5
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Hire Recommendation
            </p>
            <div
              className={`badge ${badgeColorClass} text-lg font-bold px-4 py-2`}
            >
              {scorecard.hire_recommendation}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Technical", score: scorecard.technical_score },
            { label: "Communication", score: scorecard.communication_score },
            { label: "Culture Fit", score: scorecard.culture_fit_score },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                {item.label}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${((item.score || 0) / 5) * 100}%` }}
                />
              </div>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {item.score || "N/A"}/5
              </p>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Strengths
            </p>
            <div className="flex flex-wrap gap-2">
              {scorecard.strengths && scorecard.strengths.length > 0 ? (
                scorecard.strengths.map((strength, idx) => (
                  <Badge key={idx} variant="success">
                    {strength}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">None recorded</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Weaknesses
            </p>
            <div className="flex flex-wrap gap-2">
              {scorecard.weaknesses && scorecard.weaknesses.length > 0 ? (
                scorecard.weaknesses.map((weakness, idx) => (
                  <Badge key={idx} variant="danger">
                    {weakness}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">None recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Summary
          </p>
          <blockquote className="italic text-gray-700 border-l-4 border-blue-500 pl-4 py-2">
            {scorecard.summary}
          </blockquote>
        </div>
      </div>
    </div>
  );
}
