let ordenActual = 'fecha';
let ordenAsc    = false;

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
    const clienteBus = (document.getElementById('inf-cliente-sel')?.value || '').toLowerCase().trim();
    const dniBus     = (document.getElementById('inf-dni-sel')?.value     || '').trim();

    const filtradas = transacciones.filter(t => {
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
    filtradas.forEach(t => { 
        const estado = getEstadoTransaccion(t);
        if (estado === 'ACREDITADO') {
            const tipoKey = t.tipo.toUpperCase();
            if (totales[tipoKey] !== undefined) totales[tipoKey] += t.monto; 
        }
    });

    let totalRecaudado = 0;
    let totalPendiente = 0;
    let totalMora = 0;

    filtradas.forEach(t => {
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

    const metodoColor = { QR: '#60a5fa', Transferencia: '#c084fc', Efectivo: '#4ade80', Tarjeta: '#fb923c' };
    const conceptoColor = { Cuota: 'text-blue-300', Kiosco: 'text-yellow-300' };

    lista.innerHTML = filtradas.map((t, i) => {
        const fechaStr  = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
        const socio     = sociosDB.find(s => s.nombre === t.cliente);
        const dni       = socio ? socio.dni : '—';
        const sede      = t.sede || socio?.sede || '—';
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
        const mColor      = esPagoRealizado ? (metodoColor[t.tipo] || '#ffffff') : '#475569';

        return `
          <tr class="hover:bg-orange-500/5 transition text-xs">
              <td class="p-3 text-slate-500">${i + 1}</td>
              <td class="p-3 text-slate-400">${fechaStr}</td>
              <td class="p-3 text-white font-black">${t.cliente}</td>
              <td class="p-3 text-slate-500 text-[10px]">${dni}</td>
              <td class="p-3 text-slate-400 text-[10px]">${sede}</td>
              <td class="p-3"><span class="font-black text-[10px] ${cColor}">${t.concepto}</span></td>
              <td class="p-3"><span class="font-black text-[10px]" style="color:${mColor}">${metodoTexto}</span></td>
              <td class="p-3 text-right font-black text-white">$${t.monto.toLocaleString()}</td>
              <td class="p-3">${estadoHTML}</td>
          </tr>`;
    }).join('');
}

function generarReporteCobranzas() {
    informeActual = 'cobranzas';
    const anioSel    = document.getElementById('inf-anio-sel')?.value    || '2026';
    const mesSel     = document.getElementById('inf-mes-sel')?.value     || '04';
    
    const sedeSel = (typeof rRol !== 'undefined' && rRol === 'admin')
        ? (document.getElementById('inf-sede-sel')?.value || 'todas')
        : sedeActual;
    const sedeLabel = (!sedeSel || sedeSel === 'todas') ? 'Todas las Sedes' : sedeSel;

    let nombreMes = 'Período';
    if (anioSel !== 'todos' && mesSel !== 'todos') {
        nombreMes = new Date(parseInt(anioSel), parseInt(mesSel) - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    } else if (anioSel !== 'todos' && mesSel === 'todos') {
        nombreMes = `Año ${anioSel}`;
    } else if (anioSel === 'todos' && mesSel !== 'todos') {
        nombreMes = `Todos los años - ${mesSel}`;
    } else {
        nombreMes = "Histórico Completo";
    }

    const recibidos = [];
    const pendientes = [];
    const morosos = [];

    const filtradas = transacciones.filter(t => {
        let matchFecha = true;
        if (anioSel !== 'todos' && mesSel !== 'todos') {
            matchFecha = t.fecha && t.fecha.startsWith(`${anioSel}-${mesSel}`);
        } else if (anioSel !== 'todos' && mesSel === 'todos') {
            matchFecha = t.fecha && t.fecha.startsWith(anioSel);
        } else if (anioSel === 'todos' && mesSel !== 'todos') {
            matchFecha = t.fecha && t.fecha.split('-')[1] === mesSel;
        }
        const matchSede = !sedeSel || sedeSel === 'todas' || t.sede === sedeSel;
        return matchFecha && matchSede;
    });

    filtradas.forEach(t => {
        const estado = getEstadoTransaccion(t);
        if (estado === 'ACREDITADO') recibidos.push(t);
        else if (estado === 'EN MORA') morosos.push(t);
        else pendientes.push(t);
    });

    const totalRecibido  = recibidos.reduce((s, t) => s + t.monto, 0);
    const totalPendiente = pendientes.reduce((s, t) => s + t.monto, 0);
    const totalMora      = morosos.reduce((s, t) => s + t.monto, 0);

    const filasRecibidos = recibidos.length
        ? recibidos.map((t, i) => {
            const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'short' });
            return `<tr class="border-b border-slate-800 hover:bg-green-500/5 text-xs">
                <td class="p-2 text-slate-500">${i+1}</td>
                <td class="p-2 text-white font-black">${t.cliente}</td>
                <td class="p-2 text-slate-400">${fechaStr}</td>
                <td class="p-2 font-black" style="color:${t.tipo==='QR'?'#60a5fa':t.tipo==='Transferencia'?'#c084fc':t.tipo==='Efectivo'?'#4ade80':'#fb923c'}">${t.tipo}</td>
                <td class="p-2 text-right font-black text-white">$${t.monto.toLocaleString()}</td>
                <td class="p-2"><span style="padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.3)">ACREDITADO</span></td>
            </tr>`;
          }).join('')
        : `<tr><td colspan="6" class="p-4 text-center text-slate-600 text-xs">Sin pagos acreditados</td></tr>`;

    const seccionRecibidos = `
    <div class="mb-8">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-green-400 font-black text-xs uppercase tracking-widest">1. Pagos Recibidos — ${nombreMes}</span>
            <div class="flex-1 h-px bg-slate-800"></div>
        </div>
        <table class="w-full text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-900 text-[9px] text-slate-500 uppercase tracking-wider">
                <tr><th class="p-2">#</th><th class="p-2">Cliente</th><th class="p-2">Fecha</th><th class="p-2">Método</th><th class="p-2 text-right">Monto</th><th class="p-2">Estado</th></tr>
            </thead>
            <tbody>${filasRecibidos}</tbody>
            <tfoot class="bg-slate-900/80">
                <tr><td colspan="4" class="p-2 text-xs font-black text-slate-400 uppercase tracking-widest">Subtotal Recaudado</td><td class="p-2 text-right font-black text-green-400">$${totalRecibido.toLocaleString()}</td><td></td></tr>
            </tfoot>
        </table>
    </div>`;

    const filasPendientes = pendientes.length
        ? pendientes.map((t, i) => {
            const socio = sociosDB.find(s => s.nombre.toLowerCase().trim() === t.cliente.toLowerCase().trim());
            return `<tr class="border-b border-slate-800 hover:bg-orange-500/5 text-xs">
                <td class="p-2 text-slate-500">${i+1}</td>
                <td class="p-2 text-white font-black">${t.cliente}</td>
                <td class="p-2 text-slate-400">${socio?.clase || 'Musculación'}</td>
                <td class="p-2 text-slate-400 text-[10px]">${t.sede}</td>
                <td class="p-2 text-right font-black text-orange-400">$${t.monto.toLocaleString()}</td>
                <td class="p-2"><span style="padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(249,115,22,0.12);color:#fb923c;border:1px solid rgba(249,115,22,0.3)">PENDIENTE</span></td>
            </tr>`;
          }).join('')
        : `<tr><td colspan="6" class="p-4 text-center text-slate-600 text-xs">Sin deudas pendientes</td></tr>`;

    const seccionPendientes = `
    <div class="mb-8">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span class="text-orange-400 font-black text-xs uppercase tracking-widest">2. Pagos Pendientes (Mora < 15 días)</span>
            <div class="flex-1 h-px bg-slate-800"></div>
        </div>
        <table class="w-full text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-900 text-[9px] text-slate-500 uppercase tracking-wider">
                <tr><th class="p-2">#</th><th class="p-2">Nombre</th><th class="p-2">Clase</th><th class="p-2">Sede</th><th class="p-2 text-right">Monto</th><th class="p-2">Estado</th></tr>
            </thead>
            <tbody>${filasPendientes}</tbody>
            <tfoot class="bg-slate-900/80">
                <tr><td colspan="4" class="p-2 text-xs font-black text-slate-400 uppercase tracking-widest">Subtotal Pendiente</td><td class="p-2 text-right font-black text-orange-400">$${totalPendiente.toLocaleString()}</td><td></td></tr>
            </tfoot>
        </table>
    </div>`;

    const alertas = (typeof alertasVencimiento !== 'undefined') ? alertasVencimiento : [];
    const filasMorosos = morosos.length
        ? morosos.map((t, i) => {
            const alerta = alertas.find(a => a.nombre === t.cliente);
            return `<tr class="border-b border-slate-800 hover:bg-red-500/5 text-xs">
                <td class="p-2 text-slate-500">${i+1}</td>
                <td class="p-2 text-white font-black">${t.cliente}</td>
                <td class="p-2 text-slate-400 text-[10px]">${Math.abs(alerta?.dias || 0)} días</td>
                <td class="p-2 text-right font-black text-red-400">$${t.monto.toLocaleString()}</td>
                <td class="p-2"><span style="padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.4)">ACCESO BLOQUEADO</span></td>
            </tr>`;
          }).join('')
        : `<tr><td colspan="5" class="p-4 text-center text-slate-600 text-xs">Sin morosos con restricción</td></tr>`;

    const seccionMorosos = `
    <div class="mb-8">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-red-400 font-black text-xs uppercase tracking-widest">3. Deudas con Restricción (Mora ≥ 15 días)</span>
            <div class="flex-1 h-px bg-slate-800"></div>
        </div>
        <table class="w-full text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-900 text-[9px] text-slate-500 uppercase tracking-wider">
                <tr><th class="p-2">#</th><th class="p-2">Nombre</th><th class="p-2">Días Mora</th><th class="p-2 text-right">Monto</th><th class="p-2">Estado</th></tr>
            </thead>
            <tbody>${filasMorosos}</tbody>
            <tfoot class="bg-slate-900/80">
                <tr><td colspan="3" class="p-2 text-xs font-black text-slate-400 uppercase tracking-widest">Subtotal en Mora c/ Restricción</td><td class="p-2 text-right font-black text-red-400">$${totalMora.toLocaleString()}</td><td></td></tr>
            </tfoot>
        </table>
    </div>`;

    const totalGeneralRes = totalRecibido + totalPendiente + totalMora;
    const pctCobranza = totalGeneralRes > 0 ? Math.round((totalRecibido / totalGeneralRes) * 100) : 0;
    const pctColor = pctCobranza >= 75 ? '#4ade80' : pctCobranza >= 50 ? '#fb923c' : '#f87171';

    const resumenEjecutivo = `
    <div class="mt-2 p-6 rounded-2xl border-2 border-orange-500 bg-[#0f172a] space-y-4">
        <p class="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-2">◈ Resumen Ejecutivo — ${sedeLabel}</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-slate-900 rounded-xl p-4 text-center border border-green-500/30">
                <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black">Total Recaudado</p>
                <p class="text-xl font-black text-green-400 mt-1">$${totalRecibido.toLocaleString()}</p>
            </div>
            <div class="bg-slate-900 rounded-xl p-4 text-center border border-orange-500/30">
                <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black">Pendiente de Cobro</p>
                <p class="text-xl font-black text-orange-400 mt-1">$${totalPendiente.toLocaleString()}</p>
            </div>
            <div class="bg-slate-900 rounded-xl p-4 text-center border border-red-500/30">
                <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black">En Mora c/ Restricción</p>
                <p class="text-xl font-black text-red-400 mt-1">$${totalMora.toLocaleString()}</p>
            </div>
            <div class="bg-slate-900 rounded-xl p-4 text-center" style="border:1px solid ${pctColor}40">
                <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black">Efectividad de Cobro</p>
                <p class="text-2xl font-black mt-1" style="color:${pctColor}">${pctCobranza}%</p>
            </div>
        </div>
        <p class="text-center text-[9px] text-slate-600 uppercase tracking-widest font-black pt-2">SquatGym OS · Reporte de Cobranzas · ${nombreMes} · ${sedeLabel}</p>
    </div>`;

    abrirModalInforme(`Reporte de Cobranzas — ${nombreMes} · ${sedeLabel}`, seccionRecibidos + seccionPendientes + seccionMorosos + resumenEjecutivo);
}

function abrirModalInforme(titulo, contenidoHTML) {
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
    if (tipoInforme !== 'cobranzas') return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("La librería jsPDF no está cargada.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const admin = window.rNombre || 'Administrador';

    // ── Lógica de Datos (Espejo de generarReporteCobranzas) ──
    const anioSel    = document.getElementById('inf-anio-sel')?.value    || '2026';
    const mesSel     = document.getElementById('inf-mes-sel')?.value     || '04';
    
    const sedeSel = (typeof rRol !== 'undefined' && rRol === 'admin')
        ? (document.getElementById('inf-sede-sel')?.value || 'todas')
        : (typeof sedeActual !== 'undefined' ? sedeActual : null);
    const sedeLabel = (!sedeSel || sedeSel === 'todas') ? 'Todas las Sedes' : sedeSel;

    let nombreMes = 'Período';
    if (anioSel !== 'todos' && mesSel !== 'todos') {
        nombreMes = new Date(parseInt(anioSel), parseInt(mesSel) - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    } else if (anioSel !== 'todos' && mesSel === 'todos') {
        nombreMes = `Año ${anioSel}`;
    } else if (anioSel === 'todos' && mesSel !== 'todos') {
        nombreMes = `Todos los años - ${mesSel}`;
    } else {
        nombreMes = "Histórico Completo";
    }

    const recibidos = [];
    const pendientes = [];
    const morosos = [];

    const filtradas = transacciones.filter(t => {
        let matchFecha = true;
        if (anioSel !== 'todos' && mesSel !== 'todos') {
            matchFecha = t.fecha && t.fecha.startsWith(`${anioSel}-${mesSel}`);
        } else if (anioSel !== 'todos' && mesSel === 'todos') {
            matchFecha = t.fecha && t.fecha.startsWith(anioSel);
        } else if (anioSel === 'todos' && mesSel !== 'todos') {
            matchFecha = t.fecha && t.fecha.split('-')[1] === mesSel;
        }
        const matchSede = !sedeSel || sedeSel === 'todas' || t.sede === sedeSel;
        return matchFecha && matchSede;
    });

    filtradas.forEach(t => {
        const estado = getEstadoTransaccion(t);
        if (estado === 'ACREDITADO') recibidos.push(t);
        else if (estado === 'EN MORA') morosos.push(t);
        else pendientes.push(t);
    });

    const totalRecibido  = recibidos.reduce((s, t) => s + t.monto, 0);
    const totalPendiente = pendientes.reduce((s, t) => s + t.monto, 0);
    const totalMora      = morosos.reduce((s, t) => s + t.monto, 0);
    const totalGeneral   = totalRecibido + totalPendiente + totalMora;
    const pctCobranza    = totalGeneral > 0 ? Math.round((totalRecibido / totalGeneral) * 100) : 0;

    // ── Encabezado ──
    const addHeader = () => {
        doc.setFillColor(249, 115, 22);
        doc.roundedRect(14, 14, 15, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SG", 21.5, 24.5, { align: "center" });

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.text("SquatGym OS", 34, 21);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Platinum Master Financial System", 34, 27);

        doc.setFontSize(9);
        doc.text(`Fecha: ${fecha}`, pageWidth - 14, 21, { align: "right" });
        doc.text(`Admin: ${admin}`, pageWidth - 14, 26, { align: "right" });

        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.5);
        doc.line(14, 34, pageWidth - 14, 34);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Reporte de Cobranzas — ${nombreMes}`, 14, 45);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Filtros: ${nombreMes} - ${sedeLabel}`, 14, 50);
    };

    addHeader();
    let currentY = 58;

    // ── TABLA 1: PAGOS RECIBIDOS ──
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(34, 197, 94);
    doc.text("1. Pagos Recibidos", 14, currentY);
    
    const bodyRecibidos = recibidos.map((t, i) => [
        (i + 1), t.cliente, t.fecha, t.tipo, t.concepto, `$${t.monto.toLocaleString()}`
    ]);
    bodyRecibidos.push([{ content: 'SUBTOTAL RECAUDADO', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `$${totalRecibido.toLocaleString()}`, styles: { fontStyle: 'bold' } }]);

    doc.autoTable({
        startY: currentY + 4,
        head: [['#', 'Cliente', 'Fecha', 'Método', 'Concepto', 'Monto']],
        body: bodyRecibidos,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 12;

    // ── TABLA 2: PAGOS PENDIENTES ──
    if (currentY > pageHeight - 30) { doc.addPage(); currentY = 20; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 115, 22);
    doc.text("2. Pagos Pendientes (Mora < 15 días)", 14, currentY);

    const bodyPendientes = pendientes.map((t, i) => {
        const socio = sociosDB.find(s => s.nombre === t.cliente);
        return [(i + 1), t.cliente, socio?.clase || 'Musculación', t.sede, `$${t.monto.toLocaleString()}`];
    });
    bodyPendientes.push([{ content: 'SUBTOTAL PENDIENTE', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `$${totalPendiente.toLocaleString()}`, styles: { fontStyle: 'bold' } }]);

    doc.autoTable({
        startY: currentY + 4,
        head: [['#', 'Socio', 'Clase', 'Sede', 'Monto Pendiente']],
        body: bodyPendientes,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 12;

    // ── TABLA 3: DEUDAS CON RESTRICCIÓN ──
    if (currentY > pageHeight - 30) { doc.addPage(); currentY = 20; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(220, 38, 38);
    doc.text("3. Deudas con Restricción (Acceso Bloqueado)", 14, currentY);

    const alertas = (typeof alertasVencimiento !== 'undefined') ? alertasVencimiento : [];
    const bodyMorosos = morosos.map((t, i) => {
        const alerta = alertas.find(a => a.nombre === t.cliente);
        return [(i + 1), t.cliente, `${Math.abs(alerta?.dias || 0)} días`, `$${t.monto.toLocaleString()}`];
    });
    bodyMorosos.push([{ content: 'SUBTOTAL EN MORA C/ RESTRICCIÓN', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `$${totalMora.toLocaleString()}`, styles: { fontStyle: 'bold' } }]);

    doc.autoTable({
        startY: currentY + 4,
        head: [['#', 'Socio', 'Días Mora', 'Monto']],
        body: bodyMorosos,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // ── RESUMEN EJECUTIVO ──
    if (currentY > pageHeight - 50) { doc.addPage(); currentY = 20; }
    
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, pageWidth - 28, 40, 3, 3, 'F');
    doc.setDrawColor(249, 115, 22);
    doc.rect(14, currentY, pageWidth - 28, 40, 'D');

    doc.setTextColor(249, 115, 22); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("RESUMEN EJECUTIVO", 20, currentY + 8);

    doc.setTextColor(40, 40, 40); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Total Recaudado: $${totalRecibido.toLocaleString()}`, 20, currentY + 18);
    doc.text(`Pendiente de Cobro: $${totalPendiente.toLocaleString()}`, 20, currentY + 24);
    doc.text(`En Mora c/ Restricción: $${totalMora.toLocaleString()}`, 20, currentY + 30);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Efectividad de Cobro: ${pctCobranza}%`, pageWidth - 20, currentY + 24, { align: 'right' });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`SquatGym OS · Reporte Cobranzas · ${fecha}`, 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
    }

    doc.save(`Reporte-Cobranzas-${sedeSel.replace(' ', '-')}-${mesSel}.pdf`);
}

function exportarExcel(tipoInforme) {
    if (tipoInforme !== 'cobranzas') return;
    if (!window.XLSX) {
        alert("La librería XLSX no está cargada.");
        return;
    }

    const mesSel  = document.getElementById('inf-mes-sel')?.value || '2026-04';
    const sedeSel = (typeof rRol !== 'undefined' && rRol === 'admin')
        ? (document.getElementById('inf-sede-sel')?.value || 'todas')
        : (typeof sedeActual !== 'undefined' ? sedeActual : null);

    const alertas = (typeof alertasVencimiento !== 'undefined') ? alertasVencimiento : [];
    const recibidos = [];
    const pendientes = [];
    const morosos = [];

    const filtradas = transacciones.filter(t => {
        const matchMes  = t.fecha && t.fecha.startsWith(mesSel);
        const matchSede = !sedeSel || sedeSel === 'todas' || t.sede === sedeSel;
        const esCuota   = t.concepto === 'Cuota';
        return matchMes && matchSede && esCuota;
    });

    filtradas.forEach(t => {
        const socio = sociosDB.find(s => s.nombre === t.cliente);
        const deuda = socio ? socio.deuda : 0;
        if (deuda === 0) {
            recibidos.push(t);
        } else {
            const alerta = alertas.find(a => a.nombre === t.cliente);
            const dias   = alerta ? alerta.dias : 0;
            if (dias <= -15) morosos.push(t);
            else pendientes.push(t);
        }
    });

    const [anio, mes] = mesSel.split('-');
    const nombreMes = new Date(parseInt(anio), parseInt(mes) - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const sedeLabel = (!sedeSel || sedeSel === 'todas') ? 'Todas las Sedes' : sedeSel;

    const totalRecibido  = recibidos.reduce((s, t) => s + t.monto, 0);
    const totalPendiente = pendientes.reduce((s, t) => s + t.monto, 0);
    const totalMora      = morosos.reduce((s, t) => s + t.monto, 0);
    const totalGeneral   = totalRecibido + totalPendiente + totalMora;
    const pctCobranza    = totalGeneral > 0 ? Math.round((totalRecibido / totalGeneral) * 100) : 0;

    const wb = XLSX.utils.book_new();
    const wsData = [
        ["REPORTE CONSOLIDADO DE COBRANZAS"],
        ["Sede:", sedeLabel],
        ["Mes:", nombreMes],
        [],
        ["1. PAGOS RECIBIDOS"],
        ["#", "Cliente", "Fecha", "Método", "Concepto", "Monto"],
        ...recibidos.map((t, i) => [i + 1, t.cliente, t.fecha, t.tipo, t.concepto, t.monto]),
        ["", "", "", "", "SUBTOTAL REC.", totalRecibido],
        [],
        ["2. PAGOS PENDIENTES (MORA < 15 DÍAS)"],
        ["#", "Socio", "Clase", "Sede", "Monto Pendiente"],
        ...pendientes.map((t, i) => {
            const socio = sociosDB.find(s => s.nombre === t.cliente);
            return [i + 1, t.cliente, socio?.clase || 'Musculación', t.sede, t.monto];
        }),
        ["", "", "", "SUBTOTAL PEND.", totalPendiente],
        [],
        ["3. DEUDAS CON RESTRICCIÓN (MORA >= 15 DÍAS)"],
        ["#", "Socio", "Días Mora", "Monto"],
        ...morosos.map((t, i) => {
            const alerta = alertas.find(a => a.nombre === t.cliente);
            return [i + 1, t.cliente, Math.abs(alerta?.dias || 0), t.monto];
        }),
        ["", "", "SUBTOTAL RESTR.", totalMora],
        [],
        ["RESUMEN FINAL"],
        ["Total Recaudado:", totalRecibido],
        ["Pendiente de Cobro:", totalPendiente],
        ["En Mora c/ Restricción:", totalMora],
        ["Efectividad:", pctCobranza + "%"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Cobranzas");
    XLSX.writeFile(wb, `Reporte-Cobranzas-${sedeSel.replace(' ', '-')}-${mesSel}.xlsx`);
}
