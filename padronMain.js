/* Se ejecuta en la pantalla de resultados del padrón.
  Toma desde la url el dni que se colocó en el buscador y lo muestra en la página.
  Agrega QR.
  Agrega botones de copiar.
  Estiliza los pacientes dados de baja para visualización clara.
*/

// Función para resaltar elementos al copiarlos
function highlightElement(element){
  element.style.transition = ""

  element.style.backgroundColor = "yellow";
  
  setTimeout(() => {
    element.style.transition = "background-color 2s";
    element.style.backgroundColor = "";
  }, 500);

}

const table = document.querySelector("table");


// Toma el dni de la URL
const queryString = window.location.search;
const params = new URLSearchParams(queryString);

let dni = params.get("dni")


// Creando el elemento que muestra el dni del paciente
let dniContainer = document.createElement("div");

let dniElement = document.createElement("p");
dniElement.style.fontSize = "x-large";
dniElement.textContent = dni

let dniCopyButton = document.createElement("button");
dniCopyButton.textContent = "📋";

dniCopyButton.addEventListener("click", function() {
  navigator.clipboard.writeText(dni);
  highlightElement(dniElement)
});

dniContainer.appendChild(dniElement);
dniContainer.appendChild(dniCopyButton);

table.rows[1].insertAdjacentElement("afterend",dniContainer);




// Reemplaza el botón de volver para un correcto funcionamiento
var oldGoBackButton = document.querySelector('.boton');
var newGoBackButton = document.createElement('button');
newGoBackButton.textContent="Volver"
newGoBackButton.className = 'boton';

if (oldGoBackButton) {
  oldGoBackButton.insertAdjacentElement("afterend",newGoBackButton)
  oldGoBackButton.remove()
  newGoBackButton.addEventListener('click', function() {
    // Use the history object to navigate back
    window.history.back();
  });
}


// Creando la columna de QR
let header = table.rows[3]; // Los títulos están en la cuarta fila

let qrText = document.createElement("p");
qrText.textContent = "QR";
qrText.classList.add("blanco");

let qrHeader = document.createElement("td");
qrHeader.appendChild(qrText);
header.cells[4].insertAdjacentElement("afterend",qrHeader); // Añadir la columna de QR después de Fecha Baja




// Recorre la lista de pacientes y añade el QR, los botones de copiar y el formato
let currentRow = table.rows[4]; // El primer paciente está en la quinta fila
let i;

for(i=4;currentRow != null; i++){

  // Si no hay más pacientes, sale del loop
  currentRow = table.rows[i];
  if(currentRow == null){
    break
  }
  

  let nombreCell = currentRow.cells[0];
  let benefCell = currentRow.cells[1];
  let codCell = currentRow.cells[2];
  let vencCell = currentRow.cells[4];
  let detalleCell = currentRow.cells[5]

  // Crea y adjunta la celda de QR, por más que no se vaya a insertar la imágen
  let qrCell = document.createElement("td");
  currentRow.cells[4].insertAdjacentElement("afterend",qrCell);


  // Crea el nuevo link de la pantalla de detalle, para enviar el dni en la URL
  let detalleLink = detalleCell.firstChild
  let detalleHref = detalleLink.getAttribute("href")
  detalleLink.setAttribute("href",detalleHref+"&dni="+dniElement.textContent)

  // Si el paciente está activo, agrega el QR y los botones de copiar
  if(vencCell.firstChild.textContent == "  "){
    
    let qrsrc = "https://image-charts.com/chart?chs=100x100&cht=qr&chl="+benefCell.textContent.trim()+"-"+codCell.textContent.trim();
    const qr = document.createElement("img");
    qrCell.appendChild(qr);
    qr.setAttribute("src",qrsrc);


    let nomCopyButton = document.createElement("button");
    nomCopyButton.textContent = "📋"
    
    let benefCopyButton = document.createElement("button");
    benefCopyButton.textContent = "📋"
    
    nomCopyButton.addEventListener("click", function() {
      navigator.clipboard.writeText(nombreCell.firstChild.textContent.trim())
      highlightElement(nombreCell.firstChild)
    });

    benefCopyButton.addEventListener("click", function() {
      let fullBenef = benefCell.firstChild.textContent.trim() + codCell.firstChild.textContent.trim()
      navigator.clipboard.writeText(fullBenef)
      highlightElement(benefCell.firstChild)
      highlightElement(codCell.firstChild)
    });
    
    nombreCell.firstChild.insertAdjacentElement("afterend",nomCopyButton)
    benefCell.firstChild.insertAdjacentElement("afterend",benefCopyButton)

  }
  // Si el paciente no está activo, añade formato
  else{
    currentRow.style.backgroundColor="#bbbbbb"
    nombreCell.style.textDecoration="line-through"
    benefCell.style.textDecoration="line-through"
    codCell.style.textDecoration="line-through"
  }

}