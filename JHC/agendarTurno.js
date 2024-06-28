var atencionMotivo = document.getElementById("ATENCIONMOTIVO")


// Create the textarea element
var atencionMotivoNew = document.createElement('textarea');

// Set attributes for the textarea
atencionMotivoNew.placeholder = 'Ingrese Motivo de Atención';
atencionMotivoNew.spellcheck = true;
atencionMotivoNew.cols = 80;
atencionMotivoNew.rows = 7;
atencionMotivoNew.name = 'ATENCIONMOTIVO';
atencionMotivoNew.id = 'ATENCIONMOTIVO';
atencionMotivoNew.className = 'form-control Attribute';
//atencionMotivoNew.setAttribute("onfocus","gx.evt.onfocus(this, 211,'',false,'',0)")
atencionMotivoNew.setAttribute("onchange",";gx.evt.onchange(this, event)")
atencionMotivoNew.setAttribute("onblur",";gx.evt.onblur(this,211);")
atencionMotivoNew.setAttribute("onkeydown","return gx.evt.checkMaxLength(this,500,event);")
atencionMotivoNew.setAttribute("onkeyup","return gx.evt.checkMaxLength(this,500,event);")
atencionMotivoNew.setAttribute('data-gx-context', '["", false]');
atencionMotivoNew.maxLength = 500;
atencionMotivoNew.setAttribute('data-gx-tpl-applied-atts-vars', '');


atencionMotivo.replaceWith(atencionMotivoNew)

let mainTable = document.getElementById("TABLECONTENT_MPAGE")

let botoneraContainer = document.createElement("div")
botoneraContainer.id = "botoneraContainer"

let botoneraFieldset = document.createElement("fieldset")
botoneraFieldset.className = "Group copiarDatos"
botoneraFieldset.id = "copiarDatos"

let botoneraTitle = document.createElement("legend")
botoneraTitle.className = "GroupTitle"
botoneraTitle.innerText = "Copiar datos"

botoneraContainer.appendChild(botoneraFieldset)
botoneraFieldset.appendChild(botoneraTitle)

let botonCopiarMensaje = document.createElement("input")
botonCopiarMensaje.type = "button"
botonCopiarMensaje.value = "Mensaje"
botonCopiarMensaje.onclick = ()=>copiarTurno("Mensaje")

let botonCopiarCirugia = document.createElement("input")
botonCopiarCirugia.type = "button"
botonCopiarCirugia.value = "Cirugia"
botonCopiarCirugia.onclick = ()=>copiarTurno("Cirugia")

let botonEnviarTurno = document.createElement("input")
botonEnviarTurno.type = "button"
botonEnviarTurno.value = "Enviar turno"
botonEnviarTurno.onclick = (e) => {
  
  let botonModificarPaciente = document.getElementById("BTNBTNMODIFICARPACIENTE");
  botonModificarPaciente.click()
  waitForElementToExist('#gxp0_b').then(element => {enviarTurnoWhatsapp()})
}
botonEnviarTurno.style.backgroundColor="green"
botonEnviarTurno.style.color="white"
botonEnviarTurno.style.fontWeight="bold"

botoneraFieldset.appendChild(botonCopiarMensaje)
botoneraFieldset.appendChild(botonCopiarCirugia)
botoneraFieldset.appendChild(botonEnviarTurno)

mainTable.appendChild(botoneraContainer)

let dia = document.getElementById("span_vFECHADIA")
let fecha = document.getElementById("ATENCIONFECHA")
let hora = document.getElementById("ATENCIONHORA")
let drFromTurnoLibre = document.getElementById("span_PROFESIONALID")
let drFromBotonAgendar = document.getElementById("PROFESIONALID")

let dni = document.getElementById("vAPACIENTENRODOC")
let apellido = document.getElementById("span_PACIENTEAPELLIDO")
let nombre = document.getElementById("span_PACIENTENOMBRE")
let os = document.getElementById("ATENCIONOBRASOCIALID")
let motivo = document.getElementById("ATENCIONMOTIVO")

let usuario = document.getElementById("span_vCOFUSUARIOID_MPAGE")


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

function enviarTurnoWhatsapp() {
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