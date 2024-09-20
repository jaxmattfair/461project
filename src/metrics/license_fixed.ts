import git from 'isomorphic-git';
import * as fs from 'fs';
import { createRequire } from 'module';
const requires = createRequire(import.meta.url);
const http = requires('isomorphic-git/http/node'); // Import CommonJS module
import * as path from 'path';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Root } from 'mdast';


//Cloning the Repository:
//The script clones the repository from the given URL into a local directory.
//Searching for License in README:
//The script then searches for a README file in the cloned repository. If a README is found, it tries to extract the "License" section using a regex.
//Checking for LICENSE File:
//If no license is found in the README, it checks for a LICENSE file in the root of the repository.
//Returning License Information:
//If license information is found in either the README or the LICENSE file, it is returned and printed to the console. If not, the script logs a message indicating that no license was found.


// Awaits git clone of repository 
export async function cloneRepository(repoUrl: string, dir: string): Promise<void> {
    try {
        await git.clone({
            fs,
            http,
            dir,
            url: repoUrl,
            singleBranch: true,
            depth: 1,
        });
        console.log(`Repository cloned to ${dir}`);
    } catch (error) {
        console.error(`Failed to clone repository: ${(error as Error).message}`);
        throw error;
    }
}

// Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
export function getReadmeContent(repoDir: string): string | null {
    const readMeFilenames = [
        'README.md',
        'README.MD',
        'Readme.md',
        'ReadMe.md',
        'README',
        'readme.md',
        'readme',
    ];
    for (const filename of readMeFilenames) {
        const readmePath = path.join(repoDir, filename);
        if (fs.existsSync(readmePath)) {
            try {
                return fs.readFileSync(readmePath, 'utf-8');
            } catch (error) {
                console.error(`Error reading ${filename}: ${(error as Error).message}`);
                return null;
            }
        }
    }
    return null;
}

// Function to check for a LICENSE file
export function getLicenseFileContent(repoDir: string): string | null {
    const licenseFilenames = [
        'LICENSE',
        'LICENSE.txt',
        'LICENSE.md',
        'LICENSE.MD',
    ];
    for (const filename of licenseFilenames) {
        const licensePath = path.join(repoDir, filename);
        if (fs.existsSync(licensePath)) {
            try {
                return fs.readFileSync(licensePath, 'utf-8');
            } catch (error) {
                console.error(`Error reading ${filename}: ${(error as Error).message}`);
                return null;
            }
        }
    }
    return null;
}

// Function to parse markdown content into an AST
export function parseMarkdown(content: string): Root {
    return unified().use(remarkParse).use(remarkGfm).parse(content);
}

// Function to extract license section from README using regex
export function extractLicenseFromReadme(content: string): string | null {
    const licenseRegex = /##?\s*License[\s\S]*?(?=##|$)/i; // Matches "License" section until next heading or end of file
    const match = content.match(licenseRegex);
    return match ? match[0].trim() : null;
}

// Function to parse GitHub repository URL
export function parseGitHubRepoURL(repoURL: string): { owner: string; repo: string } {
    try {
        const url = new URL(repoURL);

        // Ensure the hostname is github.com
        if (url.hostname !== 'github.com') {
            throw new Error('Invalid GitHub repository URL.');
        }

        // Split the pathname and extract owner and repo
        const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);

        if (pathSegments.length < 2) {
            throw new Error('Invalid GitHub repository URL format.');
        }

        const [owner, repoWithPossibleSuffix] = pathSegments;

        // Remove possible '.git' suffix from repo name
        const repo = repoWithPossibleSuffix.endsWith('.git')
            ? repoWithPossibleSuffix.slice(0, -4)
            : repoWithPossibleSuffix;

        return { owner, repo };
    } catch (error) {
        throw new Error('Failed to parse GitHub repository URL:');
    }
}

// Main function to extract license info from a cloned repository
export async function extractLicenseInfo(repoUrl: string, dir: string): Promise<string | null> {
    // Step 1: Clone the repository
    await cloneRepository(repoUrl, dir);

    // Step 2: Check README file for a license section
    const readmeContent = getReadmeContent(dir);
    if (readmeContent) {
        const licenseInReadme = extractLicenseFromReadme(readmeContent);
        if (licenseInReadme) {
            console.log('License found in README:');
            console.log(licenseInReadme);
            return licenseInReadme;
        }
    }

    // Step 3: Check for LICENSE file in the root directory
    const licenseFileContent = getLicenseFileContent(dir);
    if (licenseFileContent) {
        console.log('License found in LICENSE file:');
        console.log(licenseFileContent);
        return licenseFileContent;
    }

    console.log('No license information found.');
    return null;
}
