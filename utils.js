// Función para resaltar elementos al copiarlos
function highlightElement(element){
    element.style.transition = ""
  
    element.style.backgroundColor = "yellow";
    
    setTimeout(() => {
        element.style.transition = "background-color 2s";
        element.style.backgroundColor = "";
    }, 500);
  
}

// Función para calcular edad con fecha de nacimiento
function getAge(date){
    let from = date.split("/");
    let birthdateTimeStamp = new Date(from[2], from[1] - 1, from[0]);
    let cur = new Date();
    let diff = cur - birthdateTimeStamp;
    let age = Math.floor(diff/31557600000);
    return age
}

// Set a value to Chrome storage
function setValue(key, value) {
    chrome.storage.sync.set({ [key]: value });
}
  
// Get a value from Chrome storage
function getValue(key, callback) {
    chrome.storage.sync.get(key, (result) => {
        callback(result[key]);
    });
}


function waitForElementToExist(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
  
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
  
        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
    });
}



function getFirstWord(str) {
    str = str.trim();
    var words = str.split(/\s+/);
    return words[0];
}
