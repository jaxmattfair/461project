import axios from 'axios';
import * as dotenv from 'dotenv';
import { differenceInHours } from 'date-fns';
import { parseGitHubRepoURL } from '../utils/gitUtils';
// Load environment variables from .env
dotenv.config();
// Access the GITHUB_TOKEN without the '$' prefix
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error('Missing GitHub API token in environment variables');
    process.exit(1);
}
const repoURL = 'https://github.com/raoakanksh/461project.git';
// Define the GitHub repo details
const parsed = parseGitHubRepoURL(repoURL);
const owner = 'raoakanksh'; // Your GitHub username
const repo = '461project'; // Your repository name
// Define maximum expected values for normalization
const MAX_UNIQUE_CONTRIBUTORS = 100; // Example max contributors
const MAX_TOTAL_TESTS = 1000; // Example max CI/CD tests
const MAX_TOTAL_PRS = 500; // Example max pull requests
const MAX_TOTAL_ISSUES = 500; // Example max issues (open + closed)
// Helper function to fetch paginated data
export async function fetchPaginatedData(url, params = {}) {
    let results = [];
    let page = 1;
    let hasMorePages = true;
    try {
        while (hasMorePages) {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/vnd.github.v3+json',
                },
                params: { ...params, page, per_page: 100 }, // 100 is the maximum allowed by GitHub
            });
            const data = response.data;
            results = results.concat(data);
            page += 1;
            hasMorePages = data.length > 0; // If we get an empty array, we're done
        }
    }
    catch (error) {
        console.error(`Error fetching paginated data from ${url}:`, error);
        throw error; // Re-throw the error after logging
    }
    return results;
}
// Function to fetch metrics and calculate the metric score
export async function getMetricScore() {
    try {
        // Fetch all data in parallel
        const [contributors, workflowRuns, pullRequests, issues] = await Promise.all([
            fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/contributors`),
            fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/actions/runs`),
            fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/pulls`, { state: 'all' }),
            fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/issues`, { state: 'all' }),
        ]);
        const uniqueContributors = contributors.length;
        console.log(`Total Unique Contributors: ${uniqueContributors}`);
        const totalTests = workflowRuns.length;
        console.log(`Total CI/CD Tests: ${totalTests}`);
        const totalPRs = pullRequests.length;
        console.log(`Total Pull Requests: ${totalPRs}`);
        const openIssues = issues.filter((issue) => issue.state === 'open').length;
        const closedIssues = issues.filter((issue) => issue.state === 'closed').length;
        console.log(`Open Issues: ${openIssues}`);
        console.log(`Closed Issues: ${closedIssues}`);
        // Calculate average response time for issues and PRs (in hours)
        let totalResponseTime = 0;
        let totalResponses = 0;
        // Combine issues and pull requests for response time calculation
        const combinedItems = [...issues, ...pullRequests];
        combinedItems.forEach((item) => {
            if (item.created_at && item.updated_at) {
                const createdAt = new Date(item.created_at);
                const updatedAt = new Date(item.updated_at);
                const responseTime = differenceInHours(updatedAt, createdAt);
                totalResponseTime += responseTime;
                totalResponses++;
            }
        });
        const activityScore = uniqueContributors > MAX_UNIQUE_CONTRIBUTORS ? 0.4 : (uniqueContributors / MAX_UNIQUE_CONTRIBUTORS) * 0.4;
        const ciCdScore = totalTests > MAX_TOTAL_TESTS ? 0.2 : (totalTests / MAX_TOTAL_TESTS) * 0.2;
        const prScore = totalPRs > MAX_TOTAL_PRS ? 0.1 : (totalPRs / MAX_TOTAL_PRS) * 0.1;
        const issueScore = (closedIssues + openIssues) > MAX_TOTAL_ISSUES ? 0.2 : ((closedIssues + openIssues) / MAX_TOTAL_ISSUES) * 0.3;
        // Calculate the final metric score
        let metricScore = activityScore + ciCdScore + prScore + issueScore;
        // Ensure metricScore is capped at 1
        if (metricScore > 1) {
            metricScore = 1;
        }
        console.log(`Metric Score: ${metricScore.toFixed(2)}`);
    }
    catch (error) {
        console.error('Error fetching data from GitHub:', error);
    }
}
// Call the function to fetch and calculate the metric score
getMetricScore();
