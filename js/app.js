async function cargarPantallas() {
  const pantallas = [
    "inicio",
    "adm-membresia",
    "adm-monitor",
    "alu-pago",
    "alu-historial",
    "alu-notificaciones",
    "adm-inventario",
    "alu-tienda",
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


  function setLoginUIRol(rol){

  rRol = rol;

  const staff = document.getElementById("l-btn-staff");
  const alumno = document.getElementById("l-btn-alumno");

  staff.classList.remove("role-active");
  alumno.classList.remove("role-active");

  staff.classList.add("bg-[#0f172a]","text-[#64748b]");
  alumno.classList.add("bg-[#0f172a]","text-[#64748b]");

  if(rol === "admin"){
      staff.classList.add("role-active");
      staff.classList.remove("bg-[#0f172a]","text-[#64748b]");
  } else {
      alumno.classList.add("role-active");
      alumno.classList.remove("bg-[#0f172a]","text-[#64748b]");
  }
}

  function buscarCliente(){
      const dni = document.getElementById("dni-input").value;
      let c;

      if(dni === "" || !clientes[dni]){
          
          c = Object.values(clientes)[0];
      }else{
          c = clientes[dni];
      }

      document.getElementById("cliente-box").classList.remove("hidden");

      document.getElementById("cliente-nombre").innerText = c.nombre;
      document.getElementById("cliente-id").innerText = c.id;

      renderDeudas(c.deudas);
  }

  let deudasSeleccionadas = [];

  function renderDeudas(deudas){
      const cont = document.getElementById("lista-deudas");

      cont.innerHTML = deudas.map((d,i)=>`
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

  function toggleDeuda(i, monto, checkbox){
      if(checkbox.checked){
          totalCobro += monto;
      }else{
          totalCobro -= monto;
      }

      updateTotal();
  }

  function updateTotal(){
      const el = document.getElementById("total-cobro");

      el.innerText = "$" + totalCobro;

      el.classList.add("scale-110");
      setTimeout(()=> el.classList.remove("scale-110"), 150);
  }

  function abrirTerminal(){
      if(totalCobro === 0){
          alert("Seleccioná al menos una cuota");
          return;
      }

      abrirM('modal-pago-selector', 'cuota');
  }

  function abrirModalInforme(titulo, contenidoHTML) {
      document.getElementById('modal-informe-titulo').innerText = titulo;
      document.getElementById('reporte-tablas').innerHTML = contenidoHTML;
      abrirM('modal-informe');
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

  function entrarApp() {
      document.getElementById('login-frame').style.display = 'none';
      document.getElementById('sidebar-ui').classList.remove('hidden');
      document.getElementById('app-container').classList.remove('hidden');
      document.body.classList.add('flex');
      const sTxt = document.getElementById('txt-saludo'); const hTag = document.getElementById('hero-tag'); const hTitle = document.getElementById('hero-title'); const hFrame = document.getElementById('hero-inicio');
      const sDashboard = document.getElementById('staff-home-dashboard'); const cGallery = document.getElementById('client-home-gallery');
      const bStaffHero = document.getElementById('btn-hero-action'); const bClientProfile = document.getElementById('btn-goto-profile');
      const btnEf = document.getElementById("btn-efectivo");

      if(btnEf){
          btnEf.style.display = (rRol === "admin") ? "block" : "none";
      }
      if(rRol === 'admin') {
          sTxt.innerText = '¡Hola, Melisa!'; hTag.innerText = 'Centro de Mandos v35.0'; hTitle.innerHTML = 'Gestión Global <br><span class="text-orange-500 italic italic">SquatGym Platinum.</span>';
          hFrame.style.backgroundImage = "linear-gradient(to right, rgba(2,6,23,0.98), rgba(2,6,23,0.5)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1200')";
          sDashboard.classList.remove('hidden'); cGallery.classList.add('hidden'); bStaffHero.classList.remove('hidden'); bClientProfile.classList.add('hidden');
          document.getElementById('header-username').innerText = '👤 Melisa — Staff';
      } else {
          sTxt.innerText = '¡Hola, Valentino!'; hTag.innerText = 'Socio Platinum Élite'; hTitle.innerHTML = 'Disciplina <br><span class="text-orange-500 italic italic">Sin Límites.</span>';
          hFrame.style.backgroundImage = "linear-gradient(to right, rgba(2,6,23,0.98), rgba(2,6,23,0.4)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200')";
          sDashboard.classList.add('hidden'); cGallery.classList.remove('hidden'); bStaffHero.classList.add('hidden'); bClientProfile.classList.remove('hidden');
          document.getElementById('header-username').innerText = '👤 Valentino — Cliente';
      }
      configMenu(); navV('inicio'); renderMarketCatalog();
    
      if(rRol === 'admin') setTimeout(renderizarAlertasStaff, 100);
      if(rRol === 'alumno') setTimeout(renderizarAlertaCliente, 100);
      const btn = document.getElementById("btn-kiosco-accion");

      if(btn){
          if(rRol === "admin"){
              btn.innerText = "Cobrar";
              btn.onclick = () => abrirM('modal-cobro-kiosco');
          }else{
              btn.innerText = "Pagar";
              btn.onclick = () => abrirM('modal-pago-selector','kiosco');
          }
      }
      const btnEntregas = document.getElementById('btn-entregas');

      if(btnEntregas){
          if (rRol === 'admin') {
              btnEntregas.style.display = 'flex';
          } else {
              btnEntregas.style.display = 'none';
          }
      }
  }

  
  
  
  function irQR() { irAPagoReal('qr'); }
  function irTransfer() { alert('Información bancaria copiada.'); }
  function irAPagoReal(type) { cerrarM(); abrirM(type==='qr'?'modal-mp-qr':'modal-bank-transfer'); }


  function renderMarketCatalog(filtro = "") {
      const g = document.getElementById('catalog-alu-grid');
      if (!g) return;

      const productosFiltrados = pDBKiosco.filter(p =>
          p.n.toLowerCase().includes(filtro.toLowerCase())
      );

      g.innerHTML = productosFiltrados.map(p => {
          const pts = Math.floor(p.p / 100);

          return `
          <div class="k-item" onclick="addMarketItem('${p.n}', ${p.p})">
              <div class="k-img" style="background-image: url('${p.i}')"></div>
              <p class="font-black text-[8px] uppercase text-white">${p.n}</p>
              <span class="text-orange-500 font-black">$${p.p}</span>
              <p class="text-[8px] text-blue-400 font-black">★ +${pts}</p>
          </div>
          `;
      }).join('');
  }

  function filtrarProductos(){
      const texto = document.getElementById("buscador-productos").value;
      renderMarketCatalog(texto);
  }

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

  function addMarketItem(n, p, el) {
      itemsCAlu.push({n, p});
      tAluK += p;
      updateMarketCart();

      el.classList.add("added");
      setTimeout(() => el.classList.remove("added"), 300);
  }
  function removeItemM(i){
      tAluK -= itemsCAlu[i].p;
      itemsCAlu.splice(i,1);
      updateMarketCart();
  }
  function updateMarketCart() {
      const b = document.getElementById('alu-cart-body');
      const descuento = parseInt(document.getElementById('alu-redeem-select')?.value || 0);

      if (itemsCAlu.length === 0) {
          b.innerHTML = `<p class="text-slate-600 text-center text-xs py-4">Carrito vacío</p>`;
          document.getElementById('alu-total-f').innerText = "$0";
          return;
      }

      // agrupar ítems por nombre
      const agrupado = {};
      itemsCAlu.forEach(it => {
          if (!agrupado[it.n]) agrupado[it.n] = { n: it.n, p: it.p, qty: 0 };
          agrupado[it.n].qty++;
      });

      b.innerHTML = Object.values(agrupado).map((it, idx) => `
          <div class="flex justify-between items-center py-2 px-1 border-b border-slate-800/60">
              <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black text-white truncate">${it.n}</p>
                  <p class="text-[9px] text-slate-500">$${(it.p * it.qty).toLocaleString()}</p>
              </div>
              <div class="flex items-center gap-1.5 ml-2">
                  <button onclick="decrementItem('${it.n}')"
                      style="background:#c2a8a8; color:#222; width:22px; height:22px; border-radius:6px; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;">−</button>
                  <span class="text-xs font-black text-white w-5 text-center">${it.qty}</span>
                  <button onclick="incrementItem('${it.n}', ${it.p})"
                      style="background:#a8c2aa; color:#222; width:22px; height:22px; border-radius:6px; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;">+</button>
              </div>
          </div>
      `).join('');

      const subtotal = itemsCAlu.reduce((s, it) => s + it.p, 0);
      const total = Math.max(0, subtotal - descuento);
      document.getElementById('alu-total-f').innerText = "$" + total.toLocaleString();
      tAluK = total;
  }

  function incrementItem(nombre, precio) {
      itemsCAlu.push({ n: nombre, p: precio });
      tAluK += precio;
      updateMarketCart();
  }

  function decrementItem(nombre) {
      const idx = itemsCAlu.findLastIndex ? itemsCAlu.findLastIndex(it => it.n === nombre) : [...itemsCAlu].reverse().findIndex(it => it.n === nombre);
      const realIdx = itemsCAlu.findLastIndex ? idx : itemsCAlu.length - 1 - idx;
      if (realIdx >= 0) {
          tAluK -= itemsCAlu[realIdx].p;
          itemsCAlu.splice(realIdx, 1);
      }
      updateMarketCart();
  }

  function filtrarSocios() {
      const busq   = document.getElementById('search-socio').value.toLowerCase();
      const estado = document.getElementById('filter-estado').value;
      const clase  = document.getElementById('filter-clase').value;
      const orden  = document.getElementById('filter-orden').value;

      let lista = sociosDB.filter(s => {
          const matchBusq  = s.nombre.toLowerCase().includes(busq) || s.dni.includes(busq);
          const matchEstado = estado === 'todos' || s.estado === estado;
          const matchClase  = clase  === 'todos' || s.clase  === clase;
          return matchBusq && matchEstado && matchClase;
      });

      if (orden === 'nombre')  lista.sort((a,b) => a.nombre.localeCompare(b.nombre));
      if (orden === 'monto')   lista.sort((a,b) => b.deuda - a.deuda);
      if (orden === 'estado')  lista.sort((a,b) => a.estado.localeCompare(b.estado));

      const tbody = document.getElementById('tabla-socios-body');
      tbody.innerHTML = lista.map(s => `
          <tr class="hover:bg-orange-500/5 transition">
              <td class="p-4 text-white font-black">${s.nombre}</td>
              <td class="p-4 text-slate-400">${s.dni}</td>
              <td class="p-4 text-slate-300">${s.clase}</td>
              <td class="p-4 font-black ${s.deuda > 0 ? 'text-red-400' : 'text-slate-500'}">${s.deuda > 0 ? '$' + s.deuda.toLocaleString() : '—'}</td>
              <td class="p-4">
                  <span style="padding:2px 10px; border-radius:9999px; font-size:9px; font-weight:900; text-transform:uppercase;
                      background:${s.estado === 'Al día' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};
                      color:${s.estado === 'Al día' ? '#4ade80' : '#f87171'};
                      border:1px solid ${s.estado === 'Al día' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">
                      ${s.estado}
                  </span>
              </td>
              <td class="p-4 text-right">
                  <button onclick="cobrarSocio('${s.nombre}', ${s.deuda})"
                      style="padding:5px 14px; border-radius:9999px; background:var(--naranja); color:white; font-size:9px; font-weight:900; text-transform:uppercase; border:none; cursor:pointer;">
                      Cobrar
                  </button>
              </td>
          </tr>
      `).join('');
  }

  let socioActual = null; // guarda el socio que se está cobrando

  function cobrarSocio(nombre, deuda) {
      if (deuda === 0) { alert(nombre + ' está al día.'); return; }
      socioActual = sociosDB.find(s => s.nombre === nombre);
      abrirM('modal-pago-selector', 'cuota');
  }

  function verificarAccesoDNI() {
      const dni = document.getElementById('acceso-dni-input').value.trim();
      const s   = sociosDB.find(x => x.dni === dni);
      if (!s) {
          document.getElementById('acceso-check-resultado').innerHTML =
              `<p style="font-size:10px;color:#94a3b8;padding:8px;">No se encontró ningún socio con ese DNI.</p>`;
          return;
      }
      verificarAccesoSocio(s.nombre, s.deuda);
  }

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
      if (orden === 'margen')      lista.sort((a,b) => (b.precio - b.costo) - (a.precio - a.costo));
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

  function filtrarCatalogo() {
      const texto = document.getElementById('buscador-catalogo').value;
      renderMarketCatalog(texto);
  }

  function calcularVuelto(){
      const recibido = parseFloat(document.getElementById("input-efectivo").value || 0);

      const vuelto = recibido - totalCobro;

      document.getElementById("vuelto-texto").innerText =
          "Vuelto: $" + Math.max(0, vuelto);
  }

  function cerrarFlujoPago(){

      // volver a estado inicial
      const cont = document.getElementById("pago-contenido");
      const opciones = document.getElementById("pago-opciones");

      if(cont) cont.classList.add("hidden");
      if(opciones) opciones.classList.remove("hidden");

      // limpiar contenido
      if(cont) cont.innerHTML = "";
  }

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

 
  function updateOrderCount() { const count = document.getElementById('staff-orders-queue').querySelectorAll('.glass-card').length; document.getElementById('kiosco-count-inicio').innerText = count; }
  
  function searchSocioStaff() { document.getElementById('staff-socio-result').classList.remove('hidden'); }
  function irTransfer(){
      cerrarM();
      abrirM('modal-transferencia');
  }

  function copiarAlias(){
      navigator.clipboard.writeText("squat.gym.fit");
      alert("Alias copiado");
  }

 

  function selectRol(rol){

      rRol = rol;

      const staff = document.getElementById("btn-staff");
      const client = document.getElementById("btn-client");

      // reset
      staff.classList.remove("bg-orange-500","text-white");
      client.classList.remove("bg-orange-500","text-white");

      // activar seleccionado
      if(rol === "admin"){
          staff.classList.add("bg-orange-500","text-white");
      } else {
          client.classList.add("bg-orange-500","text-white");
      }
  }

  function confirmarTransferencia(){

      const input = document.getElementById("input-comprobante");

      //  DEBUG
      console.log("Input encontrado:", input);

      if(!input){
          alert("Error interno: no se encontró el campo");
          return;
      }

      const comp = input.value.trim();

      if(comp === ""){
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
      cerrarM();
      setTimeout(() => abrirM('modal-recibo'), 150);
  }

  function imprimirRecibo() {
      window.print();
  }

  // ══════════════════════════════════════════════
  // PUNTO 2 — ALERTAS DE VENCIMIENTO Y DEUDA
  // ══════════════════════════════════════════════
  const alertasVencimiento = [
      { nombre: "Rodrigo Sosa",     dni: "55443322", dias: -3,  deuda: 23000 },
      { nombre: "Valentino Perez",  dni: "12345678", dias: -10, deuda: 31500 },
      { nombre: "Matías Alvarez",   dni: "77889900", dias: 2,   deuda: 10000 },
      { nombre: "Juan Romero",      dni: "33221100", dias: 5,   deuda: 12500 },
  ];

  function renderizarAlertasStaff() {
      const panel = document.getElementById('panel-alertas-staff');
      if (!panel) return;
      panel.innerHTML = alertasVencimiento.map(a => {
          const vencido = a.dias < 0;
          const pronto  = a.dias >= 0 && a.dias <= 5;
          const color   = vencido ? 'border-red-500 bg-red-500/5' : 'border-yellow-500 bg-yellow-500/5';
          const badge   = vencido
              ? `<span style="padding:2px 8px;border-radius:9999px;font-size:8px;font-weight:900;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)">VENCIDA hace ${Math.abs(a.dias)}d</span>`
              : `<span style="padding:2px 8px;border-radius:9999px;font-size:8px;font-weight:900;background:rgba(234,179,8,0.15);color:#facc15;border:1px solid rgba(234,179,8,0.3)">VENCE en ${a.dias}d</span>`;
          return `
          <div class="glass-card p-4 border-l-4 ${color} flex justify-between items-center">
              <div class="flex items-center gap-3">
                  <i class="fas fa-bell text-sm ${vencido ? 'text-red-400' : 'text-yellow-400'}"></i>
                  <div>
                      <p class="text-xs font-black text-white">${a.nombre}</p>
                      <p class="text-[9px] text-slate-500">DNI ${a.dni} · Deuda: <span class="text-red-400 font-black">$${a.deuda.toLocaleString()}</span></p>
                  </div>
              </div>
              <div class="flex items-center gap-3">
                  ${badge}
                  <button onclick="cobrarSocio('${a.nombre}', ${a.deuda})"
                      style="padding:4px 12px;border-radius:9999px;background:var(--naranja);color:white;font-size:8px;font-weight:900;text-transform:uppercase;border:none;cursor:pointer;">
                      Cobrar
                  </button>
              </div>
          </div>`;
      }).join('');
  }

  function renderizarAlertaCliente() {
      // Cuota Mayo pendiente → simula deuda activa para Valentino
      const bannerAlerta = document.getElementById('banner-alerta-cliente');
      const bannerRestr  = document.getElementById('banner-restriccion-cliente');
      if (!bannerAlerta || !bannerRestr) return;

      // Alerta de vencimiento próximo
      bannerAlerta.innerHTML = `
          <div class="glass-card p-4 border-l-4 border-yellow-500 bg-yellow-500/5 flex items-center gap-4">
              <i class="fas fa-exclamation-circle text-yellow-400 text-xl flex-shrink-0"></i>
              <div>
                  <p class="text-xs font-black text-yellow-300 uppercase">Cuota Mayo vence el 10/05/2025</p>
                  <p class="text-[9px] text-slate-400">Evitá restricciones abonando antes del vencimiento.</p>
              </div>
              <button onclick="abrirM('modal-pago-selector','cuota')"
                  class="btn-ui btn-naranja text-[9px] px-4 py-2 ml-auto flex-shrink-0">Pagar ahora</button>
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

  // ══════════════════════════════════════════════
  // PUNTO 4 — PRORRATEO
  // ══════════════════════════════════════════════
  function calcularProrrateo() {
      const cuota  = parseFloat(document.getElementById('pro-cuota').value) || 0;
      const fechaV = document.getElementById('pro-fecha').value;
      if (!cuota || !fechaV) return;

      const fecha      = new Date(fechaV);
      const año        = fecha.getFullYear();
      const mes        = fecha.getMonth();
      const diasMes    = new Date(año, mes + 1, 0).getDate();
      const diaAlta    = fecha.getDate();
      const diasCobrar = diasMes - diaAlta + 1;
      const valorDia   = cuota / diasMes;
      const total      = Math.round(valorDia * diasCobrar);

      document.getElementById('pro-dias-mes').innerText    = diasMes;
      document.getElementById('pro-dias-cobrar').innerText = diasCobrar;
      document.getElementById('pro-valor-dia').innerText   = '$' + valorDia.toFixed(2);
      document.getElementById('pro-total').innerText       = '$' + total.toLocaleString();
      document.getElementById('pro-resultado').classList.remove('hidden');
  }

  function toggleProrrateo() {
      const panel = document.getElementById('panel-prorrateo');
      const icon  = document.getElementById('icon-toggle-pro');
      const btn   = document.getElementById('btn-toggle-pro');
      const oculto = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      icon.className = oculto ? 'fas fa-chevron-up mr-1' : 'fas fa-chevron-down mr-1';
      btn.innerHTML  = oculto
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
      const montoStr = totalEl.innerText.replace('$','').replace('.','').replace(',','.');
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
  registrarPagoExitoso = function(metodo) {
      const nombre = socioActual ? socioActual.nombre : 'Socio';
      const monto  = socioActual ? socioActual.deuda  : totalCobro;
      _registrarPagoExitosoOrig(metodo);
      generarRecibo(nombre, monto, metodo);
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
      {n:"Agua 1.5L",       p:1000, i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png", cat:"Bebidas",     stock:24},
      {n:"Lata Energ.",     p:2500, i:"https://cdn-icons-png.flaticon.com/512/2443/2443653.png", cat:"Bebidas",     stock:12},
      {n:"Gatorade Blue",   p:1400, i:"https://cdn-icons-png.flaticon.com/512/3100/3100551.png", cat:"Bebidas",     stock:8},
      {n:"Proteína Whey",   p:5500, i:"https://cdn-icons-png.flaticon.com/512/3050/3050162.png", cat:"Suplementos", stock:5},
      {n:"Creatina Mon.",   p:4800, i:"https://cdn-icons-png.flaticon.com/512/3050/3050186.png", cat:"Suplementos", stock:3},
      {n:"Barra Proteica",  p:1200, i:"https://cdn-icons-png.flaticon.com/512/1046/1046784.png", cat:"Snacks",      stock:18},
      {n:"Banana",          p:800,  i:"https://cdn-icons-png.flaticon.com/512/3075/3075977.png", cat:"Snacks",      stock:15},
      {n:"Mix Frutos",      p:2000, i:"https://cdn-icons-png.flaticon.com/512/1046/1046857.png", cat:"Snacks",      stock:10},
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
          b.classList.remove('border-orange-500','text-orange-400','border-green-500','text-green-400','border-blue-500','text-blue-400','border-purple-500','text-purple-400');
      });
      const colores = { Efectivo: ['border-green-500','text-green-400'], QR: ['border-blue-500','text-blue-400'], Transferencia: ['border-purple-500','text-purple-400'], Tarjeta: ['border-orange-500','text-orange-400'] };
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
      if (recEl) recEl.innerText = '$' + staffVentasTurno.reduce((s,v)=>s+v.total,0).toLocaleString();
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
          const metodoColor = { Efectivo:'text-green-400', QR:'text-blue-400', Transferencia:'text-purple-400', Tarjeta:'text-orange-400' }[v.metodo] || 'text-white';
          const resumen = Object.values(v.items.reduce((a,it)=>{ a[it.n]=(a[it.n]||{n:it.n,q:0}); a[it.n].q++; return a; },{})).map(x=>`${x.n}×${x.q}`).join(', ');
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
          b.classList.remove('border-orange-500','text-orange-400','border-green-500','text-green-400','border-blue-500','text-blue-400','border-purple-500','text-purple-400');
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
      const itemsHTML = Object.values(venta.items.reduce((a,it)=>{ a[it.n]=(a[it.n]||{n:it.n,p:it.p,q:0}); a[it.n].q++; return a; },{}))
          .map(x => `<div class="flex justify-between"><span>${x.n} ×${x.q}</span><span class="font-black">$${(x.p*x.q).toLocaleString()}</span></div>`).join('');
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
      const total = Object.values(metodos).reduce((s,v)=>s+v,0);
      el.innerHTML = `
          <div class="space-y-2">
              ${Object.entries(metodos).map(([m,v])=>`
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
  navV = function(id) {
      _navVOrig(id);
      if (id === 'adm-kiosco') {
          renderCatalogoStaff();
          selMetodoStaff('Efectivo');
      }
      if (id === 'adm-kiosco') recalcStaffCart();
  };

  // Patch: abrir cierre turno rellena contenido
  const _abrirMOrig = abrirM;
  abrirM = function(id, ctx) {
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
      const total = staffVentasTurno.reduce((s,v) => s+v.total, 0);
      const count = staffVentasTurno.length;
      const prom = count > 0 ? Math.round(total / count) : 0;
      const recEl = document.getElementById('kiosco-recaudado-hoy'); if(recEl) recEl.innerText = '$' + total.toLocaleString();
      const cntEl = document.getElementById('kiosco-ventas-count'); if(cntEl) cntEl.innerText = count;
      const promEl = document.getElementById('kiosco-ticket-prom'); if(promEl) promEl.innerText = '$' + prom.toLocaleString();
      const acumEl = document.getElementById('kiosco-total-acum'); if(acumEl) acumEl.innerText = '$' + total.toLocaleString();
      const desgEl = document.getElementById('kiosco-desglose');
      if (desgEl) {
          const metodos = { Efectivo: 0, QR: 0, Transferencia: 0, Tarjeta: 0 };
          staffVentasTurno.forEach(v => { if(metodos[v.metodo] !== undefined) metodos[v.metodo] += v.total; });
          const colores = { Efectivo:'text-green-400', QR:'text-blue-400', Transferencia:'text-purple-400', Tarjeta:'text-orange-400' };
          desgEl.innerHTML = Object.entries(metodos).map(function(e) {
              return '<div class="flex justify-between items-center"><span class="text-[10px] font-black text-slate-400">' + e[0] + '</span><span class="text-[10px] font-black ' + colores[e[0]] + '">$' + e[1].toLocaleString() + '</span></div>';
          }).join('');
      }
  }

  // ══════════════════════════════════════════════
  // HISTORIAL DE PAGOS DEL CLIENTE (req. 3.1.24)
  // ══════════════════════════════════════════════
  const historialPagosCliente = [
      { id: 'REC-240001', fecha: '2025-10-05', concepto: 'Cuota Octubre 2025',  metodo: 'QR',           monto: 11000, estado: 'Pagado' },
      { id: 'REC-240002', fecha: '2025-10-18', concepto: 'Kiosco',              metodo: 'Efectivo',      monto: 3200,  estado: 'Pagado' },
      { id: 'REC-240003', fecha: '2025-11-03', concepto: 'Cuota Noviembre 2025',metodo: 'Transferencia', monto: 11000, estado: 'Pagado' },
      { id: 'REC-240004', fecha: '2025-11-22', concepto: 'Kiosco',              metodo: 'QR',            monto: 1400,  estado: 'Pagado' },
      { id: 'REC-240005', fecha: '2025-12-04', concepto: 'Cuota Diciembre 2025',metodo: 'QR',            monto: 11500, estado: 'Pagado' },
      { id: 'REC-240006', fecha: '2026-01-07', concepto: 'Cuota Enero 2026',    metodo: 'Tarjeta',       monto: 12000, estado: 'Pagado' },
      { id: 'REC-240007', fecha: '2026-01-15', concepto: 'Kiosco',              metodo: 'Efectivo',      monto: 4800,  estado: 'Pagado' },
      { id: 'REC-240008', fecha: '2026-02-05', concepto: 'Cuota Febrero 2026',  metodo: 'QR',            monto: 12000, estado: 'Pagado' },
      { id: 'REC-240009', fecha: '2026-03-06', concepto: 'Cuota Marzo 2026',    metodo: 'Transferencia', monto: 12500, estado: 'Pagado' },
      { id: 'REC-240010', fecha: '2026-04-04', concepto: 'Cuota Abril 2026',    metodo: 'QR',            monto: 12500, estado: 'Pagado' },
      { id: 'REC-240011', fecha: '2026-04-14', concepto: 'Kiosco',              metodo: 'Efectivo',      monto: 1200,  estado: 'Pagado' },
      { id: 'REC-PEND-1', fecha: '2026-05-01', concepto: 'Cuota Mayo 2026',     metodo: '—',             monto: 12500, estado: 'Pendiente' },
  ];

  const metodoBadge = {
      'QR':           { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.3)'  },
      'Transferencia':{ bg: 'rgba(168,85,247,0.12)', color: '#c084fc',  border: 'rgba(168,85,247,0.3)' },
      'Tarjeta':      { bg: 'rgba(249,115,22,0.12)', color: '#fb923c',  border: 'rgba(249,115,22,0.3)'  },
      'Efectivo':     { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80',  border: 'rgba(34,197,94,0.3)'   },
      '—':            { bg: 'rgba(100,116,139,0.12)',color: '#94a3b8',  border: 'rgba(100,116,139,0.3)' },
  };

  function renderHistorial() {
      const tipo   = document.getElementById('hist-filter-tipo')?.value   || 'todos';
      const metodo = document.getElementById('hist-filter-metodo')?.value || 'todos';
      const orden  = document.getElementById('hist-filter-orden')?.value  || 'fecha-desc';

      let lista = historialPagosCliente.filter(p => {
          const matchTipo   = tipo   === 'todos' || p.concepto.startsWith(tipo);
          const matchMetodo = metodo === 'todos' || p.metodo === metodo;
          return matchTipo && matchMetodo;
      });

      if (orden === 'fecha-desc')  lista.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
      if (orden === 'fecha-asc')   lista.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
      if (orden === 'monto-desc')  lista.sort((a,b) => b.monto - a.monto);

      const tbody = document.getElementById('tabla-historial-body');
      if (!tbody) return;

      tbody.innerHTML = lista.map(p => {
          const pagado   = p.estado === 'Pagado';
          const mb       = metodoBadge[p.metodo] || metodoBadge['—'];
          const fechaFmt = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' });

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
      const fechaFmt = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });
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
  const alertasCliente = [
      {
          id: 1, tipo: 'vencimiento', icono: 'fas fa-exclamation-circle', color: '#f87171',
          borderColor: '#ef4444', bgColor: 'rgba(239,68,68,0.06)',
          titulo: 'Cuota Mayo 2026 — Vence el 10/05/2026',
          desc: 'Tenés $12.500 pendientes de pago. Abonando antes del vencimiento evitás la restricción de acceso.',
          fecha: 'Hace 2 días', leida: false,
          accion: { label: 'Pagar Ahora', fn: "abrirM('modal-pago-selector','cuota')" }
      },
      {
          id: 2, tipo: 'vencimiento', icono: 'fas fa-ban', color: '#f87171',
          borderColor: '#dc2626', bgColor: 'rgba(239,68,68,0.08)',
          titulo: 'Restricción de Acceso Activa',
          desc: 'Tu deuda supera los 15 días. Tu acceso a las instalaciones está suspendido hasta regularizar tu situación.',
          fecha: 'Hoy', leida: false,
          accion: { label: 'Ver Estado', fn: "navV('alu-pago')" }
      },
      {
          id: 3, tipo: 'promocion', icono: 'fas fa-star', color: '#fb923c',
          borderColor: '#f97316', bgColor: 'rgba(249,115,22,0.06)',
          titulo: '¡Canjeá tus SquatPoints!',
          desc: 'Tenés 1.450 puntos acumulados. Podés usar 1.000 puntos para obtener $200 de descuento en tu próxima compra en el kiosco.',
          fecha: 'Hace 3 días', leida: false,
          accion: { label: 'Ir al Kiosco', fn: "navV('alu-tienda')" }
      },
      {
          id: 4, tipo: 'promocion', icono: 'fas fa-tag', color: '#fb923c',
          borderColor: '#f97316', bgColor: 'rgba(249,115,22,0.05)',
          titulo: 'Promo Mayo: Cuota + Kiosco',
          desc: 'Pagá tu cuota de Mayo antes del 5/5 y obtené $500 de crédito en el kiosco. Válido solo por tiempo limitado.',
          fecha: 'Hace 5 días', leida: true,
          accion: { label: 'Ver Promo', fn: "abrirM('modal-pago-selector','cuota')" }
      },
      {
          id: 5, tipo: 'informacion', icono: 'fas fa-info-circle', color: '#60a5fa',
          borderColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.05)',
          titulo: 'Actualización de Precios — Junio 2026',
          desc: 'A partir del 1 de Junio la cuota mensual del plan Platinum pasará de $12.500 a $13.500. Tu débito automático se actualizará automáticamente.',
          fecha: 'Hace 1 semana', leida: true,
          accion: null
      },
      {
          id: 6, tipo: 'informacion', icono: 'fas fa-check-circle', color: '#4ade80',
          borderColor: '#22c55e', bgColor: 'rgba(34,197,94,0.05)',
          titulo: 'Pago de Abril Acreditado',
          desc: 'Tu pago de $12.500 por Cuota Abril 2026 fue acreditado correctamente el 04/04/2026 mediante QR.',
          fecha: 'Hace 3 semanas', leida: true,
          accion: { label: 'Ver Recibo', fn: "verComprobanteHistorial('REC-240010')" }
      },
  ];

  let filtroAlertaActivo = 'todas';

  function renderNotificaciones() {
      const panel = document.getElementById('panel-notificaciones');
      if (!panel) return;

      const lista = filtroAlertaActivo === 'todas'
          ? alertasCliente
          : alertasCliente.filter(a => a.tipo === filtroAlertaActivo);

      panel.innerHTML = lista.map(a => `
          <div class="glass-card p-5 border-l-4 transition-all"
              style="border-left-color:${a.borderColor};background:${a.bgColor};">
              <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style="background:${a.bgColor};border:1px solid ${a.borderColor};">
                      <i class="${a.icono}" style="color:${a.color};font-size:1rem;"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start gap-2">
                          <p class="text-xs font-black text-white leading-snug">
                              ${a.leida ? '' : '<span style="display:inline-block;width:6px;height:6px;background:#f97316;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>'}
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

      // Actualizar badge con no leídas
      const noLeidas = alertasCliente.filter(a => !a.leida).length;
      const badge = document.getElementById('badge-notif');
      if (badge) badge.innerText = noLeidas > 0 ? noLeidas : '';

      // Marcar todas como leídas al abrir
      setTimeout(() => {
          alertasCliente.forEach(a => a.leida = true);
          if (badge) badge.innerText = '';
      }, 2000);
  }

  function filtrarAlertas(tipo) {
      filtroAlertaActivo = tipo;
      document.querySelectorAll('.btn-alerta-tab').forEach(b => {
          b.style.background = '#334155';
          b.style.color = '#94a3b8';
      });
      const activo = document.getElementById('btn-alerta-' + tipo);
      if (activo) { activo.style.background = '#f97316'; activo.style.color = 'white'; }
      renderNotificaciones();
  }
