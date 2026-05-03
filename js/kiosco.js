const kioscoProductos = [
    { id: 'agua-15', nombre: 'Agua Mineral 1.5L', precio: 1000, descripcion: 'Botella hidratante' },
    { id: 'lata-energ', nombre: 'Energizante', precio: 2500, descripcion: 'Lata 500ml' },
    { id: 'gatorade', nombre: 'Gatorade Blue', precio: 1400, descripcion: 'Sabor c�trico' },
    { id: 'whey', nombre: 'Prote�na Whey', precio: 5500, descripcion: 'Sachet 30g' },
    { id: 'creatina', nombre: 'Creatina Monohidrato', precio: 4800, descripcion: '30 servicios' }
];

const kioscoState = {
    turnoId: `turno-${Date.now()}`,
    fondoCaja: 0,
    metodoPago: 'Efectivo',
    carrito: []
};

function iniciarKiosco() {
    renderKioscoProductos();
    actualizarMetodoPagoVisual();
    renderCart();
    actualizarKPIs();
    renderVentasRecientes();
    solicitarAperturaCaja();
}

function solicitarAperturaCaja() {
    const overlay = document.getElementById('kiosco-apertura-overlay');
    if (!overlay) return;
    overlay.classList.toggle('hidden', kioscoState.fondoCaja > 0);
}

function guardarFondoCaja() {
    const input = document.getElementById('kiosco-inicio-monto');
    if (!input) return;

    const valor = Number(input.value);
    if (!valor || valor <= 0) {
        kioscoMostrarToast('Ingres� un monto v�lido mayor a $0', 'error');
        input.focus();
        return;
    }

    kioscoState.fondoCaja = Math.round(valor);
    input.value = '';
    actualizarCajaEstado();
    actualizarKPIs();
    renderCart();
    renderVentasRecientes();
    solicitarAperturaCaja();
    kioscoMostrarToast('Fondo de caja guardado. POS listo para operar.');
}

function actualizarCajaEstado() {
    const estado = document.getElementById('kiosco-caja-estado');
    if (!estado) return;

    if (kioscoState.fondoCaja > 0) {
        estado.textContent = `Caja abierta $${kioscoState.fondoCaja.toLocaleString()}`;
        estado.classList.remove('bg-slate-800');
        estado.classList.add('bg-orange-500', 'text-slate-950');
    } else {
        estado.textContent = 'Caja cerrada';
        estado.classList.add('bg-slate-800');
        estado.classList.remove('bg-orange-500', 'text-slate-950');
    }
}

function renderKioscoProductos() {
    const grid = document.getElementById('kiosco-product-grid');
    if (!grid) return;

    grid.innerHTML = kioscoProductos.map(producto => `
        <div class="group rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-left shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-orange-500">
            <div class="mb-4 flex items-center justify-between">
                <span class="text-[9px] uppercase tracking-[0.35em] text-slate-500">${producto.descripcion}</span>
                <span class="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase text-orange-300">POS</span>
            </div>
            <div class="mb-4 space-y-2">
                <h5 class="text-sm font-black text-white">${producto.nombre}</h5>
                <p class="text-[11px] text-slate-400">$${producto.precio.toLocaleString()}</p>
            </div>
            <button onclick="agregarProducto('${producto.id}')" class="mt-auto w-full rounded-2xl border border-orange-500 bg-orange-500/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-orange-300 transition hover:bg-orange-500/20">Agregar</button>
        </div>
    `).join('');
}

