import { Command } from 'commander';

//Create new command program
const program = new Command();

//Set CLI details
program
    .name('run')
    .description('description for this CLI for project phase 1')
    .version('1.0.0');

program
  .command('greet <name>')
  .description('Greet a user by name')
  .action((name) => {
    console.log(`Hello, ${name}!`);
  });

export { program };

