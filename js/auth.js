// Base de datos simulada de usuarios
const usuariosDB = [
    { dni: "11111111", password: "admin123",   rol: "admin",      nombre: "Melisa López",   sede: null },
    { dni: "22222222", password: "secre123",   rol: "secretaria", nombre: "Laura García",   sede: "Sede Centro" },
    { dni: "33333333", password: "secre456",   rol: "secretaria", nombre: "Carlos Pérez",   sede: "Sede Norte" },
    { dni: "44444444", password: "secre789",   rol: "secretaria", nombre: "Ana Ramírez",    sede: "Sede Sur" },
    { dni: "123",      password: "cliente123", rol: "alumno",     nombre: "Valentino P.",  sede: "Sede Centro" },
    { dni: "456",      password: "cliente456", rol: "alumno",     nombre: "Melisa L.",     sede: "Sede Centro" },
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
    const rolSeleccionado = loginRolSeleccionado;

    // Validación 1: Campos vacíos
    if (!dni || !password) {
        mostrarErrorLogin("Completá todos los campos");
        return;
    }

    // Validación 2: DNI existe
    const usuario = usuariosDB.find(u => u.dni === dni);
    if (!usuario) {
        mostrarErrorLogin("DNI no encontrado en el sistema");
        return;
    }

    // Validación 3: Contraseña correcta
    if (usuario.password !== password) {
        mostrarErrorLogin("Contraseña incorrecta");
        return;
    }

    // Validación 4: Rol seleccionado coincide
    if (usuario.rol !== rolSeleccionado) {
        mostrarErrorLogin("El rol seleccionado no corresponde a este usuario");
        return;
    }

    // Si todo es correcto, entrar al sistema
    rRol = usuario.rol;
    rNombre = usuario.nombre;
    sedeActual = usuario.sede;

    usuarioActual = {
        dni: dni,
        nombre: usuario.nombre,
        rol: usuario.rol
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
        document.getElementById('header-username').innerText = `${rNombre} — Admin`;
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


    if (rRol === 'admin' || rRol === 'secretaria') {
        setTimeout(renderizarAlertasStaff, 100);
    }
    if (rRol === 'alumno') {
        setTimeout(renderizarAlertaCliente, 100);
    }

    const btn = document.getElementById("btn-kiosco-accion");
    if (btn) {
        if (rRol === "admin" || rRol === "secretaria") {
            btn.innerText = "Cobrar";
            btn.onclick = () => abrirM('modal-cobro-kiosco');
        } else {
            btn.innerText = "Pagar";
            btn.onclick = () => abrirM('modal-pago-selector', 'kiosco');
        }
    }

    const btnEntregas = document.getElementById('btn-entregas');
    if (btnEntregas) {
        if (rRol === 'admin' || rRol === 'secretaria') {
            btnEntregas.style.display = 'flex';
        } else {
            btnEntregas.style.display = 'none';
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

// Configurar el submenu de Staff (Admin/Secretaria)
function configurarMenuStaff() {
    const staffBtn = document.getElementById('l-btn-staff');
    const alumnoBtn = document.getElementById('l-btn-alumno');
    const subMenu = document.getElementById('staff-submenu');

    if (staffBtn) {
        staffBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (subMenu) {
                subMenu.classList.remove('hidden');
                subMenu.classList.add('flex');
            }
            if (loginRolSeleccionado !== 'admin' && loginRolSeleccionado !== 'secretaria') {
                setLoginUIRol('admin', 'admin');
            }
        });
    }

    if (alumnoBtn) {
        alumnoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (subMenu) {
                subMenu.classList.remove('flex');
                subMenu.classList.add('hidden');
            }
            setLoginUIRol('alumno');
        });
    }

    // Botones del submenu de Staff
    const btnAdmin = document.getElementById('l-btn-admin');
    const btnSecretaria = document.getElementById('l-btn-secretaria');

    if (btnAdmin) {
        btnAdmin.addEventListener('click', () => {
            setLoginUIRol('admin', 'admin');
        });
    }

    if (btnSecretaria) {
        btnSecretaria.addEventListener('click', () => {
            setLoginUIRol('admin', 'secretaria');
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

    // Limpiar inputs al cambiar de rol por prolijidad
    const dniInput = document.querySelector('input[placeholder="DNI..."]');
    const passInput = document.querySelector('input[placeholder="PASSWORD"]');
    if (dniInput) dniInput.value = '';
    if (passInput) passInput.value = '';
    mostrarErrorLogin('');

    const staff = document.getElementById("l-btn-staff");
    const alumno = document.getElementById("l-btn-alumno");

    staff.classList.remove("role-active");
    alumno.classList.remove("role-active");

    staff.classList.add("bg-[#0f172a]", "text-[#64748b]");
    alumno.classList.add("bg-[#0f172a]", "text-[#64748b]");

    if (loginRolSeleccionado === 'admin' || loginRolSeleccionado === 'secretaria') {
        staff.classList.add("role-active");
        staff.classList.remove("bg-[#0f172a]", "text-[#64748b]");

        // Actualizar visual del submenu
        const btnAdmin = document.getElementById('l-btn-admin');
        const btnSecretaria = document.getElementById('l-btn-secretaria');

        if (btnAdmin && btnSecretaria) {
            if (loginRolSeleccionado === 'admin') {
                btnAdmin.classList.replace('border-[#1e293b]', 'border-[#f97316]');
                btnSecretaria.classList.replace('border-[#f97316]', 'border-[#1e293b]');
                btnAdmin.querySelector('i').classList.replace('text-slate-500', 'text-[#f97316]');
                btnSecretaria.querySelector('i').classList.replace('text-[#f97316]', 'text-slate-500');
            } else {
                btnSecretaria.classList.replace('border-[#1e293b]', 'border-[#f97316]');
                btnAdmin.classList.replace('border-[#f97316]', 'border-[#1e293b]');
                btnSecretaria.querySelector('i').classList.replace('text-slate-500', 'text-[#f97316]');
                btnAdmin.querySelector('i').classList.replace('text-[#f97316]', 'text-slate-500');
            }
        }
    } else {
        alumno.classList.add("role-active");
        alumno.classList.remove("bg-[#0f172a]", "text-[#64748b]");
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    limpiarErrorAlEscribir();
    configurarMenuStaff();

    // Forzar la selección visual y lógica inicial de Administrador
    setLoginUIRol('admin', 'admin');

    // Si hay un input de Enter en DNI o Password, enviar login
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
