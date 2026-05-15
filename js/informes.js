let ordenActual = 'fecha';
let ordenAsc    = false;
let informeActual = 'cobranzas';

function cambiarOrden(criterio) {
    if (ordenActual === criterio) {
        ordenAsc = !ordenAsc;
    } else {
        ordenActual = criterio;
        ordenAsc = false;
    }
    renderInformes();
}

function getEstadoTransaccion(t) {
    // FECHA DE CORTE: Todo lo anterior a Abril 2026 está PAGADO
    if (t.fecha < "2026-04-01") return 'ACREDITADO';

    const alertas = (typeof alertasVencimiento !== 'undefined') ? alertasVencimiento : [];
    const socio = sociosDB.find(s => s.nombre.toLowerCase().trim() === t.cliente.toLowerCase().trim());
    const deuda = socio ? socio.deuda : 0;
    
    if (deuda === 0) return 'ACREDITADO';
    
    const alerta = alertas.find(a => a.nombre === t.cliente);
    const dias = alerta ? alerta.dias : 0;
    return (dias <= -15) ? 'EN MORA' : 'PENDIENTE';
}

function renderInformes() {
    const anioSel    = document.getElementById('inf-anio-sel')?.value    || '2026';
    const mesSel     = document.getElementById('inf-mes-sel')?.value     || '04';
    
    const sedeSel    = (typeof rRol !== 'undefined' && rRol === 'admin')
        ? (document.getElementById('inf-sede-sel')?.value || 'todas')
        : sedeActual;
    const estadoSel  = (document.getElementById('inf-estado-sel')?.value || 'todos');
    const clienteBus = (document.getElementById('inf-cliente-sel')?.value || '').toLowerCase().trim();
    const dniBus     = (document.getElementById('inf-dni-sel')?.value     || '').trim();

    const filtradasTotales = transacciones.filter(t => {
        let matchFecha = true;
        if (anioSel !== 'todos' && mesSel !== 'todos') {
            matchFecha = t.fecha && t.fecha.startsWith(`${anioSel}-${mesSel}`);
        } else if (anioSel !== 'todos' && mesSel === 'todos') {
            matchFecha = t.fecha && t.fecha.startsWith(anioSel);
        } else if (anioSel === 'todos' && mesSel !== 'todos') {
            matchFecha = t.fecha && t.fecha.split('-')[1] === mesSel;
        }

        const matchSede    = !sedeSel || sedeSel === 'todas' || t.sede === sedeSel;
        
        // Búsqueda más robusta:
        const matchCliente = !clienteBus || (t.cliente && t.cliente.toLowerCase().includes(clienteBus));
        
        const socio = sociosDB.find(s => s.nombre.toLowerCase().trim() === t.cliente.toLowerCase().trim());
        const matchDni = !dniBus || (socio && socio.dni.startsWith(dniBus));

        return matchFecha && matchSede && matchCliente && matchDni;
    });

    const filtradas = filtradasTotales.filter(t => {
        return estadoSel === 'todos' || getEstadoTransaccion(t) === estadoSel;
    });

    // APLICAR ORDENAMIENTO
    filtradas.sort((a, b) => {
        let valA, valB;
        if (ordenActual === 'fecha') {
            valA = new Date(a.fecha); valB = new Date(b.fecha);
        } else if (ordenActual === 'cliente') {
            valA = a.cliente; valB = b.cliente;
        } else if (ordenActual === 'monto') {
            valA = a.monto; valB = b.monto;
        } else if (ordenActual === 'estado') {
            const peso = { 'EN MORA': 2, 'PENDIENTE': 1, 'ACREDITADO': 0 };
            valA = peso[getEstadoTransaccion(a)]; valB = peso[getEstadoTransaccion(b)];
        }
        
        if (valA < valB) return ordenAsc ? -1 : 1;
        if (valA > valB) return ordenAsc ? 1 : -1;
        return 0;
    });

    const totales = { QR: 0, TRANSFERENCIA: 0, EFECTIVO: 0, TARJETA: 0 };
    filtradasTotales.forEach(t => { 
        const estado = getEstadoTransaccion(t);
        if (estado === 'ACREDITADO') {
            const tipoKey = t.tipo.toUpperCase();
            if (totales[tipoKey] !== undefined) totales[tipoKey] += t.monto; 
        }
    });

    let totalRecaudado = 0;
    let totalPendiente = 0;
    let totalMora = 0;

    filtradasTotales.forEach(t => {
        const estado = getEstadoTransaccion(t);
        if (estado === 'ACREDITADO') {
            totalRecaudado += t.monto;
        } else if (estado === 'EN MORA') {
            totalMora += t.monto;
        } else {
            totalPendiente += t.monto;
        }
    });

    const totalGeneral = totalRecaudado + totalPendiente + totalMora;
    const efectividad = totalGeneral > 0 ? Math.round((totalRecaudado / totalGeneral) * 100) : 100;

    const qrEl  = document.getElementById('inf-qr');         if (qrEl)  qrEl.innerText  = '$' + (totales.QR || 0).toLocaleString();
    const trEl  = document.getElementById('inf-transfer');   if (trEl)  trEl.innerText  = '$' + (totales.TRANSFERENCIA || 0).toLocaleString();
    const efEl  = document.getElementById('inf-efectivo');   if (efEl)  efEl.innerText  = '$' + (totales.EFECTIVO || 0).toLocaleString();
    const taEl  = document.getElementById('inf-tarjeta');    if (taEl)  taEl.innerText  = '$' + (totales.TARJETA || 0).toLocaleString();
    
    const totEl = document.getElementById('inf-total-mes');       if (totEl) totEl.innerText = '$' + totalRecaudado.toLocaleString();
    const penEl = document.getElementById('inf-total-pendiente'); if (penEl) penEl.innerText = '$' + totalPendiente.toLocaleString();
    const morEl = document.getElementById('inf-total-mora');      if (morEl) morEl.innerText = '$' + totalMora.toLocaleString();
    const efeEl = document.getElementById('inf-efectividad');     if (efeEl) efeEl.innerText = efectividad + '%';

    const lista = document.getElementById('lista-transacciones');
    if (!lista) return;
    if (filtradas.length === 0) {
        lista.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-600 text-xs">Sin movimientos para el período y filtros seleccionados</td></tr>`;
        return;
    }

    const getMetodoColor = (tipo) => {
        if (!tipo) return '#ffffff';
        const t = tipo.toUpperCase();
        if (t === 'QR') return '#60a5fa'; // Azul
        if (t === 'TRANSFERENCIA') return '#c084fc'; // Morado
        if (t === 'EFECTIVO') return '#4ade80'; // Verde
        if (t === 'TARJETA') return '#fb923c'; // Naranja
        return '#ffffff';
    };
    const conceptoColor = { Cuota: 'text-blue-300', Kiosco: 'text-yellow-300' };

    lista.innerHTML = filtradas.map((t, i) => {
        const fechaStr  = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
        const socio     = sociosDB.find(s => s.nombre === t.cliente);
        const dni       = socio ? socio.dni : '—';
        const sede      = t.sede || socio?.sede || '—';
        
        // Si el concepto es Cuota, mostramos el plan del alumno
        const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : t.concepto;
        const cColor    = conceptoColor[t.concepto] || 'text-slate-400';

        const estado    = getEstadoTransaccion(t);
        const esPagoRealizado = (estado === 'ACREDITADO');

        let estadoHTML;
        if (estado === 'ACREDITADO') {
            estadoHTML = `<span style="padding:2px 10px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.3)">ACREDITADO</span>`;
        } else if (estado === 'EN MORA') {
            estadoHTML = `<span style="padding:2px 10px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.4)">EN MORA</span>`;
        } else {
            estadoHTML = `<span style="padding:2px 10px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(249,115,22,0.12);color:#fb923c;border:1px solid rgba(249,115,22,0.3)">PENDIENTE</span>`;
        }

        const metodoTexto = esPagoRealizado ? t.tipo : '—';
        const mColor      = esPagoRealizado ? getMetodoColor(t.tipo) : '#475569';

        return `
          <tr class="hover:bg-orange-500/5 transition text-xs">
              <td class="p-3 text-slate-500">${i + 1}</td>
              <td class="p-3 text-slate-400">${fechaStr}</td>
              <td class="p-3 text-white font-black">${t.cliente}</td>
              <td class="p-3 text-slate-500 text-[10px]">${dni}</td>
              <td class="p-3 text-slate-400 text-[10px]">${sede}</td>
              <td class="p-3"><span class="font-black text-[10px] ${cColor}">${conceptoDisplay}</span></td>
              <td class="p-3"><span class="font-black text-[10px]" style="color:${mColor}">${metodoTexto}</span></td>
              <td class="p-3 text-right font-black text-white">$${t.monto.toLocaleString()}</td>
              <td class="p-3">${estadoHTML}</td>
          </tr>`;
    }).join('');
}

