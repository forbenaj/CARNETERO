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

const table = document.querySelector("table");

var currentRow = table.rows[4];
var header = table.rows[3];
var qrHeader = document.createElement("td");
var qrText = document.createElement("p");
var qrCell;

var nomCopyButton = document.createElement("button");
var benefCopyButton = document.createElement("button");

qrText.textContent = "QR";
qrText.classList.add("blanco");
qrHeader.appendChild(qrText);
header.cells[4].insertAdjacentElement("afterend",qrHeader);

nomCopyButton.textContent = "📋"
benefCopyButton.textContent = "📋"


var nombreCell;
var benefCell;
var codCell;
var vencCell;

var qrsrc;

var i;
for(i=4;currentRow != null; i++){

  currentRow = table.rows[i];
  vencCell = currentRow.cells[4].firstChild;
  qrCell = document.createElement("td");
  if(vencCell.textContent == "  "){
    nombreCell = currentRow.cells[0];
    benefCell = currentRow.cells[1];
    codCell = currentRow.cells[2];
    qrsrc = "https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl="+benefCell.textContent.trim()+"-"+codCell.textContent.trim();
    const qr = document.createElement("img");
    qrCell.appendChild(qr);
    qr.setAttribute("src",qrsrc);

  }
  currentRow.cells[4].insertAdjacentElement("afterend",qrCell);
  nombreCell.firstChild.insertAdjacentElement("afterend",nomCopyButton)
  benefCell.firstChild.insertAdjacentElement("afterend",benefCopyButton)


  nomCopyButton.addEventListener("click", function() {
    copyText(nombreCell.firstChild)
  });
  benefCopyButton.addEventListener("click", function() {
    copyText(benefCell.firstChild, codCell.firstChild)
  });

}

