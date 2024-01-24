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