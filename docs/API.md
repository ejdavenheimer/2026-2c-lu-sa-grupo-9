# 📖 Documentación de la API REST - Código a Voluntad

Esta es la especificación y guía de uso de la **API REST** de *Código a Voluntad* para la **Primera Entrega** de Desarrollo de Software (DDS - UTN FRBA).

---

## 🌐 Configuración General

* **URL Base en desarrollo:** `http://localhost:3001/api`
* **Swagger UI interactivo:** `http://localhost:3001/api-docs`
* **Formato de datos:** `application/json` (para peticiones y respuestas).

---

## 📋 Resumen de Endpoints

| Módulo | Método | Ruta | Descripción |
| :--- | :---: | :--- | :--- |
| **Health** | `GET` | `/api/health` | Estado de salud y disponibilidad del servidor |
| **Colectivos** | `GET` | `/api/colectivos` | Listar todos los colectivos registrados |
| | `POST` | `/api/colectivos` | Crear un nuevo colectivo/organización |
| | `GET` | `/api/colectivos/:id` | Obtener información de un colectivo por su ID |
| **Proyectos** | `GET` | `/api/proyectos` | Listar todos los proyectos cargados |
| | `POST` | `/api/proyectos` | Publicar un nuevo proyecto asociado a un colectivo |
| | `GET` | `/api/proyectos/:id` | Obtener el detalle de un proyecto |
| | `POST` | `/api/proyectos/:id/colaboraciones` | Anotar a una persona colaboradora en un proyecto |
| | `PATCH` | `/api/proyectos/:id` | Actualización parcial del proyecto (cierre manual) |
| **Personas Colaboradoras** | `GET` | `/api/personas-colaboradoras` | Listar todas las personas colaboradoras |
| | `POST` | `/api/personas-colaboradoras` | Registrar una nueva persona colaboradora |
| | `GET` | `/api/personas-colaboradoras/:id` | Obtener el perfil de un colaborador por ID |
| | `POST` | `/api/personas-colaboradoras/:id/habilidades` | Asignar una habilidad al perfil de un colaborador |
| **Habilidades** | `GET` | `/api/habilidades` | Listar catálogo de habilidades disponibles |
| | `POST` | `/api/habilidades` | Registrar una nueva habilidad en el catálogo |
| | `GET` | `/api/habilidades/:codigo` | Obtener información de una habilidad por su código |

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
  * `400 Bad Request`: Si falta el `nombre` o el `tipo`.
  * `409 Conflict`: Si ya existe un colectivo con el mismo nombre.

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
  * `400 Bad Request`: Datos incompletos o sin habilidades requeridas.
  * `404 Not Found`: Si el `colectivoId` o algún código de habilidad no existe.
  * `409 Conflict`: Si el colectivo ya tiene un proyecto con el mismo título.

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
  * `400 Bad Request`: Si el proyecto está cerrado o la persona no cuenta con las habilidades requeridas.
  * `404 Not Found`: Si el proyecto o la persona colaboradora no existen.

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

## 👩‍💻 4. Personas Colaboradoras

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
  * `400 Bad Request`: Si no cumple los requisitos mínimos de identidad.
  * `409 Conflict`: Si ya existe una persona colaboradora con el mismo `nombreFantasia`.

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
  * `400 Bad Request`: Datos de habilidad inválidos.
  * `404 Not Found`: Si la persona colaboradora no existe o la habilidad ya había sido agregada.

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
  * `400 Bad Request`: Si falta el `titulo`.
  * `409 Conflict`: Si ya existe una habilidad con el mismo código.

---

### `GET /api/habilidades/:codigo`
Obtiene una habilidad específica por su código.

* **Parámetros de Ruta:** `codigo` (string, ej. `desarrollo_web_react`).
* **Respuesta Exitosa (`200 OK`):** Objeto `Habilidad`.
* **Respuesta de Error (`404 Not Found`):** Si el código no existe en el catálogo.
