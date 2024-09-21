import { expect } from 'chai';
import { analyzeReadme, calculateRampUpScore } from '../src/readmeAnalyzer'; // Adjust the path to your module
import { Root } from 'mdast';

describe('README Analyzer', function () {
  
  // Test Case 1: Analyze a README with varying heading depths, code blocks, and links
  it('should correctly analyze a README with varying heading depths, code blocks, and links', function () {
    const mockReadmeAst: Root = {
      type: 'root',
      children: [
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Main Title' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Subheading' }] },
        { type: 'heading', depth: 3, children: [{ type: 'text', value: 'Details' }] },
        { type: 'heading', depth: 4, children: [{ type: 'text', value: 'Deep Dive' }] },
        { type: 'code', value: 'console.log("Hello World!");' },
        { type: 'code', value: 'const a = 10;' },
        { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'Example Link' }] },
        { type: 'link', url: 'https://example2.com', children: [{ type: 'text', value: 'Example Link 2' }] },
      ],
    };

    const metrics = analyzeReadme(mockReadmeAst);

    expect(metrics.headingDepth).to.equal(4); // Expect the deepest heading depth to be 4
    expect(metrics.codeBlocks).to.equal(2);   // Expect 2 code blocks
    expect(metrics.links).to.equal(2);        // Expect 2 links
  });

  // Test Case 2: Calculate a normalized ramp-up score with the new heading depth metric
  it('should correctly calculate a normalized ramp-up score based on metrics', function () {
    const mockMetrics = {
      headingDepth: 3,   // Example heading depth
      codeBlocks: 25,    // Half of the max
      links: 10,         // Less than max
    };

    const score = calculateRampUpScore(mockMetrics);
    
    const expectedHeadingDepthScore = 3 / 6; // Heading depth is 3 out of max 6
    const expectedCodeBlockScore = 25 / 50;  // 25 out of max 50
    const expectedLinksScore = 10 / 50;      // 10 out of max 50

    const expectedFinalScore = (expectedHeadingDepthScore + expectedCodeBlockScore + expectedLinksScore) / 3;

    expect(score).to.be.closeTo(expectedFinalScore, 0.01);
  });
});
