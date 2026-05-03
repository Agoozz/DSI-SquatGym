let descuentoCobroAplicado = false;

function pagoCorrecto() {

    console.log("Contexto:", currentContext);

    if(currentContext === 'kiosco'){
        
        const ord = "#OR-" + Math.floor(1000 + Math.random() * 9000);

        document.getElementById('cod-retiro-cliente').innerText = ord;

        cerrarFlujoPago();
        abrirM('modal-retiro-cliente');

    } else {

        alert("Pago de cuota registrado ✔");

        cerrarFlujoPago();
    }
}

function calcularVuelto(){
      const efectivo = parseInt(document.getElementById("efectivo-input").value) || 0;
      const vuelto = efectivo - tAluK;

      document.getElementById("vuelto").innerText =
          "$" + Math.max(0, vuelto).toLocaleString();
  }

function confirmarCobro(){
    alert("Cobro registrado correctamente ✔");

    // limpiar carrito
    itemsCAlu = [];
    tAluK = 0;
    updateMarketCart();

    cerrarM();
}

let currentMetodoModal = null;

function mostrarPago(tipo){
      currentMetodoModal = tipo;
      const cont = document.getElementById("pago-contenido");
      const opciones = document.getElementById("pago-opciones");

      opciones.classList.add("hidden");
      cont.classList.remove("hidden");
      
      if(tipo === "qr"){
          cont.innerHTML = `
              <p class="text-sm text-blue-400 font-bold mb-3">Escaneá el QR con Mercado Pago</p>
              <div class="bg-white p-4 rounded-xl flex justify-center mb-4">
                  <i class="fas fa-qrcode text-[100px] text-black"></i>
              </div>
              <button onclick="simularPagoQR()" class="btn-ui bg-[#009EE3] w-full mt-1">
                  Confirmar Escaneo
              </button>
              <div id="qr-estado" class="mt-3 text-xs font-bold text-center"></div>
          `;
      }

      if(tipo === "transferencia"){
          cont.innerHTML = `
              <p class="text-sm text-orange-400 font-bold mb-2">Datos Bancarios</p>
              <div class="text-left text-xs space-y-1 mb-4 bg-slate-800 p-3 rounded-xl">
                  <p>CBU: <span class="text-white font-black">0000003100001234567890</span></p>
                  <p>Alias: <span class="text-white font-black">squat.gym</span></p>
                  <p>Titular: <span class="text-white font-black">SquatGym SA</span></p>
              </div>
              <input id="input-cbu-alias" placeholder="CBU o Alias del cliente" class="w-full mb-2 p-2 rounded bg-slate-800 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500">
              <input id="input-comprobante" placeholder="N° de comprobante" class="w-full mb-3 p-2 rounded bg-slate-800 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500">
              <button onclick="simularTransferencia()" class="btn-ui btn-naranja w-full">
                  Confirmar Transferencia
              </button>
              <div id="transfer-estado" class="mt-3 text-xs font-bold text-center"></div>
          `;
      }

      if(tipo === "tarjeta"){
          cont.innerHTML = `
              <p class="text-sm text-orange-400 font-bold mb-3">Datos de la Tarjeta</p>
              <div class="space-y-2 text-left">
                  <input id="input-titular" placeholder="Nombre del titular" class="w-full p-2 rounded bg-slate-800 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500">
                  <input id="input-numero-t" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" class="w-full p-2 rounded bg-slate-800 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500">
                  <div class="flex gap-2">
                      <input id="input-vto" placeholder="MM/AA" maxlength="5" class="w-1/2 p-2 rounded bg-slate-800 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500">
                      <input id="input-cvv" placeholder="CVV" maxlength="3" type="tel" class="w-1/2 p-2 rounded bg-slate-800 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500">
                  </div>
              </div>
              <button onclick="simularPosnet()" class="btn-ui btn-naranja w-full mt-4">
                  <i class="fas fa-credit-card mr-1"></i> Procesar con Posnet
              </button>
              <div id="posnet-estado" class="mt-3 text-xs font-bold text-center"></div>
          `;
      }

      if(tipo === "efectivo"){
          if(rRol !== "admin") return;
          const deudaActual = socioActual ? socioActual.deuda : totalCobro;
          cont.innerHTML = `
              <p class="text-sm text-green-400 font-bold mb-3">Pago en Efectivo</p>
              <p class="text-xs text-slate-400 mb-1">Total a cobrar: <span class="text-white font-black">$${deudaActual.toLocaleString()}</span></p>
              <input id="input-efectivo" type="number" placeholder="Monto recibido" min="0"
                  oninput="calcularVueltoModal(${deudaActual})"
                  class="w-full p-2 rounded bg-slate-800 text-white text-xs mt-2 outline-none focus:ring-1 focus:ring-orange-500">
              <p id="vuelto-texto" class="text-xs text-green-400 mt-2 font-bold">Vuelto: $0</p>
              <button onclick="simularEfectivo(${deudaActual})" class="btn-ui bg-green-600 w-full mt-3">
                  Confirmar Pago en Efectivo
              </button>
          `;
      }
  }

