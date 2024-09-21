import fs from 'fs-extra';
import path from 'path';
import { info, debug, error } from '../utils/logger'; // Import logger functions

/**
 * Checks for the presence of a test suite.
 * @param repoPath - Path to the local repository
 * @returns Score [0,1]
 */
const hasTestSuite = async (repoPath: string): Promise<number> => {
    info('Checking for test suite...');
    const testDirs = ['test', 'tests', '__tests__'];
    try {
        for (const dir of testDirs) {
            const fullPath = path.join(repoPath, dir);
            try {
                const stats = await fs.lstat(fullPath);
                if (stats.isDirectory()) {
                    info(`Test suite directory found: ${dir}`);
                    return 1.0;
                }
            } catch (err: any) {
                if (err.code !== 'ENOENT') { // Ignore "file not found" errors
                    error(`Error accessing ${fullPath}: ${err.message}`);
                }
                // If the directory doesn't exist, continue to the next
            }
        }

        // Check for test scripts in package.json
        const packageJsonPath = path.join(repoPath, 'package.json');
        try {
            const packageStats = await fs.lstat(packageJsonPath);
            if (packageStats.isFile()) {
                const packageJson = await fs.readJson(packageJsonPath);
                if (packageJson.scripts && packageJson.scripts.test) {
                    info('Test script found in package.json');
                    return 1.0;
                }
            }
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                error(`Error accessing ${packageJsonPath}: ${err.message}`);
            }
            // If package.json doesn't exist, continue
        }

        info('No test suite found.');
        return 0.0;
    } catch (err) {
        error('Unexpected error in hasTestSuite:', err);
        return 0.0;
    }
};

export const computeCorrectnessMetric = async (repoPath: string): Promise<number> => {
    const testSuite = await hasTestSuite(repoPath);
    return testSuite;
};
