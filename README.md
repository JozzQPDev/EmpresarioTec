# EmpresarioTec — Seguridad perimetral

Aplicación web de administración y supervisión para un sistema de seguridad perimetral con Arduino. El frontend presenta el estado del perímetro y las lecturas de sensores en tiempo real, permite administrar usuarios y dispositivos, consulta los historiales almacenados y ofrece ajustes para el firmware.

> **Alcance de este repositorio:** aplicación frontend Angular. La API Flask se encuentra en `../backend` y el sketch Arduino en `../arduino/EmpresarioTec.ino`.

## Contenido

- [Funciones](#funciones)
- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Requisitos e inicio](#requisitos-e-inicio)
- [Vistas y rutas](#vistas-y-rutas)
- [API y datos](#api-y-datos)
- [Arduino y telemetría](#arduino-y-telemetría)
- [Sistema visual](#sistema-visual)
- [Accesibilidad y estados](#accesibilidad-y-estados)
- [Pruebas y compilación](#pruebas-y-compilación)
- [Notas operativas y seguridad](#notas-operativas-y-seguridad)

## Funciones

- Inicio de sesión conectado a la API Flask.
- Dashboard con estado del perímetro, disponibilidad de API/Arduino, frescura de telemetría, lecturas de sensores, configuración activa, métricas e historial gráfico.
- Avisos del navegador para nuevas alertas críticas, sujeto al permiso del usuario y a la preferencia local.
- Administración de dispositivos: listado, alta, edición, eliminación, estado, ubicación, conexión e imagen.
- Administración de usuarios y roles.
- Historial unificado de monitoreo y alertas, con filtros, búsqueda y paginación en la vista.
- Ajustes de sensibilidad del sensor, avisos críticos y frecuencia de actualización del dashboard.
- Avisos de éxito y error con un componente compartido y estilo de marca.
- Diseño adaptable a escritorio y móvil, navegación lateral y encabezado con datos del usuario.

## Tecnologías

| Área | Tecnología |
|---|---|
| Framework web | Angular 22, componentes standalone |
| Lenguaje | TypeScript 6 |
| Formularios | Angular Forms y Reactive Forms |
| Enrutamiento | Angular Router |
| Comunicación HTTP y flujos | `HttpClient`, RxJS |
| Estilos | Tailwind CSS 4 |
| Iconografía | Font Awesome Free 7 |
| Carga visual | `boneyard-js` |
| Pruebas | Vitest integrado con Angular CLI |
| Backend relacionado | Flask, Supabase y comunicación serial |
| Firmware | Arduino C++ |

El proyecto usa componentes standalone; las dependencias de componentes compartidos se declaran en el `imports` del decorador `@Component`.

## Estructura

```text
frontend/
├── public/
│   └── logos/                     # Identidad visual e iconos
├── src/
│   ├── app/
│   │   ├── dashboard/             # Resumen, telemetría y gráficos
│   │   ├── devices/               # Administración de hardware
│   │   ├── header/                # Título, reloj y menú de usuario
│   │   ├── layouts/main-layout/   # Sidebar, header y router outlet
│   │   ├── login/                 # Acceso al sistema
│   │   ├── logs/                  # Historial y filtros
│   │   ├── models/                # Tipos y modelos compartidos
│   │   ├── services/              # API, autenticación y preferencias
│   │   ├── settings/              # Umbrales y preferencias
│   │   ├── shared/
│   │   │   ├── confirmation-dialog/ # Confirmaciones de acciones
│   │   │   └── feedback-alert/      # Avisos de éxito/error
│   │   ├── sidebar/               # Navegación principal
│   │   ├── users/                 # Administración de usuarios
│   │   ├── app.config.ts          # Router y HttpClient
│   │   └── app.routes.ts          # Rutas de la aplicación
│   ├── index.html
│   ├── main.ts
│   └── styles.css                 # Tailwind, Font Awesome y scrollbar
├── angular.json
├── package.json
└── tsconfig*.json
```

### Carpetas relacionadas, fuera de este repositorio

```text
EmpresarioTec/
├── frontend/                      # Este proyecto
├── backend/                       # API Flask y configuración serial
└── arduino/EmpresarioTec.ino      # Firmware compatible
```

## Requisitos e inicio

### Requisitos

- Node.js compatible con Angular CLI 22. Comprueba las versiones disponibles con `node --version` y `npx ng version`. Angular CLI puede rechazar versiones que no estén dentro de su rango soportado.
- npm.
- API Flask ejecutándose en `http://127.0.0.1:5000`.
- Para lecturas y control reales: Arduino conectado al equipo donde se ejecuta la API y backend configurado para usar el puerto serial correcto.
- Credenciales y esquema configurados en Supabase para el backend.

### Instalar y ejecutar el frontend

Desde la carpeta `frontend`:

```bash
npm install
npm start
```

Abre <http://localhost:4200>. El servidor de desarrollo recarga los cambios al guardar.

Comandos disponibles:

```bash
npm start                 # Servidor Angular (ng serve)
npm run build             # Compilación de producción
npm run watch             # Compilación de desarrollo en modo watch
npm test                  # Pruebas configuradas por Angular CLI/Vitest
```

El comando `ng` también puede ejecutarse mediante `npx ng <comando>`.

### Configurar y ejecutar el backend

El frontend utiliza actualmente una URL base fija:

```text
http://127.0.0.1:5000/api
```

La API Flask necesita sus dependencias y variables de entorno propias. En particular, el backend requiere `SUPABASE_URL` y `SUPABASE_KEY`; opcionalmente admite `PUERTO_COM`, `MARGEN_CAMBIO` y `TIEMPO_ESCALAMIENTO_MS`. Configúralas en el entorno local del backend y no guardes credenciales en el frontend ni en el repositorio.

El puerto serial predeterminado del backend es `COM4`, a `9600` baudios. Ajusta `PUERTO_COM` según el equipo. Revisa la documentación y los archivos de configuración de `../backend` para iniciar la API en el modo previsto por ese proyecto.

## Vistas y rutas

Las rutas de la aplicación se definen en `src/app/app.routes.ts`. El acceso a las vistas internas pasa por `authGuard` y comparte `MainLayoutComponent` con sidebar y encabezado.

| Ruta | Vista | Descripción |
|---|---|---|
| `/login` | Inicio de sesión | Autenticación contra `/api/login`; validación de correo y contraseña. |
| `/dashboard` | Panel de control | Estado actual, salud de conexión, sensores, umbrales, métricas, gráficos e historial de alertas. |
| `/devices` | Dispositivos y pines | Consulta y administración de dispositivos, datos de conexión e imágenes. |
| `/usuarios` | Gestión de accesos | Consulta, alta, edición y eliminación de usuarios; carga de roles. |
| `/logs` | Logs del sistema | Historial de monitoreo y alertas con búsqueda, filtros por nivel/zona/dispositivo/fecha y paginación. |
| `/settings` | Ajustes | Umbrales del perímetro, preferencia de notificaciones y frecuencia de consulta. |

La raíz `/` redirige al login. Una ruta no encontrada también redirige a `/login`.

### Dashboard

El dashboard se ordena en bloques para priorizar la operación:

1. Estado del perímetro y avisos.
2. Conexión API/Arduino y última telemetría.
3. Indicadores: alertas de los últimos 7 días, incidentes críticos, duración media y dispositivos.
4. Lecturas de sensor de luz, puerta e impacto; mapa de pines disponible bajo demanda.
5. Configuración de umbrales.
6. Análisis por día, hora, tipo y nivel.
7. Historial de alertas, filtrable por nivel.

El botón de recarga está en el encabezado de **Conexión y telemetría**. Los errores se presentan como una notificación; el dashboard mantiene la acción de reintento junto a la información de conexión.

### Ajustes

- **Margen de cambio de luz:** entero de 1 a 500 puntos ADC; valor inicial 40.
- **Tiempo de escalamiento:** entero entre 500 y 60000 ms; valor inicial 3000 ms.
- **Avisos críticos:** requiere que el navegador soporte la API `Notification` y que el usuario conceda permiso. Los avisos se producen mientras el dashboard está abierto.
- **Frecuencia de actualización:** 1, 2, 5 o 10 segundos; valor predeterminado 1 s. Se guarda localmente y la selección se aplica al iniciar el dashboard.
- **Apariencia:** permite cambiar entre tema claro y oscuro; la selección se guarda localmente y se aplica en todas las páginas.
- **Perfil de usuario:** permite actualizar nombre y correo, y opcionalmente cambiar la contraseña. El servidor exige un token de sesión válido y la contraseña actual; la nueva contraseña debe tener al menos 8 caracteres.

Los umbrales se guardan en la API y quedan pendientes hasta que el Arduino confirma los valores mediante telemetría. La frecuencia, el tema y la opción de notificaciones se guardan en `localStorage` del navegador.

## API y datos

El frontend centraliza las solicitudes en `IntrusionService` y `AuthService`. La base de URL definida actualmente es `http://127.0.0.1:5000/api`.

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/login` | Comprueba credenciales y devuelve datos de usuario y token de sesión firmado. |
| `PUT` | `/mi-perfil` | Actualiza el perfil del usuario autenticado; requiere `Authorization: Bearer <token>` y `current_password`. Acepta `nombre`, `email` y opcionalmente `new_password`. |
| `GET` | `/estado` | Lee estado, contador, conexión serial, telemetría, sensores y umbrales. |
| `GET` | `/historial/monitoreo` | Consulta eventos seguros/monitoreo. |
| `GET` | `/historial/alertas` | Consulta advertencias y eventos críticos. |
| `GET` | `/configuracion/umbrales` | Consulta valores y estado de aplicación. |
| `PUT` | `/configuracion/umbrales` | Guarda y envía la configuración de umbrales. |
| `GET` | `/dispositivos` | Lista dispositivos. |
| `GET` | `/dispositivos/{id}` | Consulta un dispositivo. |
| `POST` | `/dispositivos` | Crea un dispositivo. |
| `PUT` | `/dispositivos/{id}` | Actualiza sus datos. |
| `PATCH` | `/dispositivos/{id}/estado` | Cambia su estado activo. |
| `DELETE` | `/dispositivos/{id}` | Elimina un dispositivo. |
| `POST` | `/dispositivos/{id}/imagen` | Sube una imagen del dispositivo. |
| `GET` | `/usuarios` | Lista usuarios. |
| `POST` | `/usuarios` | Crea un usuario. |
| `PUT` | `/usuarios/{id}` | Actualiza un usuario. |
| `DELETE` | `/usuarios/{id}` | Elimina un usuario. |
| `GET` | `/roles` | Consulta los roles disponibles. |

### Formato de umbrales

`PUT /api/configuracion/umbrales` recibe:

```json
{
  "margen_cambio": 40,
  "tiempo_escalamiento_ms": 3000
}
```

El backend valida ambos valores, los persiste en `../backend/arduino_config.json` y reporta `aplicada: true` solo cuando la telemetría confirma los valores aplicados. Si el Arduino está desconectado, el cambio permanece pendiente.

### Estado esperado

`GET /api/estado` incluye estos campos, además del mensaje y del código numérico:

```json
{
  "codigo": 1,
  "mensaje": "Zonas seguras. Sistema monitoreando perímetro.",
  "zona": "GENERAL",
  "descripcion": "Zonas seguras. Sistema monitoreando perímetro.",
  "intrusiones": 0,
  "serial_conectado": true,
  "ultima_telemetria": "2026-10-27T09:00:00-05:00",
  "telemetria_vigente": true,
  "sensores": {
    "luz": 500,
    "luz_base": 500,
    "puerta_abierta": false,
    "impacto_detectado": false
  },
  "umbrales": {
    "margen_cambio": 40,
    "tiempo_escalamiento_ms": 3000
  },
  "configuracion_aplicada": true
}
```

Los historiales están limitados a los 50 registros más recientes por endpoint en la API. El componente de Logs combina ambos conjuntos, permite buscar y filtrar los datos recibidos, y los presenta en páginas de 10 filas.

### Códigos de estado del perímetro

| Código | Estado | Zona habitual | Nivel visual |
|---:|---|---|---|
| `0` | Sin conexión | — | Desconectado |
| `1` | Zona segura | `GENERAL` | Seguro |
| `2` | Paso/movimiento detectado | `PERIMETRO_LASER` | Advertencia |
| `3` | Intruso por permanencia | `PERIMETRO_LASER` | Crítico |
| `4` | Puerta forzada/abierta | `PUERTA_PRINCIPAL` | Crítico |
| `5` | Impacto en ventana | `VENTANA_PRINCIPAL` | Crítico |

## Arduino y telemetría

El firmware correspondiente es `../arduino/EmpresarioTec.ino`.

| Componente | Pin |
|---|---|
| LED verde | 3 |
| LED amarillo | 4 |
| LED rojo | 5 |
| Relé | 7 |
| Buzzer | 8 |
| Sensor de impacto | 9 |
| Sensor de puerta | 10 |
| Sensor/barrera de luz | A0 |

El firmware calibra la lectura base del sensor óptico durante el arranque y envía telemetría cada segundo a 9600 baudios. El backend considera obsoleta la telemetría si no recibe datos durante más de 3 segundos. Los datos seriales incluyen estado, zona, descripción, lectura de luz, valor base, puerta, impacto y umbrales aplicados.

El backend envía cambios de configuración por serial con el protocolo `CONFIG:margen,tiempo` y espera la confirmación correspondiente. **Antes de cargar el sketch, detén el backend Flask:** ambos procesos necesitan acceso exclusivo al puerto COM. Tras cargarlo, inicia de nuevo la API.

## Sistema visual

La interfaz usa Tailwind CSS 4 con una identidad sobria de panel de control: superficies blancas, fondos gris pizarra, texto de alto contraste y colores semánticos para los estados. Font Awesome se importa globalmente desde `src/styles.css`.

### Paleta

| Uso | Color | Hex aproximado |
|---|---|---|
| Fondo de la aplicación | `slate-100` | `#f1f5f9` |
| Superficie / tarjetas | `white` | `#ffffff` |
| Sidebar, botones primarios, texto más fuerte | `slate-900` | `#0f172a` |
| Superficie oscura secundaria / hover | `slate-800` | `#1e293b` |
| Texto principal | `slate-800` / `slate-900` | `#1e293b` / `#0f172a` |
| Texto secundario | `slate-500` | `#64748b` |
| Texto auxiliar | `slate-400` | `#94a3b8` |
| Bordes | `slate-200` | `#e2e8f0` |
| Acento de marca | `sky-400` / `blue-400` | `#38bdf8` / `#60a5fa` |
| Seguro / éxito | `emerald-500` | `#10b981` |
| Advertencia / pendiente | `amber-500` | `#f59e0b` |
| Crítico / error | `rose-500` | `#f43f5e` |

La marca utiliza el logotipo de `public/logos/logofis2.png` en el menú lateral y el icono de seguridad de `public/logos/icon-claro.png` en las notificaciones.

### Tipografía y escala

No se declara una familia tipográfica propia; `font-sans` usa la pila sans-serif del sistema configurada por Tailwind. Las vistas aplican una jerarquía compacta, adecuada a un panel de supervisión:

| Uso habitual | Clase Tailwind | Tamaño CSS |
|---|---|---:|
| Microtexto, metadatos pequeños | `text-[10px]` | 10 px |
| Metadatos, etiquetas compactas | `text-[11px]` | 11 px |
| Texto de interfaz, tablas y controles | `text-xs` | 12 px |
| Texto secundario y contenido normal | `text-sm` | 14 px |
| Subtítulos de sección | `text-base` | 16 px |
| Títulos de tarjetas de acceso/login | `text-xl` | 20 px |
| Estado principal / métricas destacadas | `text-2xl` | 24 px |
| Encabezados principales destacados | `text-3xl` | 30 px |

Se usan principalmente pesos normal (`font-normal`), medio (`font-medium`), semibold (`font-semibold`) y bold (`font-bold`). Los valores `font-mono` se reservan para horas, códigos, pines y datos técnicos. Los títulos suelen usar `tracking-tight`; las etiquetas de navegación utilizan mayúsculas y `tracking-wider`.

### Espaciado, tarjetas y controles

- Contenedor general de páginas: ancho adaptable, márgenes internos usuales de 16–28 px (`p-4`, `p-5`, `p-6`, `sm:p-7`).
- Separación entre secciones: normalmente 24 px (`space-y-6`) o 16–24 px (`gap-4`/`gap-6`).
- Tarjetas: fondo blanco, borde `slate-200`, esquinas redondeadas de 12–16 px (`rounded-xl`/`rounded-2xl`) y sombra discreta (`shadow-sm`).
- Controles: botones e inputs con esquinas de 8–12 px (`rounded-lg`/`rounded-xl`), borde slate y foco visible.
- Navegación lateral: fondo `slate-900`, texto slate y selección sobre `slate-800`.
- Layout: sidebar fija y zona de contenido con scroll independiente; las cuadrículas se reorganizan con breakpoints `sm`, `md`, `lg` y `xl`.

### Notificaciones de la aplicación

`FeedbackAlertComponent` centraliza los mensajes de éxito y error. Su variante flotante usa la esquina inferior derecha, tarjeta blanca, borde lateral de color semántico, icono, marca EmpresarioTec y contraste legible. La variante en línea se integra en el flujo de la página. Los avisos tienen `role="status"` para éxitos y `role="alert"` para errores.

## Accesibilidad y estados

- Los controles interactivos tienen etiquetas o nombres accesibles; los filtros informan el estado seleccionado con `aria-pressed`.
- El menú de usuario indica su estado con `aria-expanded` y admite cierre por Escape o clic fuera.
- Los colores de estado se acompañan de texto (por ejemplo, “Conectado”, “Advertencia”, “Crítico”); no dependen solamente del color.
- Los gráficos incluyen etiquetas accesibles, descripciones o tooltips navegables por teclado cuando aplica.
- La animación de estado y gráficos respeta `prefers-reduced-motion` en los puntos donde se ha definido.
- Las notificaciones nativas del navegador son opcionales y requieren consentimiento explícito.
- Boneyard muestra esqueletos durante la carga inicial de Dashboard y Ajustes; ambos cuentan con geometría responsive inicial y fallback visual. Las capturas se configuran en `boneyard.config.json` y los errores de API deben presentarse sin fingir que los datos se actualizaron.

## Pruebas y compilación

```bash
npm test
npm run build
```

Para validar tipos y plantillas Angular sin generar el bundle:

```bash
npx ngc --noEmit -p tsconfig.app.json
```

El runner de pruebas es Angular CLI con Vitest. Si VS Code no detecta pruebas, usa el script del proyecto (`npm test`) y comprueba la compatibilidad de Node con Angular CLI. La compilación de producción aplica optimizaciones y tiene presupuestos iniciales de 500 kB para advertencia y 1 MB para error.

## Notas operativas y seguridad

- El `authGuard` de frontend comprueba la existencia de `usuario` en `localStorage`; es un control de navegación de la interfaz, **no** una frontera de seguridad del servidor.
- El login emite tokens firmados con `itsdangerous`, con vigencia de 8 horas y derivados de la clave secreta de Supabase. El frontend guarda el token en `sessionStorage` y los datos de presentación del usuario en `localStorage`. Cambiar la contraseña invalida los tokens anteriores.
- `PUT /api/mi-perfil` autentica el token, vuelve a consultar el usuario activo y exige la contraseña actual antes de actualizar datos. El cambio de contraseña se guarda como hash.
- Esta protección aplica al endpoint de perfil; no implica que las demás rutas administrativas estén autenticadas o autorizadas. Antes de exponer la API, proteger también esas rutas, restringir CORS y servirla exclusivamente por HTTPS.
- El backend debe validar permisos y datos en cada operación. La UI no debe utilizarse como único control de acceso.
- La URL de API está fija en `IntrusionService` y `AuthService`; para despliegues separados conviene externalizarla mediante configuración de entornos.
- La API Flask configura CORS abierto en el código actual. Restringe orígenes, credenciales y permisos antes de exponerla fuera del entorno de desarrollo.
- No guardar secretos de Supabase en archivos del frontend, configuración pública, commits ni documentación. El frontend solo debe hablar con la API.
- Los ajustes locales viven en `localStorage` por navegador y perfil. Limpiar los datos del sitio restablece frecuencia y preferencia de avisos.
- Los datos que se muestran en el dashboard dependen de la conexión entre frontend, API, Supabase y Arduino; sin telemetría actual, la UI señala la condición de datos obsoletos.

## Recursos adicionales

- [Angular CLI: documentación](https://angular.dev/tools/cli)
- [Angular: documentación](https://angular.dev/)
- [Tailwind CSS: documentación](https://tailwindcss.com/docs)
- [RxJS: documentación](https://rxjs.dev/)
- [Font Awesome: iconos](https://fontawesome.com/icons)
- [Vitest: documentación](https://vitest.dev/)
