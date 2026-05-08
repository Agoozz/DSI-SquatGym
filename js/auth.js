// Base de datos simulada de usuarios
const usuariosDB = [
    // Admin
    { dni: "1", password: "admin", rol: "admin", nombre: "Admin General", sede: null },
    // Secretarias
    { dni: "2", password: "secretaria", rol: "secretaria", nombre: "S. Centro", sede: "Sede Centro" },
    { dni: "3", password: "secretaria", rol: "secretaria", nombre: "S. Norte", sede: "Sede Norte" },
    { dni: "4", password: "secretaria", rol: "secretaria", nombre: "S. Sur", sede: "Sede Sur" },
    // Encargados
    { dni: "5", password: "encargado", rol: "encargado", nombre: "E. Centro", sede: "Sede Centro" },
    { dni: "6", password: "encargado", rol: "encargado", nombre: "E. Norte", sede: "Sede Norte" },
    { dni: "7", password: "encargado", rol: "encargado", nombre: "E. Sur", sede: "Sede Sur" },
    // Alumnos (Pruebas)
    { dni: "8", password: "alumno", rol: "alumno", nombre: "Valentino P.", sede: "Sede Centro" },
    { dni: "9", password: "alumno", rol: "alumno", nombre: "Lucía Fernández", sede: "Sede Norte" },
];

// Variables globales para el estado del login
let loginRolSeleccionado = null;
let mostrarPanelRecuperacion = false;

// Mostrar u ocultar mensaje de error en el login
function mostrarErrorLogin(mensaje) {
    const errorDiv = document.getElementById('login-error-msg');
    if (mensaje) {
        errorDiv.innerHTML = `<p style="color: #ef4444; font-size: 12px; text-align: center; margin-top: 8px;">${mensaje}</p>`;
        errorDiv.style.display = 'block';
    } else {
        errorDiv.style.display = 'none';
    }
}

// Limpiar error al escribir en los inputs
function limpiarErrorAlEscribir() {
    const dniInput = document.querySelector('input[placeholder="DNI..."]');
    const passInput = document.querySelector('input[placeholder="PASSWORD"]');

    if (dniInput) {
        dniInput.addEventListener('input', () => mostrarErrorLogin(''));
    }
    if (passInput) {
        passInput.addEventListener('input', () => mostrarErrorLogin(''));
    }
}

// Validar login
function entrarApp() {
    const dniInput = document.querySelector('input[placeholder="DNI..."]');
    const passInput = document.querySelector('input[placeholder="PASSWORD"]');

    const dni = dniInput.value.trim();
    const password = passInput.value.trim();

    // Leer el subrol seleccionado en la nueva UI (window._loginSubrol)
    const subrolUI = (typeof window._loginSubrol !== 'undefined' && window._loginSubrol)
        ? window._loginSubrol
        : loginRolSeleccionado;

    // Validación 1: Campos vacíos
    if (!dni || !password) {
        mostrarErrorLogin("Completá todos los campos");
        return;
    }

    // Validación 2: Selección de rol
    if (!subrolUI) {
        mostrarErrorLogin("Seleccioná un rol para continuar");
        return;
    }

    // Validación 3: DNI existe
    const usuario = usuariosDB.find(u => u.dni === dni);
    if (!usuario) {
        mostrarErrorLogin("DNI no encontrado en el sistema");
        return;
    }

    // Validación 4: Contraseña correcta
    if (usuario.password !== password) {
        mostrarErrorLogin("Contraseña incorrecta");
        return;
    }

    // Validación 5: El rol del usuario coincide con la selección en UI
    if (usuario.rol !== subrolUI) {
        mostrarErrorLogin("El rol seleccionado no corresponde a este usuario");
        return;
    }

    // ── Todo correcto: asignar datos de sesión directamente desde la DB ──
    rRol = usuario.rol;
    rNombre = usuario.nombre;
    sedeActual = usuario.sede; // se asigna automáticamente, sin selector HTML

    usuarioActual = {
        dni: dni,
        nombre: usuario.nombre,
        rol: usuario.rol,
        sede: usuario.sede
    };

    ingresarAlSistema();
}

