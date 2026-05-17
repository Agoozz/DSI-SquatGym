function buscarCliente() {
    const dni = document.getElementById("dni-input").value;
    let c;

    if (dni === "" || !clientes[dni]) {

        c = Object.values(clientes)[0];
    } else {
        c = clientes[dni];
    }

    document.getElementById("cliente-box").classList.remove("hidden");

    document.getElementById("cliente-nombre").innerText = c.nombre;
    document.getElementById("cliente-id").innerText = c.id;

    renderDeudas(c.deudas);
}

let deudasSeleccionadas = [];

function renderDeudas(deudas) {
    const cont = document.getElementById("lista-deudas");

    cont.innerHTML = deudas.map((d, i) => `
          <label class="flex justify-between items-center p-4 bg-slate-900 rounded-xl cursor-pointer hover:scale-[1.02] transition">

              <div class="flex gap-3 items-center">
                  <input type="checkbox" onchange="toggleDeuda(${i}, ${d.monto}, this)">
                  <span class="font-bold">${d.mes}</span>
              </div>

              <span class="text-orange-400 font-black">$${d.monto}</span>

          </label>
      `).join("");
}

let totalCobro = 0;

function toggleDeuda(i, monto, checkbox) {
    if (checkbox.checked) {
        totalCobro += monto;
    } else {
        totalCobro -= monto;
    }

    updateTotal();
}

function updateTotal() {
    const el = document.getElementById("total-cobro");

    el.innerText = "$" + totalCobro;

    el.classList.add("scale-110");
    setTimeout(() => el.classList.remove("scale-110"), 150);
}
function abrirTerminal() {
    if (totalCobro === 0) {
        alert("Seleccioná al menos una cuota");
        return;
    }

    abrirM('modal-pago-selector', 'cuota');
}
function filtrarSocios() {
    const busq = document.getElementById('search-socio')?.value.toLowerCase() || '';
    const estado = document.getElementById('filter-estado')?.value || 'todos';
    const clase = document.getElementById('filter-clase')?.value || 'todos';
    const orden = document.getElementById('filter-orden')?.value || 'nombre';

    // 1. Aplicar restricciones de vista por Rol
    const isEncargado = (rRol === 'encargado');
    
    // Ocultar herramientas de cobro para el Encargado
    const proSection = document.getElementById('section-prorrateo');
    const notSection = document.getElementById('section-notificar');
    const btnNuevoCobro = document.getElementById('btn-nuevo-cobro');

    if (proSection) proSection.style.display = isEncargado ? 'none' : 'block';
    if (notSection) notSection.style.display = isEncargado ? 'none' : 'flex';
    if (btnNuevoCobro) btnNuevoCobro.style.display = isEncargado ? 'none' : 'flex';

    // 2. Filtrar por sede si el usuario es Staff (Secretaria o Encargado)
    let lista = (rRol === 'admin')
        ? [...sociosDB]
        : sociosDB.filter(s => s.sede === (sedeActual || 'Sede Norte'));

    // 3. Filtramos por búsqueda y filtros
    lista = lista.filter(s => {
        const matchBusq = s.nombre.toLowerCase().includes(busq) || s.dni.includes(busq);
        const matchEstado = estado === 'todos' || s.estado.toLowerCase() === estado.toLowerCase();
        const matchClase = clase === 'todos' || s.clase.toLowerCase() === clase.toLowerCase();
        return matchBusq && matchEstado && matchClase;
    });

    // 4. Ordenamiento
    if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'monto') lista.sort((a, b) => b.deuda - a.deuda);
    if (orden === 'estado') lista.sort((a, b) => a.estado.localeCompare(b.estado));

    // 5. Dibujamos la tabla
    const tbody = document.getElementById('tabla-socios-body');
    if (!tbody) return;

    tbody.innerHTML = lista.map(s => {
        const isDeudor = s.deuda > 0;
        const vencimiento = isDeudor ? '10/04/2026' : '10/05/2026';
        
        return `
            <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                <td class="p-4">
                    <p class="text-white font-bold italic uppercase">${s.nombre}</p>
                    <p class="text-[9px] text-slate-500">DNI: ${s.dni}</p>
                </td>
                <td class="p-4 text-slate-400 text-xs">${s.dni}</td>
                <td class="p-4 text-slate-400 text-xs">${s.clase}</td>
                <td class="p-4 text-slate-400 text-xs font-mono">${vencimiento}</td>
                <td class="p-4 font-black ${isDeudor ? 'text-red-400' : 'text-slate-500'}">
                    ${isDeudor ? '$' + s.deuda.toLocaleString() : '—'}
                </td>
                <td class="p-4">
                    <span style="padding:2px 10px; border-radius:9999px; font-size:9px; font-weight:900; text-transform:uppercase;
                        background:${s.estado === 'Al día' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};
                        color:${s.estado === 'Al día' ? '#4ade80' : '#f87171'};
                        border:1px solid ${s.estado === 'Al día' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">
                        ${s.estado}
                    </span>
                </td>
                <td class="p-4 text-right">
                    ${!isDeudor ? '' : `
                    <button onclick="cobrarSocio('${s.dni}')" 
                            class="bg-slate-700 hover:bg-slate-600 text-white text-[10px] px-4 py-2 rounded-full transition font-black uppercase tracking-tighter">
                        ${isEncargado ? 'Ver Ficha' : 'Cobrar'}
                    </button>`}
                </td>
            </tr>
        `;
    }).join('');
}

