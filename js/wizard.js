let mockAlumnos = [
  { dni: '87654321', nombre: 'Melisa Lopez', clase: 'Musculación', deuda: 0, estado: 'ACREDITADO', fechaPago: '05/05/2026' },
  { dni: '12345678', nombre: 'Valentino Perez', clase: 'Zumba', deuda: 31500, estado: 'PENDIENTE', fechaPago: '10/04/2026' },
  { dni: '88888888', nombre: 'Lionel Messi', clase: 'Musculación + Zumba', deuda: 0, estado: 'ACREDITADO', fechaPago: '12/05/2026' },
  { dni: '35123456', nombre: 'Pozzer', clase: 'Crossfit', deuda: 40000, estado: 'EN MORA', fechaPago: '15/03/2026' },
  { dni: '23000001', nombre: 'Emiliano Martinez', clase: 'Crossfit', deuda: 0, estado: 'ACREDITADO', fechaPago: '08/05/2026' },
  { dni: '23000002', nombre: 'Nicolas Otamendi', clase: 'Musculación', deuda: 25000, estado: 'PENDIENTE', fechaPago: '05/04/2026' },
  { dni: '23000003', nombre: 'Cristian Romero', clase: 'Crossfit', deuda: 40000, estado: 'EN MORA', fechaPago: '20/03/2026' },
  { dni: '23000004', nombre: 'Rodrigo De Paul', clase: 'Zumba', deuda: 0, estado: 'ACREDITADO', fechaPago: '14/05/2026' },
  { dni: '23000005', nombre: 'Leandro Paredes', clase: 'Musculación', deuda: 0, estado: 'ACREDITADO', fechaPago: '02/05/2026' },
  { dni: '23000006', nombre: 'Enzo Fernandez', clase: 'Zumba + Crossfit', deuda: 71500, estado: 'EN MORA', fechaPago: '12/03/2026' },
  { dni: '23000007', nombre: 'Alexis Mac Allister', clase: 'Musculación', deuda: 25000, estado: 'PENDIENTE', fechaPago: '07/04/2026' },
  { dni: '23000008', nombre: 'Angel Di Maria', clase: 'Crossfit', deuda: 0, estado: 'ACREDITADO', fechaPago: '11/05/2026' },
  { dni: '23000009', nombre: 'Julian Alvarez', clase: 'Zumba', deuda: 31500, estado: 'PENDIENTE', fechaPago: '14/04/2026' },
  { dni: '23000010', nombre: 'Lautaro Martinez', clase: 'Musculación', deuda: 0, estado: 'ACREDITADO', fechaPago: '16/05/2026' }
];

function calcularFechaVencimiento(estado) {
    const hoy = new Date();
    let anio = hoy.getFullYear();
    let mes = hoy.getMonth(); // 0-indexed (4 = Mayo)
    
    if (estado === 'ACREDITADO') {
        // Al día: El día 1 del próximo mes
        mes += 1;
        if (mes > 11) {
            mes = 0;
            anio += 1;
        }
    } else if (estado === 'PENDIENTE') {
        // Pendiente: El día 1 del mes actual (vencido a principio de mes)
    } else if (estado === 'EN MORA') {
        // En Mora: El día 1 del mes anterior (vencido hace más de 30 días)
        mes -= 1;
        if (mes < 0) {
            mes = 11;
            anio -= 1;
        }
    }
    
    const mesStr = String(mes + 1).padStart(2, '0');
    const anioStr = String(anio);
    return `01/${mesStr}/${anioStr}`;
}

