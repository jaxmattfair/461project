import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { calculateResponsiveness } from '../src/metrics/yourFile'; // Adjust the path accordingly
import { info, debug, error } from '../logger'; // Adjust the import path if necessary

// Mocking logger functions
jest.mock('../logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

// Create a new mock instance
const mock = new MockAdapter(axios);

describe('calculateResponsiveness', () => {
  const repoURL = 'https://github.com/test/repo';
  const owner = 'test-owner';
  const repo = 'test-repo';

  afterEach(() => {
    mock.reset(); // Reset mock adapter after each test
    jest.clearAllMocks(); // Clear mock functions
  });

  test('should calculate responsiveness correctly with valid data', async () => {
    // Mocking API responses
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/issues`).reply(200, [
      { created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-02T00:00:00Z' },
      { created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-03T00:00:00Z' },
    ]);
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/pulls`).reply(200, [
      { created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-02T12:00:00Z' },
      { created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-04T00:00:00Z' },
    ]);

    const [responsiveScore, duration] = await calculateResponsiveness(repoURL);

    expect(responsiveScore).toBeCloseTo(0.5, 2); // Adjust expected value based on logic
    expect(duration).toBeGreaterThan(0);
    expect(info).toHaveBeenCalledWith(expect.stringContaining('Calculating responsiveness for repository:'));
    expect(info).toHaveBeenCalledWith(expect.stringContaining('Responsive Score:'));
  });

  test('should handle API error gracefully', async () => {
    // Mock an error response for issues API call
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/issues`).reply(500);

    const [responsiveScore, duration] = await calculateResponsiveness(repoURL);

    expect(responsiveScore).toBe(-1);
    expect(duration).toBe(-1);
    expect(error).toHaveBeenCalledWith('Error calculating responsiveness:', expect.any(Error));
  });

  test('should handle empty API responses correctly', async () => {
    // Mock empty responses
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/issues`).reply(200, []);
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/pulls`).reply(200, []);

    const [responsiveScore, duration] = await calculateResponsiveness(repoURL);

    expect(responsiveScore).toBe(0);
    expect(duration).toBeGreaterThan(0);
    expect(info).toHaveBeenCalledWith('Average Issue Response Time: 168.00 hours');
    expect(info).toHaveBeenCalledWith('Average Pull Request Response Time: 168.00 hours');
  });

  test('should calculate responsiveness when there are no closed issues or PRs', async () => {
    // Mock responses without any closed dates
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/issues`).reply(200, [{ created_at: '2023-09-01T00:00:00Z' }]);
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/pulls`).reply(200, [{ created_at: '2023-09-01T00:00:00Z' }]);

    const [responsiveScore, duration] = await calculateResponsiveness(repoURL);

    expect(responsiveScore).toBe(1); // Assuming no closed PRs/issues implies instant responsiveness
    expect(duration).toBeGreaterThan(0);
  });

  test('should handle multiple pages of issues and PRs correctly', async () => {
    // Mock multiple pages of data for issues
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/issues`, { params: { state: 'closed', per_page: 100, page: 1 } })
      .reply(200, Array(100).fill({ created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-02T00:00:00Z' }));
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/issues`, { params: { state: 'closed', per_page: 100, page: 2 } })
      .reply(200, []);

    // Mock multiple pages of data for PRs
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/pulls`, { params: { state: 'closed', per_page: 100, page: 1 } })
      .reply(200, Array(100).fill({ created_at: '2023-09-01T00:00:00Z', closed_at: '2023-09-02T00:00:00Z' }));
    mock.onGet(`https://api.github.com/repos/${owner}/${repo}/pulls`, { params: { state: 'closed', per_page: 100, page: 2 } })
      .reply(200, []);

    const [responsiveScore, duration] = await calculateResponsiveness(repoURL);

    expect(responsiveScore).toBeCloseTo(1, 2); // Adjust as needed
    expect(duration).toBeGreaterThan(0);
  });
});
