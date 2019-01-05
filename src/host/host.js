#!/usr/local/bin/node

const child_process = require('child_process');

process.stdin.on('readable', function() {
  try {
    let message = receive();
    if (message !== null) {
      exec(message.command);
    }
  } catch (e) {
    console.error(e);
  }
});

process.stdin.on('data', function(chunks) {
});

process.stdin.on('end',function(){
});

process.stdin.on('error', function(error){
});


function receive() {
  let lengthBuffer = process.stdin.read(4);

  if (lengthBuffer == null) {
    return null
  }
  let length = lengthBuffer.readInt32LE(0);

  let commandBuffer = process.stdin.read(length);
  if (commandBuffer == null) {
    return null;
  }

  return JSON.parse(commandBuffer.toString());
}

/**
 * ResponseMessage virtual Type
 * @typedef {Object} ResponseMessage
 * @property {String} stdout
 * @property {String} stderr
 * @property {Number} code
 */

/**
 *
 * @param {ResponseMessage} message
 */
function send(message) {
  let messageString = JSON.stringify(message);
  let buffer = Buffer.alloc(4);
  buffer.writeInt32LE(messageString.length, 0);
  process.stdout.write(buffer.toString());

  buffer = Buffer.alloc(messageString.length);
  buffer.write(messageString);
  process.stdout.write(buffer.toString());
}

function exec(command) {
  child_process.exec(command, (error, stdout, stderr) => {
    let code = 0;
    if (error !== null) {
      code = error.code
    }
    send({
      code: code,
      stdout: stdout,
      stderr: stderr
    });
  });
}
