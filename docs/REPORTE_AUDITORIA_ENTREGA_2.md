# 📋 Reporte de Auditoría y Control de Requisitos — Entrega 2
**Proyecto:** *Código a Voluntad* (UTN FRBA - DDS 2C 2026)  
**Documento base:** `docs/[DDSO] Trabajo Práctico Integrador 2026 2C - Lu.md` (Segunda Entrega)  
**Plan de equipo:** `docs/División del trabajo — Segunda Entrega.md`  
**Rama evaluada:** `feature/persistencia-mongo-seeds` (sobre base `origin/develop`)  
**Fecha de actualización:** Octubre 2026  

---

## 1. Resumen Ejecutivo Actualizado

| Área Evaluada | Estado | Nivel de Cumplimiento | Observaciones Principales |
| :--- | :---: | :---: | :--- |
| **Dominio y Lógica de Negocio** | 🟢 Bueno | **85%** | Perfiles, Hitos, Compatibilidad y Notificaciones listos. Pendiente: Contribución Anónima y Medios de Contacto (asignados a Integrante 3). |
| **Persistencia (MongoDB)** | 🟢 Cumplido | **100%** | Todas las entidades mapeadas con esquemas Mongoose y persistidas asíncronamente en MongoDB con soporte de repositorios. |
| **Scripts Semilla (*Seeds*)** | 🟢 Cumplido | **100%** | Implementado `packages/backend/src/seeds/seed.js` con datos completos y ejecutables mediante `npm run seed:backend`. |
| **APIs REST** | 🟢 Muy Bueno | **95%** | CRUD perfiles, CRUD hitos, búsquedas de compatibilidad y notificaciones 100% asíncronos y funcionales. |
| **Despliegue (Docker)** | 🟢 Cumplido | **100%** | `docker-compose.yml` orquesta MongoDB y el contenedor del backend con sus variables de entorno configuradas. |
| **Testing Automatizado** | 🟢 Excelente | **100%** | **32 suites de pruebas (332 tests unitarios e integrados)** pasando en verde sin dependencias externas requeridas. |
| **Documentación** | 🟡 Parcial | **65%** | Swagger UI al día en `/api-docs`. Pendiente sincronizar `docs/API.md` y diagrama UML de clases (`.puml` / `.png`). |

---

## 2. Matriz de Requisitos (Consigna vs. Estado Real)

### A. Cambios al Dominio

| Requisito de la Consigna | Responsable | Estado | Detalle técnico |
| :--- | :---: | :---: | :--- |
| **Perfiles en Proyectos** (descripción, obligatorias, opcionales, compromiso, modalidad) | Integrante 1 | 🟢 **Cumplido** | Clase `Perfil.js` implementada con validaciones cruzadas. `Proyecto.js` administra su colección de perfiles. |
| **Logros e Hitos** (% de concreción, logros/hitos, enlaces a repo público y sistema) | Integrante 2 | 🟢 **Cumplido** | Clase `Hito.js`, validación de progresión ascendente de %, cálculo de avance y `actualizarEnlaces()` en `Proyecto.js`. |
| **Medios de Contacto** (Email, WhatsApp, SMS; registro interno y no público) | Integrante 3 | 🟡 **En desarrollo** | Asignado al Integrante 3 en rama `feature/medios-contacto-contribuciones` (HU05). |
| **Mensajería Interna** (flag de aceptación de contacto) | Integrante 3 / 5 | 🟢 **Cumplido** | Atributo `mensajesInternos` en `PersonaColaboradora`. Valida en `NotificacionService` que la persona acepte mensajes antes de enviar. |
| **Contribuciones Anónimas** (opción de anonimato al anotarse, sin exponer quién la realizó) | Integrante 3 | 🟡 **En desarrollo** | Asignado al Integrante 3 en su rama de trabajo (HU07). Se removió del branch común para evitar colisiones. |
| **Búsqueda por Perfil / Habilidades** | Integrante 4 | 🟢 **Cumplido** | `Compatibilidad.js` y `CompatibilidadService.js` implementan scoring y filtrado para ambas direcciones. |
| **Notificaciones Internas y Réplica Externa** (Estrategia Email, SMS, WhatsApp) | Integrante 5 | 🟢 **Cumplido** | Patrón Strategy implementado (`NotificadorSender`, Nodemailer para Gmail SMTP, Twilio para SMS/WhatsApp). |

---

### B. Persistencia en MongoDB

> [!NOTE]
> **REQUISITO COMPLETADO:** Se definieron esquemas de Mongoose con índices y subdocumentos embebidos. Todos los repositorios se migraron a operaciones asíncronas hacia MongoDB, conservando compatibilidad para la suite de pruebas automatizadas.

