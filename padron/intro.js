/* Se ejecuta en la pantalla inicial del padrón (el buscador).
  Añade el argumento "dni" a la URL del formulario buscador, para poder mostrarlo después en la pantalla principal del buscador.
  Por serendipia elimina el captcha.
*/

// Función para añadir la nueva acción al formulario y ejecutarlo
function addUrlParameterAndRedirect() {
    const form = document.getElementById("form2")
    const dniInput = document.querySelector('[name="nroDocumento"]')
    
    form.setAttribute("action", "result.php?c=6-2-2&dni="+dniInput.value);
    form.submit();  
}


// Agarra el botón "buscar" del dni
const buttons = document.querySelectorAll('.botonConsultar');

if (buttons.length > 1) {
    // Añade el nuevo event listener
    buttons[1].addEventListener('click',addUrlParameterAndRedirect)
}