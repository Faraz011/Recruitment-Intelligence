# JD Structura - Testing Guide

This guide walks you through testing all features of the application.

---

## Prerequisites

✅ Backend running on `http://localhost:8000`
✅ Frontend running on `http://localhost:3000`
✅ Supabase tables created
✅ Environment variables set (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)

---

## Test 1: Single JD Extraction

### Steps

1. Open http://localhost:3000
2. Go to **Home** page
3. Click **"Single JD"** tab
4. Paste this sample JD into the textarea:

```
Senior Backend Engineer - Remote

We're hiring a Senior Backend Engineer to lead our platform infrastructure.

Requirements:
- 8+ years experience with Python or Go
- Expert in microservices architecture
- PostgreSQL and Redis experience
- System design expertise

Compensation: $150,000 - $200,000/year
Location: Remote (US/EU)
Employment: Full-time
```

5. Leave source URL empty (optional)
6. Click **"Extract JD"**

### Expected Result

✅ Card appears with:

- Role: "Senior Backend Engineer"
- Company: (Not mentioned)
- Location: "Remote"
- Seniority: "Senior"
- Employment Type: "Full-time"
- Remote Type: "Remote"
- Skills: Python/Go, Microservices, PostgreSQL, Redis badges
- Salary: "USD 150,000 — 200,000 / year"
- Experience: "8 - Not mentioned"

---

## Test 2: Batch Upload

### Steps

1. On **Home** page, click **"Batch Upload CSV"** tab
2. Click **"Download Sample"** button
3. Open the downloaded CSV file (opens in text editor)
4. Replace content with:

```csv
raw_text,source_url
"Frontend Engineer - React specialist needed for fintech startup. 5+ years required. Salary: €80,000-120,000. Remote or Berlin office.","https://example.com/job/1"
"DevOps Engineer - Kubernetes expert wanted. Infrastructure-as-code. 6+ years. Salary: $120,000-160,000. Contract position.","https://example.com/job/2"
```

5. Save as CSV
6. Upload the file on the Batch Upload page
7. Monitor progress bar
8. Wait for completion

### Expected Result

✅ Results show:

- Succeeded: 2
- Failed: 0
- Skipped: 0
  ✅ Success toast notification appears

---

## Test 3: Dashboard - Job Listings

### Steps

1. Click **"Dashboard"** link
2. Ensure on **"Job Listings"** tab
3. Check stats bar:
   - Total JDs: Should show count from previous extractions
   - Unique Roles: Should show count distinct roles
   - Unique Companies: Should show count

4. Try each filter:
   - Enter **"Backend"** in search → Table filters to Backend roles
   - Select **"Senior"** in Seniority dropdown → Filters to Senior roles
   - Select **"Remote"** in Remote Type dropdown → Filters to Remote jobs
   - Clear filters with **"All Levels"** / **"All Types"** dropdowns

5. Click **"Export to CSV"** → File downloads
6. Verify CSV has columns: Role, Company, Location, Seniority, Remote Type, Skills, Salary Min/Max, Currency

### Expected Result

✅ Filters work correctly
✅ Table updates in real-time
✅ Pagination works (if > 20 records)
✅ CSV export is valid and contains data

---

## Test 4: Dashboard - Delete Listing

### Steps

1. On Dashboard → Job Listings tab
2. Find any row in table
3. Click **Delete** (trash icon) in that row
4. Confirm deletion dialog
5. Watch row disappear

### Expected Result

✅ Row deleted from table
✅ Toast says "Listing deleted"
✅ Total count decreases by 1

---

## Test 5: Interview Scorecard Extraction

### Steps

1. Go back to **Home** page
2. Click **"Interview Scorecard"** tab
3. Fill in:
   - **Interview Feedback**:

```
I interviewed Alex for the Senior Engineer role today. Really impressive technical knowledge. Solved the system design problem quickly and asked great questions. Communication was clear but could improve on explaining trade-offs. Strong cultural fit, very interested in the role. I'd recommend moving forward with an offer.
```

- **Candidate Name**: Alex Smith
- **Role**: Senior Engineer

4. Click **"Extract Scorecard"**

### Expected Result

✅ Scorecard card appears with:

- Candidate Name: "Alex Smith"
- Role: "Senior Engineer"
- Overall Rating: 4 or 5 stars (visual)
- Hire Recommendation: "Strong Yes" or "Yes" (colored badge)
- Technical Score: Progress bar showing 4/5
- Communication Score: Progress bar
- Culture Fit Score: Progress bar
- Strengths: Green badges (e.g., "Technical Knowledge", "Problem Solving")
- Weaknesses: Red badges (e.g., "Communication Trade-offs")
- Summary: 2-3 sentence blockquote

---

## Test 6: Dashboard - Interview Scorecards

### Steps

