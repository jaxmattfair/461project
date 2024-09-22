import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs-extra';
import path from 'path';
import { computeCorrectnessMetric } from '../src/yourModulePath'; // Adjust the path accordingly

describe('Correctness Metric', function () {
  let lstatStub: sinon.SinonStub;
  let readJsonStub: sinon.SinonStub;

  // Set up stubs before each test
  beforeEach(() => {
    lstatStub = sinon.stub(fs, 'lstat'); // Stub the 'lstat' function to simulate file system behavior
    readJsonStub = sinon.stub(fs, 'readJson'); // Stub the 'readJson' function to simulate reading JSON files
  });

  // Restore stubs after each test
  afterEach(() => {
    sinon.restore(); // Restore all stubbed methods to their original state
  });

  it('should return 1.0 when a test suite directory is found', async function () {
    // Test Case 1: Simulate the presence of a test suite directory
    // Mocking 'lstat' to resolve as if the "test" directory exists
    lstatStub.withArgs(sinon.match(path.join('repoPath', 'test'))).resolves({ isDirectory: () => true });

    const [score, duration] = await computeCorrectnessMetric('repoPath');

    // Assertions
    expect(score).to.equal(1.0); // Expect a score of 1.0
    expect(duration).to.be.a('number'); // Ensure that the duration is a number
  });

  it('should return 1.0 when package.json contains a test script', async function () {
    // Test Case 2: Simulate the presence of a test script in package.json
    // Mocking 'lstat' to reject as if the "test" directory does not exist
    lstatStub.rejects({ code: 'ENOENT' });

    // Mocking 'lstat' to resolve as if "package.json" exists
    lstatStub.withArgs(sinon.match(path.join('repoPath', 'package.json'))).resolves({ isFile: () => true });

    // Simulate that the "package.json" contains a test script
    readJsonStub.resolves({ scripts: { test: 'mocha' } });

    const [score, duration] = await computeCorrectnessMetric('repoPath');

    // Assertions
    expect(score).to.equal(1.0); // Expect a score of 1.0
    expect(duration).to.be.a('number'); // Ensure that the duration is a number
  });

  it('should return 0.0 when no test suite directory or test script is found', async function () {
    // Test Case 3: Simulate the absence of both test suite directory and test script
    // Mocking 'lstat' to reject as if the "test" directory does not exist
    lstatStub.rejects({ code: 'ENOENT' });

    // Mocking 'lstat' to reject as if "package.json" does not exist
    lstatStub.withArgs(sinon.match(path.join('repoPath', 'package.json'))).rejects({ code: 'ENOENT' });

    const [score, duration] = await computeCorrectnessMetric('repoPath');

    // Assertions
    expect(score).to.equal(0.0); // Expect a score of 0.0
    expect(duration).to.be.a('number'); // Ensure that the duration is a number
  });

  it('should handle errors gracefully and return 0.0', async function () {
    // Test Case 4: Simulate an unexpected error during test directory access
    // Mocking 'lstat' to throw an unexpected error
    lstatStub.withArgs(sinon.match(path.join('repoPath', 'test'))).rejects(new Error('Unexpected error'));

    const [score, duration] = await computeCorrectnessMetric('repoPath');

    // Assertions
    expect(score).to.equal(0.0); // Expect a score of 0.0
    expect(duration).to.be.a('number'); // Ensure that the duration is a number
  });
});
