import axios from 'axios';

// Set GitHub token, repo owner, and repo name (these could be passed in via environment variables or as function arguments)
const GITHUB_TOKEN = 'your-github-token';
const REPO_OWNER = 'your-repo-owner';
const REPO_NAME = 'your-repo-name';

axios.defaults.headers.common['Authorization'] = `token ${GITHUB_TOKEN}`;

// Function to calculate the time difference in hours
const calculateTimeDifferenceInHours = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60); // Convert milliseconds to hours
};

// Function to get response times for issues
export const getIssueResponseTimes = async (): Promise<void> => {
    try {
        const issuesResponse = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=closed`
        );
        const issues = issuesResponse.data;

        issues.forEach((issue: any) => {
            if (issue.created_at && issue.closed_at) {
                const responseTime = calculateTimeDifferenceInHours(issue.created_at, issue.closed_at);
                console.log(`Issue #${issue.number}: Response time = ${responseTime.toFixed(2)} hours`);
            }
        });
    } catch (error) {
        console.error('Error fetching issues:', error);
    }
};

// Function to get response times for pull requests
export const getPullRequestResponseTimes = async (): Promise<void> => {
    try {
        const prsResponse = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed`
        );
        const pullRequests = prsResponse.data;

        pullRequests.forEach((pr: any) => {
            if (pr.created_at && pr.closed_at) {
                const responseTime = calculateTimeDifferenceInHours(pr.created_at, pr.closed_at);
                console.log(`Pull Request #${pr.number}: Response time = ${responseTime.toFixed(2)} hours`);
            }
        });
    } catch (error) {
        console.error('Error fetching pull requests:', error);
    }
};
