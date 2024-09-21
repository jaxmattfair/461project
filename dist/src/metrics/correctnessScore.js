import fs from 'fs-extra';
import path from 'path';
/**
 * Checks for the presence of a test suite.
 * @param repoPath - Path to the local repository
 * @returns Score [0,1]
 */
const hasTestSuite = async (repoPath) => {
    const testDirs = ['test', 'tests', '__tests__'];
    for (const dir of testDirs) {
        const fullPath = path.join(repoPath, dir);
        if (await fs.pathExists(fullPath) && (await fs.lstat(fullPath)).isDirectory()) {
            return 1.0;
        }
    }
    // Check for test scripts in package.json
    const packageJsonPath = path.join(repoPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        if (packageJson.scripts && packageJson.scripts.test) {
            return 1.0;
        }
    }
    return 0.0;
};
/**
 * Gets test coverage from coverage-summary.json
 * @param repoPath - Path to the local repository
 * @returns Coverage score [0,1]
 */
const getTestCoverage = async (repoPath) => {
    const coverageSummaryPath = path.join(repoPath, 'coverage', 'coverage-summary.json');
    if (await fs.pathExists(coverageSummaryPath)) {
        const coverageSummary = await fs.readJson(coverageSummaryPath);
        const statements = coverageSummary.total.statements.pct;
        const branches = coverageSummary.total.branches.pct;
        const functions = coverageSummary.total.functions.pct;
        const lines = coverageSummary.total.lines.pct;
        // Calculate average coverage
        const averageCoverage = (statements + branches + functions + lines) / 4 / 100; // Normalize to [0,1]
        return parseFloat(averageCoverage.toFixed(2));
    }
    // If coverage report not found, assign a low score
    return 0.2;
};
/**
 * Checks if CI is configured in the repository.
 * @param repoPath - Path to the local repository
 * @returns CI integration score [0,1]
 */
const hasCI = async (repoPath) => {
    const ciConfigDirs = [
        '.github/workflows',
        '.travis.yml',
        '.circleci',
        'azure-pipelines.yml',
        'appveyor.yml',
    ];
    for (const configPath of ciConfigDirs) {
        const fullPath = path.join(repoPath, configPath);
        if (await fs.pathExists(fullPath)) {
            return 1.0;
        }
    }
    return 0.0;
};
/**
 * Calculates the overall correctness score.
 * @param scores - Object containing sub-scores
 * @returns CorrectnessMetric
 */
export const calculateCorrectness = (scores) => {
    const weights = {
        testSuite: 0.3,
        testCoverage: 0.5,
        ciIntegration: 0.2,
    };
    const correctnessScore = (scores.testSuite * weights.testSuite) +
        (scores.testCoverage * weights.testCoverage) +
        (scores.ciIntegration * weights.ciIntegration);
    return {
        correctnessScore: parseFloat(Math.min(Math.max(correctnessScore, 0), 1).toFixed(2)),
        subScores: scores,
    };
};
/**
 * Computes the correctness metric for a local repository.
 * @param repoPath - Path to the local repository
 * @returns CorrectnessMetric
 */
export const computeCorrectnessMetric = async (repoPath) => {
    const [testSuite, testCoverage, ciIntegration] = await Promise.all([
        hasTestSuite(repoPath),
        getTestCoverage(repoPath),
        hasCI(repoPath),
    ]);
    const scores = {
        testSuite,
        testCoverage,
        ciIntegration,
    };
    return calculateCorrectness(scores);
};