// Ingresar al sistema después de validación exitosa
function ingresarAlSistema() {
    document.getElementById('login-frame').style.display = 'none';
    document.getElementById('sidebar-ui').classList.remove('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.body.classList.add('flex');

    const sTxt = document.getElementById('txt-saludo');
    const hTag = document.getElementById('hero-tag');
    const hTitle = document.getElementById('hero-title');
    const hFrame = document.getElementById('hero-inicio');
    const sDashboard = document.getElementById('staff-home-dashboard');
    const cGallery = document.getElementById('client-home-gallery');
    const bStaffHero = document.getElementById('btn-hero-action');
    const bClientProfile = document.getElementById('btn-goto-profile');
    const btnEf = document.getElementById("btn-efectivo");

    if (btnEf) {
        btnEf.style.display = (rRol === "admin") ? "block" : "none";
    }

    if (rRol === 'admin') {
        sTxt.innerText = `¡Hola, ${rNombre}!`;
        hTag.innerText = 'Centro de Mandos v35.0';
        hTitle.innerHTML = 'Gestión Global <br><span class="text-orange-500 italic italic">SquatGym Platinum.</span>';
        hFrame.style.backgroundImage = "linear-gradient(to right, rgba(2,6,23,0.98), rgba(2,6,23,0.5)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1200')";
        sDashboard.classList.remove('hidden');
        cGallery.classList.add('hidden');
        bStaffHero.classList.remove('hidden');
        bClientProfile.classList.add('hidden');
        document.getElementById('header-username').innerText = `${rNombre}`;
        const btnConfig = document.getElementById('btn-config-planes-container');
        if (btnConfig) btnConfig.classList.remove('hidden');
    } else if (rRol === 'secretaria') {
        sTxt.innerText = `¡Hola, ${rNombre}!`;
        hTag.innerText = 'Gestión de Socios';
        hTitle.innerHTML = 'Secretaría <br><span class="text-orange-500 italic italic">SquatGym Platinum.</span>';
        hFrame.style.backgroundImage = "linear-gradient(to right, rgba(2,6,23,0.98), rgba(2,6,23,0.5)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1200')";
        sDashboard.classList.remove('hidden');
        cGallery.classList.add('hidden');
        bStaffHero.classList.remove('hidden');
        bClientProfile.classList.add('hidden');
        document.getElementById('header-username').innerText = `${rNombre} — Secretaria`;
        const btnConfig = document.getElementById('btn-config-planes-container');
        if (btnConfig) btnConfig.classList.add('hidden');
    } else if (rRol === 'encargado') {
        sTxt.innerText = `¡Hola, ${rNombre}!`;
        hTag.innerText = 'Panel de Encargado';
        hTitle.innerHTML = 'Encargado <br><span class="text-orange-500 italic italic">SquatGym Platinum.</span>';
        hFrame.style.backgroundImage = "linear-gradient(to right, rgba(2,6,23,0.98), rgba(2,6,23,0.5)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1200')";
        sDashboard.classList.remove('hidden');
        cGallery.classList.add('hidden');
        bStaffHero.classList.remove('hidden');
        bClientProfile.classList.add('hidden');
        document.getElementById('header-username').innerText = `${rNombre} — Encargado`;
        const btnConfigEnc = document.getElementById('btn-config-planes-container');
        if (btnConfigEnc) btnConfigEnc.classList.add('hidden');
    } else {
        sTxt.innerText = `¡Hola, ${rNombre}!`;
        hTag.innerText = 'Socio Platinum Élite';
        hTitle.innerHTML = 'Disciplina <br><span class="text-orange-500 italic italic">Sin Límites.</span>';
        hFrame.style.backgroundImage = "linear-gradient(to right, rgba(2,6,23,0.98), rgba(2,6,23,0.4)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200')";
        sDashboard.classList.add('hidden');
        cGallery.classList.remove('hidden');
        bStaffHero.classList.add('hidden');
        bClientProfile.classList.remove('hidden');
        document.getElementById('header-username').innerText = `${rNombre}`;
    }

    configMenu();
    navV('inicio');
    // renderMarketCatalog(); // Esta función se llamará cuando se navegue al Kiosco


    // Mostrar/Ocultar campanita según rol
    const notifContainer = document.getElementById('notificaciones-header-container');
    if (notifContainer) {
        if (rRol === 'alumno') {
            notifContainer.classList.remove('hidden');
        } else {
            notifContainer.classList.add('hidden');
        }
    }

    if (rRol === 'admin' || rRol === 'secretaria' || rRol === 'encargado') {
        setTimeout(renderizarAlertasStaff, 100);
    }
    if (rRol === 'alumno') {
        setTimeout(() => {
            actualizarUIPerfilAlumno();
            cargarNotificaciones();
            mostrarModalEstadoCuenta(); // Mostrar popup de bienvenida con estado
        }, 100);
    }
}

function actualizarUIPerfilAlumno() {
    const dni = usuarioActual.dni;
    const socio = sociosDB.find(s => s.dni === dni);
    if (!socio) return;

    // Simular días de mora para la demo
    let diasMora = 0;
    if (dni === "8") diasMora = 10; // Valentino: < 15 días
    if (dni === "9") diasMora = 20; // Lucía: >= 15 días

    const deuda = socio.deuda;
    const bannerAlerta = document.getElementById('banner-alerta-cliente');
    const bannerRestr = document.getElementById('banner-restriccion-cliente');
    const badgeEstado = document.getElementById('alu-estado-cuota-badge');
    const dotAcceso = document.getElementById('alu-estado-acceso-dot');
    const txtAcceso = document.getElementById('alu-estado-acceso-texto');
    const containerAcceso = document.getElementById('alu-estado-acceso-container');
    const checkoutTotal = document.getElementById('al-checkout-total');
    const resumenDeuda = document.getElementById('al-resumen-deuda');
    const perfilNombre = document.getElementById('al-perfil-nombre');
    const perfilImg = document.getElementById('al-perfil-img');
    const detalleMonto = document.getElementById('al-detalle-monto');
    const detalleBlock = document.getElementById('alu-detalle-deuda-block');

    // Reset banners
    if (bannerAlerta) bannerAlerta.innerHTML = '';
    if (bannerRestr) bannerRestr.innerHTML = '';

    // Inyección sincronizada de deuda - AHORA BASADA EN LA DB GLOBAL
    const montoAMostrar = deuda; 

    if (checkoutTotal) checkoutTotal.innerText = `$${montoAMostrar.toLocaleString()}`;
    if (resumenDeuda) resumenDeuda.innerText = `$${deuda.toLocaleString()}`; 
    if (detalleMonto) detalleMonto.innerText = `$${montoAMostrar.toLocaleString()}`;

    if (perfilNombre) perfilNombre.innerHTML = socio.nombre.replace(' ', ' <br> <span class="text-slate-300">') + '</span>';

    // Lógica de Foto (Priorizar socio.foto)
    if (perfilImg) {
        perfilImg.src = socio.foto || `https://ui-avatars.com/api/?name=${socio.nombre}&background=f97316&color=fff&bold=true`;
    }

    if (deuda > 0) {
        if (diasMora < 15) {
            // CASO PAGO PENDIENTE (Amarillo)
            if (bannerAlerta) {
                bannerAlerta.innerHTML = `
                    <div class="glass-card p-4 border-l-4 border-yellow-500 bg-yellow-500/5 flex items-center gap-4 animate-pulse">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-xl flex-shrink-0"></i>
                        <div>
                            <p class="text-xs font-black text-yellow-500 uppercase">AVISO: Pago Pendiente</p>
                            <p class="text-[9px] text-slate-300">Tienes una deuda activa. Evita restricciones abonando a la brevedad.</p>
                        </div>
                    </div>`;
            }
            if (badgeEstado) {
                badgeEstado.innerText = "PENDIENTE";
                badgeEstado.className = "bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-2 py-1 rounded border border-yellow-500/20";
                badgeEstado.classList.remove('hidden');
            }
            if (dotAcceso && txtAcceso && containerAcceso) {
                dotAcceso.className = 'w-2 h-2 rounded-full bg-yellow-500';
                txtAcceso.innerText = 'ADVERTENCIA';
                txtAcceso.className = 'text-[8px] text-yellow-500 font-black tracking-widest';
                containerAcceso.className = 'absolute top-4 right-4 flex items-center gap-1.5 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-800/50';
            }
        } else {
            // CASO DEUDA Y ACCESO DENEGADO (Rojo)
            if (bannerRestr) {
                bannerRestr.innerHTML = `
                    <div class="glass-card p-4 border-l-4 border-red-600 bg-red-600/10 flex items-center gap-4 border-2 border-red-500/30">
                        <i class="fas fa-ban text-red-500 text-xl flex-shrink-0"></i>
                        <div>
                            <p class="text-xs font-black text-red-500 uppercase">ACCESO DENEGADO</p>
                            <p class="text-[9px] text-slate-300">Tu cuenta presenta una mora superior a 15 días. Acércate a recepción.</p>
                        </div>
                    </div>`;
            }
            if (badgeEstado) {
                badgeEstado.innerText = "EN MORA";
                badgeEstado.className = "bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-1 rounded border border-red-500/20";
                badgeEstado.classList.remove('hidden');
            }
            if (dotAcceso && txtAcceso && containerAcceso) {
                dotAcceso.className = 'w-2 h-2 rounded-full bg-red-600';
                txtAcceso.innerText = 'BLOQUEADO';
                txtAcceso.className = 'text-[8px] text-red-500 font-black tracking-widest';
                containerAcceso.className = 'absolute top-4 right-4 flex items-center gap-1.5 bg-red-900/20 px-2 py-1 rounded-full border border-red-800/50';
            }
        }
        if (detalleBlock) detalleBlock.classList.remove('hidden');
    } else {
        // CASO AL DÍA (Verde)
        if (badgeEstado) {
            badgeEstado.innerText = "AL DÍA";
            badgeEstado.className = "bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-1 rounded border border-green-500/20";
            badgeEstado.classList.remove('hidden');
        }

        // Ocultar detalles de deuda
        if (detalleBlock) detalleBlock.classList.add('hidden');

        // Mostrar banner de Acceso Habilitado
        if (bannerAlerta) bannerAlerta.innerHTML = '';
        if (bannerRestr) {
            bannerRestr.innerHTML = `
                <div class="glass-card p-4 border-l-4 border-green-500 bg-green-500/10 flex items-center gap-4">
                    <i class="fas fa-check-circle text-green-500 text-xl flex-shrink-0"></i>
                    <div>
                        <p class="text-xs font-black text-green-400 uppercase">Acceso Habilitado</p>
                        <p class="text-[9px] text-slate-300">Tu cuenta está al día. ¡Disfrutá de tu entrenamiento!</p>
                    </div>
                </div>`;
        }

        if (dotAcceso && txtAcceso && containerAcceso) {
            dotAcceso.className = 'w-2 h-2 rounded-full bg-green-500';
            txtAcceso.innerText = 'HABILITADO';
            txtAcceso.className = 'text-[8px] text-green-400 font-black tracking-widest';
            containerAcceso.className = 'absolute top-4 right-4 flex items-center gap-1.5 bg-green-900/20 px-2 py-1 rounded-full border border-green-800/50';
        }

        // Deshabilitar botón de pagar si está al día
        const btnPagar = document.getElementById('alu-btn-pagar');
        if (btnPagar) {
            btnPagar.disabled = true;
            btnPagar.innerText = "CUOTA AL DÍA";
            btnPagar.className = "w-full bg-slate-800 text-slate-500 text-[10px] font-black py-3 rounded-lg flex justify-center items-center gap-2 cursor-not-allowed";
        }
    }
}

// Mostrar/ocultar panel de recuperación de contraseña
function toggleRecuperacionPassword() {
    const panel = document.getElementById('panel-recuperacion-password');
    const formNormal = document.getElementById('form-normal');

    if (panel && formNormal) {
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            formNormal.classList.add('hidden');
            document.getElementById('dni-recuperacion').focus();
        } else {
            panel.classList.add('hidden');
            formNormal.classList.remove('hidden');

            // Limpiar inputs al volver
            const dniInput = document.querySelector('input[placeholder="DNI..."]');
            const passInput = document.querySelector('input[placeholder="PASSWORD"]');
            if (dniInput) dniInput.value = '';
            if (passInput) passInput.value = '';

            // Limpiar panel de recuperación
            const dniRecup = document.getElementById('dni-recuperacion');
            if (dniRecup) dniRecup.value = '';
            document.getElementById('recuperar-exito')?.classList.add('hidden');
            document.getElementById('recuperar-error')?.classList.add('hidden');

            // Limpiar errores previos del login
            mostrarErrorLogin('');
        }
    }
}

