import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { differenceInHours } from 'date-fns';
import { parseGitHubRepoURL } from '../utils/gitUtils';
import { info, debug, error } from '../utils/logger'; // Import logger functions

// Load environment variables from .env
dotenv.config();

// Access the GITHUB_TOKEN without the '$' prefix
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  error('Missing GitHub API token in environment variables');
  process.exit(1);
}

const repoURL: string = 'https://github.com/raoakanksh/461project.git'

// Define the GitHub repo details
const parsed = parseGitHubRepoURL(repoURL);

// Define maximum expected values for normalization
const MAX_UNIQUE_CONTRIBUTORS: number = 100; // Example max contributors
const MAX_TOTAL_TESTS: number = 1000; // Example max CI/CD tests
const MAX_TOTAL_PRS: number = 500; // Example max pull requests
const MAX_TOTAL_ISSUES: number = 500; // Example max issues (open + closed)

// Define interfaces for different GitHub API responses (No change needed here)

// Helper function to fetch paginated data
async function fetchPaginatedData<T>(url: string, params: FetchParams = {}): Promise<T[]> {
  let results: T[] = [];
  let page: number = 1;
  let hasMorePages: boolean = true;

  try {
    while (hasMorePages) {
      debug(`Fetching data from: ${url}, page: ${page}`);
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
  } catch (err) {
    error(`Error fetching paginated data from ${url}: ${(err as Error).message}`);
    throw err; // Re-throw the error after logging
  }

  return results;
}

// Function to fetch metrics and calculate the metric score
export async function getMetricScore(owner: string, repo: string): Promise<void> {
  try {
    // Fetch contributors (with pagination)
    const contributors: Contributor[] = await fetchPaginatedData<Contributor>(
      `https://api.github.com/repos/${owner}/${repo}/contributors`
    );
    const uniqueContributors: number = contributors.length;
    info(`Total Unique Contributors: ${uniqueContributors}`);

    // Fetch CI/CD workflow runs (with pagination)
    const workflowRuns: WorkflowRun[] = await fetchPaginatedData<WorkflowRun>(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs`
    );
    const totalTests: number = workflowRuns.length;
    info(`Total CI/CD Tests: ${totalTests}`);

    // Fetch pull requests (with pagination)
    const pullRequests: PullRequest[] = await fetchPaginatedData<PullRequest>(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        state: 'all',
      }
    );
    const totalPRs: number = pullRequests.length;
    info(`Total Pull Requests: ${totalPRs}`);

    // Fetch issues (with pagination)
    const issues: Issue[] = await fetchPaginatedData<Issue>(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        state: 'all',
      }
    );
    const openIssues: number = issues.filter((issue) => issue.state === 'open').length;
    const closedIssues: number = issues.filter((issue) => issue.state === 'closed').length;
    info(`Open Issues: ${openIssues}`);
    info(`Closed Issues: ${closedIssues}`);

    // Calculate average response time for issues and PRs (in hours)
    let totalResponseTime: number = 0;
    let totalResponses: number = 0;

    // Combine issues and pull requests for response time calculation
    const combinedItems: Array<Issue | PullRequest> = [...issues, ...pullRequests];

    combinedItems.forEach((item) => {
      if (item.created_at && item.updated_at) {
        const createdAt: Date = new Date(item.created_at);
        const updatedAt: Date = new Date(item.updated_at);
        const responseTime: number = differenceInHours(updatedAt, createdAt);
        totalResponseTime += responseTime;
        totalResponses++;
      }
    });

    const activityScore: number =
      uniqueContributors > MAX_UNIQUE_CONTRIBUTORS ? 0.4 : (uniqueContributors / MAX_UNIQUE_CONTRIBUTORS) * 0.4; // 40% weight for contributors
    const ciCdScore: number =
      totalTests > MAX_TOTAL_TESTS ? 0.2 : (totalTests / MAX_TOTAL_TESTS) * 0.2; // 20% weight for CI/CD tests
    const prScore: number =
      totalPRs > MAX_TOTAL_PRS ? 0.1 : (totalPRs / MAX_TOTAL_PRS) * 0.1; // 10% weight for pull requests
    const issueScore: number =
      (closedIssues + openIssues) > MAX_TOTAL_ISSUES ? 0.2 : ((closedIssues + openIssues) / MAX_TOTAL_ISSUES) * 0.3; // 30% weight for issues (open + closed)

    // Calculate the final metric score
    let metricScore: number = activityScore + ciCdScore + prScore + issueScore;

    // Ensure metricScore is capped at 1
    if (metricScore > 1) {
      metricScore = 1;
    }
    info(`Metric Score: ${metricScore.toFixed(2)}`);
  } catch (err) {
    error('Error fetching data from GitHub:', err);
  }
}