function agregarProducto(productId) {
    const producto = kioscoProductos.find(item => item.id === productId);
    if (!producto) return;
    kioscoState.carrito.push(producto);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('kiosco-cart-items');
    const countLabel = document.getElementById('kiosco-cart-count');
    const subtotalLabel = document.getElementById('kiosco-cart-subtotal');
    const confirmButton = document.getElementById('btn-confirmar-cobro');

    if (!container || !countLabel || !subtotalLabel || !confirmButton) return;

    if (kioscoState.carrito.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm text-center py-12">Carrito vac�o. Agreg� productos desde el cat�logo.</p>';
    } else {
        const agrupado = kioscoState.carrito.reduce((acc, producto) => {
            const key = producto.id;
            if (!acc[key]) acc[key] = { ...producto, qty: 0 };
            acc[key].qty += 1;
            return acc;
        }, {});

        container.innerHTML = Object.values(agrupado).map(item => `
            <div class="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/90 p-3">
                <div class="min-w-0 pr-3">
                    <p class="truncate text-sm font-black text-white">${item.nombre}</p>
                    <p class="text-[11px] text-slate-500">$${(item.precio * item.qty).toLocaleString()}</p>
                </div>
                <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <button onclick="decrementarItem('${item.id}')" class="rounded-full bg-slate-800 px-3 py-2 text-orange-300 transition hover:bg-orange-500/20">-</button>
                    <span class="w-6 text-center text-white">${item.qty}</span>
                    <button onclick="incrementarItem('${item.id}')" class="rounded-full bg-slate-800 px-3 py-2 text-orange-300 transition hover:bg-orange-500/20">+</button>
                </div>
            </div>
        `).join('');
    }

    const subtotal = calcularSubtotal();
    countLabel.textContent = `${kioscoState.carrito.length} item${kioscoState.carrito.length === 1 ? '' : 's'}`;
    subtotalLabel.textContent = `$${subtotal.toLocaleString()}`;
    confirmButton.disabled = kioscoState.carrito.length === 0 || kioscoState.fondoCaja === 0;
    confirmButton.classList.toggle('opacity-50', confirmButton.disabled);
    actualizarMontoEfectivoPanel();
}

function incrementarItem(productId) {
    const producto = kioscoProductos.find(item => item.id === productId);
    if (!producto) return;
    kioscoState.carrito.push(producto);
    renderCart();
}

function decrementarItem(productId) {
    const index = kioscoState.carrito.map(item => item.id).lastIndexOf(productId);
    if (index === -1) return;
    kioscoState.carrito.splice(index, 1);
    renderCart();
}

function kioscoCambiarMetodoPago(metodo) {
    kioscoState.metodoPago = metodo;
    actualizarMetodoPagoVisual();
    actualizarMontoEfectivoPanel();
}

function actualizarMetodoPagoVisual() {
    const metodos = [
        { key: 'Efectivo', css: 'border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]' },
        { key: 'QR', css: 'border-sky-400 bg-sky-500/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.25)]' },
        { key: 'Tarjeta', css: 'border-violet-400 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(168,85,247,0.25)]' },
        { key: 'Transferencia', css: 'border-orange-400 bg-orange-500/10 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.25)]' }
    ];

    metodos.forEach(({ key, css }) => {
        const btn = document.getElementById(`metodo-${key}`);
        if (!btn) return;
        const active = kioscoState.metodoPago === key;
        btn.className = `payment-btn rounded-xl border px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest transition ${active ? css : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-orange-500 hover:text-orange-300'}`;
    });
}

function actualizarMontoEfectivoPanel() {
    const panel = document.getElementById('kiosco-efectivo-panel');
    if (!panel) return;
    if (kioscoState.metodoPago === 'Efectivo') {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
        const input = document.getElementById('kiosco-monto-recibido');
        if (input) input.value = '';
        const vuelto = document.getElementById('kiosco-vuelto-display');
        if (vuelto) vuelto.textContent = '$0';
    }
}

function kioscoCalcularVuelto() {
    const input = document.getElementById('kiosco-monto-recibido');
    const vueltoEl = document.getElementById('kiosco-vuelto-display');
    if (!input || !vueltoEl) return;

    const recibido = Number(input.value);
    const subtotal = calcularSubtotal();
    const vuelto = Math.max(0, recibido - subtotal);
    vueltoEl.textContent = `$${vuelto.toLocaleString()}`;
}

