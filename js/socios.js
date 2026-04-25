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
