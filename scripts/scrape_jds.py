"""
Job Description Scraper for JD Structura

This script collects job descriptions from two sources:
1. RemoteOK API (remote job listings)
2. Hacker News "Who's Hiring" threads (top comments)

The script:
- Fetches raw job descriptions
- Cleans HTML and normalizes text
- Deduplicates by source_url
- Outputs sample_jds.csv with columns: raw_text, source_url
- Outputs scrape_report.txt with summary statistics

Usage:
  cd scripts
  pip install -r requirements.txt
  python scrape_jds.py

Output:
  ../public/sample_jds.csv (use this in the UI for batch uploads)
  ./scrape_report.txt (summary of scraping results)
"""

import requests
import time
import csv
from datetime import datetime
from bs4 import BeautifulSoup
import os

# Configuration
REMOTEOK_API = "https://remoteok.com/api"
HN_ALGOLIA_API = "https://hn.algolia.com/api/v1/search"
REQUEST_DELAY = 1  # seconds

class JobScraper:
    def __init__(self):
        self.jobs = []
        self.errors = []
        self.seen_urls = set()
        self.scraped_count = 0
        self.start_time = datetime.now()
    
    def fetch_remoteok(self):
        """Fetch job listings from RemoteOK API."""
        print("Fetching from RemoteOK API...")
        try:
            response = requests.get(REMOTEOK_API, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # RemoteOK returns a list of job objects
            for idx, job in enumerate(data[:25]):  # Limit to 25
                try:
                    if isinstance(job, dict) and 'title' in job and 'description' in job:
                        url = job.get('url', '')
                        
                        # Skip duplicates
                        if url in self.seen_urls:
                            continue
                        
                        raw_text = self.clean_text(job['description'])
                        if raw_text:
                            self.jobs.append({
                                'raw_text': raw_text,
                                'source_url': url
                            })
                            self.seen_urls.add(url)
                            self.scraped_count += 1
                            print(f"  Fetched JD {self.scraped_count}: {job.get('title', 'Unknown')}")
                        
                        time.sleep(REQUEST_DELAY)
                except Exception as e:
                    error_msg = f"Error processing RemoteOK job: {str(e)}"
                    print(f"  {error_msg}")
                    self.errors.append(error_msg)
        
        except requests.RequestException as e:
            error_msg = f"RemoteOK API error: {str(e)}"
            print(f"  {error_msg}")
            self.errors.append(error_msg)
    
    def fetch_hn_who_is_hiring(self):
        """Fetch job postings from HN 'Who is Hiring' threads."""
        print("Fetching from Hacker News 'Who is Hiring'...")
        try:
            # Get the latest "Who's Hiring" story
            response = requests.get(
                HN_ALGOLIA_API,
                params={
                    'query': 'who is hiring',
                    'tags': 'story',
                    'hitsPerPage': 1
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('hits'):
                story_id = data['hits'][0]['objectID']
                
                # Get comments for that story
                comments_response = requests.get(
                    HN_ALGOLIA_API,
                    params={
                        'query': '',
                        'tags': f'story_{story_id}',
                        'hitsPerPage': 15
                    },
                    timeout=10
                )
                comments_response.raise_for_status()
                comments_data = comments_response.json()
                
                for idx, comment in enumerate(comments_data.get('hits', [])[:15]):
                    try:
                        if 'comment_text' in comment and comment['comment_text']:
                            raw_text = self.clean_text(comment['comment_text'])
                            if raw_text and len(raw_text) > 50:  # Filter very short comments
                                url = f"https://news.ycombinator.com/item?id={comment['objectID']}"
                                
                                if url not in self.seen_urls:
                                    self.jobs.append({
                                        'raw_text': raw_text,
                                        'source_url': url
                                    })
                                    self.seen_urls.add(url)
                                    self.scraped_count += 1
                                    print(f"  Fetched HN comment {idx + 1}/15")
                            
                            time.sleep(REQUEST_DELAY)
                    except Exception as e:
                        error_msg = f"Error processing HN comment: {str(e)}"
                        print(f"  {error_msg}")
                        self.errors.append(error_msg)
        
        except requests.RequestException as e:
            error_msg = f"HN API error: {str(e)}"
            print(f"  {error_msg}")
            self.errors.append(error_msg)
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text."""
        try:
            # Remove HTML tags
            soup = BeautifulSoup(text, 'html.parser')
            text = soup.get_text()
            
            # Normalize whitespace
            text = ' '.join(text.split())
            
            # Truncate to 3000 chars
            text = text[:3000]
            
            return text.strip()
        except Exception as e:
            print(f"Error cleaning text: {str(e)}")
            return ""
    
    def save_outputs(self, csv_path: str, report_path: str):
        """Save results to CSV and report files."""
        # Create output directory if needed
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        
        # Save CSV
        try:
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                if self.jobs:
                    writer = csv.DictWriter(f, fieldnames=['raw_text', 'source_url'])
                    writer.writeheader()
                    writer.writerows(self.jobs)
            print(f"\nCSV saved to: {csv_path}")
        except Exception as e:
            print(f"Error saving CSV: {str(e)}")
            self.errors.append(f"CSV save error: {str(e)}")
        
        # Save report
        try:
            elapsed = (datetime.now() - self.start_time).total_seconds()
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("JD Structura - Scraping Report\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"Timestamp: {self.start_time.isoformat()}\n")
                f.write(f"Duration: {elapsed:.2f}s\n")
                f.write(f"Total fetched: {self.scraped_count}\n")
                f.write(f"Total unique: {len(self.jobs)}\n")
                f.write(f"Errors: {len(self.errors)}\n\n")
                
                if self.errors:
                    f.write("Errors Log:\n")
                    for error in self.errors:
                        f.write(f"  - {error}\n")
            print(f"Report saved to: {report_path}")
        except Exception as e:
            print(f"Error saving report: {str(e)}")
    
    def run(self):
        """Execute the scraper."""
        print("\n" + "=" * 50)
        print("JD Structura - Job Description Scraper")
        print("=" * 50 + "\n")
        
        try:
            self.fetch_remoteok()
            time.sleep(REQUEST_DELAY)
            self.fetch_hn_who_is_hiring()
            
            # Save outputs (relative paths)
            script_dir = os.path.dirname(os.path.abspath(__file__))
            csv_path = os.path.join(script_dir, "..", "public", "sample_jds.csv")
            report_path = os.path.join(script_dir, "scrape_report.txt")
            
            self.save_outputs(csv_path, report_path)
            
            print("\n" + "=" * 50)
            print(f"Scraping completed. {len(self.jobs)} JDs collected.")
            print("=" * 50 + "\n")
        
        except Exception as e:
            print(f"\nCritical error during scraping: {str(e)}")
            self.errors.append(f"Critical error: {str(e)}")


if __name__ == "__main__":
    scraper = JobScraper()
    scraper.run()
