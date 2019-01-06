
const hostName = require('./host/hostName');

let manifest = {
  "name": hostName,
  "description": "One Bookmark for Chrome Extension",
  "path": "./src/host/host.json",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://fkcbodphbkhaphlefpfmiapcapbjkcfg/"
  ]
};

module.exports = manifest;
