import * as fs from 'fs';          // Node.js File System module for file operations
import * as path from 'path';      // Node.js Path module for handling file paths
import { Root } from 'mdast';      // Type representing the root of an MDAST (Markdown Abstract Syntax Tree)
import { Node, Parent } from 'unist';      // Type representing a generic Unist and parent node
import { toString } from 'mdast-util-to-string'; // Utility to convert MDAST nodes to plain text

// Define interfaces for metrics
interface Metrics {
    essentialSections: EssentialSections; // Tracks presence of essential README sections
    codeBlocks: number;                   // Counts the number of code blocks in the README
    links: number;                        // Counts the number of links in the README
}

interface EssentialSections {
    introduction: boolean;    // Indicates if the "Introduction" section is present
    installation: boolean;    // Indicates if the "Installation" section is present
    gettingStarted: boolean;  // Indicates if the "Getting Started" section is present
    usage: boolean;           // Indicates if the "Usage" section is present
    contributing: boolean;    // Indicates if the "Contributing" section is present
    license: boolean;         // Indicates if the "License" section is present
    deployment: boolean;      // Indicates if the "Deployment" section is present
    versioning: boolean;      // Indicates if the "Versioning" section is present
}

/**
 * Type guard to check if a node is a Parent node (has children).
 * @param node - The node to check.
 * @returns True if the node has children, false otherwise.
 */
function isParent(node: Node): node is Parent {
  return (node as Parent).children !== undefined;
}

/**
 * Analyzes a README file's Markdown content to extract metrics.
 * @param content - The root node of the Markdown Abstract Syntax Tree (MDAST).
 * @returns An object containing metrics about essential sections, code blocks, and links.
 */
export function analyzeReadme(content: Root): Metrics {
    const metrics: Metrics = {
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
    function traverse(node: Node) {
      switch (node.type) {
        case 'heading':
          const title = toString(node).toLowerCase();
          //console.log(title);
          if (title.includes('introduction')) metrics.essentialSections.introduction = true;
          if (title.includes('getting started')) metrics.essentialSections.gettingStarted = true;
          if (title.includes('installation')) metrics.essentialSections.installation = true;
          if (title.includes('usage')) metrics.essentialSections.usage = true;
          if (title.includes('contributing')) metrics.essentialSections.contributing = true;
          if (title.includes('license')) metrics.essentialSections.license = true;
          if (title.includes('deployment')) metrics.essentialSections.deployment = true;
          if (title.includes('versioning')) metrics.essentialSections.versioning = true;
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
export function calculateRampUpScore(metrics: Metrics): [number, number] {
  const start = Date.now();
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
  let finalScore: number = (essentialScore + codeBlocksScore + linksScore) / 3;
  if (finalScore < 0) {
    finalScore = 0;
  }
  if (finalScore > 1) {
    finalScore = 1;
  }
  const end = Date.now();
  const duration = (end - start) / 1000;

  return [finalScore, duration];
}