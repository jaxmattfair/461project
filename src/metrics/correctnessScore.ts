import fs from 'fs-extra';
import path from 'path';
import { info, debug} from '../logger.js';
import { error as logError } from '../logger.js';

/**
 * Checks for the presence of a test suite.
 * @param repoPath - Path to the local repository
 * @returns Score [0,1]
 */
const hasTestSuite = async (repoPath: string): Promise<number> => {
    //console.log('Checking for test suite...');
    const testDirs = ['test', 'tests', '__tests__'];
    try {
        for (const dir of testDirs) {
            const fullPath = path.join(repoPath, dir);
            try {
                const stats = await fs.lstat(fullPath);
                if (stats.isDirectory()) {
                    //console.log(`Test suite directory found: ${dir}`);
                    return 1.0;
                }
            } catch (error: any) {
                if (error.code !== 'ENOENT') { // Ignore "file not found" errors
                    logError(`Error accessing ${fullPath}:`, error);
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
                    //console.log('Test script found in package.json');
                    return 1.0;
                }
            }
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                logError(`Error accessing ${packageJsonPath}:`, error);
            }
            // If package.json doesn't exist, continue
        }

        //console.log('No test suite found.');
        return 0.0;
    } catch (error) {
        if (error instanceof Error) {
            logError('Unexpected error in hasTestSuite:', error);
        }
        return 0
    }
};

export const computeCorrectnessMetric = async (repoPath: string): Promise<[number, number]> => {
    const start = Date.now();
    const testSuite = await hasTestSuite(repoPath);
    const end = Date.now();
    const duration = (end - start) / 1000;
    return [testSuite, duration];
};