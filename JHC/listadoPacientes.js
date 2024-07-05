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

class Paciente{
    constructor(apellido, nombre, dni, benefRaw, cel ){
        this.apellido = apellido
        this.nombre = nombre
        this.dni = dni
        this.beneficio, this.cod = this.normalizeBeneficio(benefRaw)
        this.cel = cel
    }
    normalizeBeneficio(benefRaw){
        let beneficio, cod
        if(benefRaw.includes("-")){
            let benefSplit = benefRaw.split("-");
            beneficio=benefSplit[0]
            cod=benefSplit[1]
        }
        else if(benefRaw.length==11 || benefRaw.length==12){
            beneficio=benefRaw;
            cod = "00";
        }
        else if(benefRaw.length==13){
            beneficio=benefRaw.substr(0,11);
            cod = benefRaw.substr(11,13)
        }
        else if(benefRaw.length==14){
            beneficio=benefRaw.substr(0,12);
            cod=benefRaw.substr(12,14);
        }
        return beneficio, cod
    }
}

class Turno{
    constructor(elements, paciente){
        this.elements = elements
        this.paciente = paciente

        this.dia = this.elements.dia.innerText
        this.fecha = this.elements.fecha.innerText
        this.hora = this.elements.hora.innerText
        this.profesional = this.elements.profesional.innerText

        this.elements.beneficio.addEventListener('mouseover', (event) => {
            let target = event.target;
            this.showQR(target)
        })
        this.elements.beneficio.addEventListener('mouseout', (event) => {
            this.removeQR()
        });

        this.elements.cel.onclick = ()=>sendWhatsapp({...this.paciente, ...this})
        this.elements.cel.style.cursor = "pointer";

        this.addCopyDataButton()
    }
    static createFromIndex(index){
        let indexString = index < 10 ? "0"+index : index

        let turnoElement = document.getElementById("GridContainerRow_00"+indexString)

        if(!turnoElement){
            return null
        }

        let diaElement = document.getElementById("span_vFECHADIA_00"+indexString)
        let fechaElement = document.getElementById("span_ATENCIONFECHA_00"+indexString)
        let horaElement = document.getElementById("span_ATENCIONHORA_00"+indexString)
        let profesionalElement = document.getElementById("span_PROFESIONALAPENOM_00"+indexString)

        
        let apellidoElement = document.getElementById("span_PACIENTEAPELLIDO_00"+indexString)
        let nombreElement = document.getElementById("span_PACIENTENOMBRE_00"+indexString)
        let dniElement = document.getElementById("span_PACIENTENRODOC_00"+indexString)

        let beneficioElement = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString) // Elemento de numero de beneficio
        let celElement = document.getElementById("span_vPACIENTECELULAR_00"+indexString) // Elemento de celular
        let actionElement = document.getElementById("vACTION_00"+indexString) // Elemento de acción (únicamente disponible en pantalla "Asignación de Turnos")


        let elements = {
            turno: turnoElement,
            dia: diaElement,
            fecha: fechaElement,
            hora: horaElement,
            profesional: profesionalElement,
            apellido: apellidoElement,
            nombre: nombreElement,
            dni: dniElement,
            beneficio: beneficioElement,
            cel: celElement,
            action: actionElement
        }

        let apellido = apellidoElement.innerText
        let nombre = nombreElement.innerText
        let dni = dniElement.innerText
        let beneficio = beneficioElement.innerText
        let cel = celElement.innerText

        let paciente = new Paciente(apellido,nombre,dni,beneficio,cel)

        return new Turno(elements, paciente)
    }
    showQR(target){
        
        // Crear el QR flotante
        let img = document.createElement('img');
        img.setAttribute("id","qr");
        img.src = "https://image-charts.com/chart?chs=100x100&cht=qr&chl="+ this.paciente.beneficio +"-"+this.paciente.cod;
        img.style.position = 'absolute';
        img.style.zIndex = '9999';

        // Posicionar la imagen cerca del elemento
        const rect = target.getBoundingClientRect();
        img.style.top = `${rect.top + window.scrollY + 20}px`;
        img.style.left = `${rect.left + window.scrollX + 20}px`;

        // Adjuntar la imagen
        document.body.appendChild(img);
    }
    removeQR(){
        let qr = document.getElementById('qr');
        if (qr) {
            qr.remove();
        }
    }
    addCopyDataButton(){
        // Reformular función, estaría bueno una función general para añadir acciones
        // Si el elemento de acción existe, es decir, si estamos en la pantalla "Asignación de Turnos"
        if(this.elements.action){
            // Cuando se seleccione una opcion, se espera a que aparezca la ventana "Ficha de Datos del Paciente"
            this.elements.action.onchange = (e) => waitForElementToExist('#gxp0_b').then(element => {
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
            this.elements.action.appendChild(newOption)
        }
    }
}

function loadAgenda(){
    let i = 1
    let turno = Turno.createFromIndex(i)
    
    while(turno){
        i++
        turno = Turno.createFromIndex(i)
    }

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


function sendWhatsapp(datos){

    let inputText = messageBox.inputField.value;
    let outputText = inputText.replace(/#(\w+)/g, (match, placeholder) =>{
        if (datos.hasOwnProperty(placeholder)) {
            return datos[placeholder];
        } else {
            return match; // If the placeholder is not found, leave it unchanged
        }
    });
    var url = "https://web.whatsapp.com/send?phone="+datos.cel+"&text="+encodeURIComponent(outputText)
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