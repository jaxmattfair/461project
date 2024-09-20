import { getLicenseFileContent } from '../utils/gitUtils';
// Function to extract license section from README using regex
export function extractLicenseFromReadme(content) {
    const licenseRegex = /##?\s*License[\s\S]*?(?=##|$)/i; // Matches "License" section until next heading or end of file
    const match = content.match(licenseRegex);
    return match ? match[0].trim() : null;
}
// Main function to extract license info from a cloned repository
export async function extractLicenseInfo(dir, readmeContent) {
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
/**
 * Checks if the provided license text matches GNU LGPL v2.1.
 * @param licenseText The text of the license to verify.
 * @returns 1 if LGPLv2.1 is found, 0 otherwise.
 */
export function isLGPLv21(licenseText) {
    const lgplRegex = /\bGNU\s+Lesser\s+General\s+Public\s+License(?:\s+\(LGPL\))?(?:\s+version)?\s+2\.1(?:\s+or\s+later)?\b|\bLGPL(?:\s+version)?\s+2\.1(?:\s+or\s+later)?\b|https?:\/\/www\.gnu\.org\/licenses\/old-licenses\/lgpl-2\.1\.html\b/i;
    return lgplRegex.test(licenseText) ? 1 : 0;
}
