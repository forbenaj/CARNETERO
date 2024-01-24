// background.js (service worker)

// Set a value in Chrome storage
function setValue(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

// Get a value from Chrome storage
function getValue(key, callback) {
  chrome.storage.sync.get(key, (result) => {
    callback(result[key]);
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'set') {
    setValue(message.key, message.value);
  } else if (message.action === 'get') {
    getValue(message.key, sendResponse);
  }
});

function fillAndClick(dni) {
  // Find the input element with name "nroDocumento"
  var inputElement = document.getElementsByName("nroDocumento")[0];

  inputElement.value = dni;

  // Find the div with id "botonConsultar"
  var buttonElement = document.getElementsByClassName("btn_buscar")[1];

  // Simulate a click on the button
  buttonElement.click();
      
}

function convertBenef(num){


  if(num.includes("-")){
    var benefSplit = num.split("-");
    return {ben:benefSplit[0],cod:benefSplit[1]}
  }
  else if(num.length==11 || num.length==12){
    return {ben:num,cod : "00"}
  }
  else if(num.length==13){
    return {ben:num.substr(0,11),cod : num.substr(11,13)}
  }
  else if(num.length==14){
    return {ben:num.substr(0,12),cod:num.substr(12,14)}
  }
}
  
  
let openPadron = function(word){
  let number = word.selectionText.replace(/[. ]/g, "");

  let url = ""
  if(number > 1000000000){
    let beneficio = convertBenef(number)
    url = "https://prestadores.pami.org.ar/result.php?c=6-2-1-1&beneficio="+beneficio.ben+"&parent="+beneficio.cod+"&vm=2"
  }
  else{url = "https://prestadores.pami.org.ar/result.php?c=6-2"}
  // Open a new tab
  chrome.tabs.create({ url: url }, function (newTab) {
    // Callback function when the tab is created
    console.log("New tab created with ID: " + newTab.id);
  
    // Add an event listener to detect when the tab is updated
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      // Check if the updated tab is the one we opened
      if (tabId === newTab.id && changeInfo.status === "complete") {
        // Perform operations on the newly opened tab
        console.log("Tab with ID " + tabId + " is now complete.");
  
        // Your operations here
        // For example, execute a script on the new tab
        if(number < 1000000000){
          chrome.scripting.executeScript({
            target : {tabId : tabId},
            func :  fillAndClick,
            args: [number],
            //files : [ "dniSearcher.js" ],
          }).then(() => console.log("script injected"));
        }
        // Remove the event listener to avoid unnecessary callbacks
        chrome.tabs.onUpdated.removeListener(arguments.callee);
      }
    });
  });

};

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
   id: "1",
   title: "Abrir en padrón...",
   contexts:["selection"],  // ContextType
  }); })

chrome.contextMenus.onClicked.addListener(openPadron);