function filtrarSocios() {
    const busq = document.getElementById('search-socio')?.value.toLowerCase() || '';
    const estado = document.getElementById('filter-estado')?.value || 'todos';
    const clase = document.getElementById('filter-clase')?.value || 'todos';
    const mesPago = document.getElementById('filter-mes-pago')?.value || 'todos';

    const isEncargado = (typeof rRol !== 'undefined' && rRol === 'encargado');
    const btnNuevoCobro = document.getElementById('btn-nuevo-cobro');
    if (btnNuevoCobro) {
        btnNuevoCobro.style.display = isEncargado ? 'none' : 'flex';
    }

    let lista = mockAlumnos.filter(s => {
        const matchBusq = s.nombre.toLowerCase().includes(busq) || s.dni.includes(busq);
        const matchEstado = estado === 'todos' || s.estado.toLowerCase() === estado.toLowerCase();
        const matchClase = clase === 'todos' || s.clase.toLowerCase() === clase.toLowerCase();
        
        let matchMes = true;
        if (mesPago !== 'todos') {
            if (mesPago === '05') {
                // Mayo 2026 es el período actual: mostramos a todos los alumnos
                // (incluyendo Acreditados, Pendientes y Morosos) para ver y operar sus cobros.
                matchMes = true;
            } else {
                // Meses anteriores (04, 03, etc.): mostramos solo alumnos que ya tenían pagos registrados en ese período o posterior.
                if (s.fechaPago && s.fechaPago !== '—') {
                    const parts = s.fechaPago.split('/');
                    const mesSocio = parseInt(parts[1], 10);
                    const mesBuscado = parseInt(mesPago, 10);
                    matchMes = (mesSocio >= mesBuscado);
                } else {
                    matchMes = false;
                }
            }
        }
        
        return matchBusq && matchEstado && matchClase && matchMes;
    });

    const tbody = document.getElementById('tabla-socios-body');
    if (!tbody) return;

    tbody.innerHTML = lista.map(s => {
        // Determinar el mes que estamos visualizando
        const mesVisualizado = (mesPago === 'todos') ? '05' : mesPago;

        let estadoParaMostrar = s.estado;
        let deudaParaMostrar = s.deuda;
        let fechaPagoParaMostrar = s.fechaPago;
        let vencimientoParaMostrar = '';

        if (mesVisualizado !== '05') {
            // Mes histórico (Abril, Marzo, etc.): el pago de ese período está acreditado históricamente
            estadoParaMostrar = 'ACREDITADO';
            deudaParaMostrar = 0;

            // Consistencia en Fecha de Pago: Cambiar el mes de la fecha registrada para que corresponda al mes filtrado
            if (s.fechaPago && s.fechaPago !== '—') {
                const parts = s.fechaPago.split('/');
                const dia = parts[0];
                const anio = parts[2] || '2026';
                fechaPagoParaMostrar = `${dia}/${mesVisualizado}/${anio}`;
            }

            // Consistencia en Vencimiento: El primer día del mes siguiente al filtrado
            const proxMes = String(parseInt(mesVisualizado, 10) + 1).padStart(2, '0');
            const anioVenc = (proxMes === '13') ? '2027' : '2026';
            const proxMesClean = (proxMes === '13') ? '01' : proxMes;
            vencimientoParaMostrar = `01/${proxMesClean}/${anioVenc}`;
        } else {
            // Mes de Mayo (Actual):
            // Los alumnos PENDIENTE/EN MORA no tienen un pago registrado para Mayo
            if (s.estado === 'PENDIENTE' || s.estado === 'EN MORA') {
                fechaPagoParaMostrar = '—';
            }
            vencimientoParaMostrar = calcularFechaVencimiento(s.estado);
        }

        let bgEstado = 'rgba(34,197,94,0.12)';
        let colorEstado = '#4ade80';
        let borderEstado = 'rgba(34,197,94,0.3)';

        if (estadoParaMostrar === 'PENDIENTE') {
            bgEstado = 'rgba(249,115,22,0.12)'; // Naranja
            colorEstado = '#f97316';
            borderEstado = 'rgba(249,115,22,0.3)';
        } else if (estadoParaMostrar === 'EN MORA') {
            bgEstado = 'rgba(239,68,68,0.12)'; // Rojo
            colorEstado = '#f87171';
            borderEstado = 'rgba(239,68,68,0.3)';
        }
        
        return `
            <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                <td class="p-4">
                    <p class="text-white font-bold italic uppercase">${s.nombre}</p>
                    <p class="text-[9px] text-slate-500">DNI: ${s.dni}</p>
                </td>
                <td class="p-4 text-slate-400 text-xs">${s.dni}</td>
                <td class="p-4 text-slate-400 text-xs">${s.clase}</td>
                <td class="p-4 text-slate-400 text-xs font-mono">${fechaPagoParaMostrar}</td>
                <td class="p-4 text-slate-400 text-xs font-mono">${vencimientoParaMostrar}</td>
                <td class="p-4 font-black ${(estadoParaMostrar === 'PENDIENTE' || estadoParaMostrar === 'EN MORA') ? 'text-orange-400' : 'text-slate-500'}">
                    ${(estadoParaMostrar === 'PENDIENTE' || estadoParaMostrar === 'EN MORA') ? '$' + deudaParaMostrar.toLocaleString() : '—'}
                </td>
                <td class="p-4">
                    <span style="padding:2px 10px; border-radius:9999px; font-size:9px; font-weight:900; text-transform:uppercase;
                        background:${bgEstado};
                        color:${colorEstado};
                        border:1px solid ${borderEstado};">
                        ${estadoParaMostrar}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <button onclick="cobrarSocio('${s.dni}')" 
                            class="bg-slate-700 hover:bg-slate-600 text-white text-[10px] px-4 py-2 rounded-full transition font-black uppercase tracking-tighter">
                        VER
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function cobrarSocio(dni) {
    const s = mockAlumnos.find(x => x.dni === dni);
    const box = document.getElementById('cliente-box');

    if (s && box) {
        window.socioActual = s; 
        document.getElementById('display-nombre').innerText = s.nombre;
        document.getElementById('display-id').innerText = "#" + s.dni.slice(-4);

        const container = document.getElementById('lista-deudas');
        container.innerHTML = ""; 

        const panelAcciones = document.getElementById('panel-acciones-rapidas');
        if (panelAcciones) panelAcciones.style.display = 'block';

        if (s.deuda > 0) {
            document.getElementById('display-total-cobro').innerText = '$' + s.deuda.toLocaleString();

            container.innerHTML += `
                <div class="flex justify-between items-center bg-slate-800/50 border border-slate-700 p-3 rounded italic mb-2">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" class="cuota-checkbox w-4 h-4 accent-orange-500" 
                               data-monto="${s.deuda}" data-mes="Cuota Pendiente" checked onchange="window.actualizarTotalCobro()" style="display:none;">
                        <div>
                            <p class="text-white font-black text-sm">Cuota Pendiente</p>
                            <p class="text-[9px] text-red-400 font-bold uppercase">Deuda</p>
                        </div>
                    </div>
                    <span class="text-xl font-black text-white">$${s.deuda.toLocaleString()}</span>
                </div>`;
            window.actualizarTotalCobro && window.actualizarTotalCobro();
        } else {
            document.getElementById('display-total-cobro').innerText = '$0';
            container.innerHTML = `
                <div class="bg-green-500/10 border border-green-500/20 p-4 rounded text-center mb-4">
                    <p class="text-green-500 font-black text-xs uppercase tracking-widest">Socio al día</p>
                </div>
            `;
        }

        box.classList.remove('hidden');
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function cobrarPago() {
    if (!window.socioActual) return;
    
    if (window.socioActual.estado === 'ACREDITADO') {
        alert("El usuario ya se encuentra al día con sus cuotas.");
        return;
    }
    
    // Es deudor
    document.getElementById('cliente-box').classList.add('hidden');
    abrirWizardPaso1();
    
    // Autocompletar DNI y disparar validación
    const dniInput = document.getElementById('wiz-dni');
    if(dniInput) {
        dniInput.value = window.socioActual.dni;
        // disparar el evento input
        dniInput.dispatchEvent(new Event('input'));
    }
}

/* WIZARD LOGIC */
function inicializarPreciosPlanesWizard() {
    if (typeof planesDB === 'undefined') return;
    const list = document.querySelectorAll('.wiz-act-checkbox');
    list.forEach(cb => {
        const plan = planesDB.find(p => p.nombre.toLowerCase() === cb.value.toLowerCase());
        if (plan) {
            cb.dataset.price = plan.precioBase;
            const textEl = cb.closest('label').querySelector('.font-black');
            if (textEl) {
                textEl.textContent = `$${plan.precioBase.toLocaleString('es-AR')}`;
            }
        }
    });
}

function abrirWizardPaso1() {
    inicializarPreciosPlanesWizard();
    document.getElementById('modal-wizard-1').classList.remove('hidden');
    document.getElementById('wiz-dni').value = '';
    document.getElementById('wiz-nombre').value = '';
    document.getElementById('wiz-msg-socio').classList.add('hidden');
    document.getElementById('wiz-prorrateo').checked = false;
    
    document.querySelectorAll('.wiz-act-checkbox').forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
        cb.closest('label').querySelector('.badge-pagado').classList.add('hidden');
    });
    
    const fechaInput = document.getElementById('wiz-fecha');
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
    
    calcularSubtotalWizard();
}

function cerrarModalWizard(id) {
    document.getElementById(id).classList.add('hidden');
}

// Escuchar input de DNI en Wizard
document.addEventListener('DOMContentLoaded', () => {
    const dniInput = document.getElementById('wiz-dni');
    if(dniInput) {
        dniInput.addEventListener('input', (e) => {
            validarSocioWizard(e.target.value);
        });
    }
    
    document.querySelectorAll('.wiz-act-checkbox').forEach(cb => {
        cb.addEventListener('change', calcularSubtotalWizard);
    });
    
    const proCheck = document.getElementById('wiz-prorrateo');
    if(proCheck) {
        proCheck.addEventListener('change', calcularSubtotalWizard);
    }
    
    const fechaInput = document.getElementById('wiz-fecha');
    if(fechaInput) {
        fechaInput.addEventListener('change', calcularSubtotalWizard);
    }
    
    const btnPaso2 = document.getElementById('btn-continuar-paso2');
    if(btnPaso2) {
        btnPaso2.addEventListener('click', irPaso2Wizard);
    }
});

function validarSocioWizard(dni) {
    const msg = document.getElementById('wiz-msg-socio');
    const inputNombre = document.getElementById('wiz-nombre');
    const proCheck = document.getElementById('wiz-prorrateo');
    
    if (dni.length < 7) {
        msg.classList.add('hidden');
        inputNombre.value = '';
        inputNombre.readOnly = false;
        document.querySelectorAll('.wiz-act-checkbox').forEach(cb => {
            cb.disabled = false;
            cb.closest('label').querySelector('.badge-pagado').classList.add('hidden');
        });
        proCheck.checked = false;
        calcularSubtotalWizard();
        return;
    }
    
    const socio = mockAlumnos.find(s => s.dni === dni);
    msg.classList.remove('hidden');
    
    if (socio) {
        // SOCIO EXISTENTE
        inputNombre.value = socio.nombre;
        inputNombre.readOnly = true;
        msg.innerHTML = '<i class="fas fa-check-circle"></i> Socio encontrado en la base de datos';
        msg.className = 'mt-2 text-xs font-medium text-emerald-500';
        
        const preciosFix = {};
        if (typeof planesDB !== 'undefined') {
            planesDB.forEach(p => {
                preciosFix[p.nombre] = p.precioBase;
            });
        } else {
            preciosFix['Musculación'] = 25000;
            preciosFix['Zumba'] = 31500;
            preciosFix['Crossfit'] = 40000;
        }
        const clasesDelAlumno = socio.clase.split(' + ').map(c => c.trim());
        
        let clasesAdeudadas = [];
        if (socio.deuda > 0) {
            const subsets = (arr) => arr.reduce((sub, value) => sub.concat(sub.map(set => [value,...set])), [[]]);
            const allSubsets = subsets(clasesDelAlumno);
            for (let subset of allSubsets) {
                let sum = subset.reduce((a, b) => a + (preciosFix[b] || 0), 0);
                if (Math.abs(sum - socio.deuda) < 2) {
                    clasesAdeudadas = subset;
                    break;
                }
            }
            // Fallback robusto: si el socio tiene deuda, asumimos que adeuda todas sus clases si el subset no coincidió exacto
            if (clasesAdeudadas.length === 0) {
                clasesAdeudadas = clasesDelAlumno;
            }
        }

        document.querySelectorAll('.wiz-act-checkbox').forEach(cb => {
            const actName = cb.value;

            if (!clasesDelAlumno.includes(actName)) {
                // REGLA A (Clase Nueva)
                cb.checked = false;
                cb.disabled = false;
                cb.closest('label').querySelector('.badge-pagado').classList.add('hidden');
            } else {
                if (clasesAdeudadas.includes(actName)) {
                    // REGLA B (Clase que Adeuda)
                    cb.checked = true;
                    cb.disabled = false;
                    cb.closest('label').querySelector('.badge-pagado').classList.add('hidden');
                } else {
                    // REGLA C (Clase ya Pagada)
                    cb.checked = true;
                    cb.disabled = true;
                    cb.closest('label').querySelector('.badge-pagado').classList.remove('hidden');
                }
            }
        });
        
        proCheck.checked = false;
    } else {
        // SOCIO NUEVO
        inputNombre.value = '';
        inputNombre.readOnly = false;
        msg.innerHTML = '<i class="fas fa-info-circle"></i> Socio nuevo. Se aplicará prorrateo automáticamente.';
        msg.className = 'mt-2 text-xs font-medium text-orange-400';
        
        document.querySelectorAll('.wiz-act-checkbox').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
            cb.closest('label').querySelector('.badge-pagado').classList.add('hidden');
        });
        
        proCheck.checked = true;
    }
    
    calcularSubtotalWizard();
}

function calcularSubtotalWizard() {
    inicializarPreciosPlanesWizard();

    let costoBase = 0;
    let costoNuevo = 0;
    const proCheck = document.getElementById('wiz-prorrateo');
    const dni = document.getElementById('wiz-dni').value.trim();
    const socio = mockAlumnos.find(s => s.dni === dni);
    let tieneActividadNueva = false;

    const checkboxes = document.querySelectorAll('.wiz-act-checkbox:checked:not(:disabled)');
    
    checkboxes.forEach(cb => {
        let price = parseFloat(cb.dataset.price);
        if (socio && socio.clase.includes(cb.value)) {
            costoBase += price;
        } else {
            costoNuevo += price;
            tieneActividadNueva = true;
        }
    });
    
    if (socio) {
        if (proCheck) {
            proCheck.disabled = !tieneActividadNueva;
            if (!tieneActividadNueva) {
                proCheck.checked = false;
            }
        }
    } else {
        if (proCheck) proCheck.disabled = false;
    }

    // Calcular prorrateo basado en la fecha seleccionada
    const fechaInput = document.getElementById('wiz-fecha');
    const fechaSeleccionada = fechaInput && fechaInput.value ? new Date(fechaInput.value + 'T00:00:00') : new Date();
    const day = fechaSeleccionada.getDate();
    const totalDays = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0).getDate();
    const remainingDays = totalDays - day + 1;
    const ratioProrrateo = remainingDays / totalDays;

    // Actualizar texto en la interfaz indicando los días restantes
    const descProrrateo = document.querySelector('#wiz-prorrateo ~ div span.text-slate-400');
    if (descProrrateo) {
        descProrrateo.textContent = `Prorrateo del primer mes: paga solo los ${remainingDays} días restantes de este mes (${Math.round(ratioProrrateo * 100)}%).`;
    }

    if (proCheck && proCheck.checked) {
        costoNuevo = Math.round(costoNuevo * ratioProrrateo); // Prorrateo dinámico exacto
    }
    
    const subtotal = costoBase + costoNuevo;
    currentSubtotalWizardOriginal = subtotal;
    
    const displayTotal = document.getElementById('wiz-subtotal');
    if(displayTotal) displayTotal.innerText = '$' + subtotal.toLocaleString('es-AR');
    
    const btn = document.getElementById('btn-continuar-paso2');
    if(btn) {
        btn.disabled = (subtotal === 0);
    }
}

function irPaso2Wizard() {
    const dni = document.getElementById('wiz-dni').value.trim();
    const nombre = document.getElementById('wiz-nombre').value.trim();
    
    if(!dni || !nombre) {
        alert("Completá los datos del socio");
        return;
    }
    
    document.getElementById('modal-wizard-1').classList.add('hidden');
    document.getElementById('modal-wizard-2').classList.remove('hidden');
    
    document.getElementById('wiz2-socio').innerText = nombre;
    document.getElementById('wiz2-total').innerText = document.getElementById('wiz-subtotal').innerText;
    document.getElementById('wiz2-total-tachado').classList.add('hidden');
    const inputCupon = document.getElementById('wiz-cupon');
    if(inputCupon) inputCupon.value = "";
    const msgCupon = document.getElementById('wiz-msg-cupon');
    if(msgCupon) msgCupon.classList.add('hidden');
}

function volverPaso1Wizard() {
    document.getElementById('modal-wizard-2').classList.add('hidden');
    document.getElementById('modal-wizard-1').classList.remove('hidden');
}

let lastTx = {};
let currentSubtotalWizardOriginal = 0;

function aplicarCuponWizard() {
    const cuponInput = document.getElementById('wiz-cupon');
    const msg = document.getElementById('wiz-msg-cupon');
    const totalDisplay = document.getElementById('wiz2-total');
    const tachadoDisplay = document.getElementById('wiz2-total-tachado');
    
    if(!cuponInput) return;
    
    const code = cuponInput.value.trim().toUpperCase();
    const originalTotal = currentSubtotalWizardOriginal;
    
    if (code === "CROSS20") {
        let hasCrossfit = false;
        document.querySelectorAll('.wiz-act-checkbox:checked').forEach(cb => {
            if (cb.value === "Crossfit") hasCrossfit = true;
        });
        
        if (!hasCrossfit) {
            alert("El cupón CROSS20 solo es válido para la actividad Crossfit.");
            return;
        }

        const newTotal = originalTotal - 8000;
        
        tachadoDisplay.innerText = '$' + originalTotal.toLocaleString('es-AR');
        tachadoDisplay.classList.remove('hidden');
        
        totalDisplay.innerText = '$' + newTotal.toLocaleString('es-AR');
        
        msg.innerText = "¡Cupón aplicado! 20% de descuento";
        msg.className = "text-[10px] font-bold mt-2 text-emerald-500 block";
    } else {
        tachadoDisplay.classList.add('hidden');
        totalDisplay.innerText = '$' + originalTotal.toLocaleString('es-AR');
        
        msg.innerText = "Cupón inválido.";
        msg.className = "text-[10px] font-bold mt-2 text-red-500 block";
    }
}

function procesarPagoWizard(metodo) {
    const total = document.getElementById('wiz2-total').innerText;
    const nombre = document.getElementById('wiz-nombre').value.trim();
    const dni = document.getElementById('wiz-dni').value.trim();
    const fechaInput = document.getElementById('wiz-fecha')?.value || new Date().toISOString().split('T')[0];
    
    // Obtener actividades
    const actividades = [];
    document.querySelectorAll('.wiz-act-checkbox:checked').forEach(cb => {
        actividades.push(cb.value);
    });
    
    // Convertir a formato DD/MM/YYYY local
    const [year, month, day] = fechaInput.split('-');
    const fechaAR = `${day}/${month}/${year}`;
    
    lastTx = {
        dni, nombre, total, metodo, actividades: actividades.join(' + '), fecha: fechaAR
    };
    
    if (metodo === 'Efectivo') {
        document.getElementById('modal-wizard-2').classList.add('hidden');
        iniciarProcesamientoCobro();
    } else if (metodo === 'QR') {
        document.getElementById('modal-wizard-2').classList.add('hidden');
        document.getElementById('modal-wizard-qr').classList.remove('hidden');
    } else if (metodo === 'Transferencia') {
        document.getElementById('modal-wizard-2').classList.add('hidden');
        document.getElementById('modal-wizard-transf').classList.remove('hidden');
    } else if (metodo === 'Tarjeta') {
        document.getElementById('modal-wizard-2').classList.add('hidden');
        document.getElementById('modal-wizard-tarjeta').classList.remove('hidden');
    }
}

function volverDesdeSubpaso(idModal) {
    document.getElementById(idModal).classList.add('hidden');
    document.getElementById('modal-wizard-2').classList.remove('hidden');
}

function finalizarSubpaso(metodoFinal, idModal) {
    if (metodoFinal === 'Transferencia') {
        const cbu = document.getElementById('transf-cbu')?.value.trim();
        const comp = document.getElementById('transf-comp')?.value.trim();
        if (!cbu || !comp) {
            alert("Por favor, complete todos los datos requeridos para procesar el pago.");
            return;
        }
    } else if (metodoFinal === 'Tarjeta') {
        const nom = document.getElementById('tarjeta-nombre')?.value.trim();
        const num = document.getElementById('tarjeta-num')?.value.trim();
        const venc = document.getElementById('tarjeta-venc')?.value.trim();
        const cvv = document.getElementById('tarjeta-cvv')?.value.trim();
        if (!nom || !num || !venc || !cvv) {
            alert("Por favor, complete todos los datos requeridos para procesar el pago.");
            return;
        }
    }

    document.getElementById(idModal).classList.add('hidden');
    lastTx.metodo = metodoFinal;
    iniciarProcesamientoCobro();
}

function iniciarProcesamientoCobro() {
    const procModal = document.getElementById('modal-wizard-procesando');
    if (procModal) procModal.classList.remove('hidden');
    
    setTimeout(() => {
        if (procModal) procModal.classList.add('hidden');
        abrirPaso3Wizard();
    }, 2000);
}

function abrirPaso3Wizard() {
    document.getElementById('modal-wizard-3').classList.remove('hidden');
    
    document.getElementById('wiz-rec-fecha').innerText = lastTx.fecha;
    document.getElementById('wiz-rec-comp').innerText = "#" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('wiz-rec-socio').innerText = lastTx.nombre;
    document.getElementById('wiz-rec-metodo').innerText = lastTx.metodo;
    document.getElementById('wiz-rec-total').innerText = lastTx.total;
    
    document.getElementById('wiz-rec-conceptos').innerHTML = `<p>${lastTx.actividades}</p>`;
    
    procesarPagoExitoso(lastTx);
}

function descargarPdfReciboWizard(tx) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("La librería jsPDF no está cargada.");
        return;
    }

    const { jsPDF } = window.jspdf;
    // Creamos un PDF tamaño personalizado para que parezca un recibo (ej: 100mm x 140mm)
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [100, 140] });

    // Fondo oscuro (#0f172a)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 100, 140, 'F');
    
    // Cabecera naranja (#f97316)
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 100, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO ELECTRÓNICO", 8, 10);
    
    // Subcabecera
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139); // text-slate-500
    doc.text("SQUATGYM SA", 8, 24);
    doc.text(tx.fecha, 92, 24, { align: "right" });
    
    // Línea separadora
    doc.setDrawColor(51, 65, 85); // border-slate-700
    doc.line(8, 27, 92, 27);
    
    // Datos del recibo
    let startY = 35;
    const lineHeight = 8;
    
    doc.setFontSize(8);
    
    // N° Comprobante
    const randomComp = Math.floor(100000 + Math.random() * 900000);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184); // text-slate-400
    doc.text("N° Comprobante", 8, startY);
    doc.setTextColor(249, 115, 22); // text-orange-400
    doc.text(`#${randomComp}`, 92, startY, { align: "right" });
    startY += lineHeight;
    
    // Socio
    doc.setTextColor(148, 163, 184);
    doc.text("Socio", 8, startY);
    doc.setTextColor(255, 255, 255);
    doc.text(`${tx.nombre.toUpperCase()} — DNI: ${tx.dni}`, 92, startY, { align: "right" });
    startY += lineHeight;
    
    // Concepto
    doc.setTextColor(148, 163, 184);
    doc.text("Concepto", 8, startY);
    doc.setTextColor(255, 255, 255);
    doc.text(tx.actividades.toUpperCase(), 92, startY, { align: "right" });
    startY += lineHeight;
    
    // Método
    doc.setTextColor(148, 163, 184);
    doc.text("Método", 8, startY);
    doc.setTextColor(255, 255, 255);
    doc.text(tx.metodo.toUpperCase(), 92, startY, { align: "right" });
    
    // Línea separadora
    startY += 6;
    doc.setDrawColor(51, 65, 85);
    doc.line(8, startY, 92, startY);
    startY += 8;
    
    // Total
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225); // text-slate-300
    doc.text("Total Abonado", 8, startY);
    doc.setFontSize(16);
    doc.setTextColor(74, 222, 128); // text-green-400
    doc.text(tx.total, 92, startY, { align: "right" });
    
    // Badge de Acreditado
    startY += 12;
    doc.setDrawColor(34, 197, 94); // border-green-500
    doc.roundedRect(8, startY, 84, 10, 2, 2, 'D');
    doc.setFontSize(7);
    doc.setTextColor(74, 222, 128); // text-green-400
    doc.text("PAGO ACREDITADO", 50, startY + 6.5, { align: "center" });
    
    // Texto legal
    startY += 18;
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105); // text-slate-600
    doc.text("COMPROBANTE VÁLIDO COMO RECIBO DE PAGO", 50, startY, { align: "center" });

    // Guardar el PDF
    doc.save(`Recibo_${randomComp}_SquatGym.pdf`);
    
    // Mostrar Toast de éxito
    if (typeof kioscoMostrarToast === 'function') {
        kioscoMostrarToast('¡Cobro registrado con éxito! Descargando recibo...', 'success');
    } else {
        alert('¡Cobro registrado con éxito! Descargando recibo...');
    }
}

