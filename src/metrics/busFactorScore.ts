import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { differenceInHours } from 'date-fns';
import { parseGitHubRepoURL } from '../utils/gitUtils.js';

// Load environment variables from .env
dotenv.config();

// Access the GITHUB_TOKEN without the '$' prefix
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Missing GitHub API token in environment variables');
  process.exit(1);
}

const repoURL: string = 'https://github.com/raoakanksh/461project.git'

// Define the GitHub repo details
const parsed = parseGitHubRepoURL(repoURL);
//const owner: string = parsed.owner;
// const repo: string = parsed.repo;
//const owner: string = 'raoakanksh'; // Replace with the GitHub username
//const repo: string = '461project'; // Replace with the repository name

// Define maximum expected values for normalization
const MAX_UNIQUE_CONTRIBUTORS: number = 100; // Example max contributors
const MAX_TOTAL_TESTS: number = 1000; // Example max CI/CD tests
const MAX_TOTAL_PRS: number = 500; // Example max pull requests
const MAX_TOTAL_ISSUES: number = 500; // Example max issues (open + closed)

// Define interfaces for different GitHub API responses

// Contributor Interface
interface Contributor {
  id: number;
  login: string;
}

// Workflow Run Interface
interface WorkflowRun {
  id: number;
}

// Pull Request Interface
interface PullRequest {
  id: number;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
}

// Issue Interface
interface Issue {
  id: number;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

// Fetch Parameters Interface
interface FetchParams {
  [key: string]: string | number | boolean;
}

// Helper function to fetch paginated data
async function fetchPaginatedData<T>(url: string, params: FetchParams = {}): Promise<T[]> {
  let results: T[] = [];
  let page: number = 1;
  let hasMorePages: boolean = true;

  try {
    while (hasMorePages) {
      const response: AxiosResponse<T[]> = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json', // Ensure using the correct GitHub API version
        },
        params: { ...params, page, per_page: 100 }, // 100 is the maximum allowed by GitHub
      });

      const data: T[] = response.data;
      results = results.concat(data);
      page += 1;
      hasMorePages = data.length > 0; // If we get an empty array, we're done
    }
  } catch (error) {
    console.error(`Error fetching paginated data from ${url}:`, error);
    throw error; // Re-throw the error after logging
  }

  return results;
}

// Function to fetch metrics and calculate the metric score
export async function getMetricScore(owner: string, repo: string): Promise<[number, number]> {
  const start = Date.now(); 
  try {
    // Fetch contributors (with pagination)
    const contributors: Contributor[] = await fetchPaginatedData<Contributor>(
      `https://api.github.com/repos/${owner}/${repo}/contributors`
    );
    const uniqueContributors: number = contributors.length;
    //console.log(`Total Unique Contributors: ${uniqueContributors}`);

    // Fetch CI/CD workflow runs (with pagination)
    const workflowRuns: WorkflowRun[] = await fetchPaginatedData<WorkflowRun>(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs`
    );
    const totalTests: number = workflowRuns.length;
    //console.log(`Total CI/CD Tests: ${totalTests}`);

    // Fetch pull requests (with pagination)
    const pullRequests: PullRequest[] = await fetchPaginatedData<PullRequest>(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        state: 'all',
      }
    );
    const totalPRs: number = pullRequests.length;
    //console.log(`Total Pull Requests: ${totalPRs}`);

    // Fetch issues (with pagination)
    const issues: Issue[] = await fetchPaginatedData<Issue>(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        state: 'all',
      }
    );
    const openIssues: number = issues.filter((issue) => issue.state === 'open').length;
    const closedIssues: number = issues.filter((issue) => issue.state === 'closed').length;
    //console.log(`Open Issues: ${openIssues}`);
    //console.log(`Closed Issues: ${closedIssues}`);

    const activityScore: number =
        uniqueContributors > MAX_UNIQUE_CONTRIBUTORS ? 0.4 : (uniqueContributors / MAX_UNIQUE_CONTRIBUTORS) * 0.4; // 40% weight for contributors
    const ciCdScore: number =
      totalTests > MAX_TOTAL_TESTS ? 0.2 : (totalTests / MAX_TOTAL_TESTS) * 0.2; // 20% weight for CI/CD tests
    const prScore: number =
      totalPRs > MAX_TOTAL_PRS ? 0.1 : (totalPRs / MAX_TOTAL_PRS) * 0.1; // 10% weight for pull requests
    const issueScore: number =
      (closedIssues+openIssues) > MAX_TOTAL_ISSUES ? 0.2 : ((closedIssues+openIssues) / MAX_TOTAL_ISSUES) * 0.3; // 30% weight for issues (open + closed)

    // Calculate the final metric score
    let metricScore: number = activityScore + ciCdScore + prScore + issueScore

    // Ensure metricScore is capped at 1
    if (metricScore > 1) {
      metricScore = 1;
    }
    const end = Date.now();
    const duration = (end - start) / 1000; // Calculate duration in seconds
    //console.log(`Metric Score: ${metricScore.toFixed(2)}`);
    return [metricScore, duration];
  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
    return [-1, -1];
  }
}

