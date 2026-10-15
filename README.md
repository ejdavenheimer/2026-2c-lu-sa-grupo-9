Este repositorio es la base para el Trabajo Práctico de la materia **Desarrollo de Software (DDS)** de la carrera **Ingeniería en Sistemas de Información** de la **UTN FRBA**. Se trata de un **monorepo** que integra una aplicación frontend con Create React App y un backend con Express, facilitando el desarrollo y la gestión de ambos proyectos en un único entorno.

## 📦 Estructura del Proyecto

El monorepo está organizado de la siguiente manera:

```
.
├── packages/
│   ├── backend/        # Servidor Express.js
│   └── frontend/       # Aplicación React (Create React App)
├── docker-compose.yml  # Servicio de MongoDB para desarrollo
├── package.json        # Configuración del monorepo (root)
├── README.md           # Este archivo
└── .env.example        # Ejemplo de configuración de variables de entorno
```

## ⚙️ Paquetes

Este monorepo utiliza **`npm workspaces`** para gestionar los diferentes paquetes.

### Backend (`packages/backend`)

El backend está construido con Express.js y utiliza las siguientes dependencias:

- **`express`**: El framework web para Node.js, utilizado para construir la API.
- **`cors`**: Middleware para Express que habilita Cross-Origin Resource Sharing (CORS), necesario para permitir que el frontend acceda al backend desde un origen diferente.
- **`dotenv`**: Carga variables de entorno desde un archivo `.env` en `process.env`. Es crucial para configurar el puerto del servidor y los orígenes permitidos.
- **`mongoose`**: ODM para MongoDB. Define los schemas, mapea los documentos a las entidades de dominio y resuelve las consultas. Incluye el driver oficial de MongoDB, así que no hace falta instalar `mongodb` por separado.

La idea es dar lo mínimo para levantar el servidor, y que durante el desarrollo del TP se vayan agregando las dependencias necesarias.

### Frontend (`packages/frontend`)

El frontend es una aplicación de React generada con Create React App.

## 🚀 Inicio Rápido

Seguí estos pasos para poner en marcha el proyecto:

### 1\. Instalación de Dependencias

Desde la raíz del monorepo, ejecutá:

```bash
npm install
```

Esto instalará todas las dependencias para la raíz y para los paquetes `frontend` y `backend`.

### 2\. Base de Datos (MongoDB)

El backend necesita una base MongoDB corriendo. El `docker-compose.yml` de la raíz la levanta sin que tengas que instalar nada:

```bash
docker compose up -d
```

La primera vez descarga la imagen `mongo:6`, así que puede tardar. Para verificar que quedó arriba:

```bash
docker compose ps
```

Tenés que ver el contenedor `codigo-a-voluntad-mongo` en estado `Up` y el puerto `0.0.0.0:27017->27017/tcp`.

Comandos del día a día:

```bash
docker compose stop    # frenar la base (los datos se conservan)
docker compose start   # volver a levantarla
docker compose down    # eliminar el contenedor (los datos sobreviven en el volumen)
```

Los datos viven en un volumen de Docker llamado `mongo-data`, así que sobreviven a recrear el contenedor. Para borrarlos de verdad hay que usar `docker compose down -v`.

> La base `codigo-a-voluntad` **no hace falta crearla**: Mongo la crea sola al insertar el primer documento.

### 3\. Configuración de Variables de Entorno

Crea un archivo `.env` en el directorio `packages/backend`. Puedes usar el archivo `.env.example` como plantilla:

```bash
cp packages/backend/.env.example packages/backend/.env
```

```
# packages/backend/.env
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SERVER_PORT=8000
MONGODB_URI=mongodb://root:secret@localhost:27017
MONGODB_DB_NAME=codigo-a-voluntad
```

- **`ALLOWED_ORIGINS`**: Define los orígenes permitidos para las solicitudes CORS. Asegurate de incluir la URL donde se ejecuta tu frontend (por defecto, `http://localhost:3000` para Create React App). Cuando se haga el despliegue en nube acá se deberá incluir la URL donde se desplegó el frontend.
- **`SERVER_PORT`**: El puerto en el que se ejecutará el servidor backend (ej. `8000`).
- **`MONGODB_URI`**: Host y credenciales de MongoDB. El usuario y la contraseña deben coincidir con los del `docker-compose.yml`.
- **`MONGODB_DB_NAME`**: Nombre de la base dentro de ese servidor.

> `MONGODB_URI` va **sin** el nombre de la base y **sin** parámetros: `src/config/database.js` arma la URI final concatenando ambas variables y agregando `?authSource=admin`. Ese parámetro es necesario porque el usuario `root` que crea la imagen de Docker vive en la base `admin`; sin él la autenticación falla aunque las credenciales sean correctas.

### 4\. Ejecución de la Aplicación

Podés iniciar el frontend y el backend por separado o ambos a la vez:

#### Ejecutar el Backend

```bash
npm run start:backend
```

Para el desarrollo con reinicio automático:

```bash
npm run dev:backend
```

#### Ejecutar el Frontend

```bash
npm run start:frontend
```

#### Ejecutar Ambos (Desarrollo)

Para iniciar el backend en modo `dev` y el frontend simultáneamente, usá:

```bash
npm run start:dev
```

## 📚 Documentación y Entregables

* 📖 **[Documentación de la API REST](docs/API.md)**: Especificación detallada de endpoints, parámetros, modelos de datos JSON y códigos de estado HTTP.
* ⚡ **Swagger UI (Interactivo)**: Al levantar el backend, se encuentra disponible en [`http://localhost:8000/api-docs`](http://localhost:8000/api-docs).
* 🔀 **[Guía de Git Flow](docs/GIT_FLOW.md)**: Estructura de ramas, convenciones de commits y flujo de Pull Requests del equipo.
* 📐 **Diagrama de Clases**: Ubicado en [`designs/diagrama-clases.puml`](designs/diagrama-clases.puml).

