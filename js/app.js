async function cargarPantallas() {
    const pantallas = [
        "inicio",
        "adm-membresia",
        "adm-monitor",
        "adm-planes",
        "alu-pago",
        "alu-historial",
        "alu-notificaciones",
        "adm-inventario",
        "adm-kiosco"
    ];

    const contenedor = document.getElementById("contenedor-pantallas");

    for (const pantalla of pantallas) {
        const respuesta = await fetch(`pantallas/${pantalla}.html`);
        const html = await respuesta.text();
        contenedor.innerHTML += html;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarPantallas();
});




function irQR() { irAPagoReal('qr'); }
function irTransfer() { alert('Información bancaria copiada.'); }
function irAPagoReal(type) { cerrarM(); abrirM(type === 'qr' ? 'modal-mp-qr' : 'modal-bank-transfer'); }



function removeItemM(i) {
    tAluK -= itemsCAlu[i].p;
    itemsCAlu.splice(i, 1);
    updateMarketCart();
}


function filtrarCatalogo() {
    const texto = document.getElementById('buscador-catalogo').value;
    renderMarketCatalog(texto);
}

function calcularVuelto() {
    const recibido = parseFloat(document.getElementById("input-efectivo").value || 0);

    const vuelto = recibido - totalCobro;

    document.getElementById("vuelto-texto").innerText =
        "Vuelto: $" + Math.max(0, vuelto);
}

function cerrarFlujoPago() {

    // volver a estado inicial
    const cont = document.getElementById("pago-contenido");
    const opciones = document.getElementById("pago-opciones");

    if (cont) cont.classList.add("hidden");
    if (opciones) opciones.classList.remove("hidden");

    // limpiar contenido
    if (cont) cont.innerHTML = "";
}

function pagoCorrecto() {

    console.log("Contexto:", currentContext);

    if (currentContext === 'kiosco') {

        const ord = "#OR-" + Math.floor(1000 + Math.random() * 9000);

        document.getElementById('cod-retiro-cliente').innerText = ord;

        cerrarFlujoPago();
        abrirM('modal-retiro-cliente');

    } else {

        alert("Pago de cuota registrado ✔");

        cerrarFlujoPago();
    }
}


function updateOrderCount() { const count = document.getElementById('staff-orders-queue').querySelectorAll('.glass-card').length; document.getElementById('kiosco-count-inicio').innerText = count; }

function searchSocioStaff() { document.getElementById('staff-socio-result').classList.remove('hidden'); }
function irTransfer() {
    cerrarM();
    abrirM('modal-transferencia');
}

function copiarAlias() {
    navigator.clipboard.writeText("squat.gym.fit");
    alert("Alias copiado");
}



function selectRol(rol) {

    rRol = rol;

    const staff = document.getElementById("btn-staff");
    const client = document.getElementById("btn-client");

    // reset
    staff.classList.remove("bg-orange-500", "text-white");
    client.classList.remove("bg-orange-500", "text-white");

    // activar seleccionado
    if (rol === "admin") {
        staff.classList.add("bg-orange-500", "text-white");
    } else {
        client.classList.add("bg-orange-500", "text-white");
    }
}

function confirmarTransferencia() {

    const input = document.getElementById("input-comprobante");

    //  DEBUG
    console.log("Input encontrado:", input);

    if (!input) {
        alert("Error interno: no se encontró el campo");
        return;
    }

    const comp = input.value.trim();

    if (comp === "") {
        alert("Ingresá el número de comprobante");
        return;
    }

    //  FORZAMOS flujo correcto
    console.log("Contexto actual:", currentContext);

    pagoCorrecto();
}

// ══════════════════════════════════════════════
// PUNTO 1 — RECIBO ELECTRÓNICO
// ══════════════════════════════════════════════
let reciboActual = {};

