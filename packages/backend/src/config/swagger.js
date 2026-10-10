// Todos los errores de la API los emite el middleware errorHandler con la misma
// forma, así que alcanza con describir el schema una vez y reusarlo en cada respuesta.
const respuestaDeError = (description) => ({
  description,
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse"
      }
    }
  }
});

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Código a Voluntad - API REST",
    version: "1.0.0",
    description:
      "Documentación interactiva de la API REST para el Trabajo Práctico Integrador de DDS (UTN FRBA) - Primera Entrega."
  },
  servers: [
    {
      url: "/api",
      description: "Servidor Backend (/api)"
    }
  ],
  tags: [
    {
      name: "Health",
      description: "Comprobación del estado del servicio"
    },
    {
      name: "Colectivos",
      description: "Gestión y carga de organizaciones y colectivos"
    },
    {
      name: "Proyectos",
      description: "Gestión, publicación, inscripciones y cierre de proyectos"
    },
    {
      name: "Personas Colaboradoras",
      description: "Gestión de colaboradores, perfiles y habilidades asignadas"
    },
    {
      name: "Habilidades",
      description: "Gestión y catálogo de habilidades requeridas"
    }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health Check del servidor",
        description: "Devuelve el estado de disponibilidad del backend.",
        responses: {
          "200": {
            description: "Servidor en funcionamiento",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "OK"
                    },
                    timestamp: {
                      type: "string",
                      example: "2026-09-14T10:00:00.000Z"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/colectivos": {
      get: {
        tags: ["Colectivos"],
        summary: "Listar todos los colectivos",
        description: "Obtiene la lista completa de colectivos registrados.",
        responses: {
          "200": {
            description: "Lista de colectivos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Colectivo"
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Colectivos"],
        summary: "Crear un nuevo colectivo",
        description: "Registra una organización o colectivo en la plataforma.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ColectivoInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Colectivo creado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Colectivo"
                }
              }
            }
          },
          "400": respuestaDeError("Falta un campo obligatorio, tiene el tipo incorrecto o se envió un campo no permitido"),
          "409": respuestaDeError("Ya existe un colectivo con ese nombre"),
          "422": respuestaDeError("El colectivo debe poseer un nombre y un tipo")
        }
      }
    },
    "/colectivos/{id}": {
      get: {
        tags: ["Colectivos"],
        summary: "Obtener colectivo por ID",
        description: "Devuelve el detalle de un colectivo específico a partir de su ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del colectivo",
            schema: {
              type: "string",
              example: "col-1"
            }
          }
        ],
        responses: {
          "200": {
            description: "Colectivo encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Colectivo"
                }
              }
            }
          },
          "404": respuestaDeError("Colectivo no encontrado")
        }
      }
    },
    "/proyectos": {
      get: {
        tags: ["Proyectos"],
        summary: "Listar todos los proyectos",
        description: "Devuelve el catálogo de todos los proyectos cargados en la plataforma.",
        responses: {
          "200": {
            description: "Lista de proyectos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Proyecto"
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Proyectos"],
        summary: "Publicar un nuevo proyecto",
        description: "Crea y asocia un nuevo proyecto a un colectivo registrado.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProyectoInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Proyecto creado exitosamente en estado PUBLICADO",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Proyecto"
                }
              }
            }
          },
          "400": respuestaDeError("Falta un campo obligatorio, tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Colectivo asociado o código de habilidad no encontrado"),
          "409": respuestaDeError("El colectivo ya tiene un proyecto con ese título"),
          "422": respuestaDeError("No se indicó ninguna habilidad requerida, o algún valor incumple las reglas del proyecto")
        }
      }
    },
    "/proyectos/{id}": {
      get: {
        tags: ["Proyectos"],
        summary: "Obtener proyecto por ID",
        description: "Devuelve la información detallada de un proyecto, incluyendo colaboraciones y habilidades requeridas.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: {
              type: "string",
              example: "proy-1"
            }
          }
        ],
        responses: {
          "200": {
            description: "Proyecto encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Proyecto"
                }
              }
            }
          },
          "404": respuestaDeError("Proyecto no encontrado")
        }
      }
    },
    "/proyectos/{id}/colaboraciones": {
      post: {
        tags: ["Proyectos"],
        summary: "Anotar una persona colaboradora a un proyecto",
        description:
          "Registra una colaboración en el proyecto. Valida que el proyecto no esté cerrado y que la persona posea al menos una habilidad requerida.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: {
              type: "string",
              example: "proy-1"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["personaColaboradoraId"],
                properties: {
                  personaColaboradoraId: {
                    type: "string",
                    example: "colab-1"
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Colaboración establecida exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Colaboracion"
                }
              }
            }
          },
          "400": respuestaDeError("Falta el ID de la persona colaboradora, tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Proyecto o persona colaboradora no encontrada"),
          "409": respuestaDeError("El proyecto está cerrado: ya no admite nuevas colaboraciones"),
          "422": respuestaDeError("La persona colaboradora no cuenta con ninguna de las habilidades requeridas por el proyecto")
        }
      }
    },
    "/proyectos/{id}/cerrar": {
      patch: {
        tags: ["Proyectos"],
        summary: "Cierre manual de un proyecto",
        description: "Marca el proyecto como CERRADO y establece su fecha de cierre. No se admitirán nuevas colaboraciones.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: {
              type: "string",
              example: "proy-1"
            }
          }
        ],
        responses: {
          "200": {
            description: "Proyecto cerrado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Proyecto"
                }
              }
            }
          },
          "404": respuestaDeError("Proyecto no encontrado")
        }
      }
    },
    "/proyectos/{id}/hitos": {
      get: {
        tags: ["Proyectos"],
        summary: "Listar los hitos de un proyecto",
        description: "Devuelve todos los hitos registrados para un proyecto, en orden cronológico de carga.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: {
              type: "string",
              example: "proy-1"
            }
          }
        ],
        responses: {
          "200": {
            description: "Lista de hitos del proyecto",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Hito"
                  }
                }
              }
            }
          },
          "404": respuestaDeError("Proyecto no encontrado")
        }
      },
      post: {
        tags: ["Proyectos"],
        summary: "Registrar un hito en un proyecto",
        description:
          "Carga un nuevo hito con su porcentaje de concreción. El porcentaje debe ser estrictamente mayor al del último hito registrado, y el proyecto no puede estar cerrado.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: {
              type: "string",
              example: "proy-1"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/HitoInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Hito registrado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Hito"
                }
              }
            }
          },
          "400": respuestaDeError("Falta un campo obligatorio, tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Proyecto no encontrado"),
          "409": respuestaDeError("El proyecto está cerrado: ya no admite nuevos hitos"),
          "422": respuestaDeError("El porcentaje de concreción debe ser mayor al del último hito registrado")
        }
      }
    },
    "/proyectos/{id}/hitos/{hitoId}": {
      get: {
        tags: ["Proyectos"],
        summary: "Obtener un hito por ID",
        description: "Devuelve el detalle de un hito específico dentro de un proyecto.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: { type: "string", example: "proy-1" }
          },
          {
            name: "hitoId",
            in: "path",
            required: true,
            description: "ID del hito",
            schema: { type: "string", example: "26a597d8-ce6c-418e-a068-1baa613ec889" }
          }
        ],
        responses: {
          "200": {
            description: "Hito encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Hito" }
              }
            }
          },
          "404": respuestaDeError("Proyecto o hito no encontrado")
        }
      },
      patch: {
        tags: ["Proyectos"],
        summary: "Actualizar un hito",
        description:
          "Actualiza el porcentaje de concreción y/o la descripción de un hito ya cargado. Si se actualiza el porcentaje, debe seguir siendo mayor al del hito anterior y menor al del hito siguiente (si existen).",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: { type: "string", example: "proy-1" }
          },
          {
            name: "hitoId",
            in: "path",
            required: true,
            description: "ID del hito",
            schema: { type: "string", example: "26a597d8-ce6c-418e-a068-1baa613ec889" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ActualizarHitoInput" }
            }
          }
        },
        responses: {
          "200": {
            description: "Hito actualizado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Hito" }
              }
            }
          },
          "400": respuestaDeError("Algún campo tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Proyecto o hito no encontrado"),
          "422": respuestaDeError("El porcentaje debe ser mayor al del hito anterior y menor al del hito siguiente")
        }
      },
      delete: {
        tags: ["Proyectos"],
        summary: "Eliminar un hito",
        description: "Elimina un hito del proyecto de forma permanente.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: { type: "string", example: "proy-1" }
          },
          {
            name: "hitoId",
            in: "path",
            required: true,
            description: "ID del hito",
            schema: { type: "string", example: "26a597d8-ce6c-418e-a068-1baa613ec889" }
          }
        ],
        responses: {
          "204": {
            description: "Hito eliminado exitosamente (sin contenido)"
          },
          "404": respuestaDeError("Proyecto o hito no encontrado")
        }
      }
    },
    "/proyectos/{id}/enlaces": {
      patch: {
        tags: ["Proyectos"],
        summary: "Actualizar los enlaces de un proyecto",
        description:
          "Actualiza el enlace al sistema en funcionamiento y/o al repositorio de código fuente público. Se puede enviar uno solo de los dos campos; el que no se envíe queda sin modificar.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto",
            schema: { type: "string", example: "proy-1" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ActualizarEnlacesInput" }
            }
          }
        },
        responses: {
          "200": {
            description: "Enlaces actualizados exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Proyecto" }
              }
            }
          },
          "400": respuestaDeError("Alguno de los enlaces no es una URL válida, o se envió un campo no permitido"),
          "404": respuestaDeError("Proyecto no encontrado")
        }
      }
    },
    "/personas-colaboradoras": {
      get: {
        tags: ["Personas Colaboradoras"],
        summary: "Listar personas colaboradoras",
        description: "Obtiene el listado de todas las personas colaboradoras registradas.",
        responses: {
          "200": {
            description: "Lista de personas colaboradoras",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/PersonaColaboradora"
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Personas Colaboradoras"],
        summary: "Crear una persona colaboradora",
        description:
          "Registra un nuevo colaborador. Requiere al menos nombre de fantasía, o nombre y apellido, o al menos una cuenta vinculada.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PersonaColaboradoraInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Persona colaboradora creada exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PersonaColaboradora"
                }
              }
            }
          },
          "400": respuestaDeError("Algún campo tiene el tipo incorrecto o se envió un campo no permitido"),
          "409": respuestaDeError("Ya existe una persona colaboradora con ese nombre de fantasía"),
          "422": respuestaDeError("La persona colaboradora debe poseer al menos un nombre de fantasía, o bien nombre y apellido")
        }
      }
    },
    "/personas-colaboradoras/{id}": {
      get: {
        tags: ["Personas Colaboradoras"],
        summary: "Obtener persona colaboradora por ID",
        description: "Devuelve el perfil y las habilidades de una persona colaboradora específica.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la persona colaboradora",
            schema: {
              type: "string",
              example: "colab-1"
            }
          }
        ],
        responses: {
          "200": {
            description: "Persona colaboradora encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PersonaColaboradora"
                }
              }
            }
          },
          "404": respuestaDeError("Persona colaboradora no encontrada")
        }
      }
    },
    "/personas-colaboradoras/{id}/habilidades": {
      post: {
        tags: ["Personas Colaboradoras"],
        summary: "Agregar una habilidad a una persona colaboradora",
        description: "Asocia una nueva habilidad al perfil de la persona colaboradora.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la persona colaboradora",
            schema: {
              type: "string",
              example: "colab-1"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/HabilidadInput"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Habilidad agregada exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PersonaColaboradora"
                }
              }
            }
          },
          "400": respuestaDeError("Algún campo de la habilidad tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Persona colaboradora no encontrada"),
          "409": respuestaDeError("Esa habilidad ya había sido agregada a la persona colaboradora"),
          "422": respuestaDeError("No se indicó una habilidad válida")
        }
      }
    },
    "/habilidades": {
      get: {
        tags: ["Habilidades"],
        summary: "Listar catálogo de habilidades",
        description: "Devuelve todas las habilidades pre-cargadas en el sistema.",
        responses: {
          "200": {
            description: "Lista de habilidades",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Habilidad"
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Habilidades"],
        summary: "Crear una nueva habilidad",
        description: "Registra una nueva habilidad en el catálogo general.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/HabilidadInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Habilidad creada exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Habilidad"
                }
              }
            }
          },
          "400": respuestaDeError("Falta el título, tiene el tipo incorrecto o se envió un campo no permitido"),
          "409": respuestaDeError("Ya existe una habilidad con el mismo código"),
          "422": respuestaDeError("El título de la habilidad no puede estar vacío")
        }
      }
    },
    "/habilidades/{codigo}": {
      get: {
        tags: ["Habilidades"],
        summary: "Obtener habilidad por código",
        description: "Devuelve el detalle de una habilidad específica según su código único.",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            description: "Código único de la habilidad",
            schema: {
              type: "string",
              example: "desarrollo_web_react"
            }
          }
        ],
        responses: {
          "200": {
            description: "Habilidad encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Habilidad"
                }
              }
            }
          },
          "404": respuestaDeError("Habilidad no encontrada")
        }
      }
    }
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        description:
          "Forma única de todas las respuestas de error de la API, generada por el middleware errorHandler.",
        properties: {
          status: {
            type: "string",
            enum: ["fail", "error"],
            description: "'fail' para errores del cliente (4xx), 'error' para errores del servidor (5xx)",
            example: "fail"
          },
          message: {
            type: "string",
            description: "Descripción del problema, apta para mostrarle a la persona usuaria",
            example: "No se encontró el proyecto con ID 'proy-9'"
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Momento en que se produjo el error",
            example: "2026-10-06T21:31:53.613Z"
          }
        }
      },
      ColectivoInput: {
        type: "object",
        required: ["nombre", "tipo"],
        properties: {
          nombre: {
            type: "string",
            example: "Fundación Vida Silvestre"
          },
          descripcion: {
            type: "string",
            example: "Organización enfocada en la conservación ambiental"
          },
          tipo: {
            type: "string",
            enum: ["FUNDACION", "ASOCIACION_BARRIAL", "ONG", "ASAMBLEA"],
            example: "ONG"
          },
          ubicacion: {
            $ref: "#/components/schemas/Ubicacion"
          }
        }
      },
      Colectivo: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "col-1"
          },
          nombre: {
            type: "string",
            example: "Fundación Vida Silvestre"
          },
          descripcion: {
            type: "string",
            example: "Organización enfocada en la conservación ambiental"
          },
          tipo: {
            type: "string",
            example: "ONG"
          },
          ubicacion: {
            $ref: "#/components/schemas/Ubicacion"
          },
          proyectos: {
            type: "array",
            items: {
              type: "object"
            }
          }
        }
      },
      ProyectoInput: {
        type: "object",
        required: [
          "titulo",
          "descripcion",
          "unidadCompromiso",
          "cantidadHoras",
          "modalidadesColaboracion",
          "colectivoId",
          "habilidadesRequeridasCodigos"
        ],
        properties: {
          titulo: {
            type: "string",
            example: "Portal Web de Reforestación"
          },
          descripcion: {
            type: "string",
            example: "Plataforma comunitaria para coordinar campañas de plantación de árboles nativos."
          },
          unidadCompromiso: {
            type: "string",
            enum: ["HORAS_TOTALES", "HORAS_SEMANALES", "HORAS_MENSUALES"],
            example: "HORAS_SEMANALES"
          },
          cantidadHoras: {
            type: "number",
            example: 10
          },
          modalidadesColaboracion: {
            type: "array",
            items: {
              type: "string",
              enum: ["GRATUITA", "CON_INCENTIVO_ECONOMICO", "CON_POSIBILIDAD_CONTRATACION"]
            },
            example: ["GRATUITA", "CON_INCENTIVO_ECONOMICO"]
          },
          colectivoId: {
            type: "string",
            example: "col-1"
          },
          habilidadesRequeridasCodigos: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["desarrollo_web_react", "node_js"]
          }
        }
      },
      Proyecto: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "proy-1"
          },
          titulo: {
            type: "string",
            example: "Portal Web de Reforestación"
          },
          descripcion: {
            type: "string",
            example: "Plataforma comunitaria para coordinar campañas de plantación de árboles nativos."
          },
          unidadCompromiso: {
            type: "string",
            example: "HORAS_SEMANALES"
          },
          cantidadHoras: {
            type: "number",
            example: 10
          },
          modalidadesColaboracion: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["GRATUITA"]
          },
          estado: {
            type: "string",
            enum: ["PUBLICADO", "CERRADO"],
            example: "PUBLICADO"
          },
          fechaAlta: {
            type: "string",
            format: "date-time"
          },
          fechaCierre: {
            type: "string",
            format: "date-time",
            nullable: true
          },
          enlaceSistemaEnFuncionamiento: {
            type: "string",
            nullable: true,
            example: "https://codigoavoluntad-demo.com"
          },
          enlaceCodigoFuente: {
            type: "string",
            nullable: true,
            example: "https://github.com/ddso-utn/proyecto-ejemplo"
          },
          colectivo: {
            type: "object"
          },
          habilidadesRequeridas: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          },
          porcentajeAvance: {
            type: "number",
            description: "Porcentaje de concreción del último hito registrado. 0 si el proyecto todavía no tiene hitos.",
            example: 60
          },
          hitos: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Hito"
            }
          },
          colaboraciones: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Colaboracion"
            }
          }
        }
      },
      HitoInput: {
        type: "object",
        required: ["porcentajeConcrecion", "descripcion"],
        properties: {
          porcentajeConcrecion: {
            type: "number",
            minimum: 0,
            maximum: 100,
            example: 60
          },
          descripcion: {
            type: "string",
            example: "Se completó el módulo de autenticación"
          },
          fecha: {
            type: "string",
            format: "date-time",
            description: "Opcional. Si no se indica, se usa la fecha y hora actuales.",
            example: "2026-10-06T21:31:53.613Z"
          }
        }
      },
      ActualizarHitoInput: {
        type: "object",
        description: "Los dos campos son opcionales; se actualiza solo lo que se envíe.",
        properties: {
          porcentajeConcrecion: {
            type: "number",
            minimum: 0,
            maximum: 100,
            example: 70
          },
          descripcion: {
            type: "string",
            example: "Descripción corregida del hito"
          }
        }
      },
      Hito: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "26a597d8-ce6c-418e-a068-1baa613ec889"
          },
          fecha: {
            type: "string",
            format: "date-time"
          },
          porcentajeConcrecion: {
            type: "number",
            example: 60
          },
          descripcion: {
            type: "string",
            example: "Se completó el módulo de autenticación"
          },
          proyecto: {
            type: "object",
            description: "Resumen del proyecto al que pertenece el hito."
          }
        }
      },
      ActualizarEnlacesInput: {
        type: "object",
        description: "Los dos campos son opcionales; se actualiza solo lo que se envíe.",
        properties: {
          enlaceSistemaEnFuncionamiento: {
            type: "string",
            format: "uri",
            example: "https://codigoavoluntad-demo.com"
          },
          enlaceCodigoFuente: {
            type: "string",
            format: "uri",
            example: "https://github.com/ddso-utn/proyecto-ejemplo"
          }
        }
      },
      PersonaColaboradoraInput: {
        type: "object",
        properties: {
          nombreFantasia: {
            type: "string",
            example: "DevSolidario"
          },
          nombre: {
            type: "string",
            example: "Ana"
          },
          apellido: {
            type: "string",
            example: "García"
          },
          pronombres: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["ella"]
          },
          presentacion: {
            type: "string",
            example: "Desarrolladora Fullstack interesada en proyectos de impacto social."
          },
          cuentas: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Cuenta"
            }
          },
          habilidades: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          }
        }
      },
      PersonaColaboradora: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "colab-1"
          },
          nombreFantasia: {
            type: "string",
            example: "DevSolidario"
          },
          nombre: {
            type: "string",
            example: "Ana"
          },
          apellido: {
            type: "string",
            example: "García"
          },
          pronombres: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["ella"]
          },
          presentacion: {
            type: "string",
            example: "Desarrolladora Fullstack interesada en proyectos de impacto social."
          },
          cuentas: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Cuenta"
            }
          },
          habilidades: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          },
          colaboraciones: {
            type: "array",
            items: {
              type: "object"
            }
          }
        }
      },
      HabilidadInput: {
        type: "object",
        required: ["titulo"],
        properties: {
          titulo: {
            type: "string",
            example: "Desarrollo Web React"
          },
          codigo: {
            type: "string",
            example: "desarrollo_web_react"
          },
          descripcion: {
            type: "string",
            example: "Creación de interfaces de usuario modernas con React y Hooks."
          }
        }
      },
      Habilidad: {
        type: "object",
        properties: {
          titulo: {
            type: "string",
            example: "Desarrollo Web React"
          },
          codigo: {
            type: "string",
            example: "desarrollo_web_react"
          },
          descripcion: {
            type: "string",
            example: "Creación de interfaces de usuario modernas con React y Hooks."
          }
        }
      },
      Colaboracion: {
        type: "object",
        properties: {
          fechaInscripcion: {
            type: "string",
            format: "date-time"
          },
          personaColaboradora: {
            type: "object"
          },
          proyecto: {
            type: "object"
          }
        }
      },
      Ubicacion: {
        type: "object",
        properties: {
          pais: {
            type: "string",
            example: "Argentina"
          },
          provincia: {
            type: "string",
            example: "Buenos Aires"
          },
          ciudad: {
            type: "string",
            example: "La Plata"
          }
        }
      },
      Cuenta: {
        type: "object",
        properties: {
          nombreUsuario: {
            type: "string",
            example: "anagarcia"
          },
          tipo: {
            type: "string",
            enum: ["GITHUB", "GITLAB"],
            example: "GITHUB"
          }
        }
      }
    }
  }
};
