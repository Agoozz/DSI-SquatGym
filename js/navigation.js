function configMenu() {
    const side = document.getElementById('nav-list-ui');

    if (rRol === 'admin') {
        side.innerHTML = `
            <div onclick="navV('inicio')" class="nav-item active" id="li-inicio">
                <i class="fas fa-home"></i> Inicio
            </div>
            <div onclick="navV('adm-planes')" class="nav-item" id="li-adm-planes">
                <i class="fas fa-tags"></i> Planes-Promociones
            </div>

            <div onclick="navV('adm-monitor')" class="nav-item" id="li-adm-monitor">
                <i class="fas fa-chart-line"></i> Informes
            </div>
            `;
    } else if (rRol === 'secretaria') {
        side.innerHTML = `
            <div onclick="navV('inicio')" class="nav-item active" id="li-inicio">
                <i class="fas fa-home"></i> Inicio
            </div>

            <div onclick="navV('adm-membresia')" class="nav-item" id="li-adm-membresia">
                <i class="fas fa-users"></i> Gestión Alumnos
            </div>

            <div onclick="navV('adm-reclamos')" class="nav-item" id="li-adm-reclamos">
                <i class="fas fa-exclamation-circle"></i> Reclamos
            </div>

            <div onclick="navV('adm-kiosco')" class="nav-item" id="li-adm-kiosco">
                <i class="fas fa-store"></i> Kiosco
            </div>

            <div onclick="navV('adm-inventario')" class="nav-item" id="li-adm-inventario">
                <i class="fas fa-truck"></i> Proveedores
            </div>
            `;
    } else if (rRol === 'encargado') {
        side.innerHTML = `
            <div onclick="navV('inicio')" class="nav-item active" id="li-inicio">
                <i class="fas fa-home"></i> Inicio
            </div>

            <div onclick="navV('adm-membresia')" class="nav-item" id="li-adm-membresia">
                <i class="fas fa-id-card"></i> Cobros Alumnos
            </div>
            `;
    } else {
        side.innerHTML = `
            <div onclick="navV('inicio')" class="nav-item active" id="li-inicio">
                <i class="fas fa-home"></i> Inicio
            </div>

            <div onclick="navV('alu-pago')" class="nav-item" id="li-alu-pago">
                <i class="fas fa-user-circle"></i> Perfil
            </div>

            <div onclick="navV('alu-historial'); renderHistorial();" class="nav-item" id="li-alu-historial">
                <i class="fas fa-history"></i> Mis Pagos
            </div>
            `;
    }
}

function navV(id) {
    // Pantallas exclusivas del admin
    if (id === 'adm-monitor' && rRol !== 'admin') return;
    if (id === 'adm-planes'  && rRol !== 'admin') return;

    // Pantallas de secretaria/encargado (solo ellos y no el admin)
    const pantallasStaff = ['adm-membresia', 'adm-inventario', 'adm-reclamos'];
    if (pantallasStaff.includes(id) && rRol === 'admin') return;

    // Encargado solo puede ver inicio y adm-membresia
    const pantallasEncargado = ['inicio', 'adm-membresia'];
    if (rRol === 'encargado' && !pantallasEncargado.includes(id)) return;

    if (id === "adm-monitor") renderInformes();
    if(id === "adm-planes")     abrirModalPrecios();
    if (id === "adm-membresia") setTimeout(filtrarSocios, 50);
    if (id === "adm-inventario") setTimeout(filtrarInventario, 50);
    if (id === "adm-reclamos") setTimeout(renderReclamos, 50);

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));

    document.getElementById(`v-${id}`).classList.add('active');

    const item = document.getElementById(`li-${id}`);
    if (item) item.classList.add('active');

    document.getElementById('header-view-title').innerText =
        `Gestión / ${id.replace('adm-', '').toUpperCase()}`;

    document.querySelector('.view-scroller').scrollTo(0, 0);
}

// Mostrar toast de acceso denegado
function mostrarToast(mensaje, tipo) {
    const toast = document.createElement('div');
    const colorFondo = (tipo === 'error') ? '#ef4444' : '#22c55e'; // Rojo o Verde
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colorFondo};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 900;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
      `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function quickAction() {
    if (rRol === 'admin') {
        navV('adm-monitor');
    }
}

