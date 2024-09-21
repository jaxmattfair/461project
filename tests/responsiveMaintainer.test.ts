// Utility to calculate the response time for an issue
export function calculateIssueResponseTime(issue) {
    const createdAt = new Date(issue.createdAt);
    const firstResponseAt = new Date(issue.firstResponseAt);
    const timeDiff = Math.abs(firstResponseAt - createdAt);
    const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Utility to calculate the time to merge a pull request
export function calculatePullRequestMergeTime(pullRequest) {
    const createdAt = new Date(pullRequest.createdAt);
    const mergedAt = new Date(pullRequest.mergedAt);
    const timeDiff = Math.abs(mergedAt - createdAt);
    const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return diffDays;
}


import { expect } from 'chai';
import sinon from 'sinon';
import * as metrics from '../src/metrics/responsiveMaintainer'; // Adjust the path based on your file structure

// Mock data
const issue = {
    createdAt: new Date('2023-09-01'),
    firstResponseAt: new Date('2023-09-03'), // Maintainer responded 2 days later
};

const pullRequest = {
    createdAt: new Date('2023-09-01'),
    mergedAt: new Date('2023-09-05'), // Maintainer merged PR after 4 days
};

// Test Case 1: Check the number of days to respond to an issue
describe('Responsive Maintainer - Issue Response Time', function () {
    it('should calculate the correct response time for an issue', function () {
        const responseTime = metrics.calculateIssueResponseTime(issue);
        expect(responseTime).to.equal(2); // 2 days to respond
    });
});

// Test Case 2: Check the number of days to merge a pull request
describe('Responsive Maintainer - Pull Request Merge Time', function () {
    it('should calculate the correct time to merge a pull request', function () {
        const mergeTime = metrics.calculatePullRequestMergeTime(pullRequest);
        expect(mergeTime).to.equal(4); // 4 days to merge
    });
}