import { expect } from 'chai';
import sinon from 'sinon';
import * as gitUtils from '../src/utils/gitUtils';
import fs from 'fs';
import git from 'isomorphic-git';

// Mock data
const repoUrl = 'https://github.com/someuser/somerepo.git';
const dir = './temp-repo';

// Test Case 1: Mock repository cloning
describe('cloneRepository', function() {
    let cloneStub: sinon.SinonStub;

    before(function() {
        // Mock the git.clone method to simulate cloning a repository
        cloneStub = sinon.stub(git, 'clone').resolves();
    });

    after(function() {
        // Restore the original behavior of git.clone after tests
        cloneStub.restore();
    });

    it('should clone the repository successfully', async function() {
        await gitUtils.cloneRepository(repoUrl, dir);

        // Ensure that git.clone was called once with the expected arguments
        expect(cloneStub.calledOnce).to.be.true;
        expect(cloneStub.calledWith({
            fs,
            http: sinon.match.any,
            dir,
            url: repoUrl,
            singleBranch: true,
            depth: 1,
        })).to.be.true;
    });
});

// Test Case 2: Extract License Information from README and LICENSE
describe('extractLicenseInfo', function() {
    let readFileSyncStub: sinon.SinonStub;
    let cloneStub: sinon.SinonStub;

    before(function() {
        // Mock the git.clone method
        cloneStub = sinon.stub(git, 'clone').resolves();

        // Mock fs.readFileSync to simulate reading from a README file and LICENSE file
        readFileSyncStub = sinon.stub(fs, 'readFileSync');
    });

    after(function() {
        // Restore original behaviors
        cloneStub.restore();
        readFileSyncStub.restore();
    });

    it('should find the license in the README file', async function() {
        // Mock the content of the README file with a license section
        const readmeContent = `
        # Some Project

        ## License
        This project is licensed under the MIT License.
        `;
        readFileSyncStub.withArgs(sinon.match.string).returns(readmeContent);

        const licenseInfo = await gitUtils.extractLicenseInfo(repoUrl, dir);

        // Ensure the license was extracted from the README
        expect(licenseInfo).to.contain('MIT License');
    });

    it('should find the license in the LICENSE file when README has no license', async function() {
        // Simulate a README without a license and a LICENSE file with valid content
        readFileSyncStub.withArgs(sinon.match(/README/)).returns('# Some Project\nNo license here.');
        readFileSyncStub.withArgs(sinon.match(/LICENSE/)).returns('MIT License');

        const licenseInfo = await gitUtils.extractLicenseInfo(repoUrl, dir);

        // Ensure the license was extracted from the LICENSE file
        expect(licenseInfo).to.equal('MIT License');
    });

    it('should return null when no license is found', async function() {
        // Simulate both README and LICENSE files without license information
        readFileSyncStub.withArgs(sinon.match(/README/)).returns('# Some Project\nNo license here.');
        readFileSyncStub.withArgs(sinon.match(/LICENSE/)).returns('');

        const licenseInfo = await gitUtils.extractLicenseInfo(repoUrl, dir);

        // Ensure no license information is found
        expect(licenseInfo).to.be.null;
    });
});
