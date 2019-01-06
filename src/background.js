
const hostName = require('./host/hostname');
const MessageType = require('./js/MessageType');
const Bookmark = require('./js/Bookmark');

let bookmark = new Bookmark();
let nativePort = chrome.runtime.connectNative(hostName);
nativePort.onMessage.addListener((result) => {
  if (result.type === MessageType.READ_SAFARI_BOOKMARK_PLIST) {
    bookmark.loadFromSafari(result.payload);
  } else if (result.type === MessageType.WRITE_SAFARI_BOOKMARK_PLIST) {
    console.debug(result);
  }
});

nativePort.postMessage({
  type: MessageType.READ_SAFARI_BOOKMARK_PLIST,
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === MessageType.COMMAND) {
    nativePort.postMessage(message);
  } else if (message.type === MessageType.REQUEST_CHROME2SAFARI) {
    bookmark.loadFromChrome((that) => {
      let safariBookmark = that.getSafariBookmark();
      let message = {
        type: MessageType.WRITE_SAFARI_BOOKMARK_PLIST,
        payload: safariBookmark
      };
      nativePort.postMessage(message);
    });
  }
});
