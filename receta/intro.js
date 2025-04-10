function currentUser(e){
  var users = {
    '0000': '0000',
    '0000': '0000',
    '0000': '0000',
    '0000': '0000',
    '0000': '000000
    '0001001': 'fixursec',
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
