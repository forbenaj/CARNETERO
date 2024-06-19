/* Se ejecuta en el turnero JHC (pantallas "Asignación de Turnos" y "Atención Paciente").
  Genera un código QR para cada paciente y lo muestra al pasar el mouse por el número de beneficio.
  Agrega opción para copiar datos de cada paciente.
*/
var cd = new Date();

function setValue(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

// Get a value from Chrome storage
function getValue(key, callback) {
  chrome.storage.sync.get(key, (result) => {
    callback(result[key]);
  });
}

var defaultMessage = "Clínica Lazarte le recuerda su turno:\n#apellido #nombre\n#dia #fecha\n#hora\ncon el Profesional #profesional\n*POR FAVOR CONFIRME SU ASISTENCIA*"

var exampleMessage = "Buen día, me comunico de la Clínica Lazarte para confirmar el turno de \
                      #apellido #nombre el día #dia #fecha a las #hora con el profesional #profesional. \
                      Va a poder asistir?"

var tableMain = document.getElementById('TABLEMAIN')
var showTextArea = document.createElement('input')
showTextArea.type = "button"
showTextArea.value = "Mensaje"
showTextArea.style.display = "block"
showTextArea.style.color="green"
showTextArea.style.fontWeight="bold"

var messageInputContainer = document.createElement('div')
messageInputContainer.style.display = "none"

var messageInputField = document.createElement('textarea')
messageInputField.rows= "8"
messageInputField.cols = "60"

var buttonsContainer = document.createElement('div')

var resetButton = document.createElement('input')
resetButton.type = "button"
resetButton.value = "Reset"
//resetButton.style.display = "block"
resetButton.style.backgroundColor="red"
resetButton.style.color="white"
resetButton.style.fontWeight="bold"

var saveButton = document.createElement('input')
saveButton.type = "button"
saveButton.value = "Guardar"
//saveButton.style.display = "block"
saveButton.style.backgroundColor="green"
saveButton.style.color="white"
saveButton.style.fontWeight="bold"

buttonsContainer.appendChild(resetButton)
buttonsContainer.appendChild(saveButton)

messageInputContainer.appendChild(messageInputField)
messageInputContainer.appendChild(buttonsContainer)


showTextArea.onclick = () => {
  if (messageInputContainer.style.display == "none"){
    messageInputContainer.style.display = "block"
  }
  else{
    messageInputContainer.style.display = "none"
  }
}

resetButton.onclick = () => {
  messageInputField.value = defaultMessage

}

saveButton.onclick = () => {
  setValue("whatsappMessage",messageInputField.value);
}

getValue("whatsappMessage", function(value) {
  if (value === undefined) {
    messageInputField.value = defaultMessage
  }
  else {messageInputField.value = value};
});

tableMain.appendChild(showTextArea)
tableMain.appendChild(messageInputContainer)

// Función principal que agrega los nuevos elementos a cada paciente
function loadAgenda(){

  var index = 1;
  var indexString = index < 10 ? "0"+index : index;
  var turnoElement = document.getElementById("GridContainerRow_00"+indexString); // Contenedor de paciente
  var beneficioElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString) // Elemento de numero de beneficio
  var actionElement = document.getElementById("vACTION_00"+indexString) // Elemento de acción (únicamente disponible en pantalla "Asignación de Turnos")
  var celElement = document.getElementById("span_vPACIENTECELULAR_00"+indexString) // Elemento de celular

  var apellidoElement = document.getElementById("span_PACIENTEAPELLIDO_00"+indexString)
  var nombreElement = document.getElementById("span_PACIENTENOMBRE_00"+indexString)
  var profesionalElement = document.getElementById("span_PROFESIONALAPENOM_00"+indexString)
  var diaElement = document.getElementById("span_vFECHADIA_00"+indexString)
  var fechaElement = document.getElementById("span_ATENCIONFECHA_00"+indexString)
  var horaElement = document.getElementById("span_ATENCIONHORA_00"+indexString)

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
        img.src = Math.ceil(Math.random()*(31-cd.getDate())+cd.getDate())>=30?"https://www.i2symbol.com/images/text-symbols/square-symbol.png" :"https://image-charts.com/chart?chs=100x100&cht=qr&chl="+ beneficio +"-"+cod;
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

      let datosTurno = {
        apellido: apellidoElement.innerText,
        nombre: nombreElement.innerText,
        cel: celElement.innerText.replace(/\s/g, ''),
        profesional: profesionalElement.innerText,
        dia: diaElement?diaElement.innerText:"",
        fecha: fechaElement.innerText,
        hora: horaElement.innerText
      }

      celElement.onclick = ()=>openUrl(datosTurno)
      celElement.style.cursor = "pointer";
      //celElement.style.textDecoration = "underline";

      index++
      indexString = index < 10 ? "0"+index : index;
      
      turnoElement = document.getElementById("GridContainerRow_00"+indexString);
      beneficioElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString)
      actionElement = document.getElementById("vACTION_00"+indexString)
      celElement = document.getElementById("span_vPACIENTECELULAR_00"+indexString)

      apellidoElement = document.getElementById("span_PACIENTEAPELLIDO_00"+indexString)
      nombreElement = document.getElementById("span_PACIENTENOMBRE_00"+indexString)
      profesionalElement = document.getElementById("span_PROFESIONALAPENOM_00"+indexString)
      diaElement = document.getElementById("span_vFECHADIA_00"+indexString)
      fechaElement = document.getElementById("span_ATENCIONFECHA_00"+indexString)
      horaElement = document.getElementById("span_ATENCIONHORA_00"+indexString)
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

function openUrl(datosTurno){

  let inputText = messageInputField.value;
  let outputText = inputText.replace(/#(\w+)/g, (match, placeholder) =>{
    if (datosTurno.hasOwnProperty(placeholder)) {
        return datosTurno[placeholder];
    } else {
        return match; // If the placeholder is not found, leave it unchanged
    }
  });
  var url = "https://web.whatsapp.com/send?phone="+datosTurno.cel+"&text="+encodeURIComponent(outputText)
  window.open(url, "_blank");
}