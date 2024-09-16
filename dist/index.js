"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
//grab CLI from file
const cli_1 = require("./cli");
cli_1.program.parse(process.argv);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check command-line arguments
        const [, , modeOrPath] = process.argv;
        // Simulate 'install' command
        if (modeOrPath === 'install') {
            console.log('Installing dependencies...');
            setTimeout(() => console.log('7 dependencies installed...'), 1000);
            return;
        }
        // Handle file input
        if (fs_1.default.existsSync(modeOrPath)) {
            console.log(`Ranking modules from the file: ${modeOrPath}`);
            const filePath = path_1.default.resolve(modeOrPath);
            const urls = fs_1.default.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
            console.log(`Found ${urls.length} URLs:`);
            urls.forEach((url, index) => console.log(`${index + 1}. ${url}`));
        }
        else {
            // Prompt user if invalid input
            const answers = yield inquirer_1.default.prompt([
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
    });
}
main();
