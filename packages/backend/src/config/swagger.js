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

const parametrosDeBusqueda = (defaultEstricto) => [
  {
    name: "estricto",
    in: "query",
    required: false,
    description:
      `Si es true devuelve sólo resultados compatibles (que cumplen todas las habilidades requeridas). ` +
      `Si es false incluye también los que cumplen al menos una. Default: ${defaultEstricto}.`,
    schema: {
      type: "boolean",
      default: defaultEstricto
    }
  },
  {
    name: "limite",
    in: "query",
    required: false,
    description: "Cantidad máxima de resultados a devolver.",
    schema: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20
    }
  }
];

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
    },
    {
      name: "Ubicaciones",
      description: "Servicio geográfico para consulta de provincias y países (API Georef)"
    },
    {
      name: "Perfiles",
      description: "Gestión de perfiles requeridos por proyecto (HU01 - HU02) y búsqueda de colaboradores compatibles con un perfil (HU08)"
    },
    {
      name: "Notificaciones",
      description: "Gestión y envío de notificaciones internas y replicación externa (HU10 - HU11)"
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
              example: "colectivo-1"
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
      },
      put: {
        tags: ["Colectivos"],
        summary: "Actualizar un colectivo existente",
        description: "Modifica los atributos de un colectivo registrado.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del colectivo",
            schema: {
              type: "string",
              example: "colectivo-1"
            }
          }
        ],
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
          "200": {
            description: "Colectivo actualizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Colectivo"
                }
              }
            }
          },
          "400": {
            description: "Datos inválidos"
          },
          "404": {
            description: "Colectivo no encontrado"
          }
        }
      },
      delete: {
        tags: ["Colectivos"],
        summary: "Eliminar un colectivo",
        description: "Borra un colectivo del sistema.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del colectivo",
            schema: {
              type: "string",
              example: "colectivo-1"
            }
          }
        ],
        responses: {
          "204": {
            description: "Colectivo eliminado exitosamente"
          },
          "404": {
            description: "Colectivo no encontrado"
          }
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
      },
      patch: {
        tags: ["Proyectos"],
        summary: "Actualización parcial de un proyecto (cierre)",
        description: "Permite actualizar el estado de un proyecto (ej. CERRADO para cierre manual). Marca el proyecto como CERRADO y establece su fecha de cierre. No se admitirán nuevas colaboraciones.",
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
                required: ["estado"],
                properties: {
                  estado: {
                    type: "string",
                    enum: ["CERRADO"],
                    example: "CERRADO",
                    description: "Nuevo estado del proyecto"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Proyecto actualizado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Proyecto"
                }
              }
            }
          },
          "400": respuestaDeError("Falta el ID de la persona colaboradora, tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Proyecto o persona colaboradora no encontrada"),
          "409": respuestaDeError("El proyecto está cerrado: ya no admite nuevas colaboraciones"),
          "422": respuestaDeError("La persona colaboradora no cuenta con ninguna de las habilidades requeridas por el proyecto")
        }
      },
      put: {
        tags: ["Proyectos"],
        summary: "Modificar datos de un proyecto",
        description: "Actualiza los datos generales de un proyecto.",
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
                properties: {
                  titulo: { type: "string", example: "Portal Web V2" },
                  descripcion: { type: "string", example: "Nueva descripcion" },
                  cantidadHoras: { type: "number", example: 15 }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Proyecto modificado exitosamente",
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
      },
      delete: {
        tags: ["Proyectos"],
        summary: "Eliminar un proyecto",
        description: "Borra un proyecto del sistema.",
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
          "204": {
            description: "Proyecto eliminado exitosamente"
          },
          "404": {
            description: "Proyecto no encontrado"
          }
        }
      }
    },
    "/proyectos/{id}/cerrar": {
      patch: {
        tags: ["Proyectos"],
        summary: "Cerrar un proyecto",
        description:
          "Marca el proyecto como CERRADO y registra su fecha de cierre. A partir de ese momento no se admiten " +
          "nuevas colaboraciones, perfiles ni hitos. No requiere cuerpo.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del proyecto a cerrar",
            schema: { type: "string", example: "proy-1" }
          }
        ],
        responses: {
          200: {
            description: "Proyecto cerrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Proyecto" }
              }
            }
          },
          404: respuestaDeError("No se encontró el proyecto con el ID indicado")
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
                  },
                  esAnonima: {
                    type: "boolean",
                    example: true,
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
          "400": {
            description: "Proyecto cerrado o el colaborador no cuenta con las habilidades requeridas"
          },
          "404": {
            description: "Proyecto o persona colaboradora no encontrada"
          }
        }
      }
    },
    "/proyectos/{id}/perfiles": {
      get: {
        tags: ["Perfiles"],
        summary: "Listar perfiles de un proyecto (HU02)",
        description: "Obtiene la lista de perfiles requeridos definidos para el proyecto.",
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
            description: "Lista de perfiles del proyecto",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Perfil"
                  }
                }
              }
            }
          },
          "404": respuestaDeError("Proyecto no encontrado")
        }
      },
      post: {
        tags: ["Perfiles"],
        summary: "Crear un perfil en un proyecto (HU01)",
        description: "Agrega un nuevo perfil requerido al proyecto especificando habilidades obligatorias, opcionales, compromiso y modalidad.",
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
                $ref: "#/components/schemas/PerfilInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Perfil creado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Perfil"
                }
              }
            }
          },
          "400": respuestaDeError("Datos inválidos o malformados"),
          "404": respuestaDeError("Proyecto o habilidad no encontrada"),
          "409": respuestaDeError("No se pueden agregar perfiles a un proyecto cerrado"),
          "422": respuestaDeError("Violación de reglas de negocio")
        }
      }
    },
    "/proyectos/{id}/perfiles/{perfilId}": {
      get: {
        tags: ["Perfiles"],
        summary: "Obtener un perfil por ID (HU02)",
        description: "Obtiene los detalles de un perfil específico de un proyecto.",
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
          },
          {
            name: "perfilId",
            in: "path",
            required: true,
            description: "ID del perfil",
            schema: {
              type: "string",
              example: "perfil-1"
            }
          }
        ],
        responses: {
          "200": {
            description: "Detalle del perfil",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Perfil"
                }
              }
            }
          },
          "404": respuestaDeError("Proyecto o perfil no encontrado")
        }
      },
      put: {
        tags: ["Perfiles"],
        summary: "Modificar un perfil (HU02)",
        description: "Modifica los datos de un perfil de un proyecto.",
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
          },
          {
            name: "perfilId",
            in: "path",
            required: true,
            description: "ID del perfil",
            schema: {
              type: "string",
              example: "perfil-1"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PerfilModificarInput"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Perfil modificado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Perfil"
                }
              }
            }
          },
          "400": respuestaDeError("Datos inválidos o malformados"),
          "404": respuestaDeError("Proyecto, perfil o habilidad no encontrada"),
          "409": respuestaDeError("No se pueden modificar perfiles de un proyecto cerrado"),
          "422": respuestaDeError("Violación de reglas de negocio")
        }
      },
      delete: {
        tags: ["Perfiles"],
        summary: "Eliminar un perfil (HU02)",
        description: "Elimina un perfil del proyecto.",
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
          },
          {
            name: "perfilId",
            in: "path",
            required: true,
            description: "ID del perfil",
            schema: {
              type: "string",
              example: "perfil-1"
            }
          }
        ],
        responses: {
          "204": {
            description: "Perfil eliminado exitosamente"
          },
          "404": respuestaDeError("Proyecto o perfil no encontrado"),
          "409": respuestaDeError("No se pueden eliminar perfiles de un proyecto cerrado")
        }
      }
    },
    "/proyectos/{id}/perfiles/{perfilId}/colaboradores-compatibles": {
      get: {
        tags: ["Perfiles"],
        summary: "Buscar colaboradores compatibles con un perfil (HU08)",
        description:
          "Devuelve las personas colaboradoras compatibles con el perfil, ordenadas de mayor a menor puntaje.\n\n" +
          "Las habilidades **requeridas** filtran y las **opcionales** ordenan: se entra al resultado por cumplir " +
          "todas las requeridas, y las opcionales deciden en qué posición.\n\n" +
          "El puntaje **no sirve como umbral de compatibilidad**: como las opcionales suman sin ser requisito, " +
          "alguien que no cumple todas las requeridas puede puntuar más alto que alguien que sí. Para saber si un " +
          "resultado sirve hay que leer `esCompatible`, no el puntaje.\n\n" +
          "Una búsqueda sin resultados devuelve 200 con lista vacía: el perfil existe y la respuesta es que no hay " +
          "candidatos. Este endpoint no envía mensajes ni revela medios de contacto; contactar a una persona es HU10.",
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
          },
          {
            name: "perfilId",
            in: "path",
            required: true,
            description: "ID del perfil del proyecto contra el cual se evalúa la compatibilidad",
            schema: {
              type: "string",
              example: "perfil-1"
            }
          },
          ...parametrosDeBusqueda(true)
        ],
        responses: {
          "200": {
            description: "Candidatos ordenados por puntaje (puede ser una lista vacía)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ColaboradorCompatible"
                  }
                }
              }
            }
          },
          "400": respuestaDeError("Se envió un query param no reconocido o con el tipo incorrecto"),
          "404": respuestaDeError("Proyecto o perfil no encontrado"),
          "422": respuestaDeError("Un query param llegó bien pero con un valor inadmisible (por ejemplo limite=0)")
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
            schema: { type: "string", example: "hito-1" }
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
            schema: { type: "string", example: "hito-1" }
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
            schema: { type: "string", example: "hito-1" }
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
      },
      put: {
        tags: ["Personas Colaboradoras"],
        summary: "Actualizar datos de una persona colaboradora",
        description: "Modifica los atributos del perfil de un colaborador.",
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
                $ref: "#/components/schemas/PersonaColaboradoraInput"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Persona colaboradora actualizada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PersonaColaboradora"
                }
              }
            }
          },
          "400": {
            description: "Datos inválidos"
          },
          "404": {
            description: "Persona colaboradora no encontrada"
          }
        }
      },
      delete: {
        tags: ["Personas Colaboradoras"],
        summary: "Eliminar una persona colaboradora",
        description: "Borra el registro de una persona colaboradora del sistema.",
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
          "204": {
            description: "Persona colaboradora eliminada exitosamente"
          },
          "404": {
            description: "Persona colaboradora no encontrada"
          }
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
    "/personas-colaboradoras/{id}/proyectos-compatibles": {
      get: {
        tags: ["Personas Colaboradoras"],
        summary: "Buscar proyectos compatibles con las habilidades de una persona (HU09)",
        description:
          "Devuelve las oportunidades de colaboración relacionadas con las habilidades de la persona, ordenadas " +
          "de mayor a menor puntaje. Sólo considera proyectos publicados.\n\n" +
          "Devuelve un resultado **por cada par proyecto-perfil**, no uno por proyecto: como el compromiso " +
          "esperado y la modalidad se declaran por perfil, dos perfiles del mismo proyecto son dos propuestas " +
          "distintas.\n\n" +
          "A diferencia de HU08, el default es laxo: el enunciado pide proyectos *relacionados* con las " +
          "habilidades, y a la persona le sirve ver también aquellos donde le falta algo para saber qué le " +
          "conviene aprender. `requeridasFaltantes` dice exactamente qué le falta. Con `estricto=true` ve sólo " +
          "los perfiles que puede cubrir por completo.",
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
          },
          ...parametrosDeBusqueda(false)
        ],
        responses: {
          "200": {
            description: "Pares proyecto-perfil ordenados por puntaje (puede ser una lista vacía)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ProyectoCompatible"
                  }
                }
              }
            }
          },
          "400": respuestaDeError("Se envió un query param no reconocido o con el tipo incorrecto"),
          "404": respuestaDeError("Persona colaboradora no encontrada"),
          "422": respuestaDeError("Un query param llegó bien pero con un valor inadmisible (por ejemplo limite=0)")
        }
      }
    },
    "/personas-colaboradoras/{id}/medios-contacto": {
      get: {
        tags: ["Personas Colaboradoras"],
        summary: "Lista los medios de contacto a una persona colaboradora",
        description: "Listado de los medios de contacto al perfil de la persona colaboradora.",
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
            description: "Lista de medios de contacto",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MediosDeContacto"
                  }
                }
              }
            }
          },
          "400": respuestaDeError("Algún campo de la habilidad tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Persona colaboradora no encontrada"),
          "409": respuestaDeError("Esa habilidad ya había sido agregada a la persona colaboradora"),
          "422": respuestaDeError("No se indicó una habilidad válida")
        }
      },
      post: {
        tags: ["Personas Colaboradoras"],
        summary: "Agregar un medio de contacto a una persona colaboradora",
        description: "Asocia un nuevo medio de contacto al perfil de la persona colaboradora.",
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
                $ref: "#/components/schemas/MediosDeContactoInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Medio de contacto agregado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MediosDeContacto"
                }
              }
            }
          },
          "400": respuestaDeError("Algún campo de la habilidad tiene el tipo incorrecto o se envió un campo no permitido"),
          "404": respuestaDeError("Persona colaboradora no encontrada"),
          "409": respuestaDeError("Esa habilidad ya había sido agregada a la persona colaboradora"),
          "422": respuestaDeError("No se indicó una habilidad válida")
        }
      },
      patch: {
        tags: ["Personas Colaboradoras"],
        summary: "Modifica un medio de contacto a una persona colaboradora",
        description: "Modifica un medio de contacto de la persona colaboradora.",
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
                $ref: "#/components/schemas/MediosDeContacto"

              }
            }
          }
        },
        responses: {
          "201": {
            description: "Medios de contacto actualizados exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MediosDeContacto"
                  }
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
    "/personas-colaboradoras/{id}/medios-contacto/{tipoMedio}": {
      delete:{
        tags: ["Personas Colaboradoras"],
        summary: "Elimina un medio de contacto",
        description: "Elimina un medio de contacto de la persona colaboradora",
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
          },
          {
            name: "tipoMedio",
            in: "path",
            required: true,
            description: "tipo de medio de contacto",
            schema: {
              type: "string",
              example: "EMAIL"
            }
          }
        ],
        responses: {
          "204": {
            description: "Medio de contacto eliminado exitosamente"
          },
          "404": {
            description: "Medio de contacto no encontrado"
          }
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
              example: "react"
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
      },
      put: {
        tags: ["Habilidades"],
        summary: "Actualizar una habilidad",
        description: "Modifica el título o descripción de una habilidad registrada.",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            description: "Código único de la habilidad",
            schema: {
              type: "string",
              example: "react"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  titulo: { type: "string", example: "Desarrollo Web React Avanzado" },
                  descripcion: { type: "string", example: "Nueva descripcion" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Habilidad actualizada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Habilidad"
                }
              }
            }
          },
          "400": {
            description: "Datos inválidos"
          },
          "404": {
            description: "Habilidad no encontrada"
          }
        }
      },
      delete: {
        tags: ["Habilidades"],
        summary: "Eliminar una habilidad",
        description: "Borra una habilidad del catálogo.",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            description: "Código único de la habilidad",
            schema: {
              type: "string",
              example: "react"
            }
          }
        ],
        responses: {
          "204": {
            description: "Habilidad eliminada exitosamente"
          },
          "404": {
            description: "Habilidad no encontrada"
          }
        }
      }
    },
    "/ubicaciones/provincias": {
      get: {
        tags: ["Ubicaciones"],
        summary: "Listar provincias disponibles",
        description: "Obtiene el listado de provincias y CABA consultando la API oficial de Georef.",
        responses: {
          "200": {
            description: "Lista de provincias",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "06" },
                      nombre: { type: "string", example: "Buenos Aires" }
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Error al consultar el servicio geográfico"
          }
        }
      }
    },
    "/ubicaciones/paises": {
      get: {
        tags: ["Ubicaciones"],
        summary: "Listar países disponibles",
        description: "Obtiene el catálogo de países habilitados en la plataforma.",
        responses: {
          "200": {
            description: "Lista de países",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "AR" },
                      nombre: { type: "string", example: "Argentina" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/notificaciones": {
      post: {
        tags: ["Notificaciones"],
        summary: "Enviar una notificación interna y replicar en medios externos",
        description: "Envía un mensaje interno a una persona colaboradora que haya aceptado ser contactada, asociado a un colectivo y un perfil de proyecto. Si la persona colaboradora tiene medios externos registrados, se replica el mensaje.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CrearNotificacionInput"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Notificación creada y enviada exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notificacion"
                }
              }
            }
          },
          400: respuestaDeError("Datos de entrada inválidos"),
          404: respuestaDeError("Colectivo, persona colaboradora o perfil no encontrado"),
          422: respuestaDeError("La persona colaboradora no ha aceptado ser contactada")
        }
      },
      get: {
        tags: ["Notificaciones"],
        summary: "Listar notificaciones",
        description: "Obtiene las notificaciones registradas, con filtros opcionales por destinatario, colectivo o solo no leídas.",
        parameters: [
          {
            name: "destinatarioId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filtrar por ID de la persona colaboradora destinataria"
          },
          {
            name: "colectivoId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filtrar por ID del colectivo emisor"
          },
          {
            name: "soloNoLeidas",
            in: "query",
            required: false,
            schema: { type: "boolean" },
            description: "Filtrar únicamente notificaciones no leídas"
          }
        ],
        responses: {
          200: {
            description: "Lista de notificaciones obtenida exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Notificacion"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/notificaciones/{id}": {
      get: {
        tags: ["Notificaciones"],
        summary: "Obtener una notificación por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", example: "notif-1" },
            description: "Identificador de la notificación"
          }
        ],
        responses: {
          200: {
            description: "Notificación encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notificacion"
                }
              }
            }
          },
          404: respuestaDeError("Notificación no encontrada")
        }
      },
      patch: {
        tags: ["Notificaciones"],
        summary: "Actualizar el estado de lectura de una notificación",
        description: "Permite marcar una notificación como leída o no leída",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", example: "notif-1" },
            description: "Identificador de la notificación"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ActualizarNotificacionLecturaInput"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Estado de lectura actualizado exitosamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notificacion"
                }
              }
            }
          },
          400: respuestaDeError("Body inválido"),
          404: respuestaDeError("Notificación no encontrada")
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
            example: "colectivo-1"
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
            example: "colectivo-1"
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
          perfiles: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Perfil"
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
            example: "hito-1"
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
      PerfilInput: {
        type: "object",
        required: [
          "descripcion",
          "habilidadesRequeridasCodigos",
          "unidadCompromiso",
          "cantidadHoras",
          "modalidadesColaboracion"
        ],
        properties: {
          nombre: {
            type: "string",
            example: "Desarrollador Frontend"
          },
          descripcion: {
            type: "string",
            example: "Desarrollador Frontend React"
          },
          habilidadesRequeridasCodigos: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["react"]
          },
          habilidadesOpcionalesCodigos: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["typescript"]
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
            example: ["GRATUITA"]
          }
        }
      },
      PerfilModificarInput: {
        type: "object",
        properties: {
          nombre: {
            type: "string",
            example: "Desarrollador Frontend Senior"
          },
          descripcion: {
            type: "string",
            example: "Desarrollador Senior Frontend"
          },
          habilidadesRequeridasCodigos: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["react", "node"]
          },
          habilidadesOpcionalesCodigos: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["docker"]
          },
          unidadCompromiso: {
            type: "string",
            enum: ["HORAS_TOTALES", "HORAS_SEMANALES", "HORAS_MENSUALES"],
            example: "HORAS_SEMANALES"
          },
          cantidadHoras: {
            type: "number",
            example: 15
          },
          modalidadesColaboracion: {
            type: "array",
            items: {
              type: "string",
              enum: ["GRATUITA", "CON_INCENTIVO_ECONOMICO", "CON_POSIBILIDAD_CONTRATACION"]
            },
            example: ["CON_INCENTIVO_ECONOMICO"]
          }
        }
      },
      Perfil: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "perfil-1"
          },
          nombre: {
            type: "string",
            example: "Desarrollador Frontend"
          },
          descripcion: {
            type: "string",
            example: "Desarrollador Frontend React"
          },
          habilidadesRequeridas: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          },
          habilidadesOpcionales: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
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
          proyectoId: {
            type: "string",
            example: "proy-1"
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
          },
          mensajesInternos: {
            type: "boolean",
            default: false,
            description: "Si la persona acepta ser contactada por mensajería interna (HU10). Por defecto false.",
            example: true
          },
          mediosDeContacto: {
            type: "array",
            description: "Medios externos registrados internamente para replicar notificaciones. No se muestran públicamente.",
            items: {
              $ref: "#/components/schemas/MediosDeContacto"
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
          },
          mensajesInternos: {
            type: "boolean",
            description: "Indica si la persona aceptó ser contactada por mensajería interna. Los medios de contacto no se exponen públicamente.",
            example: true
          }
        }
      },
      MediosDeContactoInput: {
        type: "object",
        required: ["tipo", "valor"],
        properties: {
          tipo: {
            type: "string",
            enum: ["EMAIL", "WHATSAPP", "SMS"],
            example: "EMAIL"
          },
          valor: {
            type: "string",
            example: "ana@example.com"
          }
        }
      },
      MediosDeContacto: {
        type: "object",
        required: ["tipo", "valor"],
        properties: {
          tipo: {
            type: "string",
            enum: ["EMAIL", "WHATSAPP", "SMS"],
            example: "EMAIL"
          },
          valor: {
            type: "string",
            example: "ana@example.com"
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
            example: "react"
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
            example: "react"
          },
          descripcion: {
            type: "string",
            example: "Creación de interfaces de usuario modernas con React y Hooks."
          }
        }
      },
      Compatibilidad: {
        type: "object",
        description:
          "Resultado de evaluar una persona colaboradora contra un perfil. Es un valor derivado: se calcula en " +
          "cada búsqueda a partir de las habilidades de ambos lados y no se persiste, porque quedaría viejo en " +
          "cuanto cualquiera de los dos lados cambie.",
        properties: {
          esCompatible: {
            type: "boolean",
            description: "True si la persona cumple TODAS las habilidades requeridas del perfil. Es el único campo que define si el resultado sirve.",
            example: true
          },
          cumpleAlgunaRequerida: {
            type: "boolean",
            description: "True si cumple al menos una de las requeridas. Es el criterio que se usa cuando estricto=false.",
            example: true
          },
          puntaje: {
            type: "number",
            description:
              "100 × (0.7 × requeridas cumplidas / total + 0.3 × opcionales cumplidas / total). Si el perfil no " +
              "declara habilidades opcionales, las requeridas valen el 100%. Sirve para ordenar, NO para decidir " +
              "compatibilidad: un resultado con esCompatible=false puede tener más puntaje que uno con true.",
            example: 100
          },
          requeridasFaltantes: {
            type: "array",
            description: "Habilidades requeridas por el perfil que la persona no tiene. Vacío cuando esCompatible es true.",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          },
          opcionalesCumplidas: {
            type: "array",
            description: "Habilidades opcionales del perfil que la persona sí tiene. Son las que mejoran la posición en el orden.",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          },
          opcionalesFaltantes: {
            type: "array",
            description:
              "Habilidades opcionales del perfil que la persona no tiene. No afectan la compatibilidad ni el orden: " +
              "indican qué podría sumar para encajar mejor en el perfil.",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          }
        }
      },
      CandidatoBusqueda: {
        type: "object",
        description:
          "Vista reducida de la persona colaboradora para un resultado de búsqueda. No incluye el historial de " +
          "colaboraciones ni los medios de contacto: encontrar un candidato no habilita a contactarlo, eso es HU10 " +
          "y requiere que la persona haya aceptado el contacto.",
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
          habilidades: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
            }
          }
        }
      },
      ColaboradorCompatible: {
        type: "object",
        description: "Un candidato y el detalle de por qué puntuó lo que puntuó (HU08).",
        properties: {
          personaColaboradora: {
            $ref: "#/components/schemas/CandidatoBusqueda"
          },
          compatibilidad: {
            $ref: "#/components/schemas/Compatibilidad"
          }
        }
      },
      ProyectoCompatible: {
        type: "object",
        description:
          "Una oportunidad de colaboración (HU09): el par proyecto-perfil que matcheó, más el detalle de la " +
          "compatibilidad. El compromiso y la modalidad vienen en el perfil, no en el proyecto.",
        properties: {
          proyecto: {
            type: "object",
            properties: {
              id: { type: "string", example: "proy-1" },
              titulo: { type: "string", example: "Portal del Barrio" },
              descripcion: { type: "string", example: "Portal vecinal de reclamos" },
              estado: { type: "string", example: "PUBLICADO" },
              colectivo: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "string", example: "colectivo-1" },
                  nombre: { type: "string", example: "Colectivo Comunitario" }
                }
              }
            }
          },
          perfil: {
            type: "object",
            properties: {
              id: { type: "string", example: "perfil-1" },
              nombre: { type: "string", example: "Tester" },
              descripcion: { type: "string", example: "QA del portal" },
              unidadCompromiso: { type: "string", example: "HORAS_SEMANALES" },
              cantidadHoras: { type: "number", example: 5 },
              modalidadesColaboracion: {
                type: "array",
                items: { type: "string" },
                example: ["GRATUITA"]
              }
            }
          },
          compatibilidad: {
            $ref: "#/components/schemas/Compatibilidad"
          }
        }
      },
      Colaboracion: {
        type: "object",
        description:
          "Inscripción de una persona colaboradora a un proyecto. Cuando se consulta el detalle del proyecto se " +
          "omite 'proyecto', que sería redundante.",
        properties: {
          id: {
            type: "string",
            example: "colab-reg-1"
          },
          fechaInscripcion: {
            type: "string",
            format: "date-time"
          },
          esAnonima: {
            type: "boolean",
            description:
              "Si es true, la contribución figura en la plataforma pero sin revelar quién la realizó: " +
              "'personaColaboradora' viene en null.",
            example: false
          },
          personaColaboradora: {
            type: "object",
            nullable: true,
            description: "Datos públicos de la persona, o null si la contribución es anónima.",
            properties: {
              id: { type: "string", example: "colab-1" },
              nombreFantasia: { type: "string", example: "SofiDev" },
              nombre: { type: "string", nullable: true, example: "Sofía" },
              apellido: { type: "string", nullable: true, example: "Gómez" }
            }
          },
          proyecto: {
            type: "object",
            description: "Solo presente al anotarse (POST). Se omite dentro del detalle del proyecto.",
            properties: {
              id: { type: "string", example: "proy-1" },
              titulo: { type: "string", example: "Sistema de Adopciones y Tránsitos" },
              descripcion: { type: "string" },
              estado: { type: "string", enum: ["PUBLICADO", "CERRADO"], example: "PUBLICADO" }
            }
          }
        }
      },
      Ubicacion: {
        type: "object",
        properties: {
          pais: {
            oneOf: [
              { type: "string", example: "Argentina" },
              {
                type: "object",
                properties: {
                  id: { type: "string", example: "AR" },
                  nombre: { type: "string", example: "Argentina" }
                }
              }
            ]
          },
          provincia: {
            oneOf: [
              { type: "string", example: "Buenos Aires" },
              {
                type: "object",
                properties: {
                  id: { type: "string", example: "06" },
                  nombre: { type: "string", example: "Buenos Aires" }
                }
              }
            ]
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
      },
      CrearNotificacionInput: {
        type: "object",
        required: ["colectivoId", "personaColaboradoraId", "perfilId", "contenido"],
        properties: {
          colectivoId: { type: "string", example: "colectivo-1" },
          personaColaboradoraId: { type: "string", example: "colab-1" },
          perfilId: { type: "string", example: "perfil-1" },
          contenido: { type: "string", example: "Te invitamos a sumarte al proyecto de reforestación en el rol de Frontend React." },
          replicarMediosExternos: { type: "boolean", default: true, example: true }
        }
      },
      ActualizarNotificacionLecturaInput: {
        type: "object",
        required: ["leida"],
        properties: {
          leida: { type: "boolean", example: true }
        }
      },
      Notificacion: {
        type: "object",
        properties: {
          id: { type: "string", example: "notif-1234" },
          contenido: { type: "string", example: "Te invitamos a sumarte al proyecto..." },
          fecha: { type: "string", format: "date-time" },
          leida: { type: "boolean", example: false },
          colectivo: {
            type: "object",
            properties: {
              id: { type: "string", example: "colectivo-1" },
              nombre: { type: "string", example: "Fundación Raíces" }
            }
          },
          personaColaboradora: {
            type: "object",
            properties: {
              id: { type: "string", example: "colab-1" },
              nombre: { type: "string", example: "Ana" },
              apellido: { type: "string", example: "García" },
              nombreFantasia: { type: "string", example: "AnaDev" }
            }
          },
          perfil: {
            type: "object",
            properties: {
              id: { type: "string", example: "perfil-1" },
              nombre: { type: "string", example: "Desarrollador Frontend" }
            }
          },
          mediosExternosUtilizados: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tipo: { type: "string", example: "EMAIL" },
                valor: { type: "string", example: "colab@gmail.com" },
                fechaEnvio: { type: "string", format: "date-time" },
                exitoso: { type: "boolean", example: true },
                error: { type: "string", nullable: true }
              }
            }
          }
        }
      }
    }
  }
};
