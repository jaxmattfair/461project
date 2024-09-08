"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
//Create new command program
const program = new commander_1.Command();
//Set CLI details
program
    .name('run')
    .description('description for this CLI for project phase 1')
    .version('1.0.0');
