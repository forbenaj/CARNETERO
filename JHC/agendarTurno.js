/* Se ejecuta en el turnero JHC (pantalla "Agregar turno").
  Remueve restricción del campo OME para llenar otros campos
  Agrega botones para copiar datos (para enviar como mensaje y para pacientes de cirugía)
  Agrega botón para enviar turno por whatsapp
*/

var restrictedElements = ["ATENCIONMOTIVO","ATENCIONNOTA","ATENCIONCOMODIN"]

for(let id of restrictedElements){
    element = document.getElementById(id)
    removeListener(element,"onfocus")
}


var mainTable = document.getElementById("TABLECONTENT_MPAGE")

class Botonera{
    constructor(main, buttons){
        
        this.main = main
        
        this.buttons = buttons

        this.container = document.createElement("div")
        this.container.id = "botoneraContainer"
        
        this.fieldset = document.createElement("fieldset")
        this.fieldset.className = "Group copiarDatos"
        this.fieldset.id = "copiarDatos"
        
        this.title = document.createElement("legend")
        this.title.className = "GroupTitle"
        this.title.innerText = "Copiar datos"
        
        this.container.appendChild(this.fieldset)
        this.fieldset.appendChild(this.title)

        this.createButtons()

        this.main.appendChild(this.container)
    }
    
    createButtons(){
        for (let button of this.buttons) {
            let buttonElement = document.createElement("input")
            buttonElement.type = "button"
            buttonElement.value = button.value
            buttonElement.onclick = ()=> button.action(button.value)
            
            buttonElement.style.backgroundColor=button.backgroundColor
            buttonElement.style.color=button.color
            buttonElement.style.fontWeight=button.fontWeight

            this.fieldset.appendChild(buttonElement)
            
        }
    }
}

let buttons = [
    {
        value: "Mensaje",
        action: copiarTurno,
        bacgkroundColor: "none",
        color: "black",
        fontWeight: "normal"
    },
    {
        value: "Cirugia",
        action: copiarTurno,
        bacgkroundColor: "none",
        color: "black",
        fontWeight: "normal"
    },
    {
        value: "Enviar turno",
        action: enviarTurnoWhatsapp,
        backgroundColor: "green",
        color: "white",
        fontWeight: "bold"
    }
]

let botonera = new Botonera(mainTable,buttons)

class TurnoAgendar extends Turno{
    constructor(elements, paciente){
        let dia = elements.dia.innerText
        let fecha = elements.fecha.innerText
        let hora = elements.hora.innerText
        let profesional = elements.profesional.innerText

        super(paciente, dia, fecha, hora, profesional)

    }
    static create(){
        let diaElement = document.getElementById("span_vFECHADIA")
        let fechaElement = document.getElementById("ATENCIONFECHA")
        let horaElement = document.getElementById("ATENCIONHORA")
        let profesionalElement = document.getElementById("span_PROFESIONALID")
        profesionalElement = profesionalElement !== null ? profesionalElement : document.getElementById("PROFESIONALID")
        
        let apellidoElement = document.getElementById("span_PACIENTEAPELLIDO")
        let nombreElement = document.getElementById("span_PACIENTENOMBRE")
        let dniElement = document.getElementById("vAPACIENTENRODOC")

        let osElement = document.getElementById("ATENCIONOBRASOCIALID")
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

        return new TurnoListado(elements, paciente)
    }
}

var dia = document.getElementById("span_vFECHADIA")
var fecha = document.getElementById("ATENCIONFECHA")
var hora = document.getElementById("ATENCIONHORA")
var drFromTurnoLibre = document.getElementById("span_PROFESIONALID")
var drFromBotonAgendar = document.getElementById("PROFESIONALID")

var dni = document.getElementById("vAPACIENTENRODOC")
var apellido = document.getElementById("span_PACIENTEAPELLIDO")
var nombre = document.getElementById("span_PACIENTENOMBRE")
var os = document.getElementById("ATENCIONOBRASOCIALID")
var motivo = document.getElementById("ATENCIONMOTIVO")

var usuario = document.getElementById("span_vCOFUSUARIOID_MPAGE")


function copiarTurno(type){
    let dr;
    let copiar;

    if(drFromTurnoLibre){
        dr = drFromTurnoLibre.innerText
    }
    else if(drFromBotonAgendar){
        dr = drFromBotonAgendar.options[drFromBotonAgendar.selectedIndex].textContent
    }

    if(type=="Mensaje"){
        copiar = `Queda agendado el día ${dia.innerText} ${fecha.value} a las ${hora.value} con el Dr. ${dr}`
    }
    if(type=="Cirugia"){
        copiar = apellido.innerText + " " + nombre.innerText + " " + dni.value + " " + os.options[0].innerText.trim() + " " + motivo.value + ", " + getFirstWord(dr) + " " + fecha.value + " " + hora.value + " - " + usuario.innerText
    }
    navigator.clipboard.writeText(copiar)
    showMessage(copiar)

}

function enviarTurnoWhatsapp(e) {
    
    let botonModificarPaciente = document.getElementById("BTNBTNMODIFICARPACIENTE");
    botonModificarPaciente.click()
    waitForElementToExist('#gxp0_b').then(element => {
        document.getElementById("gxp0_ifrm").onload = function(){
            let dr;
            let copiar;
          
            if(drFromTurnoLibre){
                dr = drFromTurnoLibre.innerText
            }
            else if(drFromBotonAgendar){
                dr = drFromBotonAgendar.options[drFromBotonAgendar.selectedIndex].textContent
            }
    
          
            let closeButton = document.getElementById("gxp0_cls")
    
            let iframe = document.getElementById("gxp0_ifrm")
    
            
            let telCod = iframe.contentWindow.document.getElementById("CELTELEFONO_TELEFONOCODAREA")
            let telNum = iframe.contentWindow.document.getElementById("CELTELEFONO_TELEFONONRO")
    
            let mensaje = `Su turno queda agendado el día ${dia.innerText} ${fecha.value} a las ${hora.value} con el Dr. ${dr}`
    
            let whatsappLink = "https://web.whatsapp.com/send?phone="+telCod.value+telNum.value+"&text="+mensaje
            console.log(whatsappLink)
    
            window.open(whatsappLink)
    
            setTimeout(() => {closeButton.click()}, 10); 
        }
        
    })
}


function showMessage(str){
    let opacity = 1;
    let messageContainer = document.createElement("div")
    messageContainer.id = "messageContainer"
    let message = document.createElement("p")
    message.id = "message"
    message.innerText = str

    messageContainer.appendChild(message)
    document.body.appendChild(messageContainer)
    
    var interval = setInterval(function() {
        if (opacity <= 0) {
            clearInterval(interval);
            messageContainer.remove()
        }
        messageContainer.style.opacity = opacity;
        opacity -= 0.01;
    }, 10);

}


function removeListener(element,attribute){
    element.removeAttribute(attribute)
    element.replaceWith(element.cloneNode(true));
}

