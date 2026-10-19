# 📋 Reporte de Auditoría y Control de Requisitos — Entrega 2
**Proyecto:** *Código a Voluntad* (UTN FRBA - DDS 2C 2026)  
**Documento base:** `docs/[DDSO] Trabajo Práctico Integrador 2026 2C - Lu.md` (Segunda Entrega)  
**Plan de equipo:** `docs/División del trabajo — Segunda Entrega.md`  
**Rama evaluada:** `origin/develop` (Commit `c1d0eca`)  
**Fecha de auditoría:** Octubre 2026  

---

## 1. Resumen Ejecutivo

| Área Evaluada | Estado | Nivel de Cumplimiento | Observaciones Principales |
| :--- | :---: | :---: | :--- |
| **Dominio y Lógica de Negocio** | 🟡 Parcial | **75%** | Perfiles, Hitos, Compatibilidad y Notificaciones listos. **Falta Contribución Anónima** en `Colaboracion`. |
| **Persistencia (MongoDB)** | 🔴 Crítico | **20%** | Solo `NotificacionRepository` usa Mongoose. Colectivos, Proyectos, Colaboradores y Habilidades siguen **100% en memoria**. |
| **Scripts Semilla (*Seeds*)** | 🔴 Faltante | **0%** | Requisito explícito de la consigna sin implementar. No hay script ni comando `npm run seed`. |
| **APIs REST** | 🟢 Bueno | **90%** | CRUD perfiles, CRUD hitos, búsquedas de compatibilidad y notificaciones expuestos. Falta flag anónimo en colaboraciones. |
| **Documentación** | 🟡 Parcial | **60%** | Swagger está completo y al día, pero `docs/API.md` y el Diagrama de Clases (`.puml` y `.png`) están en versión Entrega 1. |
| **Despliegue (Docker)** | 🟡 Parcial | **50%** | `docker-compose.yml` solo levanta MongoDB, falta agregar el servicio del backend. |
| **Testing Automatizado** | 🟢 Muy Bueno | **85%** | Gran cobertura de tests unitarios en dominio y servicios para los módulos implementados. |

---

## 2. Matriz de Requisitos (Consigna vs. Estado Real en `develop`)

### A. Cambios al Dominio

| Requisito de la Consigna | Responsable | Estado | Detalle técnico en `develop` |
| :--- | :---: | :---: | :--- |
| **Perfiles en Proyectos** (descripción, obligatorias, opcionales, compromiso, modalidad) | Integrante 1 | 🟢 **Cumplido** | Clase `Perfil.js` implementada con validaciones cruzadas. `Proyecto.js` administra su colección de perfiles. |
| **Logros e Hitos** (% de concreción, logros/hitos, enlaces a repo público y sistema) | Integrante 2 | 🟢 **Cumplido** | Clase `Hito.js`, validación de progresión ascendente de %, cálculo de avance y `actualizarEnlaces()` en `Proyecto.js`. |
| **Medios de Contacto** (Email, WhatsApp, SMS; registro interno y no público) | Integrante 3 | 🟡 **Parcial** | `PersonaColaboradora.js` almacena `mediosDeContacto`, pero no hay endpoints para administrarlos individualmente. En `toJSON()` se ocultan correctamente. |
| **Mensajería Interna** (flag de aceptación de contacto) | Integrante 3 / 5 | 🟢 **Cumplido** | Atributo `mensajesInternos` en `PersonaColaboradora`. Valida en `NotificacionService` que la persona acepte mensajes antes de enviar. |
| **Contribuciones Anónimas** (opción de anonimato al anotarse, sin exponer quién la realizó) | Integrante 3 | 🔴 **Faltante** | `Colaboracion.js` no contempla anonimato. `Proyecto.agregarColaboracion()` no acepta el flag. `anotacionEsquema` en `ProyectoController` lo rechaza por `.strict()`. |
| **Búsqueda por Perfil / Habilidades** | Integrante 4 | 🟢 **Cumplido** | `Compatibilidad.js` y `CompatibilidadService.js` implementan scoring y filtrado para ambas direcciones. |
| **Notificaciones Internas y Réplica Externa** (Estrategia Email, SMS, WhatsApp) | Integrante 5 | 🟢 **Cumplido** | Patrón Strategy implementado (`NotificadorSender`, Nodemailer para Gmail SMTP, Twilio para SMS/WhatsApp). |

---

### B. Persistencia en MongoDB

> [!CAUTION]
> **PUNTO CRÍTICO:** La consigna indica textualmente: *"2. Persistir todas las entidades en la base de datos MongoDB."*  
> Actualmente, casi todo el backend sigue guardando los datos en variables estáticas en memoria (`static #array = []`).

