let informeActual = null;

function renderInformes() {
    const mesSel = document.getElementById('inf-mes-sel')?.value || '2026-04';
    const tipoSel = document.getElementById('inf-tipo-sel')?.value || 'todos';

    const filtradas = transacciones.filter(t => {
        const matchMes = t.fecha && t.fecha.startsWith(mesSel);
        const matchTipo = tipoSel === 'todos' || t.concepto === tipoSel;
        return matchMes && matchTipo;
    });

    // KPIs por método
    const totales = { QR: 0, Transferencia: 0, Efectivo: 0, Tarjeta: 0 };
    filtradas.forEach(t => { if (totales[t.tipo] !== undefined) totales[t.tipo] += t.monto; });
    const totalMes = Object.values(totales).reduce((s, v) => s + v, 0);

    const qrEl = document.getElementById('inf-qr'); if (qrEl) qrEl.innerText = '$' + totales.QR.toLocaleString();
    const trEl = document.getElementById('inf-transfer'); if (trEl) trEl.innerText = '$' + totales.Transferencia.toLocaleString();
    const efEl = document.getElementById('inf-efectivo'); if (efEl) efEl.innerText = '$' + totales.Efectivo.toLocaleString();
    const taEl = document.getElementById('inf-tarjeta'); if (taEl) taEl.innerText = '$' + totales.Tarjeta.toLocaleString();
    const totEl = document.getElementById('inf-total-mes'); if (totEl) totEl.innerText = '$' + totalMes.toLocaleString();
    const cntEl = document.getElementById('inf-count-mes'); if (cntEl) cntEl.innerText = filtradas.length;

    // Tabla de transacciones
    const lista = document.getElementById('lista-transacciones');
    if (!lista) return;
    if (filtradas.length === 0) {
        lista.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-600 text-xs">Sin movimientos para el período seleccionado</td></tr>`;
        return;
    }

    const metodoColor = { QR: 'text-blue-400', Transferencia: 'text-purple-400', Efectivo: 'text-green-400', Tarjeta: 'text-orange-400' };
    const conceptoColor = { Cuota: 'text-blue-300', Kiosco: 'text-yellow-300' };

    lista.innerHTML = filtradas.map((t, i) => {
        const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
        const mColor = metodoColor[t.tipo] || 'text-white';
        const cColor = conceptoColor[t.concepto] || 'text-slate-400';
        return `
          <tr class="hover:bg-orange-500/5 transition">
              <td class="p-3 text-slate-500">${i + 1}</td>
              <td class="p-3 text-slate-400">${fechaStr}</td>
              <td class="p-3 text-white font-black">${t.cliente}</td>
              <td class="p-3"><span class="font-black text-[10px] ${cColor}">${t.concepto}</span></td>
              <td class="p-3 font-black ${mColor}">${t.tipo}</td>
              <td class="p-3 text-right font-black text-white">$${t.monto.toLocaleString()}</td>
              <td class="p-3">
                  <span style="padding:2px 10px;border-radius:9999px;font-size:9px;font-weight:900;
                      background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.3);">
                      ACREDITADO
                  </span>
              </td>
          </tr>`;
    }).join('');
}

