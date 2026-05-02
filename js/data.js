let rRol = 'admin'; 
let sedeActual = null;
let usuarioActual = { dni: '', nombre: '', rol: '' };
let itemsCAlu = []; let tAluK = 0; let itemsCStaff = []; let tStaffK = 0;
        let currentContext = 'cuota'; let cajaResumen = { qr: 42700, tarjeta: 225000, efectivo: 125800 };
        const pDBKiosco = [
            {n:"Agua 1.5L",p:1000,i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png"},
            {n:"Lata Energ.",p:2500,i:"https://cdn-icons-png.flaticon.com/512/2443/2443653.png"},
            {n:"Gatorade Blue",p:1400,i:"https://cdn-icons-png.flaticon.com/512/3100/3100551.png"},
            {n:"Proteína Whey",p:5500,i:"https://cdn-icons-png.flaticon.com/512/3050/3050162.png"},
            {n:"Creatina Mon.",p:4800,i:"https://cdn-icons-png.flaticon.com/512/3050/3050186.png"},

            // DUPLICADOS PARA FORZAR SCROLL
            {n:"Barra Proteica",p:1200,i:"https://cdn-icons-png.flaticon.com/512/1046/1046784.png"},
            {n:"Banana",p:800,i:"https://cdn-icons-png.flaticon.com/512/3075/3075977.png"},
            {n:"Mix Frutos",p:2000,i:"https://cdn-icons-png.flaticon.com/512/1046/1046857.png"},
            {n:"Agua 2",p:1000,i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png"},
            {n:"Agua 3",p:1000,i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png"},
            {n:"Agua 4",p:1000,i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png"},
            {n:"Agua 5",p:1000,i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png"},
            {n:"Agua 6",p:1000,i:"https://cdn-icons-png.flaticon.com/512/3100/3100566.png"},
        ];
        
        const clientes = {
            "123": { nombre: "Valentino P.", id: "#4922", dni: "12345678", Estado: "Deudor", Clase: "Zumba", deudas: [{ mes: "Enero", monto: 10000 },{ mes: "Febrero", monto: 10000 },{ mes: "Marzo", monto: 11500 }] },
            "456": { nombre: "Melisa L.", id: "#1882", dni: "87654321", Estado: "Al día", Clase: "Funcional", deudas: [] }
        };

        const sociosDB = [
            { nombre: "Valentino Perez",   dni: "12345678", clase: "Zumba",        estado: "Deudor",  deuda: 31500, sede: "Sede Centro" },
            { nombre: "Melisa Lopez",      dni: "87654321", clase: "Musculación",   estado: "Al día",  deuda: 0,     sede: "Sede Centro" },
            { nombre: "Juan Romero",       dni: "33221100", clase: "Crossfit",      estado: "Deudor",  deuda: 12500, sede: "Sede Norte" },
            { nombre: "Camila Torres",     dni: "44556677", clase: "Musculación",   estado: "Al día",  deuda: 0,     sede: "Sede Norte" },
            { nombre: "Rodrigo Sosa",      dni: "55443322", clase: "Zumba",         estado: "Deudor",  deuda: 23000, sede: "Sede Sur" },
            { nombre: "Florencia Medina",  dni: "66778899", clase: "Crossfit",      estado: "Deudor",  deuda: 27000, sede: "Sede Sur" },
            { nombre: "Matías Alvarez",    dni: "77889900", clase: "Musculación",   estado: "Deudor",  deuda: 10000, sede: "Sede Norte" },
            { nombre: "Lucía Fernández",   dni: "11223344", clase: "Zumba",         estado: "Deudor",  deuda: 18500, sede: "Sede Sur" },
        ];

        const inventarioDB = [
            { nombre: "Agua 1.5L",        proveedor: "Ivess",           costo: 600,  precio: 1000, estado: "Pagado",    cat: "Bebidas",     vencimiento: "2026-06-15" },
            { nombre: "Lata Energizante",  proveedor: "Speed Unlimited", costo: 1400, precio: 2500, estado: "Pendiente", cat: "Bebidas",     vencimiento: "2026-05-10" },
            { nombre: "Proteína Whey",     proveedor: "Ena Sport",       costo: 3800, precio: 5500, estado: "Pagado",    cat: "Suplementos", vencimiento: "2027-01-20" },
            { nombre: "Creatina Mon.",     proveedor: "Star Nutrition",  costo: 3200, precio: 4800, estado: "Pendiente", cat: "Suplementos", vencimiento: "2026-08-05" },
            { nombre: "Barra Proteica",    proveedor: "Mervick",         costo: 750,  precio: 1200, estado: "Pagado",    cat: "Snacks",      vencimiento: "2026-07-30" },
        ];
        
        const transacciones = [
            { tipo: "QR",           monto: 12000, cliente: "Valentino Perez",  fecha: "2026-01-05", concepto: "Cuota",  sede: "Sede Centro" },
            { tipo: "Transferencia",monto: 10000, cliente: "Melisa Lopez",     fecha: "2026-01-08", concepto: "Cuota",  sede: "Sede Centro" },
            { tipo: "Efectivo",     monto: 8000,  cliente: "Juan Romero",      fecha: "2026-01-10", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "Tarjeta",      monto: 12000, cliente: "Camila Torres",    fecha: "2026-01-12", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "QR",           monto: 1400,  cliente: "Rodrigo Sosa",     fecha: "2026-01-15", concepto: "Kiosco", sede: "Sede Sur" },
            { tipo: "Efectivo",     monto: 2500,  cliente: "Florencia Medina", fecha: "2026-01-20", concepto: "Kiosco", sede: "Sede Sur" },
            { tipo: "Transferencia",monto: 12000, cliente: "Matías Alvarez",   fecha: "2026-02-03", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "QR",           monto: 12000, cliente: "Lucía Fernández",  fecha: "2026-02-05", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "Efectivo",     monto: 9500,  cliente: "Valentino Perez",  fecha: "2026-02-07", concepto: "Cuota",  sede: "Sede Centro" },
            { tipo: "Tarjeta",      monto: 3200,  cliente: "Juan Romero",      fecha: "2026-02-10", concepto: "Kiosco", sede: "Sede Norte" },
            { tipo: "QR",           monto: 12000, cliente: "Camila Torres",    fecha: "2026-02-14", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "Transferencia",monto: 1000,  cliente: "Melisa Lopez",     fecha: "2026-02-18", concepto: "Kiosco", sede: "Sede Centro" },
            { tipo: "Efectivo",     monto: 12000, cliente: "Rodrigo Sosa",     fecha: "2026-03-02", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "QR",           monto: 12000, cliente: "Florencia Medina", fecha: "2026-03-04", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "Tarjeta",      monto: 12000, cliente: "Matías Alvarez",   fecha: "2026-03-06", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "Transferencia",monto: 12000, cliente: "Lucía Fernández",  fecha: "2026-03-09", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "Efectivo",     monto: 4800,  cliente: "Valentino Perez",  fecha: "2026-03-15", concepto: "Kiosco", sede: "Sede Centro" },
            { tipo: "QR",           monto: 2000,  cliente: "Juan Romero",      fecha: "2026-03-20", concepto: "Kiosco", sede: "Sede Norte" },
            { tipo: "Transferencia",monto: 13500, cliente: "Camila Torres",    fecha: "2026-04-01", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "QR",           monto: 13500, cliente: "Melisa Lopez",     fecha: "2026-04-03", concepto: "Cuota",  sede: "Sede Centro" },
            { tipo: "Efectivo",     monto: 13500, cliente: "Rodrigo Sosa",     fecha: "2026-04-05", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "Tarjeta",      monto: 13500, cliente: "Florencia Medina", fecha: "2026-04-07", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "QR",           monto: 13500, cliente: "Matías Alvarez",   fecha: "2026-04-09", concepto: "Cuota",  sede: "Sede Norte" },
            { tipo: "Transferencia",monto: 13500, cliente: "Lucía Fernández",  fecha: "2026-04-11", concepto: "Cuota",  sede: "Sede Sur" },
            { tipo: "Efectivo",     monto: 1200,  cliente: "Valentino Perez",  fecha: "2026-04-14", concepto: "Kiosco", sede: "Sede Centro" },
            { tipo: "QR",           monto: 5500,  cliente: "Juan Romero",      fecha: "2026-04-18", concepto: "Kiosco", sede: "Sede Norte" },
            { tipo: "Tarjeta",      monto: 1000,  cliente: "Camila Torres",    fecha: "2026-04-22", concepto: "Kiosco", sede: "Sede Norte" },
        ];

// ══════════════════════════════════════════════
// PLANES Y PROMOCIONES (Gestión de Precios)
// ══════════════════════════════════════════════
let planesDB = [
    { id: 1, nombre: "Musculación", precioBase: 15000, tipoPromo: "ninguna", valorPromo: 0 },
    { id: 2, nombre: "Zumba", precioBase: 12000, tipoPromo: "ninguna", valorPromo: 0 },
    { id: 3, nombre: "Crossfit", precioBase: 18000, tipoPromo: "cupon", valorPromo: "CROSS20" },
    { id: 4, nombre: "Pack Grupo Familiar", precioBase: 40000, tipoPromo: "amigos", valorPromo: "2x1" }
];

// Cargar desde localStorage si existe
const planesGuardados = localStorage.getItem('squatgym_planesDB');
if (planesGuardados) {
    try {
        planesDB = JSON.parse(planesGuardados);
    } catch(e) {
        console.error("Error cargando planesDB de localStorage", e);
    }
}