| Entidad / Repositorio | Esquema Mongoose | ¿Persiste en Mongo? | ¿Lee de Mongo? | Estado Real |
| :--- | :---: | :---: | :---: | :--- |
| **ColectivoRepository** | ✅ `ColectivoSchema.js` | ❌ No | ❌ No | **100% en memoria (`#colectivos = []`)** |
| **ProyectoRepository** | ❌ Inexistente | ❌ No | ❌ No | **100% en memoria (`#proyectos = []`)** |
| **PersonaColaboradoraRepository** | ✅ `PersonaColaboradoraSchema.js` | ❌ No | ❌ No | **100% en memoria (`#colaboradores = []`)** |
| **HabilidadRepository** | ❌ Inexistente | ❌ No | ❌ No | **100% en memoria (`#habilidades = []`)** |
| **PerfilRepository** | ✅ `PerfilSchema.js` | 🟡 Fire-and-forget asíncrono | ❌ No | **Lee solo de memoria (`#perfiles = []`)**. Si se reinicia el servidor, se pierden en la API. |
| **NotificacionRepository** | ✅ `NotificacionSchema.js` | ✅ Sí | ✅ Sí | **Persistido en Mongo.** *Riesgo:* Al leer de Mongo reconstruye referencias buscando en repositorios en memoria; si se reinicia el server, devuelve referencias huérfanas como `null`. |

---

### C. Scripts Semilla (*Seeds*)

> [!IMPORTANT]
> **Consigna oficial:** *"En esta entrega, las entidades iniciales se cargarán a través de scripts semilla (seeds)."*
> - **Estado actual:** 🔴 **No existe ningún script ni carpeta de seeds en el proyecto.**
> - **Faltante:** Crear un script (ej. `packages/backend/src/seeds/seed.js` y script `npm run seed`) que pueble MongoDB con:
>   - Habilidades iniciales precargadas (frontend, backend, testing, UX, etc.).
>   - Tipos de colectivos / colectivos de ejemplo con ubicaciones.
>   - Proyectos de ejemplo con perfiles configurados.
>   - Colaboradores de prueba con habilidades y cuentas.

---

### D. APIs y Endpoints REST

| Endpoint | Método | Estado | Observación |
| :--- | :---: | :---: | :--- |
| `/api/proyectos/:id/perfiles` | `GET`, `POST` | 🟢 Listo | CRUD completo implementado y testeado. |
| `/api/proyectos/:id/perfiles/:perfilId` | `GET`, `PUT`, `DELETE` | 🟢 Listo | CRUD completo implementado y testeado. |
| `/api/proyectos/:id/hitos` | `GET`, `POST` | 🟢 Listo | Registro y listado de hitos con avance %. |
| `/api/proyectos/:id/hitos/:hitoId` | `GET`, `PATCH`, `DELETE` | 🟢 Listo | Actualización y baja de hitos. |
| `/api/proyectos/:id/enlaces` | `PATCH` | 🟢 Listo | Enlaces a sistema funcionando y código fuente. |
| `/api/proyectos/:id/perfiles/:perfilId/colaboradores-compatibles` | `GET` | 🟢 Listo | Búsqueda con parámetros de orden y filtro estricto. |
| `/api/personas-colaboradoras/:id/proyectos-compatibles` | `GET` | 🟢 Listo | Búsqueda de proyectos según habilidades. |
| `/api/notificaciones` | `GET`, `POST` | 🟢 Listo | Envío y consulta con réplica externa. |
| `/api/notificaciones/:id` | `GET`, `PATCH` | 🟢 Listo | Consulta por ID y marcado de lectura. |
| `/api/proyectos/:id/colaboraciones` | `POST` | 🔴 **Incompleto** | **No permite enviar si la colaboración es anónima.** |
| `/api/personas-colaboradoras/:id/medios-contacto` | - | 🟡 No expuesto | Se maneja solo en bloque vía `PUT /personas-colaboradoras/:id`. |

---

### E. Entregables y Documentación

1. **Diagrama de Clases (`designs/diagrama-clases.puml` y `docs/diagramadeclases.png`):**
   - 🔴 **Desactualizado:** El archivo `.puml` y la imagen `.png` son exactamente los de la **Primera Entrega**.
   - No figuran `Perfil`, `Hito`, `Notificacion`, `NotificadorSender`, las estrategias de notificación, `MedioDeContacto` ni el atributo de anonimato en `Colaboracion`.
2. **Documentación Swagger UI (`packages/backend/src/config/swagger.js`):**
   - 🟢 **Excelente:** Todos los endpoints nuevos de la 2da entrega están documentados en `/api-docs`.
