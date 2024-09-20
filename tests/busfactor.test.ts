import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import { getMetricScore } from '../src/metrics/busfactor2.ts'; // Adjust the path as needed

describe('GitHub Metrics', function () {
  let axiosGetStub: sinon.SinonStub;

  beforeEach(function () {
    // Stub the Axios get method to mock GitHub API responses
    axiosGetStub = sinon.stub(axios, 'get');
  });

  afterEach(function () {
    // Restore the original Axios get method after each test
    axiosGetStub.restore();
  });

  // Test Case 1: Test successful metric calculation with mock data
  it('should calculate the metric score correctly based on mocked API data', async function () {
    // Mock API responses for contributors, workflow runs, pull requests, and issues
    axiosGetStub.withArgs(sinon.match(/contributors/)).resolves({
      data: [{}, {}, {}], // 3 contributors
    });

    axiosGetStub.withArgs(sinon.match(/actions\/runs/)).resolves({
      data: [{}, {}, {}, {}], // 4 CI/CD runs
    });

    axiosGetStub.withArgs(sinon.match(/pulls/)).resolves({
      data: [{ created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-02T00:00:00Z' }], // 1 PR with 24-hour response time
    });

    axiosGetStub.withArgs(sinon.match(/issues/)).resolves({
      data: [
        { state: 'open', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T12:00:00Z' }, // 12-hour response time
        { state: 'closed', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-02T00:00:00Z' }, // 24-hour response time
      ],
    });

    const consoleLogStub = sinon.stub(console, 'log'); // To suppress logs during the test

    // Run the metric calculation function
    await getMetricScore();

    // Verify the metric score calculation based on the mocked data
    expect(consoleLogStub.calledWithMatch(/Total Unique Contributors: 3/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Total CI\/CD Tests: 4/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Total Pull Requests: 1/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Open Issues: 1/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Closed Issues: 1/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Average Response Time \(hours\): 18.00/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Metric Score: \d+\.\d+/)).to.be.true;

    consoleLogStub.restore();
  });

  // Test Case 2: Test when there are no contributors, no CI/CD runs, no PRs, and no issues
  it('should calculate the metric score as 0 when there is no data', async function () {
    // Mock API responses with no data
    axiosGetStub.withArgs(sinon.match(/contributors/)).resolves({
      data: [],
    });

    axiosGetStub.withArgs(sinon.match(/actions\/runs/)).resolves({
      data: [],
    });

    axiosGetStub.withArgs(sinon.match(/pulls/)).resolves({
      data: [],
    });

    axiosGetStub.withArgs(sinon.match(/issues/)).resolves({
      data: [],
    });

    const consoleLogStub = sinon.stub(console, 'log'); // To suppress logs during the test

    // Run the metric calculation function
    await getMetricScore();

    // Verify the metric score calculation based on the mocked data
    expect(consoleLogStub.calledWithMatch(/Total Unique Contributors: 0/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Total CI\/CD Tests: 0/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Total Pull Requests: 0/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Open Issues: 0/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Closed Issues: 0/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Average Response Time \(hours\): 0.00/)).to.be.true;
    expect(consoleLogStub.calledWithMatch(/Metric Score: 0.00/)).to.be.true;

    consoleLogStub.restore();
  });
});
