/* Se ejecuta en el turnero JHC (pantallas "Asignación de Turnos" y "Atención Paciente").
  Genera un código QR para cada paciente y lo muestra al pasar el mouse por el número de beneficio.
  Agrega opción para copiar datos de cada paciente.
*/


// Función principal que agrega los nuevos elementos a cada paciente
function loadAgenda(){

  var index = 1;
  var indexString = index < 10 ? "0"+index : index;
  var turnoElement = document.getElementById("GridContainerRow_00"+indexString); // Contenedor de paciente
  var beneficioElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString) // Elemento de numero de beneficio
  var actionElement = document.getElementById("vACTION_00"+indexString) // Elemento de acción (únicamente disponible en pantalla "Asignación de Turnos")
  var celElement = document.getElementById("span_vPACIENTECELULAR_00"+indexString) // Elemento de celular

  var benefInner; // Variable que aloja el numero de beneficio tal como se muestra en el turnero
  var beneficio;
  var cod;


    while(turnoElement){


      // Cuando se pase el mouse por arriba del numero de beneficio
      beneficioElement.addEventListener('mouseover', (event) => {

        const target = event.target;
        benefInner = target.textContent;

        // Formatear correctamente el numero de beneficio
        if(benefInner.includes("-")){
          let benefSplit = benefInner.split("-");
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

        // Crear el QR flotante
        const img = document.createElement('img');
        img.setAttribute("id","qr");
        img.src = "https://image-charts.com/chart?chs=100x100&cht=qr&chl="+ beneficio +"-"+cod;
        img.style.position = 'absolute';
        img.style.zIndex = '9999';

        // Posicionar la imagen cerca del elemento
        const rect = target.getBoundingClientRect();
        img.style.top = `${rect.top + window.scrollY + 20}px`;
        img.style.left = `${rect.left + window.scrollX + 20}px`;

        // Adjuntar la imagen
        document.body.appendChild(img);
      });


      // Cuando se saque el mouse de arriba del numero de beneficio
      beneficioElement.addEventListener('mouseout', (event) => {

        // Quitar la imagen
        const qr = document.getElementById('qr');
        if (qr) {
          qr.remove();
        }

      });

      // Si el elemento de acción existe, es decir, si estamos en la pantalla "Asignación de Turnos"
      if(actionElement){
        // Cuando se seleccione una opcion, se espera a que aparezca la ventana "Ficha de Datos del Paciente"
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
        newOption.value = "7"
        actionElement.appendChild(newOption)
      }

      var numCel = celElement.innerText
      if(numCel.replace(/\s/g, '') > 0){
        let celLink = document.createElement("a")
        celLink.href = "https://web.whatsapp.com/send?phone="+numCel.replace(/\s/g, '')
        celLink.target = "_blank"
        celLink.style.fontWeight = "normal"
        celLink.innerText = numCel
        celElement.innerHTML = ""
        celElement.appendChild(celLink)
      }

      index++
      indexString = index < 10 ? "0"+index : index;
      
      turnoElement = document.getElementById("GridContainerRow_00"+indexString);
      beneficioElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString)
      actionElement = document.getElementById("vACTION_00"+indexString)
      celElement = document.getElementById("span_vPACIENTECELULAR_00"+indexString)
  };
}

loadAgenda()
/*
// 👇️ using the function
waitForElementToExist('#gxp0_b').then(element => {
  console.log('The element exists', element);
});*/

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
