import git from 'isomorphic-git';
import * as fs from 'fs';
import * as path from 'path';
import { Root } from 'mdast';
import { Node } from 'unist';
import { toString } from 'mdast-util-to-string';


// Define interfaces for metrics
interface Metrics {
    essentialSections: EssentialSections;
    codeBlocks: number;
    links: number;
}

interface EssentialSections {
    introduction: boolean;
    installation: boolean;
    usage: boolean;
    contributing: boolean;
    license: boolean;
}


export function analyzeReadme(content: Root): Metrics {
    const metrics: Metrics = {
      essentialSections: {
        introduction: false,
        gettingStarted: false,
        installation: false,
        usage: false,
        contributing: false,
        license: false,
      },
      codeBlocks: 0,
      links: 0,
    };
  
    function traverse(node: Node) {
      switch (node.type) {
        case 'heading':
          const title = toString(node).toLowerCase();
          console.log(title);
          if (title.includes('introduction')) metrics.essentialSections.introduction = true;
          if (title.includes('getting started')) metrics.essentialSections.gettingStarted = true;
          if (title.includes('installation')) metrics.essentialSections.installation = true;
          if (title.includes('usage')) metrics.essentialSections.usage = true;
          if (title.includes('contributing')) metrics.essentialSections.contributing = true;
          if (title.includes('license')) metrics.essentialSections.license = true;
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
  
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }
  
    traverse(content);
  
    return metrics;
  }