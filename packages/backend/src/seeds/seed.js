import "dotenv/config";
import { MongoDBClient } from "../config/database.js";
import { HabilidadModel } from "../schemas/HabilidadSchema.js";
import { ColectivoModel } from "../schemas/ColectivoSchema.js";
import { PersonaColaboradoraModel } from "../schemas/PersonaColaboradoraSchema.js";
import { ProyectoModel } from "../schemas/ProyectoSchema.js";
import { PerfilModel } from "../schemas/PerfilSchema.js";
import { NotificacionModel } from "../schemas/NotificacionSchema.js";

async function ejecutarSeed() {
    console.log("🌱 [SEED] Iniciando carga de datos en MongoDB...");

    await MongoDBClient.connect();

    try {
        // 1. Limpieza de colecciones previas
        console.log("🧹 [SEED] Limpiando colecciones anteriores...");
        await Promise.all([
            HabilidadModel.deleteMany({}),
            ColectivoModel.deleteMany({}),
            PersonaColaboradoraModel.deleteMany({}),
            ProyectoModel.deleteMany({}),
            PerfilModel.deleteMany({}),
            NotificacionModel.deleteMany({})
        ]);

        // 2. Habilidades
        console.log("🧩 [SEED] Insertando habilidades...");
        const habilidadesData = [
            {
                codigo: "testing_e2e",
                titulo: "Testing E2E con Cypress",
                descripcion: "Pruebas automatizadas de punta a punta sobre la interfaz web"
            },
            {
                codigo: "react",
                titulo: "React",
                descripcion: "Biblioteca de JavaScript para interfaces de usuario modernas y componentes reactivos"
            },
            {
                codigo: "node_js",
                titulo: "Node.js",
                descripcion: "Entorno backend con Express y arquitectura orientada a servicios"
            },
            {
                codigo: "python",
                titulo: "Python",
                descripcion: "Lenguaje versátil para ciencia de datos, machine learning y APIs con FastAPI o Flask"
            },
            {
                codigo: "docker",
                titulo: "Docker",
                descripcion: "Contenedores, orquestación y empaquetado de aplicaciones para despliegues confiables"
            },
            {
                codigo: "mongodb",
                titulo: "MongoDB",
                descripcion: "Base de datos NoSQL documental con modelado flexible y agregaciones"
            },
            {
                codigo: "ui_ux",
                titulo: "Diseño UI/UX",
                descripcion: "Diseño de experiencias de usuario, accesibilidad (WCAG) y prototipos interactivos en Figma"
            },
            {
                codigo: "comunicacion",
                titulo: "Comunicación Social",
                descripcion: "Estrategias de prensa, redacción institucional y difusión comunitaria"
            },
            {
                codigo: "gestion_proyectos",
                titulo: "Gestión de Proyectos",
                descripcion: "Metodologías ágiles Scrum/Kanban, facilitación de equipos y seguimiento de hitos"
            }
        ];
        const habilidades = await HabilidadModel.insertMany(habilidadesData);
        console.log(`   ✓ ${habilidades.length} habilidades insertadas.`);

        // 3. Colectivos
        console.log("🏛️ [SEED] Insertando colectivos...");
        const colectivosData = [
            {
                id: "colectivo-1",
                nombre: "Asociación Civil Huellas Solidarias",
                descripcion: "Organización barrial comunitaria dedicada al rescate animal, castraciones gratuitas y adopción responsable.",
                tipo: "ONG",
                ubicacion: {
                    pais: "Argentina",
                    provincia: "Ciudad Autónoma de Buenos Aires",
                    ciudad: "Caballito"
                }
            },
            {
                id: "colectivo-2",
                nombre: "Cooperativa Tecnológica Conectando Raíces",
                descripcion: "Cooperativa de desarrollo e infraestructura popular para llevar internet y sensores a escuelas rurales.",
                tipo: "ASOCIACION_BARRIAL",
                ubicacion: {
                    pais: "Argentina",
                    provincia: "Córdoba",
                    ciudad: "Villa General Belgrano"
                }
            },
            {
                id: "colectivo-4",
                nombre: "Asamblea Vecinal Parque Avellaneda",
                descripcion: "Vecinas y vecinos autoconvocados por la defensa del espacio publico y el arbolado urbano.",
                tipo: "ASAMBLEA",
                ubicacion: {
                    pais: "Argentina",
                    provincia: "Buenos Aires",
                    ciudad: "Avellaneda"
                }
            },
            {
                id: "colectivo-3",
                nombre: "Biblioteca Popular Alfonsina Storni",
                descripcion: "Espacio cultural sin fines de lucro para la alfabetización comunitaria, talleres de oficio y memoria barrial.",
                tipo: "FUNDACION",
                ubicacion: {
                    pais: "Argentina",
                    provincia: "Santa Fe",
                    ciudad: "Rosario"
                }
            }
        ];
        const colectivos = await ColectivoModel.insertMany(colectivosData);
        console.log(`   ✓ ${colectivos.length} colectivos insertados.`);

        // 4. Personas Colaboradoras
        console.log("👤 [SEED] Insertando personas colaboradoras...");
        const personasData = [
            {
                id: "colab-1",
                nombre: "Sofía",
                apellido: "Gómez",
                nombreFantasia: "SofiDev",
                pronombres: ["ella"],
                presentacion: "Ingeniera de software frontend apasionada por crear herramientas abiertas de alto impacto comunitario.",
                cuentas: [{ nombreUsuario: "sofigomez", tipo: "GITHUB" }],
                habilidades: [
                    { codigo: "react", titulo: "React" },
                    { codigo: "node_js", titulo: "Node.js" },
                    { codigo: "docker", titulo: "Docker" }
                ],
                mensajesInternos: true,
                mediosDeContacto: [
                    { tipo: "EMAIL", valor: "sofi.gomez@gmail.com" },
                    { tipo: "WHATSAPP", valor: "+5491112345678" }
                ],
                colaboraciones: [
                    {
                        id: "colab-reg-1",
                        proyectoId: "proy-1",
                        tituloProyecto: "Sistema de Adopciones y Tránsitos"
                    }
                ]
            },
            {
                id: "colab-2",
                nombre: "Lucas",
                apellido: "Martínez",
                nombreFantasia: "LukeSkycoder",
                pronombres: ["él"],
                presentacion: "Data Engineer enfocado en Python, IoT y persistencia NoSQL. Convencido del poder de la tecnología comunitaria.",
                cuentas: [{ nombreUsuario: "lmartinez_dev", tipo: "GITHUB" }],
                habilidades: [
                    { codigo: "python", titulo: "Python" },
                    { codigo: "docker", titulo: "Docker" },
                    { codigo: "mongodb", titulo: "MongoDB" }
                ],
                mensajesInternos: true,
                mediosDeContacto: [
                    { tipo: "EMAIL", valor: "lucas.martinez@gmail.com" },
                    { tipo: "WHATSAPP", valor: "+5493512345678" }
                ],
                colaboraciones: [
                    {
                        id: "colab-reg-2",
                        proyectoId: "proy-1",
                        tituloProyecto: "Sistema de Adopciones y Tránsitos"
                    },
                    {
                        id: "colab-reg-3",
                        proyectoId: "proy-2",
                        tituloProyecto: "Red Comunitaria de Alertas Tempranas"
                    }
                ]
            },
            {
                id: "colab-3",
                nombre: "Alex",
                apellido: "Rivera",
                nombreFantasia: "AlexPixel",
                pronombres: ["elle"],
                presentacion: "Diseñadore UI/UX comprometide con el diseño accesible, sistemas visuales intuitivos y empatía comunitaria.",
                cuentas: [{ nombreUsuario: "alexpixel_ui", tipo: "GITLAB" }],
                habilidades: [
                    { codigo: "ui_ux", titulo: "Diseño UI/UX" },
                    { codigo: "react", titulo: "React" }
                ],
                mensajesInternos: false,
                mediosDeContacto: [
                    { tipo: "EMAIL", valor: "alex.rivera@design.org" }
                ],
                colaboraciones: []
            },
            {
                id: "colab-5",
                nombreFantasia: "ElGatoQueProgramaba",
                pronombres: ["elle"],
                presentacion: "Prefiero colaborar sin dar mi nombre. Backend y automatizacion.",
                cuentas: [{ nombreUsuario: "gatoprograma", tipo: "GITLAB" }],
                habilidades: [
                    { codigo: "node_js", titulo: "Node.js" },
                    { codigo: "mongodb", titulo: "MongoDB" }
                ],
                mensajesInternos: true,
                mediosDeContacto: [
                    { tipo: "SMS", valor: "+5491166667777" }
                ],
                colaboraciones: []
            },
            {
                id: "colab-4",
                nombre: "Valentina",
                apellido: "Rossi",
                nombreFantasia: "ValenGestora",
                pronombres: ["ella"],
                presentacion: "Coordinadora de proyectos sociales y facilitadora ágil. Apasionada por tender puentes entre la comunidad y la técnica.",
                cuentas: [{ nombreUsuario: "valenrossi", tipo: "GITHUB" }],
                habilidades: [
                    { codigo: "gestion_proyectos", titulo: "Gestión de Proyectos" },
                    { codigo: "comunicacion", titulo: "Comunicación Social" }
                ],
                mensajesInternos: true,
                mediosDeContacto: [
                    { tipo: "EMAIL", valor: "valen.rossi@comunidad.org" }
                ],
                colaboraciones: []
            }
        ];
        const personas = await PersonaColaboradoraModel.insertMany(personasData);

        // Las colaboraciones referencian a la persona por ObjectId (asi lo
        // declara ProyectoSchema, siguiendo el patron de referencias de la
        // guia de la catedra), no por su id de dominio.
        const objectIdPorPersona = new Map(personas.map((p) => [p.id, p._id]));
        console.log(`   ✓ ${personas.length} personas colaboradoras insertadas.`);

        // 5. Proyectos
        console.log("🚀 [SEED] Insertando proyectos con hitos y perfiles...");
        const perfilesProy1 = [
            {
                id: "perfil-1",
                nombre: "Desarrollador Frontend Web",
                descripcion: "Construcción de la interfaz responsive para adopciones y seguimiento de animales.",
                habilidadesRequeridas: [{ codigo: "react", titulo: "React" }],
                habilidadesOpcionales: [{ codigo: "ui_ux", titulo: "Diseño UI/UX" }],
                unidadCompromiso: "HORAS_SEMANALES",
                cantidadHoras: 8,
                modalidadesColaboracion: ["GRATUITA"],
                proyectoId: "proy-1"
            },
            {
                id: "perfil-2",
                nombre: "Desarrollador Backend API",
                descripcion: "Construcción de los endpoints RESTful para la base de datos de rescates y fichas veterinarias.",
                habilidadesRequeridas: [{ codigo: "node_js", titulo: "Node.js" }],
                habilidadesOpcionales: [
                    { codigo: "docker", titulo: "Docker" },
                    { codigo: "mongodb", titulo: "MongoDB" }
                ],
                unidadCompromiso: "HORAS_SEMANALES",
                cantidadHoras: 10,
                modalidadesColaboracion: ["GRATUITA"],
                proyectoId: "proy-1"
            }
        ];

        const perfilesProy2 = [
            {
                id: "perfil-3",
                nombre: "Especialista en Datos y Alertas",
                descripcion: "Ingesta de telemetría de sensores ambientales y generación de reportes automáticos.",
                habilidadesRequeridas: [{ codigo: "python", titulo: "Python" }],
                habilidadesOpcionales: [{ codigo: "docker", titulo: "Docker" }],
                unidadCompromiso: "HORAS_SEMANALES",
                cantidadHoras: 8,
                modalidadesColaboracion: ["CON_INCENTIVO_ECONOMICO"],
                proyectoId: "proy-2"
            },
            {
                id: "perfil-4",
                nombre: "Tester",
                descripcion: "Pruebas de punta a punta del panel de alertas antes de cada despliegue.",
                habilidadesRequeridas: [{ codigo: "testing_e2e", titulo: "Testing E2E" }],
                habilidadesOpcionales: [{ codigo: "docker", titulo: "Docker" }],
                unidadCompromiso: "HORAS_MENSUALES",
                cantidadHoras: 5,
                modalidadesColaboracion: ["CON_POSIBILIDAD_CONTRATACION"],
                proyectoId: "proy-2"
            }
        ];

        const proyectosData = [
            {
                id: "proy-1",
                titulo: "Sistema de Adopciones y Tránsitos",
                descripcion: "Plataforma web colaborativa para centralizar rescates, fichas veterinarias y postulaciones de adopción en refugios barriales.",
                unidadCompromiso: "HORAS_TOTALES",
                cantidadHoras: 40,
                modalidadesColaboracion: ["GRATUITA"],
                estado: "PUBLICADO",
                fechaAlta: new Date("2026-02-01"),
                colectivo: "colectivo-1",
                habilidadesRequeridas: ["react", "node_js"],
                perfiles: ["perfil-1", "perfil-2"],
                hitos: [
                    {
                        id: "hito-1",
                        fecha: new Date("2026-02-15"),
                        porcentajeConcrecion: 30,
                        descripcion: "Relevamiento de casos de uso y diseño de base de datos documental"
                    },
                    {
                        id: "hito-2",
                        fecha: new Date("2026-03-05"),
                        porcentajeConcrecion: 65,
                        descripcion: "Endpoints API REST y primer prototipo navegable de adopciones"
                    }
                ],
                colaboraciones: [
                    {
                        id: "colab-reg-1",
                        personaColaboradora: objectIdPorPersona.get("colab-1"),
                        esAnonima: false,
                        fechaInscripcion: new Date("2026-02-20")
                    },
                    {
                        id: "colab-reg-2",
                        personaColaboradora: objectIdPorPersona.get("colab-2"),
                        // Contribucion anonima (HU07): figura en la plataforma
                        // pero sin revelar quien la realizo.
                        esAnonima: true,
                        fechaInscripcion: new Date("2026-02-22")
                    }
                ],
                enlaceSistemaEnFuncionamiento: "https://adopciones.huellassolidarias.org",
                enlaceCodigoFuente: "https://github.com/huellas-solidarias/sistema-adopciones"
            },
            {
                id: "proy-2",
                titulo: "Red Comunitaria de Alertas Tempranas",
                descripcion: "Red ciudadana de sensores IoT pluviométricos y térmicos con panel de alerta comunitaria ante emergencias hídricas o de incendios.",
                unidadCompromiso: "HORAS_SEMANALES",
                cantidadHoras: 15,
                modalidadesColaboracion: ["CON_INCENTIVO_ECONOMICO"],
                estado: "PUBLICADO",
                fechaAlta: new Date("2026-01-10"),
                colectivo: "colectivo-2",
                habilidadesRequeridas: ["python", "docker"],
                perfiles: ["perfil-3", "perfil-4"],
                hitos: [
                    {
                        id: "hito-3",
                        fecha: new Date("2026-02-01"),
                        porcentajeConcrecion: 40,
                        descripcion: "Despliegue de concentradores LoRaWAN y primeros 5 sensores pluviométricos"
                    }
                ],
                colaboraciones: [
                    {
                        id: "colab-reg-3",
                        personaColaboradora: objectIdPorPersona.get("colab-2"),
                        esAnonima: false,
                        fechaInscripcion: new Date("2026-02-05")
                    }
                ],
                enlaceSistemaEnFuncionamiento: "https://alertas.conectandoraices.coop",
                enlaceCodigoFuente: "https://github.com/conectando-raices/red-alertas"
            },
            {
                id: "proy-3",
                titulo: "Digitalización del Archivo Histórico Barrial",
                descripcion: "Preservación digital comunitaria, escaneo de fotografías y testimonios orales de familias fundadoras del barrio.",
                unidadCompromiso: "HORAS_TOTALES",
                cantidadHoras: 50,
                modalidadesColaboracion: ["GRATUITA"],
                estado: "CERRADO",
                fechaAlta: new Date("2025-10-01"),
                fechaCierre: new Date("2026-01-20"),
                colectivo: "colectivo-3",
                habilidadesRequeridas: ["comunicacion"],
                perfiles: [],
                hitos: [
                    {
                        id: "hito-4",
                        fecha: new Date("2026-01-15"),
                        porcentajeConcrecion: 100,
                        descripcion: "Carga completa del fondo documental y presentación comunitaria"
                    }
                ],
                colaboraciones: [],
                enlaceSistemaEnFuncionamiento: "https://archivo.bibliotecaalfonsina.org",
                enlaceCodigoFuente: "https://github.com/biblioteca-alfonsina/archivo-historico"
            }
        ];
        const proyectos = await ProyectoModel.insertMany(proyectosData);
        console.log(`   ✓ ${proyectos.length} proyectos insertados.`);

        // 6. Perfiles en colección Perfil
        console.log("📋 [SEED] Insertando perfiles en colección de perfiles...");
        const todosLosPerfiles = [...perfilesProy1, ...perfilesProy2];
        const perfiles = await PerfilModel.insertMany(todosLosPerfiles);
        console.log(`   ✓ ${perfiles.length} perfiles registrados.`);

        // 7. Notificaciones (Mensajes Internos y réplica externa HU10 / HU11)
        console.log("📬 [SEED] Insertando notificaciones...");
        const notificacionesData = [
            {
                id: "notif-1",
                contenido: "¡Hola Sofi! Vimos tu experiencia en React y creemos que tu perfil es ideal para sumarte al desarrollo del Sistema de Adopciones. ¿Te gustaría coordinar una charla virtual?",
                fecha: new Date("2026-02-18T10:30:00Z"),
                leida: false,
                colectivoId: "colectivo-1",
                personaColaboradoraId: "colab-1",
                perfilId: "perfil-1",
                mediosExternosUtilizados: [
                    {
                        tipo: "EMAIL",
                        valor: "sofi.gomez@gmail.com",
                        fechaEnvio: new Date("2026-02-18T10:30:05Z"),
                        exitoso: true
                    },
                    {
                        tipo: "WHATSAPP",
                        valor: "+5491112345678",
                        fechaEnvio: new Date("2026-02-18T10:30:08Z"),
                        exitoso: true
                    }
                ]
            },
            {
                id: "notif-2",
                contenido: "Hola Lucas, te contactamos desde Conectando Raíces. Tu perfil como Data Engineer y experiencia en Python se adaptan a la perfección a la Red de Alertas Tempranas.",
                fecha: new Date("2026-02-02T14:15:00Z"),
                leida: true,
                colectivoId: "colectivo-2",
                personaColaboradoraId: "colab-2",
                perfilId: "perfil-3",
                mediosExternosUtilizados: [
                    {
                        tipo: "EMAIL",
                        valor: "lucas.martinez@gmail.com",
                        fechaEnvio: new Date("2026-02-02T14:15:04Z"),
                        exitoso: true
                    }
                ]
            }
        ];
        const notificaciones = await NotificacionModel.insertMany(notificacionesData);
        console.log(`   ✓ ${notificaciones.length} notificaciones insertadas.`);

        console.log("\n✅ [SEED] Base de datos inicializada exitosamente con datos realistas para Entrega 2.");
    } catch (error) {
        console.error("❌ [SEED] Error ejecutando el seed:", error);
        process.exitCode = 1;
    } finally {
        await MongoDBClient.disconnect();
    }
}

ejecutarSeed();
