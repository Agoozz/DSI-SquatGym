function configMenu() {
      const side = document.getElementById('nav-list-ui');

      side.innerHTML = (rRol === 'admin' ? 
      `
      <div onclick="navV('inicio')" class="nav-item active" id="li-inicio">
          <i class="fas fa-home"></i> Inicio
      </div>

      <div onclick="navV('adm-membresia')" class="nav-item" id="li-adm-membresia">
          <i class="fas fa-receipt"></i> Cobros Alumnos
      </div>

      <div onclick="navV('adm-kiosco')" class="nav-item" id="li-adm-kiosco">
          <i class="fas fa-store"></i> Kiosco
      </div>

      <div onclick="navV('adm-inventario')" class="nav-item" id="li-adm-inventario">
          <i class="fas fa-truck"></i> Proveedores
      </div>

      <div onclick="navV('adm-monitor')" class="nav-item" id="li-adm-monitor">
          <i class="fas fa-chart-line"></i> Informes
      </div>
      `
      :
      `
      <div onclick="navV('inicio')" class="nav-item active" id="li-inicio">
          <i class="fas fa-home"></i> Inicio
      </div>

      <div onclick="navV('alu-pago')" class="nav-item" id="li-alu-pago">
          <i class="fas fa-user-circle"></i> Perfil
      </div>

      <div onclick="navV('alu-historial'); renderHistorial();" class="nav-item" id="li-alu-historial">
          <i class="fas fa-history"></i> Mis Pagos
      </div>

      <div onclick="navV('alu-notificaciones'); renderNotificaciones();" class="nav-item" id="li-alu-notificaciones">
          <i class="fas fa-bell"></i> Notificaciones
          <span id="badge-notif" style="margin-left:auto;background:#f97316;color:white;font-size:8px;font-weight:900;padding:1px 6px;border-radius:9999px;">3</span>
      </div>

      <div onclick="navV('alu-tienda')" class="nav-item" id="li-alu-tienda">
          <i class="fas fa-shopping-basket"></i> Kiosco
      </div>
      `
      );
  }

function navV(id) {
      if(id === "adm-monitor")    renderInformes();
      if(id === "adm-membresia") setTimeout(filtrarSocios, 50);
      if(id === "adm-inventario") setTimeout(filtrarInventario, 50);

      document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));

      document.getElementById(`v-${id}`).classList.add('active');

      const item = document.getElementById(`li-${id}`);
      if(item) item.classList.add('active');

      document.getElementById('header-view-title').innerText =
          `Gestión / ${id.replace('adm-','').toUpperCase()}`;

      document.querySelector('.view-scroller').scrollTo(0,0);
  }

function quickAction() { navV('adm-monitor'); }
