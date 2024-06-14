#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
// ------------------------------------------------------------------------
// Copyright (c) 2018-2024 Alexandre Bento Freire. All rights reserved.
// Licensed under the MIT License.
// ------------------------------------------------------------------------
var sysFs = require("fs");
var sysPath = require("path");
var prompts = require("prompts");
var program = require("commander");
var moment = require("moment");
var chatApi = require("facebook-chat-api");
// ------------------------------------------------------------------------
//                               Defaults
// ------------------------------------------------------------------------
var DEF_FIELD_NAMES = ['date', 'sender', 'message'];
var DEF_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
var VERSION = '0.1.5';
parseCommandLine();
// ------------------------------------------------------------------------
//                               Command Line
// ------------------------------------------------------------------------
function parseCommandLine() {
    return __awaiter(this, void 0, void 0, function () {
        function collect(item, list) {
            list.push(item);
            return list;
        }
        var email, password, stateFile, toWriteStateFile, threadListOpts, chatOpts, answers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    program
                        .version(VERSION)
                        // login
                        .option('-e, --email [email]', 'email')
                        .option('-p, --password [password]', 'password')
                        .option('-s, --state-file [state-file]', 'state filename')
                        .option('-S, --write-state-file', 'if present, it will write the statefile')
                        // threads file
                        .option('-t, --threads-file [threads-file]', 'threads filename')
                        .option('-T, --write-threads-file', 'if present, it will write the chat threads file')
                        .option('-l, --limit [chat-thread-limit]', 'maximum number of chat threads', parseInt)
                        .option('-g, --tag [tag]', 'list of tags: INBOX,ARCHIVED,PENDING,OTHER', collect, [])
                        // chats
                        .option('-n, --chat-name [name]', 'list of chat names to download', collect, [])
                        .option('-R, --raw', 'if present and output is json, it will store in raw format')
                        .option('-O, --output-folder [folder]', 'output folder')
                        .option('-N, --output-field-name [fields]', 'list of fields names for non-raw storage: ' +
                        DEF_FIELD_NAMES.join(', '), collect, [])
                        .option('-F, --output-file-format [format]', 'output file format: txt,json', /^(txt|json)$/i)
                        .option('-D, --output-date-format [date-format]', 'output date-time format. see moment.js')
                        // convert
                        .option('-c, --convert', 'converts from raw chat file into another format')
                        .parse(process.argv);
                    email = program.email;
                    password = program.password;
                    stateFile = program.stateFile;
                    toWriteStateFile = program.writeStateFile;
                    if (!toWriteStateFile && stateFile && !sysFs.existsSync(stateFile)) {
                        return [2 /*return*/, console.error("State file " + stateFile + " doesn't exists")];
                    }
                    threadListOpts = parseThreadListOptions();
                    if (!threadListOpts) {
                        return [2 /*return*/];
                    }
                    chatOpts = parseChatOptions();
                    if (!chatOpts) {
                        return [2 /*return*/];
                    }
                    if (!((toWriteStateFile || !stateFile) && (!email || !password))) return [3 /*break*/, 2];
                    return [4 /*yield*/, getPromptQuestions(!email, !password)];
                case 1:
                    answers = _a.sent();
                    email = email || answers.email;
                    password = password || answers.password;
                    _a.label = 2;
                case 2:
                    if (!chatOpts.toConvert) {
                        login(email, password, stateFile, toWriteStateFile, function (api) {
                            getThreadList(api, threadListOpts, function () {
                                threadListToNamesThreads(threadListOpts);
                                getChats(api, threadListOpts, chatOpts);
                            });
                        });
                    }
                    else {
                        convertFromRaw(threadListOpts, chatOpts);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// ------------------------------------------------------------------------
//                               Prompt
// ------------------------------------------------------------------------
function getPromptQuestions(reqEMail, reqPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var questions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    questions = [];
                    if (reqEMail) {
                        questions.push({
                            type: 'text',
                            name: 'email',
                            message: 'email:',
                        });
                    }
                    if (reqPassword) {
                        questions.push({
                            type: 'password',
                            name: 'password',
                            message: 'password:',
                        });
                    }
                    return [4 /*yield*/, prompts(questions)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// ------------------------------------------------------------------------
//                               Login
// ------------------------------------------------------------------------
function login(email, password, stateFile, toWriteStateFile, callback) {
    var options = (toWriteStateFile || !stateFile) ? {
        email: email,
        password: password,
    } : { appState: JSON.parse(sysFs.readFileSync(stateFile, 'utf8')) };
    chatApi(options, function (err, api) {
        if (err) {
            return console.error(err);
        }
        if (toWriteStateFile) {
            sysFs.writeFileSync(stateFile, JSON.stringify(api.getAppState()));
            console.log("State data written in " + stateFile);
        }
        callback(api);
    });
}
function parseThreadListOptions() {
    var o = {
        limit: program.limit || 1000,
        timestamp: null,
        tags: program.tag,
        toWriteThreadsFile: program.writeThreadsFile,
        threadsFile: program.threadsFile,
        names: program.chatName,
        chats: [],
    };
    if (!o.toWriteThreadsFile && o.threadsFile && !sysFs.existsSync(o.threadsFile)) {
        console.error("Threads file " + o.threadsFile + " doesn't exists");
        return undefined;
    }
    return o;
}
function loadThreadsFile(opts) {
    opts.threadsList = JSON.parse(sysFs.readFileSync(opts.threadsFile, 'utf8'));
}
function getThreadList(api, opts, callback) {
    if (opts.toWriteThreadsFile || !opts.threadsFile) {
        api.getThreadList(opts.limit, opts.timestamp, opts.tags, function (err, list) {
            opts.threadsList = list;
            if (err) {
                return console.error(err);
            }
            if (opts.threadsFile) {
                sysFs.writeFileSync(opts.threadsFile, JSON.stringify(list, null, 2));
                console.log("Threads file written in " + opts.threadsFile);
            }
            callback();
        });
    }
    else {
        loadThreadsFile(opts);
        callback();
    }
}
function threadInfoToChat(thread) {
    var participants = {};
    thread.participants.forEach(function (participant) {
        participants[participant.userID] = participant.name;
    });
    return {
        id: thread.threadID,
        userName: thread.name,
        participants: participants,
    };
}
function threadListToNamesThreads(opts) {
    if (opts.names.length) {
        opts.names.forEach(function (userName) {
            var thread = opts.threadsList.find(function (_thread) { return _thread.name === userName; });
            if (thread === undefined) {
                console.error("Couldn't find user " + userName);
            }
            else {
                opts.chats.push(threadInfoToChat(thread));
            }
        });
    }
    else {
        opts.chats = opts.threadsList.map(function (thread) { return threadInfoToChat(thread); });
    }
}
function parseChatOptions() {
    var o = {
        outputFolder: program.outputFolder || '.',
        outputFormat: program.outputFileFormat || 'json',
        isRaw: program.raw,
        toConvert: program.convert,
        fieldNames: program.outputFieldName.length ? program.outputFieldName : DEF_FIELD_NAMES,
        dateFormat: program.outputDateFormat || DEF_DATE_FORMAT,
    };
    if (o.outputFolder && !sysFs.existsSync(o.outputFolder)) {
        console.error("Output folder " + o.outputFolder + " doesn't exists");
        return undefined;
    }
    return o;
}
function getChat(api, chat, chatOpts, amount, timestamp, nr) {
    console.log("Retrieving " + nr + " of " + chat.userName);
    api.getThreadHistory(chat.id, amount, timestamp, function (err, history) {
        if (err) {
            return console.error(err);
        }
        if (timestamp !== undefined) {
            history.pop();
        }
        if (history.length) {
            timestamp = history[0].timestamp;
            chat.content = history.concat(chat.content);
            if (timestamp) {
                getChat(api, chat, chatOpts, amount, timestamp, nr + 1);
            }
        }
        else {
            saveChatFile(chat, chatOpts);
        }
    });
}
function getChats(api, opts, chatOpts) {
    var amount = 50;
    var timestamp = null;
    opts.chats.forEach(function (chat) {
        chat.content = [];
        getChat(api, chat, chatOpts, amount, timestamp, 0);
    });
}
// ------------------------------------------------------------------------
//                               Write Data
// ------------------------------------------------------------------------
function fieldsToRow(fields, fieldNames, isOutJson) {
    var outObj = {};
    var outList = [];
    fieldNames.forEach(function (fieldName) {
        var v = fields[fieldName];
        if (isOutJson) {
            outObj[fieldName] = v;
        }
        else {
            outList.push(v.replace(/\n/g, '\\n'));
        }
    });
    return isOutJson ? outObj : outList.join('\t');
}
function saveChatFile(chat, chatOpts) {
    var filename = getChatFileName(chat, chatOpts, chatOpts.isRaw);
    var isOutJson = chatOpts.outputFormat === 'json';
    var input = chat.content;
    var output = [];
    if (chatOpts.isRaw) {
        output = input;
    }
    else {
        input.map(function (item) {
            if (item.type === 'message') {
                var unix_timestamp = parseInt(item.timestamp);
                var message = item.body;
                var date = new Date(unix_timestamp);
                output.push(fieldsToRow({
                    date: moment(date).format(chatOpts.dateFormat),
                    sender: chat.participants[item.senderID],
                    message: message,
                }, chatOpts.fieldNames, isOutJson));
            }
        });
    }
    if (isOutJson) {
        sysFs.writeFileSync(filename, JSON.stringify(output, null, 2));
    }
    else {
        sysFs.writeFileSync(filename, output.join('\n'));
    }
    console.log("Writting " + filename);
}
// ------------------------------------------------------------------------
//                               Storage
// ------------------------------------------------------------------------
function slugName(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u07FFF-\uFFFF\-\,\.]/g, '').toLowerCase();
}
function getChatFileName(chat, chatOpts, isRaw) {
    var fileBase = slugName(chat.userName);
    fileBase += (isRaw ? '.raw.json' : '.' + chatOpts.outputFormat);
    var filename = sysPath.join(chatOpts.outputFolder, fileBase);
    return filename;
}
function convertFromRaw(opts, chatOpts) {
    loadThreadsFile(opts);
    threadListToNamesThreads(opts);
    opts.chats.forEach(function (chat) {
        var rawFilename = getChatFileName(chat, chatOpts, true);
        chat.content = JSON.parse(sysFs.readFileSync(rawFilename, 'utf8'));
        saveChatFile(chat, chatOpts);
    });
}
//# sourceMappingURL=main.js.map