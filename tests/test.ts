import { dirname } from 'path';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { cloneRepository, getReadmeContent, extractLicenseInfo, parseMarkdown } from '../src/utils/gitUtils.js';
import { Root } from 'mdast';

async function testLicenseExtraction() {
    const repoUrl = 'https://github.com/nodejs/node'; // Example repo URL, replace with the one you want to test
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const tempDir = path.join(__dirname, 'temp-repo');

    // Clean up existing temp directory
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    try {
        // Clone the repository
        await cloneRepository(repoUrl, tempDir);

        // Read the README content
        const readmeContent = getReadmeContent(tempDir);

        if (readmeContent !== null) {
            // Parse the README content and fetch AST Root
            console.log('README Content:');
            const ast: Root = parseMarkdown(readmeContent);
            console.log('Number of top-level nodes:', ast.children.length);

            // Extract License info from README
            const licenseInReadme = extractLicenseInfo(repoUrl, tempDir);
            console.log("Extracted License Information:", licenseInReadme);
        } else {
            console.log('No README file found in the repository.');
        }

    } catch (error) {
        console.error(`An error occurred: ${(error as Error).message}`);
    } finally {
        // Clean up the temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log('Cleaned up temporary directory.');
        }
    }
}

testLicenseExtraction();