function calcularVueltoModal(total){
      const rec = parseFloat(document.getElementById("input-efectivo").value || 0);
      document.getElementById("vuelto-texto").innerText = "Vuelto: $" + Math.max(0, rec - total).toLocaleString();
  }

 function registrarPagoExitoso(metodo) {
      // Actualizar sociosDB si hay un socio activo
      if (socioActual) {
          socioActual.deuda   = 0;
          socioActual.estado  = 'Al día';
          const monto = socioActual.deuda || totalCobro;
          transacciones.push({ tipo: metodo, monto: monto, cliente: socioActual.nombre });
          socioActual = null;
      }
      
      // Reiniciar el estado del cupón
      descuentoCobroAplicado = false;
      const btn = document.getElementById('btn-aplicar-cupon');
      if (btn) {
          btn.innerText = 'Aplicar';
          btn.classList.replace('bg-green-600', 'bg-orange-500');
          btn.classList.replace('hover:bg-green-700', 'hover:bg-orange-600');
          btn.disabled = false;
      }
      const inputCupon = document.getElementById('input-cupon-cobro');
      if(inputCupon){
          inputCupon.value = '';
          inputCupon.disabled = false;
          inputCupon.classList.remove('text-green-400', 'border-green-500', 'bg-green-500/10');
      }
      const cuponMsg = document.getElementById('msg-cupon-cobro');
      if(cuponMsg) cuponMsg.classList.add('hidden');

      cerrarFlujoPago();
      closeModal();
      
      const clienteBox = document.getElementById('cliente-box');
      if(clienteBox) clienteBox.classList.add('hidden');
      
      filtrarSocios(); // refrescar tabla
  }

function simularPagoQR(){
      const el = document.getElementById("qr-estado");
      el.innerHTML = `<span class="text-yellow-400">⏳ Procesando...</span>`;
      setTimeout(() => {
          const ok = Math.random() > 0.3;
          if(ok){
              el.innerHTML = `<span class="text-green-400 text-sm">✔ Pago Exitoso</span>`;
              setTimeout(() => registrarPagoExitoso('QR'), 900);
          } else {
              el.innerHTML = `<span class="text-red-400 text-sm">✘ Error de Conexión. Reintentá.</span>`;
          }
      }, 1200);
  }

 function simularTransferencia(){
      const cbu  = document.getElementById("input-cbu-alias")?.value.trim();
      const comp = document.getElementById("input-comprobante")?.value.trim();
      const el   = document.getElementById("transfer-estado");
      if(!cbu || !comp){ el.innerHTML = `<span class="text-red-400">Completá todos los campos.</span>`; return; }
      el.innerHTML = `<span class="text-yellow-400">⏳ Verificando comprobante...</span>`;
      setTimeout(() => {
          const ok = Math.random() > 0.2;
          if(ok){
              el.innerHTML = `<span class="text-green-400 text-sm">✔ Transferencia Verificada</span>`;
              setTimeout(() => registrarPagoExitoso('Transferencia'), 900);
          } else {
              el.innerHTML = `<span class="text-red-400 text-sm">✘ Comprobante inválido. Verificá los datos.</span>`;
          }
      }, 1200);
  }

function simularPosnet(){
      const titular = document.getElementById("input-titular")?.value.trim();
      const numero  = document.getElementById("input-numero-t")?.value.trim();
      const vto     = document.getElementById("input-vto")?.value.trim();
      const cvv     = document.getElementById("input-cvv")?.value.trim();
      const el      = document.getElementById("posnet-estado");
      if(!titular || !numero || !vto || !cvv){ el.innerHTML = `<span class="text-red-400">Completá todos los campos.</span>`; return; }
      el.innerHTML = `<span class="text-yellow-400">⏳ Conectando con Posnet...</span>`;
      setTimeout(() => {
          const ok = Math.random() > 0.25;
          if(ok){
              el.innerHTML = `<span class="text-green-400 text-sm">✔ Tarjeta Aprobada</span>`;
              setTimeout(() => registrarPagoExitoso('Tarjeta'), 900);
          } else {
              el.innerHTML = `<span class="text-red-400 text-sm">✘ Tarjeta Rechazada. Intentá con otro medio.</span>`;
          }
      }, 1500);
  }


