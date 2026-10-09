import { PerfilService } from "../../src/services/PerfilService.js";
import { ProyectoRepository } from "../../src/repositories/ProyectoRepository.js";
import { HabilidadRepository } from "../../src/repositories/HabilidadRepository.js";
import { PerfilRepository } from "../../src/repositories/PerfilRepository.js";
import { ColectivoRepository } from "../../src/repositories/ColectivoRepository.js";
import { Proyecto } from "../../src/domain/Proyecto.js";
import { Colectivo } from "../../src/domain/Colectivo.js";
import { Habilidad } from "../../src/domain/Habilidad.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../../src/domain/enums.js";
import { NotFoundError, ConflictError, UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("PerfilService", () => {
    let service;
    let colectivoPrueba;
    let proyectoPrueba;

    beforeEach(() => {
        ProyectoRepository.limpiar();
        HabilidadRepository.limpiar();
        PerfilRepository.limpiar();
        ColectivoRepository.limpiar();

        service = new PerfilService({
            proyectoRepository: ProyectoRepository,
            habilidadRepository: HabilidadRepository,
            perfilRepository: PerfilRepository
        });

        HabilidadRepository.guardar(new Habilidad({ codigo: "react", titulo: "React", descripcion: "Frontend" }));
        HabilidadRepository.guardar(new Habilidad({ codigo: "node", titulo: "NodeJS", descripcion: "Backend" }));
        HabilidadRepository.guardar(new Habilidad({ codigo: "docker", titulo: "Docker", descripcion: "DevOps" }));

        colectivoPrueba = ColectivoRepository.guardar(new Colectivo({
            nombre: "Colectivo Comunitario",
            descripcion: "Org social",
            tipo: "ONG"
        }));

        proyectoPrueba = ProyectoRepository.guardar(new Proyecto({
            titulo: "Plataforma Barrial",
            descripcion: "App web barrial",
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 20,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA],
            colectivo: colectivoPrueba,
            habilidadesRequeridas: [HabilidadRepository.buscarPorCodigo("react")]
        }));
    });

    describe("crearPerfil", () => {
        test("crea un perfil exitosamente y lo asocia al proyecto", () => {
            const perfil = service.crearPerfil(proyectoPrueba.id, {
                nombre: "Backend Dev",
                descripcion: "Desarrollador Backend",
                habilidadesRequeridasCodigos: ["node"],
                habilidadesOpcionalesCodigos: ["docker"],
                unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            expect(perfil).toBeDefined();
            expect(perfil.id).toBeDefined();
            expect(perfil.nombre).toBe("Backend Dev");
            expect(perfil.descripcion).toBe("Desarrollador Backend");
            expect(perfil.habilidadesRequeridas.length).toBe(1);
            expect(perfil.habilidadesRequeridas[0].codigo).toBe("node");
            expect(perfil.habilidadesOpcionales.length).toBe(1);
            expect(perfil.habilidadesOpcionales[0].codigo).toBe("docker");

            const proyectoActualizado = ProyectoRepository.buscarPorId(proyectoPrueba.id);
            expect(proyectoActualizado.perfiles.length).toBe(1);
            expect(PerfilRepository.buscarPorId(perfil.id)).toBeDefined();
        });

        test("lanza NotFoundError si el proyecto no existe", () => {
            expect(() => service.crearPerfil("id-inexistente", {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            })).toThrow(NotFoundError);
        });

        test("lanza ConflictError si el proyecto está cerrado", () => {
            proyectoPrueba.cerrarProyecto();
            ProyectoRepository.guardar(proyectoPrueba);

            expect(() => service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            })).toThrow(ConflictError);
        });

        test("lanza UnprocessableEntityError si no se indican habilidades requeridas", () => {
            expect(() => service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: [],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            })).toThrow(UnprocessableEntityError);
        });

        test("lanza NotFoundError si alguna habilidad requerida no existe", () => {
            expect(() => service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["habilidad_inexistente"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            })).toThrow(NotFoundError);
        });

        test("lanza NotFoundError si alguna habilidad opcional no existe", () => {
            expect(() => service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["react"],
                habilidadesOpcionalesCodigos: ["opcional_inexistente"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            })).toThrow(NotFoundError);
        });

        test("lanza UnprocessableEntityError si una habilidad se repite en requerida y opcional", () => {
            expect(() => service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["react"],
                habilidadesOpcionalesCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 10,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            })).toThrow(UnprocessableEntityError);
        });
    });

    describe("obtenerPerfiles", () => {
        test("devuelve los perfiles asociados al proyecto", () => {
            service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Backend",
                habilidadesRequeridasCodigos: ["node"],
                unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
                cantidadHoras: 8,
                modalidadesColaboracion: [ModalidadColaboracion.CON_INCENTIVO_ECONOMICO]
            });

            const perfiles = service.obtenerPerfiles(proyectoPrueba.id);
            expect(perfiles.length).toBe(2);
        });

        test("lanza NotFoundError si el proyecto no existe", () => {
            expect(() => service.obtenerPerfiles("proy-fantasma")).toThrow(NotFoundError);
        });
    });

    describe("obtenerPerfilPorId", () => {
        test("devuelve el perfil solicitado", () => {
            const creado = service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Frontend",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            const perfil = service.obtenerPerfilPorId(proyectoPrueba.id, creado.id);
            expect(perfil).toBeDefined();
            expect(perfil.id).toBe(creado.id);
        });

        test("lanza NotFoundError si el perfil no existe en el proyecto", () => {
            expect(() => service.obtenerPerfilPorId(proyectoPrueba.id, "perf-inexistente")).toThrow(NotFoundError);
        });
    });

    describe("modificarPerfil", () => {
        test("modifica exitosamente los datos del perfil", () => {
            const creado = service.crearPerfil(proyectoPrueba.id, {
                nombre: "Junior Dev",
                descripcion: "Junior Dev",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            const modificado = service.modificarPerfil(proyectoPrueba.id, creado.id, {
                nombre: "Semi-Senior Dev",
                descripcion: "Semi-Senior Dev",
                cantidadHoras: 15,
                habilidadesRequeridasCodigos: ["react", "node"],
                habilidadesOpcionalesCodigos: ["docker"]
            });

            expect(modificado.nombre).toBe("Semi-Senior Dev");
            expect(modificado.descripcion).toBe("Semi-Senior Dev");
            expect(modificado.cantidadHoras).toBe(15);
            expect(modificado.habilidadesRequeridas.length).toBe(2);
            expect(modificado.habilidadesOpcionales.length).toBe(1);
        });

        test("lanza ConflictError si el proyecto está cerrado", () => {
            const creado = service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Junior Dev",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            proyectoPrueba.cerrarProyecto();
            ProyectoRepository.guardar(proyectoPrueba);

            expect(() => service.modificarPerfil(proyectoPrueba.id, creado.id, {
                descripcion: "Senior"
            })).toThrow(ConflictError);
        });

        test("lanza NotFoundError si la habilidad a actualizar no existe", () => {
            const creado = service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Junior Dev",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            expect(() => service.modificarPerfil(proyectoPrueba.id, creado.id, {
                habilidadesRequeridasCodigos: ["hab_no_existe"]
            })).toThrow(NotFoundError);
        });
    });

    describe("eliminarPerfil", () => {
        test("elimina el perfil del proyecto y del repositorio", () => {
            const creado = service.crearPerfil(proyectoPrueba.id, {
                descripcion: "A eliminar",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            const resultado = service.eliminarPerfil(proyectoPrueba.id, creado.id);
            expect(resultado).toBe(true);

            expect(service.obtenerPerfiles(proyectoPrueba.id).length).toBe(0);
            expect(PerfilRepository.buscarPorId(creado.id)).toBeNull();
        });

        test("lanza NotFoundError si el perfil no existe", () => {
            expect(() => service.eliminarPerfil(proyectoPrueba.id, "perf-inexistente")).toThrow(NotFoundError);
        });

        test("lanza ConflictError si el proyecto está cerrado", () => {
            const creado = service.crearPerfil(proyectoPrueba.id, {
                descripcion: "Para eliminar",
                habilidadesRequeridasCodigos: ["react"],
                unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                cantidadHoras: 5,
                modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
            });

            proyectoPrueba.cerrarProyecto();
            ProyectoRepository.guardar(proyectoPrueba);

            expect(() => service.eliminarPerfil(proyectoPrueba.id, creado.id)).toThrow(ConflictError);
        });
    });
});