let socioActual = null; // guarda el socio que se está cobrando

function cobrarSocio(dni) {
    const s = sociosDB.find(x => x.dni === dni);
    const box = document.getElementById('cliente-box');
    const isEncargado = (rRol === 'encargado');

    if (s && box) {
        socioActual = s; 
        document.getElementById('display-nombre').innerText = s.nombre;
        document.getElementById('display-id').innerText = s.dni || "#0000";

        const container = document.getElementById('lista-deudas');
        container.innerHTML = ""; 

        const panelAcciones = document.getElementById('panel-acciones-rapidas');
        
        // El encargado NUNCA ve el panel de cobro/acciones rápidas
        if (panelAcciones) panelAcciones.style.display = isEncargado ? 'none' : 'block';

        if (s.deuda > 0) {
            document.getElementById('display-total-cobro').innerText = '$' + s.deuda.toLocaleString();

            container.innerHTML += `
                <div class="flex justify-between items-center bg-slate-800/50 border border-slate-700 p-3 rounded italic mb-2">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" class="cuota-checkbox w-4 h-4 accent-orange-500" 
                               data-monto="${s.deuda}" data-mes="Abril 2026" checked onchange="actualizarTotalCobro()" style="display:none;">
                        <div>
                            <p class="text-white font-black text-sm">Abril 2026</p>
                            <p class="text-[9px] text-red-400 font-bold uppercase">Cuota Pendiente</p>
                        </div>
                    </div>
                    <span class="text-xl font-black text-white">$${s.deuda.toLocaleString()}</span>
                </div>`;

            if (!isEncargado) actualizarTotalCobro();
        } else {
            if (panelAcciones) panelAcciones.style.display = 'none';
            document.getElementById('display-total-cobro').innerText = '$0';

            container.innerHTML = `
                <div class="bg-green-500/10 border border-green-500/20 p-4 rounded text-center mb-4">
                    <p class="text-green-500 font-black text-xs uppercase tracking-widest">Socio al día</p>
                </div>
            `;
        }

        box.classList.remove('hidden');
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function actualizarTotalCobro() {
    const checkboxes = document.querySelectorAll('.cuota-checkbox:checked');
    let total = 0;

    // Suma el valor de cada checkbox que esté tildado
    checkboxes.forEach(cb => {
        total += parseFloat(cb.getAttribute('data-monto'));
    });

    // Lo dibuja en la pantalla
    const visor = document.getElementById('display-total-cobro');
    if (visor) {
        visor.innerText = '$' + total.toLocaleString();
    }
}

function cobrarPago() {
    abrirM('modal-pago-selector', 'cuota');
}

function verificarAccesoDNI() {
    const dni = document.getElementById('acceso-dni-input').value.trim();
    const s = sociosDB.find(x => x.dni === dni);
    if (!s) {
        document.getElementById('acceso-check-resultado').innerHTML =
            `<p style="font-size:10px;color:#94a3b8;padding:8px;">No se encontró ningún socio con ese DNI.</p>`;
        return;
    }
    verificarAccesoSocio(s.nombre, s.deuda);
}

function verificarAccesoSocio(nombre, deuda) {
    const s = sociosDB.find(x => x.nombre === nombre);
    if (!s) return;

    const bloqueado = s.deuda > 0;
    const msg = bloqueado
        ? `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:1rem;padding:1.2rem;display:flex;align-items:center;gap:1rem;">
                  <i class="fas fa-ban" style="color:#f87171;font-size:1.5rem;"></i>
                  <div>
                      <p style="font-size:11px;font-weight:900;color:#f87171;text-transform:uppercase;">Acceso Denegado — ${s.nombre}</p>
                      <p style="font-size:9px;color:#94a3b8;">Deuda pendiente: <strong style="color:#f87171;">$${s.deuda.toLocaleString()}</strong>. Debe regularizar para ingresar.</p>
                  </div>
                  <button onclick="cobrarSocio('${s.nombre}',${s.deuda})" style="margin-left:auto;padding:5px 14px;border-radius:9999px;background:var(--naranja);color:white;font-size:8px;font-weight:900;text-transform:uppercase;border:none;cursor:pointer;">Cobrar</button>
             </div>`
        : `<div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:1rem;padding:1.2rem;display:flex;align-items:center;gap:1rem;">
                  <i class="fas fa-check-circle" style="color:#4ade80;font-size:1.5rem;"></i>
                  <div>
                      <p style="font-size:11px;font-weight:900;color:#4ade80;text-transform:uppercase;">Acceso Permitido — ${s.nombre}</p>
                      <p style="font-size:9px;color:#94a3b8;">Sin deuda pendiente. Puede ingresar.</p>
                  </div>
             </div>`;

    const existente = document.getElementById('acceso-check-resultado');
    if (existente) existente.innerHTML = msg;
}

function renderReclamos() {
    const contenedor = document.getElementById('lista-reclamos-container');
    if (!contenedor) return;

    // Filtramos para mostrar solo los pendientes
    const pendientes = reclamosDB.filter(r => r.estado === "Pendiente");

    if (pendientes.length === 0) {
        contenedor.innerHTML = `<div class="col-span-2 text-center p-8 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 font-black tracking-widest">NO HAY RECLAMOS PENDIENTES ✔</div>`;
        return;
    }

    contenedor.innerHTML = pendientes.map(r => `
        <div class="glass-card p-5 border-l-4 border-orange-500 flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="text-white font-black text-lg">${r.socio}</p>
                        <p class="text-[9px] text-slate-400 tracking-widest">DNI: ${r.dni} | ${r.fecha}</p>
                    </div>
                    <span class="bg-orange-500/20 text-orange-400 text-[9px] px-2 py-1 rounded font-bold border border-orange-500/30">${r.id}</span>
                </div>
                
                <div class="bg-slate-900/80 p-3 rounded-lg border border-slate-700 mb-4">
                    <p class="text-slate-300 text-xs normal-case not-italic">"${r.mensaje}"</p>
                </div>
            </div>

            <div class="flex gap-2">
                <button onclick="verComprobanteReclamo('${r.id}')" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-2 rounded transition font-bold tracking-widest flex items-center justify-center gap-2">
                    <i class="fas fa-receipt"></i> Ver Comprobante
                </button>
                
                <button onclick="denegarReclamo('${r.id}')" class="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] py-2 rounded transition font-bold tracking-widest flex items-center justify-center gap-2">
                    <i class="fas fa-times"></i> Rechazar
                </button>

                <button onclick="resolverReclamo('${r.id}')" class="flex-1 bg-green-600 hover:bg-green-500 text-white text-[10px] py-2 rounded transition font-bold tracking-widest flex items-center justify-center gap-2">
                    <i class="fas fa-check"></i> Aprobar
                </button>
            </div>
        </div>
    `).join('');
}

// Función para descargar el comprobante digital en PDF manteniendo la estética del modal
function verComprobanteReclamo(idReclamo) {
    const r = reclamosDB.find(x => x.id === idReclamo);
    if (!r) return;
    
    const s = sociosDB.find(x => x.dni === r.dni);
    const monto = s && s.deuda > 0 ? s.deuda : 12000;
    
    let metodo = "TRANSFERENCIA";
    if (r.mensaje.toLowerCase().includes("kiosco") || r.mensaje.toLowerCase().includes("efectivo")) metodo = "EFECTIVO";
    if (r.mensaje.toLowerCase().includes("qr")) metodo = "QR";

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("La librería jsPDF no está cargada.");
        return;
    }

    const { jsPDF } = window.jspdf;
    // Creamos un PDF tamaño personalizado para que parezca un recibo (ej: 100mm x 150mm)
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [100, 140] });

    // Fondo oscuro (bg-slate-900 -> #0f172a)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 100, 140, 'F');
    
    // Cabecera naranja (bg-orange-500 -> #f97316)
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 100, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO ELECTRÓNICO", 8, 10);
    
    // Subcabecera
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139); // text-slate-500
    doc.text("SQUATGYM SA", 8, 24);
    doc.text(r.fecha, 92, 24, { align: "right" });
    
    // Línea separadora
    doc.setDrawColor(51, 65, 85); // border-slate-700
    doc.line(8, 27, 92, 27);
    
    // Datos del recibo
    let startY = 35;
    const lineHeight = 8;
    
    doc.setFontSize(8);
    
    // N° Comprobante
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184); // text-slate-400
    doc.text("N° Comprobante", 8, startY);
    doc.setTextColor(249, 115, 22); // text-orange-400
    doc.text(r.id, 92, startY, { align: "right" });
    startY += lineHeight;
    
    // Socio
    doc.setTextColor(148, 163, 184);
    doc.text("Socio", 8, startY);
    doc.setTextColor(255, 255, 255);
    doc.text(`${r.socio.toUpperCase()} — DNI: ${r.dni}`, 92, startY, { align: "right" });
    startY += lineHeight;
    
    // Concepto
    doc.setTextColor(148, 163, 184);
    doc.text("Concepto", 8, startY);
    doc.setTextColor(255, 255, 255);
    doc.text("CUOTA MENSUAL", 92, startY, { align: "right" });
    startY += lineHeight;
    
    // Método
    doc.setTextColor(148, 163, 184);
    doc.text("Método", 8, startY);
    doc.setTextColor(255, 255, 255);
    doc.text(metodo, 92, startY, { align: "right" });
    
    // Línea separadora
    startY += 6;
    doc.setDrawColor(51, 65, 85);
    doc.line(8, startY, 92, startY);
    startY += 8;
    
    // Total
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225); // text-slate-300
    doc.text("Total Abonado", 8, startY);
    doc.setFontSize(16);
    doc.setTextColor(74, 222, 128); // text-green-400
    doc.text(`$${monto.toLocaleString()}`, 92, startY, { align: "right" });
    
    // Badge de Acreditado
    startY += 12;
    doc.setFillColor(34, 197, 94, 0.1); // bg-green-500/10 no soporta alpha directo en fillRect de esta forma en jsPDF sin GState, pero podemos dibujar un rectángulo de contorno
    doc.setDrawColor(34, 197, 94); // border-green-500
    doc.roundedRect(8, startY, 84, 10, 2, 2, 'D');
    doc.setFontSize(7);
    doc.setTextColor(74, 222, 128); // text-green-400
    doc.text("PAGO ACREDITADO", 50, startY + 6.5, { align: "center" });
    
    // Texto legal
    startY += 18;
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105); // text-slate-600
    doc.text("COMPROBANTE VÁLIDO COMO RECIBO DE PAGO", 50, startY, { align: "center" });

    // Guardar el PDF
    doc.save(`Recibo_${r.id}_SquatGym.pdf`);
}

