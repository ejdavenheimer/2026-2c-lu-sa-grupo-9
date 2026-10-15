# 📖 Documentación de la API REST - Código a Voluntad

Esta es la especificación y guía de uso de la **API REST** de *Código a Voluntad* para la **Primera Entrega** de Desarrollo de Software (DDS - UTN FRBA).

---

## 🌐 Configuración General

* **URL Base en desarrollo:** `http://localhost:8000/api`
* **Swagger UI interactivo:** `http://localhost:8000/api-docs`
* **Formato de datos:** `application/json` (para peticiones y respuestas).

> El puerto se configura con `SERVER_PORT` en el archivo `.env` (ver `.env.example`).

---

## ⚠️ Manejo de Errores

Todos los errores de la API los emite un **middleware centralizado** (`errorHandler`), por lo que **siempre** tienen la misma forma, sin importar qué capa los originó:

```json
{
  "status": "fail",
  "message": "No se encontró el proyecto con ID 'proy-9'",
  "timestamp": "2026-10-06T21:31:53.613Z"
}
```

* `status`: `"fail"` para errores del cliente (4xx) y `"error"` para errores del servidor (5xx).
* `message`: descripción del problema.
* `timestamp`: momento en que se produjo.

### Códigos utilizados

| Código | Cuándo se devuelve | Dónde se origina |
| :---: | :--- | :--- |
| `400` | La request está **malformada**: falta un campo obligatorio, tiene el tipo incorrecto o se envió un campo no permitido | Validación de esquema en el controller |
| `404` | El recurso solicitado no existe | Capa de servicios |
| `409` | La operación choca con el estado actual del sistema: un duplicado, o un proyecto ya cerrado | Dominio y repositories |
| `422` | La request se entiende perfectamente, pero los **valores violan una regla de negocio** | Dominio y capa de servicios |
| `500` | Error inesperado del servidor | Cualquiera |

La diferencia entre **400 y 422** es la clave: `400` significa *"no entiendo tu request"*; `422`, *"la entiendo, pero lo que pedís no es válido"*. Por ejemplo, en `POST /api/habilidades`:

* `{ "titulo": 42 }` → **400**, porque `titulo` tiene que ser texto.
* `{ "titulo": "" }` → **422**, porque es texto pero está vacío, y el dominio exige un título.

---

## 📋 Resumen de Endpoints

| Módulo | Método | Ruta | Descripción |
| :--- | :---: | :--- | :--- |
| **Health** | `GET` | `/api/health` | Estado de salud y disponibilidad del servidor |
| **Colectivos** | `GET` | `/api/colectivos` | Listar todos los colectivos registrados |
| | `POST` | `/api/colectivos` | Crear un nuevo colectivo/organización |
| | `GET` | `/api/colectivos/:id` | Obtener información de un colectivo por su ID |
| | `PUT` | `/api/colectivos/:id` | Actualizar los datos de un colectivo |
| | `DELETE` | `/api/colectivos/:id` | Eliminar un colectivo registrado |
| **Proyectos** | `GET` | `/api/proyectos` | Listar todos los proyectos cargados |
| | `POST` | `/api/proyectos` | Publicar un nuevo proyecto asociado a un colectivo |
| | `GET` | `/api/proyectos/:id` | Obtener el detalle de un proyecto |
| | `PUT` | `/api/proyectos/:id` | Modificar los datos de un proyecto |
| | `PATCH` | `/api/proyectos/:id` | Actualización parcial del proyecto (cierre manual) |
| | `DELETE` | `/api/proyectos/:id` | Eliminar un proyecto registrado |
| | `POST` | `/api/proyectos/:id/colaboraciones` | Anotar a una persona colaboradora en un proyecto |
| **Perfiles (Segunda Entrega)** | `POST` | `/api/proyectos/:id/perfiles` | Agregar un perfil a un proyecto (HU01) |
| | `GET` | `/api/proyectos/:id/perfiles` | Listar perfiles requeridos de un proyecto (HU02) |
| | `GET` | `/api/proyectos/:id/perfiles/:perfilId` | Obtener un perfil específico de un proyecto (HU02) |
| | `PUT` | `/api/proyectos/:id/perfiles/:perfilId` | Modificar los datos de un perfil (HU02) |
| | `DELETE` | `/api/proyectos/:id/perfiles/:perfilId` | Eliminar un perfil de un proyecto (HU02) |
| **Personas Colaboradoras** | `GET` | `/api/personas-colaboradoras` | Listar todas las personas colaboradoras |
| | `POST` | `/api/personas-colaboradoras` | Registrar una nueva persona colaboradora |
| | `GET` | `/api/personas-colaboradoras/:id` | Obtener el perfil de un colaborador por ID |
| | `PUT` | `/api/personas-colaboradoras/:id` | Actualizar los datos de un colaborador |
| | `DELETE` | `/api/personas-colaboradoras/:id` | Eliminar una persona colaboradora |
| | `POST` | `/api/personas-colaboradoras/:id/habilidades` | Asignar una habilidad al perfil de un colaborador |
| **Habilidades** | `GET` | `/api/habilidades` | Listar catálogo de habilidades disponibles |
| | `POST` | `/api/habilidades` | Registrar una nueva habilidad en el catálogo |
| | `GET` | `/api/habilidades/:codigo` | Obtener información de una habilidad por su código |
| | `PUT` | `/api/habilidades/:codigo` | Actualizar una habilidad existente |
| | `DELETE` | `/api/habilidades/:codigo` | Eliminar una habilidad del catálogo |
| **Ubicaciones** | `GET` | `/api/ubicaciones/provincias` | Listar provincias y CABA (vía API Georef) |
| | `GET` | `/api/ubicaciones/paises` | Listar catálogo de países disponibles |

