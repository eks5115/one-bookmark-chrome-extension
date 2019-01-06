
const child_process = require('child_process');

process.stdin.on('readable', function() {
  try {
    let message = receive();
    if (message !== null) {
      exec(message);
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
  child_process.exec(message.payload, (error, stdout, stderr) => {
    let code = 0;
    if (error !== null) {
      code = error.code
    }
    send({
      type: message.type,
      code: code,
      stdout: stdout,
      stderr: stderr
    });
  });
}