function generarCorteCaja() {
    informeActual = 'corte';
    const mesSel = document.getElementById('inf-mes-sel')?.value || '2026-04';
    const tipoSel = document.getElementById('inf-tipo-sel')?.value || 'todos';
    const [anio, mes] = mesSel.split('-');
    const nombreMes = new Date(parseInt(anio), parseInt(mes) - 1, 1)
        .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    const filtradas = transacciones.filter(t => {
        const matchMes = t.fecha && t.fecha.startsWith(mesSel);
        const matchTipo = tipoSel === 'todos' || t.concepto === tipoSel;
        return matchMes && matchTipo;
    });

    const tipos = ["QR", "Transferencia", "Tarjeta", "Efectivo"];
    let totalGeneral = 0;

    const bloques = tipos.map(tipo => {
        const lista = filtradas.filter(t => t.tipo === tipo);
        let subtotal = 0;
        const filas = lista.map((t, i) => {
            subtotal += t.monto;
            const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
            return `<tr class="border-b border-slate-800 text-xs hover:bg-orange-500/5">
                  <td class="p-2">${i + 1}</td>
                  <td class="p-2 text-white font-bold">${t.cliente}</td>
                  <td class="p-2 text-slate-400">${fechaStr}</td>
                  <td class="p-2 text-slate-500">${t.concepto}</td>
                  <td class="p-2 text-orange-400 font-black">$${t.monto.toLocaleString()}</td>
                  <td class="p-2"><span style="padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:900;background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.3)">ACREDITADO</span></td>
              </tr>`;
        }).join('') || `<tr><td colspan="6" class="p-3 text-center text-slate-600 text-xs">Sin movimientos</td></tr>`;
        totalGeneral += subtotal;
        return `
          <div class="mb-6">
              <div class="flex items-center gap-2 mb-2">
                  <span class="text-orange-500 font-black text-xs uppercase tracking-widest">${tipo}</span>
                  <div class="flex-1 h-px bg-slate-800"></div>
                  <span class="text-xs font-black text-slate-300">$${subtotal.toLocaleString()}</span>
              </div>
              <table class="w-full text-left border border-slate-800 rounded-lg overflow-hidden">
                  <thead class="bg-slate-900 text-[9px] text-slate-500 uppercase tracking-wider">
                      <tr><th class="p-2">#</th><th class="p-2">Cliente</th><th class="p-2">Fecha</th><th class="p-2">Concepto</th><th class="p-2">Monto</th><th class="p-2">Estado</th></tr>
                  </thead>
                  <tbody>${filas}</tbody>
              </table>
          </div>`;
    }).join('');

    const pie = `
      <div class="mt-6 p-5 rounded-2xl border-2 border-orange-500 bg-orange-500/10 flex justify-between items-center">
          <span class="text-sm font-black text-orange-400 uppercase tracking-widest">Total Recaudado — ${nombreMes}</span>
          <span class="text-3xl font-black text-white">$${totalGeneral.toLocaleString()}</span>
      </div>
      <p class="text-center text-[9px] text-slate-600 mt-6 uppercase tracking-widest font-black">SquatGym OS · Corte Mensual · ${nombreMes} · ${filtradas.length} pagos</p>`;

    abrirModalInforme(`Corte de Caja — ${nombreMes}`, bloques + pie);
}

