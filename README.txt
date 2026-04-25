ESTRUCTURA DEL PROYECTO SQUATGYM

El proyecto quedó separado en carpetas y archivos para que el código sea más ordenado, fácil de leer y más simple de modificar.

CARPETA PRINCIPAL

En la carpeta principal del proyecto están los archivos base que necesita la página para funcionar.

index.html
Es el archivo principal del sitio. Desde este archivo se arma la estructura general de la página.
Contiene el login, el menú lateral, el encabezado principal, los modales y las conexiones a los archivos de estilos y JavaScript.
También tiene el contenedor donde se cargan las distintas pantallas del sistema.

style.css
Contiene los estilos generales del sistema.
Acá se definen colores, fondos, tarjetas, botones, menú lateral, animaciones, modales y otros detalles visuales.
Sirve para que todas las pantallas mantengan el mismo diseño.

CARPETA pantallas

Esta carpeta contiene las distintas vistas del sistema.
Cada archivo representa una pantalla diferente. Esto permite que el index.html no quede tan largo y que cada sección del sistema esté separada.

inicio.html
Contiene la pantalla inicial del sistema.
Muestra el saludo, horarios, panel principal y contenido inicial según el tipo de usuario.

adm-membresia.html
Contiene la pantalla de cobros de alumnos.
Desde acá se pueden buscar socios, verificar deudas, calcular prorrateos y registrar pagos.

adm-monitor.html
Contiene la pantalla de informes financieros.
Muestra movimientos, totales por método de pago y permite generar reportes.

adm-inventario.html
Contiene la pantalla de proveedores e inventario.
Permite ver productos, costos, precios, márgenes, vencimientos y estado de pagos a proveedores.

adm-kiosco.html
Contiene la pantalla del kiosco para el personal.
Sirve para controlar ventas, registrar cobros, ver stock crítico y gestionar movimientos del turno.

alu-pago.html
Contiene la pantalla de perfil del alumno.
Muestra datos del socio, estado de cuenta, vencimiento, asistencia, puntos y acceso al pago de cuota.

alu-historial.html
Contiene el historial de pagos del alumno.
Permite visualizar pagos anteriores, métodos utilizados y comprobantes.

alu-notificaciones.html
Contiene la pantalla de notificaciones del alumno.
Muestra avisos de vencimiento, promociones e información importante.

alu-tienda.html
Contiene la tienda o kiosco del alumno.
Permite ver productos, agregarlos al carrito, usar puntos y realizar pagos.

CARPETA js

Esta carpeta contiene todos los archivos JavaScript del proyecto.
Cada archivo tiene una responsabilidad específica para evitar que todo el código esté mezclado.

data.js
Contiene los datos principales del sistema.
Acá están los arreglos y objetos que simulan una base de datos, como socios, clientes, productos, inventario y transacciones.
También contiene variables globales que se usan en distintas partes del sistema.

app.js
Es el archivo principal de arranque.
Se encarga de cargar las pantallas dentro del contenedor principal y dejar preparada la aplicación para funcionar.
No contiene toda la lógica del sistema, sino solo lo necesario para iniciar.

auth.js
Contiene la lógica relacionada con el login.
Maneja la selección de rol, como staff o cliente, y la entrada al sistema.
También configura qué contenido se muestra según el tipo de usuario.

navigation.js
Contiene las funciones de navegación.
Se encarga de crear el menú lateral y cambiar entre pantallas.
También actualiza cuál opción del menú aparece activa.

modals.js
Contiene las funciones para manejar ventanas emergentes.
Permite abrir y cerrar modales, limpiar contenido anterior y volver al menú de opciones dentro del flujo de pago.

pagos.js
Contiene la lógica de pagos.
Maneja los métodos de pago como QR, transferencia, tarjeta y efectivo.
También controla simulaciones de pago, confirmaciones, vueltos, recibos y cierre del flujo de cobro.

kiosco.js
Contiene la lógica del kiosco.
Maneja el catálogo de productos, el carrito, la suma de productos, descuentos, puntos y actualización del total.

socios.js
Contiene las funciones relacionadas con los socios.
Permite buscar clientes, mostrar deudas, seleccionar cuotas, filtrar socios, cobrar deudas y verificar el acceso según el estado de pago.

inventario.js
Contiene la lógica de inventario y proveedores.
Permite filtrar productos, ver márgenes, pagar proveedores y actualizar el estado de pago.

informes.js
Contiene las funciones de informes.
Genera reportes financieros, corte de caja y listado de socios con deuda.
También arma tablas y resúmenes para mostrar dentro de los modales.

