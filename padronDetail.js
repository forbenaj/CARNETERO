function highlightElement(element){
  element.style.transition = ""

  element.style.backgroundColor = "yellow";
  
  // After a delay, remove the background color to initiate the fade effect.
  setTimeout(() => {
    element.style.transition = "background-color 2s"; // Adjust the duration as needed
    element.style.backgroundColor = "";
  }, 500); // Adjust the delay to match the transition duration

}

function addRow(table,position,title,value){
  let row = document.createElement("tr")
  let titleCell = document.createElement("td")
  titleCell.className = "gris"
  let titleElement = document.createElement("p")
  titleElement.innerText = title
  let valueCell = document.createElement("td")
  valueCell.className = "crema"

  row.appendChild(titleCell)
  row.appendChild(valueCell)
  titleCell.appendChild(titleElement)
  valueCell.appendChild(value)

  table.rows[position].insertAdjacentElement("beforebegin",row)
}

function getAge(date){
  let from = date.split("/");
  let birthdateTimeStamp = new Date(from[2], from[1] - 1, from[0]);
  let cur = new Date();
  let diff = cur - birthdateTimeStamp;
  let age = Math.floor(diff/31557600000);
  return age
}

const mainTable = document.querySelectorAll("table")[1];
const topTable = document.querySelectorAll("table")[0];

var nombreElement = mainTable.rows[0].cells[1];
var nombre = nombreElement.textContent.trim();

var beneficioElement = mainTable.rows[2].cells[1];
var beneficio = beneficioElement.textContent.trim();

var fechaElement = mainTable.rows[3].cells[1];
var fecha = fechaElement.textContent.trim();

var edadElement = document.createElement("p");
var edad = getAge(fecha)
edadElement.textContent = "("+edad+" años)";

const queryString = window.location.search;

// Parse the query string into URLSearchParams
const params = new URLSearchParams(queryString);

let dniNumber = params.get("dni")
let codNumber = params.get("parent")

//qrHeader.appendChild(qrText);
//header.cells[4].insertAdjacentElement("afterend",qrHeader);


var qrImg = document.createElement("img")
qrImg.setAttribute("src","https://image-charts.com/chart?chs=100x100&cht=qr&chl="+beneficio+"-"+codNumber);

addRow(mainTable,4,"QR",qrImg)

var nacCopyButton = document.createElement("button");
nacCopyButton.textContent = "📋"

var edadCopyButton = document.createElement("button");
edadCopyButton.textContent = "📋"


fechaElement.querySelector("p").insertAdjacentElement("afterend",edadElement);
fechaElement.querySelector("p").insertAdjacentElement("afterend",nacCopyButton);
edadElement.insertAdjacentElement("afterend",edadCopyButton)


nacCopyButton.addEventListener("click", function() {
  navigator.clipboard.writeText(fechaElement.firstChild.textContent)
  highlightElement(fechaElement.firstChild)
});
edadCopyButton.addEventListener("click", function() {
  navigator.clipboard.writeText(edadElement.textContent)
  highlightElement(edadElement)
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


// Get the value of yourParameterName
dniText.textContent = dniNumber;

let dniCopyButton = document.createElement("button");
dniCopyButton.textContent = "📋";

dniCopyButton.addEventListener("click", function() {
  highlightElement(dniText)
  navigator.clipboard.writeText(dniText.textContent);
});

let dniContainer = document.createElement("div");
dniContainer.appendChild(dniText);
dniContainer.appendChild(dniCopyButton);

// Insert the container element after table.rows[2]
topTable.rows[1].insertAdjacentElement("afterend",dniContainer);





let mainContainer = document.getElementById("container")

let tableContainer = document.createElement("div")
tableContainer.id = "tableContainer"

mainContainer.insertBefore(tableContainer,mainContainer.firstChild)

tableContainer.appendChild(topTable)

let botonera = document.createElement("div")

let botoneraFieldset = document.createElement("fieldset")
botoneraFieldset.style.display = "flex"
botoneraFieldset.style.width = "100%"
botoneraFieldset.style.flexDirection = "column"

let botoneraTitle = document.createElement("legend")
botoneraTitle.innerText = "Copiar datos"

botoneraFieldset.appendChild(botoneraTitle)

let botonCopiarSimple = document.createElement("input")
botonCopiarSimple.type = "button"
botonCopiarSimple.value = "Simple"
botonCopiarSimple.addEventListener("click", function() {
  highlightElement(nombreElement)
  highlightElement(dniText)
  let textToCopy = nombre+", DNI: "+dniNumber+", PAMI"
  navigator.clipboard.writeText(textToCopy)
})

let botonCopiarExcel = document.createElement("input")
botonCopiarExcel.type = "button"
botonCopiarExcel.value = "Excel"
botonCopiarExcel.addEventListener("click", function() {
  highlightElement(nombreElement)
  highlightElement(dniText)
  highlightElement(beneficioElement)
  let textToCopy = nombre+"\t\t"+"DNI\t"+dniNumber+"\t"+"PAMI"+"\t"+beneficio+"\t"+codNumber
  navigator.clipboard.writeText(textToCopy)
})

let botonCopiarCirugia = document.createElement("input")
botonCopiarCirugia.type = "button"
botonCopiarCirugia.value = "Cirugia"
botonCopiarCirugia.addEventListener("click", function() {
  highlightElement(nombreElement)
  highlightElement(dniText)
  highlightElement(edadElement)
  let textToCopy = nombre+" DNI: "+dniNumber+" PAMI ("+edad+" años)"
  navigator.clipboard.writeText(textToCopy)
})

botoneraFieldset.appendChild(botonCopiarSimple)
botoneraFieldset.appendChild(botonCopiarExcel)
botoneraFieldset.appendChild(botonCopiarCirugia)

tableContainer.appendChild(botoneraFieldset)
tableContainer.style.display = "flex"
