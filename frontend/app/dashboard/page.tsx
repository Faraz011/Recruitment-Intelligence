"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  getListings,
  getScorecards,
  deleteListing,
  deleteScorecard,
  JobListing,
  InterviewScorecard,
} from "@/lib/api";
import JobTable from "@/components/JobTable";
import ScorecardTable from "@/components/ScorecardTable";
import FilterBar from "@/components/FilterBar";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"listings" | "scorecards">(
    "listings",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());

  // Listings state
  const [listings, setListings] = useState<JobListing[]>([]);
  const [listingStats, setListingStats] = useState({
    total: 0,
    unique_roles: 0,
    unique_companies: 0,
  });
  const [listingPage, setListingPage] = useState(1);
  const [listingTotalPages, setListingTotalPages] = useState(0);
  const [listingFilters, setListingFilters] = useState<
    Record<string, string | undefined>
  >({});

  // Scorecards state
  const [scorecards, setScorecards] = useState<InterviewScorecard[]>([]);
  const [scorecardStats, setScorecardStats] = useState({
    total: 0,
    avg_rating: 0,
    hire_rate: 0,
  });
  const [scorecardPage, setScorecardPage] = useState(1);
  const [scorecardTotalPages, setScorecardTotalPages] = useState(0);
  const [scorecardFilters, setScorecardFilters] = useState<
    Record<string, string | undefined>
  >({});

  // Load listings
  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const result = await getListings({
          ...listingFilters,
          page: listingPage,
        });
        setListings(result.data);
        setListingTotalPages(result.total_pages);

        // Calculate stats
        const uniqueRoles = new Set(result.data.map((l: JobListing) => l.role))
          .size;
        const uniqueCompanies = new Set(
          result.data.map((l: JobListing) => l.company),
        ).size;
        setListingStats({
          total: result.total,
          unique_roles: uniqueRoles,
          unique_companies: uniqueCompanies,
        });
      } catch (error) {
        toast.error("Failed to load listings");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "listings") {
      loadListings();
    }
  }, [activeTab, listingPage, listingFilters]);

  // Load scorecards
  useEffect(() => {
    const loadScorecards = async () => {
      setIsLoading(true);
      try {
        const result = await getScorecards({
          ...scorecardFilters,
          page: scorecardPage,
        });
        setScorecards(result.data);
        setScorecardTotalPages(result.total_pages);

        // Calculate stats
        const avgRating =
          result.data.length > 0
            ? (
                result.data.reduce(
                  (sum: number, s: InterviewScorecard) =>
                    sum + s.overall_rating,
                  0,
                ) / result.data.length
              ).toFixed(1)
            : 0;

        const hireRate =
          result.data.length > 0
            ? Math.round(
                (result.data.filter(
                  (s: InterviewScorecard) =>
                    s.hire_recommendation === "Strong Yes" ||
                    s.hire_recommendation === "Yes",
                ).length /
                  result.data.length) *
                  100,
              )
            : 0;

        setScorecardStats({
          total: result.total,
          avg_rating: avgRating as any,
          hire_rate: hireRate,
        });
      } catch (error) {
        toast.error("Failed to load scorecards");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "scorecards") {
      loadScorecards();
    }
  }, [activeTab, scorecardPage, scorecardFilters]);

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Delete this job listing?")) return;

    setIsDeleting((prev) => new Set([...prev, id]));
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing deleted");
    } catch (error) {
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteScorecard = async (id: string) => {
    if (!confirm("Delete this scorecard?")) return;

    setIsDeleting((prev) => new Set([...prev, id]));
    try {
      await deleteScorecard(id);
      setScorecards((prev) => prev.filter((s) => s.id !== id));
      toast.success("Scorecard deleted");
    } catch (error) {
      toast.error("Failed to delete scorecard");
    } finally {
      setIsDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const exportToCSV = () => {
    if (activeTab === "listings") {
      const headers = [
        "Role",
        "Company",
        "Location",
        "Seniority",
        "Remote Type",
        "Skills",
        "Salary Min",
        "Salary Max",
        "Currency",
      ];
      const rows = listings.map((l) => [
        l.role,
        l.company,
        l.location,
        l.seniority,
        l.remote_type,
        l.skills_required.join("; "),
        l.salary_min,
        l.salary_max,
        l.salary_currency,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      downloadCSV(csv, "job_listings.csv");
    } else {
      const headers = [
        "Candidate",
        "Role",
        "Rating",
        "Hire Recommendation",
        "Technical",
        "Communication",
        "Culture Fit",
        "Strengths",
        "Weaknesses",
      ];
      const rows = scorecards.map((s) => [
        s.candidate_name,
        s.role,
        s.overall_rating,
        s.hire_recommendation,
        s.technical_score,
        s.communication_score,
        s.culture_fit_score,
        s.strengths.join("; "),
        s.weaknesses.join("; "),
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      downloadCSV(csv, "scorecards.csv");
    }
  };

  const downloadCSV = (csv: string, filename: string) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv),
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-blue-100 text-sm">
                📊 Monitor and manage your recruitment intelligence
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 border border-white/30 backdrop-blur-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Tabs - Modern Design */}
        <div className="flex gap-4 mb-10 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <button
            onClick={() => {
              setActiveTab("listings");
              setListingPage(1);
            }}
            className={`flex-1 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 ${
              activeTab === "listings"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            📇 Job Listings
          </button>
          <button
            onClick={() => {
              setActiveTab("scorecards");
              setScorecardPage(1);
            }}
            className={`flex-1 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 ${
              activeTab === "scorecards"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            📋 Scorecards
          </button>
        </div>

        {/* Job Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur rounded-xl border border-blue-500/30 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total JDs</p>
                    <p className="text-4xl font-bold text-blue-50 mt-2">
                      {listingStats.total}
                    </p>
                  </div>
                  <div className="text-4xl">📄</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur rounded-xl border border-green-500/30 p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Unique Roles</p>
                    <p className="text-4xl font-bold text-green-50 mt-2">
                      {listingStats.unique_roles}
                    </p>
                  </div>
                  <div className="text-4xl">💼</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur rounded-xl border border-purple-500/30 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Unique Companies</p>
                    <p className="text-4xl font-bold text-purple-50 mt-2">
                      {listingStats.unique_companies}
                    </p>
                  </div>
                  <div className="text-4xl">🏢</div>
                </div>
              </div>
            </div>

            {/* Filters & Export */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                <h2 className="text-white font-semibold">Filters & Actions</h2>
              </div>
              <FilterBar
                type="listings"
                onFilterChange={(f) => {
                  setListingFilters(f);
                  setListingPage(1);
                }}
              />

              <button
                onClick={exportToCSV}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📥 Export to CSV
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-600">Loading...</div>
              ) : (
                <>
                  <JobTable
                    jobs={listings}
                    onDelete={handleDeleteListing}
                    isDeleting={isDeleting}
                  />

                  {/* Pagination */}
                  <div className="flex justify-between items-center px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Page {listingPage} of {listingTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setListingPage((p) => Math.max(1, p - 1))
                        }
                        disabled={listingPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setListingPage((p) => p + 1)}
                        disabled={listingPage >= listingTotalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Interview Scorecards Tab */}
        {activeTab === "scorecards" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur rounded-xl border border-orange-500/30 p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Scorecards</p>
                    <p className="text-4xl font-bold text-orange-50 mt-2">
                      {scorecardStats.total}
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur rounded-xl border border-cyan-500/30 p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Avg. Rating</p>
                    <p className="text-4xl font-bold text-cyan-50 mt-2">
                      {scorecardStats.avg_rating}
                    </p>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 backdrop-blur rounded-xl border border-pink-500/30 p-6 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Hire Rate</p>
                    <p className="text-4xl font-bold text-pink-50 mt-2">
                      {scorecardStats.hire_rate}%
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            {/* Filters & Export */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 bg-purple-400 rounded-full"></div>
                <h2 className="text-white font-semibold">Filters & Actions</h2>
              </div>
              <FilterBar
                type="scorecards"
                onFilterChange={(f) => {
                  setScorecardFilters(f);
                  setScorecardPage(1);
                }}
              />

              <button
                onClick={exportToCSV}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📥 Export to CSV
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-600">Loading...</div>
              ) : (
                <>
                  <ScorecardTable
                    scorecards={scorecards}
                    onDelete={handleDeleteScorecard}
                    isDeleting={isDeleting}
                  />

                  {/* Pagination */}
                  <div className="flex justify-between items-center px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Page {scorecardPage} of {scorecardTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setScorecardPage((p) => Math.max(1, p - 1))
                        }
                        disabled={scorecardPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setScorecardPage((p) => p + 1)}
                        disabled={scorecardPage >= scorecardTotalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
