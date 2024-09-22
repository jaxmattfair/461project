import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs-extra';
import * as gitUtils from '../utils/gitUtils.js';
import * as busFactor from './busFactorScore.js';
import * as correctness from './correctnessScore.js';
import * as license from './license.js';
import * as rampUp from './rampUpScore.js';
import * as responsiveness from './responsiveMaintainer.js';
import { calculateNetScore } from './netScore.js';

describe('calculateNetScore - Additional Test Cases', function () {
    let cloneRepositoryStub: sinon.SinonStub;
    let getReadmeContentStub: sinon.SinonStub;
    let getMetricScoreStub: sinon.SinonStub;
    let computeCorrectnessMetricStub: sinon.SinonStub;
    let extractLicenseInfoStub: sinon.SinonStub;
    let calculateRampUpScoreStub: sinon.SinonStub;
    let calculateResponsivenessStub: sinon.SinonStub;

    const repoURL = 'https://github.com/sample/repo';
    const tempDir = './temp-repo';

    beforeEach(() => {
        // Stubbing the required methods
        cloneRepositoryStub = sinon.stub(gitUtils, 'cloneRepository');
        getReadmeContentStub = sinon.stub(gitUtils, 'getReadmeContent');
        getMetricScoreStub = sinon.stub(busFactor, 'getMetricScore');
        computeCorrectnessMetricStub = sinon.stub(correctness, 'computeCorrectnessMetric');
        extractLicenseInfoStub = sinon.stub(license, 'extractLicenseInfo');
        calculateRampUpScoreStub = sinon.stub(rampUp, 'calculateRampUpScore');
        calculateResponsivenessStub = sinon.stub(responsiveness, 'calculateResponsiveness');
    });

    afterEach(() => {
        // Restore original methods after each test case
        sinon.restore();
    });

    it('should handle failure in cloning the repository', async () => {
        // Simulate a failure in the cloning process
        cloneRepositoryStub.rejects(new Error('Cloning failed'));

        const result = await calculateNetScore(repoURL, tempDir);

        // Expect null result as the cloning failed
        expect(result).to.be.null;
    });

    it('should handle missing README file gracefully', async () => {
        // Simulate successful cloning
        cloneRepositoryStub.resolves();
        // Simulate missing README file
        getReadmeContentStub.returns('null');

        // Providing default scores for other metric calculations
        getMetricScoreStub.resolves([0.5, 1]);
        computeCorrectnessMetricStub.resolves([0.7, 1]);
        extractLicenseInfoStub.resolves([0.6, 1]);
        calculateRampUpScoreStub.returns([0, 0]); // Ramp-up score is zero since there's no README
        calculateResponsivenessStub.resolves([0.8, 1]);

        const result = await calculateNetScore(repoURL, tempDir);

        expect(result).to.deep.equal({
            NetScore: 0.5 * 0.1 + 0.6 * 0.3 + 0.8 * 0.4 + 0 * 0.1 + 0.7 * 0.1,
            NetScore_Latency: result.NetScore_Latency,
            RampUp: 0,
            RampUp_Latency: 0,
            Correctness: 0.7,
            Correctness_Latency: 1,
            BusFactor: 0.5,
            BusFactor_Latency: 1,
            ResponsiveMaintainer: 0.8,
            ResponsiveMaintainer_Latency: 1,
            License: 0.6,
            License_Latency: 1,
        });
    });

    it('should handle errors during metric calculations gracefully', async () => {
        // Simulate successful cloning
        cloneRepositoryStub.resolves();
        // Simulate the presence of a README file
        getReadmeContentStub.returns('# Sample README');

        // Simulate some metric calculation errors
        getMetricScoreStub.rejects(new Error('GitHub API error'));
        computeCorrectnessMetricStub.rejects(new Error('Could not access files'));
        extractLicenseInfoStub.resolves([0.6, 1]);
        calculateRampUpScoreStub.returns([0.9, 0.5]);
        calculateResponsivenessStub.resolves([0.8, 1]);

        const result = await calculateNetScore(repoURL, tempDir);

        expect(result).to.deep.equal({
            NetScore: 0.0 * 0.1 + 0.6 * 0.3 + 0.8 * 0.4 + 0.9 * 0.1 + 0.0 * 0.1,
            NetScore_Latency: result.NetScore_Latency,
            RampUp: 0.9,
            RampUp_Latency: 0.5,
            Correctness: 0.0, // Default to 0 due to error
            Correctness_Latency: 0,
            BusFactor: 0.0, // Default to 0 due to error
            BusFactor_Latency: 0,
            ResponsiveMaintainer: 0.8,
            ResponsiveMaintainer_Latency: 1,
            License: 0.6,
            License_Latency: 1,
        });
    });

    it('should calculate the net score correctly with all metrics present', async () => {
        // Simulate successful cloning
        cloneRepositoryStub.resolves();
        // Simulate the presence of a README file
        getReadmeContentStub.returns('# Sample README');

        // Provide mock values for all metric calculations
        getMetricScoreStub.resolves([0.8, 2]);
        computeCorrectnessMetricStub.resolves([0.9, 3]);
        extractLicenseInfoStub.resolves([0.7, 1]);
        calculateRampUpScoreStub.returns([0.6, 0.5]);
        calculateResponsivenessStub.resolves([0.75, 2]);

        const result = await calculateNetScore(repoURL, tempDir);

        expect(result).to.deep.equal({
            NetScore: 0.8 * 0.1 + 0.7 * 0.3 + 0.75 * 0.4 + 0.6 * 0.1 + 0.9 * 0.1,
            NetScore_Latency: result.NetScore_Latency,
            RampUp: 0.6,
            RampUp_Latency: 0.5,
            Correctness: 0.9,
            Correctness_Latency: 3,
            BusFactor: 0.8,
            BusFactor_Latency: 2,
            ResponsiveMaintainer: 0.75,
            ResponsiveMaintainer_Latency: 2,
            License: 0.7,
            License_Latency: 1,
        });
    });
});
