#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const { getMetricScore } = require('./busfactor'); // Adjust as necessary
const { getLicenseScore } = require('./license'); // Import your license function
const { getRampUpScore } = require('./rampUp'); // Import your rampUpScore function

const [,, command, arg] = process.argv;

const installDependencies = () => {
    return new Promise((resolve, reject) => {
        exec('npm install --save', (error, stdout, stderr) => {
            if (error) {
                console.error(`Install error: ${stderr}`);
                return reject(1);
            }
            console.log(stdout);
            resolve(0);
        });
    });
};

const processUrls = async (urlFile) => {
    return new Promise((resolve, reject) => {
        fs.readFile(urlFile, 'utf-8', async (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                return reject(1);
            }

            const urls = data.split('\n').filter(Boolean);
            const results = [];

            for (const url of urls) {
                const startTime = Date.now();

                // Fetch scores for each metric
                const metricScore = await getMetricScore(url);
                const licenseScore = await getLicenseScore(url);
                const rampUpScore = await getRampUpScore(url);

                const endTime = Date.now();

                results.push({
                    URL: url,
                    NetScore: metricScore.NetScore,
                    License: licenseScore,
                    RampUp: rampUpScore,
                    NetScore_Latency: ((endTime - startTime) / 1000).toFixed(3), // Calculate latency
                    // Include other latency values as needed
                });
            }

            results.forEach(result => {
                console.log(JSON.stringify(result)); // Output in NDJSON format
            });
            resolve(0);
        });
    });
};

const runTests = () => {
    return new Promise((resolve, reject) => {
        exec('npm test', (error, stdout, stderr) => {
            if (error) {
                console.error(`Test error: ${stderr}`);
                return reject(1);
            }
            console.log(stdout);
            resolve(0);
        });
    });
};

(async () => {
    try {
        switch (command) {
            case 'install':
                await installDependencies();
                break;
            case 'test':
                await runTests();
                break;
            default:
                if (arg) {
                    await processUrls(arg);
                } else {
                    console.error('Please provide a valid command: install, URL_FILE, or test.');
                    process.exit(1);
                }
        }
        process.exit(0);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
})();
