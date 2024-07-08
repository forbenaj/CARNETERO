class Paciente{
    constructor(apellido, nombre, dni, os, benefRaw, cel ){
        this.apellido = apellido
        this.nombre = nombre
        this.dni = dni
        this.os = os
        this.beneficio = this.normalizeBeneficio(benefRaw)
        this.cel = cel
    }
    normalizeBeneficio(benefRaw){
        let beneficio
        let cod
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
        return [beneficio, cod]
    }
}

class Turno{
    constructor(paciente, dia, fecha, hora, profesional){
        this.paciente = paciente

        this.dia = dia
        this.fecha = fecha
        this.hora = hora
        this.profesional = profesional

    }
}