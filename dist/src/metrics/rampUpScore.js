import { toString } from 'mdast-util-to-string'; // Utility to convert MDAST nodes to plain text
/**
 * Type guard to check if a node is a Parent node (has children).
 * @param node - The node to check.
 * @returns True if the node has children, false otherwise.
 */
function isParent(node) {
    return node.children !== undefined;
}
/**
 * Analyzes a README file's Markdown content to extract metrics.
 * @param content - The root node of the Markdown Abstract Syntax Tree (MDAST).
 * @returns An object containing metrics about essential sections, code blocks, and links.
 */
export function analyzeReadme(content) {
    const metrics = {
        essentialSections: {
            introduction: false,
            gettingStarted: false,
            installation: false,
            usage: false,
            contributing: false,
            license: false,
            deployment: false,
            versioning: false
        },
        codeBlocks: 0,
        links: 0,
    };
    /**
     * Recursively traverses the Markdown AST to update metrics based on node types.
     * @param node - The current node in the AST being traversed.
     */
    function traverse(node) {
        switch (node.type) {
            case 'heading':
                const title = toString(node).toLowerCase();
                console.log(title);
                if (title.includes('introduction'))
                    metrics.essentialSections.introduction = true;
                if (title.includes('getting started'))
                    metrics.essentialSections.gettingStarted = true;
                if (title.includes('installation'))
                    metrics.essentialSections.installation = true;
                if (title.includes('usage'))
                    metrics.essentialSections.usage = true;
                if (title.includes('contributing'))
                    metrics.essentialSections.contributing = true;
                if (title.includes('license'))
                    metrics.essentialSections.license = true;
                if (title.includes('deployment'))
                    metrics.essentialSections.deployment = true;
                if (title.includes('versioning'))
                    metrics.essentialSections.versioning = true;
                break;
            case 'code':
                metrics.codeBlocks += 1;
                break;
            case 'link':
                metrics.links += 1;
                break;
            default:
                break;
        }
        if (isParent(node)) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    traverse(content);
    return metrics;
}
/**
 * Calculates a normalized score between 0 and 1 based on README metrics.
 * @param metrics - The metrics extracted from the README.
 * @returns A number between 0 and 1 representing the normalized score.
 */
export function calculateRampUpScore(metrics) {
    // Define maximum expected values for normalization
    const MAX_CODE_BLOCKS = 50;
    const MAX_LINKS = 50;
    // Calculate essential sections score
    const totalSections = Object.keys(metrics.essentialSections).length;
    const presentSections = Object.values(metrics.essentialSections).filter(Boolean).length;
    const essentialScore = presentSections / totalSections;
    // Normalize code blocks and links
    const codeBlocksScore = Math.min(metrics.codeBlocks / MAX_CODE_BLOCKS, 1);
    const linksScore = Math.min(metrics.links / MAX_LINKS, 1);
    //Calculate and return arithmetic mean score [0, 1]
    const finalScore = (essentialScore + codeBlocksScore + linksScore) / 3;
    return finalScore;
}
