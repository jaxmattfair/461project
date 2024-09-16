import * as git from 'isomorphic-git';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';

//Awaits git clone of repository 
async function cloneRepository(repoUrl: string, dir: string) {
    await git.clone({
      fs,
      http: require('isomorphic-git/http/node'),
      dir,
      url: repoUrl,
      singleBranch: true,
      depth: 1,
    });
}

//Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
function getReadmeContent(repoDir: string): string | null {
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
            } catch (error) {
                console.error(`Error reading ${filename}: ${(error as Error).message}`);
                return null;
            }
        }
    }
    return null;
}