3. **Documentación Markdown (`docs/API.md`):**
   - 🟡 **Incompleta:** No incluye los bloques de Hitos/Logros, Búsqueda de Compatibilidad ni Notificaciones.
4. **Despliegue (`docker-compose.yml`):**
   - 🟡 **Incompleto:** Solo tiene el contenedor de `mongo:6`. Falta incluir el servicio `backend` usando el `Dockerfile` existente para levantar todo el stack con `docker compose up`.

---

## 3. Alerta sobre Ramas Pendientes (`feature/medios-contacto-contribuciones`)

> [!WARNING]
> La rama remota `origin/feature/medios-contacto-contribuciones` **NO debe mergearse directamente a `develop`** tal como está.
> - Al inspeccionar el diff contra `develop`, esa rama contiene un merge desactualizado que **elimina** `Hito.js`, elimina las rutas de hitos en `ProyectoRoutes.js`, elimina los métodos de hitos en `Proyecto.js` y borra más de 300 líneas de tests de `ProyectoService.test.js`.
> - **Acción requerida:** El Integrante 3 debe rebasear sobre `develop` o tomar únicamente los cambios puntuales de:
>   1. Atributo `colaboracionAnonima` en `Colaboracion.js` y su serialización segura en `toJSON()`.
>   2. Recepción de `colaboracionAnonima` en `ProyectoController.anotarColaboracion` y `Proyecto.agregarColaboracion`.

---

## 4. Plan de Acción para Completar la Entrega 2

### Paso 1: Completar Contribuciones Anónimas (Integrante 3)
1. Modificar `packages/backend/src/domain/Colaboracion.js`:
   - Aceptar `colaboracionAnonima = false` en el constructor.
   - En `toJSON()`: si `this.colaboracionAnonima === true`, devolver `personaColaboradora: null` (o `{ anonimo: true }`), sin revelar quién es.
2. Modificar `packages/backend/src/controllers/ProyectoController.js`:
   - En `anotacionEsquema`: agregar `colaboracionAnonima: z.boolean().optional().default(false)`.
3. Modificar `packages/backend/src/services/ProyectoService.js` y `domain/Proyecto.js`:
   - Propagar el flag al instanciar `Colaboracion`.
4. Agregar tests unitarios para colaboraciones anónimas.

### Paso 2: Conectar la Persistencia Real en MongoDB (Todo el equipo / Integrante Base de Datos)
1. Crear los Schemas Mongoose faltantes:
   - `ProyectoSchema.js` (incluyendo embebidos o referenciados `hitos`, `perfiles`, `colaboraciones`).
   - `HabilidadSchema.js`.
2. Conectar los Repositorios a Mongoose:
   - Reemplazar los arrays en memoria en `ColectivoRepository`, `ProyectoRepository`, `PersonaColaboradoraRepository`, `HabilidadRepository` y `PerfilRepository` para que consulten y persistan en sus modelos de Mongoose.
   - Si se desea mantener compatibilidad con tests sin levantar Mongo real, se puede usar `mongodb-memory-server` en Jest o condicionar si `mongoose.connection.readyState === 1`.

### Paso 3: Crear el Script Semilla (*Seeds*)
1. Crear `packages/backend/src/seeds/seed.js`:
   - Conectarse a MongoDB.
   - Vaciar colecciones e insertar datos base (habilidades estándar, colectivos de prueba, proyectos con perfiles).
2. Agregar script en `packages/backend/package.json`: `"seed": "node src/seeds/seed.js"`.

### Paso 4: Completar Docker Compose
1. Actualizar `docker-compose.yml` en la raíz para incluir el servicio `backend`:
   ```yaml
   services:
     mongo:
       image: mongo:6
       ...
     backend:
       build:
         context: .
         dockerfile: packages/backend/Dockerfile
       ports:
         - "8000:8000"
       environment:
         - SERVER_PORT=8000
         - MONGODB_URI=mongodb://root:secret@mongo:27017
         - MONGODB_DB_NAME=codigo-a-voluntad
       depends_on:
         - mongo
   ```

### Paso 5: Actualizar Documentación y Diagrama
1. Actualizar `designs/diagrama-clases.puml` con:
   - Clase `Perfil` y relación con `Proyecto`.
   - Clase `Hito` y relación con `Proyecto`.
   - Clase `Notificacion` y clases de `EstrategiaNotificacion` (Strategy).
   - Atributos `mediosDeContacto` y `mensajesInternos` en `PersonaColaboradora`.
   - Atributo `colaboracionAnonima` en `Colaboracion`.
2. Regenerar `docs/diagramadeclases.png`.
3. Completar `docs/API.md` con las secciones de Hitos, Búsquedas y Notificaciones (copiando la estructura ya presente en Swagger).
