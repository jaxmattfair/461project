import { expect } from 'chai';
import { getMetricScore } from '../src/metrics/busFactorScore'; // Adjust the path accordingly

describe('getMetricScore Function Tests', function () {
  
  // Test Case 1: Valid Repository
  it('should return a valid metric score and execution time for an active repository', async function () {
    const [score, duration] = await getMetricScore('raoakanksh', '461project'); // Replace with an actual public repo you have access to
    expect(score).to.be.a('number');
    expect(score).to.be.within(0, 1);
    expect(duration).to.be.a('number');
    expect(duration).to.be.greaterThan(0);
  });

  // Test Case 2: Non-Existent Repository
  it('should return a score of -1 and a duration of -1 for a non-existent repository', async function () {
    const [score, duration] = await getMetricScore('nonexistentuser', 'nonexistentrepo');
    expect(score).to.equal(-1);
    expect(duration).to.equal(-1);
  });

  // Test Case 3: Repository with No Contributors
  it('should return a score close to 0 for a repository with no activity', async function () {
    const [score, duration] = await getMetricScore('owner', 'empty-repo'); // Replace with an actual empty or inactive public repo
    expect(score).to.be.a('number');
    expect(score).to.be.at.most(0.1); // Since it has minimal or no activity
    expect(duration).to.be.a('number');
    expect(duration).to.be.greaterThan(0);
  });
});
