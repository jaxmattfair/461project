// tests/license.test.ts
import { extractLicenseInfo } from '../src/metrics/license';
import { getLicenseFileContent } from '../src/utils/gitUtils';
// Mock the 'getLicenseFileContent' function from 'gitUtils.js'
jest.mock('../src/utils/gitUtils', () => ({
    getLicenseFileContent: jest.fn(),
}));
// Type casting for TypeScript
const mockedGetLicenseFileContent = getLicenseFileContent;
describe('extractLicenseInfo', () => {
    afterEach(() => {
        jest.resetAllMocks(); // Reset mocks after each test
    });
    it('should return [1, duration] when license is found in README and matches LGPL v2.1', async () => {
        const dir = './temp-repo';
        const readmeContent = `
    # Some Project

    ## License
    GNU Lesser General Public License v2.1.
    `;
        // Mock 'getLicenseFileContent' to return null (no LICENSE file)
        mockedGetLicenseFileContent.mockReturnValue(null);
        const [licenseScore, duration] = await extractLicenseInfo(dir, readmeContent);
        expect(licenseScore).toBe(1); // LGPL v2.1 found
        expect(duration).toBeGreaterThanOrEqual(0); // Duration should be non-negative
    });
    it('should return [1, duration] when license is found in LICENSE file and matches LGPL v2.1', async () => {
        const dir = './temp-repo';
        const readmeContent = null; // No README content
        // Mock 'getLicenseFileContent' to return LGPL v2.1 license text
        mockedGetLicenseFileContent.mockReturnValue('GNU Lesser General Public License v2.1');
        const [licenseScore, duration] = await extractLicenseInfo(dir, readmeContent);
        expect(licenseScore).toBe(1); // LGPL v2.1 found
        expect(duration).toBeGreaterThanOrEqual(0); // Duration should be non-negative
    });
    it('should return [0, 0] when no license is found', async () => {
        const dir = './temp-repo';
        const readmeContent = '# Some Project\nNo license here.';
        // Mock 'getLicenseFileContent' to return null (no LICENSE file)
        mockedGetLicenseFileContent.mockReturnValue(null);
        const [licenseScore, duration] = await extractLicenseInfo(dir, readmeContent);
        expect(licenseScore).toBe(0); // No license found
        expect(duration).toBe(0); // Duration should be 0
    });
    it('should return [0, duration] when license is found but does not match LGPL v2.1', async () => {
        const dir = './temp-repo';
        const readmeContent = `
    # Some Project

    ## License
    This project is licensed under the MIT License.
    `;
        // Mock 'getLicenseFileContent' to return null (no LICENSE file)
        mockedGetLicenseFileContent.mockReturnValue(null);
        const [licenseScore, duration] = await extractLicenseInfo(dir, readmeContent);
        expect(licenseScore).toBe(0); // License found but does not match LGPL v2.1
        expect(duration).toBeGreaterThanOrEqual(0); // Duration should be non-negative
    });
});
