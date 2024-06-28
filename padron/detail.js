/* Se ejecuta en la pantalla de detalles del padrón.
  Toma desde la url el dni que se colocó en el buscador y lo muestra en la página.
  Agrega edad.
  Agrega código parental al beneficio.
  Agrega sección "Copiar datos" con diferentes formatos de copiado.
  Agrega QR.
  Agrega botones de copiar.
*/


// Función para añadir una nueva fila a la tabla
function addRow(table,position,title,value,className){
    let row = document.createElement("tr")
    let titleCell = document.createElement("td")
    titleCell.className = "gris"
    let titleElement = document.createElement("p")
    titleElement.innerText = title
    let valueCell = document.createElement("td")
    valueCell.className = className

    row.appendChild(titleCell)
    row.appendChild(valueCell)
    titleCell.appendChild(titleElement)
    valueCell.appendChild(value)

    table.rows[position].insertAdjacentElement("beforebegin",row)
}

const mainTable = document.querySelectorAll("table")[1];
const topTable = document.querySelectorAll("table")[0];


// Toma el dni y el código parental de la URL
const queryString = window.location.search;
const params = new URLSearchParams(queryString);

let dni = params.get("dni")
let cod = params.get("parent")


// Creando el elemento que muestra el dni del paciente
let dniContainer = document.createElement("div");

let dniElement = document.createElement("p");
dniElement.style.fontSize = "x-large";
dniElement.textContent = dni;

let dniCopyButton = document.createElement("button");
dniCopyButton.textContent = "📋";

dniCopyButton.addEventListener("click", function() {
    navigator.clipboard.writeText(dni);
    highlightElement(dniElement)
});

dniContainer.appendChild(dniElement);
dniContainer.appendChild(dniCopyButton);

topTable.rows[1].insertAdjacentElement("afterend",dniContainer);




var nombreElement = mainTable.rows[0].cells[1].firstChild;
var nombre = nombreElement.textContent.trim();

var beneficioElement = mainTable.rows[2].cells[1].firstChild;
var beneficio = beneficioElement.textContent.trim();
beneficioElement.textContent += " "+cod

var fechaElement = mainTable.rows[3].cells[1].firstChild;
var fecha = fechaElement.textContent.trim();

// Crea y adjunta las filas de edad y QR
var edadElement = document.createElement("p");
var edad = getAge(fecha)
edadElement.textContent = edad+" años";

var qrImg = document.createElement("img")
qrImg.setAttribute("src","https://image-charts.com/chart?chs=100x100&cht=qr&chl="+beneficio+"-"+cod);

addRow(mainTable,4,"EDAD:",edadElement,"grisClaro")
addRow(mainTable,5,"QR:",qrImg,"crema")




// Creando botones de copiar
var nomCopyButton = document.createElement("button");
nomCopyButton.textContent = "📋"
nomCopyButton.style.marginLeft = "10px"

var benefCopyButton = document.createElement("button");
benefCopyButton.textContent = "📋"
benefCopyButton.style.marginLeft = "10px"

var nacCopyButton = document.createElement("button");
nacCopyButton.textContent = "📋"
nacCopyButton.style.marginLeft = "10px"

var edadCopyButton = document.createElement("button");
edadCopyButton.textContent = "📋"
edadCopyButton.style.marginLeft = "10px"

nombreElement.style.display = "inline-block"
beneficioElement.style.display = "inline-block"
fechaElement.style.display = "inline-block"
edadElement.style.display = "inline-block"

nomCopyButton.addEventListener("click", function() {
    navigator.clipboard.writeText(nombre)
    highlightElement(nombreElement)
});

benefCopyButton.addEventListener("click", function() {
    navigator.clipboard.writeText(beneficio+cod)
    highlightElement(beneficioElement)
});

nacCopyButton.addEventListener("click", function() {
    navigator.clipboard.writeText(fecha)
    highlightElement(fechaElement)
});

edadCopyButton.addEventListener("click", function() {
    navigator.clipboard.writeText("("+edad+" años)")
    highlightElement(edadElement)
});

nombreElement.insertAdjacentElement("afterend",nomCopyButton);
beneficioElement.insertAdjacentElement("afterend",benefCopyButton);
fechaElement.insertAdjacentElement("afterend",nacCopyButton);
edadElement.insertAdjacentElement("afterend",edadCopyButton);








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
  highlightElement(dniElement)
  let textToCopy = nombre+", DNI: "+dni+", PAMI"
  navigator.clipboard.writeText(textToCopy)
})

let botonCopiarExcel = document.createElement("input")
botonCopiarExcel.type = "button"
botonCopiarExcel.value = "Excel"
botonCopiarExcel.addEventListener("click", function() {
  highlightElement(nombreElement)
  highlightElement(dniElement)
  highlightElement(beneficioElement)
  let textToCopy = nombre+"\t\t"+"DNI\t"+dni+"\t"+"PAMI"+"\t"+beneficio+"\t"+cod
  navigator.clipboard.writeText(textToCopy)
})

let botonCopiarCirugia = document.createElement("input")
botonCopiarCirugia.type = "button"
botonCopiarCirugia.value = "Cirugia"
botonCopiarCirugia.addEventListener("click", function() {
  highlightElement(nombreElement)
  highlightElement(dniElement)
  highlightElement(edadElement)
  let textToCopy = nombre+" DNI: "+dni+" PAMI ("+edad+" años)"
  navigator.clipboard.writeText(textToCopy)
})

botoneraFieldset.appendChild(botonCopiarSimple)
botoneraFieldset.appendChild(botonCopiarExcel)
botoneraFieldset.appendChild(botonCopiarCirugia)

tableContainer.appendChild(botoneraFieldset)
tableContainer.style.display = "flex"
