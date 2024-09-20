var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as git from 'isomorphic-git';
import * as fs from 'fs';
import http from 'isomorphic-git/http/node';
import * as path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
//Awaits git clone of repository 
export function cloneRepository(repoUrl, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield git.clone({
                fs,
                http,
                dir,
                url: repoUrl,
                singleBranch: true,
                depth: 1,
            });
            console.log(`Repository cloned to ${dir}`);
        }
        catch (error) {
            console.error(`Failed to clone repository: ${error.message}`);
            throw error;
        }
    });
}
//Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
export function getReadmeContent(repoDir) {
    const readMePath = path.join(repoDir, 'README.md');
    const readMeFilenames = [
        'README.md',
        'README.MD',
        'Readme.md',
        'ReadMe.md',
        'README',
        'readme.md',
        'readme',
    ];
    for (const filename of readMeFilenames) {
        const readmePath = path.join(repoDir, filename);
        if (fs.existsSync(readmePath)) {
            try {
                return fs.readFileSync(readmePath, 'utf-8');
            }
            catch (error) {
                console.error(`Error reading ${filename}: ${error.message}`);
                return null;
            }
        }
    }
    return null;
}
export function parseMarkdown(content) {
    return unified().use(remarkParse).use(remarkGfm).parse(content);
}
