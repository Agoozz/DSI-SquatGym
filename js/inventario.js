function filtrarInventario() {
      const busq  = document.getElementById('inv-search').value.toLowerCase();
      const orden = document.getElementById('inv-filter-orden').value;
      const cat   = document.getElementById('inv-filter-cat').value;

      let lista = inventarioDB.filter(p => {
          const matchBusq = p.nombre.toLowerCase().includes(busq) || p.proveedor.toLowerCase().includes(busq);
          const matchCat  = cat === "todos" || p.cat === cat;
          return matchBusq && matchCat;
      });

      if (orden === 'nombre')      lista.sort((a,b) => a.nombre.localeCompare(b.nombre));
      if (orden === 'margen') {
            lista.sort((a,b) => {
                const margenA = ((a.precio - a.costo) / a.precio) * 100;
                const margenB = ((b.precio - b.costo) / b.precio) * 100;
                return margenB - margenA;
            });
        }
      if (orden === 'egreso-desc') lista.sort((a,b) => b.costo - a.costo);
      if (orden === 'vencimiento') lista.sort((a,b) => new Date(a.vencimiento) - new Date(b.vencimiento));

      // Actualizar KPIs
      const pendientes = inventarioDB.filter(p => p.estado === 'Pendiente').length;
      const egresoTotal = inventarioDB.reduce((s,p) => s + p.costo, 0);
      const margenProm  = Math.round(inventarioDB.reduce((s,p) => s + ((p.precio - p.costo) / p.precio * 100), 0) / inventarioDB.length);
      const kpiP = document.getElementById('kpi-pendientes'); if(kpiP) kpiP.innerText = pendientes;
      const kpiE = document.getElementById('kpi-egreso'); if(kpiE) kpiE.innerText = '$' + egresoTotal.toLocaleString();
      const kpiM = document.getElementById('kpi-margen'); if(kpiM) kpiM.innerText = margenProm + '%';

      const today = new Date();
      const tbody = document.getElementById('tabla-inventario-body');
      tbody.innerHTML = lista.map((p, idx) => {
          const esPendiente = p.estado === 'Pendiente';
          const margen = Math.round((p.precio - p.costo) / p.precio * 100);
          const margenColor = margen >= 50 ? '#4ade80' : margen >= 30 ? '#facc15' : '#f87171';
          const venc = new Date(p.vencimiento);
          const diasVenc = Math.ceil((venc - today) / (1000*60*60*24));
          const vencStr = venc.toLocaleDateString('es-AR', {day:'2-digit', month:'short', year:'numeric'});
          const vencColor = diasVenc < 30 ? '#f87171' : diasVenc < 90 ? '#facc15' : '#64748b';
          return `
          <tr class="hover:bg-orange-500/5 transition">
              <td class="p-4 text-white font-black">${p.nombre}</td>
              <td class="p-4 text-slate-400 text-[10px] font-black">${p.proveedor}</td>
              <td class="p-4 text-red-400 font-black">$${p.costo.toLocaleString()}</td>
              <td class="p-4 text-green-400 font-black">$${p.precio.toLocaleString()}</td>
              <td class="p-4 font-black" style="color:${margenColor}">${margen}%</td>
              <td class="p-4 text-[10px] font-black" style="color:${vencColor}">${vencStr}</td>
              <td class="p-4">
                  <span style="padding:2px 10px;border-radius:9999px;font-size:9px;font-weight:900;text-transform:uppercase;
                      background:${esPendiente ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)'};
                      color:${esPendiente ? '#f87171' : '#4ade80'};
                      border:1px solid ${esPendiente ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'};">
                      ${p.estado}
                  </span>
              </td>
              <td class="p-4 text-right">
                  ${esPendiente
                      ? `<button onclick="pagarProveedor(${inventarioDB.indexOf(p)})"
                          style="padding:5px 14px;border-radius:9999px;background:var(--naranja);color:white;font-size:9px;font-weight:900;text-transform:uppercase;border:none;cursor:pointer;">
                          Pagar
                         </button>`
                      : `<span style="font-size:9px;color:#4ade80;font-weight:900;">✔ Pagado</span>`
                  }
              </td>
          </tr>`;
      }).join('');
  }

function pagarProveedor(idx) {
      const p = inventarioDB[idx];
      if (!p || p.estado === 'Pagado') return;
      abrirM('modal-pago-proveedor');
      document.getElementById('prov-pago-nombre').innerText = p.nombre;
      document.getElementById('prov-pago-proveedor').innerText = p.proveedor;
      document.getElementById('prov-pago-monto').innerText = '$' + p.costo.toLocaleString();
      window._provIdx = idx;
  }
function confirmarPagoProveedor() {
      const idx = window._provIdx;
      const metodo = document.getElementById('prov-metodo').value;
      if (idx === undefined || !inventarioDB[idx]) return;
      inventarioDB[idx].estado = 'Pagado';
      cerrarM();
      setTimeout(() => {
          filtrarInventario();
          alert(`Pago a ${inventarioDB[idx].proveedor} registrado por ${metodo} ✔`);
      }, 100);
  }

