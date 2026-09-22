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
          "400": {
            description: "Datos de entrada inválidos o faltantes"
          },
          "409": {
            description: "Ya existe un colectivo con ese nombre"
          }
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
          "404": {
            description: "Colectivo no encontrado"
          }
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
              example: "col-1"
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
              example: "col-1"
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
          "400": {
            description: "Parámetros inválidos o faltan habilidades requeridas"
          },
          "404": {
            description: "Colectivo asociado o código de habilidad no encontrado"
          },
          "409": {
            description: "Conflicto o título de proyecto duplicado en el colectivo"
          }
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
          "404": {
            description: "Proyecto no encontrado"
          }
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
          "400": {
            description: "Petición inválida o error al actualizar el proyecto"
          },
          "404": {
            description: "Proyecto no encontrado"
          }
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
          "400": {
            description: "Datos inválidos"
          },
          "404": {
            description: "Proyecto no encontrado"
          }
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
          "400": {
            description: "Proyecto cerrado o el colaborador no cuenta con las habilidades requeridas"
          },
          "404": {
            description: "Proyecto o persona colaboradora no encontrada"
          }
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
          "400": {
            description: "Datos de entrada inválidos"
          },
          "409": {
            description: "Conflicto o nombre de fantasía duplicado"
          }
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
          "404": {
            description: "Persona colaboradora no encontrada"
          }
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
          "400": {
            description: "Estructura de habilidad inválida"
          },
          "404": {
            description: "Persona colaboradora no encontrada o error de negocio"
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
          "400": {
            description: "Datos de entrada inválidos"
          },
          "409": {
            description: "Ya existe una habilidad con el mismo código"
          }
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
          "404": {
            description: "Habilidad no encontrada"
          }
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
              example: "desarrollo_web_react"
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
              example: "desarrollo_web_react"
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
    }
  },
  components: {
    schemas: {
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
          colectivo: {
            type: "object"
          },
          habilidadesRequeridas: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Habilidad"
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
      }
    }
  }
};