function procesarPagoExitoso(tx) {
    const socioIdx = mockAlumnos.findIndex(s => s.dni === tx.dni);
    
    if (socioIdx >= 0) {
        const clasesNuevas = tx.actividades.split(' + ').map(x => x.trim());
        const clasesViejas = mockAlumnos[socioIdx].clase.split(' + ').map(x => x.trim());
        
        // Solo si se está pagando alguna de las clases que ya tenía (por las que es deudor)
        const pagaDeuda = clasesViejas.some(c => clasesNuevas.includes(c));
        
        if (pagaDeuda || mockAlumnos[socioIdx].estado === 'ACREDITADO') {
            mockAlumnos[socioIdx].estado = 'ACREDITADO';
            mockAlumnos[socioIdx].deuda = 0;
            mockAlumnos[socioIdx].fechaPago = tx.fecha; // ¡Registrar la fecha de pago real!
        }
        
        const clasesSet = new Set([...clasesViejas, ...clasesNuevas]);
        mockAlumnos[socioIdx].clase = Array.from(clasesSet).join(' + ');
        
    } else {
        // Nuevo socio
        mockAlumnos.push({
            dni: tx.dni,
            nombre: tx.nombre,
            clase: tx.actividades,
            deuda: 0,
            estado: 'ACREDITADO',
            fechaPago: tx.fecha // ¡Registrar la fecha de pago real!
        });
    }
    
    window.filtrarSocios && window.filtrarSocios();
}

