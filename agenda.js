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


/*
var observaciones = document.getElementById("UNNAMEDTABLEATENCIONNOTA")

var copyData = document.createElement("input")
copyData.type = "button"
copyData.className = "btn btn-default"
copyData.value = "Copiar paciente"

observaciones.appendChild(copyData)*/
/*


let mainTable = document.getElementById("TABLECONTENT_MPAGE")

let padronDiv = document.createElement("div")
let padronFrame = document.createElement("iframe")
padronFrame.src = "https://prestadores.pami.org.ar/result.php?c=6-2&vm=2"
padronFrame.className = "padronFrame"

mainTable.appendChild(padronFrame)
*/

let mainTable = document.getElementById("TABLECONTENT_MPAGE")

let botonera = document.createElement("div")

let botoneraFieldset = document.createElement("fieldset")
botoneraFieldset.className = "Group copiarDatos"

let botoneraTitle = document.createElement("legend")
botoneraTitle.className = "GroupTitle"
botoneraTitle.innerText = "Copiar datos"

botoneraFieldset.appendChild(botoneraTitle)

let botonCopiarMensaje = document.createElement("input")
botonCopiarMensaje.type = "button"
botonCopiarMensaje.value = "Mensaje"
botonCopiarMensaje.onclick = ()=>copiarMensaje()

let botonCopiarCirugia = document.createElement("input")
botonCopiarCirugia.type = "button"
botonCopiarCirugia.value = "Cirugia"
botonCopiarCirugia.onclick = ()=>copiarCirugia()

botoneraFieldset.appendChild(botonCopiarMensaje)
botoneraFieldset.appendChild(botonCopiarCirugia)

mainTable.appendChild(botoneraFieldset)

let dia = document.getElementById("span_vFECHADIA")
let fecha = document.getElementById("ATENCIONFECHA")
let hora = document.getElementById("ATENCIONHORA")
let dr = document.getElementById("span_PROFESIONALID")

let dni = document.getElementById("vAPACIENTENRODOC")
let apellido = document.getElementById("span_PACIENTEAPELLIDO")
let nombre = document.getElementById("span_PACIENTENOMBRE")
let os = document.getElementById("ATENCIONOBRASOCIALID")
let motivo = document.getElementById("ATENCIONMOTIVO")

let usuario = document.getElementById("span_vCOFUSUARIOID_MPAGE")


function copiarMensaje(){
    let copiar = `Queda agendado el día ${dia.innerText} ${fecha.value} a las ${hora.value} con el Dr. ${dr.innerText}`
    navigator.clipboard.writeText(copiar)
}
function copiarCirugia(){
    let copiar = apellido.innerText + " " + nombre.innerText + " " + dni.value + " " + os.options[0].innerText.trim() + " " + motivo.value + ", " + getFirstWord(dr.innerText) + " " + fecha.value + " - " + usuario.innerText
    navigator.clipboard.writeText(copiar)
}

function getFirstWord(str) {
    str = str.trim();
    var words = str.split(/\s+/);
    return words[0];
}

