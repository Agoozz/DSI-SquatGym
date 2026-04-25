function renderInformes(){
      const mesSel  = document.getElementById('inf-mes-sel')?.value  || '2026-04';
      const tipoSel = document.getElementById('inf-tipo-sel')?.value || 'todos';

      const filtradas = transacciones.filter(t => {
          const matchMes  = t.fecha && t.fecha.startsWith(mesSel);
          const matchTipo = tipoSel === 'todos' || t.concepto === tipoSel;
          return matchMes && matchTipo;
      });

      // KPIs por método
      const totales = { QR: 0, Transferencia: 0, Efectivo: 0, Tarjeta: 0 };
      filtradas.forEach(t => { if (totales[t.tipo] !== undefined) totales[t.tipo] += t.monto; });
      const totalMes = Object.values(totales).reduce((s,v) => s+v, 0);

      const qrEl = document.getElementById('inf-qr');         if(qrEl) qrEl.innerText = '$' + totales.QR.toLocaleString();
      const trEl = document.getElementById('inf-transfer');    if(trEl) trEl.innerText = '$' + totales.Transferencia.toLocaleString();
      const efEl = document.getElementById('inf-efectivo');    if(efEl) efEl.innerText = '$' + totales.Efectivo.toLocaleString();
      const taEl = document.getElementById('inf-tarjeta');     if(taEl) taEl.innerText = '$' + totales.Tarjeta.toLocaleString();
      const totEl = document.getElementById('inf-total-mes');  if(totEl) totEl.innerText = '$' + totalMes.toLocaleString();
      const cntEl = document.getElementById('inf-count-mes');  if(cntEl) cntEl.innerText = filtradas.length;

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
          const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' });
          const mColor = metodoColor[t.tipo] || 'text-white';
          const cColor = conceptoColor[t.concepto] || 'text-slate-400';
          return `
          <tr class="hover:bg-orange-500/5 transition">
              <td class="p-3 text-slate-500">${i+1}</td>
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

 function generarCorteCaja(){
      const mesSel  = document.getElementById('inf-mes-sel')?.value  || '2026-04';
      const tipoSel = document.getElementById('inf-tipo-sel')?.value || 'todos';
      const [anio, mes] = mesSel.split('-');
      const nombreMes = new Date(parseInt(anio), parseInt(mes)-1, 1)
          .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

      const filtradas = transacciones.filter(t => {
          const matchMes  = t.fecha && t.fecha.startsWith(mesSel);
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
              const fechaStr = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'short' });
              return `<tr class="border-b border-slate-800 text-xs hover:bg-orange-500/5">
                  <td class="p-2">${i+1}</td>
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

  function generarInforme(){
      generarCorteCaja();
  }
function generarListadoMorosos(){
      const fecha = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });
      const morosos = [...sociosDB]
          .filter(s => s.deuda > 0)
          .sort((a,b) => b.deuda - a.deuda);

      const totalDeuda = morosos.reduce((s, m) => s + m.deuda, 0);

      const filas = morosos.map((s, i) => `
          <tr class="border-b border-slate-800 hover:bg-red-500/5">
              <td class="p-3 text-xs font-black text-slate-400">${i+1}</td>
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
      abrirM('modal-informe');
  }
