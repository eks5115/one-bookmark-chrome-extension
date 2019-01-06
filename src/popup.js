
const MessageType = require('./js/MessageType');

let chrome2Safari = document.getElementById('chrome2Safari');

chrome2Safari.onclick = ()=>{
  chrome.runtime.sendMessage({
    type: MessageType.REQUEST_CHROME2SAFARI
  }, function(response){
    console.debug(response);
  });
};