// Recuperar contraseña
function recuperarPassword() {
    const dniInput = document.getElementById('dni-recuperacion');
    const dni = dniInput.value.trim();
    const exitoDiv = document.getElementById('recuperar-exito');
    const errorDiv = document.getElementById('recuperar-error');

    exitoDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    if (!dni) {
        errorDiv.textContent = 'Ingresá un DNI';
        errorDiv.classList.remove('hidden');
        return;
    }

    const usuario = usuariosDB.find(u => u.dni === dni);
    if (!usuario) {
        errorDiv.textContent = 'No se encontró ningún usuario con ese DNI.';
        errorDiv.classList.remove('hidden');
        return;
    }

    exitoDiv.textContent = 'Se enviará un enlace de recuperación al correo registrado.';
    exitoDiv.classList.remove('hidden');

    setTimeout(() => {
        dniInput.value = '';
        exitoDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        toggleRecuperacionPassword();
    }, 2000);
}

// Configurar el submenu de Staff (Admin/Secretaria/Encargado)
function configurarMenuStaff() {
    const staffBtn = document.getElementById('l-btn-staff');
    const alumnoBtn = document.getElementById('l-btn-alumno');

    if (staffBtn) {
        staffBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Al volver a Staff desde Alumno, resetear la selección
            if (window._loginSubrol === 'alumno' || !window._loginSubrol) {
                window._loginSubrol = null;
                window._loginSede = null;
            }
            // Seleccionar admin por defecto si no hay subrol de staff elegido
            if (!window._loginSubrol) {
                if (typeof seleccionarSubrol === 'function') seleccionarSubrol('admin');
                window._loginSubrol = 'admin';
            }
            setLoginUIRol('admin', window._loginSubrol);
        });
    }

    if (alumnoBtn) {
        alumnoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window._loginSubrol = 'alumno';
            window._loginSede = null;
            setLoginUIRol('alumno');
        });
    }
}


