import * as fs from 'fs';

// Function to validate if license is LGPL v2.1
function validateLicense(filePath: string): boolean {
    // Read package.json file
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Regex pattern to match LGPL v2.1 (it allows variations like 'LGPL-2.1' or 'LGPL-2.1-only')
    const lgplRegex = /^LGPL-2\.1(\.0|(\-only|\-or\-later)?)?$/i;

    // Check if the license field matches LGPL v2.1
    if (packageJson.license && lgplRegex.test(packageJson.license)) {
        console.log('The module’s license is compatible with LGPL v2.1.');
        return true;
    } else {
        console.log('The module’s license is NOT compatible with LGPL v2.1.');
        return false;
    }
}

// Example usage
const packageJsonPath = './package.json';
validateLicense(packageJsonPath);
