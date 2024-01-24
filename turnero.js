var index = 1;
var indexString = index < 10 ? "0"+index : index;
var curBenef = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString);

var benefInner = curBenef.textContent;
var beneficio;
var cod;



while(curBenef){

  indexString = index < 10 ? "0"+index : index;
  curBenef.addEventListener('mouseover', (event) => {
    // Get the target element that was hovered
    const target = event.target;

    var benefInner = target.textContent;


    if(benefInner.includes("-")){
      var benefSplit = benefInner.split("-");
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

    console.log(beneficio,cod);

    // Create the floating image element
    const img = document.createElement('img');
    img.setAttribute("id","qr");
    img.src = "https://image-charts.com/chart?chs=100x100&cht=qr&chl="+ beneficio +"-"+cod;
    img.style.position = 'absolute';
    img.style.zIndex = '9999';

    // Position the image near the hovered element
    const rect = target.getBoundingClientRect();
    img.style.top = `${rect.top + window.scrollY + 20}px`;
    img.style.left = `${rect.left + window.scrollX + 20}px`;

    // Add the image to the page
    document.body.appendChild(img);
  });

  // Listen for mouseout event on all elements
  curBenef.addEventListener('mouseout', (event) => {
    // Remove the floating image
    const qr = document.getElementById('qr');
    if (qr) {
      qr.remove();
    }
  });

  index++
  
  curBenef = document.getElementById("span_PACIENTENROAFILIADO_00"+indexString);
};