function kioscoConfirmarCobro() {
    if (kioscoState.fondoCaja === 0) {
        kioscoMostrarToast('Debes abrir caja antes de cobrar.', 'error');
        return;
    }

    if (kioscoState.carrito.length === 0) {
        kioscoMostrarToast('El carrito debe tener productos para registrar el cobro.', 'error');
        return;
    }

    const subtotal = calcularSubtotal();
    const metodo = kioscoState.metodoPago;
    const detalle = generarDetalleVenta();

    if (!metodo) {
        kioscoMostrarToast('Seleccion� un m�todo de pago.', 'error');
        return;
    }

    let recibido = 0;
    let vuelto = 0;
    if (metodo === 'Efectivo') {
        const input = document.getElementById('kiosco-monto-recibido');
        recibido = Number(input?.value || 0);
        if (!recibido || recibido < subtotal) {
            kioscoMostrarToast('El monto recibido debe cubrir el total de la venta.', 'error');
            return;
        }
        vuelto = recibido - subtotal;
    }

    const transaccion = {
        fecha: new Date().toLocaleString('es-AR'),
        concepto: 'Kiosco',
        tipo: metodo,
        monto: subtotal,
        cliente: 'Mostrador',
        estado: 'Completado',
        turno: kioscoState.turnoId,
        detalle,
        items: kioscoState.carrito.map(item => ({ id: item.id, nombre: item.nombre, precio: item.precio }))
    };

    kioscoRegistrarTransaccion(transaccion);
    kioscoState.carrito = [];
    const inputEfectivo = document.getElementById('kiosco-monto-recibido');
    if (inputEfectivo) inputEfectivo.value = '';
    kioscoCalcularVuelto();
    renderCart();
    actualizarKPIs();
    renderVentasRecientes();

    const extra = metodo === 'Efectivo' && vuelto > 0 ? ` � Vuelto $${vuelto.toLocaleString()}` : '';
    kioscoMostrarToast(`Cobro registrado ${metodo} por $${subtotal.toLocaleString()}${extra}`);
}

function calcularSubtotal() {
    return kioscoState.carrito.reduce((total, item) => total + item.precio, 0);
}

function generarDetalleVenta() {
    const resumen = kioscoState.carrito.reduce((acc, item) => {
        if (!acc[item.nombre]) acc[item.nombre] = { nombre: item.nombre, qty: 0 };
        acc[item.nombre].qty += 1;
        return acc;
    }, {});
    return Object.values(resumen).map(item => `${item.qty}� ${item.nombre}`).join(', ');
}

function kioscoRegistrarTransaccion(transaccion) {
    if (typeof transacciones !== 'undefined') {
        transacciones.push(transaccion);
    } else {
        window.transacciones = window.transacciones || [];
        window.transacciones.push(transaccion);
    }
}

function kioscoObtenerTransaccionesGlobal() {
    return typeof transacciones !== 'undefined' ? transacciones : window.transacciones || [];
}

function kioscoObtenerTransaccionesTurno() {
    return kioscoObtenerTransaccionesGlobal().filter(tx => tx.turno === kioscoState.turnoId);
}

function actualizarKPIs() {
    const turnoTransacciones = kioscoObtenerTransaccionesTurno();
    const totalRecaudado = turnoTransacciones.reduce((sum, tx) => sum + tx.monto, 0);
    const efectivoVentas = turnoTransacciones.filter(tx => tx.tipo === 'Efectivo').reduce((sum, tx) => sum + tx.monto, 0);
    const ventasCount = turnoTransacciones.length;
    const ticketPromedio = ventasCount ? Math.round(totalRecaudado / ventasCount) : 0;
    const efectivoCaja = kioscoState.fondoCaja + efectivoVentas;

    const recaudadoEl = document.getElementById('kiosco-recaudado-hoy');
    const ventasEl = document.getElementById('kiosco-ventas-count');
    const ticketEl = document.getElementById('kiosco-ticket-prom');
    const efectivoEl = document.getElementById('kiosco-efectivo-caja');
    const acumEl = document.getElementById('kiosco-total-acum');
    if (recaudadoEl) recaudadoEl.textContent = `$${totalRecaudado.toLocaleString()}`;
    if (ventasEl) ventasEl.textContent = ventasCount.toString();
    if (ticketEl) ticketEl.textContent = `$${ticketPromedio.toLocaleString()}`;
    if (efectivoEl) efectivoEl.textContent = `$${efectivoCaja.toLocaleString()}`;
    if (acumEl) acumEl.textContent = `$${totalRecaudado.toLocaleString()}`;
    kioscoRenderDesglose(turnoTransacciones);
}

