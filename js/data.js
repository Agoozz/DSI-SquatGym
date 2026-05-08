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
            "456": { nombre: "Lucía Fernández", id: "#1882", dni: "9", Estado: "Deudor", Clase: "Zumba", deudas: [{ mes: "Abril", monto: 15750 }] }
        };

        const sociosDB = [
            { nombre: "Valentino Perez",   dni: "8", clase: "Musculación",  estado: "Deudor",  deuda: 12000, sede: "Sede Centro", foto: "https://randomuser.me/api/portraits/men/32.jpg", fechaAlta: "2024-03-12" },
            { nombre: "Lucía Fernández",   dni: "9", clase: "Zumba",        estado: "Deudor",  deuda: 12000, sede: "Sede Sur",    foto: "https://randomuser.me/api/portraits/women/44.jpg", fechaAlta: "2024-05-15" },
            { nombre: "Juan Romero",       dni: "33221100", clase: "Crossfit",      estado: "Deudor",  deuda: 12500, sede: "Sede Norte", fechaAlta: "2025-01-10" },
            { nombre: "Camila Torres",     dni: "44556677", clase: "Musculación",   estado: "Al día",  deuda: 0,     sede: "Sede Norte", fechaAlta: "2024-11-20" },
            { nombre: "Melisa Lopez",      dni: "77665544", clase: "Zumba",         estado: "Al día",  deuda: 0,     sede: "Sede Centro", fechaAlta: "2024-12-05" },
            { nombre: "Rodrigo Sosa",      dni: "55443322", clase: "Zumba",         estado: "Deudor",  deuda: 23000, sede: "Sede Sur", fechaAlta: "2024-08-05" },
            { nombre: "Florencia Medina",  dni: "66778899", clase: "Crossfit",      estado: "Deudor",  deuda: 27000, sede: "Sede Sur", fechaAlta: "2024-07-15" },
            { nombre: "Matías Alvarez",    dni: "77889900", clase: "Musculación",   estado: "Deudor",  deuda: 10000, sede: "Sede Norte", fechaAlta: "2025-02-01" },
            { nombre: "Marta Gómez",       dni: "11223344", clase: "Zumba",         estado: "Deudor",  deuda: 18500, sede: "Sede Sur", fechaAlta: "2024-09-12" },
        ];

        const inventarioDB = [
            { nombre: "Agua 1.5L",        proveedor: "Ivess",           costo: 600,  precio: 1000, estado: "Pagado",    cat: "Bebidas",     vencimiento: "2026-06-15" },
            { nombre: "Lata Energizante",  proveedor: "Speed Unlimited", costo: 1400, precio: 2500, estado: "Pendiente", cat: "Bebidas",     vencimiento: "2026-05-10" },
            { nombre: "Proteína Whey",     proveedor: "Ena Sport",       costo: 3800, precio: 5500, estado: "Pagado",    cat: "Suplementos", vencimiento: "2027-01-20" },
            { nombre: "Creatina Mon.",     proveedor: "Star Nutrition",  costo: 3200, precio: 4800, estado: "Pendiente", cat: "Suplementos", vencimiento: "2026-08-05" },
            { nombre: "Barra Proteica",    proveedor: "Mervick",         costo: 750,  precio: 1200, estado: "Pagado",    cat: "Snacks",      vencimiento: "2026-07-30" },
        ];
        
        const transacciones = [
            // --- HISTORIAL 2024 ---
            // Valentino (Alta: 2024-03-12)
            { tipo: "EFECTIVO", monto: 7419, cliente: "Valentino Perez", fecha: "2024-03-12", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Valentino Perez", fecha: "2024-04-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Valentino Perez", fecha: "2024-05-02", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Valentino Perez", fecha: "2024-06-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Valentino Perez", fecha: "2024-07-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Valentino Perez", fecha: "2024-08-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Valentino Perez", fecha: "2024-09-02", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Valentino Perez", fecha: "2024-10-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Valentino Perez", fecha: "2024-11-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Valentino Perez", fecha: "2024-12-05", concepto: "Cuota", sede: "Sede Centro" },

            // Lucía (Alta: 2024-05-15)
            { tipo: "EFECTIVO", monto: 6193, cliente: "Lucía Fernández", fecha: "2024-05-15", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-06-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-07-10", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-08-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-09-02", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-10-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-11-10", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Lucía Fernández", fecha: "2024-12-05", concepto: "Cuota", sede: "Sede Sur" },

            // Florencia (Alta: 2024-07-15)
            { tipo: "TRANSFERENCIA", monto: 6193, cliente: "Florencia Medina", fecha: "2024-07-15", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Florencia Medina", fecha: "2024-08-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Florencia Medina", fecha: "2024-09-10", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Florencia Medina", fecha: "2024-10-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Florencia Medina", fecha: "2024-11-02", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Florencia Medina", fecha: "2024-12-05", concepto: "Cuota", sede: "Sede Sur" },

            // Rodrigo (Alta: 2024-08-05)
            { tipo: "EFECTIVO", monto: 10451, cliente: "Rodrigo Sosa", fecha: "2024-08-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2024-09-02", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2024-10-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2024-11-02", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2024-12-05", concepto: "Cuota", sede: "Sede Sur" },

            // Camila (Alta: 2024-11-20)
            { tipo: "EFECTIVO", monto: 4000, cliente: "Camila Torres", fecha: "2024-11-20", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12000, cliente: "Camila Torres", fecha: "2024-12-05", concepto: "Cuota", sede: "Sede Norte" },

            // Melisa (Alta: 2024-12-05)
            { tipo: "QR", monto: 10500, cliente: "Melisa Lopez", fecha: "2024-12-05", concepto: "Cuota", sede: "Sede Centro" },

            // --- HISTORIAL 2025 (COMPLETO PARA TODOS) ---
            // Valentino
            { tipo: "EFECTIVO", monto: 12000, cliente: "Valentino Perez", fecha: "2025-01-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Valentino Perez", fecha: "2025-02-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Valentino Perez", fecha: "2025-03-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Valentino Perez", fecha: "2025-04-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Valentino Perez", fecha: "2025-05-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Valentino Perez", fecha: "2025-06-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Valentino Perez", fecha: "2025-07-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Valentino Perez", fecha: "2025-08-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Valentino Perez", fecha: "2025-09-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Valentino Perez", fecha: "2025-10-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Valentino Perez", fecha: "2025-11-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Valentino Perez", fecha: "2025-12-05", concepto: "Cuota", sede: "Sede Centro" },

            // Lucía
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-01-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-02-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-03-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-04-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-05-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-06-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-07-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-08-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-09-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-10-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-11-08", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Lucía Fernández", fecha: "2025-12-08", concepto: "Cuota", sede: "Sede Sur" },

            // Juan Romero (Alta: 2025-01-10)
            { tipo: "QR", monto: 7500, cliente: "Juan Romero", fecha: "2025-01-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12500, cliente: "Juan Romero", fecha: "2025-02-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12500, cliente: "Juan Romero", fecha: "2025-03-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12500, cliente: "Juan Romero", fecha: "2025-04-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12500, cliente: "Juan Romero", fecha: "2025-05-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12500, cliente: "Juan Romero", fecha: "2025-06-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12500, cliente: "Juan Romero", fecha: "2025-07-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12500, cliente: "Juan Romero", fecha: "2025-08-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12500, cliente: "Juan Romero", fecha: "2025-09-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12500, cliente: "Juan Romero", fecha: "2025-10-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12500, cliente: "Juan Romero", fecha: "2025-11-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12500, cliente: "Juan Romero", fecha: "2025-12-10", concepto: "Cuota", sede: "Sede Norte" },

            // Matías Alvarez (Alta: 2025-02-01)
            { tipo: "QR", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-02-01", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-03-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-04-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-05-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-06-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-07-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-08-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-09-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-10-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-11-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Matías Alvarez", fecha: "2025-12-05", concepto: "Cuota", sede: "Sede Norte" },

            // Camila Torres
            { tipo: "EFECTIVO", monto: 12000, cliente: "Camila Torres", fecha: "2025-01-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12000, cliente: "Camila Torres", fecha: "2025-02-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Camila Torres", fecha: "2025-03-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12000, cliente: "Camila Torres", fecha: "2025-04-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Camila Torres", fecha: "2025-05-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12000, cliente: "Camila Torres", fecha: "2025-06-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Camila Torres", fecha: "2025-07-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12000, cliente: "Camila Torres", fecha: "2025-08-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Camila Torres", fecha: "2025-09-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 12000, cliente: "Camila Torres", fecha: "2025-10-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Camila Torres", fecha: "2025-11-05", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 12000, cliente: "Camila Torres", fecha: "2025-12-05", concepto: "Cuota", sede: "Sede Norte" },

            // Melisa Lopez
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-01-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-02-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-03-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-04-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-05-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-06-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-07-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-08-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-09-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-10-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TARJETA", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-11-10", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Melisa Lopez", fecha: "2025-12-10", concepto: "Cuota", sede: "Sede Centro" },

            // Rodrigo Sosa
            { tipo: "EFECTIVO", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-01-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-02-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-03-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-04-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-05-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-06-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-07-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-08-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-09-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-10-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-11-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Rodrigo Sosa", fecha: "2025-12-05", concepto: "Cuota", sede: "Sede Sur" },

            // Florencia Medina
            { tipo: "QR", monto: 12000, cliente: "Florencia Medina", fecha: "2025-01-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Florencia Medina", fecha: "2025-02-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Florencia Medina", fecha: "2025-03-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Florencia Medina", fecha: "2025-04-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Florencia Medina", fecha: "2025-05-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Florencia Medina", fecha: "2025-06-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Florencia Medina", fecha: "2025-07-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Florencia Medina", fecha: "2025-08-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 12000, cliente: "Florencia Medina", fecha: "2025-09-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 12000, cliente: "Florencia Medina", fecha: "2025-10-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 12000, cliente: "Florencia Medina", fecha: "2025-11-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 12000, cliente: "Florencia Medina", fecha: "2025-12-05", concepto: "Cuota", sede: "Sede Sur" },

            // --- PERÍODO 2026 (COMPLETO) ---
            // Enero 2026
            { tipo: "QR", monto: 12000, cliente: "Valentino Perez", fecha: "2026-01-05", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Melisa Lopez", fecha: "2026-01-08", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 12500, cliente: "Juan Romero", fecha: "2026-01-10", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 13500, cliente: "Camila Torres", fecha: "2026-01-12", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "EFECTIVO", monto: 13500, cliente: "Rodrigo Sosa", fecha: "2026-01-15", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 13500, cliente: "Florencia Medina", fecha: "2026-01-20", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Matías Alvarez", fecha: "2026-01-25", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 13500, cliente: "Lucía Fernández", fecha: "2026-01-28", concepto: "Cuota", sede: "Sede Sur" },

            // Febrero 2026
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Matías Alvarez", fecha: "2026-02-03", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 13500, cliente: "Lucía Fernández", fecha: "2026-02-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 13500, cliente: "Valentino Perez", fecha: "2026-02-07", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 13500, cliente: "Camila Torres", fecha: "2026-02-14", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 13500, cliente: "Melisa Lopez", fecha: "2026-02-18", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 13500, cliente: "Rodrigo Sosa", fecha: "2026-02-20", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Florencia Medina", fecha: "2026-02-22", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 13500, cliente: "Juan Romero", fecha: "2026-02-25", concepto: "Cuota", sede: "Sede Norte" },

            // Marzo 2026
            { tipo: "EFECTIVO", monto: 13500, cliente: "Rodrigo Sosa", fecha: "2026-03-02", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 13500, cliente: "Florencia Medina", fecha: "2026-03-04", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 13500, cliente: "Matías Alvarez", fecha: "2026-03-06", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Lucía Fernández", fecha: "2026-03-09", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "EFECTIVO", monto: 13500, cliente: "Valentino Perez", fecha: "2026-03-12", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "QR", monto: 13500, cliente: "Juan Romero", fecha: "2026-03-15", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TARJETA", monto: 13500, cliente: "Camila Torres", fecha: "2026-03-20", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Melisa Lopez", fecha: "2026-03-25", concepto: "Cuota", sede: "Sede Centro" },

            // Abril 2026 (DATA DE LA IMAGEN)
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Camila Torres", fecha: "2026-04-01", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "QR", monto: 13500, cliente: "Melisa Lopez", fecha: "2026-04-03", concepto: "Cuota", sede: "Sede Centro" },
            { tipo: "EFECTIVO", monto: 13500, cliente: "Rodrigo Sosa", fecha: "2026-04-05", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "TARJETA", monto: 13500, cliente: "Florencia Medina", fecha: "2026-04-07", concepto: "Cuota", sede: "Sede Sur" },
            { tipo: "QR", monto: 13500, cliente: "Matías Alvarez", fecha: "2026-04-09", concepto: "Cuota", sede: "Sede Norte" },
            { tipo: "TRANSFERENCIA", monto: 13500, cliente: "Lucía Fernández", fecha: "2026-04-11", concepto: "Cuota", sede: "Sede Sur" },
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
