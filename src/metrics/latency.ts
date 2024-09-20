import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { differenceInHours } from 'date-fns';
import { parseGitHubRepoURL } from '../utils/gitUtils';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Missing GitHub API token in environment variables');
  process.exit(1);
}

const repoURL: string = 'https://github.com/raoakanksh/461project.git';

const parsed = parseGitHubRepoURL(repoURL);
const owner: string = 'raoakanksh'; 
const repo: string = '461project'; 

const MAX_UNIQUE_CONTRIBUTORS: number = 100; // Example max contributors
const MAX_TOTAL_TESTS: number = 1000; // Example max CI/CD tests
const MAX_TOTAL_PRS: number = 500; // Example max pull requests
const MAX_TOTAL_ISSUES: number = 500; // Example max issues (open + closed)


interface Contributor {
  id: number;
  login: string;
}

interface WorkflowRun {
  id: number;
}

interface PullRequest {
  id: number;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
}

interface Issue {
  id: number;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

interface FetchParams {
  [key: string]: string | number | boolean;
}

export async function fetchPaginatedData<T>(url: string, params: FetchParams = {}): Promise<T[]> {
  let results: T[] = [];
  let page: number = 1;
  let hasMorePages: boolean = true;

  try {
    while (hasMorePages) {
      const response: AxiosResponse<T[]> = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        params: { ...params, page, per_page: 100 }, 
      });

      const data: T[] = response.data;
      results = results.concat(data);
      page += 1;
      hasMorePages = data.length > 0; 
    }
  } catch (error) {
    console.error(`Error fetching paginated data from ${url}:`, error);
    throw error; 
  }

  return results;
}

export async function getMetricScore(): Promise<void> {
  try {
    // Fetch all data in parallel
    const [contributors, workflowRuns, pullRequests, issues] = await Promise.all([
      fetchPaginatedData<Contributor>(`https://api.github.com/repos/${owner}/${repo}/contributors`),
      fetchPaginatedData<WorkflowRun>(`https://api.github.com/repos/${owner}/${repo}/actions/runs`),
      fetchPaginatedData<PullRequest>(`https://api.github.com/repos/${owner}/${repo}/pulls`, { state: 'all' }),
      fetchPaginatedData<Issue>(`https://api.github.com/repos/${owner}/${repo}/issues`, { state: 'all' }),
    ]);

    const uniqueContributors: number = contributors.length;
    console.log(`Total Unique Contributors: ${uniqueContributors}`);

    const totalTests: number = workflowRuns.length;
    console.log(`Total CI/CD Tests: ${totalTests}`);

    const totalPRs: number = pullRequests.length;
    console.log(`Total Pull Requests: ${totalPRs}`);

    const openIssues: number = issues.filter((issue) => issue.state === 'open').length;
    const closedIssues: number = issues.filter((issue) => issue.state === 'closed').length;
    console.log(`Open Issues: ${openIssues}`);
    console.log(`Closed Issues: ${closedIssues}`);

    let totalResponseTime: number = 0;
    let totalResponses: number = 0;

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
        uniqueContributors > MAX_UNIQUE_CONTRIBUTORS ? 0.4 : (uniqueContributors / MAX_UNIQUE_CONTRIBUTORS) * 0.4;
    const ciCdScore: number =
      totalTests > MAX_TOTAL_TESTS ? 0.2 : (totalTests / MAX_TOTAL_TESTS) * 0.2;
    const prScore: number =
      totalPRs > MAX_TOTAL_PRS ? 0.1 : (totalPRs / MAX_TOTAL_PRS) * 0.1;
    const issueScore: number =
      (closedIssues + openIssues) > MAX_TOTAL_ISSUES ? 0.2 : ((closedIssues + openIssues) / MAX_TOTAL_ISSUES) * 0.3;

    let metricScore: number = activityScore + ciCdScore + prScore + issueScore;

    if (metricScore > 1) {
      metricScore = 1;
    }
    console.log(`Metric Score: ${metricScore.toFixed(2)}`);
  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
  }
}

getMetricScore();