function simularEfectivo(total){
      const rec = parseFloat(document.getElementById("input-efectivo")?.value || 0);
      if(rec < total){ alert("El monto recibido es insuficiente."); return; }
      registrarPagoExitoso('Efectivo');
  }
 function confirmarEfectivo(){
      const recibido = parseFloat(document.getElementById("input-efectivo").value || 0);

      if(recibido < totalCobro){
          alert("Falta dinero");
          return;
      }

      alert("Pago en efectivo registrado ✔");
      closeModal();
  }

 function guardarDatosTarjeta() {
      const btn = document.getElementById('btn-guardar');

      btn.innerText = "Datos guardados ✓";

      btn.classList.remove('text-gray-500'); 
      btn.classList.add('text-green-600');   

      btn.disabled = true;
  }

 function cambiarMetodoPago(){
      const metodo = document.getElementById("metodo-pago").value;

      document.getElementById("bloque-efectivo").classList.add("hidden");
      document.getElementById("bloque-qr").classList.add("hidden");
      document.getElementById("bloque-transferencia").classList.add("hidden");
      document.getElementById("bloque-tarjeta").classList.add("hidden");

      if(metodo === "efectivo"){
          document.getElementById("bloque-efectivo").classList.remove("hidden");
      }
      if(metodo === "qr"){
          document.getElementById("bloque-qr").classList.remove("hidden");
      }
      if(metodo === "transferencia"){
          document.getElementById("bloque-transferencia").classList.remove("hidden");
      }
      if(metodo === "tarjeta"){
          document.getElementById("bloque-tarjeta").classList.remove("hidden");
      }
  }

// ══════════════════════════════════════════════
// LÓGICA DE CUPONES Y DESCUENTOS
// ══════════════════════════════════════════════

function aplicarCuponCobro() {
    const inputCupon = document.getElementById('input-cupon-cobro');
    const btn = document.getElementById('btn-aplicar-cupon');
    const codigo = inputCupon.value.trim().toUpperCase();

    if (!codigo) {
        alert("Por favor, ingresá un código válido.");
        return;
    }

    if (!socioActual) {
        alert("Las promociones solo aplican al pago de planes/cuotas, no a productos del kiosco.");
        return;
    }

    if (descuentoCobroAplicado) {
        alert("Ya se ha aplicado una promoción a este cobro.");
        return;
    }

    // Buscar el plan del socio actual en planesDB (ej: "Zumba")
    const plan = planesDB.find(p => p.nombre.toLowerCase() === socioActual.clase.toLowerCase());
    
    if (!plan) {
        alert("El plan del socio no se encontró en la base de datos.");
        return;
    }

    if (plan.tipoPromo === 'ninguna') {
        alert(`El plan ${plan.nombre} no tiene promociones activas en este momento.`);
        return;
    }

    // Validar si el código ingresado coincide con el configurado
    if (plan.valorPromo.toUpperCase() !== codigo) {
        alert("Código de promoción inválido o no corresponde a la promoción activa de este plan.");
        return;
    }

    // Determinar descuento según el tipo
    let porcentaje = 0;
    if (plan.tipoPromo === 'cupon') porcentaje = 0.20; // 20%
    else if (plan.tipoPromo === 'dia_especial') porcentaje = 0.15; // 15%
    else if (plan.tipoPromo === 'amigos') porcentaje = 0.50; // 50%

    // Aplicar el descuento sobre la deuda
    const montoDescuento = socioActual.deuda * porcentaje;
    socioActual.deuda -= montoDescuento;
    descuentoCobroAplicado = true;

    // Actualizar UI General
    const totalCaja = document.getElementById('total-caja');
    if(totalCaja) {
        totalCaja.innerHTML = `$${socioActual.deuda.toLocaleString()} <br><span class="text-sm text-green-400">¡Descuento de $${montoDescuento.toLocaleString()} aplicado!</span>`;
    }
    
    // Feedback visual en el input/botón
    inputCupon.value = codigo;
    inputCupon.disabled = true;
    inputCupon.classList.add('text-green-400', 'border-green-500', 'bg-green-500/10');
    
    btn.innerHTML = `<i class="fas fa-check"></i>`;
    btn.classList.replace('bg-orange-500', 'bg-green-600');
    btn.classList.replace('hover:bg-orange-600', 'hover:bg-green-700');
    btn.disabled = true;

    const cuponMsg = document.getElementById('msg-cupon-cobro');
    const valorMsg = document.getElementById('valor-cupon-aplicado');
    if(cuponMsg && valorMsg){
        valorMsg.innerText = porcentaje * 100;
        cuponMsg.classList.remove('hidden');
    }

    // Refrescar el sub-panel de efectivo si está abierto para mostrar el nuevo total
    if (typeof currentMetodoModal !== 'undefined' && currentMetodoModal && !document.getElementById('pago-opciones').classList.contains('hidden') === false) {
        mostrarPago(currentMetodoModal);
    }
}
