/* Se ejecuta en el turnero JHC.
  Genera un código QR para cada paciente y lo muestra al pasar el mouse por el número de afiliado.
*/

function loadAgenda(){

  var index = 1;
  var indexString = index < 10 ? "0"+index : index;
  var turnoElement = document.getElementById("GridContainerRow_00"+indexString);
  var benefElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString)
  var actionElement = document.getElementById("vACTION_00"+indexString)

  var benefInner;
  var beneficio;
  var cod;


  while(turnoElement){


    benefElement.addEventListener('mouseover', (event) => {
      // Get the target element that was hovered
      const target = event.target;

      var benefInner = target.textContent;


      if(benefInner.includes("-")){
        var benefSplit = benefInner.split("-");
        beneficio=benefSplit[0]
        cod=benefSplit[1]
      }
      else if(benefInner.length==11 || benefInner.length==12){
        beneficio=benefInner;
        cod = "00";
      }
      else if(benefInner.length==13){
        beneficio=benefInner.substr(0,11);
        cod = benefInner.substr(11,13)
      }
      else if(benefInner.length==14){
        beneficio=benefInner.substr(0,12);
        cod=benefInner.substr(12,14);
      }

      console.log(beneficio,cod);

      // Create the floating image element
      const img = document.createElement('img');
      img.setAttribute("id","qr");
      img.src = "https://image-charts.com/chart?chs=100x100&cht=qr&chl="+ beneficio +"-"+cod;
      img.style.position = 'absolute';
      img.style.zIndex = '9999';

      // Position the image near the hovered element
      const rect = target.getBoundingClientRect();
      img.style.top = `${rect.top + window.scrollY + 20}px`;
      img.style.left = `${rect.left + window.scrollX + 20}px`;

      // Add the image to the page
      document.body.appendChild(img);
    });

    // Listen for mouseout event on all elements
    benefElement.addEventListener('mouseout', (event) => {
      // Remove the floating image
      const qr = document.getElementById('qr');
      if (qr) {
        qr.remove();
      }
    });

    actionElement.onchange = (e) => waitForElementToExist('#gxp0_b').then(element => {
      let selectedOption = e.target.options[e.target.selectedIndex]
      console.log('The element exists', selectedOption);
      let closeButton = document.getElementById("gxp0_cls")
      closeButton.onclick = () => closeDialog()
      if(selectedOption.innerText == "Copiar datos"){
        copiarDatos()
      }
      
    });

    let newOption = document.createElement("option")
    newOption.innerText = "Copiar datos"
    newOption.value = "6"
    actionElement.appendChild(newOption)

    index++
    indexString = index < 10 ? "0"+index : index;
    
    turnoElement = document.getElementById("GridContainerRow_00"+indexString);
    benefElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString)
    actionElement = document.getElementById("vACTION_00"+indexString)
  };


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
}

loadAgenda()
/*
// 👇️ using the function
waitForElementToExist('#gxp0_b').then(element => {
  console.log('The element exists', element);
});*/

function copiarDatos() {
  document.getElementById("gxp0_ifrm").onload = function(){
    let closeButton = document.getElementById("gxp0_cls")
    closeButton.onclick = () => closeDialog()
    let iframe = document.getElementById("gxp0_ifrm")

    let apellido = iframe.contentWindow.document.getElementById("span_PERSONAFISICA_PERSONAFISICAAPELLIDO")
    let nombre = iframe.contentWindow.document.getElementById("span_PERSONAFISICA_PERSONAFISICANOMBRE")
    let dni = iframe.contentWindow.document.getElementById("span_PERSONAFISICA_PERSONAFISICANRODOC")
    let os = iframe.contentWindow.document.getElementById("span_PACIENTE_OBRASOCIALNOMFANTASIA")
    let telCod = iframe.contentWindow.document.getElementById("span_CELTELEFONO_TELEFONOCODAREA")
    let telNum = iframe.contentWindow.document.getElementById("span_CELTELEFONO_TELEFONONRO")

    let pacienteInfo = apellido.innerText + " " + nombre.innerText + ", DNI: "+ dni.innerText + " " + os.innerText + ", TEL: "+telCod.innerText+telNum.innerText
    console.log("Datos copiados! \n"+pacienteInfo)

    
    const textArea = document.createElement("textarea");
    
    textArea.value = pacienteInfo;

    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    setTimeout(() => {closeButton.click()}, 10); 
  }
}

function closeDialog(){
  console.log("Closed")
  loadAgenda();
}
