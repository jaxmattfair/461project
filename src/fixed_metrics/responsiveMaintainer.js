import axios from 'axios';
import * as dotenv from 'dotenv';
import { parseGitHubRepoURL } from '../utils/gitUtils.js';
import { info, debug, error } from '../logger.js'; // Import the logging functions

dotenv.config();

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
axios.defaults.headers.common['Authorization'] = `token ${GITHUB_TOKEN}`;
axios.defaults.headers.common['Accept'] = 'application/vnd.github.v3+json';

// Constants for normalization
const MAX_RESPONSE_TIME_HOURS = 168; // 1 week

// Function to calculate the time difference in hours
const calculateTimeDifferenceInHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60); // Convert milliseconds to hours
};

// Function to fetch all closed issues with pagination
const fetchAllClosedIssues = async (owner, repo) => {
    let issues = [];
    let page = 1;
    const perPage = 100;
    
    info(`Fetching all closed issues for ${owner}/${repo}...`);
    while (true) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                params: {
                    state: 'closed',
                    per_page: perPage,
                    page: page,
                },
            });
            const data = response.data;
            if (data.length === 0) {
                break;
            }
            // Filter out pull requests (they have the 'pull_request' key)
            const onlyIssues = data.filter((issue) => !issue.pull_request);
            issues = issues.concat(onlyIssues);

            debug(`Fetched page ${page} with ${onlyIssues.length} issues.`);
            if (data.length < perPage) {
                break;
            }
            page += 1;
        } catch (err) {
            error(`Error fetching closed issues from page ${page} for ${owner}/${repo}:`, err);
            break;
        }
    }

    info(`Total closed issues fetched: ${issues.length}`);
    return issues;
};

// Function to fetch all closed pull requests with pagination
const fetchAllClosedPullRequests = async (owner, repo) => {
    let pullRequests = [];
    let page = 1;
    const perPage = 100;

    info(`Fetching all closed pull requests for ${owner}/${repo}...`);
    while (true) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
                params: {
                    state: 'closed',
                    per_page: perPage,
                    page: page,
                },
            });
            const data = response.data;
            if (data.length === 0) {
                break;
            }
            pullRequests = pullRequests.concat(data);

            debug(`Fetched page ${page} with ${data.length} pull requests.`);
            if (data.length < perPage) {
                break;
            }
            page += 1;
        } catch (err) {
            error(`Error fetching closed pull requests from page ${page} for ${owner}/${repo}:`, err);
            break;
        }
    }

    info(`Total closed pull requests fetched: ${pullRequests.length}`);
    return pullRequests;
};

// Function to compute average response time
const computeAverageResponseTime = (responseTimes) => {
    if (responseTimes.length === 0) return MAX_RESPONSE_TIME_HOURS;
    const sum = responseTimes.reduce((acc, val) => acc + val, 0);
    return sum / responseTimes.length;
};

// Function to normalize the average response time to [0,1]
const normalizeResponseTime = (avgResponseTime) => {
    const normalized = 1 - Math.min(avgResponseTime / MAX_RESPONSE_TIME_HOURS, 1);
    return parseFloat(normalized.toFixed(2)); // Round to two decimal places
};

// Main function to calculate responsiveness
export const calculateResponsiveness = async (repoURL) => {
    const start = Date.now();
    info(`Calculating responsiveness for repository: ${repoURL}`);

    try {
        const parsed = parseGitHubRepoURL(repoURL);
        const owner = parsed.owner;
        const repo = parsed.repo;

        // Fetch issues and pull requests concurrently
        const [issues, pullRequests] = await Promise.all([
            fetchAllClosedIssues(owner, repo),
            fetchAllClosedPullRequests(owner, repo)
        ]);

        debug(`Fetched ${issues.length} closed issues.`);
        debug(`Fetched ${pullRequests.length} closed pull requests.`);

        // Calculate response times for issues
        const issueResponseTimes = issues
            .filter(issue => issue.created_at && issue.closed_at)
            .map(issue => calculateTimeDifferenceInHours(issue.created_at, issue.closed_at));

        // Calculate response times for pull requests
        const prResponseTimes = pullRequests
            .filter(pr => pr.created_at && pr.closed_at)
            .map(pr => calculateTimeDifferenceInHours(pr.created_at, pr.closed_at));

        // Compute average response times
        const avgIssueResponseTime = computeAverageResponseTime(issueResponseTimes);
        const avgPRResponseTime = computeAverageResponseTime(prResponseTimes);

        // Compute overall average response time
        const overallAvgResponseTime = (avgIssueResponseTime + avgPRResponseTime) / 2;

        // Normalize to [0,1]
        const responsiveScore = normalizeResponseTime(overallAvgResponseTime);

        // Logging the results
        info(`Average Issue Response Time: ${avgIssueResponseTime.toFixed(2)} hours`);
        info(`Average Pull Request Response Time: ${avgPRResponseTime.toFixed(2)} hours`);
        info(`Overall Average Response Time: ${overallAvgResponseTime.toFixed(2)} hours`);
        info(`Responsive Score: ${responsiveScore} / 1`);

        const end = Date.now();
        const duration = (end - start) / 1000;
        return [responsiveScore, duration];
    } catch (err) {
        error('Error calculating responsiveness:', err);
    }

    return [-1, -1];
};
