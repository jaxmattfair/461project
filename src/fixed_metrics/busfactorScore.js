import axios from 'axios';
import * as dotenv from 'dotenv';
import { parseGitHubRepoURL } from '../utils/gitUtils.js';
import { info, debug, error } from '../logger.js'; // Import the logging functions

// Load environment variables from .env
dotenv.config();

// Access the GITHUB_TOKEN without the '$' prefix
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    error('Missing GitHub API token in environment variables');
    process.exit(1);
}

const repoURL = 'https://github.com/raoakanksh/461project.git';
// Define the GitHub repo details
const parsed = parseGitHubRepoURL(repoURL);

// Define maximum expected values for normalization
const MAX_UNIQUE_CONTRIBUTORS = 100; // Example max contributors
const MAX_TOTAL_TESTS = 1000; // Example max CI/CD tests
const MAX_TOTAL_PRS = 500; // Example max pull requests
const MAX_TOTAL_ISSUES = 500; // Example max issues (open + closed)

// Helper function to fetch paginated data
async function fetchPaginatedData(url, params = {}) {
    let results = [];
    let page = 1;
    let hasMorePages = true;

    try {
        while (hasMorePages) {
            debug(`Fetching page ${page} from ${url}`);
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/vnd.github.v3+json', // Ensure using the correct GitHub API version
                },
                params: { ...params, page, per_page: 100 }, // 100 is the maximum allowed by GitHub
            });
            const data = response.data;
            results = results.concat(data);
            page += 1;
            hasMorePages = data.length > 0; // If we get an empty array, we're done
        }
        info(`Successfully fetched data from ${url}`);
    } catch (err) {
        error(`Error fetching paginated data from ${url}`, err);
        throw err; // Re-throw the error after logging
    }

    return results;
}

// Function to fetch metrics and calculate the metric score
export async function getMetricScore(owner, repo) {
    const start = Date.now();
    try {
        info(`Starting to calculate metrics for ${owner}/${repo}`);
        
        // Fetch contributors (with pagination)
        const contributors = await fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/contributors`);
        const uniqueContributors = contributors.length;
        debug(`Total Unique Contributors: ${uniqueContributors}`);
        
        // Fetch CI/CD workflow runs (with pagination)
        const workflowRuns = await fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/actions/runs`);
        const totalTests = workflowRuns.length;
        debug(`Total CI/CD Tests: ${totalTests}`);
        
        // Fetch pull requests (with pagination)
        const pullRequests = await fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
            state: 'all',
        });
        const totalPRs = pullRequests.length;
        debug(`Total Pull Requests: ${totalPRs}`);
        
        // Fetch issues (with pagination)
        const issues = await fetchPaginatedData(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            state: 'all',
        });
        const openIssues = issues.filter((issue) => issue.state === 'open').length;
        const closedIssues = issues.filter((issue) => issue.state === 'closed').length;
        debug(`Open Issues: ${openIssues}`);
        debug(`Closed Issues: ${closedIssues}`);
        
        // Calculate the metric score
        const activityScore = uniqueContributors > MAX_UNIQUE_CONTRIBUTORS ? 0.4 : (uniqueContributors / MAX_UNIQUE_CONTRIBUTORS) * 0.4; // 40% weight for contributors
        const ciCdScore = totalTests > MAX_TOTAL_TESTS ? 0.2 : (totalTests / MAX_TOTAL_TESTS) * 0.2; // 20% weight for CI/CD tests
        const prScore = totalPRs > MAX_TOTAL_PRS ? 0.1 : (totalPRs / MAX_TOTAL_PRS) * 0.1; // 10% weight for pull requests
        const issueScore = (closedIssues + openIssues) > MAX_TOTAL_ISSUES ? 0.2 : ((closedIssues + openIssues) / MAX_TOTAL_ISSUES) * 0.3; // 30% weight for issues (open + closed)

        let metricScore = activityScore + ciCdScore + prScore + issueScore;
        metricScore = Math.min(metricScore, 1); // Ensure metricScore is capped at 1
        
        const end = Date.now();
        const duration = (end - start) / 1000; // Calculate duration in seconds
        info(`Metric Score for ${owner}/${repo}: ${metricScore.toFixed(2)} (Calculated in ${duration} seconds)`);
        
        return [metricScore, duration];
    } catch (err) {
        error('Error fetching data from GitHub:', err);
        return [-1, -1];
    }
}
