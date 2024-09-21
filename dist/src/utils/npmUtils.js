import fetch from 'node-fetch';
import * as url from 'url';
/**
 * Extracts the npm package name from a given npm package URL.
 * Supports both scoped and unscoped packages.
 *
 * @param packageUrl - The URL of the npm package.
 * @returns The package name or throws an error if parsing fails.
 */
function extractPackageName(packageUrl) {
    try {
        const parsedUrl = new url.URL(packageUrl);
        const pathname = parsedUrl.pathname;
        // Regex to match /package/@scope/package or /package/package
        const regex = /^\/package\/(@[^/]+\/[^/]+|[^/]+)$/;
        const match = pathname.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        else {
            throw new Error('Invalid npm package URL format.');
        }
    }
    catch (error) {
        throw new Error('Invalid URL provided.');
    }
}
;
/**
 * Fetches the repository URL from the npm registry for a given package name.
 *
 * @param packageName - The name of the npm package.
 * @returns The repository URL or null if not available.
 */
async function fetchRepositoryUrl(packageName) {
    const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    try {
        const response = await fetch(registryUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch package data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // The 'repository' field can be a string or an object
        let repository = data.repository;
        if (!repository) {
            return null;
        }
        if (typeof repository === 'string') {
            return repository;
        }
        else if (typeof repository === 'object' && repository.url) {
            return repository.url;
        }
        else {
            return null;
        }
    }
    catch (error) {
        throw new Error(`Error fetching repository URL: ${error.message}`);
    }
}
;
/**
 * Cleans and standardizes the repository URL.
 * Converts SSH and Git URLs to HTTPS format if they point to GitHub.
 *
 * @param repoUrl - The raw repository URL.
 * @returns The cleaned and standardized URL.
 */
function cleanRepositoryUrl(repoUrl) {
    let cleanedUrl = repoUrl;
    // Remove 'git+' prefix if present
    if (cleanedUrl.startsWith('git+')) {
        cleanedUrl = cleanedUrl.slice(4);
    }
    // Convert SSH URLs to HTTPS
    // Example: ssh://git@github.com/user/repo.git -> https://github.com/user/repo
    // Example: git@github.com:user/repo.git -> https://github.com/user/repo
    const sshRegex = /^(?:ssh:\/\/git@|git@)(github\.com)[:/](.+?)(?:\.git)?$/;
    const sshMatch = cleanedUrl.match(sshRegex);
    if (sshMatch) {
        const host = sshMatch[1];
        const path = sshMatch[2];
        cleanedUrl = `https://${host}/${path}`;
    }
    // Remove trailing '.git' if present
    if (cleanedUrl.endsWith('.git')) {
        cleanedUrl = cleanedUrl.slice(0, -4);
    }
    return cleanedUrl;
}
;
/**
 * Determines if the repository URL is a GitHub URL.
 *
 * @param repoUrl - The cleaned repository URL.
 * @returns True if it's a GitHub URL, false otherwise.
 */
function isGitHubUrl(repoUrl) {
    try {
        const parsedUrl = new url.URL(repoUrl);
        return parsedUrl.hostname.toLowerCase() === 'github.com';
    }
    catch {
        return false;
    }
}
;
/**
 * Main function to process the npm package URL and retrieve the GitHub URL.
 *
 * @param packageUrl - The npm package URL.
 */
export async function getGitHubUrlFromNpm(packageUrl) {
    try {
        const packageName = extractPackageName(packageUrl);
        console.log(`Package Name: ${packageName}`);
        const repositoryUrl = await fetchRepositoryUrl(packageName);
        if (!repositoryUrl) {
            console.log('No repository information found for this package.');
            return;
        }
        const cleanedUrl = cleanRepositoryUrl(repositoryUrl);
        console.log(`Repository URL: ${cleanedUrl}`);
        if (isGitHubUrl(cleanedUrl)) {
            console.log(`GitHub URL: ${cleanedUrl}`);
        }
        else {
            console.log('The repository URL is not a GitHub URL.');
        }
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
    }
}
;
await getGitHubUrlFromNpm('https://www.npmjs.com/package/browserify');