---

## 🩺 1. Health Check

### `GET /api/health`
Verifica la disponibilidad del servicio.

* **Respuesta Exitosa (`200 OK`):**
```json
{
  "status": "OK",
  "timestamp": "2026-09-14T13:00:00.000Z"
}
```

---

## 🏢 2. Colectivos

### `GET /api/colectivos`
Devuelve el listado de todos los colectivos registrados.

* **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": "col-1",
    "nombre": "Fundación Vida Silvestre",
    "descripcion": "Conservación del medio ambiente y especies nativas.",
    "tipo": "ONG",
    "ubicacion": {
      "pais": "Argentina",
      "provincia": "Buenos Aires",
      "ciudad": "La Plata"
    },
    "proyectos": []
  }
]
```

---

### `POST /api/colectivos`
Registra un nuevo colectivo u organización.

* **Campos Requeridos:** `nombre`, `tipo` (`"FUNDACION"`, `"ASOCIACION_BARRIAL"`, `"ONG"`, `"ASAMBLEA"`).
* **Cuerpo de la Petición (Request Body):**
```json
{
  "nombre": "Fundación Vida Silvestre",
  "descripcion": "Conservación del medio ambiente y especies nativas.",
  "tipo": "ONG",
  "ubicacion": {
    "pais": "Argentina",
    "provincia": "Buenos Aires",
    "ciudad": "La Plata"
  }
}
```
* **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "col-1",
  "nombre": "Fundación Vida Silvestre",
  "descripcion": "Conservación del medio ambiente y especies nativas.",
  "tipo": "ONG",
  "ubicacion": {
    "pais": "Argentina",
    "provincia": "Buenos Aires",
    "ciudad": "La Plata"
  },
  "proyectos": []
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si falta el `nombre` o el `tipo`, o si se envía un campo no permitido.
  * `409 Conflict`: Si ya existe un colectivo con el mismo nombre.
  * `422 Unprocessable Entity`: Si el `nombre` o el `tipo` llegan vacíos.

---

### `GET /api/colectivos/:id`
Obtiene un colectivo por su ID.

* **Parámetros de Ruta:** `id` (string, ej. `col-1`).
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "col-1",
  "nombre": "Fundación Vida Silvestre",
  "descripcion": "Conservación del medio ambiente y especies nativas.",
  "tipo": "ONG",
  "ubicacion": {
    "pais": "Argentina",
    "provincia": "Buenos Aires",
    "ciudad": "La Plata"
  },
  "proyectos": []
}
```
* **Respuesta de Error (`404 Not Found`):** Si no existe el colectivo con el ID solicitado.

