import { cloneRepository, getReadmeContent, parseGitHubRepoURL, parseMarkdown } from "../utils/gitUtils.js";
import { getMetricScore } from "./busFactorScore.js";
import { computeCorrectnessMetric } from "./correctnessScore.js";
import { extractLicenseInfo } from "./license.js";
import { calculateRampUpScore, analyzeReadme } from "./rampUpScore.js";
import { calculateResponsiveness } from "./responsiveMaintainer.js";
const roundToThree = (num) => {
    return Math.round(num * 1000) / 1000;
};
export async function calculateNetScore(repoURL, tempDir, tempURL) {
    //console.log("returning early w net score");
    //return {NetScore: 1};
    const start = Date.now();
    let weighted_score = -1; // Default in case of an error
    // Initialize durations to track metric calculation times
    let busFactorDuration = 0, licenseDuration = 0, responsiveDuration = 0, correctnessDuration = 0, rampUpDuration = 0;
    // Initialize scores to handle cases where README is missing
    let busFactorScore = 0, licenseScore = 0, responsiveMaintainerScore = 0, correctnessScore = 0, rampUpScore = 0;
    // Try to clone the repository
    try {
        await cloneRepository(repoURL, tempDir);
    }
    catch (error) {
        console.error("An error occurred during cloning:", error);
        // Return null if cloning fails
        return null;
    }
    // Read the README content
    const readmeContent = getReadmeContent(tempDir);
    let metrics, parsed, owner, repo;
    parsed = parseGitHubRepoURL(repoURL);
    owner = parsed.owner;
    repo = parsed.repo;
    // If README is found, parse it and calculate RampUp
    if (readmeContent !== 'null') {
        const ast = parseMarkdown(readmeContent);
        metrics = analyzeReadme(ast);
        // Calculate ramp-up score and duration (since it depends on the README)
        [rampUpScore, rampUpDuration] = calculateRampUpScore(metrics);
    }
    else {
        //console.warn("README not found. Skipping metrics that require README.");
        // If README is not found, set RampUp score and latency to 0
        rampUpScore = 0;
        rampUpDuration = 0;
    }
    // Proceed with the other metric calculations that don't require README
    try {
        [[busFactorScore, busFactorDuration], [licenseScore, licenseDuration], [responsiveMaintainerScore, responsiveDuration],
            [correctnessScore, correctnessDuration]] = await Promise.all([
            getMetricScore(owner, repo),
            extractLicenseInfo(tempDir, readmeContent),
            calculateResponsiveness(repoURL),
            computeCorrectnessMetric(tempDir)
        ]);
    }
    catch (error) {
        console.error("Error calculating other metrics:", error);
    }
    // Calculate the weighted net score
    weighted_score = busFactorScore * 0.1 + licenseScore * 0.3 + responsiveMaintainerScore * 0.4 + rampUpScore * 0.1 + correctnessScore * 0.1;
    // Ensure the score is within the valid range [0, 1]
    if (weighted_score < 0)
        weighted_score = 0;
    if (weighted_score > 1)
        weighted_score = 1;
    // Calculate the total time for net score calculation
    const end = Date.now();
    const netScoreDuration = (end - start) / 1000; // Convert to seconds
    // Clean up the temporary directory
    /*
    try {
        await cleanUpDirectory(tempDir);
    } catch (cleanupError: any) {
        console.error(`Error during cleanup: ${cleanupError.message}`);
    }*/
    // Return all the scores and their latencies in a JSON-compatible object
    return {
        URL: tempURL,
        NetScore: roundToThree(weighted_score),
        NetScore_Latency: roundToThree(netScoreDuration),
        RampUp: roundToThree(rampUpScore),
        RampUp_Latency: roundToThree(rampUpDuration),
        Correctness: roundToThree(correctnessScore),
        Correctness_Latency: roundToThree(correctnessDuration),
        BusFactor: roundToThree(busFactorScore),
        BusFactor_Latency: roundToThree(busFactorDuration),
        ResponsiveMaintainer: roundToThree(responsiveMaintainerScore),
        ResponsiveMaintainer_Latency: roundToThree(responsiveDuration),
        License: roundToThree(licenseScore),
        License_Latency: roundToThree(licenseDuration)
    };
}
;
//const repoURL = 'https://github.com/raoakanksh/461project/';
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);
//const tempDir = path.join(process.cwd(), '/temp-repos', '461project')
//console.log(await calculateNetScore(repoURL, tempDir));
