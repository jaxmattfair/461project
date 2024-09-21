import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs-extra';
import path from 'path';
import { computeCorrectnessMetric } from '../src/yourModulePath'; // Adjust the path accordingly

describe('Test Suite Detection', function () {
  let lstatStub: sinon.SinonStub;
  let readJsonStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub fs-extra functions
    lstatStub = sinon.stub(fs, 'lstat');
    readJsonStub = sinon.stub(fs, 'readJson');
  });

  afterEach(() => {
    sinon.restore(); // Restore all stubbed methods to their original state
  });

  it('should return 1.0 if a test directory is found', async function () {
    // Simulate the presence of a "test" directory
    lstatStub.withArgs(sinon.match(path.join('repo', 'test'))).resolves({ isDirectory: () => true });

    const result = await computeCorrectnessMetric('repo');
    expect(result).to.equal(1.0);
  });

  it('should return 1.0 if a package.json contains a test script', async function () {
    // Simulate that no test directory is found
    lstatStub.rejects({ code: 'ENOENT' });

    // Simulate the presence of a package.json with a test script
    lstatStub.withArgs(sinon.match(path.join('repo', 'package.json'))).resolves({ isFile: () => true });
    readJsonStub.resolves({ scripts: { test: 'mocha' } });

    const result = await computeCorrectnessMetric('repo');
    expect(result).to.equal(1.0);
  });

  it('should return 0.0 if no test suite is found', async function () {
    // Simulate that no test directories are found
    lstatStub.rejects({ code: 'ENOENT' });

    // Simulate that package.json does not exist
    lstatStub.withArgs(sinon.match(path.join('repo', 'package.json'))).rejects({ code: 'ENOENT' });

    const result = await computeCorrectnessMetric('repo');
    expect(result).to.equal(0.0);
  });
});
