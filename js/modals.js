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

    if (window.reciboPendienteDeMostrar) {
        window.reciboPendienteDeMostrar = false;
        cerrarM();
        setTimeout(() => abrirM('modal-recibo'), 150);
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
