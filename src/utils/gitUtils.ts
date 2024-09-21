import git from 'isomorphic-git';
import * as fs from 'fs';
import { createRequire } from 'module';
const requires = createRequire(import.meta.url);
const http = requires('isomorphic-git/http/node'); // Import CommonJS module
import * as path from 'path';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Root } from 'mdast';

// Subfunction to measure how long an async function takes
export async function measureExecutionTime<T>(asyncFunction: () => Promise<T>, functionName: string): Promise<T> {
  const start = Date.now(); // Start time
  try {
      const result = await asyncFunction(); // Execute the async function
      const end = Date.now(); // End time
      const duration = (end - start) / 1000; // Calculate duration in seconds
      //console.log(Execution time for ${functionName}: ${duration.toFixed(2)} seconds);
      return result; // Return the result of the async function
  } catch (error) {
      //console.error(Error executing ${functionName}:, error);
      throw error; // Rethrow the error for further handling
  }
}

//Awaits git clone of repository 
export async function cloneRepository(repoUrl: string, dir: string): Promise<void> {
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
  } catch (error) {
    console.error(`Failed to clone repository: ${(error as Error).message}`);
    throw error;
  }
}

//Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
export function getReadmeContent(repoDir: string): string | null {
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

export function parseMarkdown(content: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(content);
}

// Function to parse GitHub repository URL
export function parseGitHubRepoURL(repoURL: string): { owner: string; repo: string } {
  try {
    const url = new URL(repoURL);

    // Ensure the hostname is github.com
    if (url.hostname !== 'github.com') {
      throw new Error('Invalid GitHub repository URL.');
    }

    // Split the pathname and extract owner and repo
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);

    if (pathSegments.length < 2) {
      throw new Error('Invalid GitHub repository URL format.');
    }

    const [owner, repoWithPossibleSuffix] = pathSegments;

    // Remove possible '.git' suffix from repo name
    const repo = repoWithPossibleSuffix.endsWith('.git')
      ? repoWithPossibleSuffix.slice(0, -4)
      : repoWithPossibleSuffix;

    return { owner, repo };
  } catch (error) {
    throw new Error('Failed to parse GitHub repository URL:');
  }
}

// Function to check for a LICENSE file
export function getLicenseFileContent(repoDir: string): string | null {
  const licenseFilenames = [
      'LICENSE',
      'LICENSE.txt',
      'LICENSE.md',
      'LICENSE.MD',
  ];
  for (const filename of licenseFilenames) {
      const licensePath = path.join(repoDir, filename);
      if (fs.existsSync(licensePath)) {
          try {
              return fs.readFileSync(licensePath, 'utf-8');
          } catch (error) {
              console.error(`Error reading ${filename}: ${(error as Error).message}`);
              return null;
          }
      }
  }
  return null;
}
