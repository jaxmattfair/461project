// tests/comprehensiveTests.test.ts
import { analyzeReadme, calculateRampUpScore } from '../src/metrics/rampUpScore';
import { extractLicenseInfo } from '../src/metrics/license';
import { fromMarkdown } from 'mdast-util-from-markdown';
import axios from 'axios';
import fs from 'fs-extra';
jest.mock('axios');
jest.mock('fs-extra');
const mockedAxios = axios;
describe('Comprehensive Module Tests', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    // RampUpScore Tests (3)
    describe('RampUpScore', () => {
        it('1. should correctly analyze README with all sections, multiple code blocks, and links', () => {
            const markdown = `
# Introduction
This is an introduction.
## Getting Started
How to get started.
### Installation
Installation instructions.
\`\`\`
npm install package
\`\`\`
#### Usage
Usage examples.
\`\`\`
const example = require('package');
example.doSomething();
\`\`\`
##### Contributing
How to contribute.
###### License
MIT License
####### Deployment
Deployment instructions.
######## Versioning
Versioning information.
[Link 1](https://example1.com)
[Link 2](https://example2.com)
`;
            const ast = fromMarkdown(markdown);
            const metrics = analyzeReadme(ast);
            expect(metrics.essentialSections).toEqual({
                introduction: true,
                gettingStarted: true,
                installation: true,
                usage: true,
                contributing: true,
                license: true,
                deployment: true,
                versioning: true
            });
            expect(metrics.codeBlocks).toBe(2);
            expect(metrics.links).toBe(2);
        });
        it('2. should calculate perfect ramp-up score with maximum code blocks and links', () => {
            const metrics = {
                essentialSections: {
                    introduction: true,
                    gettingStarted: true,
                    installation: true,
                    usage: true,
                    contributing: true,
                    license: true,
                    deployment: true,
                    versioning: true
                },
                codeBlocks: 50,
                links: 50
            };
            const [score, duration] = calculateRampUpScore(metrics);
            expect(score).toBe(1);
            expect(duration).toBeGreaterThan(0);
        });
        it('3. should calculate ramp-up score with minimal content', () => {
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
                links: 0
            };
            const [score, duration] = calculateRampUpScore(metrics);
            expect(score).toBe(0);
            expect(duration).toBeGreaterThan(0);
        });
    });
    // License Tests (3)
    describe('License', () => {
        it('4. should detect LGPL v2.1 license in README with various phrasings', async () => {
            const readmeContents = [
                '# Project\n## License\nThis project is licensed under the GNU Lesser General Public License v2.1',
                '# Project\n## License\nLGPL-2.1',
                '# Project\n## License\nLGPL 2.1 License',
                '# Project\n## License\nhttps://www.gnu.org/licenses/old-licenses/lgpl-2.1.html'
            ];
            for (const content of readmeContents) {
                const [score, duration] = await extractLicenseInfo('/mock/path', content);
                expect(score).toBe(1);
                expect(duration).toBeGreaterThan(0);
            }
        });
        it('5. should detect LGPL v2.1 license in LICENSE file with various content', async () => {
            const licenseContents = [
                'GNU Lesser General Public License Version 2.1',
                'LGPL-2.1',
                'Lesser General Public License v2.1',
                'https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html'
            ];
            for (const content of licenseContents) {
                fs.readFile.mockResolvedValueOnce(content);
                const [score, duration] = await extractLicenseInfo('/mock/path', null);
                expect(score).toBe(1);
                expect(duration).toBeGreaterThan(0);
            }
        });
        it('6. should return 0 for various non-LGPL v2.1 licenses', async () => {
            const nonLGPLContents = [
                'MIT License',
                'Apache License 2.0',
                'GNU General Public License v3.0',
                'BSD 3-Clause License'
            ];
            for (const content of nonLGPLContents) {
                fs.readFile.mockResolvedValueOnce(content);
                const [score, duration] = await extractLicenseInfo('/mock/path', content);
                expect(score).toBe(0);
                expect(duration).toBeGreaterThan(0);
            }
        });
    });
});