1. Go to Dashboard
2. Click **"Interview Scorecards"** tab
3. Check stats:
   - Total Scorecards
   - Avg. Rating (should be ~4.0 from previous tests)
   - Hire Rate (%)

4. Try filters:
   - Enter **"Strong"** in Hire Recommendation → Shows only Strong Yes/Strong No
   - Enter **"Alex"** in search → Shows only Alex's records

5. Click **"Export to CSV"** → Downloads scorecard data

### Expected Result

✅ Filters work dynamically
✅ Table shows all scorecard data
✅ CSV export has correct columns

---

## Test 7: API Health Check

### Steps

Open in browser or curl:

```bash
curl http://localhost:8000/
```

### Expected Result

```json
{ "status": "ok" }
```

---

## Test 8: Error Handling

### Steps

1. Try these error scenarios:

**Test 8a: Empty text extraction**

- Go to Single JD tab
- Click Extract without entering text
- Expected: Toast error "Please enter a job description"

**Test 8b: Invalid CSV**

- Go to Batch Upload
- Upload a `.txt` file instead of CSV
- Expected: Error "File must be a CSV"

**Test 8c: Malformed CSV**

- Go to Batch Upload
- Upload CSV without "raw_text" column
- Expected: Error "CSV must have 'raw_text' column"

### Expected Result

✅ All errors handled gracefully with toast notifications

---

## Test 9: Pagination

### Steps

1. Dashboard → Job Listings
2. If > 20 records exist:
   - Click **"Next"** button
   - Verify new page shows different records
   - Click **"Previous"** to go back
   - Verify page number updates

### Expected Result

✅ Pagination works correctly (20 records per page)
✅ Previous/Next buttons enable/disable appropriately

---

## Test 10: Loading States

### Steps

1. Extract a JD (Step 1)
2. While extracting, verify:
   - Button shows "Extracting..." (disabled)
   - No double-submission possible

### Expected Result

✅ Button is disabled during API call
✅ Visual feedback shows loading state

---

## Test 11: Web Scraper (Optional)

### Steps

1. Open terminal
2. Navigate to scripts folder:
   ```bash
   cd scripts
   pip install -r requirements.txt
   python scrape_jds.py
   ```
3. Wait for completion
4. Check outputs:
   - `../public/sample_jds.csv` (should have 25+ rows)
   - `./scrape_report.txt` (summary of scraping)

### Expected Result

✅ CSV created with job descriptions
✅ Report shows number of JDs fetched
✅ No errors in console

---

## Test 12: Mobile Responsiveness

### Steps

1. Open http://localhost:3000
2. Press F12 (DevTools)
3. Click device icon (mobile view)
4. Test at:
   - 375px (iPhone SE)
   - 768px (iPad)
   - 1920px (Desktop)

### Expected Result

✅ Layout responsive at all sizes
✅ Tables have horizontal scroll on mobile
✅ Buttons remain clickable
✅ Text readable without zooming

---

## Performance Tests

### Test 13: Dashboard Load Time

1. Dashboard with 100 records
2. Filters should apply in < 500ms
3. Page change should be instant

### Test 14: Batch Upload Speed

1. Upload CSV with 25 records
2. Should complete in 30-60 seconds (depends on Gemini API)

---

## End-to-End Flow Test

Complete workflow from scratch:

1. ✅ Extract 1 JD (Single page)
2. ✅ View extracted JD in Dashboard
3. ✅ Filter by extracted data
4. ✅ Export to CSV
5. ✅ Delete a record
6. ✅ Extract Interview Scorecard
7. ✅ View scorecard in Dashboard
8. ✅ Export scorecard data
9. ✅ Delete scorecard

---

## Troubleshooting Tests

| Issue                  | Test                                               |
| ---------------------- | -------------------------------------------------- |
| "Failed to extract JD" | Check `GEMINI_API_KEY` in backend/.env             |
| "Connection refused"   | Verify backend is running on port 8000             |
| "No data in dashboard" | Run a batch upload or single extraction first      |
| "Database error"       | Verify tables created in Supabase                  |
| UI buttons are slow    | Check network tab in DevTools (Gemini API latency) |

---

## Success Criteria Checklist

- [ ] Single JD extraction works
- [ ] Batch CSV upload works
- [ ] Dashboard displays data
- [ ] Filters and pagination work
- [ ] Delete actions work with confirmation
- [ ] CSV export downloads correctly
- [ ] Interview scorecard extraction works
- [ ] Loading states show during API calls
- [ ] Error messages display via toast
- [ ] Mobile responsive layout works
- [ ] API health check responds
- [ ] Web scraper generates CSV

---

If all tests pass ✅ — Your application is ready for production deployment!

For issues, check:

1. Console logs (browser DevTools)
2. Backend logs (terminal running FastAPI)
3. Supabase dashboard for data
4. Network tab in DevTools for API errors
