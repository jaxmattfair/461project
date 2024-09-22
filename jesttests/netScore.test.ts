import { calculateNetScore } from '../src/metrics/yourFile'; // Adjust the path accordingly
import { cloneRepository, getReadmeContent, parseGitHubRepoURL, parseMarkdown } from "../utils/gitUtils.js";
import { getMetricScore } from "./busfactorScore.js";
import { computeCorrectnessMetric } from "./correctnessScore.js";
import { extractLicenseInfo } from "./license.js";
import { calculateRampUpScore, analyzeReadme } from "./rampUpScore.js";
import { calculateResponsiveness } from "./responsiveMaintainer.js";
import { info, debug, error } from '../logger'; // Adjust the logger path if necessary

// Mock dependencies
jest.mock('../utils/gitUtils', () => ({
  cloneRepository: jest.fn(),
  getReadmeContent: jest.fn(),
  parseGitHubRepoURL: jest.fn(),
  parseMarkdown: jest.fn(),
}));
jest.mock('./busfactorScore', () => ({ getMetricScore: jest.fn() }));
jest.mock('./correctnessScore', () => ({ computeCorrectnessMetric: jest.fn() }));
jest.mock('./license', () => ({ extractLicenseInfo: jest.fn() }));
jest.mock('./rampUpScore', () => ({ calculateRampUpScore: jest.fn(), analyzeReadme: jest.fn() }));
jest.mock('./responsiveMaintainer', () => ({ calculateResponsiveness: jest.fn() }));
jest.mock('../logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

describe('calculateNetScore', () => {
  const repoURL = 'https://github.com/test/repo';
  const tempDir = '/fake/temp/dir';
  const tempURL = 'https://tempurl.com';

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('should calculate net score correctly with valid data', async () => {
    // Mocking functions
    cloneRepository.mockResolvedValue();
    getReadmeContent.mockReturnValue('README content');
    parseGitHubRepoURL.mockReturnValue({ owner: 'test-owner', repo: 'test-repo' });
    parseMarkdown.mockReturnValue('AST content');
    analyzeReadme.mockReturnValue({ sectionCount: 3 });
    calculateRampUpScore.mockReturnValue([0.8, 5]);
    getMetricScore.mockResolvedValue([0.7, 3]);
    extractLicenseInfo.mockResolvedValue([1, 2]);
    calculateResponsiveness.mockResolvedValue([0.6, 4]);
    computeCorrectnessMetric.mockResolvedValue([0.9, 6]);

    const result = await calculateNetScore(repoURL, tempDir, tempURL);

    expect(result.NetScore).toBeCloseTo(0.79, 2); // Adjust the expected value as per weights
    expect(result.RampUp).toBe(0.8);
    expect(result.Correctness).toBe(0.9);
    expect(result.BusFactor).toBe(0.7);
    expect(result.ResponsiveMaintainer).toBe(0.6);
    expect(result.License).toBe(1);

    expect(cloneRepository).toHaveBeenCalledWith(repoURL, tempDir);
    expect(info).toHaveBeenCalledWith('Starting NetScore calculation...');
    expect(info).toHaveBeenCalledWith('NetScore calculation completed successfully.');
  });

  test('should handle cloning error gracefully and return null', async () => {
    cloneRepository.mockRejectedValue(new Error('Cloning failed'));

    const result = await calculateNetScore(repoURL, tempDir, tempURL);

    expect(result).toBeNull();
    expect(error).toHaveBeenCalledWith("An error occurred during cloning:", expect.any(Error));
  });

  test('should handle missing README gracefully', async () => {
    cloneRepository.mockResolvedValue();
    getReadmeContent.mockReturnValue(null);
    parseGitHubRepoURL.mockReturnValue({ owner: 'test-owner', repo: 'test-repo' });
    getMetricScore.mockResolvedValue([0.7, 3]);
    extractLicenseInfo.mockResolvedValue([1, 2]);
    calculateResponsiveness.mockResolvedValue([0.6, 4]);
    computeCorrectnessMetric.mockResolvedValue([0.9, 6]);

    const result = await calculateNetScore(repoURL, tempDir, tempURL);

    expect(result.RampUp).toBe(0);
    expect(result.NetScore).toBeCloseTo(0.76, 2); // Adjust as per calculated values
    expect(info).toHaveBeenCalledWith('README not found. Skipping metrics that require README.');
  });

  test('should handle errors in other metric calculations gracefully', async () => {
    cloneRepository.mockResolvedValue();
    getReadmeContent.mockReturnValue('README content');
    parseGitHubRepoURL.mockReturnValue({ owner: 'test-owner', repo: 'test-repo' });
    parseMarkdown.mockReturnValue('AST content');
    analyzeReadme.mockReturnValue({ sectionCount: 3 });
    calculateRampUpScore.mockReturnValue([0.8, 5]);
    getMetricScore.mockRejectedValue(new Error('Metric calculation failed'));
    extractLicenseInfo.mockResolvedValue([1, 2]);
    calculateResponsiveness.mockResolvedValue([0.6, 4]);
    computeCorrectnessMetric.mockResolvedValue([0.9, 6]);

    const result = await calculateNetScore(repoURL, tempDir, tempURL);

    expect(result.NetScore).toBeCloseTo(0.64, 2); // Adjust as per available metrics
    expect(error).toHaveBeenCalledWith("Error calculating other metrics:", expect.any(Error));
  });
});
