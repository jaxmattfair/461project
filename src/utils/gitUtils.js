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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneRepository = cloneRepository;
exports.getReadmeContent = getReadmeContent;
exports.parseMarkdown = parseMarkdown;
var isomorphic_git_1 = require("isomorphic-git");
var fs = require("fs");
var module_1 = require("module");
var requires = (0, module_1.createRequire)(import.meta.url);
var http = requires('isomorphic-git/http/node'); // Import CommonJS module
var path = require("path");
var unified_1 = require("unified");
var remark_parse_1 = require("remark-parse");
var remark_gfm_1 = require("remark-gfm");
//Awaits git clone of repository 
function cloneRepository(repoUrl, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, isomorphic_git_1.default.clone({
                            fs: fs,
                            http: http,
                            dir: dir,
                            url: repoUrl,
                            singleBranch: true,
                            depth: 1,
                        })];
                case 1:
                    _a.sent();
                    console.log("Repository cloned to ".concat(dir));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to clone repository: ".concat(error_1.message));
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Function used to getReadMeContent from path, parses markdown document (md) into AST that can be analyzed
function getReadmeContent(repoDir) {
    var readMePath = path.join(repoDir, 'README.md');
    var readMeFilenames = [
        'README.md',
        'README.MD',
        'Readme.md',
        'ReadMe.md',
        'README',
        'readme.md',
        'readme',
    ];
    for (var _i = 0, readMeFilenames_1 = readMeFilenames; _i < readMeFilenames_1.length; _i++) {
        var filename = readMeFilenames_1[_i];
        var readmePath = path.join(repoDir, filename);
        if (fs.existsSync(readmePath)) {
            try {
                return fs.readFileSync(readmePath, 'utf-8');
            }
            catch (error) {
                console.error("Error reading ".concat(filename, ": ").concat(error.message));
                return null;
            }
        }
    }
    return null;
}
function parseMarkdown(content) {
    return (0, unified_1.unified)().use(remark_parse_1.default).use(remark_gfm_1.default).parse(content);
}
