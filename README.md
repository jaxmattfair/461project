GitHub Repository Health Checker

This project is a tool which helps evaluate the health and quality of GitHub repositories based on several key metrics. The metrics are scored by looking at the number of contributors, presence of tests, and licensing information—the. Looking at all these our tool provides a score that reflects the overall sustainability and maintainability of the repo.

Features
The tool measures the health of a GitHub repository using the following metrics:

1. Bus Factor
The Bus Factor metric assesses the risk of knowledge loss in a project. It analyzes the following:

Unique Contributors: The number of contributors that have made changes to the repository. 
This is important because a higher number of contributors generally means the project is less reliant on a single person.

CI/CD Activity: The number of Continuous Integration/Continuous Deployment (CI/CD) tests run on the repository.

Pull Requests: The total number of open, closed, and merged pull requests. This shows how active the work is being done.

Issues: Both open and closed issues are analyzed to understand how actively the repository is being maintained.

The Bus Factor score is calculated by using these metrics.

2. Correctness
It checks for the presence of test directories (test, tests, __tests__) and test scripts in the package.json file.

This is important because this shows that the code is being regularly tested, which improves its reliability and reduces the chance of bugs. 

3. License
The License metric ensures the repository has proper licensing information, which is essential for legal use and distribution. The tool looks for a LICENSE file or a "License" section in the README file. It checks for licenses that are recognized as open-source, such as the GNU Lesser General Public License (LGPL) version 2.1.

A repository that includes a valid license will score 1 for this metric, while a repository without clear licensing information will score 0.

How It Works
The tool pulls data from the GitHub API for the given repository. It uses the repository URL to extract key information such as contributors, pull requests, issues, and workflow runs (CI/CD tests).

For correctness, the tool checks the file structure and the package.json file for any references to test suites. It looks for common test folder names and scripts.

The license check scans the repository for a LICENSE file or searches for a license section in the README. If an LGPL v2.1 license is detected, the repository scores 1 for the license metric.

Each metric is normalized, and a final score is produced to give an overall assessment of the repository's health.

Getting Started
Prerequisites
Node.js: Ensure you have Node.js installed on your machine.
GitHub Token: You will need a GitHub API token to access repository data. Add your token to a .env file in the root directory:
bash
Copy code
GITHUB_TOKEN=your_github_token_here
Installation
Clone the repository:
Also make sure you have jq installed.

bash
Copy code
git clone https://github.com/raoakanksh/461project.git
Navigate into the project directory:

bash
Copy code
cd 461project
Install the required dependencies:

bash
Copy code
npm install
Run the tool by executing the run file:

bash
Copy code
npm run start
Usage
To analyze a repository, update the repoURL variable in the busFactor.ts file with the repository URL you want to evaluate, then run the tool.

Example
For example, if you're evaluating the repository https://github.com/raoakanksh/461project.git, the tool will:

Fetch data from the GitHub API to calculate the Bus Factor based on the number of contributors, PRs, issues, and workflow runs.
Check if the repository contains a test suite or test scripts for the Correctness metric.
Search for licensing information to score the License metric.
The final output will be a score between 0 and 1, representing the repository's overall health.

Limitations
The tool currently supports GitHub repositories only.
It relies on the repository structure being somewhat standard (i.e., using common test directory names or containing a LICENSE file).
The Bus Factor score is based on predefined maximum values for contributors, PRs, and issues, which may need to be adjusted for very large or very small repositories.
Contributing
Feel free to open issues or submit pull requests if you'd like to contribute to this project. Contributions are welcome!

License
This project is open-source and is distributed under the MIT License. See the LICENSE file for more details.
message.txt
5 KB