"use client";

import { useState } from "react";
import Link from "next/link";
import { extractJD, extractScorecard } from "@/lib/api";
import ExtractionCard from "@/components/ExtractionCard";
import ScorecardCard from "@/components/ScorecardCard";
import BatchUploader from "@/components/BatchUploader";
import toast from "react-hot-toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"jd" | "batch" | "scorecard">(
    "jd",
  );
  const [isLoading, setIsLoading] = useState(false);

  // Single JD extraction
  const [jdText, setJdText] = useState("");
  const [jdSourceUrl, setJdSourceUrl] = useState("");
  const [jdResult, setJdResult] = useState<any | null>(null);

  // Scorecard extraction
  const [scorecardText, setScorecardText] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [scorecardResult, setScorecardResult] = useState<any | null>(null);

  const handleExtractJD = async () => {
    if (!jdText.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setIsLoading(true);
    try {
      const result = await extractJD(jdText, jdSourceUrl || undefined);
      setJdResult(result);
      toast.success("JD extracted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractScorecard = async () => {
    if (!scorecardText.trim()) {
      toast.error("Please enter interview feedback");
      return;
    }

    setIsLoading(true);
    try {
      const result = await extractScorecard(
        scorecardText,
        candidateName || undefined,
        roleInput || undefined,
      );
      setScorecardResult(result);
      toast.success("Scorecard extracted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text">JD Structura</h1>
              <p className="text-gray-400 text-sm mt-1">
                Turn messy recruitment data into clean, queryable intelligence
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("jd")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "jd"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Single JD
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "batch"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Batch Upload
          </button>
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "scorecard"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Interview Scorecard
          </button>
        </div>

        {/* Single JD Tab */}
        {activeTab === "jd" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Description (raw text)
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={8}
                placeholder="Paste the raw job description here..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source URL (optional)
              </label>
              <input
                type="url"
                value={jdSourceUrl}
                onChange={(e) => setJdSourceUrl(e.target.value)}
                placeholder="https://example.com/job/123"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleExtractJD}
              disabled={isLoading || !jdText.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? "Extracting..." : "Extract JD"}
            </button>

            {jdResult && <ExtractionCard job={jdResult} />}
          </div>
        )}

        {/* Batch Upload Tab */}
        {activeTab === "batch" && (
          <div className="space-y-4">
            <BatchUploader onSuccess={() => setJdText("")} />
          </div>
        )}

        {/* Interview Scorecard Tab */}
        {activeTab === "scorecard" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Feedback (raw text)
              </label>
              <textarea
                value={scorecardText}
                onChange={(e) => setScorecardText(e.target.value)}
                rows={8}
                placeholder="Paste the raw interview feedback here..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Candidate Name (optional)
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role (optional)
                </label>
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="Senior Engineer"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleExtractScorecard}
              disabled={isLoading || !scorecardText.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? "Extracting..." : "Extract Scorecard"}
            </button>

            {scorecardResult && <ScorecardCard scorecard={scorecardResult} />}
          </div>
        )}
      </main>
    </div>
  );
}
