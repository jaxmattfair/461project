import git from 'isomorphic-git';
import * as fs from 'fs';
import { createRequire } from 'module';
const requires = createRequire(import.meta.url);
const http = requires('isomorphic-git/http/node'); // Import CommonJS module
import * as path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
//Awaits git clone of repository 
export async function cloneRepository(repoUrl, dir) {
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
    }
    catch (error) {
        console.error(`Failed to clone repository: ${error.message}`);
        throw error;
    }
}
//Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
export function getReadmeContent(repoDir) {
    const readMePath = path.join(repoDir, 'README.md');
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
            }
            catch (error) {
                console.error(`Error reading ${filename}: ${error.message}`);
                return null;
            }
        }
    }
    return null;
}
export function parseMarkdown(content) {
    return unified().use(remarkParse).use(remarkGfm).parse(content);
}
