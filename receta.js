function currentUser(e){
var users = {
'SU23683188': 'Lazarte',
'UP20122486878': 'Lucchini',
'UP20178440366N3': 'Crespin',
'UP20289175416': 'Peralta',
'UP20370802255N1': 'Lascano',
'UP27347676336N1': 'Llupia',
'default': ' '
};
return users[e];
}


var usuario = document.getElementById("usua_logeo");

var doctor = document.createElement("p");


usuario.addEventListener("change", function(e){
  usuario = document.getElementById("usua_logeo");
  console.log("user is " +usuario.value);
  usuario.insertAdjacentElement("afterend",doctor);
  doctor.textContent = currentUser(usuario.value);
})


var changeEvent = document.createEvent("HTMLEvents");
changeEvent.initEvent("change",true,true);
usuario.dispatchEvent(changeEvent);