"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//grab CLI from file
const cli_1 = require("./cli");
cli_1.program.parse(process.argv);
console.log("Test to see if npm start works");
