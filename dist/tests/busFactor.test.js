// tests/metrics.test.ts
import { getMetricScore } from '../src/metrics/busFactorScore'; // Adjust the path as needed
import axios from 'axios';
// Mock Axios
jest.mock('axios');
const mockedAxios = axios;
describe('getMetricScore', () => {
    const owner = 'testowner';
    const repo = 'testrepo';
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });
    it('should return a metric score and duration when API calls are successful', async () => {
        // Mock data for contributors
        const contributorsMock = [
            { id: 1, login: 'user1' },
            { id: 2, login: 'user2' },
        ];
        // Mock data for workflow runs
        const workflowRunsMock = [{ id: 101 }, { id: 102 }, { id: 103 }];
        // Mock data for pull requests
        const pullRequestsMock = [
            { id: 201, state: 'open', created_at: '', updated_at: '' },
            { id: 202, state: 'closed', created_at: '', updated_at: '' },
        ];
        // Mock data for issues
        const issuesMock = [
            { id: 301, state: 'open', created_at: '', updated_at: '' },
            { id: 302, state: 'closed', created_at: '', updated_at: '' },
            { id: 303, state: 'closed', created_at: '', updated_at: '' },
        ];
        // Set up Axios mocks
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('/contributors')) {
                return Promise.resolve({ data: contributorsMock });
            }
            else if (url.includes('/actions/runs')) {
                return Promise.resolve({ data: { workflow_runs: workflowRunsMock } });
            }
            else if (url.includes('/pulls')) {
                return Promise.resolve({ data: pullRequestsMock });
            }
            else if (url.includes('/issues')) {
                return Promise.resolve({ data: issuesMock });
            }
            else {
                return Promise.reject(new Error('Unknown URL'));
            }
        });
        const [metricScore, duration] = await getMetricScore(owner, repo);
        expect(metricScore).toBeGreaterThan(0);
        expect(metricScore).toBeLessThanOrEqual(1);
        expect(duration).toBeGreaterThanOrEqual(0);
        expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    });
    it('should handle API errors gracefully and return [-1, -1]', async () => {
        // Mock Axios to throw an error
        mockedAxios.get.mockRejectedValue(new Error('API Error'));
        const [metricScore, duration] = await getMetricScore(owner, repo);
        expect(metricScore).toBe(-1);
        expect(duration).toBe(-1);
        expect(mockedAxios.get).toHaveBeenCalled();
    });
    it('should cap the metric score at 1', async () => {
        // Mock data exceeding maximums
        const contributorsMock = new Array(150).fill({ id: 1, login: 'user' });
        const workflowRunsMock = new Array(2000).fill({ id: 1 });
        const pullRequestsMock = new Array(600).fill({ id: 1, state: 'open', created_at: '', updated_at: '' });
        const issuesMock = new Array(700).fill({ id: 1, state: 'closed', created_at: '', updated_at: '' });
        // Set up Axios mocks
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('/contributors')) {
                return Promise.resolve({ data: contributorsMock });
            }
            else if (url.includes('/actions/runs')) {
                return Promise.resolve({ data: { workflow_runs: workflowRunsMock } });
            }
            else if (url.includes('/pulls')) {
                return Promise.resolve({ data: pullRequestsMock });
            }
            else if (url.includes('/issues')) {
                return Promise.resolve({ data: issuesMock });
            }
            else {
                return Promise.reject(new Error('Unknown URL'));
            }
        });
        const [metricScore, duration] = await getMetricScore(owner, repo);
        expect(metricScore).toBeLessThanOrEqual(1);
        expect(metricScore).toBe(1);
        expect(duration).toBeGreaterThanOrEqual(0);
    });
    it('should return a metric score of 0 when no data is returned', async () => {
        // Mock empty data
        const emptyMockData = [];
        // Set up Axios mocks
        mockedAxios.get.mockResolvedValue({ data: emptyMockData });
        const [metricScore, duration] = await getMetricScore(owner, repo);
        expect(metricScore).toBe(0);
        expect(duration).toBeGreaterThanOrEqual(0);
        expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    });
});