function generarInforme() {
    generarCorteCaja();
}
function generarListadoMorosos() {
    informeActual = 'morosos';
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const morosos = [...sociosDB]
        .filter(s => s.deuda > 0)
        .sort((a, b) => b.deuda - a.deuda);

    const totalDeuda = morosos.reduce((s, m) => s + m.deuda, 0);

    const filas = morosos.map((s, i) => `
          <tr class="border-b border-slate-800 hover:bg-red-500/5">
              <td class="p-3 text-xs font-black text-slate-400">${i + 1}</td>
              <td class="p-3 text-xs font-black text-white">${s.nombre}</td>
              <td class="p-3 text-xs text-slate-400">${s.dni}</td>
              <td class="p-3 text-xs text-slate-300">${s.clase}</td>
              <td class="p-3 text-xs font-black text-red-400">$${s.deuda.toLocaleString()}</td>
          </tr>
      `).join('') || `<tr><td colspan="5" class="p-4 text-center text-slate-600 text-xs">Sin socios morosos</td></tr>`;

    const tabla = `
      <div class="mb-2 flex items-center gap-2">
          <span class="text-red-400 font-black text-xs uppercase tracking-widest">Ranking de Mora — Mayor a Menor</span>
          <div class="flex-1 h-px bg-slate-800"></div>
      </div>
      <table class="w-full text-left border border-slate-800 rounded-lg overflow-hidden mb-4">
          <thead class="bg-slate-900 text-[9px] text-slate-500 uppercase tracking-wider">
              <tr>
                  <th class="p-3">#</th><th class="p-3">Socio</th>
                  <th class="p-3">DNI</th><th class="p-3">Clase</th>
                  <th class="p-3">Monto Adeudado</th>
              </tr>
          </thead>
          <tbody>${filas}</tbody>
      </table>
      <div class="p-5 rounded-2xl border-2 border-red-500 bg-red-500/10 flex justify-between items-center mt-4">
          <span class="text-sm font-black text-red-400 uppercase tracking-widest">Total Deuda a Recuperar</span>
          <span class="text-3xl font-black text-white">$${totalDeuda.toLocaleString()}</span>
      </div>
      <p class="text-center text-[9px] text-slate-600 mt-6 uppercase tracking-widest font-black">SquatGym OS · Página 1 de 1 · ${fecha}</p>`;

    abrirModalInforme(`Listado Crítico de Socios con Deudas — ${fecha}`, tabla);
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

    // Función Header Fijo
    const addHeader = (titulo) => {
        // Logo SG
        doc.setFillColor(249, 115, 22); // #f97316
        doc.roundedRect(14, 14, 15, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("SG", 21.5, 24.5, { align: "center" });

        // Títulos
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.text("SquatGym OS", 34, 21);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Platinum Master Financial System", 34, 27);

        // Meta info
        doc.setFontSize(9);
        doc.text(`Fecha: ${fecha}`, pageWidth - 14, 21, { align: "right" });
        doc.text(`Admin: ${admin}`, pageWidth - 14, 26, { align: "right" });

        // Línea divisoria
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.5);
        doc.line(14, 34, pageWidth - 14, 34);

        // Título del Informe
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(titulo, 14, 45);
    };

    // Función Footer Fijo
    const addFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`SquatGym OS · Documento generado el ${fecha} · Confidencial`, 14, pageHeight - 10);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
        }
    };

    if (tipoInforme === 'corte') {
        const mesSel = document.getElementById('inf-mes-sel')?.value || '2026-04';
        const tipoSel = document.getElementById('inf-tipo-sel')?.value || 'todos';

        const filtradas = transacciones.filter(t => {
            const matchMes = t.fecha && t.fecha.startsWith(mesSel);
            const matchTipo = tipoSel === 'todos' || t.concepto === tipoSel;
            return matchMes && matchTipo;
        });

        addHeader("Corte de Caja Mensual");
        let startY = 52;
        let totalGeneral = 0;
        const tipos = ["QR", "Transferencia", "Tarjeta", "Efectivo"];

        tipos.forEach(tipo => {
            const lista = filtradas.filter(t => t.tipo === tipo);
            if (lista.length === 0) return;

            let subtotal = 0;
            const body = lista.map((t, i) => {
                subtotal += t.monto;
                const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
                return [(i + 1).toString(), t.cliente, fechaStr, t.concepto, `$${t.monto.toLocaleString()}`, "Acreditado"];
            });

            totalGeneral += subtotal;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(249, 115, 22);
            doc.text(`${tipo} - Subtotal: $${subtotal.toLocaleString()}`, 14, startY);

            doc.autoTable({
                startY: startY + 4,
                head: [['#', 'Cliente', 'Fecha', 'Concepto', 'Monto', 'Estado']],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
                margin: { left: 14, right: 14 }
            });
            startY = doc.lastAutoTable.finalY + 12;

            if (startY > pageHeight - 40) {
                doc.addPage();
                addHeader("Corte de Caja Mensual (Cont.)");
                startY = 52;
            }
        });

        // Total General
        doc.setFillColor(249, 115, 22);
        doc.rect(14, startY, pageWidth - 28, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL GENERAL RECAUDADO: $${totalGeneral.toLocaleString()}`, pageWidth / 2, startY + 8, { align: "center" });

        addFooter();
        doc.save(`corte-caja-${mesSel}.pdf`);
    }
    else if (tipoInforme === 'morosos') {
        const morosos = [...sociosDB].filter(s => s.deuda > 0).sort((a, b) => b.deuda - a.deuda);
        const totalDeuda = morosos.reduce((s, m) => s + m.deuda, 0);

        addHeader("Listado Crítico de Socios con Deudas");

        const body = morosos.map((s, i) => {
            let alerta = null;
            if (typeof alertasVencimiento !== 'undefined') {
                alerta = alertasVencimiento.find(a => a.nombre === s.nombre);
            }
            const mora = alerta && alerta.dias < 0 ? Math.abs(alerta.dias) : 0;
            return [(i + 1).toString(), s.nombre, s.dni, s.clase || 'General', `$${s.deuda.toLocaleString()}`, `${mora} días`];
        });

        doc.autoTable({
            startY: 52,
            head: [['#', 'Socio', 'DNI', 'Clase', 'Monto Adeudado', 'Días Mora']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
            margin: { left: 14, right: 14 }
        });

        let startY = doc.lastAutoTable.finalY + 12;
        doc.setFillColor(220, 38, 38);
        doc.rect(14, startY, pageWidth - 28, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL A RECUPERAR: $${totalDeuda.toLocaleString()}`, pageWidth / 2, startY + 8, { align: "center" });

        addFooter();
        const fechaArchivo = new Date().toISOString().split('T')[0];
        doc.save(`morosos-${fechaArchivo}.pdf`);
    }
}

