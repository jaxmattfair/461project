//import git from 'isomorphic-git';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { createRequire } from 'module';
const requires = createRequire(import.meta.url);
//const http = requires('isomorphic-git/http/node'); // Import CommonJS module
import * as path from 'path';
import simpleGit from 'simple-git';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { Root } from 'mdast';

const git = simpleGit();

// Subfunction to measure how long an async function takes
export async function measureExecutionTime<T>(asyncFunction: () => Promise<T>, functionName: string): Promise<{result: T; duration: number}> {
  const start = Date.now(); // Start time
  try {
      const result = await asyncFunction(); // Execute the async function
      const end = Date.now(); // End time
      const duration = (end - start) / 1000; // Calculate duration in seconds
      //console.log(Execution time for ${functionName}: ${duration.toFixed(2)} seconds);
      return { result, duration }; // Return both result and duration
  } catch (error) {
      //console.error(Error executing ${functionName}:, error);
      throw error; // Rethrow the error for further handling
  }
}

/**
 * Creates a directory with writable permissions.
 * @param dir - The directory path to create.
 */
async function createDirectory(dir: string): Promise<void> {
  try {
      await fsPromises.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);

      // Attempt to set permissions (works on Unix-based systems)
      
      try {
          await fsPromises.chmod(dir, 0o755);
          console.log(`Set permissions to writable for directory: ${dir}`);
      } catch (chmodError: any) {
          console.warn(`Could not set permissions for ${dir}: ${chmodError.message}`);
          // On Windows, chmod might not have the desired effect
      }
  } catch (error: any) {
      console.error(`Error creating directory ${dir}: ${error.message}`);
      throw error;
  }
}

/**
 * Removes a directory if it exists.
 * @param dir - The directory path to remove.
 */
export async function cleanUpDirectory(dir: string): Promise<void> {
  const exists = await directoryExists(dir);
  if (exists) {
      try {
          await fsPromises.rm(dir, { recursive: true, force: true });
          console.log(`Removed existing directory: ${dir}`);
      } catch (error: any) {
          console.error(`Error removing directory ${dir}: ${error.message}`);
          throw error;
      }
  }
}

/**
 * Checks if a directory exists.
 * @param dir - The directory path to check.
 * @returns A promise that resolves to `true` if the directory exists, `false` otherwise.
 */
async function directoryExists(dir: string): Promise<boolean> {
  try {
      await fsPromises.access(dir);
      return true;
  } catch {
      return false;
  }
}

//Awaits git clone of repository 
export async function cloneRepository(repoUrl: string, dir: string): Promise<number> {
  const start = Date.now(); 
  await cleanUpDirectory(dir);

  // Step 2: Create temp directory
  await createDirectory(dir);

  try {
    await git.clone(repoUrl, dir);
    //await git.clone({
    //  fs,
    //  http,
    //  dir,
    //  url: repoUrl,
    //  singleBranch: true,
    //  depth: 1,
    //});
    const end = Date.now(); // End time
    const duration = (end - start) / 1000; // Calculate duration in seconds
    console.log(`Repository cloned to ${dir}`);
    return duration;
  } catch (error) {
    console.error(`Failed to clone repository: ${(error as Error).message}`);
    return -1;
  }
}

//Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
export function getReadmeContent(repoDir: string): string {
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
              return "null";
          }
      }
  }
  return "null";
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
