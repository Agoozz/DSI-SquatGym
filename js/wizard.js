let mockAlumnos = [
  { dni: '87654321', nombre: 'Melisa Lopez', clase: 'Musculación', deuda: 0, estado: 'ACREDITADO' },
  { dni: '12345678', nombre: 'Valentino Perez', clase: 'Zumba', deuda: 31500, estado: 'PENDIENTE' },
  { dni: '88888888', nombre: 'Lionel Messi', clase: 'Musculación + Zumba', deuda: 0, estado: 'ACREDITADO' },
  { dni: '35123456', nombre: 'Pozzer', clase: 'Crossfit', deuda: 40000, estado: 'EN MORA' },
  { dni: '23000001', nombre: 'Emiliano Martinez', clase: 'Crossfit', deuda: 0, estado: 'ACREDITADO' },
  { dni: '23000002', nombre: 'Nicolas Otamendi', clase: 'Musculación', deuda: 25000, estado: 'PENDIENTE' },
  { dni: '23000003', nombre: 'Cristian Romero', clase: 'Crossfit', deuda: 40000, estado: 'EN MORA' },
  { dni: '23000004', nombre: 'Rodrigo De Paul', clase: 'Zumba', deuda: 0, estado: 'ACREDITADO' },
  { dni: '23000005', nombre: 'Leandro Paredes', clase: 'Musculación', deuda: 0, estado: 'ACREDITADO' },
  { dni: '23000006', nombre: 'Enzo Fernandez', clase: 'Zumba + Crossfit', deuda: 71500, estado: 'EN MORA' },
  { dni: '23000007', nombre: 'Alexis Mac Allister', clase: 'Musculación', deuda: 25000, estado: 'PENDIENTE' },
  { dni: '23000008', nombre: 'Angel Di Maria', clase: 'Crossfit', deuda: 0, estado: 'ACREDITADO' },
  { dni: '23000009', nombre: 'Julian Alvarez', clase: 'Zumba', deuda: 31500, estado: 'PENDIENTE' },
  { dni: '23000010', nombre: 'Lautaro Martinez', clase: 'Musculación', deuda: 0, estado: 'ACREDITADO' }
];

function filtrarSocios() {
    const busq = document.getElementById('search-socio')?.value.toLowerCase() || '';
    const estado = document.getElementById('filter-estado')?.value || 'todos';
    const clase = document.getElementById('filter-clase')?.value || 'todos';

    const isEncargado = (typeof rRol !== 'undefined' && rRol === 'encargado');
    const btnNuevoCobro = document.getElementById('btn-nuevo-cobro');
    if (btnNuevoCobro) {
        btnNuevoCobro.style.display = isEncargado ? 'none' : 'flex';
    }

    let lista = mockAlumnos.filter(s => {
        const matchBusq = s.nombre.toLowerCase().includes(busq) || s.dni.includes(busq);
        const matchEstado = estado === 'todos' || s.estado.toLowerCase() === estado.toLowerCase();
        const matchClase = clase === 'todos' || s.clase.toLowerCase() === clase.toLowerCase();
        return matchBusq && matchEstado && matchClase;
    });

    const tbody = document.getElementById('tabla-socios-body');
    if (!tbody) return;

    tbody.innerHTML = lista.map(s => {
        let bgEstado = 'rgba(34,197,94,0.12)';
        let colorEstado = '#4ade80';
        let borderEstado = 'rgba(34,197,94,0.3)';

        if (s.estado === 'PENDIENTE') {
            bgEstado = 'rgba(249,115,22,0.12)'; // Naranja
            colorEstado = '#f97316';
            borderEstado = 'rgba(249,115,22,0.3)';
        } else if (s.estado === 'EN MORA') {
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
                <td class="p-4 text-slate-400 text-xs font-mono">--/--/----</td>
                <td class="p-4 font-black ${(s.estado === 'PENDIENTE' || s.estado === 'EN MORA') ? 'text-orange-400' : 'text-slate-500'}">
                    ${(s.estado === 'PENDIENTE' || s.estado === 'EN MORA') ? '$' + s.deuda.toLocaleString() : '—'}
                </td>
                <td class="p-4">
                    <span style="padding:2px 10px; border-radius:9999px; font-size:9px; font-weight:900; text-transform:uppercase;
                        background:${bgEstado};
                        color:${colorEstado};
                        border:1px solid ${borderEstado};">
                        ${s.estado}
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
function abrirWizardPaso1() {
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
        
        const preciosFix = { 'Musculación': 25000, 'Zumba': 31500, 'Crossfit': 40000 };
        const clasesDelAlumno = socio.clase.split(' + ').map(c => c.trim());
        
        let clasesAdeudadas = [];
        if (socio.deuda > 0) {
            const subsets = (arr) => arr.reduce((sub, value) => sub.concat(sub.map(set => [value,...set])), [[]]);
            const allSubsets = subsets(clasesDelAlumno);
            for (let subset of allSubsets) {
                let sum = subset.reduce((a, b) => a + (preciosFix[b] || 0), 0);
                if (sum === socio.deuda) {
                    clasesAdeudadas = subset;
                    break;
                }
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

    if (proCheck && proCheck.checked) {
        costoNuevo = costoNuevo * 0.5; // prorrateo 50%
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
        abrirPaso3Wizard();
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
    abrirPaso3Wizard();
}

function abrirPaso3Wizard() {
    document.getElementById('modal-wizard-3').classList.remove('hidden');
    
    document.getElementById('wiz-rec-fecha').innerText = lastTx.fecha;
    document.getElementById('wiz-rec-comp').innerText = "#" + Math.floor(Math.random() * 1000000);
    document.getElementById('wiz-rec-socio').innerText = lastTx.nombre;
    document.getElementById('wiz-rec-metodo').innerText = lastTx.metodo;
    document.getElementById('wiz-rec-total').innerText = lastTx.total;
    
    document.getElementById('wiz-rec-conceptos').innerHTML = `<p>${lastTx.actividades}</p>`;
    
    // Actualizar mockAlumnos
    procesarPagoExitoso(lastTx);
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
            estado: 'ACREDITADO'
        });
    }
    
    window.filtrarSocios && window.filtrarSocios();
}

function finalizarCobroWizard() {
    cerrarModalWizard('modal-wizard-3');
}

// Intercept window.onload or DOMContentLoaded to render our mock table
document.addEventListener('DOMContentLoaded', () => {
    // Sobrescribir globales de socios.js
    window.filtrarSocios = filtrarSocios;
    window.cobrarSocio = cobrarSocio;
    window.cobrarPago = cobrarPago;
    window.aplicarCuponWizard = aplicarCuponWizard;
    setTimeout(() => {
        filtrarSocios();
    }, 500);
});
