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
                <button onclick="verComprobante('${r.comprobanteURL}')" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-2 rounded transition font-bold tracking-widest flex items-center justify-center gap-2">
                    <i class="fas fa-image"></i> Ver Foto
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

// Función para abrir la imagen en grande
function verComprobante(url) {
    document.getElementById('img-comprobante-visor').src = url;
    document.getElementById('modal-comprobante').classList.remove('hidden');
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