| Entidad / Repositorio | Esquema Mongoose | ¿Persiste en Mongo? | ¿Lee de Mongo? | Estado Real |
| :--- | :---: | :---: | :---: | :--- |
| **ColectivoRepository** | ✅ `ColectivoSchema.js` | ✅ Sí | ✅ Sí | **Persistido en colección `colectivos`** |
| **ProyectoRepository** | ✅ `ProyectoSchema.js` | ✅ Sí | ✅ Sí | **Persistido en colección `proyectos` (con hitos, perfiles y colaboraciones embebidos)** |
| **PersonaColaboradoraRepository** | ✅ `PersonaColaboradoraSchema.js` | ✅ Sí | ✅ Sí | **Persistido en colección `personascolaboradoras`** |
| **HabilidadRepository** | ✅ `HabilidadSchema.js` | ✅ Sí | ✅ Sí | **Persistido en colección `habilidades`** |
| **PerfilRepository** | ✅ `PerfilSchema.js` | ✅ Sí | ✅ Sí | **Persistido en colección `perfiles`** |
| **NotificacionRepository** | ✅ `NotificacionSchema.js` | ✅ Sí | ✅ Sí | **Persistido en colección `notificaciones`** |

---

### C. Scripts Semilla (*Seeds*)

> [!TIP]
> **REQUISITO COMPLETADO:** El script semilla se encuentra implementado y testeado en `packages/backend/src/seeds/seed.js`.

- **Comandos de ejecución disponibles:**
  - Desde el backend: `npm run seed`
  - Desde la raíz del repositorio: `npm run seed:backend`
- **Datos inicializados en MongoDB:**
  - **7 Habilidades Técnicas:** `react`, `node_js`, `python`, `docker`, `mongodb`, `ui_ux`, `qa_testing`.
  - **3 Colectivos:** "Huellas Solidarias" (ONG), "Cooperativa Tecnológica Conectando Raíces" (Cooperativa), "Comunidad Agroecológica El Encuentro" (Comunidad).
  - **4 Personas Colaboradoras:** Con perfiles completos, habilidades, medios de contacto y participaciones.
  - **3 Proyectos Sociales:** Con hitos de evolución alcanzados, porcentaje de avance calculado, enlaces de repositorio/demo pública y perfiles buscados.

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
| `/api/proyectos/:id/colaboraciones` | `POST` | 🟡 Base lista | Pendiente flag anónimo por parte del Integrante 3. |

---

### E. Entregables y Despliegue

1. **Despliegue (`docker-compose.yml`):**
   - 🟢 **Listo:** Orquesta el contenedor `mongo:7.0` y el contenedor `backend` mediante su `Dockerfile`, configurando variables de entorno de puerto y URI de base de datos.
2. **Documentación Swagger UI (`packages/backend/src/config/swagger.js`):**
   - 🟢 **Excelente:** Todos los endpoints nuevos están documentados y disponibles en `/api-docs`.
3. **Diagrama de Clases UML (`designs/diagrama-clases.puml` y `docs/diagramadeclases.png`):**
   - 🟡 **Pendiente:** Sincronizar el diagrama con las nuevas clases de la Entrega 2 (`Perfil`, `Hito`, `Notificacion`, `NotificadorSender`).
4. **Documentación Markdown (`docs/API.md`):**
   - 🟡 **Pendiente:** Copiar los nuevos endpoints documentados en Swagger hacia la documentación estática.

---

## 3. Estado de Ramas y Separación de Tareas

- **Rama `feature/persistencia-mongo-seeds`:**
  - Persistencia documental completa en MongoDB.
  - Script seed de datos iniciales.
  - Orquestación Docker Compose.
  - Adaptación asíncrona en toda la cadena de Servicios y Controladores.
  - Zero colisiones: no incluye código perteneciente al Integrante 3.
- **Rama `feature/medios-contacto-contribuciones` (Integrante 3):**
  - Contiene el trabajo en progreso para HU05, HU06 y HU07.
  - Podrá mergearse sobre `develop` una vez finalizadas sus tareas y rebaseada limpiamente.

---

## 4. Estado de las Tareas Planificadas

- [x] **Paso 1: Persistencia Real en MongoDB:** Esquemas Mongoose, clientes de conexión, repositorios asíncronos y dualidad para tests.
- [x] **Paso 2: Script Semilla (*Seeds*):** Script `seed.js` y comandos `npm run seed` / `npm run seed:backend`.
- [x] **Paso 3: Orquestación Docker Compose:** Definición del servicio backend con enlace a MongoDB y volumen de datos persistente.
- [ ] **Paso 4 (Integrante 3):** Finalizar endpoints de medios de contacto y soporte de contribuciones anónimas en su rama.
- [ ] **Paso 5 (Documentación):** Actualizar diagrama de clases UML `.puml` y regenerar `.png` para la entrega final.
