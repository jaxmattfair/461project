import { dirname } from 'path';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { cloneRepository, getReadmeContent, parseMarkdown } from '../src/utils/gitUtils.js';
import { analyzeReadme } from '../src/metrics/rampUpScore.js';
import { Root } from 'mdast';

async function testRampUp() {
    const repoUrl = 'https://github.com/gojue/ecapture.git';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const tempDir = path.join(__dirname, 'temp-repo');

    //Clean up existing temp directory
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true});
    }

    try {
        //Clone the repo
        await cloneRepository(repoUrl, tempDir);

        //Read the ReadMe content
        const readmeContent = getReadmeContent(tempDir);

        if (readmeContent !== null) {
            //Fetch AST Root from readmeContent and parse it
            console.log('README Content:');
            const ast: Root = parseMarkdown(readmeContent);
            console.log('Number of top-level nodes:', ast.children.length);
            const metrics = analyzeReadme(ast);
            console.log(metrics);
            //console.log(ast);
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

testRampUp();