function kioscoRenderDesglose(turnoTransacciones) {
    const desgloseEl = document.getElementById('kiosco-desglose');
    if (!desgloseEl) return;

    const total = turnoTransacciones.reduce((sum, tx) => sum + tx.monto, 0);
    const metodos = [
        { key: 'Efectivo', label: 'Efectivo', color: 'from-emerald-400 via-emerald-500 to-emerald-500' },
        { key: 'QR', label: 'QR', color: 'from-sky-400 via-sky-500 to-sky-500' },
        { key: 'Tarjeta', label: 'Tarjeta', color: 'from-violet-400 via-violet-500 to-violet-500' },
        { key: 'Transferencia', label: 'Transferencia', color: 'from-orange-400 via-orange-500 to-orange-500' }
    ];

    if (!total) {
        desgloseEl.innerHTML = '<div class="text-xs text-slate-500">A�n no hay ventas en el turno.</div>';
        return;
    }

    desgloseEl.innerHTML = metodos.map(({ key, label, color }) => {
        const monto = turnoTransacciones.filter(tx => tx.tipo === key).reduce((sum, tx) => sum + tx.monto, 0);
        const porcentaje = total ? Math.round((monto * 100) / total) : 0;
        return `
            <div class="space-y-2">
                <div class="flex justify-between text-xs font-black text-slate-400"><span>${label}</span><span class="text-white">$${monto.toLocaleString()} � ${porcentaje}%</span></div>
                <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r ${color}" style="width: ${porcentaje}%;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderVentasRecientes() {
    const container = document.getElementById('kiosco-transacciones-historial');
    if (!container) return;

    const turnoTransacciones = kioscoObtenerTransaccionesTurno().slice(-6).reverse();
    if (turnoTransacciones.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm text-center py-10">A�n no hay ventas registradas en este turno.</p>';
        return;
    }

    container.innerHTML = turnoTransacciones.map(tx => {
        const badge = getMetodoBadge(tx.tipo);
        return `
            <div class="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-sm font-black text-white truncate">${tx.detalle}</p>
                        <p class="text-[11px] text-slate-500">${tx.fecha}</p>
                    </div>
                    <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text}">
                        <i class="${badge.icon}"></i>${tx.tipo}
                    </span>
                </div>
                <div class="mt-3 flex items-center justify-between text-sm text-slate-300">
                    <span>${tx.cliente}</span>
                    <span class="font-black text-white">$${tx.monto.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getMetodoBadge(metodo) {
    switch (metodo) {
        case 'Efectivo': return { icon: 'fas fa-hand-holding-dollar', bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-300' };
        case 'QR': return { icon: 'fas fa-qrcode', bg: 'bg-sky-500/10 border border-sky-500/20', text: 'text-sky-300' };
        case 'Tarjeta': return { icon: 'fas fa-credit-card', bg: 'bg-violet-500/10 border border-violet-500/20', text: 'text-violet-300' };
        default: return { icon: 'fas fa-exchange-alt', bg: 'bg-orange-500/10 border border-orange-500/20', text: 'text-orange-300' };
    }
}

function kioscoAbrirCierreTurno() {
    const modal = document.getElementById('modal-cierre-turno-kiosco');
    if (!modal) return;
    kioscoRenderCierreTurno();
    modal.classList.add('active');
}

function kioscoCerrarCierreTurno() {
    const modal = document.getElementById('modal-cierre-turno-kiosco');
    if (modal) modal.classList.remove('active');
}

function kioscoRenderCierreTurno() {
    const turnoTransacciones = kioscoObtenerTransaccionesTurno();
    const total = turnoTransacciones.reduce((sum, tx) => sum + tx.monto, 0);
    const ventasCount = turnoTransacciones.length;
    const ticketPromedio = ventasCount ? Math.round(total / ventasCount) : 0;

    const cierreVentasEl = document.getElementById('kiosco-cierre-ventas');
    const cierreRecaudadoEl = document.getElementById('kiosco-cierre-recaudado');
    const cierreTicketEl = document.getElementById('kiosco-cierre-ticket-prom');
    if (cierreVentasEl) cierreVentasEl.textContent = ventasCount.toString();
    if (cierreRecaudadoEl) cierreRecaudadoEl.textContent = `$${total.toLocaleString()}`;
    if (cierreTicketEl) cierreTicketEl.textContent = `$${ticketPromedio.toLocaleString()}`;

    const breakdown = document.getElementById('kiosco-cierre-breakdown');
    const table = document.getElementById('kiosco-cierre-table');
    if (breakdown) breakdown.innerHTML = '';
    if (table) table.innerHTML = '';

    if (turnoTransacciones.length === 0) {
        if (breakdown) breakdown.innerHTML = '<p class="text-xs text-slate-500">Sin ventas en este turno.</p>';
        if (table) table.innerHTML = '<p class="text-xs text-slate-500">No hay registros para mostrar.</p>';
        return;
    }

    const metodos = ['Efectivo', 'QR', 'Tarjeta', 'Transferencia'];
    if (breakdown) {
        breakdown.innerHTML = metodos.map(metodo => {
            const monto = turnoTransacciones.filter(tx => tx.tipo === metodo).reduce((sum, tx) => sum + tx.monto, 0);
            const porcentaje = total ? Math.round((monto * 100) / total) : 0;
            const colors = metodo === 'Efectivo' ? 'from-emerald-400 to-emerald-500' : metodo === 'QR' ? 'from-sky-400 to-sky-500' : metodo === 'Tarjeta' ? 'from-violet-400 to-violet-500' : 'from-orange-400 to-orange-500';
            return `
                <div class="space-y-2">
                    <div class="flex justify-between text-xs font-black text-slate-400"><span>${metodo}</span><span class="text-white">$${monto.toLocaleString()} � ${porcentaje}%</span></div>
                    <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r ${colors}" style="width:${porcentaje}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (table) {
        table.innerHTML = turnoTransacciones.map((tx, index) => `
            <div class="grid grid-cols-[1fr_1.2fr_0.8fr] gap-4 items-center rounded-3xl border border-slate-800 bg-slate-900/90 p-3 text-[11px] text-slate-300">
                <div><span class="font-black text-white">#${index + 1}</span><p class="text-slate-500">${tx.fecha}</p></div>
                <div><span class="font-black text-white">${tx.detalle}</span></div>
                <div class="text-right"><span class="font-black text-white">$${tx.monto.toLocaleString()}</span><p class="mt-1 ${getMetodoBadge(tx.tipo).text}">${tx.tipo}</p></div>
            </div>
        `).join('');
    }
}

function kioscoConfirmarCierreTurno() {
    const turnoTransacciones = kioscoObtenerTransaccionesTurno();
    const total = turnoTransacciones.reduce((sum, tx) => sum + tx.monto, 0);
    kioscoCerrarCierreTurno();
    kioscoState.fondoCaja = 0;
    kioscoState.carrito = [];
    kioscoState.metodoPago = 'Efectivo';
    kioscoState.turnoId = `turno-${Date.now()}`;
    actualizarCajaEstado();
    actualizarMetodoPagoVisual();
    renderCart();
    actualizarKPIs();
    renderVentasRecientes();
    solicitarAperturaCaja();
    kioscoMostrarToast(`Turno cerrado. Total recaudado: $${total.toLocaleString()}`);
}

function kioscoExportarVentasTurno() {
    const turnoTransacciones = kioscoObtenerTransaccionesTurno();
    if (turnoTransacciones.length === 0) {
        kioscoMostrarToast('No hay ventas del turno para exportar.', 'error');
        return;
    }

    const filas = turnoTransacciones.map(tx => {
        const detalle = tx.detalle.replace(/\t/g, ' ');
        return `${tx.fecha}\t${tx.tipo}\t${detalle}\t$${tx.monto.toLocaleString()}`;
    }).join('\n');

    const txt = `Fecha\tM�todo\tDetalle\tMonto\n${filas}`;
    const enlace = document.createElement('a');
    enlace.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
    enlace.download = `ventas_turno_${new Date().toISOString().slice(0,10)}.txt`;
    enlace.click();
    kioscoMostrarToast('Archivo de ventas descargado correctamente.');
}

function kioscoMostrarToast(message, tone = 'success') {
    const toast = document.getElementById('kiosco-toast');
    if (!toast) return;

    toast.className = 'fixed right-6 bottom-6 z-50 rounded-3xl border px-6 py-4 text-sm shadow-2xl backdrop-blur-xl transition-all duration-300';
    toast.classList.add('opacity-100');
    toast.classList.remove('hidden');
    toast.textContent = message;

    if (tone === 'error') {
        toast.classList.add('border-red-500/40', 'bg-red-500/15', 'text-red-200');
        toast.classList.remove('border-orange-500/40', 'bg-slate-900/95', 'text-white');
    } else {
        toast.classList.add('border-orange-500/40', 'bg-slate-900/95', 'text-white');
        toast.classList.remove('border-red-500/40', 'bg-red-500/15', 'text-red-200');
    }

    clearTimeout(window.kioscoToastTimeout);
    window.kioscoToastTimeout = setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, 3500);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarKiosco);
} else {
    iniciarKiosco();
}
