function highlightElement(element){
  element.style.transition = ""

  element.style.backgroundColor = "yellow";
  
  // After a delay, remove the background color to initiate the fade effect.
  setTimeout(() => {
    element.style.transition = "background-color 2s"; // Adjust the duration as needed
    element.style.backgroundColor = "";
  }, 500); // Adjust the delay to match the transition duration

}

const table = document.querySelector("table");

let dniText = document.createElement("p");
dniText.style.fontSize = "x-large";

const queryString = window.location.search;

// Parse the query string into URLSearchParams
const params = new URLSearchParams(queryString);

// Get the value of yourParameterName
dniText.textContent = params.get("dni");

/*chrome.storage.local.get(['dni'], function(result) {
  dniText.textContent = result.dni;
});*/

let dniCopyButton = document.createElement("button");
dniCopyButton.textContent = "📋";

dniCopyButton.addEventListener("click", function() {
  navigator.clipboard.writeText(dniText.textContent);
  highlightElement(dniText)
});

// Append dniText and dniCopyButton to a container element, e.g., a div
let dniContainer = document.createElement("div");
dniContainer.appendChild(dniText);
dniContainer.appendChild(dniCopyButton);

// Insert the container element after table.rows[2]
table.rows[1].insertAdjacentElement("afterend",dniContainer);


var oldGoBackButton = document.querySelector('.boton');
var newGoBackButton = document.createElement('button');
    //newGoBackButton.setAttribute('href', 'https://prestadores.pami.org.ar/result.php?c=6-2');
    newGoBackButton.textContent="Volver"
    newGoBackButton.className = 'boton';
    //newGoBackButton.setAttribute('target', '_blank');

if (oldGoBackButton) {
  // Remove the "onclick" attribute
  /*oldGoBackButton.removeAttribute('onclick');

  oldGoBackButton.setAttribute('href', 'https://prestadores.pami.org.ar/result.php?c=6-2');
  oldGoBackButton.setAttribute('target', '_blank');
  oldGoBackButton.className = 'buttonClass';*/
  oldGoBackButton.insertAdjacentElement("afterend",newGoBackButton)
  oldGoBackButton.remove()
  newGoBackButton.addEventListener('click', function() {
    // Use the history object to navigate back
    window.history.back();
  });
}



let header = table.rows[3]; // Los títulos están en la cuarta fila
let currentRow = table.rows[4]; // El primer paciente está en la quinta fila


let qrText = document.createElement("p");
    qrText.textContent = "QR";
    qrText.classList.add("blanco");

let qrHeader = document.createElement("td");
    qrHeader.appendChild(qrText);
header.cells[4].insertAdjacentElement("afterend",qrHeader); // Añadir la columna de QR después de Fecha Baja



let i;

for(i=4;currentRow != null; i++){

  currentRow = table.rows[i];
  if(currentRow == null){
    break
  }
  let qrCell;
  
  vencCell = currentRow.cells[4].firstChild;

  qrCell = document.createElement("td");
  currentRow.cells[4].insertAdjacentElement("afterend",qrCell);

  let nombreCell = currentRow.cells[0];
  let benefCell = currentRow.cells[1];
  let codCell = currentRow.cells[2];
  let detalleCell = currentRow.cells[6]

  let detalleLink = detalleCell.firstChild

  let detalleHref = detalleLink.getAttribute("href")

  detalleLink.setAttribute("href",detalleHref+"&dni="+dniText.textContent)

  if(vencCell.textContent == "  "){
    
    let nomCopyButton = document.createElement("button");
        nomCopyButton.textContent = "📋"
    
    let benefCopyButton = document.createElement("button");
        benefCopyButton.textContent = "📋"
    
    
    let qrsrc = "https://image-charts.com/chart?chs=100x100&cht=qr&chl="+benefCell.textContent.trim()+"-"+codCell.textContent.trim();
    const qr = document.createElement("img");
    qrCell.appendChild(qr);
    qr.setAttribute("src",qrsrc);
    
    nombreCell.firstChild.insertAdjacentElement("afterend",nomCopyButton)
    benefCell.firstChild.insertAdjacentElement("afterend",benefCopyButton)
  
  
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
  }
  else{
    currentRow.style.backgroundColor="#bbbbbb"
    nombreCell.style.textDecoration="line-through"
    benefCell.style.textDecoration="line-through"
    codCell.style.textDecoration="line-through"
  }

}




/*

// Function to modify the URL and redirect
function addUrlParameterAndRedirect() {

  const form = document.getElementById("form2")

  form.setAttribute("action", "result.php?c=6-2-2&dni="+document.querySelector('[name="nroDocumento"]').value);

  form.submit();  
}



// Get all elements with the class "botonConsultar"
const buttons = document.querySelectorAll('.botonConsultar');



// Check if there is a second element (index 1) in the NodeList
if (buttons.length > 1) {
  // Add a click event listener to the second button
  buttons[1].addEventListener('click',addUrlParameterAndRedirect)
}*/