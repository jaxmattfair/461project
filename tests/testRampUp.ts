import * as path from 'path';
import * as fs from 'fs';
import { cloneRepository, getReadmeContent} from '../src/utils/gitUtils';

async function testCloneAndReadme() {
    const repoUrl = 'https://github.com/xyflow/xyflow.git';
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
            console.log('README Content:');
            console.log(readmeContent);
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

testCloneAndReadme();