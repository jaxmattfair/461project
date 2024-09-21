import { cloneRepository, getReadmeContent, measureExecutionTime } from "../utils/gitUtils";
import { fileURLToPath } from 'url';
import * as path from 'path';
import { dirname } from 'path';
import fs from 'fs';
export async function calculateNetScore(repoURL, tempDir) {
    //Clone repo
    try {
        const { result, duration } = await measureExecutionTime(() => cloneRepository(repoURL, tempDir), 'cloneRepository');
        console.log(`Result: ${result}`); // Outputs: Result: Data fetched
        console.log(`Duration: ${duration} seconds`); // Outputs: Duration: 2.00 seconds
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
    //Read the ReadMe content
    const readmeContent = getReadmeContent(tempDir);
    if (readmeContent == null) {
        //handle exceptions
        //try other tasks
    }
    /*
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
    if (weighted_score < 0) {
        return 0;
    }
    if (weighted_score > 1) {
        return 1;
    }
    return weighted_score;
    */
    return -1;
}
const repoURL = 'https://github.com/raoakanksh/461project';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDir = path.join(__dirname, 'temp-repo');
//Clean up existing temp directory
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
console.log(await calculateNetScore(repoURL, tempDir));
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
