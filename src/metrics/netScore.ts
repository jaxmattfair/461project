interface MetricScores {
    weightedScore: number;
    rampUpScore: number; // Include rampUpScore in the return type
    // Add other scores as needed
}

export async function calculateNetScore(repoURL: string, tempDir: string): Promise<MetricScores> {
    // Clone repo
    let cloneDuration: number;
    try {
        cloneDuration = await cloneRepository(repoURL, tempDir);
        console.log(`Duration: ${cloneDuration} seconds`);
    } catch (error) {
        console.error("An error occurred while cloning:", error);
        return { weightedScore: -500, rampUpScore: 0 }; // Handle cloning error
    }

    // Read the ReadMe content
    const readmeContent = getReadmeContent(tempDir);
    if (readmeContent === 'null') {
        return { weightedScore: -500, rampUpScore: 0 }; // Handle readme error
    }

    const ast: Root = parseMarkdown(readmeContent);
    const metrics = analyzeReadme(ast);

    const parsed = parseGitHubRepoURL(repoURL);
    const owner = parsed.owner;
    const repo = parsed.repo;

    const [busFactorScore, licenseScore, responsiveMaintainerScore, rampUpScore, correctnessScore] = await Promise.all([
        getMetricScore(owner, repo),
        extractLicenseInfo(tempDir, readmeContent),
        calculateResponsiveness(repoURL),
        calculateRampUpScore(metrics),
        computeCorrectnessMetric(tempDir)
    ]);

    const weightedScore = busFactorScore * 0.2 + licenseScore * 0.2 + responsiveMaintainerScore * 0.2 + rampUpScore * 0.2 + correctnessScore * 0.2;

    try {
        await cleanUpDirectory(tempDir);
        console.log(`Cleaned up temporary directory: ${tempDir}`);
    } catch (cleanupError) {
        console.error(`Error during cleanup: ${cleanupError.message}`);
    }

    if (weightedScore < 0) {
        return { weightedScore: 0, rampUpScore }; // Return rampUpScore as well
    }
    if (weightedScore > 1) {
        return { weightedScore: 1, rampUpScore };
    }
    return { weightedScore, rampUpScore }; // Return both scores
}

// Usage
const repoURL = 'https://github.com/voideditor/void';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDir = path.join(process.cwd(), '/temp-repos', '461project');

const result = await calculateNetScore(repoURL, tempDir);
console.log('Net Score Result:', result);
