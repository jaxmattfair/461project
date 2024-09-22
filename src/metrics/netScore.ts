import { cloneRepository, getReadmeContent, parseGitHubRepoURL, parseMarkdown, measureExecutionTime, cleanUpDirectory } from "../utils/gitUtils";
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
    try {
        const cloneDuration = await cloneRepository(repoURL, tempDir);
        console.log(`Duration: ${cloneDuration} seconds`); // Outputs: Duration: 2.00 seconds
    } catch (error) {
        console.error("An error occurred:", error);
    } //Result is undefined in this case

    //Read the ReadMe content
    const readmeContent = getReadmeContent(tempDir);
    if (readmeContent == 'null') {
        //handle exceptions
        //try other tasks
        return -500;
    }

    const ast: Root = parseMarkdown(readmeContent);
    const metrics = analyzeReadme(ast);


    const parsed = parseGitHubRepoURL(repoURL);
    const owner = parsed.owner;
    const repo = parsed.repo;

    //const busFactorScore = await getMetricScore(owner, repo);
    const [busFactorScore, licenseScore, responsiveMaintainerScore, rampUpScore, correctnessScore] = await Promise.all([getMetricScore(owner, repo), 
                                                                                                      extractLicenseInfo(tempDir, readmeContent),
                                                                                                      calculateResponsiveness(repoURL),
                                                                                                      calculateRampUpScore(metrics),
                                                                                                      computeCorrectnessMetric(tempDir)]);
    
    const weighted_score = busFactorScore * 0.2 + licenseScore * 0.2 + responsiveMaintainerScore * 0.2  + rampUpScore * 0.2 + correctnessScore * 0.2;

    try {
        await cleanUpDirectory(tempDir);
        console.log(`Cleaned up temporary directory: ${tempDir}`);
    } catch (cleanupError: any) {
        console.error(`Error during cleanup: ${cleanupError.message}`);
    }

    if (weighted_score < 0) {
        return 0;
    }
    if (weighted_score > 1) {
        return 1;
    }
    return weighted_score;
    
    //return -1;
}

const repoURL = 'https://github.com/voideditor/void';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDir = path.join(process.cwd(), '/temp-repos', '461project')

console.log(await calculateNetScore(repoURL, tempDir));