// Función para simular que se resolvió el reclamo
function resolverReclamo(idReclamo) {
    const reclamo = reclamosDB.find(r => r.id === idReclamo);
    if(reclamo) {
        reclamo.estado = "Resuelto";
        alert(`El pago de ${reclamo.socio} ha sido aprobado.`);
        renderReclamos(); // Recarga la vista para que desaparezca la tarjeta
    }
}

// 1. Variable para recordar qué botón se tocó (solo para la interfaz)
let reclamoActivoParaRechazar = null;

// 2. Abre el modal
function denegarReclamo(idReclamo) {
    reclamoActivoParaRechazar = idReclamo; 
    document.getElementById('input-motivo-rechazo').value = ""; // Limpia el cuadro de texto
    document.getElementById('modal-rechazo-reclamo').classList.remove('hidden'); 
}

// 3. Cierra el modal con el botón Cancelar o la cruz
function cerrarModalRechazo() {
    document.getElementById('modal-rechazo-reclamo').classList.add('hidden');
    reclamoActivoParaRechazar = null; 
}

// 4. Botón Confirmar (Versión solo visual)
function confirmarRechazo() {
    const motivo = document.getElementById('input-motivo-rechazo').value.trim();
    
    if (motivo === "") {
        mostrarToast("Por favor, escriba un motivo antes de continuar.", "error");
        return;
    }

    // 1. Buscamos el reclamo en la base y le cambiamos el estado
    const reclamo = reclamosDB.find(r => r.id === reclamoActivoParaRechazar);
    if (reclamo) {
        reclamo.estado = "Rechazado"; 
    }

    mostrarToast("Motivo enviado correctamente.", "exito");
    
    // 2. Cerramos la ventana
    cerrarModalRechazo();
    
    // 3. Redibujamos la pantalla (al no ser más "Pendiente", la tarjeta desaparece)
    renderReclamos();
}