function generarRecibo(socio, monto, metodo) {
    const num = 'REC-' + Date.now().toString().slice(-6);
    const fecha = new Date().toLocaleString('es-AR');
    reciboActual = { num, socio, monto, metodo, fecha };

    document.getElementById('recibo-contenido').innerHTML = `
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
                  <span class="text-white">${socio}</span>
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
    window.reciboPendienteDeMostrar = true;
}

function imprimirRecibo() {
    window.print();
}

// ══════════════════════════════════════════════
// PUNTO 2 — ALERTAS DE VENCIMIENTO Y DEUDA
// ══════════════════════════════════════════════
const alertasVencimiento = [
    { nombre: "Rodrigo Sosa", dni: "55443322", dias: -3, deuda: 23000 },
    { nombre: "Valentino Perez", dni: "12345678", dias: -10, deuda: 31500 },
    { nombre: "Matías Alvarez", dni: "77889900", dias: 2, deuda: 10000 },
    { nombre: "Juan Romero", dni: "33221100", dias: 5, deuda: 12500 },
    { nombre: "Florencia Medina", dni: "66778899", dias: -20, deuda: 27000 },
    { nombre: "Lucía Fernández", dni: "11223344", dias: -17, deuda: 18500 },
];

function renderizarAlertasStaff() {
    const panel = document.getElementById('panel-alertas-staff');
    if (!panel) return;

    const total = alertasVencimiento.length;
    const bloqueadosList = alertasVencimiento.filter(a => a.dias <= -15);
    const vencidosList = alertasVencimiento.filter(a => a.dias < 0 && a.dias > -15);
    const porVencerList = alertasVencimiento.filter(a => a.dias >= 0);

    let html = `
          <!-- Encabezado Resumen -->
          <div class="flex items-center gap-2 mb-6">
              <div class="flex gap-2 w-full flex-wrap">
                  <span class="px-2.5 py-1 bg-slate-800 text-slate-300 text-[9px] font-black rounded-md border border-slate-700 uppercase tracking-widest">${total} activas</span>
                  <span class="px-2.5 py-1 bg-red-500/20 text-red-400 text-[9px] font-black rounded-md border border-red-500/30 uppercase tracking-widest">${bloqueadosList.length} bloqueados</span>
                  <span class="px-2.5 py-1 bg-orange-500/20 text-orange-400 text-[9px] font-black rounded-md border border-orange-500/30 uppercase tracking-widest">${vencidosList.length} en mora</span>
                  <span class="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 text-[9px] font-black rounded-md border border-yellow-500/30 uppercase tracking-widest">${porVencerList.length} por vencer</span>
              </div>
          </div>
      `;

    // Grupo 1: Acceso Bloqueado
    if (bloqueadosList.length > 0) {
        html += `<div class="mb-6">
              <p class="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 border-b border-red-900/50 pb-1">Acceso Bloqueado</p>
              <div class="space-y-3">`;

        html += bloqueadosList.map(a => `
              <div class="glass-card p-4 flex justify-between items-center" style="border-left: 4px solid #ef4444; background: rgba(239,68,68,0.08);">
                  <div class="flex flex-col">
                      <span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-black rounded border border-red-500/30 w-max mb-1.5">ACCESO BLOQUEADO</span>
                      <p class="text-sm font-black text-white">${a.nombre}</p>
                      <p class="text-[10px] text-slate-400 mt-0.5">DNI ${a.dni} · Mora: ${Math.abs(a.dias)} días</p>
                  </div>
                  <div class="flex items-center gap-5">
                      <p class="text-2xl font-black text-red-500">$${a.deuda.toLocaleString()}</p>
                      <div class="flex flex-col gap-1.5">
                          <button onclick="verPerfilSocio('${a.nombre}')" class="btn-ui px-5 py-2 text-[9px] font-black italic uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-md">Ver Perfil</button>
                      </div>
                  </div>
              </div>`).join('');

        html += `</div></div>`;
    }

    // Grupo 2: En Mora (Vencidos pero no bloqueados)
    if (vencidosList.length > 0) {
        html += `<div class="mb-6">
              <p class="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 border-b border-orange-900/50 pb-1">En Mora (Período de Gracia)</p>
              <div class="space-y-3">`;

        html += vencidosList.map(a => `
              <div class="glass-card p-4 flex justify-between items-center" style="border-left: 4px solid #f97316; background: rgba(249,115,22,0.08);">
                  <div class="flex flex-col">
                      <span class="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-black rounded border border-orange-500/30 w-max mb-1.5">VENCIDA HACE ${Math.abs(a.dias)}d</span>
                      <p class="text-sm font-black text-white">${a.nombre}</p>
                      <p class="text-[10px] text-slate-400 mt-0.5">DNI ${a.dni}</p>
                  </div>
                  <div class="flex items-center gap-5">
                      <p class="text-2xl font-black text-orange-500">$${a.deuda.toLocaleString()}</p>
                      <div class="flex flex-col gap-1.5">
                          <button onclick="verPerfilSocio('${a.nombre}')" class="btn-ui px-5 py-2 text-[9px] font-black italic uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-md">Ver Perfil</button>
                      </div>
                  </div>
              </div>`).join('');

        html += `</div></div>`;
    }

    // Grupo 3: Próximos a Vencer
    if (porVencerList.length > 0) {
        html += `<div>
              <p class="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-3 border-b border-yellow-900/50 pb-1">Próximos a Vencer</p>
              <div class="space-y-3">`;

        html += porVencerList.map(a => {
            const badgeText = a.dias === 0 ? "VENCE HOY" : `VENCE EN ${a.dias}d`;

            return `
              <div class="glass-card p-4 flex justify-between items-center" style="border-left: 4px solid #eab308; background: rgba(234,179,8,0.06);">
                  <div class="flex flex-col">
                      <span class="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] font-black rounded border border-yellow-500/30 w-max mb-1.5">${badgeText}</span>
                      <p class="text-sm font-black text-white">${a.nombre}</p>
                      <p class="text-[10px] text-slate-400 mt-0.5">DNI ${a.dni}</p>
                  </div>
                  <div class="flex items-center gap-5">
                      <p class="text-2xl font-black text-yellow-500">$${a.deuda.toLocaleString()}</p>
                      <div class="flex flex-col gap-1.5">
                          <button onclick="verPerfilSocio('${a.nombre}')" class="btn-ui px-5 py-2 text-[9px] font-black italic uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-md">Ver Perfil</button>
                      </div>
                  </div>
              </div>`;
        }).join('');

        html += `</div></div>`;
    }

    panel.innerHTML = html;
}

function renderizarAlertaCliente() {
    // Cuota Mayo pendiente → simula deuda activa para Valentino
    const bannerAlerta = document.getElementById('banner-alerta-cliente');
    const bannerRestr = document.getElementById('banner-restriccion-cliente');
    if (!bannerAlerta || !bannerRestr) return;

    // Alerta de vencimiento próximo
    bannerAlerta.innerHTML = `
          <div class="glass-card p-4 border-l-4 border-yellow-500 bg-yellow-500/5 flex items-center gap-4">
              <i class="fas fa-exclamation-circle text-yellow-400 text-xl flex-shrink-0"></i>
              <div>
                  <p class="text-xs font-black text-yellow-300 uppercase">Cuota Mayo vence el 10/05/2025</p>
                  <p class="text-[9px] text-slate-400">Evitá restricciones abonando antes del vencimiento.</p>
              </div>
          </div>`;

    // Restricción de ingreso por deuda vencida
    bannerRestr.innerHTML = `
          <div class="glass-card p-4 border-l-4 border-red-600 bg-red-500/5 flex items-center gap-4">
              <i class="fas fa-ban text-red-500 text-xl flex-shrink-0"></i>
              <div>
                  <p class="text-xs font-black text-red-400 uppercase">Acceso Restringido</p>
                  <p class="text-[9px] text-slate-400">Tenés cuotas impagas. Regularizá tu situación para acceder a las instalaciones.</p>
              </div>
          </div>`;
}

// ══════════════════════════════════════════════
// PUNTO 3 — RESTRICCIÓN DE INGRESO (staff busca socio)
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// PUNTO 4 — PRORRATEO
// ══════════════════════════════════════════════
function calcularProrrateo() {
    const cuota = parseFloat(document.getElementById('pro-cuota').value) || 0;
    const fechaV = document.getElementById('pro-fecha').value;
    if (!cuota || !fechaV) return;

    const fecha = new Date(fechaV);
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const diasMes = new Date(año, mes + 1, 0).getDate();
    const diaAlta = fecha.getDate();
    const diasCobrar = diasMes - diaAlta + 1;
    const valorDia = cuota / diasMes;
    const total = Math.round(valorDia * diasCobrar);

    document.getElementById('pro-dias-mes').innerText = diasMes;
    document.getElementById('pro-dias-cobrar').innerText = diasCobrar;
    document.getElementById('pro-valor-dia').innerText = '$' + valorDia.toFixed(2);
    document.getElementById('pro-total').innerText = '$' + total.toLocaleString();
    document.getElementById('pro-resultado').classList.remove('hidden');
}

function toggleProrrateo() {
    const panel = document.getElementById('panel-prorrateo');
    const icon = document.getElementById('icon-toggle-pro');
    const btn = document.getElementById('btn-toggle-pro');
    const oculto = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    icon.className = oculto ? 'fas fa-chevron-up mr-1' : 'fas fa-chevron-down mr-1';
    btn.innerHTML = oculto
        ? '<i class="fas fa-chevron-up mr-1" id="icon-toggle-pro"></i>Cerrar'
        : '<i class="fas fa-chevron-down mr-1" id="icon-toggle-pro"></i>Calcular';
}

function cobrarConProrrateo() {
    const totalEl = document.getElementById('pro-total');
    if (!totalEl || !totalEl.innerText || totalEl.innerText === '') {
        alert('Calculá el monto primero ingresando la cuota y la fecha de alta.');
        return;
    }
    // Usar el monto prorrateado como deuda del socio actual
    const montoStr = totalEl.innerText.replace('$', '').replace('.', '').replace(',', '.');
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) return;

    // Si hay socio activo lo usamos, sino abrimos el modal igualmente
    if (!socioActual) {
        socioActual = { nombre: 'Nuevo Socio', deuda: monto };
    } else {
        socioActual.deuda = monto;
    }
    totalCobro = monto;
    abrirM('modal-pago-selector', 'cuota');
}

// ══════════════════════════════════════════════
// HOOK: registrarPagoExitoso → genera recibo
// ══════════════════════════════════════════════
const _registrarPagoExitosoOrig = registrarPagoExitoso;
registrarPagoExitoso = function (metodo) {
    const nombre = socioActual ? socioActual.nombre : 'Socio';
    const monto = socioActual ? socioActual.deuda : totalCobro;
    _registrarPagoExitosoOrig(metodo);
    generarRecibo(nombre, monto, metodo);

    // Actualizar historial del alumno
    const cuotaPendiente = historialPagosCliente.find(p => p.estado === 'Pendiente');
    if (cuotaPendiente) {
        cuotaPendiente.id = reciboActual.num || 'REC-' + Date.now().toString().slice(-6);
        cuotaPendiente.fecha = new Date().toISOString().split('T')[0];
        cuotaPendiente.metodo = metodo;
        cuotaPendiente.estado = 'Pagado';

        // Actualizar KPIs del historial
        const kpiTotal = document.getElementById('hist-kpi-total');
        if (kpiTotal) {
            const sum = historialPagosCliente.filter(p => p.estado === 'Pagado').reduce((acc, p) => acc + p.monto, 0);
            kpiTotal.innerText = '$' + sum.toLocaleString();
        }
        const kpiPagas = document.getElementById('hist-kpi-pagas');
        if (kpiPagas) {
            kpiPagas.innerText = historialPagosCliente.filter(p => p.estado === 'Pagado').length;
        }
        const kpiPend = document.getElementById('hist-kpi-pendientes');
        if (kpiPend) {
            const pendientesCount = historialPagosCliente.filter(p => p.estado === 'Pendiente').length;
            kpiPend.innerText = pendientesCount;
            if (pendientesCount === 0) {
                kpiPend.classList.remove('text-red-400');
                kpiPend.classList.add('text-white');
            }
        }

        if (typeof renderHistorial === 'function') {
            renderHistorial();
        }

        // Actualizar Notificaciones del Alumno
        if (typeof alertasCliente !== 'undefined') {
            // Eliminar notificaciones de vencimiento y restricción
            alertasCliente = alertasCliente.filter(a => a.tipo !== 'vencimiento');

            const fechaHoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            // Agregar nueva notificación de pago
            alertasCliente.unshift({
                id: Date.now(), tipo: 'informacion', icono: 'fas fa-check-circle', color: '#4ade80',
                borderColor: '#22c55e', bgColor: 'rgba(34,197,94,0.05)',
                titulo: 'Pago de Mayo Acreditado',
                desc: `Tu pago de $${monto.toLocaleString()} fue acreditado correctamente el ${fechaHoy} mediante ${metodo}.`,
                fecha: 'Recién', leida: false,
                accion: { label: 'Ver Recibo', fn: `verComprobanteHistorial('${cuotaPendiente.id}')` }
            });

            if (typeof renderNotificaciones === 'function') {
                renderNotificaciones();
                // Actualizar contador de notificaciones si existe en la UI
                const countBadge = document.getElementById('noti-badge-count');
                if (countBadge) {
                    const noLeidas = alertasCliente.filter(a => !a.leida).length;
                    countBadge.innerText = noLeidas;
                    countBadge.style.display = noLeidas > 0 ? 'flex' : 'none';
                }
            }
        }
    }
};


// ══════════════════════════════════════════════
// KIOSCO STAFF — CAJA Y VENTAS
// ══════════════════════════════════════════════
let staffCartItems = [];
let staffMetodoSeleccionado = 'Efectivo';
let staffVentasTurno = [];
let staffTicketNum = 1;
let staffSocioKiosco = null;

const pDBKioscoStaff = [
    { n: "Agua 1.5L", p: 1000, i: "https://cdn-icons-png.flaticon.com/512/3100/3100566.png", cat: "Bebidas", stock: 24 },
    { n: "Lata Energ.", p: 2500, i: "https://cdn-icons-png.flaticon.com/512/2443/2443653.png", cat: "Bebidas", stock: 12 },
    { n: "Gatorade Blue", p: 1400, i: "https://cdn-icons-png.flaticon.com/512/3100/3100551.png", cat: "Bebidas", stock: 8 },
    { n: "Proteína Whey", p: 5500, i: "https://cdn-icons-png.flaticon.com/512/3050/3050162.png", cat: "Suplementos", stock: 5 },
    { n: "Creatina Mon.", p: 4800, i: "https://cdn-icons-png.flaticon.com/512/3050/3050186.png", cat: "Suplementos", stock: 3 },
    { n: "Barra Proteica", p: 1200, i: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png", cat: "Snacks", stock: 18 },
    { n: "Banana", p: 800, i: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png", cat: "Snacks", stock: 15 },
    { n: "Mix Frutos", p: 2000, i: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png", cat: "Snacks", stock: 10 },
];

function renderCatalogoStaff(filtroTexto = '', filtrocat = 'todos') {
    const g = document.getElementById('staff-catalog-grid');
    if (!g) return;
    const lista = pDBKioscoStaff.filter(p =>
        p.n.toLowerCase().includes(filtroTexto.toLowerCase()) &&
        (filtrocat === 'todos' || p.cat === filtrocat)
    );
    g.innerHTML = lista.map(p => {
        const stockColor = p.stock <= 3 ? 'text-red-400' : p.stock <= 8 ? 'text-yellow-400' : 'text-green-400';
        return `
          <div class="k-item" onclick="addStaffKioscoItem('${p.n}', ${p.p})">
              <div class="k-img" style="background-image: url('${p.i}')"></div>
              <p class="font-black text-[8px] uppercase text-white leading-tight">${p.n}</p>
              <span class="text-orange-500 font-black text-[10px]">$${p.p.toLocaleString()}</span>
              <p class="text-[7px] ${stockColor} font-black">Stock: ${p.stock}</p>
          </div>`;
    }).join('');
}

function filtrarCatalogoStaff() {
    const txt = document.getElementById('staff-kiosco-search')?.value || '';
    const cat = document.getElementById('staff-kiosco-cat')?.value || 'todos';
    renderCatalogoStaff(txt, cat);
}

function addStaffKioscoItem(nombre, precio) {
    staffCartItems.push({ n: nombre, p: precio });
    recalcStaffCart();
}

function recalcStaffCart() {
    const body = document.getElementById('staff-cart-body');
    const descPct = parseFloat(document.getElementById('staff-desc-pct')?.value || 0);

    if (staffCartItems.length === 0) {
        body.innerHTML = `<p class="text-center text-slate-600 text-xs py-8">Sin productos agregados</p>`;
        document.getElementById('staff-subtotal-k').innerText = '$0';
        document.getElementById('staff-total-k').innerText = '$0';
        document.getElementById('staff-desc-monto').innerText = '-$0';
        return;
    }

    // Agrupar
    const agrupado = {};
    staffCartItems.forEach(it => {
        if (!agrupado[it.n]) agrupado[it.n] = { n: it.n, p: it.p, qty: 0 };
        agrupado[it.n].qty++;
    });

    body.innerHTML = Object.values(agrupado).map(it => `
          <div class="flex justify-between items-center py-2 px-1 border-b border-slate-800/60">
              <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black text-white truncate">${it.n}</p>
                  <p class="text-[9px] text-slate-500">$${(it.p * it.qty).toLocaleString()}</p>
              </div>
              <div class="flex items-center gap-1.5 ml-2">
                  <button onclick="decrementStaffItem('${it.n}')"
                      style="background:#c2a8a8;color:#222;width:22px;height:22px;border-radius:6px;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;">−</button>
                  <span class="text-xs font-black text-white w-5 text-center">${it.qty}</span>
                  <button onclick="addStaffKioscoItem('${it.n}', ${it.p})"
                      style="background:#a8c2aa;color:#222;width:22px;height:22px;border-radius:6px;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;">+</button>
              </div>
          </div>
      `).join('');

    const subtotal = staffCartItems.reduce((s, it) => s + it.p, 0);
    const descMonto = Math.round(subtotal * descPct / 100);
    const total = subtotal - descMonto;

    document.getElementById('staff-subtotal-k').innerText = '$' + subtotal.toLocaleString();
    document.getElementById('staff-desc-monto').innerText = '-$' + descMonto.toLocaleString();
    document.getElementById('staff-total-k').innerText = '$' + total.toLocaleString();
}

function decrementStaffItem(nombre) {
    const idx = staffCartItems.findLastIndex ? staffCartItems.findLastIndex(it => it.n === nombre)
        : staffCartItems.length - 1 - [...staffCartItems].reverse().findIndex(it => it.n === nombre);
    if (idx >= 0) staffCartItems.splice(idx, 1);
    recalcStaffCart();
}

function selMetodoStaff(metodo) {
    staffMetodoSeleccionado = metodo;
    document.querySelectorAll('.smk-btn').forEach(b => {
        b.classList.remove('border-orange-500', 'text-orange-400', 'border-green-500', 'text-green-400', 'border-blue-500', 'text-blue-400', 'border-purple-500', 'text-purple-400');
    });
    const colores = { Efectivo: ['border-green-500', 'text-green-400'], QR: ['border-blue-500', 'text-blue-400'], Transferencia: ['border-purple-500', 'text-purple-400'], Tarjeta: ['border-orange-500', 'text-orange-400'] };
    const idMap = { Efectivo: 'smk-efectivo', QR: 'smk-qr', Transferencia: 'smk-transferencia', Tarjeta: 'smk-tarjeta' };
    const btn = document.getElementById(idMap[metodo]);
    if (btn && colores[metodo]) btn.classList.add(...colores[metodo]);
}

function cobrarTicketStaff() {
    if (staffCartItems.length === 0) { alert('Agregá productos al ticket primero.'); return; }
    const descPct = parseFloat(document.getElementById('staff-desc-pct')?.value || 0);
    const subtotal = staffCartItems.reduce((s, it) => s + it.p, 0);
    const descMonto = Math.round(subtotal * descPct / 100);
    const total = subtotal - descMonto;
    const ticketId = '#TICK-' + String(staffTicketNum).padStart(4, '0');
    staffTicketNum++;

    // Registrar venta en historial
    const venta = {
        ticket: ticketId,
        items: [...staffCartItems],
        total,
        metodo: staffMetodoSeleccionado,
        socio: staffSocioKiosco ? staffSocioKiosco.nombre : '—',
        hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };
    staffVentasTurno.push(venta);

    // Actualizar contadores inicio
    const recEl = document.getElementById('kiosco-recaudado-hoy');
    const cntEl = document.getElementById('kiosco-ventas-count');
    if (recEl) recEl.innerText = '$' + staffVentasTurno.reduce((s, v) => s + v.total, 0).toLocaleString();
    if (cntEl) cntEl.innerText = staffVentasTurno.length;

    // Agregar también a cajaResumen global
    const metodoKey = { Efectivo: 'efectivo', QR: 'qr', Transferencia: 'tarjeta', Tarjeta: 'tarjeta' }[staffMetodoSeleccionado] || 'efectivo';
    if (cajaResumen[metodoKey] !== undefined) cajaResumen[metodoKey] += total;
    transacciones.push({ tipo: staffMetodoSeleccionado, monto: total, cliente: venta.socio !== '—' ? venta.socio : 'Kiosco' });

    renderHistorialVentas();
    generarReciboKiosco(ticketId, venta);
    limpiarTicketStaff();

    document.getElementById('staff-ticket-num').innerText = '#TICK-' + String(staffTicketNum).padStart(4, '0');
}

function renderHistorialVentas() {
    const el = document.getElementById('staff-ventas-historial');
    if (!el) return;
    if (staffVentasTurno.length === 0) {
        el.innerHTML = `<p class="text-center text-slate-600 text-xs py-6">Sin ventas registradas aún</p>`;
        return;
    }
    el.innerHTML = [...staffVentasTurno].reverse().map(v => {
        const metodoColor = { Efectivo: 'text-green-400', QR: 'text-blue-400', Transferencia: 'text-purple-400', Tarjeta: 'text-orange-400' }[v.metodo] || 'text-white';
        const resumen = Object.values(v.items.reduce((a, it) => { a[it.n] = (a[it.n] || { n: it.n, q: 0 }); a[it.n].q++; return a; }, {})).map(x => `${x.n}×${x.q}`).join(', ');
        return `
          <div class="flex justify-between items-center px-4 py-3 hover:bg-orange-500/5 transition">
              <div class="flex items-center gap-3">
                  <span class="text-[9px] font-black text-orange-400">${v.ticket}</span>
                  <div>
                      <p class="text-[10px] font-black text-white">${resumen}</p>
                      <p class="text-[8px] text-slate-500">${v.hora} · Socio: ${v.socio}</p>
                  </div>
              </div>
              <div class="text-right">
                  <p class="text-xs font-black text-white">$${v.total.toLocaleString()}</p>
                  <p class="text-[8px] font-black ${metodoColor}">${v.metodo}</p>
              </div>
          </div>`;
    }).join('');
}

function limpiarTicketStaff() {
    staffCartItems = [];
    staffSocioKiosco = null;
    const dniEl = document.getElementById('staff-kiosco-dni');
    if (dniEl) dniEl.value = '';
    document.getElementById('staff-socio-kiosco-info')?.classList.add('hidden');
    const descEl = document.getElementById('staff-desc-pct');
    if (descEl) descEl.value = '0';
    document.querySelectorAll('.smk-btn').forEach(b => {
        b.classList.remove('border-orange-500', 'text-orange-400', 'border-green-500', 'text-green-400', 'border-blue-500', 'text-blue-400', 'border-purple-500', 'text-purple-400');
    });
    staffMetodoSeleccionado = 'Efectivo';
    recalcStaffCart();
}

function identificarSocioKiosco() {
    const dni = document.getElementById('staff-kiosco-dni')?.value.trim();
    const socio = sociosDB.find(s => s.dni === dni);
    const infoEl = document.getElementById('staff-socio-kiosco-info');
    if (!socio) { alert('Socio no encontrado'); return; }
    staffSocioKiosco = socio;
    document.getElementById('staff-kiosco-socio-nombre').innerText = socio.nombre;
    document.getElementById('staff-kiosco-socio-pts').innerText = '★ SquatPoints disponibles';
    infoEl?.classList.remove('hidden');
}

function limpiarSocioKiosco() {
    staffSocioKiosco = null;
    document.getElementById('staff-socio-kiosco-info')?.classList.add('hidden');
    const dniEl = document.getElementById('staff-kiosco-dni');
    if (dniEl) dniEl.value = '';
}

function generarReciboKiosco(ticketId, venta) {
    const fecha = new Date().toLocaleString('es-AR');
    const itemsHTML = Object.values(venta.items.reduce((a, it) => { a[it.n] = (a[it.n] || { n: it.n, p: it.p, q: 0 }); a[it.n].q++; return a; }, {}))
        .map(x => `<div class="flex justify-between"><span>${x.n} ×${x.q}</span><span class="font-black">$${(x.p * x.q).toLocaleString()}</span></div>`).join('');
    document.getElementById('recibo-contenido').innerHTML = `
          <div class="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-3 mb-1">
              <span>SquatGym — Kiosco</span><span>${fecha}</span>
          </div>
          <div class="space-y-3">
              <div class="flex justify-between text-xs font-black"><span class="text-slate-400">Ticket</span><span class="text-orange-400">${ticketId}</span></div>
              <div class="flex justify-between text-xs font-black"><span class="text-slate-400">Socio</span><span class="text-white">${venta.socio}</span></div>
              <div class="text-xs space-y-1 bg-slate-900 rounded-xl p-3 font-black">${itemsHTML}</div>
              <div class="flex justify-between text-xs font-black"><span class="text-slate-400">Método</span><span class="text-white">${venta.metodo}</span></div>
              <div class="border-t border-slate-700 pt-3 flex justify-between font-black"><span class="text-slate-300">Total</span><span class="text-2xl text-green-400">$${venta.total.toLocaleString()}</span></div>
          </div>
          <div class="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p class="text-[9px] font-black text-green-400 uppercase tracking-widest">✔ Venta Registrada</p>
          </div>`;
    cerrarM();
    setTimeout(() => abrirM('modal-recibo'), 150);
}

function abrirCierreTurno() { abrirM('modal-cierre-turno'); }

function generarCierreTurnoContenido() {
    const el = document.getElementById('cierre-turno-contenido');
    if (!el) return;
    const metodos = { Efectivo: 0, QR: 0, Transferencia: 0, Tarjeta: 0 };
    staffVentasTurno.forEach(v => { if (metodos[v.metodo] !== undefined) metodos[v.metodo] += v.total; });
    const total = Object.values(metodos).reduce((s, v) => s + v, 0);
    el.innerHTML = `
          <div class="space-y-2">
              ${Object.entries(metodos).map(([m, v]) => `
              <div class="flex justify-between bg-slate-900 p-3 rounded-xl">
                  <span class="font-black text-slate-400">${m}</span>
                  <span class="font-black text-white">$${v.toLocaleString()}</span>
              </div>`).join('')}
              <div class="flex justify-between border-t border-orange-500 pt-3 mt-2">
                  <span class="font-black text-orange-400 uppercase">Total Turno</span>
                  <span class="font-black text-white text-lg">$${total.toLocaleString()}</span>
              </div>
              <p class="text-[8px] text-slate-600 text-center pt-2">Ventas registradas: ${staffVentasTurno.length}</p>
          </div>`;
}

function confirmarCierreTurno() {
    staffVentasTurno = [];
    renderHistorialVentas();
    const recEl = document.getElementById('kiosco-recaudado-hoy');
    const cntEl = document.getElementById('kiosco-ventas-count');
    if (recEl) recEl.innerText = '$0';
    if (cntEl) cntEl.innerText = '0';
    cerrarM();
    alert('Turno cerrado. Kiosco reseteado para el siguiente turno ✔');
}

function exportarVentasTurno() {
    if (staffVentasTurno.length === 0) { alert('Sin ventas para exportar.'); return; }
    const filas = staffVentasTurno.map(v =>
        `${v.ticket}\t${v.hora}\t${v.socio}\t${v.metodo}\t$${v.total.toLocaleString()}`
    ).join('\n');
    const txt = `Ticket\tHora\tSocio\tMétodo\tTotal\n${filas}`;
    const b = document.createElement('a');
    b.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
    b.download = 'ventas_turno.txt';
    b.click();
}

// Inicializar catálogo staff al navegar
const _navVOrig = navV;
navV = function (id) {
    _navVOrig(id);
    if (id === 'adm-kiosco') {
        renderCatalogoStaff();
        selMetodoStaff('Efectivo');
    }
    if (id === 'adm-kiosco') recalcStaffCart();
};

// Patch: abrir cierre turno rellena contenido
const _abrirMOrig = abrirM;
abrirM = function (id, ctx) {
    if (id === 'modal-cierre-turno') generarCierreTurnoContenido();
    _abrirMOrig(id, ctx);
};

function agregarProveedor() {
    const prod = document.getElementById('np-producto')?.value.trim();
    const prov = document.getElementById('np-proveedor')?.value.trim();
    const costo = parseFloat(document.getElementById('np-costo')?.value || 0);
    const precio = parseFloat(document.getElementById('np-precio')?.value || 0);
    const cat = document.getElementById('np-cat')?.value || 'Bebidas';
    const venc = document.getElementById('np-vencimiento')?.value || '2026-12-31';
    if (!prod || !prov || !costo || !precio) { alert('Completá todos los campos.'); return; }
    inventarioDB.push({ nombre: prod, proveedor: prov, costo, precio, estado: 'Pendiente', cat, vencimiento: venc });
    cerrarM();
    setTimeout(filtrarInventario, 100);
}


function registrarCobroManual() {
    const monto = parseFloat(document.getElementById('cobro-manual-monto')?.value || 0);
    const detalle = document.getElementById('cobro-manual-detalle')?.value.trim() || 'Venta kiosco';
    const dni = document.getElementById('cobro-manual-dni')?.value.trim() || '';
    if (!monto || monto <= 0) { alert('Ingresá un monto válido.'); return; }
    const socio = sociosDB.find(s => s.dni === dni);
    const ticketId = '#TICK-' + String(staffTicketNum).padStart(4, '0');
    staffTicketNum++;
    const venta = {
        ticket: ticketId,
        items: [{ n: detalle, p: monto }],
        total: monto,
        metodo: staffMetodoSeleccionado,
        socio: socio ? socio.nombre : (dni || '—'),
        hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };
    staffVentasTurno.push(venta);
    transacciones.push({ tipo: staffMetodoSeleccionado, monto: monto, cliente: venta.socio !== '—' ? venta.socio : 'Kiosco' });
    document.getElementById('cobro-manual-monto').value = '';
    document.getElementById('cobro-manual-detalle').value = '';
    document.getElementById('cobro-manual-dni').value = '';
    actualizarKPIsKiosco();
    renderHistorialVentas();
    alert('Cobro de ' + ticketId + ' registrado por ' + staffMetodoSeleccionado + ' ✔');
}

function actualizarKPIsKiosco() {
    const total = staffVentasTurno.reduce((s, v) => s + v.total, 0);
    const count = staffVentasTurno.length;
    const prom = count > 0 ? Math.round(total / count) : 0;
    const recEl = document.getElementById('kiosco-recaudado-hoy'); if (recEl) recEl.innerText = '$' + total.toLocaleString();
    const cntEl = document.getElementById('kiosco-ventas-count'); if (cntEl) cntEl.innerText = count;
    const promEl = document.getElementById('kiosco-ticket-prom'); if (promEl) promEl.innerText = '$' + prom.toLocaleString();
    const acumEl = document.getElementById('kiosco-total-acum'); if (acumEl) acumEl.innerText = '$' + total.toLocaleString();
    const desgEl = document.getElementById('kiosco-desglose');
    if (desgEl) {
        const metodos = { Efectivo: 0, QR: 0, Transferencia: 0, Tarjeta: 0 };
        staffVentasTurno.forEach(v => { if (metodos[v.metodo] !== undefined) metodos[v.metodo] += v.total; });
        const colores = { Efectivo: 'text-green-400', QR: 'text-blue-400', Transferencia: 'text-purple-400', Tarjeta: 'text-orange-400' };
        desgEl.innerHTML = Object.entries(metodos).map(function (e) {
            return '<div class="flex justify-between items-center"><span class="text-[10px] font-black text-slate-400">' + e[0] + '</span><span class="text-[10px] font-black ' + colores[e[0]] + '">$' + e[1].toLocaleString() + '</span></div>';
        }).join('');
    }
}

// ══════════════════════════════════════════════
// HISTORIAL DE PAGOS DEL CLIENTE (req. 3.1.24)
// ══════════════════════════════════════════════
const historialPagosCliente = [
    { id: 'REC-240001', fecha: '2025-10-05', concepto: 'Cuota Octubre 2025', metodo: 'QR', monto: 11000, estado: 'Pagado' },
    { id: 'REC-240002', fecha: '2025-10-18', concepto: 'Kiosco', metodo: 'Efectivo', monto: 3200, estado: 'Pagado' },
    { id: 'REC-240003', fecha: '2025-11-03', concepto: 'Cuota Noviembre 2025', metodo: 'Transferencia', monto: 11000, estado: 'Pagado' },
    { id: 'REC-240004', fecha: '2025-11-22', concepto: 'Kiosco', metodo: 'QR', monto: 1400, estado: 'Pagado' },
    { id: 'REC-240005', fecha: '2025-12-04', concepto: 'Cuota Diciembre 2025', metodo: 'QR', monto: 11500, estado: 'Pagado' },
    { id: 'REC-240006', fecha: '2026-01-07', concepto: 'Cuota Enero 2026', metodo: 'Tarjeta', monto: 12000, estado: 'Pagado' },
    { id: 'REC-240007', fecha: '2026-01-15', concepto: 'Kiosco', metodo: 'Efectivo', monto: 4800, estado: 'Pagado' },
    { id: 'REC-240008', fecha: '2026-02-05', concepto: 'Cuota Febrero 2026', metodo: 'QR', monto: 12000, estado: 'Pagado' },
    { id: 'REC-240009', fecha: '2026-03-06', concepto: 'Cuota Marzo 2026', metodo: 'Transferencia', monto: 12500, estado: 'Pagado' },
    { id: 'REC-240010', fecha: '2026-04-04', concepto: 'Cuota Abril 2026', metodo: 'QR', monto: 12500, estado: 'Pagado' },
    { id: 'REC-240011', fecha: '2026-04-14', concepto: 'Kiosco', metodo: 'Efectivo', monto: 1200, estado: 'Pagado' },
    { id: 'REC-PEND-1', fecha: '2026-05-01', concepto: 'Cuota Mayo 2026', metodo: '—', monto: 12500, estado: 'Pendiente' },
];

const metodoBadge = {
    'QR': { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    'Transferencia': { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', border: 'rgba(168,85,247,0.3)' },
    'Tarjeta': { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
    'Efectivo': { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    '—': { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
};

function renderHistorial() {
    const tipo = document.getElementById('hist-filter-tipo')?.value || 'todos';
    const metodo = document.getElementById('hist-filter-metodo')?.value || 'todos';
    const orden = document.getElementById('hist-filter-orden')?.value || 'fecha-desc';

    let lista = historialPagosCliente.filter(p => {
        const matchTipo = tipo === 'todos' || p.concepto.startsWith(tipo);
        const matchMetodo = metodo === 'todos' || p.metodo === metodo;
        const noEsKiosco = p.concepto !== 'Kiosco';
        return matchTipo && matchMetodo && noEsKiosco;
    });

    if (orden === 'fecha-desc') lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    if (orden === 'fecha-asc') lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    if (orden === 'monto-desc') lista.sort((a, b) => b.monto - a.monto);

    const tbody = document.getElementById('tabla-historial-body');
    if (!tbody) return;

    tbody.innerHTML = lista.map(p => {
        const pagado = p.estado === 'Pagado';
        const mb = metodoBadge[p.metodo] || metodoBadge['—'];
        const fechaFmt = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

        return `
          <tr class="hover:bg-orange-500/5 transition">
              <td class="p-4 font-black text-orange-400 text-[10px]">${p.id}</td>
              <td class="p-4 text-slate-400 text-[10px]">${fechaFmt}</td>
              <td class="p-4 text-white font-black text-[11px]">${p.concepto}</td>
              <td class="p-4">
                  <span style="padding:2px 10px;border-radius:9999px;font-size:8px;font-weight:900;text-transform:uppercase;
                      background:${mb.bg};color:${mb.color};border:1px solid ${mb.border};">
                      ${p.metodo}
                  </span>
              </td>
              <td class="p-4 font-black text-sm ${pagado ? 'text-white' : 'text-red-400'}">
                  $${p.monto.toLocaleString()}
              </td>
              <td class="p-4">
                  <span style="padding:2px 10px;border-radius:9999px;font-size:8px;font-weight:900;text-transform:uppercase;
                      background:${pagado ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};
                      color:${pagado ? '#4ade80' : '#f87171'};
                      border:1px solid ${pagado ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">
                      ${p.estado}
                  </span>
              </td>
              <td class="p-4 text-right">
                  ${pagado
                ? `<button onclick="verComprobanteHistorial('${p.id}')"
                          style="padding:4px 12px;border-radius:9999px;background:#1e293b;color:#94a3b8;font-size:8px;font-weight:900;text-transform:uppercase;border:1px solid #334155;cursor:pointer;">
                          <i class="fas fa-receipt"></i> Ver
                         </button>`
                : `<button onclick="abrirM('modal-pago-selector','cuota')"
                          style="padding:4px 12px;border-radius:9999px;background:#f97316;color:white;font-size:8px;font-weight:900;text-transform:uppercase;border:none;cursor:pointer;">
                          Pagar
                         </button>`
            }
              </td>
          </tr>`;
    }).join('');
}

function verComprobanteHistorial(id) {
    const p = historialPagosCliente.find(x => x.id === id);
    if (!p) return;
    const fechaFmt = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('recibo-contenido').innerHTML = `
          <div class="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-3 mb-1">
              <span>SquatGym SA</span><span>${fechaFmt}</span>
          </div>
          <div class="space-y-3">
              <div class="flex justify-between text-xs font-black">
                  <span class="text-slate-400">N° Comprobante</span>
                  <span class="text-orange-400">${p.id}</span>
              </div>
              <div class="flex justify-between text-xs font-black">
                  <span class="text-slate-400">Socio</span>
                  <span class="text-white">Valentino P. — #4922</span>
              </div>
              <div class="flex justify-between text-xs font-black">
                  <span class="text-slate-400">Concepto</span>
                  <span class="text-white">${p.concepto}</span>
              </div>
              <div class="flex justify-between text-xs font-black">
                  <span class="text-slate-400">Método</span>
                  <span class="text-white">${p.metodo}</span>
              </div>
              <div class="border-t border-slate-700 pt-3 flex justify-between font-black">
                  <span class="text-slate-300">Total Abonado</span>
                  <span class="text-2xl text-green-400">$${p.monto.toLocaleString()}</span>
              </div>
          </div>
          <div class="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p class="text-[9px] font-black text-green-400 uppercase tracking-widest">✔ Pago Acreditado</p>
          </div>
          <p class="text-[8px] text-slate-600 text-center uppercase tracking-widest">Comprobante válido como recibo de pago</p>`;
    abrirM('modal-recibo');
}

function exportarHistorial() {
    alert('Función de exportación disponible en la versión desktop del sistema.');
}

// ══════════════════════════════════════════════
// NOTIFICACIONES CLIENTE (req. 3.1.26)
// ══════════════════════════════════════════════
let filtroAlertaActivo = 'todas';

function renderNotificaciones() {
    const panel = document.getElementById('panel-notificaciones');
    if (!panel) return;

    let notificaciones = getNotificacionesData();

    // Aplicar filtro si no es 'todas'
    if (filtroAlertaActivo !== 'todas') {
        notificaciones = notificaciones.filter(a => a.tipo === filtroAlertaActivo);
    }

    if (notificaciones.length === 0) {
        panel.innerHTML = `
            <div class="glass-card p-10 text-center border-dashed border-2 border-slate-800">
                <i class="fas fa-bell-slash text-slate-700 text-4xl mb-4"></i>
                <p class="text-slate-500 font-black uppercase tracking-widest text-xs">No tienes notificaciones en esta categoría</p>
            </div>`;
        return;
    }

    panel.innerHTML = notificaciones.map(a => `
          <div class="glass-card p-5 border-l-4 transition-all"
              style="border-left-color:${a.borderColor};background:${a.bgColor};">
              <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style="background:${a.bgColor};border:1px solid ${a.borderColor};">
                      <i class="${a.icono}" style="color:${a.borderColor};font-size:1rem;"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start gap-2">
                          <p class="text-xs font-black text-white leading-snug">
                              ${a.titulo}
                          </p>
                          <span class="text-[9px] text-slate-500 font-black flex-shrink-0">${a.fecha}</span>
                      </div>
                      <p class="text-[10px] text-slate-400 mt-1 leading-relaxed normal-case">${a.desc}</p>
                      ${a.accion ? `
                      <button onclick="${a.accion.fn}"
                          style="margin-top:10px;padding:4px 14px;border-radius:9999px;background:#f97316;color:white;font-size:8px;font-weight:900;text-transform:uppercase;border:none;cursor:pointer;">
                          ${a.accion.label} →
                      </button>` : ''}
                  </div>
              </div>
          </div>
      `).join('');
}

function filtrarAlertas(tipo) {
    filtroAlertaActivo = tipo;
    document.querySelectorAll('.btn-alerta-tab').forEach(b => {
        b.classList.remove('btn-naranja');
        b.classList.add('bg-slate-700');
    });
    const activo = document.getElementById('btn-alerta-' + tipo);
    if (activo) {
        activo.classList.remove('bg-slate-700');
        activo.classList.add('btn-naranja');
    }
    renderNotificaciones();
}
