import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
//grab CLI from file
import { program } from './cli';
program.parse(process.argv);
console.log("Test to see if npm start works");
async function main() {
    // Check command-line arguments
    const [, , modeOrPath] = process.argv;
    // Simulate 'install' command
    if (modeOrPath === 'install') {
        console.log('Installing dependencies...');
        setTimeout(() => console.log('7 dependencies installed...'), 1000);
        return;
    }
    // Handle file input
    if (fs.existsSync(modeOrPath)) {
        console.log(`Ranking modules from the file: ${modeOrPath}`);
        const filePath = path.resolve(modeOrPath);
        const urls = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
        console.log(`Found ${urls.length} URLs:`);
        urls.forEach((url, index) => console.log(`${index + 1}. ${url}`));
    }
    else {
        // Prompt user if invalid input
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Invalid input! Choose an action:',
                choices: ['Install dependencies', 'Exit']
            }
        ]);
        if (answers.action === 'Install dependencies') {
            console.log('Installing dependencies...');
            setTimeout(() => console.log('7 dependencies installed...'), 1000);
        }
        else {
            console.log('Exiting...');
        }
    }
}
main();
