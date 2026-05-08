const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface JobListing {
  id: string;
  raw_text: string;
  role: string;
  company: string;
  location: string;
  seniority: string;
  employment_type: string;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  skills_required: string[];
  experience_years_min: number | null;
  experience_years_max: number | null;
  extracted_at: string;
  source_url: string | null;
}

export interface InterviewScorecard {
  id: string;
  raw_text: string;
  candidate_name: string;
  role: string;
  interviewer: string | null;
  overall_rating: number;
  hire_recommendation: string;
  strengths: string[];
  weaknesses: string[];
  technical_score: number | null;
  communication_score: number | null;
  culture_fit_score: number | null;
  summary: string;
  extracted_at: string;
}

interface ListingsResponse {
  data: JobListing[];
  total: number;
  page: number;
  total_pages: number;
}

interface ScorecardsResponse {
  data: InterviewScorecard[];
  total: number;
  page: number;
  total_pages: number;
}

interface BatchResult {
  results: unknown[];
  succeeded: number;
  failed: number;
  skipped: number;
}

// Extract JD
export async function extractJD(
  raw_text: string,
  source_url?: string,
): Promise<JobListing> {
  const response = await fetch(`${API_URL}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text, source_url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to extract JD");
  }

  return response.json();
}

// Batch Upload
export async function batchUpload(file: File): Promise<BatchResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/batch`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Batch upload failed");
  }

  return response.json();
}

// Get Listings
export async function getListings(
  filters: {
    role?: string;
    seniority?: string;
    remote_type?: string;
    location?: string;
    page?: number;
  } = {},
): Promise<ListingsResponse> {
  const params = new URLSearchParams();
  if (filters.role) params.append("role", filters.role);
  if (filters.seniority && filters.seniority !== "All")
    params.append("seniority", filters.seniority);
  if (filters.remote_type && filters.remote_type !== "All")
    params.append("remote_type", filters.remote_type);
  if (filters.location) params.append("location", filters.location);
  if (filters.page) params.append("page", String(filters.page));

  const response = await fetch(`${API_URL}/api/listings?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
}

// Delete Listing
export async function deleteListing(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/listings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete listing");
  }
}

// Extract Scorecard
export async function extractScorecard(
  raw_text: string,
  candidate_name?: string,
  role?: string,
): Promise<InterviewScorecard> {
  const response = await fetch(`${API_URL}/api/scorecard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text, candidate_name, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to extract scorecard");
  }

  return response.json();
}

// Get Scorecards
export async function getScorecards(
  filters: {
    candidate_name?: string;
    hire_recommendation?: string;
    role?: string;
    page?: number;
  } = {},
): Promise<ScorecardsResponse> {
  const params = new URLSearchParams();
  if (filters.candidate_name)
    params.append("candidate_name", filters.candidate_name);
  if (filters.hire_recommendation && filters.hire_recommendation !== "All")
    params.append("hire_recommendation", filters.hire_recommendation);
  if (filters.role) params.append("role", filters.role);
  if (filters.page) params.append("page", String(filters.page));

  const response = await fetch(
    `${API_URL}/api/scorecards?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch scorecards");
  }

  return response.json();
}

// Delete Scorecard
export async function deleteScorecard(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/scorecards/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete scorecard");
  }
}
