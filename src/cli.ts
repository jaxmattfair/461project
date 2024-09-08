import { Command } from 'commander';

//Create new command program
const program = new Command();

//Set CLI details
program
    .name('run')
    .description('description for this CLI for project phase 1')
    .version('1.0.0');

program.parse(process.argv);

export { program };
