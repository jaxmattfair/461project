import axios from 'axios';
import * as dotenv from 'dotenv';
import { differenceInHours } from 'date-fns';

// Load environment variables from .env
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Missing GitHub API token in environment variables');
  process.exit(1);
}

// Define the GitHub repo details
const owner = 'raoakanksh'; // Replace with the GitHub username
const repo = '461project'; // Replace with the repository name

// Function to fetch metrics and calculate the metric score
async function getMetricScore() {
  try {
    // Fetch contributors
    const contributorsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const contributors = contributorsResponse.data;
    const uniqueContributors = contributors.length;
    console.log(`Total Unique Contributors: ${uniqueContributors}`);

    // Fetch CI/CD workflow runs
    const workflowRunsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const workflowRuns = workflowRunsResponse.data.workflow_runs;
    const totalTests = workflowRuns.length;
    console.log(`Total CI/CD Tests: ${totalTests}`);

    // Fetch pull requests
    const pullRequestsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const pullRequests = pullRequestsResponse.data;
    const totalPRs = pullRequests.length;
    console.log(`Total Pull Requests: ${totalPRs}`);

    // Fetch issues
    const issuesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=all`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const issues = issuesResponse.data;
    const openIssues = issues.filter((issue: any) => issue.state === 'open').length;
    const closedIssues = issues.filter((issue: any) => issue.state === 'closed').length;
    console.log(`Open Issues: ${openIssues}`);
    console.log(`Closed Issues: ${closedIssues}`);

    // Calculate average response time for issues and PRs (in hours)
    let totalResponseTime = 0;
    let totalResponses = 0;

    [...issues, ...pullRequests].forEach((item: any) => {
      if (item.created_at && item.updated_at) {
        const createdAt = new Date(item.created_at);
        const updatedAt = new Date(item.updated_at);
        const responseTime = differenceInHours(updatedAt, createdAt);
        totalResponseTime += responseTime;
        totalResponses++;
      }
    });

    const avgResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 0;
    console.log(`Average Response Time (hours): ${avgResponseTime.toFixed(2)}`);

    // Metric score setup
    const activityScore = uniqueContributors * 0.4; // 40% weight for contributors
    const ciCdScore = totalTests * 0.2; // 20% weight for CI/CD tests
    const prScore = totalPRs * 0.1; // 10% weight for pull requests
    const issueScore = (openIssues + closedIssues) * 0.2; // 20% weight for issues (open + closed)
    const responseTimeScore = (avgResponseTime > 0 && avgResponseTime < 48) ? 0.1 : 0.05; // 10% for good response times (<48 hours)

    const metricScore = activityScore + ciCdScore + prScore + issueScore + responseTimeScore;

    console.log(`Metric Score: ${metricScore.toFixed(2)}`);

  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
  }
}