function generarReporteCobranzas() {
    informeActual = 'cobranzas';
    const anioSel    = document.getElementById('inf-anio-sel')?.value    || 'todos';
    const mesSel     = document.getElementById('inf-mes-sel')?.value     || 'todos';
    const sedeSel    = document.getElementById('inf-sede-sel')?.value    || 'todas';

    // 1. Filtrado Base
    const filtradas = transacciones.filter(t => {
        const matchAnio = anioSel === 'todos' || (t.fecha && t.fecha.startsWith(anioSel));
        const matchMes  = mesSel  === 'todos' || (t.fecha && t.fecha.split('-')[1] === mesSel);
        const matchSede = sedeSel === 'todas' || t.sede === sedeSel;
        return matchAnio && matchMes && matchSede;
    });

    // 2. Agrupamiento: Sede -> Periodo
    const grupos = {}; 
    filtradas.forEach(t => {
        const sede = t.sede || "Sede No Especificada";
        const [y, m] = t.fecha.split('-');
        const periodKey = `${y}-${m}`;
        const periodName = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

        if (!grupos[sede]) grupos[sede] = {};
        if (!grupos[sede][periodKey]) {
            grupos[sede][periodKey] = { nombre: periodName, trans: [] };
        }
        grupos[sede][periodKey].trans.push(t);
    });

    // 3. Construcción del HTML
    let html = `
        <div class="reporte-consolidado space-y-12 pb-10">
            <div class="text-center mb-10">
                <p class="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2">Sistema de Gestión Financiera</p>
                <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">REPORTE CONSOLIDADO <span class="text-orange-500">DE COBRANZAS</span></h2>
                <p class="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest italic border-b border-slate-800 pb-4 inline-block px-10">Consolidado por Sede y Período</p>
            </div>
    `;

    const sedesOrdenadas = Object.keys(grupos).sort();
    
    if (sedesOrdenadas.length === 0) {
        html += `<div class="text-center p-20 text-slate-600 italic">No se encontraron datos para los filtros seleccionados.</div>`;
    }

    sedesOrdenadas.forEach(sede => {
        let totalSede = 0;
        html += `
            <div class="sede-block bg-slate-900/30 rounded-3xl p-6 border border-slate-800/50 mb-12">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <i class="fas fa-building text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-black text-white uppercase italic tracking-tighter">${sede}</h3>
                        <p class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Corte de Control Nivel 1</p>
                    </div>
                </div>
        `;

        const periodos = grupos[sede];
        const periodKeys = Object.keys(periodos).sort().reverse(); // De más reciente a más antiguo

        periodKeys.forEach(pk => {
            const period = periodos[pk];
            let subtotalMes = 0;

            html += `
                <div class="periodo-block ml-4 md:ml-12 mb-10 last:mb-0">
                    <div class="flex items-center gap-3 mb-4 border-l-2 border-orange-500/30 pl-4">
                        <h4 class="text-sm font-black text-orange-400 uppercase tracking-widest">${period.nombre}</h4>
                        <div class="flex-1 h-px bg-slate-800/50"></div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-[10px]">
                            <thead class="bg-slate-800/50 text-slate-500 font-black uppercase tracking-widest border-b border-slate-700">
                                <tr>
                                    <th class="p-3">#</th>
                                    <th class="p-3">Fecha</th>
                                    <th class="p-3">Cliente</th>
                                    <th class="p-3">Concepto</th>
                                    <th class="p-3">Método</th>
                                    <th class="p-3 text-right">Monto</th>
                                    <th class="p-3 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            period.trans.forEach((t, i) => {
                const estado = getEstadoTransaccion(t);
                const colorMonto = estado === 'ACREDITADO' ? 'text-green-400' : (estado === 'EN MORA' ? 'text-red-400' : 'text-orange-400');
                if (estado === 'ACREDITADO') subtotalMes += t.monto;

                html += `
                    <tr class="border-b border-slate-800/30 hover:bg-white/5 transition">
                        <td class="p-3 text-slate-600">${i + 1}</td>
                        <td class="p-3 text-slate-400">${t.fecha}</td>
                        <td class="p-3 text-white font-bold uppercase">${t.cliente}</td>
                        <td class="p-3 text-slate-500">${t.concepto}</td>
                        <td class="p-3 text-slate-500 font-black uppercase">${estado === 'ACREDITADO' ? t.tipo : '—'}</td>
                        <td class="p-3 text-right font-black ${colorMonto}">$${t.monto.toLocaleString()}</td>
                        <td class="p-3 text-center">
                            <span class="text-[8px] font-black px-2 py-0.5 rounded-full border ${estado==='ACREDITADO'?'text-green-500 border-green-500/20 bg-green-500/5':(estado==='EN MORA'?'text-red-500 border-red-500/20 bg-red-500/5':'text-orange-500 border-orange-500/20 bg-orange-500/5')}">
                                ${estado}
                            </span>
                        </td>
                    </tr>
                `;
            });

            totalSede += subtotalMes;
            html += `
                            </tbody>
                            <tfoot class="bg-slate-900/50">
                                <tr class="font-black">
                                    <td colspan="5" class="p-3 text-right text-slate-500 uppercase italic">Subtotal Recaudado ${period.nombre}</td>
                                    <td class="p-3 text-right text-green-400 text-sm">$${subtotalMes.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;
        });

        html += `
                <div class="mt-8 p-6 bg-orange-500 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-orange-500/20">
                    <div class="text-center md:text-left">
                        <p class="text-[10px] font-black text-orange-950 uppercase tracking-[0.2em]">Total Acumulado Sede</p>
                        <h4 class="text-xl font-black text-white italic uppercase">${sede}</h4>
                    </div>
                    <div class="text-center md:text-right">
                        <p class="text-[10px] font-black text-orange-950 uppercase tracking-[0.2em] mb-1">Monto Consolidado</p>
                        <p class="text-4xl font-black text-white tracking-tighter">$${totalSede.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            <div class="final-resumen p-8 rounded-3xl border-2 border-white/10 bg-slate-900 flex flex-col items-center justify-center text-center">
                <p class="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Fin del Reporte</p>
                <p class="text-[10px] text-slate-600 font-bold max-w-md">Este informe ha sido generado dinámicamente basado en los registros actuales de transacciones de SquatGym OS. Los montos reflejan exclusivamente pagos con estado 'ACREDITADO'.</p>
            </div>
        </div>
    `;

    abrirModalInforme(`Reporte Consolidado por Sede y Período`, html, 'cobranzas');
}

let mesAcreditadosActivo = 'todos';

function confirmarReportePagosAcreditados() {
    cerrarM();
    const modalMes = document.getElementById('modal-mes-acreditados-sel');
    if (modalMes) {
        mesAcreditadosActivo = modalMes.value;
    }
    generarReportePagosAcreditados();
}

let anioAnualActivo = '2026';

function confirmarReporteConsolidadoAnual() {
    cerrarM();
    const modalAnio = document.getElementById('modal-anio-anual-sel');
    if (modalAnio) {
        anioAnualActivo = modalAnio.value;
    }
    generarReporteConsolidadoAnual();
}

function generarReportePagosAcreditados() {
    informeActual = 'pagos_acreditados';
    const anioSel    = document.getElementById('inf-anio-sel')?.value    || 'todos';
    const mesSel     = mesAcreditadosActivo;
    const sedeSel    = document.getElementById('inf-sede-sel')?.value    || 'todas';

    const mesesNombres = {
        "01": "ENERO", "02": "FEBRERO", "03": "MARZO", "04": "ABRIL",
        "05": "MAYO", "06": "JUNIO", "07": "JULIO", "08": "AGOSTO",
        "09": "SEPTIEMBRE", "10": "OCTUBRE", "11": "NOVIEMBRE", "12": "DICIEMBRE",
        "todos": "GENERAL"
    };
    const tituloMes = mesesNombres[mesSel] || "GENERAL";

    // 1. Filtrado Base (Sólo ACREDITADO)
    const filtradas = transacciones.filter(t => {
        const matchAnio = anioSel === 'todos' || (t.fecha && t.fecha.startsWith(anioSel));
        const matchMes  = mesSel  === 'todos' || (t.fecha && t.fecha.split('-')[1] === mesSel);
        const matchSede = sedeSel === 'todas' || t.sede === sedeSel;
        const matchEstado = getEstadoTransaccion(t) === 'ACREDITADO';
        return matchAnio && matchMes && matchSede && matchEstado;
    });

    let html = `
        <div class="reporte-consolidado space-y-12 pb-10">
            <div class="text-center mb-10">
                <p class="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-2">Sistema de Gestión Financiera</p>
                <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">REPORTE PAGOS <span class="text-green-500">ACREDITADOS</span></h2>
                <h3 class="text-2xl font-black text-orange-400 uppercase italic tracking-tighter mt-2">${tituloMes}</h3>
                <p class="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest italic border-b border-slate-800 pb-4 inline-block px-10">Listado General</p>
            </div>
    `;

    if (filtradas.length === 0) {
        html += `<div class="text-center p-20 text-slate-600 italic">No se encontraron pagos acreditados para los filtros seleccionados.</div>`;
    } else {
        let totalGeneral = 0;
        
        html += `
            <div class="sede-block bg-slate-900/30 rounded-3xl p-6 border border-slate-800/50 mb-12">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-[10px]">
                        <thead class="bg-slate-800/50 text-slate-500 font-black uppercase tracking-widest border-b border-slate-700">
                            <tr>
                                <th class="p-3">#</th>
                                <th class="p-3">Fecha</th>
                                <th class="p-3">Cliente</th>
                                <th class="p-3">Sede</th>
                                <th class="p-3">Concepto</th>
                                <th class="p-3">Método</th>
                                <th class="p-3 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        filtradas.forEach((t, i) => {
            const socio = sociosDB.find(s => s.nombre === t.cliente);
            const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : (t.concepto || "—");
            totalGeneral += t.monto;
            html += `
                <tr class="border-b border-slate-800/30 hover:bg-white/5 transition">
                    <td class="p-3 text-slate-600">${i + 1}</td>
                    <td class="p-3 text-slate-400">${t.fecha}</td>
                    <td class="p-3 text-white font-bold uppercase">${t.cliente}</td>
                    <td class="p-3 text-slate-500">${t.sede || '—'}</td>
                    <td class="p-3 text-slate-500">${conceptoDisplay}</td>
                    <td class="p-3 text-slate-500 font-black uppercase">${t.tipo}</td>
                    <td class="p-3 text-right font-black text-green-400">$${t.monto.toLocaleString()}</td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-8 p-6 bg-green-600 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-green-500/20">
                    <div class="text-center md:text-left">
                        <p class="text-[10px] font-black text-green-950 uppercase tracking-[0.2em]">Total Acreditado General</p>
                    </div>
                    <div class="text-center md:text-right">
                        <p class="text-[10px] font-black text-green-950 uppercase tracking-[0.2em] mb-1">Monto Consolidado</p>
                        <p class="text-4xl font-black text-white tracking-tighter">$${totalGeneral.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    html += `
            <div class="final-resumen p-8 rounded-3xl border-2 border-white/10 bg-slate-900 flex flex-col items-center justify-center text-center">
                <p class="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Fin del Reporte</p>
                <p class="text-[10px] text-slate-600 font-bold max-w-md">Este informe ha sido generado dinámicamente basado en los registros actuales de transacciones de SquatGym OS. Los montos reflejan exclusivamente pagos con estado 'ACREDITADO'.</p>
            </div>
        </div>
    `;

    abrirModalInforme(`Reporte de Pagos Acreditados`, html, 'pagos_acreditados');
}

function generarReporteConsolidadoAnual() {
    informeActual = 'consolidado_anual';
    const anioReporte = anioAnualActivo;
    
    const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const sedesFijas = ["Sede Norte", "Sede Sur", "Sede Centro"];

    // 1. Filtrar solo por el año seleccionado
    const filtradas = transacciones.filter(t => t.fecha && t.fecha.startsWith(anioReporte));

    // 2. Estructura fija: Sede -> 12 Meses
    const grupos = {}; 
    sedesFijas.forEach(sede => {
        grupos[sede] = {};
        for (let m = 1; m <= 12; m++) {
            const mesKey = `${anioReporte}-${m.toString().padStart(2, '0')}`;
            grupos[sede][mesKey] = {
                nombre: mesesNombres[m-1] + " " + anioReporte,
                trans: []
            };
        }
    });

    // Poblar datos reales
    filtradas.forEach(t => {
        const sede = t.sede || "Sede Centro"; 
        const [y, m] = t.fecha.split('-');
        const mesKey = `${y}-${m}`;
        if (grupos[sede] && grupos[sede][mesKey]) {
            grupos[sede][mesKey].trans.push(t);
        }
    });

    // Poblar datos simulados para meses vacíos (usando datos de sociosDB para consistencia)
    sedesFijas.forEach(sede => {
        const sociosSede = sociosDB.filter(s => s.sede === sede);
        for (let m = 1; m <= 12; m++) {
            const mesKey = `${anioReporte}-${m.toString().padStart(2, '0')}`;
            if (grupos[sede][mesKey].trans.length === 0) {
                // Usamos los mismos socios que están en la base de datos para esta sede
                sociosSede.forEach((socio, idx) => {
                    // El estado se basa en el estado actual del socio para que coincida con el monitor
                    const estSocio = (socio.estado || "").toUpperCase();
                    let estFinal = 'ACREDITADO';
                    if (estSocio === 'DEUDOR') {
                        // Si es deudor hoy, en los reportes de meses actuales aparece como pendiente o mora
                        estFinal = (idx % 2 === 0) ? 'PENDIENTE' : 'EN MORA';
                    }

                    grupos[sede][mesKey].trans.push({
                        fecha: `${mesKey}-${(10 + (idx % 20)).toString().padStart(2, '0')}`,
                        cliente: socio.nombre,
                        concepto: socio.clase,
                        tipo: estFinal === 'ACREDITADO' ? "Efectivo" : "—",
                        monto: 12000,
                        sede: sede,
                        simulado: true
                    });
                });
            }
        }
    });

    // 3. Construcción del HTML
    let html = `
        <div class="reporte-anual space-y-12 pb-10">
            <div class="text-center mb-10">
                <p class="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2">Administración Central SquatGym</p>
                <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">ESTADO CONTABLE ANUAL <span class="text-orange-500">${anioReporte}</span></h2>
                <p class="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest italic border-b border-slate-800 pb-4 inline-block px-10">Consolidado basado en Detalle de Alumnos por Sede</p>
            </div>
    `;

    sedesFijas.forEach(sede => {
        let totalAnualSede = 0;
        html += `
            <div class="sede-block bg-slate-900/40 rounded-3xl p-8 border border-white/5 mb-16 shadow-2xl">
                <div class="flex items-center justify-between mb-10">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <i class="fas fa-landmark text-white text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="text-3xl font-black text-white uppercase italic tracking-tighter">${sede}</h3>
                            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Resumen Anual de Operaciones</p>
                        </div>
                    </div>
                </div>
        `;

        const periodos = grupos[sede];
        Object.keys(periodos).sort().forEach(pk => {
            const period = periodos[pk];
            const tieneDatos = period.trans.length > 0;

            html += `
                <div class="mes-row border-b border-white/5 py-6 last:border-0 group">
                    <div class="flex flex-col md:flex-row md:items-start gap-6">
                        <div class="w-full md:w-48 pt-2">
                            <h4 class="text-lg font-black ${tieneDatos ? 'text-white' : 'text-slate-700'} uppercase italic tracking-tighter">${period.nombre}</h4>
                            <p class="text-[9px] font-black ${tieneDatos ? 'text-orange-500' : 'text-slate-800'} uppercase tracking-widest">${period.trans.length} Movimientos</p>
                        </div>
                        
                        <div class="flex-1">
                            <table class="w-full text-[10px]">
                                <thead class="text-slate-600 uppercase font-black text-[8px] tracking-widest">
                                    <tr>
                                        <th class="pb-3 px-3 text-left">Fecha</th>
                                        <th class="pb-3 px-3 text-left">Cliente</th>
                                        <th class="pb-3 px-3 text-left">Concepto</th>
                                        <th class="pb-3 px-3 text-right">Monto</th>
                                        <th class="pb-3 px-3 text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    ${period.trans.map(t => {
                                        const est = getEstadoTransaccion(t);
                                        const socio = sociosDB.find(s => s.nombre === t.cliente);
                                        const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : (t.concepto || "—");
                                        return `
                                            <tr class="${t.simulado ? 'opacity-60' : ''}">
                                                <td class="py-3 px-3 text-slate-400">${t.fecha.split('-')[2]}/${t.fecha.split('-')[1]}</td>
                                                <td class="py-3 px-3 text-white font-bold uppercase truncate max-w-[120px]">${t.cliente} ${t.simulado ? '<span class="text-[7px] text-slate-700 ml-1">(SIM)</span>' : ''}</td>
                                                <td class="py-3 px-3 text-slate-400 truncate max-w-[100px]">${conceptoDisplay}</td>
                                                <td class="py-3 px-3 text-right font-black ${est==='ACREDITADO'?'text-green-400':(est==='EN MORA'?'text-red-400':'text-orange-400')}">$${t.monto.toLocaleString()}</td>
                                                <td class="py-3 px-3 text-right">
                                                    <span class="text-[7px] font-black px-2 py-1 rounded-full ${est==='ACREDITADO'?'bg-green-500/10 text-green-500':(est==='EN MORA'?'bg-red-500/10 text-red-500':'bg-orange-500/10 text-orange-500')}">
                                                        ${est}
                                                    </span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="w-full md:w-56 text-right pt-2 border-t md:border-t-0 border-white/5 mt-4 md:mt-0 space-y-1">
                            <div class="flex justify-between md:justify-end gap-4">
                                <span class="text-[8px] text-slate-600 font-black uppercase tracking-widest">Acreditados:</span>
                                <span class="text-xs font-black text-green-400">$${period.trans.filter(t => getEstadoTransaccion(t) === 'ACREDITADO').reduce((s, t) => s + t.monto, 0).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between md:justify-end gap-4">
                                <span class="text-[8px] text-slate-600 font-black uppercase tracking-widest">Pendientes:</span>
                                <span class="text-xs font-black text-orange-400">$${period.trans.filter(t => getEstadoTransaccion(t) === 'PENDIENTE').reduce((s, t) => s + t.monto, 0).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between md:justify-end gap-4 border-b border-white/5 pb-2">
                                <span class="text-[8px] text-slate-600 font-black uppercase tracking-widest">En Mora:</span>
                                <span class="text-xs font-black text-red-400">$${period.trans.filter(t => getEstadoTransaccion(t) === 'EN MORA').reduce((s, t) => s + t.monto, 0).toLocaleString()}</span>
                            </div>
                            <p class="text-[8px] text-slate-500 font-black uppercase tracking-widest pt-1">Total Mes:</p>
                            <p class="text-2xl font-black text-white italic">$${period.trans.filter(t => getEstadoTransaccion(t) === 'ACREDITADO').reduce((s, t) => s + t.monto, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;
            totalAnualSede += period.trans.filter(t => getEstadoTransaccion(t) === 'ACREDITADO').reduce((s, t) => s + t.monto, 0);
        });

        html += `
                <div class="mt-12 p-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl flex justify-between items-center shadow-2xl shadow-orange-600/20">
                    <div>
                        <p class="text-[11px] font-black text-orange-950 uppercase tracking-[0.3em]">Cierre Ejercicio Anual</p>
                        <h4 class="text-2xl font-black text-white italic uppercase">${sede}</h4>
                    </div>
                    <div class="text-right">
                        <p class="text-[11px] font-black text-orange-950 uppercase tracking-[0.3em] mb-1">Recaudación Total Bruta</p>
                        <p class="text-5xl font-black text-white tracking-tighter">$${totalAnualSede.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            <div class="footer-note text-center p-10">
                <p class="text-xs font-black text-slate-500 uppercase tracking-[0.6em]">Fin del Informe Consolidado Anual</p>
            </div>
        </div>
    `;

    abrirModalInforme(`Informe Consolidado Anual ${anioReporte}`, html, 'consolidado_anual');
}

function abrirModalInforme(titulo, contenidoHTML, tipo = 'cobranzas') {
    informeActual = tipo;
    document.getElementById('modal-informe-titulo').innerText = titulo;
    document.getElementById('reporte-tablas').innerHTML = contenidoHTML;

    const botones = document.querySelectorAll('#modal-informe .btn-ui');
    botones.forEach(btn => {
        if (btn.innerText.includes('PDF')) {
            btn.setAttribute('onclick', `exportarPDF('${informeActual}')`);
        }
        if (btn.innerText.includes('Excel')) {
            btn.setAttribute('onclick', `exportarExcel('${informeActual}')`);
        }
    });

    abrirM('modal-informe');
}

// ══════════════════════════════════════════════
// MOTORES DE EXPORTACIÓN (jsPDF y SheetJS)
// ══════════════════════════════════════════════

function exportarPDF(tipoInforme) {
    if (tipoInforme === 'consolidado_anual') {
        exportarPDFConsolidadoAnual();
        return;
    }
    if (tipoInforme !== 'cobranzas' && tipoInforme !== 'pagos_acreditados') return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("La librería jsPDF no está cargada.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const fechaGen = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const admin = window.rNombre || 'Administrador';

    const anioSel    = document.getElementById('inf-anio-sel')?.value    || 'todos';
    const mesSel     = tipoInforme === 'pagos_acreditados' && typeof mesAcreditadosActivo !== 'undefined' ? mesAcreditadosActivo : (document.getElementById('inf-mes-sel')?.value || 'todos');
    const sedeSel    = document.getElementById('inf-sede-sel')?.value    || 'todas';

    const filtradas = transacciones.filter(t => {
        const matchAnio = anioSel === 'todos' || (t.fecha && t.fecha.startsWith(anioSel));
        const matchMes  = mesSel  === 'todos' || (t.fecha && t.fecha.split('-')[1] === mesSel);
        const matchSede = sedeSel === 'todas' || t.sede === sedeSel;
        const matchEstado = tipoInforme === 'pagos_acreditados' ? getEstadoTransaccion(t) === 'ACREDITADO' : true;
        return matchAnio && matchMes && matchSede && matchEstado;
    });

    const mesesNombresExport = {
        "01": "ENERO", "02": "FEBRERO", "03": "MARZO", "04": "ABRIL",
        "05": "MAYO", "06": "JUNIO", "07": "JULIO", "08": "AGOSTO",
        "09": "SEPTIEMBRE", "10": "OCTUBRE", "11": "NOVIEMBRE", "12": "DICIEMBRE",
        "todos": "GENERAL"
    };
    const tituloMesExport = mesesNombresExport[mesSel] || "GENERAL";
    const anioExport = anioSel === 'todos' ? 'GENERAL' : anioSel;

    const grupos = {}; 
    filtradas.forEach(t => {
        const sede = t.sede || "Sede No Especificada";
        const [y, m] = t.fecha.split('-');
        const periodKey = `${y}-${m}`;
        const periodName = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

        if (!grupos[sede]) grupos[sede] = {};
        if (!grupos[sede][periodKey]) {
            grupos[sede][periodKey] = { nombre: periodName, trans: [] };
        }
        grupos[sede][periodKey].trans.push(t);
    });

    const addHeaderNormal = (sede) => {
        // Fecha arriba a la derecha (fuera del encabezado)
        doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text(`Fecha: ${fechaGen}`, pageWidth - 14, 10, { align: "right" });

        const color = [249, 115, 22];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(14, 14, 15, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SG", 21.5, 24.5, { align: "center" });
        doc.setTextColor(40, 40, 40); doc.setFontSize(18);
        doc.text("SquatGym OS", 34, 21);
        doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text(`Admin: ${admin}`, 34, 27);
        doc.setDrawColor(color[0], color[1], color[2]); doc.line(14, 34, pageWidth - 14, 34);
        
        doc.setFontSize(14); doc.setTextColor(0, 0, 0);
        const titulo = tipoInforme === 'pagos_acreditados' ? `REPORTE PAGOS ACREDITADOS - ${tituloMesExport}` : `REPORTE DE COBRANZAS - ${sede.toUpperCase()}`;
        doc.text(titulo, pageWidth / 2, 45, { align: "center" });
    };

    let firstPage = true;

    if (tipoInforme === 'pagos_acreditados') {
        addHeaderNormal("GENERAL");
        
        let currentY = 55;
        let totalGeneral = 0;

        const body = filtradas.map((t, i) => {
            const socio = sociosDB.find(s => s.nombre === t.cliente);
            const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : t.concepto;
            totalGeneral += t.monto;
            return [(i + 1), t.fecha, t.cliente, (t.sede || '—'), conceptoDisplay, t.tipo, `$${t.monto.toLocaleString()}`];
        });

        doc.autoTable({
            startY: currentY + 4,
            head: [['#', 'Fecha', 'Cliente', 'Sede', 'Concepto', 'Método', 'Monto']],
            body: body,
            theme: 'grid',
            styles: { fontSize: 7 },
            headStyles: { fillColor: [40, 40, 40] },
            margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 12;

        if (currentY > pageHeight - 30) { doc.addPage(); addHeaderNormal("GENERAL"); currentY = 55; }
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(14, currentY, pageWidth - 28, 15, 2, 2, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(12);
        doc.text(`TOTAL GENERAL: $${totalGeneral.toLocaleString()}`, pageWidth / 2, currentY + 9.5, { align: 'center' });
        
        doc.save(`Reporte-Pagos-Acreditados-${tituloMesExport}-${anioExport}.pdf`);
        return;
    }

    const sedesOrdenadas = Object.keys(grupos).sort();

    sedesOrdenadas.forEach(sede => {
        if (!firstPage) doc.addPage();
        addHeaderNormal(sede);
        firstPage = false;
        
        let currentY = 55;
        const periodos = grupos[sede];
        const periodKeys = Object.keys(periodos).sort().reverse();
        let totalSede = 0;

        periodKeys.forEach(pk => {
            const period = periodos[pk];
            let subtotalMes = 0;

            if (currentY > pageHeight - 40) { doc.addPage(); addHeaderNormal(sede); currentY = 55; }

            doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 100, 100);
            doc.text(period.nombre.toUpperCase(), 14, currentY);
            
            const body = period.trans.map((t, i) => {
                const estado = getEstadoTransaccion(t);
                const socio = sociosDB.find(s => s.nombre === t.cliente);
                const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : t.concepto;
                if (estado === 'ACREDITADO') subtotalMes += t.monto;
                return [(i + 1), t.fecha, t.cliente, conceptoDisplay, (estado === 'ACREDITADO' ? t.tipo : '—'), `$${t.monto.toLocaleString()}`, estado];
            });

            doc.autoTable({
                startY: currentY + 4,
                head: [['#', 'Fecha', 'Cliente', 'Concepto', 'Método', 'Monto', 'Estado']],
                body: body,
                theme: 'grid',
                styles: { fontSize: 7 },
                headStyles: { fillColor: [40, 40, 40] },
                margin: { left: 14, right: 14 }
            });

            totalSede += subtotalMes;
            currentY = doc.lastAutoTable.finalY + 12;
        });

        if (currentY > pageHeight - 30) { doc.addPage(); addHeaderNormal(sede); currentY = 55; }
        doc.setFillColor(249, 115, 22);
        doc.roundedRect(14, currentY, pageWidth - 28, 15, 2, 2, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(12);
        doc.text(`TOTAL SEDE ${sede.toUpperCase()}: $${totalSede.toLocaleString()}`, pageWidth / 2, currentY + 9.5, { align: 'center' });
    });

    doc.save(`Reporte-Cobranzas-${tituloMesExport}-${anioExport}.pdf`);
}

function exportarExcel(tipoInforme) {
    if (tipoInforme === 'consolidado_anual') {
        exportarExcelConsolidadoAnual();
        return;
    }
    if (tipoInforme !== 'cobranzas' && tipoInforme !== 'pagos_acreditados') return;
    if (!window.XLSX) {
        alert("La librería XLSX no está cargada.");
        return;
    }

    const mesSel  = tipoInforme === 'pagos_acreditados' && typeof mesAcreditadosActivo !== 'undefined' ? mesAcreditadosActivo : (document.getElementById('inf-mes-sel')?.value || 'todos');
    const anioSel = document.getElementById('inf-anio-sel')?.value || '2026';
    const sedeSel = document.getElementById('inf-sede-sel')?.value || 'todas';

    const filtradas = transacciones.filter(t => {
        const mAnio = anioSel === 'todos' || (t.fecha && t.fecha.startsWith(anioSel));
        const mMes  = mesSel === 'todos' || (t.fecha && t.fecha.split('-')[1] === mesSel);
        const mSede = sedeSel === 'todas' || t.sede === sedeSel;
        const mEstado = tipoInforme === 'pagos_acreditados' ? getEstadoTransaccion(t) === 'ACREDITADO' : true;
        return mAnio && mMes && mSede && mEstado;
    });

    const wb = XLSX.utils.book_new();
    const mesesNombres = {
        "01": "ENERO", "02": "FEBRERO", "03": "MARZO", "04": "ABRIL",
        "05": "MAYO", "06": "JUNIO", "07": "JULIO", "08": "AGOSTO",
        "09": "SEPTIEMBRE", "10": "OCTUBRE", "11": "NOVIEMBRE", "12": "DICIEMBRE",
        "todos": "GENERAL"
    };
    const tituloMes = mesesNombres[mesSel] || "GENERAL";
    const tituloExcel = tipoInforme === 'pagos_acreditados' ? `REPORTE PAGOS ACREDITADOS SQUATGYM - ${tituloMes}` : "REPORTE DE COBRANZAS SQUATGYM";
    const wsData = [
        [tituloExcel],
        ["Filtros:", `Año: ${anioSel} | Mes: ${tituloMes} | Sede: ${sedeSel}`],
        [],
        ["#", "Fecha", "Cliente", "Sede", "Concepto", "Monto", "Estado", "Tipo"]
    ];

    filtradas.forEach((t, i) => {
        const socio = sociosDB.find(s => s.nombre === t.cliente);
        const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : (t.concepto || "—");
        wsData.push([
            i + 1, 
            t.fecha || "—", 
            t.cliente || "—", 
            t.sede || "—", 
            conceptoDisplay, 
            t.monto || 0, 
            getEstadoTransaccion(t), 
            t.tipo || "—"
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Mejorar visualización definiendo anchos de columna
    ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 15 }, // Fecha
        { wch: 30 }, // Cliente
        { wch: 20 }, // Sede
        { wch: 25 }, // Concepto
        { wch: 15 }, // Monto
        { wch: 15 }, // Estado
        { wch: 15 }  // Tipo
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    
    const anioExportExcel = anioSel === 'todos' ? 'GENERAL' : anioSel;
    const nombreBase = tipoInforme === 'pagos_acreditados' ? 'Pagos-Acreditados' : 'Cobranzas';
    XLSX.writeFile(wb, `Reporte-${nombreBase}-${tituloMes}-${anioExportExcel}.xlsx`);
}

function exportarPDFConsolidadoAnual() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const fechaGen = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const admin = window.rNombre || 'Administrador';
    
    const anioReporte = anioAnualActivo;
    const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const sedesFijas = ["Sede Norte", "Sede Sur", "Sede Centro"];

    const drawCorporateHeader = (y, isFirstPage) => {
        if (y === 15) {
            doc.setFontSize(8); doc.setTextColor(150, 150, 150);
            doc.text(`Fecha: ${fechaGen}`, pageWidth - 14, 10, { align: "right" });
        }

        doc.setFillColor(249, 115, 22);
        doc.roundedRect(14, y, 15, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16); doc.setFont("helvetica", "bold");
        doc.text("SG", 21.5, y + 10.5, { align: "center" });
        doc.setTextColor(40, 40, 40); doc.setFontSize(18);
        doc.text("SquatGym OS", 34, y + 7);
        doc.setFontSize(10); doc.setTextColor(100, 100, 100);
        doc.text(`Admin: ${admin}`, 34, y + 13);
        doc.setDrawColor(249, 115, 22); doc.line(14, y + 20, pageWidth - 14, y + 20);

        if (!isFirstPage) {
            doc.setFontSize(14); doc.setTextColor(0, 0, 0);
            doc.text(`REPORTE CONSOLIDADO ANUAL ${anioReporte}`, pageWidth / 2, y + 31, { align: "center" });
        }
    };

    let firstPage = true;
    let currentY = 15;

    let totalGeneralAnual = 0;

    sedesFijas.forEach(sede => {
        if (!firstPage) { doc.addPage(); currentY = 15; }

        // 1. Dibujamos el encabezado institucional básico
        drawCorporateHeader(currentY, firstPage);

        if (firstPage) {
            // 2. Título Central del Reporte (Sólo en la primera página, antes de la sede)
            let titleY = currentY + 40; 
            doc.setFontSize(26); doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 40);
            doc.text("REPORTE ANUAL", pageWidth / 2, titleY, { align: "center" });
            doc.setFontSize(32); doc.setTextColor(249, 115, 22);
            doc.text(anioReporte, pageWidth / 2, titleY + 12, { align: "center" });
            
            doc.setFontSize(9); doc.setTextColor(150, 150, 150);
            doc.setFont("helvetica", "normal");
            doc.text("Consolidado General de Sedes · SquatGym Platinum OS", pageWidth / 2, titleY + 19, { align: "center" });
            
            doc.setDrawColor(249, 115, 22); doc.setLineWidth(0.5);
            doc.line(pageWidth/2 - 15, titleY + 24, pageWidth/2 + 15, titleY + 24);
            
            currentY = titleY + 35; 
        } else {
            currentY += 25; 
        }

        // 3. Identificación de la Sede (SOLO AL INICIO DE LA SEDE)
        if (!firstPage) {
            currentY += 10;
        }
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0);
        doc.text(`SEDE: ${sede.toUpperCase()}`, 14, currentY);
        
        currentY += 10;
        firstPage = false;
        let totalAnualSede = 0;

        for (let m = 1; m <= 12; m++) {
            const mesKey = `${anioReporte}-${m.toString().padStart(2, '0')}`;
            let transMes = transacciones.filter(t => t.fecha && t.fecha.startsWith(mesKey) && (t.sede === sede || (!t.sede && sede === "Sede Centro")));
            
            if (transMes.length === 0) {
                const sociosSede = sociosDB.filter(s => s.sede === sede);
                sociosSede.forEach((socio, idx) => {
                    const estSocio = (socio.estado || "").toUpperCase();
                    let estFinal = estSocio === 'DEUDOR' ? ((idx % 2 === 0) ? 'PENDIENTE' : 'EN MORA') : 'ACREDITADO';
                    transMes.push({ 
                        fecha: `${mesKey}-${(10 + (idx % 20)).toString().padStart(2, '0')}`, 
                        cliente: socio.nombre, 
                        concepto: socio.clase, 
                        tipo: estFinal === 'ACREDITADO' ? "Efectivo" : "—", 
                        monto: 12000, 
                        simulado: true 
                    });
                });
            }

            let subA = 0; let subP = 0; let subM = 0;
            if (currentY > pageHeight - 60) { 
                doc.addPage(); 
                drawCorporateHeader(15, false); 
                currentY = 40; 
            }

            doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 115, 22);
            doc.text(mesesNombres[m-1].toUpperCase(), 14, currentY);

            const rows = transMes.map((t, i) => {
                const est = getEstadoTransaccion(t);
                const socio = sociosDB.find(s => s.nombre === t.cliente);
                const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : t.concepto;
                if (est === 'ACREDITADO') subA += (t.monto || 0);
                else if (est === 'PENDIENTE') subP += (t.monto || 0);
                else subM += (t.monto || 0);
                return [i+1, t.fecha, t.cliente, conceptoDisplay, `$${(t.monto || 0).toLocaleString()}`, est];
            });

            doc.autoTable({
                startY: currentY + 2,
                head: [['#', 'Fecha', 'Cliente', 'Concepto', 'Monto', 'Estado']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 6 },
                headStyles: { fillColor: [40, 40, 40] },
                margin: { left: 14, right: 14 }
            });

            currentY = doc.lastAutoTable.finalY + 4;
            doc.setFontSize(7);
            doc.setTextColor(34, 197, 94); doc.text(`ACREDITADO: $${subA.toLocaleString()}`, pageWidth - 14, currentY, { align: 'right' });
            doc.setTextColor(249, 115, 22); doc.text(`PENDIENTE: $${subP.toLocaleString()}`, pageWidth - 14, currentY + 3, { align: 'right' });
            doc.setTextColor(220, 38, 38); doc.text(`EN MORA: $${subM.toLocaleString()}`, pageWidth - 14, currentY + 6, { align: 'right' });
            currentY += 12;
            totalAnualSede += subA;
        }

        if (currentY > pageHeight - 20) { 
            doc.addPage(); 
            drawCorporateHeader(15, false); 
            currentY = 40; 
        }
        doc.setFillColor(249, 115, 22);
        doc.roundedRect(14, currentY, pageWidth - 28, 15, 2, 2, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(12);
        doc.text(`TOTAL ANUAL ${sede.toUpperCase()}: $${totalAnualSede.toLocaleString()}`, pageWidth / 2, currentY + 9.5, { align: 'center' });
        
        totalGeneralAnual += totalAnualSede;
    });

    // RESUMEN FINAL GENERAL
    doc.addPage();
    drawCorporateHeader(15, false);
    let finalY = 45; // Subimos un poco para compensar el título borrado

    doc.setFillColor(40, 40, 40);
    doc.roundedRect(20, finalY + 15, pageWidth - 40, 40, 5, 5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont("helvetica", "normal");
    doc.text(`TOTAL RECAUDACIÓN ANUAL ${anioReporte}`, pageWidth / 2, finalY + 28, { align: "center" });
    
    doc.setFontSize(36); doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
    doc.text(`$${totalGeneralAnual.toLocaleString()}`, pageWidth / 2, finalY + 46, { align: "center" });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8); doc.setFont("helvetica", "italic");
    doc.text("Suma consolidada de todas las sedes operativas.", pageWidth / 2, finalY + 52, { align: "center" });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text(`SquatGym OS · Reporte Anual · Ejercicio ${anioReporte}`, 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
    }
    doc.save(`Reporte-Anual-${anioReporte}.pdf`);
}

function exportarExcelConsolidadoAnual() {
    if (!window.XLSX) { alert("La librería XLSX no está cargada."); return; }
    const anioReporte = anioAnualActivo;
    const sedesFijas = ["Sede Norte", "Sede Sur", "Sede Centro"];
    const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const wb = XLSX.utils.book_new();

    let totalGeneralAnual = 0;

    sedesFijas.forEach(sede => {
        const wsData = [
            [`REPORTE ANUAL CONSOLIDADO - ${sede.toUpperCase()}`],
            [`Año Fiscal: ${anioReporte}`],
            [],
            ["#", "Fecha", "Mes", "Cliente", "Concepto", "Monto", "Estado", "Tipo de Pago"]
        ];
        
        let totalAnualSede = 0;
        const filtradasAnio = transacciones.filter(t => t.fecha && t.fecha.startsWith(anioReporte) && (t.sede === sede || (!t.sede && sede === "Sede Centro")));

        for (let m = 1; m <= 12; m++) {
            const mesKey = `${anioReporte}-${m.toString().padStart(2, '0')}`;
            let transMes = filtradasAnio.filter(t => t.fecha.startsWith(mesKey));
            
            if (transMes.length === 0) {
                const sociosSede = sociosDB.filter(s => s.sede === sede);
                sociosSede.forEach((socio, idx) => {
                    const estS = (socio.estado || "").toUpperCase();
                    let estF = estS === 'DEUDOR' ? ((idx % 2 === 0) ? 'PENDIENTE' : 'EN MORA') : 'ACREDITADO';
                    transMes.push({ 
                        fecha: `${mesKey}-${(10+(idx%20)).toString().padStart(2, '0')}`, 
                        cliente: socio.nombre, 
                        concepto: socio.clase, 
                        tipo: estF==='ACREDITADO'?"Efectivo":"—", 
                        monto: 12000, 
                        simulado: true 
                    });
                });
            }

            let subA = 0; let subP = 0; let subM = 0;
            
            wsData.push([`--- ${mesesNombres[m-1].toUpperCase()} ---`]);

            transMes.forEach((t, i) => {
                const est = getEstadoTransaccion(t);
                const socio = sociosDB.find(s => s.nombre === t.cliente);
                const conceptoDisplay = (t.concepto === 'Cuota' && socio) ? socio.clase : t.concepto;
                if (est === 'ACREDITADO') subA += (t.monto || 0);
                else if (est === 'PENDIENTE') subP += (t.monto || 0);
                else subM += (t.monto || 0);
                
                wsData.push([
                    i+1, 
                    t.fecha || "—", 
                    mesesNombres[m-1], 
                    t.cliente + (t.simulado ? " (SIM)" : ""), 
                    conceptoDisplay || "—", 
                    t.monto || 0, 
                    est, 
                    t.tipo || "—"
                ]);
            });

            wsData.push(
                ["", "", "", "", "SUBTOTAL ACREDITADO:", subA],
                ["", "", "", "", "SUBTOTAL PENDIENTE:", subP],
                ["", "", "", "", "SUBTOTAL EN MORA:", subM],
                []
            );
            totalAnualSede += subA;
        }

        wsData.push([], ["", "", "", "", `TOTAL ANUAL ${sede.toUpperCase()}:`, totalAnualSede]);
        totalGeneralAnual += totalAnualSede;

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Mejorar visualización definiendo anchos de columna
        ws['!cols'] = [
            { wch: 5 },  // #
            { wch: 15 }, // Fecha
            { wch: 15 }, // Mes
            { wch: 30 }, // Cliente
            { wch: 25 }, // Concepto
            { wch: 15 }, // Monto
            { wch: 15 }, // Estado
            { wch: 15 }  // Tipo de Pago
        ];

        XLSX.utils.book_append_sheet(wb, ws, sede.substring(0, 31));
    });

    // Pestaña de Resumen General
    const summaryData = [
        ["RESUMEN CONSOLIDADO GENERAL ANUAL"],
        [`Año: ${anioReporte}`],
        [],
        ["SEDE", "TOTAL RECAUDADO (ACREDITADO)"]
    ];

    sedesFijas.forEach(sede => {
        const filtradasSede = transacciones.filter(t => t.fecha && t.fecha.startsWith(anioReporte) && (t.sede === sede || (!t.sede && sede === "Sede Centro")));
        let ts = filtradasSede.filter(t => getEstadoTransaccion(t) === 'ACREDITADO').reduce((s,t) => s + t.monto, 0);
        
        for (let m = 1; m <= 12; m++) {
            const mk = `${anioReporte}-${m.toString().padStart(2, '0')}`;
            if (!filtradasSede.some(t => t.fecha.startsWith(mk))) {
                const ss = sociosDB.filter(s => s.sede === sede);
                ss.forEach((socio, idx) => {
                    const estS = (socio.estado || "").toUpperCase();
                    if (estS !== 'DEUDOR') ts += 12000;
                });
            }
        }
        summaryData.push([sede, ts]);
    });

    summaryData.push([], ["TOTAL GENERAL ORGANIZACIÓN:", totalGeneralAnual]);

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [
        { wch: 35 }, // Sede
        { wch: 30 }  // Total Recaudado
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen General");

    XLSX.writeFile(wb, `Reporte-Anual-SquatGym-${anioReporte}.xlsx`);
}