// Actualizar función setLoginUIRol del app.js
function setLoginUIRol(categoria, rol = null) {
    if (categoria === 'admin') {
        loginRolSeleccionado = rol || 'admin';
    } else {
        loginRolSeleccionado = 'alumno';
    }

    // Asegurarse de volver a la vista normal de login al cambiar de rol
    const panelRecup = document.getElementById('panel-recuperacion-password');
    const formNormal = document.getElementById('form-normal');
    if (panelRecup && formNormal && !panelRecup.classList.contains('hidden')) {
        panelRecup.classList.add('hidden');
        formNormal.classList.remove('hidden');
    }

    // Limpiar inputs al cambiar de rol
    const dniInput = document.querySelector('input[placeholder="DNI..."]');
    const passInput = document.querySelector('input[placeholder="PASSWORD"]');
    if (dniInput) dniInput.value = '';
    if (passInput) passInput.value = '';
    mostrarErrorLogin('');

    const staff = document.getElementById("l-btn-staff");
    const alumno = document.getElementById("l-btn-alumno");
    const subMenu = document.getElementById("staff-submenu");
    const selectorSede = document.getElementById("selector-sede-login");

    staff.classList.remove("role-active");
    alumno.classList.remove("role-active");
    staff.classList.add("bg-[#0f172a]", "text-[#64748b]");
    alumno.classList.add("bg-[#0f172a]", "text-[#64748b]");

    if (loginRolSeleccionado !== 'alumno') {
        // Mostrar submenu de staff
        staff.classList.add("role-active");
        staff.classList.remove("bg-[#0f172a]", "text-[#64748b]");
        if (subMenu) { subMenu.classList.remove('hidden'); subMenu.style.display = 'flex'; }
    } else {
        // Ocultar submenu y selector de sede al ir a Alumno
        alumno.classList.add("role-active");
        alumno.classList.remove("bg-[#0f172a]", "text-[#64748b]");
        if (subMenu) { subMenu.classList.add('hidden'); subMenu.style.display = 'none'; }
        // Limpiar selección de subrol/sede
        window._loginSubrol = 'alumno';
        window._loginSede = null;
    }
}


// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    limpiarErrorAlEscribir();
    configurarMenuStaff();

    // Tecla Enter en DNI o Password dispara el login
    const dniInput = document.querySelector('input[placeholder="DNI..."]');
    const passInput = document.querySelector('input[placeholder="PASSWORD"]');

    if (dniInput) {
        dniInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') entrarApp();
        });
    }
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') entrarApp();
        });
    }

    // Vincular botón de notificaciones
    const btnNotif = document.getElementById('btn-notificaciones');
    if (btnNotif) {
        btnNotif.onclick = toggleNotificaciones;
    }
});

// ══════════════════════════════════════════════
// SISTEMA DE NOTIFICACIONES DINÁMICAS
// ══════════════════════════════════════════════

function getNotificacionesData() {
    const data = [];
    
    // Obtener socio actual desde la base de datos global (sociosDB de data.js)
    const socio = (typeof sociosDB !== 'undefined')
        ? sociosDB.find(s => s.dni === usuarioActual.dni)
        : null;

    if (!socio) return data;

    // 1. Lógica de Deuda/Mora (Generalizada para todos los alumnos)
    if (socio.deuda > 0) {
        const cuotaPendiente = (typeof historialPagosCliente !== 'undefined') 
            ? historialPagosCliente.find(p => p.dni === socio.dni && p.estado === 'Pendiente')
            : null;
        const montoStr = cuotaPendiente ? `$${cuotaPendiente.monto.toLocaleString()}` : `$${socio.deuda.toLocaleString()}`;

        if (socio.dni === "9") {
            // Caso de Mora Pesada (Ej: Lucía)
            data.push({
                id: 'notif-bloqueo',
                tipo: 'vencimiento',
                icono: 'fas fa-ban',
                color: 'text-red-500',
                borderColor: '#ef4444',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                titulo: 'ACCESO RESTRINGIDO',
                desc: `Tu cuenta presenta una mora de $${socio.deuda.toLocaleString()}. Dirígete a administración.`,
                fecha: 'Ayer • 08:15 PM',
                accion: { label: 'Ver Estado', fn: "navV('alu-pago')" }
            });
        } else {
            // Caso de Deuda Pendiente (Valentino y otros)
            data.push({
                id: 'notif-deuda',
                tipo: 'vencimiento',
                icono: 'fas fa-exclamation-triangle',
                color: 'text-yellow-500',
                borderColor: '#eab308',
                bgColor: 'rgba(234, 179, 8, 0.1)',
                titulo: 'Pago Pendiente',
                desc: `Tienes una cuota pendiente de $${socio.deuda.toLocaleString()}. Abona para evitar recargos.`,
                fecha: 'Hoy • 10:30 AM',
                accion: { label: 'Pagar Ahora', fn: "abrirM('modal-pago-selector','cuota')" }
            });
        }
    }

    // 2. Notificación SIEMPRE (Promo genérica del Gym)
    data.push({
        id: 'notif-promo',
        tipo: 'promocion',
        icono: 'fas fa-gift',
        color: 'text-orange-500',
        borderColor: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.1)',
        titulo: '¡Sorteo Mensual!',
        desc: 'Participa por una suscripción anual gratis en nuestro Instagram.',
        fecha: 'Hace 1 hora',
        accion: { label: 'Ir a Instagram', fn: "window.open('https://instagram.com/squatgym','_blank')" }
    });

    return data;
}

