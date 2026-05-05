 function abrirM(id, ctx){
    const cont = document.getElementById("pago-contenido");
    const opciones = document.getElementById("pago-opciones");

    if(cont && opciones){
        cont.innerHTML = "";
        cont.classList.add("hidden");
        opciones.classList.remove("hidden");
    }
    if(ctx) currentContext = ctx;
    document.getElementById(id).classList.add('active');

    if(id === "modal-cobro-kiosco"){
        document.getElementById("total-caja").innerText = 
            "$" + tAluK.toLocaleString();
    }
}

function cerrarM() { document.querySelectorAll('.modal-base').forEach(m => m.classList.remove('active')); }

function closeModal(){

    document.getElementById("modal-pago-selector").classList.remove("active");

    const cont = document.getElementById("pago-contenido");
    const opciones = document.getElementById("pago-opciones");

    if(cont && opciones){
        cont.innerHTML = "";
        cont.classList.add("hidden");
        opciones.classList.remove("hidden");
    }
}

function cerrarFlujoPago(){

    // volver a estado inicial
    const cont = document.getElementById("pago-contenido");
    const opciones = document.getElementById("pago-opciones");

    if(cont) cont.classList.add("hidden");
    if(opciones) opciones.classList.remove("hidden");

    // limpiar contenido
    if(cont) cont.innerHTML = "";
}

window.volverPago = function(){

    const modalRecibo = document.getElementById('modal-recibo');
    
    // Si hay un mensaje de éxito visible en el checkout, el botón Volver debe cerrar todo y NO abrir el recibo.
    const successMsg = document.querySelector('.text-green-400.text-sm');
    if (successMsg) {
        window.reciboPendienteDeMostrar = false;
        cerrarM();
        return;
    }

    if (modalRecibo && modalRecibo.classList.contains('active')) {
        window.reciboPendienteDeMostrar = false;
        cerrarM();
        return;
    }

    if (window.reciboPendienteDeMostrar) {
        window.reciboPendienteDeMostrar = false;
        cerrarM();
        abrirM('modal-recibo');
        return;
    }

    const cont = document.getElementById("pago-contenido");
    const opciones = document.getElementById("pago-opciones");

    if(!cont || !opciones) return;

    if(!opciones.classList.contains("hidden")){
        document.getElementById("modal-pago-selector").classList.remove("active");
        cont.innerHTML = "";
        cont.classList.add("hidden");
        return;
    }

    cont.innerHTML = "";
    cont.classList.add("hidden");
    opciones.classList.remove("hidden");
}
