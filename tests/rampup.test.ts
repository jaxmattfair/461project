import { expect } from 'chai';
import { analyzeReadme, calculateRampUpScore } from '../src/rampUpScore';
import { Root } from 'mdast';

// Test suite for `analyzeReadme`
describe('analyzeReadme', () => {

  // Test Case 1: Check if essential sections are correctly identified
  it('should correctly identify essential sections', () => {
    const mockContent: Root = {
      type: 'root',
      children: [
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Introduction' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Getting Started' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Installation' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Usage' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Contributing' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'License' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Deployment' }] },
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Versioning' }] },
      ],
    };

    const metrics = analyzeReadme(mockContent);
    expect(metrics.essentialSections.introduction).to.be.true;
    expect(metrics.essentialSections.gettingStarted).to.be.true;
    expect(metrics.essentialSections.installation).to.be.true;
    expect(metrics.essentialSections.usage).to.be.true;
    expect(metrics.essentialSections.contributing).to.be.true;
    expect(metrics.essentialSections.license).to.be.true;
    expect(metrics.essentialSections.deployment).to.be.true;
    expect(metrics.essentialSections.versioning).to.be.true;
  });

  // Test Case 2: Check if code blocks and links are correctly counted
  it('should correctly count code blocks and links', () => {
    const mockContent: Root = {
      type: 'root',
      children: [
        { type: 'code', value: 'console.log("Hello, world!");' },
        { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'Example' }] },
        { type: 'link', url: 'https://example.com', children: [{ type: 'text', value: 'Example' }] },
      ],
    };

    const metrics = analyzeReadme(mockContent);
    expect(metrics.codeBlocks).to.equal(1);
    expect(metrics.links).to.equal(2);
  });

  // Test Case 3: Handle an empty README gracefully
  it('should handle an empty README gracefully', () => {
    const mockContent: Root = { type: 'root', children: [] };
    const metrics = analyzeReadme(mockContent);
    expect(metrics.essentialSections.introduction).to.be.false;
    expect(metrics.codeBlocks).to.equal(0);
    expect(metrics.links).to.equal(0);
  });
});

// Test suite for `calculateRampUpScore`
describe('calculateRampUpScore', () => {

  // Test Case 4: Return a perfect score when all sections are present with maximum code blocks and links
  it('should return a perfect score when all sections are present with maximum code blocks and links', () => {
    const metrics = {
      essentialSections: {
        introduction: true,
        installation: true,
        gettingStarted: true,
        usage: true,
        contributing: true,
        license: true,
        deployment: true,
        versioning: true,
      },
      codeBlocks: 50, // Max value
      links: 50,      // Max value
    };

    const [score, duration] = calculateRampUpScore(metrics);
    expect(score).to.equal(1);
  });

  // Test Case 5: Return a score of 0 when no sections, code blocks, or links are present
  it('should return a score of 0 when no sections, code blocks, or links are present', () => {
    const metrics = {
      essentialSections: {
        introduction: false,
        installation: false,
        gettingStarted: false,
        usage: false,
        contributing: false,
        license: false,
        deployment: false,
        versioning: false,
      },
      codeBlocks: 0,
      links: 0,
    };

    const [score, duration] = calculateRampUpScore(metrics);
    expect(score).to.equal(0);
  });

  // Test Case 6: Correctly normalize code blocks and links when they exceed the maximum expected values
  it('should correctly normalize code blocks and links when they exceed the maximum expected values', () => {
    const metrics = {
      essentialSections: {
        introduction: true,
        installation: true,
        gettingStarted: true,
        usage: true,
        contributing: false,
        license: false,
        deployment: false,
        versioning: false,
      },
      codeBlocks: 100, // Exceeds max
      links: 100,      // Exceeds max
    };

    const [score, duration] = calculateRampUpScore(metrics);
    expect(score).to.be.greaterThan(0);
    expect(score).to.be.lessThan(1); // Since not all sections are present, should be less than 1
  });

  // Test Case 7: Calculate an average score when sections, code blocks, and links are partially present
  it('should calculate an average score when sections, code blocks, and links are partially present', () => {
    const metrics = {
      essentialSections: {
        introduction: true,
        installation: false,
        gettingStarted: true,
        usage: false,
        contributing: false,
        license: true,
        deployment: false,
        versioning: false,
      },
      codeBlocks: 25, // 50% of the max
      links: 25,      // 50% of the max
    };

    const [score, duration] = calculateRampUpScore(metrics);
    expect(score).to.be.greaterThan(0);
    expect(score).to.be.lessThan(1);
  });
});
