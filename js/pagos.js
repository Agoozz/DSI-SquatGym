let descuentoCobroAplicado = false;

function pagoCorrecto() {

    console.log("Contexto:", currentContext);

    if(currentContext === 'kiosco'){
        
        const ord = "#OR-" + Math.floor(1000 + Math.random() * 9000);

        document.getElementById('cod-retiro-cliente').innerText = ord;

        cerrarFlujoPago();
        abrirM('modal-retiro-cliente');

    } else {
        // Se omite el alert y cerrarFlujoPago() para que el usuario presione la flecha de 'Volver' y se despliegue el recibo.
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
              <div class="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div>
                      <p class="text-[10px] font-black text-[#009EE3] uppercase tracking-[0.2em] mb-2">Escaneo Mercado Pago</p>
                      <h4 class="text-xs font-bold text-slate-400">Utilizá la App para escanear el código</h4>
                  </div>
                  
                  <div class="bg-white p-6 rounded-[2rem] flex justify-center shadow-xl border-8 border-slate-900 mx-auto w-fit">
                      <i class="fas fa-qrcode text-[120px] text-black"></i>
                  </div>
                  
                  <button onclick="simularPagoQR()" class="w-full py-4 bg-[#009EE3] hover:bg-[#0089c7] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#009EE3]/20">
                      Confirmar Pago Escaneado
                  </button>
                  
                  <div id="qr-estado" class="text-[9px] font-bold uppercase tracking-widest"></div>
              </div>
          `;
      }

      if(tipo === "transferencia"){
          cont.innerHTML = `
              <div class="space-y-6 text-center animate-in fade-in slide-in-from-right-5 duration-300">
                  <div>
                      <p class="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Transferencia Bancaria</p>
                      <h4 class="text-xs font-bold text-slate-400">Transferí el total a nuestra cuenta</h4>
                  </div>

                  <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3 shadow-inner">
                      <div class="flex justify-between items-center">
                          <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Alias</span>
                          <span class="text-[10px] font-black text-white">squat.gym.mp</span>
                      </div>
                      <div class="flex justify-between items-center">
                          <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">CBU</span>
                          <span class="text-[10px] font-black text-white font-mono">0000003100001234567890</span>
                      </div>
                      <div class="flex justify-between items-center">
                          <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Titular</span>
                          <span class="text-[10px] font-black text-white">SQUATGYM S.A.</span>
                      </div>
                  </div>

                  <div class="space-y-3">
                      <input id="input-comprobante" placeholder="N° de operación o Comprobante" class="w-full py-4 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700">
                      
                      <button onclick="simularTransferencia()" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
                          Confirmar Operación
                      </button>
                  </div>

                  <div id="transfer-estado" class="text-[9px] font-bold uppercase tracking-widest"></div>
              </div>
          `;
      }

      if(tipo === "tarjeta"){
          cont.innerHTML = `
              <div class="space-y-6 text-center animate-in fade-in slide-in-from-right-5 duration-300">
                  <div>
                      <p class="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2">Pago con Tarjeta</p>
                      <h4 class="text-xs font-bold text-slate-400">Ingresá los datos de tu plástico</h4>
                  </div>

                  <div class="space-y-3">
                      <input id="input-titular" placeholder="Nombre como figura en la tarjeta" class="w-full py-4 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700">
                      
                      <div class="relative">
                        <input id="input-numero-t" placeholder="Número de Tarjeta" maxlength="19" class="w-full py-4 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700">
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-50">
                            <i class="fab fa-cc-visa text-lg"></i>
                            <i class="fab fa-cc-mastercard text-lg"></i>
                        </div>
                      </div>

                      <div class="flex gap-3">
                          <input id="input-vto" placeholder="MM/AA" maxlength="5" class="w-1/2 py-4 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 text-center">
                          <input id="input-cvv" placeholder="CVV" maxlength="3" type="tel" class="w-1/2 py-4 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 text-center">
                      </div>
                      
                      <button onclick="simularPosnet()" class="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40">
                          Procesar Pago Seguro
                      </button>
                  </div>

                  <div id="posnet-estado" class="text-[9px] font-bold uppercase tracking-widest"></div>
              </div>
          `;
      }

      if(tipo === "efectivo"){
          const deudaActual = socioActual ? socioActual.deuda : totalCobro;
          cont.innerHTML = `
              <div class="space-y-6 text-center animate-in fade-in slide-in-from-right-5 duration-300">
                  <div class="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto border-2 border-green-500/20 mb-2">
                      <i class="fas fa-money-bill-wave text-3xl"></i>
                  </div>
                  <div>
                      <p class="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-2">Pago Presencial</p>
                      <h4 class="text-xs font-bold text-slate-400">Aboná en el mostrador de tu sede</h4>
                  </div>

                  <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner">
                      <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Instrucciones</p>
                      <p class="text-[10px] font-black text-white uppercase italic leading-relaxed">
                        Acercate a la recepción, mencioná tu DNI y pedí abonar tu cuota de <span class="text-green-400">$${deudaActual.toLocaleString()}</span>. El staff registrará tu pago al instante.
                      </p>
                  </div>

                  <button onclick="simularPagoEfectivo()" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/40">
                      Hecho, Ya Aboné en Caja
                  </button>
              </div>
          `;
      }
  }

function calcularVueltoModal(total){
      const rec = parseFloat(document.getElementById("input-efectivo").value || 0);
      document.getElementById("vuelto-texto").innerText = "Vuelto: $" + Math.max(0, rec - total).toLocaleString();
  }

function registrarPagoExitoso(metodo) {
    // 1. Actualizar base de datos (Buscar socio en sociosDB por DNI)
    const dni = usuarioActual.dni;
    const socio = sociosDB.find(s => s.dni === dni);
    
    if (socio) {
        const montoPagado = socio.deuda;
        socio.deuda = 0;
        socio.estado = 'Al día';

        // 2. Agregar Transacción
        const nuevaTrans = {
            tipo: metodo,
            monto: montoPagado,
            cliente: socio.nombre,
            fecha: new Date().toISOString().split('T')[0],
            concepto: "Cuota",
            sede: socio.sede || "Sede Centro"
        };
        transacciones.push(nuevaTrans);
    }
    
    socioActual = null;
    
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

    // El flujo de pago se mantiene abierto para que el usuario presione Volver y vea el recibo.
    const clienteBox = document.getElementById('cliente-box');
    if(clienteBox) clienteBox.classList.add('hidden');
    
    filtrarSocios(); 
    if (typeof actualizarUIPerfilAlumno === 'function') {
        actualizarUIPerfilAlumno();
    }
}

function simularPagoQR(){
      const el = document.getElementById("qr-estado");
      el.innerHTML = `<p class="text-yellow-400 animate-pulse mt-4">⏳ Procesando transacción segura...</p>`;
      setTimeout(() => {
          const ok = Math.random() > 0.1; // Más probabilidad de éxito en simulación
          if(ok){
              el.innerHTML = `
                <div class="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl animate-in zoom-in duration-300">
                    <p class="text-green-400 text-xs font-black uppercase tracking-widest mb-3">✔ Pago Aprobado</p>
                    <button onclick="verComprobanteDesdeModal('QR')" 
                        class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <i class="fas fa-receipt mr-2"></i>Ver Comprobante
                    </button>
                </div>
              `;
              setTimeout(() => registrarPagoExitoso('QR'), 100);
          } else {
              el.innerHTML = `<p class="text-red-400 mt-4 text-xs font-bold uppercase tracking-widest">✘ Error en la pasarela. Reintentá.</p>`;
          }
      }, 1500);
  }

 function simularTransferencia(){
      const comp = document.getElementById("input-comprobante")?.value.trim();
      const el   = document.getElementById("transfer-estado");
      if(!comp){ 
          el.innerHTML = `<p class="text-red-400 mt-4 text-[9px] font-black uppercase tracking-widest">✘ Ingresá el número de comprobante</p>`; 
          return; 
      }
      el.innerHTML = `<p class="text-yellow-400 animate-pulse mt-4">⏳ Verificando transferencia en red...</p>`;
      setTimeout(() => {
          el.innerHTML = `
            <div class="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl animate-in zoom-in duration-300">
                <p class="text-green-400 text-xs font-black uppercase tracking-widest mb-3">✔ Transferencia Confirmada</p>
                <button onclick="verComprobanteDesdeModal('TRANSFERENCIA')" 
                    class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <i class="fas fa-receipt mr-2"></i>Ver Comprobante
                </button>
            </div>
          `;
          setTimeout(() => registrarPagoExitoso('TRANSFERENCIA'), 100);
      }, 1800);
  }

function simularPosnet(){
    const titular = document.getElementById("input-titular")?.value.trim();
    const numero  = document.getElementById("input-numero-t")?.value.trim();
    const vto     = document.getElementById("input-vto")?.value.trim();
    const cvv     = document.getElementById("input-cvv")?.value.trim();
    const el      = document.getElementById("posnet-estado");

    if(!titular || !numero || !vto || !cvv){
        el.innerHTML = `<p class="text-red-400 mt-4 text-[9px] font-black uppercase tracking-widest">✘ Completá todos los datos de la tarjeta</p>`;
        return;
    }

    el.innerHTML = `<p class="text-yellow-400 animate-pulse mt-4">⏳ Autorizando con entidad bancaria...</p>`;
    
    setTimeout(() => {
        el.innerHTML = `
            <div class="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl animate-in zoom-in duration-300">
                <p class="text-green-400 text-xs font-black uppercase tracking-widest mb-3">✔ Pago con Tarjeta Aprobado</p>
                <button onclick="verComprobanteDesdeModal('TARJETA')" 
                    class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <i class="fas fa-receipt mr-2"></i>Ver Comprobante
                </button>
            </div>
        `;
        setTimeout(() => registrarPagoExitoso('TARJETA'), 100);
    }, 2000);
}

function simularPagoEfectivo(){
    registrarPagoExitoso('EFECTIVO');
    // Mostrar recibo directamente para cerrar el flujo de simulación
    verComprobanteDesdeModal('EFECTIVO');
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

// ══════════════════════════════════════════════
// LÓGICA DE NOTIFICACIONES A DEUDORES
// ══════════════════════════════════════════════

function enviarNotificacionesDeuda() {
    // Aquí podrías filtrar a los socios con deuda si quisieras una lógica real,
    // pero por ahora cumplimos con la acción del botón.
    alert("🔔 Notificaciones enviadas correctamente a los alumnos con deuda.");
}

function verComprobanteDesdeModal(metodo) {
    const s = socioActual || (typeof sociosDB !== 'undefined' ? sociosDB.find(x => x.dni === usuarioActual.dni) : null);
    const nombre = s ? s.nombre : (usuarioActual.nombre || "Socio");
    
    // Si la deuda ya es 0 (porque el proceso de registro ya ocurrió), 
    // intentamos usar totalCobro o buscar el último pago en el historial.
    let monto = (s && s.deuda > 0) ? s.deuda : (typeof totalCobro !== 'undefined' && totalCobro > 0 ? totalCobro : 0);
    
    if (monto === 0 && typeof historialPagosCliente !== 'undefined') {
        const historialPropio = historialPagosCliente.filter(p => p.dni === (s ? s.dni : usuarioActual.dni));
        if (historialPropio.length > 0) {
            monto = historialPropio[historialPropio.length - 1].monto;
        }
    }

    if (typeof generarRecibo === 'function') {
        generarRecibo(nombre, monto, metodo);
        window.reciboPendienteDeMostrar = false; // Reset flag to avoid "Volver" loop
        closeModal();
        abrirM('modal-recibo');
    } else {
        const num = 'REC-' + Date.now().toString().slice(-6);
        const fecha = new Date().toLocaleString('es-AR');
        
        const reciboContenido = document.getElementById('recibo-contenido');
        if (reciboContenido) {
            reciboContenido.innerHTML = `
                <div class="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-3 mb-1">
                    <span>SquatGym SA</span>
                    <span>${fecha}</span>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between text-xs font-black">
                        <span class="text-slate-400">N° Comprobante</span>
                        <span class="text-orange-400">${num}</span>
                    </div>
                    <div class="flex justify-between text-xs font-black">
                        <span class="text-slate-400">Socio</span>
                        <span class="text-white">${nombre}</span>
                    </div>
                    <div class="flex justify-between text-xs font-black">
                        <span class="text-slate-400">Concepto</span>
                        <span class="text-white">Cuota Mensual</span>
                    </div>
                    <div class="flex justify-between text-xs font-black">
                        <span class="text-slate-400">Método de Pago</span>
                        <span class="text-white">${metodo}</span>
                    </div>
                    <div class="border-t border-slate-700 pt-3 flex justify-between font-black">
                        <span class="text-slate-300">Total Abonado</span>
                        <span class="text-2xl text-green-400">$${monto.toLocaleString()}</span>
                    </div>
                </div>
                <div class="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p class="text-[9px] font-black text-green-400 uppercase tracking-widest">✔ Pago Acreditado</p>
                </div>
                <p class="text-[8px] text-slate-600 text-center uppercase tracking-widest">Este comprobante es válido como recibo de pago</p>
            `;
        }
        window.reciboPendienteDeMostrar = false; // Reset flag to avoid "Volver" loop
        closeModal();
        abrirM('modal-recibo');
    }
}