function exportarExcel(tipoInforme) {
    if (!window.XLSX) {
        alert("La librería XLSX no está cargada.");
        return;
    }
    const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const admin = window.rNombre || 'Administrador';

    const wb = XLSX.utils.book_new();

    if (tipoInforme === 'corte') {
        const mesSel = document.getElementById('inf-mes-sel')?.value || '2026-04';
        const tipoSel = document.getElementById('inf-tipo-sel')?.value || 'todos';

        const filtradas = transacciones.filter(t => {
            const matchMes = t.fecha && t.fecha.startsWith(mesSel);
            const matchTipo = tipoSel === 'todos' || t.concepto === tipoSel;
            return matchMes && matchTipo;
        });

        const wsData = [
            ["Sistema:", "SquatGym OS - Platinum Master Financial System"],
            ["Período:", mesSel],
            ["Fecha de Generación:", fecha],
            ["Generado por:", admin],
            []
        ];

        let totalGeneral = 0;
        const tipos = ["QR", "Transferencia", "Tarjeta", "Efectivo"];

        tipos.forEach(tipo => {
            const lista = filtradas.filter(t => t.tipo === tipo);
            if (lista.length === 0) return;

            wsData.push([`--- MÉTODO: ${tipo.toUpperCase()} ---`]);
            wsData.push(["#", "Cliente", "Fecha", "Concepto", "Monto", "Estado"]);

            let subtotal = 0;
            lista.forEach((t, i) => {
                subtotal += t.monto;
                const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
                wsData.push([i + 1, t.cliente, fechaStr, t.concepto, t.monto, "Acreditado"]);
            });

            totalGeneral += subtotal;
            wsData.push(["", "", "", "SUBTOTAL", subtotal, ""]);
            wsData.push([]);
        });

        wsData.push(["", "", "", "TOTAL GENERAL RECAUDADO", totalGeneral, ""]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Corte de Caja");
        XLSX.writeFile(wb, `corte-caja-${mesSel}.xlsx`);
    }
    else if (tipoInforme === 'morosos') {
        const morosos = [...sociosDB].filter(s => s.deuda > 0).sort((a, b) => b.deuda - a.deuda);
        const totalDeuda = morosos.reduce((s, m) => s + m.deuda, 0);

        const wsData = [
            ["Sistema:", "SquatGym OS - Platinum Master Financial System"],
            ["Reporte:", "Listado Crítico de Socios con Deudas"],
            ["Fecha de Generación:", fecha],
            ["Generado por:", admin],
            []
        ];

        wsData.push(["#", "Socio", "DNI", "Clase", "Monto Adeudado", "Días Mora"]);

        morosos.forEach((s, i) => {
            let alerta = null;
            if (typeof alertasVencimiento !== 'undefined') {
                alerta = alertasVencimiento.find(a => a.nombre === s.nombre);
            }
            const mora = alerta && alerta.dias < 0 ? Math.abs(alerta.dias) : 0;
            wsData.push([i + 1, s.nombre, s.dni, s.clase || 'General', s.deuda, mora]);
        });

        wsData.push([]);
        wsData.push(["", "", "", "TOTAL A RECUPERAR", totalDeuda, ""]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Listado Morosos");
        const fechaArchivo = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `morosos-${fechaArchivo}.xlsx`);
    }
}