function toggleNotificaciones() {
    const dropdown = document.getElementById('dropdown-notificaciones');
    if (!dropdown) return;

    if (dropdown.classList.contains('hidden')) {
        cargarNotificaciones();
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
}

function cargarNotificaciones() {
    const lista = document.getElementById('lista-notificaciones');
    const badge = document.getElementById('badge-notificaciones');
    if (!lista) return;

    lista.innerHTML = '';
    const notificaciones = getNotificacionesData();

    notificaciones.forEach(notif => {
        lista.innerHTML += `
            <div class="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition cursor-pointer flex gap-4">
                <div class="w-10 h-10 rounded-full ${notif.bgColor.replace('rgba', 'bg').replace(', 0.1)', '/10')} flex items-center justify-center shrink-0">
                    <i class="${notif.icono} ${notif.color} text-sm"></i>
                </div>
                <div class="space-y-1">
                    <p class="text-[11px] font-black text-white leading-tight uppercase">${notif.titulo}</p>
                    <p class="text-[10px] text-slate-400 leading-snug">${notif.desc}</p>
                    <p class="text-[9px] font-bold text-slate-500 uppercase">${notif.fecha}</p>
                </div>
            </div>`;
    });

    // Actualizar badge
    if (badge) {
        badge.innerText = notificaciones.length;
        badge.classList.toggle('hidden', notificaciones.length === 0);
    }
}

// ══════════════════════════════════════════════
// POPUP DE ESTADO DE CUENTA (INICIO ALUMNO)
// ══════════════════════════════════════════════

function mostrarModalEstadoCuenta() {
    const socio = (typeof sociosDB !== 'undefined')
        ? sociosDB.find(s => s.dni === usuarioActual.dni)
        : null;

    if (!socio) return;

    const iconCont = document.getElementById('status-icon-container');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title');
    const desc = document.getElementById('status-desc');
    const extraInfo = document.getElementById('status-extra-info');
    const monto = document.getElementById('status-monto');
    const btnSec = document.getElementById('status-btn-secondary');

    // Reset
    iconCont.className = 'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl';
    extraInfo.classList.add('hidden');
    btnSec.classList.add('hidden');

    if (socio.deuda > 0) {
        if (socio.dni === "9") {
            // DEUDA / MORA PESADA
            iconCont.classList.add('bg-red-500/20', 'text-red-500', 'border', 'border-red-500/30');
            icon.className = 'fas fa-ban';
            title.innerText = 'Acceso Restringido';
            title.className = 'text-2xl font-black text-red-500 uppercase tracking-tighter mb-2 italic';
            desc.innerText = 'Tu cuenta registra una mora superior a 15 días. El acceso a las instalaciones se encuentra suspendido.';
            monto.innerText = `$${socio.deuda.toLocaleString()}`; 
            extraInfo.classList.remove('hidden');
            btnSec.classList.remove('hidden');
        } else {
            // PENDIENTE
            iconCont.classList.add('bg-yellow-500/20', 'text-yellow-500', 'border', 'border-yellow-500/30');
            icon.className = 'fas fa-exclamation-triangle';
            title.innerText = 'Pago Pendiente';
            title.className = 'text-2xl font-black text-yellow-500 uppercase tracking-tighter mb-2 italic';
            desc.innerText = 'Tienes una cuota pendiente por abonar. Recuerda regularizar para evitar recargos o bloqueos.';
            monto.innerText = `$${socio.deuda.toLocaleString()}`; 
            extraInfo.classList.remove('hidden');
            btnSec.classList.remove('hidden');
        }
    } else {
        // AL DÍA
        iconCont.classList.add('bg-green-500/20', 'text-green-400', 'border', 'border-green-500/30');
        icon.className = 'fas fa-check-circle';
        title.innerText = '¡Todo en orden!';
        title.className = 'text-2xl font-black text-green-400 uppercase tracking-tighter mb-2 italic';
        desc.innerText = 'Tu cuenta se encuentra al día. ¡Gracias por ser parte de SquatGym! Nos vemos en el entrenamiento.';
    }

    abrirM('modal-estado-cuenta-alumno');
}

// Cerrar el dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdown-notificaciones');
    const btn = document.getElementById('btn-notificaciones');
    if (!dropdown || !btn) return;

    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// ══════════════════════════════════════════════
// LECTURA DE DATOS PARA PERFIL SOCIO
// ══════════════════════════════════════════════
function verPerfilSocio(nombre) {
    const socio = sociosDB.find(s => s.nombre === nombre);
    if (!socio) {
        alert("Socio no encontrado en la base de datos.");
        return;
    }

    // Buscar alerta y mora
    let alerta = null;
    if (typeof alertasVencimiento !== 'undefined') {
        alerta = alertasVencimiento.find(a => a.nombre === nombre);
    }

    const deuda = alerta ? alerta.deuda : (socio.deuda || 0);
    const dias = alerta ? alerta.dias : 0;
    const esMora = dias < 0;
    const diasMoraNum = esMora ? Math.abs(dias) : 0;
    const estaBloqueado = dias <= -15;

    // Buscar transacciones
    let pagos = [];
    if (typeof transacciones !== 'undefined') {
        pagos = transacciones.filter(t => t.cliente === nombre);
    }

    // Cálculos rápidos
    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const cantidadPagos = pagos.length;

    const metodos = {};
    let metodoFav = '—';
    let maxFreq = 0;
    pagos.forEach(p => {
        metodos[p.tipo] = (metodos[p.tipo] || 0) + 1;
        if (metodos[p.tipo] > maxFreq) {
            maxFreq = metodos[p.tipo];
            metodoFav = p.tipo;
        }
    });

    // Inyectar Datos: Header
    const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('perfil-iniciales').innerText = iniciales;
    document.getElementById('perfil-nombre').innerText = nombre;

    const badgeEstado = document.getElementById('perfil-estado-badge');
    const montoEl = document.getElementById('perfil-monto');
    const tituloMonto = document.getElementById('perfil-titulo-monto');

    montoEl.innerText = `$${deuda.toLocaleString()}`;
    montoEl.classList.remove('text-green-400', 'text-white', 'text-red-500', 'text-yellow-500');

    let textoCuenta = socio.estado;

    if (deuda > 0 && esMora) {
        // Mora real
        badgeEstado.innerText = 'DEUDOR';
        badgeEstado.className = 'mt-1 inline-block px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-red-500/30';
        montoEl.classList.add('text-red-500');
        if (tituloMonto) {
            tituloMonto.innerText = 'Adeudado Actual';
            tituloMonto.className = 'text-[10px] font-black text-red-500 uppercase tracking-widest mb-1';
        }
    } else if (deuda > 0 && !esMora) {
        // Próximo a vencer
        badgeEstado.innerText = 'PRÓX. VENCIMIENTO';
        badgeEstado.className = 'mt-1 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-yellow-500/30';
        montoEl.classList.add('text-yellow-500');
        textoCuenta = 'Al día'; // Aún no venció
        if (tituloMonto) {
            tituloMonto.innerText = 'A Pagar (Próx. Venc.)';
            tituloMonto.className = 'text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1';
        }
    } else {
        // Pagado / Al día
        badgeEstado.innerText = 'AL DÍA';
        badgeEstado.className = 'mt-1 inline-block px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-500/30';
        montoEl.classList.add('text-green-400');
        textoCuenta = 'Al día';
        if (tituloMonto) {
            tituloMonto.innerText = 'Adeudado Actual';
            tituloMonto.className = 'text-[10px] font-black text-green-500 uppercase tracking-widest mb-1';
        }
    }

    // Inyectar Datos: Sección 1
    document.getElementById('perfil-dni').innerText = socio.dni;
    document.getElementById('perfil-clase').innerText = socio.clase || 'General';
    document.getElementById('perfil-estado-cuenta').innerText = textoCuenta;
    document.getElementById('perfil-alta').innerText = '14/02/2024'; // Fecha simulada

    document.getElementById('perfil-mora').innerText = esMora ? `${diasMoraNum} días` : '0 días';

    const restriccionBadge = document.getElementById('perfil-restriccion-badge');
    if (estaBloqueado) {
        restriccionBadge.innerText = 'ACCESO BLOQUEADO';
        restriccionBadge.className = 'px-4 py-2 bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-red-500/30 text-center w-full sm:w-auto';
    } else {
        restriccionBadge.innerText = 'ACCESO PERMITIDO';
        restriccionBadge.className = 'px-4 py-2 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-green-500/30 text-center w-full sm:w-auto';
    }

    // Inyectar Datos: Indicadores rápidos
    document.getElementById('perfil-total-pagado').innerText = `$${totalPagado.toLocaleString()}`;
    document.getElementById('perfil-cantidad-pagos').innerText = cantidadPagos;
    document.getElementById('perfil-metodo-fav').innerText = metodoFav;

    // Inyectar Datos: Historial
    const tbody = document.getElementById('tbody-historial');
    if (pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic border-b border-slate-800">Sin registros de pago</td></tr>`;
    } else {
        tbody.innerHTML = pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(p => `
            <tr class="hover:bg-slate-800/50 transition">
                <td class="p-3">${p.fecha}</td>
                <td class="p-3 text-slate-300">${p.concepto}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] uppercase tracking-widest rounded border border-slate-700">${p.tipo}</span>
                </td>
                <td class="p-3 text-right text-orange-400 font-black">$${p.monto.toLocaleString()}</td>
                <td class="p-3 text-center">
                    <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-[8px] uppercase tracking-widest rounded border border-green-500/30">Pagado</span>
                </td>
            </tr>
        `).join('');
    }

    abrirM('modal-perfil-socio');
}

// ══════════════════════════════════════════════
// GESTIÓN DE PLANES Y PROMOCIONES (Administrador)
// ══════════════════════════════════════════════

let planEditandoId = null;

function abrirModalPrecios() {
    const lista = document.getElementById('lista-planes-admin');
    if (!lista) return;

    lista.innerHTML = '';

    planesDB.forEach(plan => {
        let promoBadge = '';
        if (plan.tipoPromo !== 'ninguna') {
            promoBadge = `<span class="mt-2 inline-block px-2 py-1 bg-orange-500/20 text-orange-400 text-[9px] uppercase font-black tracking-widest rounded border border-orange-500/30">Promo Activa: ${plan.tipoPromo} (${plan.valorPromo})</span>`;
        }

        const isSelected = plan.id === planEditandoId;
        const borderClass = isSelected ? 'border-orange-500 bg-slate-900/80 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700';

        lista.innerHTML += `
            <div onclick="cargarPlanFormulario(${plan.id})" class="glass-card p-4 border ${borderClass} rounded-xl mb-4 flex justify-between items-center transition-all cursor-pointer">
                <div>
                    <h4 class="text-white font-black uppercase tracking-widest text-sm mb-1">${plan.nombre}</h4>
                    <p class="text-slate-400 text-xs font-bold">Base: $${plan.precioBase.toLocaleString()}</p>
                    ${promoBadge}
                </div>
                <button class="btn-ui bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition border border-slate-700 pointer-events-none">
                    ${isSelected ? 'Editando' : 'Editar'}
                </button>
            </div>
        `;
    });

    // Conectar dinámicamente el botón Guardar en la pantalla
    const btnGuardar = document.querySelector('#v-adm-planes .fa-save')?.parentElement;
    if (btnGuardar) {
        btnGuardar.onclick = guardarCambiosPlan;
    }
}

function cargarPlanFormulario(id) {
    const plan = planesDB.find(p => p.id === id);
    if (!plan) return;

    planEditandoId = id;

    // Refrescar la lista para pintar el recuadro seleccionado
    abrirModalPrecios();

    document.getElementById('edit-nombre-plan').value = plan.nombre;
    document.getElementById('edit-precio-base').value = plan.precioBase;

    // Setear tipo y renderizar el input/select correcto
    document.getElementById('edit-tipo-promo').value = plan.tipoPromo;
    cambiarTipoPromo(plan.valorPromo);

    // Limpiar mensaje de éxito previo si existe
    const msg = document.getElementById('msg-exito-promo');
    if (msg) msg.remove();
}

function guardarCambiosPlan() {
    if (!planEditandoId) return;

    const plan = planesDB.find(p => p.id === planEditandoId);
    if (!plan) return;

    const nuevoTipo = document.getElementById('edit-tipo-promo').value;
    const nuevoValor = document.getElementById('edit-valor-promo').value;

    // Validación
    if (nuevoTipo !== 'ninguna' && !nuevoValor.trim()) {
        mostrarMensajePromo('Debe indicar un detalle para la promoción.', 'red');
        return; // No guardar
    }

    plan.precioBase = parseInt(document.getElementById('edit-precio-base').value) || 0;
    plan.tipoPromo = nuevoTipo;
    plan.valorPromo = nuevoValor;

    // Persistir cambios
    localStorage.setItem('squatgym_planesDB', JSON.stringify(planesDB));

    abrirModalPrecios(); // Actualiza la lista izquierda

    // Mostrar mensaje temporal de éxito
    mostrarMensajePromo('¡Configuración guardada correctamente!', 'green');
}

function mostrarMensajePromo(texto, color) {
    let msg = document.getElementById('msg-exito-promo');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'msg-exito-promo';

        const btnGuardar = document.querySelector('#modal-precios .fa-save')?.parentElement;
        if (btnGuardar && btnGuardar.parentNode) {
            btnGuardar.parentNode.appendChild(msg);
        }
    }

    // Configurar color según el tipo (éxito o error)
    if (color === 'red') {
        msg.className = 'mt-4 p-3 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/30 text-center transition-all opacity-100';
    } else {
        msg.className = 'mt-4 p-3 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-500/30 text-center transition-all opacity-100';
    }

    msg.innerText = texto;

    setTimeout(() => {
        if (msg) {
            msg.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => msg.remove(), 300);
        }
    }, 3000);
}

