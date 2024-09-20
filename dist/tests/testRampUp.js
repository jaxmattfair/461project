import { dirname } from 'path';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { cloneRepository, getReadmeContent } from '../src/utils/gitUtils.js';
import { extractLicenseInfo, isLGPLv21 } from '../src/metrics/license.js';
import { calculateResponsiveness } from '../src/metrics/responsiveMaintainer.js';
async function testRampUp() {
    const repoUrl = 'https://github.com/gnutls/gnutls';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const tempDir = path.join(__dirname, 'temp-repo');
    //Clean up existing temp directory
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    try {
        //Clone the repo
        await cloneRepository(repoUrl, tempDir);
        //Read the ReadMe content
        const readmeContent = getReadmeContent(tempDir);
        // Test extract license info 
        const licenseInfo = await extractLicenseInfo(tempDir, readmeContent);
        if (licenseInfo != null) {
            const licenseScore = isLGPLv21(licenseInfo);
            console.log('License Score: ', licenseScore);
        }
        //Test responsive maintainer
        const responsive = await calculateResponsiveness(repoUrl);
        if (responsive != -1) {
            console.log("Responsive score: ", responsive);
        }
        /*
        if (readmeContent !== null) {
            //Fetch AST Root from readmeContent and parse it
            console.log('README Content:');
            const ast: Root = parseMarkdown(readmeContent);
            console.log('Number of top-level nodes:', ast.children.length);
            const metrics = analyzeReadme(ast);
            const rampUpScore = calculateRampUpScore(metrics)
            console.log("Ramp-Up score: ", rampUpScore);
            console.log(metrics);
            //console.log(ast);
        } else {
            console.log('No README file found in the repository.');
        }*/
    }
    catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
    finally {
        // Clean up the temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log('Cleaned up temporary directory.');
        }
    }
}
testRampUp();
