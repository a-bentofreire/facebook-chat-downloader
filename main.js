#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var sysFs = __toESM(require("fs"));
var sysPath = __toESM(require("path"));
var import_prompts = __toESM(require("prompts"));
var import_moment = __toESM(require("moment"));
var import_commander = require("commander");
const program = new import_commander.Command();
const chatApi = require("facebook-chat-api");
const DEF_FIELD_NAMES = ["date", "sender", "message"];
const DEF_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
const VERSION = JSON.parse(sysFs.readFileSync(
  sysPath.join(__dirname, "package.json"),
  "utf-8"
))["version"];
parseCommandLine();
async function parseCommandLine() {
  function collect(item, list) {
    list.push(item);
    return list;
  }
  program.version(VERSION).option("-e, --email [email]", "email").option("-p, --password [password]", "password").option("-s, --state-file [state-file]", "state filename").option("-S, --write-state-file", "if present, it will write the state-file").option("-t, --threads-file [threads-file]", "threads filename").option("-T, --write-threads-file", "if present, it will write the chat threads file").option("-l, --limit [chat-thread-limit]", "maximum number of chat threads", parseInt).option("-g, --tag [tag]", "list of tags: INBOX,ARCHIVED,PENDING,OTHER", collect, []).option("-n, --chat-name [name]", "list of chat names to download", collect, []).option("-R, --raw", "if present and output is json, it will store in raw format").option("-O, --output-folder [folder]", "output folder").option("-N, --output-field-name [fields]", "list of fields names for non-raw storage: " + DEF_FIELD_NAMES.join(", "), collect, []).option("-F, --output-file-format [format]", "output file format: txt,json", /^(txt|json)$/i).option("-D, --output-date-format [date-format]", "output date-time format. see moment.js").option("-c, --convert", "converts from raw chat file into another format").parse(process.argv);
  let progOpts = program.opts();
  let email = progOpts.email;
  let password = progOpts.password;
  const stateFile = progOpts.stateFile;
  const toWriteStateFile = progOpts.writeStateFile;
  if (!toWriteStateFile && stateFile && !sysFs.existsSync(stateFile)) {
    return console.error(`State file ${stateFile} doesn't exists`);
  }
  const threadListOpts = parseThreadListOptions(progOpts);
  if (!threadListOpts) {
    return;
  }
  const chatOpts = parseChatOptions(progOpts);
  if (!chatOpts) {
    return;
  }
  if ((toWriteStateFile || !stateFile) && (!email || !password)) {
    const answers = await getPromptQuestions(!email, !password);
    email = email || answers.email;
    password = password || answers.password;
  }
  if (!chatOpts.toConvert) {
    login(email, password, stateFile, toWriteStateFile, (api) => {
      getThreadList(api, threadListOpts, () => {
        threadListToNamesThreads(threadListOpts);
        getChats(api, threadListOpts, chatOpts);
      });
    });
  } else {
    convertFromRaw(threadListOpts, chatOpts);
  }
}
async function getPromptQuestions(reqEMail, reqPassword) {
  const questions = [];
  if (reqEMail) {
    questions.push({
      type: "text",
      name: "email",
      message: "email:"
    });
  }
  if (reqPassword) {
    questions.push({
      type: "password",
      name: "password",
      message: "password:"
    });
  }
  return await (0, import_prompts.default)(questions);
}
function login(email, password, stateFile, toWriteStateFile, callback) {
  const options = toWriteStateFile || !stateFile ? {
    email,
    password
  } : { appState: JSON.parse(sysFs.readFileSync(stateFile, "utf8")) };
  chatApi(options, (err, api) => {
    if (err) {
      return console.error(err);
    }
    if (toWriteStateFile) {
      sysFs.writeFileSync(stateFile, JSON.stringify(api.getAppState()));
      console.log(`State data written in ${stateFile}`);
    }
    callback(api);
  });
}
function parseThreadListOptions(progOpts) {
  const o = {
    limit: progOpts.limit || 1e3,
    timestamp: null,
    tags: progOpts.tag,
    toWriteThreadsFile: progOpts.writeThreadsFile,
    threadsFile: progOpts.threadsFile,
    names: progOpts.chatName,
    chats: []
  };
  if (!o.toWriteThreadsFile && o.threadsFile && !sysFs.existsSync(o.threadsFile)) {
    console.error(`Threads file ${o.threadsFile} doesn't exists`);
    return void 0;
  }
  return o;
}
function loadThreadsFile(opts) {
  opts.threadsList = JSON.parse(sysFs.readFileSync(opts.threadsFile, "utf8"));
}
function getThreadList(api, opts, callback) {
  if (opts.toWriteThreadsFile || !opts.threadsFile) {
    api.getThreadList(opts.limit, opts.timestamp, opts.tags, (err, list) => {
      opts.threadsList = list;
      if (err) {
        return console.error(err);
      }
      if (opts.threadsFile) {
        sysFs.writeFileSync(opts.threadsFile, JSON.stringify(list, null, 2));
        console.log(`Threads file written in ${opts.threadsFile}`);
      }
      callback();
    });
  } else {
    loadThreadsFile(opts);
    callback();
  }
}
function threadInfoToChat(thread) {
  const participants = {};
  thread.participants.forEach((participant) => {
    participants[participant.userID] = participant.name;
  });
  return {
    id: thread.threadID,
    userName: thread.name,
    participants
  };
}
function threadListToNamesThreads(opts) {
  if (opts.names.length) {
    opts.names.forEach((userName) => {
      const thread = opts.threadsList.find((_thread) => _thread.name === userName);
      if (thread === void 0) {
        console.error(`Couldn't find user ${userName}`);
      } else {
        opts.chats.push(threadInfoToChat(thread));
      }
    });
  } else {
    opts.chats = opts.threadsList.map((thread) => threadInfoToChat(thread));
  }
}
function parseChatOptions(progOpts) {
  const o = {
    outputFolder: progOpts.outputFolder || ".",
    outputFormat: progOpts.outputFileFormat || "json",
    isRaw: progOpts.raw,
    toConvert: progOpts.convert,
    fieldNames: progOpts.outputFieldName || DEF_FIELD_NAMES,
    dateFormat: progOpts.outputDateFormat || DEF_DATE_FORMAT
  };
  if (o.outputFolder && !sysFs.existsSync(o.outputFolder)) {
    console.error(`Output folder ${o.outputFolder} doesn't exists`);
    return void 0;
  }
  return o;
}
function getChat(api, chat, chatOpts, amount, timestamp, nr) {
  console.log(`Retrieving ${nr} of ${chat.userName}`);
  api.getThreadHistory(chat.id, amount, timestamp, (err, history) => {
    if (err) {
      return console.error(err);
    }
    if (timestamp !== void 0) {
      history.pop();
    }
    if (history.length) {
      timestamp = history[0].timestamp;
      chat.content = [...history, ...chat.content];
      if (timestamp) {
        getChat(api, chat, chatOpts, amount, timestamp, nr + 1);
      }
    } else {
      saveChatFile(chat, chatOpts);
    }
  });
}
function getChats(api, opts, chatOpts) {
  const amount = 50;
  const timestamp = null;
  opts.chats.forEach((chat) => {
    chat.content = [];
    getChat(api, chat, chatOpts, amount, timestamp, 0);
  });
}
function fieldsToRow(fields, fieldNames, isOutJson) {
  const outObj = {};
  const outList = [];
  fieldNames.forEach((fieldName) => {
    const v = fields[fieldName];
    if (isOutJson) {
      outObj[fieldName] = v;
    } else {
      outList.push(v.replace(/\n/g, "\\n"));
    }
  });
  return isOutJson ? outObj : outList.join("	");
}
function saveChatFile(chat, chatOpts) {
  const filename = getChatFileName(chat, chatOpts, chatOpts.isRaw);
  const isOutJson = chatOpts.outputFormat === "json";
  const input = chat.content;
  let output = [];
  if (chatOpts.isRaw) {
    output = input;
  } else {
    input.map((item) => {
      if (item.type === "message") {
        const unix_timestamp = parseInt(item.timestamp);
        const message = item.body;
        const date = new Date(unix_timestamp);
        output.push(fieldsToRow({
          date: (0, import_moment.default)(date).format(chatOpts.dateFormat),
          sender: chat.participants[item.senderID],
          message
        }, chatOpts.fieldNames, isOutJson));
      }
    });
  }
  if (isOutJson) {
    sysFs.writeFileSync(filename, JSON.stringify(output, null, 2));
  } else {
    sysFs.writeFileSync(filename, output.join("\n"));
  }
  console.log(`Writing ${filename}`);
}
function slugName(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u07FFF-\uFFFF\-\,\.]/g, "").toLowerCase();
}
function getChatFileName(chat, chatOpts, isRaw) {
  let fileBase = slugName(chat.userName);
  fileBase += isRaw ? ".raw.json" : "." + chatOpts.outputFormat;
  const filename = sysPath.join(chatOpts.outputFolder, fileBase);
  return filename;
}
function convertFromRaw(opts, chatOpts) {
  loadThreadsFile(opts);
  threadListToNamesThreads(opts);
  opts.chats.forEach((chat) => {
    const rawFilename = getChatFileName(chat, chatOpts, true);
    chat.content = JSON.parse(sysFs.readFileSync(rawFilename, "utf8"));
    saveChatFile(chat, chatOpts);
  });
}
