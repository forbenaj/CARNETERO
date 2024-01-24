function copyText(element, secondaryElement){
  element.style.transition = ""
  const textArea = document.createElement("textarea");

  if (typeof secondaryElement != 'undefined'){
    secondaryElement.style.transition = ""
    textArea.value = element.textContent.trim()+secondaryElement.textContent.trim();;
    secondaryElement.style.backgroundColor = "yellow";
  }
  else{
    textArea.value = element.textContent.trim();
  }
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);

  element.style.backgroundColor = "yellow";
  
  // After a delay, remove the background color to initiate the fade effect.
  setTimeout(() => {
    element.style.transition = "background-color 2s"; // Adjust the duration as needed
    element.style.backgroundColor = "";
    if (typeof secondaryElement != 'undefined'){
      secondaryElement.style.transition = "background-color 2s"; // Adjust the duration as needed
      secondaryElement.style.backgroundColor = "";
    }
  }, 500); // Adjust the delay to match the transition duration
}

const table = document.querySelectorAll("table")[1];

var nombreElement = table.rows[0].cells[1];
var nombre = nombreElement.textContent;

var beneficioElement = table.rows[2].cells[1];
var beneficio = beneficioElement.textContent;

var fechaElement = table.rows[3].cells[1];
var fecha = fechaElement.textContent;
//qrHeader.appendChild(qrText);
//header.cells[4].insertAdjacentElement("afterend",qrHeader);

var nacCopyButton = document.createElement("button");
nacCopyButton.textContent = "📋"

var edadCopyButton = document.createElement("button");
edadCopyButton.textContent = "📋"

var from = fecha.split("/");
var birthdateTimeStamp = new Date(from[2], from[1] - 1, from[0]);
var cur = new Date();
var diff = cur - birthdateTimeStamp;
var edad = Math.floor(diff/31557600000);

var edadElement = document.createElement("p");

edadElement.textContent = "("+edad+" años)";

fechaElement.querySelector("p").insertAdjacentElement("afterend",edadElement);
fechaElement.querySelector("p").insertAdjacentElement("afterend",nacCopyButton);
edadElement.insertAdjacentElement("afterend",edadCopyButton)


nacCopyButton.addEventListener("click", function() {
  copyText(fechaElement.firstChild)
});
edadCopyButton.addEventListener("click", function() {
  copyText(edadElement)
});

console.log(edad);

/*var i;
for(i=4;currentRow != null; i++){

  currentRow = table.rows[i];
  venc = currentRow.cells[4].firstChild.textContent;
  qrCell = document.createElement("td");
  if(venc == "  "){
    benef = currentRow.cells[1].textContent;
    cod = currentRow.cells[2].textContent;
    qrsrc = "https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl="+benef.trim()+"-"+cod.trim();
    const qr = document.createElement("img");
    qrCell.appendChild(qr);
    qr.setAttribute("src",qrsrc);

  }
  currentRow.cells[4].insertAdjacentElement("afterend",qrCell);
}
*/


let dniText = document.createElement("p");
dniText.style.fontSize = "x-large";

const queryString = window.location.search;

// Parse the query string into URLSearchParams
const params = new URLSearchParams(queryString);

let dniNumber = params.get("dni")
let codNumber = params.get("parent")

// Get the value of yourParameterName
dniText.textContent = dniNumber;

let dniCopyButton = document.createElement("button");
dniCopyButton.textContent = "📋";

dniCopyButton.addEventListener("click", function() {
  copyText(dniText);
});

let dniContainer = document.createElement("div");
dniContainer.appendChild(dniText);
dniContainer.appendChild(dniCopyButton);

// Insert the container element after table.rows[2]
const toptable = document.querySelectorAll("table")[0];
toptable.rows[1].insertAdjacentElement("afterend",dniContainer);


let copyAll = document.createElement("button")
copyAll.textContent = "Copiar paciente"
let allElement = document.createElement("p")
allElement.innerText = nombre+"\t\t"+"DNI\t"+dniNumber+"\t"+"PAMI"+"\t"+beneficio+"\t"+codNumber
copyAll.addEventListener("click", function() {
  copyText(allElement);
});

toptable.rows[1].insertAdjacentElement("afterend",copyAll);