function finalizarCobroWizard() {
    cerrarModalWizard('modal-wizard-3');
}

function inicializarDebitosAlumnos() {
    if (typeof planesDB === 'undefined') return;
    mockAlumnos.forEach(alumno => {
        if (alumno.estado === 'PENDIENTE' || alumno.estado === 'EN MORA') {
            const clases = alumno.clase.split('+').map(c => c.trim());
            let totalDeuda = 0;
            clases.forEach(c => {
                const plan = planesDB.find(p => p.nombre.toLowerCase() === c.toLowerCase());
                if (plan) {
                    totalDeuda += plan.precioBase;
                }
            });
            alumno.deuda = totalDeuda || alumno.deuda;
        } else {
            alumno.deuda = 0;
        }
    });
}

// Intercept window.onload or DOMContentLoaded to render our mock table
document.addEventListener('DOMContentLoaded', () => {
    // Sobrescribir globales de socios.js
    window.filtrarSocios = filtrarSocios;
    window.cobrarSocio = cobrarSocio;
    window.cobrarPago = cobrarPago;
    window.aplicarCuponWizard = aplicarCuponWizard;
    window.actualizarTotalCobro = actualizarTotalCobro;
    
    inicializarDebitosAlumnos(); // Alinear deudas con configuración de planes
    
    setTimeout(() => {
        filtrarSocios();
    }, 500);
});
