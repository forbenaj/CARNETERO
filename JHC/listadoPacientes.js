/* Se ejecuta en el turnero JHC (pantallas "Asignación de Turnos" y "Atención Paciente").
  Genera un código QR para cada paciente y lo muestra al pasar el mouse por el número de beneficio.
  Agrega opción para copiar datos de cada paciente.
  Agrega links de whatsapp a los celulares, y un cuadro de mensaje con variables dinámicas
*/

var mainTable = document.getElementById('TABLEMAIN')

class MessageBox{
    constructor(main, defaultMessage){
        this.main = main
        this.defaultMessage = defaultMessage

        this.displayButton = this.createButton("Mensaje", "", "green", "bold", "block")
        this.displayButton.onclick = () => this.show()

        this.container = document.createElement('div')
        this.container.style.display = "none"
        
        this.inputField = document.createElement('textarea')
        this.inputField.rows = "8"
        this.inputField.cols = "60"

        this.buttonsContainer = document.createElement('div')

        this.resetButton = this.createButton("Reset", "red", "white", "bold")
        this.resetButton.onclick = () => {
            this.inputField.value = this.defaultMessage
        }
        
        this.saveButton = this.createButton("Guardar", "green", "white", "bold")
        this.saveButton.onclick = () => {
            setValue("whatsappMessage",this.inputField.value);
        }
        
        getValue("whatsappMessage", (value) => {
            if (value === undefined) {
                this.inputField.value = this.defaultMessage
            }
            else {this.inputField.value = value};
        });
        

        this.buttonsContainer.appendChild(this.resetButton)
        this.buttonsContainer.appendChild(this.saveButton)

        this.container.appendChild(this.inputField)
        this.container.appendChild(this.buttonsContainer)
        
        this.main.appendChild(this.displayButton)
        this.main.appendChild(this.container)

    }

    createButton(value, backgroundColor, color, fontWeight, display){
        let button = document.createElement('input')
        button.type = "button"
        button.value = value
        button.style.backgroundColor = backgroundColor
        button.style.color = color
        button.style.fontWeight = fontWeight
        button.style.display = display
        return button
    }

    show(){
        if (this.container.style.display == "none"){
            this.container.style.display = "block"
        }
        else{
            this.container.style.display = "none"
        }
    }
}

var defaultMessage = "Clínica Lazarte le recuerda su turno:\n#apellido #nombre\n#dia #fecha\n#hora\ncon el Profesional #profesional\n*POR FAVOR CONFIRME SU ASISTENCIA*"

var exampleMessage = "Buen día, me comunico de la Clínica Lazarte para confirmar el turno de \
                      #apellido #nombre el día #dia #fecha a las #hora con el profesional #profesional. \
                      Va a poder asistir?"

let messageBox = new MessageBox(mainTable, defaultMessage)

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
            newOption.value = "9"
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

// Select the target node
let turnosContainer = document.getElementById('GridContainerTbl');

// Create a MutationObserver instance
let observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            // Check if targetNode or its subtree has removed nodes
            if (Array.from(mutation.removedNodes).includes(turnosContainer)) {
                // Your function to execute when targetNode is removed
                // Call your function here
                console.log('Lista actualizada');
                
                    
                setTimeout(() => {
                    console.log('ready')
                    turnosContainer = document.getElementById('GridContainerTbl');
                    
                    loadAgenda();
                }, 500);
            }
        }
    }
});

// Configuration of the observer:
let config = { childList: true, subtree: true };

// Start observing the target node for configured mutations
observer.observe(document.body, config);