import { cloneRepository, getReadmeContent, parseGitHubRepoURL, getLicenseFileContent } from '../utils/gitUtils';

// Function to extract license section from README using regex
export function extractLicenseFromReadme(content: string): string | null {
    const licenseRegex = /##?\s*License[\s\S]*?(?=##|$)/i; // Matches "License" section until next heading or end of file
    const match = content.match(licenseRegex);
    return match ? match[0].trim() : null;
  }
  
// Main function to extract license info from a cloned repository
export async function extractLicenseInfo(dir: string, readmeContent: string | null): Promise<string | null> {
    // Step 2: Check README file for a license section
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