function cambiarTipoPromo(valorPorDefecto = '') {
    const tipo = document.getElementById('edit-tipo-promo').value;
    const contenedor = document.getElementById('contenedor-valor-promo');

    if (tipo === 'ninguna') {
        contenedor.innerHTML = '<input type="text" id="edit-valor-promo" disabled class="w-full bg-slate-900 border border-slate-800 text-slate-500 p-3 rounded-xl font-black uppercase cursor-not-allowed" placeholder="Sin promoción activa" value="">';
    } else if (tipo === 'dia_especial') {
        contenedor.innerHTML = `
            <select id="edit-valor-promo" class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-black uppercase focus:outline-none focus:border-orange-500 transition appearance-none">
                <option value="" disabled ${!valorPorDefecto ? 'selected' : ''} class="text-slate-500">Seleccionar...</option>
                <option value="Lunes" ${valorPorDefecto === 'Lunes' ? 'selected' : ''}>Día Lunes</option>
                <option value="Fines de Semana" ${valorPorDefecto === 'Fines de Semana' ? 'selected' : ''}>Fines de Semana</option>
                <option value="BlackFriday" ${valorPorDefecto === 'BlackFriday' ? 'selected' : ''}>Black Friday</option>
            </select>
        `;
    } else if (tipo === 'amigos') {
        contenedor.innerHTML = `
            <select id="edit-valor-promo" class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-black uppercase focus:outline-none focus:border-orange-500 transition appearance-none">
                <option value="" disabled ${!valorPorDefecto ? 'selected' : ''} class="text-slate-500">Seleccionar...</option>
                <option value="2x1" ${valorPorDefecto === '2x1' ? 'selected' : ''}>Mecánica 2x1</option>
                <option value="Plan Familiar" ${valorPorDefecto === 'Plan Familiar' ? 'selected' : ''}>Plan Familiar (3+ integrantes)</option>
                <option value="50% Segundo" ${valorPorDefecto === '50% Segundo' ? 'selected' : ''}>50% Off al Segundo</option>
            </select>
        `;
    } else if (tipo === 'cupon') {
        contenedor.innerHTML = `<input type="text" id="edit-valor-promo" class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-black uppercase focus:outline-none focus:border-orange-500 transition placeholder-slate-600" placeholder="Ej: CROSS20" value="${valorPorDefecto}">`;
    }
}
