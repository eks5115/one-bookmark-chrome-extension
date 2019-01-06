
const child_process = require('child_process');
const plist = require('simple-plist');
const Bookmark = require('../js/Bookmark');
const MessageType = require('../js/MessageType');
const log = require('../js/log');

process.stdin.on('data', function(chunks) {
  try {
    receiveStream(chunks, (buf) => {
      exec(JSON.parse(buf.toString()));
    })
  } catch (e) {
     log.error(e);
  }
});

process.stdin.on('end',function(){
  log.debug('end');
});

process.stdin.on('error', function(error){
  log.debug('error');
});

let begin = false;
let buffer = Buffer.from([]);
let total = 0;
let length = 0;
function receiveStream(chunks, callback) {
  if (!begin) {
    buffer = Buffer.from([]);
    total = chunks.readInt32LE(0);
    buffer = Buffer.concat([buffer, chunks.slice(4, chunks.length)]);
    length = chunks.length - 4;
    if (total > length) {
      begin = true;
    } else {
      callback(buffer);
    }
    return ;
  }

  buffer = Buffer.concat([buffer, chunks]);
  length += chunks.length;
  if (length === total) {
    begin = false;
    callback(buffer);
  }
}

/**
 * ResponseMessage virtual Type
 * @typedef {Object} ResponseMessage
 * @property {string} type
 * @property {object|string} payload
 */

/**
 *
 * @param {ResponseMessage} responseMessage
 */
function send(responseMessage) {
  let message = JSON.stringify(responseMessage);
  let buffer = Buffer.alloc(4);
  let messageBuf = Buffer.from(message);

  buffer.writeInt32LE(messageBuf.length, 0);

  process.stdout.write(buffer);
  process.stdout.write(messageBuf);
}

function exec(message) {
  if (message.type === MessageType.COMMAND) {
    child_process.exec(message.payload, (error, stdout, stderr) => {
      let code = 0;
      if (error !== null) {
        code = error.code
      }
      send({
        type: message.type,
        payload: {
          code: code,
          stdout: stdout,
          stderr: stderr
        }
      });
    });
  } else if (message.type === MessageType.WRITE_SAFARI_BOOKMARK_PLIST) {
    plist.writeFileSync(Bookmark.SAFARI_PLIST_FILE, message.payload);
    send({
      type: message.type,
      payload: ""
    })
  } else if (message.type === MessageType.READ_SAFARI_BOOKMARK_PLIST) {
    let bookmarks = plist.readFileSync(Bookmark.SAFARI_PLIST_FILE);
    send({
      type: message.type,
      payload: bookmarks
    });
  }
}
