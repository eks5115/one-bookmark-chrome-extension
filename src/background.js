
let hostName = require('./host/hostname');

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'command') {
    let port = chrome.runtime.connectNative(hostName);

    port.onMessage.addListener((data) => {
      console.debug('command result: %o', data);
      port.disconnect();
      sendResponse(data);
    });

    port.onDisconnect.addListener(function() {
      console.log("Disconnected");
    });

    port.postMessage({
      command: message.payload
    });
  }
});