---

### `PUT /api/colectivos/:id`
Actualiza los datos de un colectivo existente.

* **Parámetros de Ruta:** `id` (string, ej. `col-1`).
* **Cuerpo de la Petición:**
```json
{
  "descripcion": "Nueva descripción de la organización.",
  "tipo": "FUNDACION"
}
```
* **Respuesta Exitosa (`200 OK`):** Objeto `Colectivo` actualizado.
* **Respuestas de Error:**
  * `400 Bad Request`: Si los datos son inválidos.
  * `404 Not Found`: Si el colectivo no existe.
  * `409 Conflict`: Si el nuevo nombre ya está en uso por otro colectivo.

---

### `DELETE /api/colectivos/:id`
Elimina un colectivo del sistema.

* **Parámetros de Ruta:** `id` (string, ej. `col-1`).
* **Respuesta Exitosa (`204 No Content`):** Sin cuerpo.
* **Respuesta de Error (`404 Not Found`):** Si el colectivo no existe.

---

## 🚀 3. Proyectos

### `GET /api/proyectos`
Devuelve la lista de proyectos registrados.

* **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": "proy-1",
    "titulo": "Portal Web Comunitario",
    "descripcion": "Plataforma de difusión para actividades del barrio.",
    "unidadCompromiso": "HORAS_SEMANALES",
    "cantidadHoras": 10,
    "modalidadesColaboracion": ["GRATUITA"],
    "estado": "PUBLICADO",
    "fechaAlta": "2026-09-14T10:00:00.000Z",
    "fechaCierre": null,
    "colectivo": {
      "id": "col-1",
      "nombre": "Fundación Vida Silvestre"
    },
    "habilidadesRequeridas": [
      {
        "titulo": "Desarrollo Web React",
        "codigo": "desarrollo_web_react",
        "descripcion": "Frontend React"
      }
    ],
    "colaboraciones": []
  }
]
```

---

### `POST /api/proyectos`
Publica un nuevo proyecto asociado a un colectivo.

* **Campos Requeridos:**
  * `titulo` (string)
  * `descripcion` (string)
  * `unidadCompromiso` (`"HORAS_TOTALES"`, `"HORAS_SEMANALES"`, `"HORAS_MENSUALES"`)
  * `cantidadHoras` (number > 0)
  * `modalidadesColaboracion` (array con al menos uno de: `"GRATUITA"`, `"CON_INCENTIVO_ECONOMICO"`, `"CON_POSIBILIDAD_CONTRATACION"`)
  * `colectivoId` (string)
  * `habilidadesRequeridasCodigos` (array de strings con los códigos únicos de las habilidades necesarias)
* **Cuerpo de la Petición:**
```json
{
  "titulo": "Portal Web Comunitario",
  "descripcion": "Plataforma de difusión para actividades del barrio.",
  "unidadCompromiso": "HORAS_SEMANALES",
  "cantidadHoras": 10,
  "modalidadesColaboracion": ["GRATUITA"],
  "colectivoId": "col-1",
  "habilidadesRequeridasCodigos": ["desarrollo_web_react"]
}
```
* **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "proy-1",
  "titulo": "Portal Web Comunitario",
  "descripcion": "Plataforma de difusión para actividades del barrio.",
  "unidadCompromiso": "HORAS_SEMANALES",
  "cantidadHoras": 10,
  "modalidadesColaboracion": ["GRATUITA"],
  "estado": "PUBLICADO",
  "fechaAlta": "2026-09-14T10:00:00.000Z",
  "fechaCierre": null,
  "habilidadesRequeridas": [
    {
      "titulo": "Desarrollo Web React",
      "codigo": "desarrollo_web_react",
      "descripcion": "Frontend React"
    }
  ],
  "colaboraciones": []
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si falta un campo obligatorio, tiene el tipo incorrecto o se envía un campo no permitido.
  * `404 Not Found`: Si el `colectivoId` o algún código de habilidad no existe.
  * `409 Conflict`: Si el colectivo ya tiene un proyecto con el mismo título.
  * `422 Unprocessable Entity`: Si no se indica ninguna habilidad requerida, o si algún valor incumple las reglas del proyecto.

---

### `GET /api/proyectos/:id`
Obtiene los datos completos de un proyecto por su ID.

* **Parámetros de Ruta:** `id` (string, ej. `proy-1`).
* **Respuesta Exitosa (`200 OK`):** Objeto `Proyecto`.
* **Respuesta de Error (`404 Not Found`):** Si el proyecto no existe.

---

### `POST /api/proyectos/:id/colaboraciones`
Anota a una persona colaboradora en un proyecto (estableciendo una colaboración).

* **Reglas de Negocio Validadas:**
  1. El proyecto debe existir y estar en estado `PUBLICADO` (no cerrado).
  2. La persona colaboradora debe existir.
  3. La persona colaboradora debe poseer al menos una de las habilidades requeridas por el proyecto.
* **Cuerpo de la Petición:**
```json
{
  "personaColaboradoraId": "colab-1"
}
```
* **Respuesta Exitosa (`201 Created`):**
```json
{
  "fechaInscripcion": "2026-09-14T10:30:00.000Z",
  "personaColaboradora": {
    "id": "colab-1",
    "nombreFantasia": "DevSolidario"
  },
  "proyecto": {
    "id": "proy-1",
    "titulo": "Portal Web Comunitario"
  }
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si falta `personaColaboradoraId`, tiene el tipo incorrecto o se envía un campo no permitido.
  * `404 Not Found`: Si el proyecto o la persona colaboradora no existen.
  * `409 Conflict`: Si el proyecto está cerrado y ya no admite nuevas colaboraciones.
  * `422 Unprocessable Entity`: Si la persona no cuenta con ninguna de las habilidades requeridas por el proyecto.

---

### `PATCH /api/proyectos/:id`
Actualización parcial de un proyecto. Permite realizar el cierre manual del proyecto modificando su `estado` a `CERRADO`. A partir de este momento, se establece la `fechaCierre`, el estado cambia a `CERRADO` y se rechaza cualquier nuevo intento de colaboración.

* **Parámetros de Ruta:** `id` (string, ej. `proy-1`).
* **Cuerpo de la Petición:**
```json
{
  "estado": "CERRADO"
}
```
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "proy-1",
  "titulo": "Portal Web Comunitario",
  "descripcion": "Plataforma de difusión para actividades del barrio.",
  "unidadCompromiso": "HORAS_SEMANALES",
  "cantidadHoras": 10,
  "modalidadesColaboracion": ["GRATUITA"],
  "estado": "CERRADO",
  "fechaAlta": "2026-09-14T10:00:00.000Z",
  "fechaCierre": "2026-09-14T11:00:00.000Z",
  "habilidadesRequeridas": [
    {
      "titulo": "Desarrollo Web React",
      "codigo": "desarrollo_web_react",
      "descripcion": "Frontend React"
    }
  ],
  "colaboraciones": []
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si el estado enviado no es válido o el formato es incorrecto.
  * `404 Not Found`: Si el proyecto no existe.

---

### `PUT /api/proyectos/:id`
Modifica los datos generales de un proyecto publicado.

* **Parámetros de Ruta:** `id` (string, ej. `proy-1`).
* **Cuerpo de la Petición:**
```json
{
  "titulo": "Portal Web Comunitario V2",
  "cantidadHoras": 15
}
```
* **Respuesta Exitosa (`200 OK`):** Objeto `Proyecto` actualizado.
* **Respuestas de Error:**
  * `400 Bad Request`: Datos de actualización inválidos.
  * `404 Not Found`: Si el proyecto no existe.

---

### `DELETE /api/proyectos/:id`
Elimina un proyecto del sistema.

* **Parámetros de Ruta:** `id` (string, ej. `proy-1`).
* **Respuesta Exitosa (`204 No Content`):** Sin cuerpo.
* **Respuesta de Error (`404 Not Found`):** Si el proyecto no existe.

---

## 🎯 4. Perfiles de Proyecto (Segunda Entrega — Integrante 1)

Los proyectos en la Segunda Entrega definen sus necesidades a través de **perfiles**, con granularidad en habilidades requeridas y opcionales, compromiso esperado y modalidad de colaboración (**HU01** y **HU02**).

### `POST /api/proyectos/:id/perfiles`
Agrega un nuevo perfil a un proyecto existente (**HU01**).

* **Parámetros de Ruta:** `id` (string, ID del proyecto).
* **Cuerpo de la Petición:**
```json
{
  "nombre": "Desarrollador Frontend",
  "descripcion": "Desarrollador Frontend React",
  "habilidadesRequeridasCodigos": ["desarrollo_web_react"],
  "habilidadesOpcionalesCodigos": ["typescript"],
  "unidadCompromiso": "HORAS_SEMANALES",
  "cantidadHoras": 10,
  "modalidadesColaboracion": ["GRATUITA"]
}
```
* **Reglas de Validación:**
  * El proyecto debe existir y estar en estado `PUBLICADO` (no cerrado).
  * `descripcion` es obligatoria y no vacía.
  * `habilidadesRequeridasCodigos` debe contener al menos un código válido existente.
  * Si se indican `habilidadesOpcionalesCodigos`, deben existir en el sistema y no solaparse con las requeridas.
  * `unidadCompromiso` debe ser `"HORAS_TOTALES"`, `"HORAS_SEMANALES"` o `"HORAS_MENSUALES"`.
  * `cantidadHoras` debe ser un número positivo (> 0).
  * `modalidadesColaboracion` debe ser un array no vacío con valores válidos (`"GRATUITA"`, `"CON_INCENTIVO_ECONOMICO"`, `"CON_POSIBILIDAD_CONTRATACION"`).
* **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "perf-a1b2c3d4-...",
  "nombre": "Desarrollador Frontend",
  "descripcion": "Desarrollador Frontend React",
  "habilidadesRequeridas": [
    {
      "id": "hab-1",
      "titulo": "Desarrollo Web React",
      "codigo": "desarrollo_web_react",
      "descripcion": "Frontend React"
    }
  ],
  "habilidadesOpcionales": [
    {
      "id": "hab-2",
      "titulo": "TypeScript",
      "codigo": "typescript",
      "descripcion": "Tipado estático"
    }
  ],
  "unidadCompromiso": "HORAS_SEMANALES",
  "cantidadHoras": 10,
  "modalidadesColaboracion": ["GRATUITA"],
  "proyectoId": "proy-1"
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Formato de request inválido o tipos incorrectos.
  * `404 Not Found`: Si el proyecto o alguna habilidad no existe.
  * `409 Conflict`: Si el proyecto está cerrado.
  * `422 Unprocessable Entity`: Reglas de negocio incumplidas (ej. sin habilidades requeridas).

---

### `GET /api/proyectos/:id/perfiles`
Lista todos los perfiles asociados a un proyecto (**HU02**).

* **Parámetros de Ruta:** `id` (string, ID del proyecto).
* **Respuesta Exitosa (`200 OK`):** Array con los objetos `Perfil` del proyecto.
* **Respuesta de Error:**
  * `404 Not Found`: Si el proyecto no existe.

---

### `GET /api/proyectos/:id/perfiles/:perfilId`
Obtiene el detalle de un perfil específico de un proyecto (**HU02**).

* **Parámetros de Ruta:**
  * `id`: ID del proyecto.
  * `perfilId`: ID del perfil.
* **Respuesta Exitosa (`200 OK`):** Objeto `Perfil`.
* **Respuesta de Error:**
  * `404 Not Found`: Si el proyecto o el perfil no existen.

---

### `PUT /api/proyectos/:id/perfiles/:perfilId`
Modifica los datos de un perfil existente (**HU02**).

* **Parámetros de Ruta:**
  * `id`: ID del proyecto.
  * `perfilId`: ID del perfil.
* **Cuerpo de la Petición:** (campos opcionales a modificar)
```json
{
  "nombre": "Desarrollador Senior Frontend",
  "descripcion": "Desarrollador Senior Frontend React",
  "cantidadHoras": 15,
  "habilidadesRequeridasCodigos": ["desarrollo_web_react", "node"],
  "modalidadesColaboracion": ["CON_INCENTIVO_ECONOMICO"]
}
```
* **Respuesta Exitosa (`200 OK`):** Objeto `Perfil` actualizado.
* **Respuestas de Error:**
  * `400 Bad Request`: Si el payload contiene datos inválidos o desconocidos.
  * `404 Not Found`: Si el proyecto, el perfil o alguna habilidad no existe.
  * `409 Conflict`: Si el proyecto está cerrado.

---

### `DELETE /api/proyectos/:id/perfiles/:perfilId`
Elimina un perfil de un proyecto (**HU02**).

* **Parámetros de Ruta:**
  * `id`: ID del proyecto.
  * `perfilId`: ID del perfil.
* **Respuesta Exitosa (`204 No Content`):** Sin cuerpo.
* **Respuestas de Error:**
  * `404 Not Found`: Si el proyecto o el perfil no existen.
  * `409 Conflict`: Si el proyecto está cerrado.

---

## 👩‍💻 5. Personas Colaboradoras

### `GET /api/personas-colaboradoras`
Lista todas las personas colaboradoras registradas.

* **Respuesta Exitosa (`200 OK`):** Array con objetos `PersonaColaboradora`.

---

### `POST /api/personas-colaboradoras`
Crea una nueva persona colaboradora.

* **Regla de Validación:** Debe tener al menos `nombreFantasia`, o `nombre` y `apellido`, o al menos una cuenta en `cuentas`.
* **Cuerpo de la Petición:**
```json
{
  "nombreFantasia": "DevSolidario",
  "nombre": "Ana",
  "apellido": "García",
  "pronombres": ["ella"],
  "presentacion": "Desarrolladora apasionada por el impacto social.",
  "cuentas": [
    {
      "nombreUsuario": "anagarcia",
      "tipo": "GITHUB"
    }
  ],
  "habilidades": []
}
```
* **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "colab-1",
  "nombreFantasia": "DevSolidario",
  "nombre": "Ana",
  "apellido": "García",
  "pronombres": ["ella"],
  "presentacion": "Desarrolladora apasionada por el impacto social.",
  "cuentas": [
    {
      "nombreUsuario": "anagarcia",
      "tipo": "GITHUB"
    }
  ],
  "habilidades": [],
  "colaboraciones": []
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si algún campo tiene el tipo incorrecto o se envía un campo no permitido.
  * `409 Conflict`: Si ya existe una persona colaboradora con el mismo `nombreFantasia`.
  * `422 Unprocessable Entity`: Si no cumple los requisitos mínimos de identidad (al menos `nombreFantasia`, o bien `nombre` y `apellido`).

---

### `GET /api/personas-colaboradoras/:id`
Obtiene el perfil y las habilidades de una persona colaboradora.

* **Parámetros de Ruta:** `id` (string, ej. `colab-1`).
* **Respuesta Exitosa (`200 OK`):** Objeto `PersonaColaboradora`.
* **Respuesta de Error (`404 Not Found`):** Si no se encuentra la persona colaboradora.

---

### `POST /api/personas-colaboradoras/:id/habilidades`
Asocia una habilidad al perfil de la persona colaboradora.

* **Parámetros de Ruta:** `id` (string, ej. `colab-1`).
* **Cuerpo de la Petición:**
```json
{
  "titulo": "Desarrollo Web React",
  "codigo": "desarrollo_web_react",
  "descripcion": "Frontend React"
}
```
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "colab-1",
  "nombreFantasia": "DevSolidario",
  "habilidades": [
    {
      "titulo": "Desarrollo Web React",
      "codigo": "desarrollo_web_react",
      "descripcion": "Frontend React"
    }
  ]
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si algún campo de la habilidad tiene el tipo incorrecto o se envía un campo no permitido.
  * `404 Not Found`: Si la persona colaboradora no existe.
  * `409 Conflict`: Si esa habilidad ya había sido agregada a la persona colaboradora.

---

### `PUT /api/personas-colaboradoras/:id`
Actualiza la información de perfil de una persona colaboradora.

* **Parámetros de Ruta:** `id` (string, ej. `colab-1`).
* **Cuerpo de la Petición:**
```json
{
  "presentacion": "Perfil actualizado con experiencia en Node y React.",
  "nombreFantasia": "DevSenior"
}
```
* **Respuesta Exitosa (`200 OK`):** Objeto `PersonaColaboradora` actualizado.
* **Respuestas de Error:**
  * `400 Bad Request`: Datos inválidos.
  * `404 Not Found`: Si la persona colaboradora no existe.

---

### `DELETE /api/personas-colaboradoras/:id`
Elimina el registro de una persona colaboradora.

* **Parámetros de Ruta:** `id` (string, ej. `colab-1`).
* **Respuesta Exitosa (`204 No Content`):** Sin cuerpo.
* **Respuesta de Error (`404 Not Found`):** Si no existe.

---

## 🛠️ 5. Habilidades

### `GET /api/habilidades`
Devuelve el catálogo de todas las habilidades precargadas.

* **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "titulo": "Desarrollo Web React",
    "codigo": "desarrollo_web_react",
    "descripcion": "Creación de interfaces con React."
  },
  {
    "titulo": "Backend Node.js",
    "codigo": "backend_nodejs",
    "descripcion": "Desarrollo de servicios con Node y Express."
  }
]
```

---

### `POST /api/habilidades`
Crea una nueva habilidad en el catálogo.

* **Campos:** `titulo` (requerido), `codigo` (opcional, se normaliza automáticamente a snake_case si no se envía), `descripcion` (opcional).
* **Cuerpo de la Petición:**
```json
{
  "titulo": "Desarrollo Web React",
  "descripcion": "Creación de interfaces con React."
}
```
* **Respuesta Exitosa (`201 Created`):**
```json
{
  "titulo": "Desarrollo Web React",
  "codigo": "desarrollo_web_react",
  "descripcion": "Creación de interfaces con React."
}
```
* **Respuestas de Error:**
  * `400 Bad Request`: Si falta el `titulo`, tiene el tipo incorrecto o se envía un campo no permitido.
  * `409 Conflict`: Si ya existe una habilidad con el mismo código.
  * `422 Unprocessable Entity`: Si el `titulo` llega vacío.

---

### `GET /api/habilidades/:codigo`
Obtiene una habilidad específica por su código.

* **Parámetros de Ruta:** `codigo` (string, ej. `desarrollo_web_react`).
* **Respuesta Exitosa (`200 OK`):** Objeto `Habilidad`.
* **Respuesta de Error (`404 Not Found`):** Si el código no existe en el catálogo.

---

### `PUT /api/habilidades/:codigo`
Actualiza el título o descripción de una habilidad existente.

* **Parámetros de Ruta:** `codigo` (string, ej. `desarrollo_web_react`).
* **Cuerpo de la Petición:**
```json
{
  "titulo": "Desarrollo Web React Avanzado",
  "descripcion": "Interfaces web con React, Redux y Next."
}
```
* **Respuesta Exitosa (`200 OK`):** Objeto `Habilidad` actualizado.
* **Respuestas de Error:**
  * `400 Bad Request`: Datos inválidos.
  * `404 Not Found`: Si la habilidad no existe.

---

### `DELETE /api/habilidades/:codigo`
Elimina una habilidad del catálogo general.

* **Parámetros de Ruta:** `codigo` (string, ej. `desarrollo_web_react`).
* **Respuesta Exitosa (`204 No Content`):** Sin cuerpo.
* **Respuesta de Error (`404 Not Found`):** Si la habilidad no existe.

---

## 🌍 6. Ubicaciones (Servicio Geográfico - Georef)

### `GET /api/ubicaciones/provincias`
Consulta la API pública oficial de Georef (o catálogo de contingencia) y devuelve el listado de las 23 provincias argentinas y CABA ordenadas alfabéticamente.

* **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": "06",
    "nombre": "Buenos Aires"
  },
  {
    "id": "02",
    "nombre": "Ciudad Autónoma de Buenos Aires"
  },
  {
    "id": "14",
    "nombre": "Córdoba"
  }
]
```

---

### `GET /api/ubicaciones/paises`
Devuelve el listado de países habilitados en la plataforma con sus identificadores y nombres oficiales.

* **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": "AR",
    "nombre": "Argentina"
  },
  {
    "id": "UY",
    "nombre": "Uruguay"
  }
]
```

