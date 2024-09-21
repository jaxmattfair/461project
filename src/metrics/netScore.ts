import { cloneRepository, getReadmeContent, parseGitHubRepoURL, parseMarkdown } from "../utils/gitUtils";
import { getMetricScore } from "./busFactorScore";
import { computeCorrectnessMetric } from "./correctnessScore";
import { extractLicenseInfo } from "./license";
import { calculateRampUpScore, analyzeReadme } from "./rampUpScore";
import { calculateResponsiveness } from "./responsiveMaintainer";
import { Root } from 'mdast';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { dirname } from 'path';
import fs from 'fs';


export async function calculateNetScore(repoURL: string, tempDir: string): Promise<number> {
    //Clone repo
    await cloneRepository(repoURL, tempDir);
    //Read the ReadMe content
    //const readmeContent = getReadmeContent(tempDir);
    //const ast: Root = parseMarkdown(readmeContent);
    //const metrics = analyzeReadme(ast);


    //const parsed = parseGitHubRepoURL(repoURL);
    //const owner = parsed.owner;
    //const repo = parsed.repo;

    //const busFactorScore = await getMetricScore(owner, repo);

    //const [busFactorScore, licenseScore, responsiveMaintainerScore, rampUpScore] = await Promise.all([getMetricScore(owner, repo), 
    //                                                                                                                    extractLicenseInfo(tempDir, readmeContent),
    //                                                                                                                    calculateResponsiveness(repoURL),
    //                                                                                                                    calculateRampUpScore(metrics)]);
    
    //const weighted_score = busFactorScore * 0.2 + licenseScore * 0.2 + responsiveMaintainerScore * 0.2  + rampUpScore * 0.2;
    //return weighted_score;
    return -1;
}

const repoURL = 'https://github.com/raoakanksh/461project';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDir = path.join(__dirname, 'temp-repo');

//Clean up existing temp directory
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true});
}

console.log(await calculateNetScore(repoURL, tempDir));

if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true});
}