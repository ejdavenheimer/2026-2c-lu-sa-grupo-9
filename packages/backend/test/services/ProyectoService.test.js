import { ProyectoService } from "../../src/services/ProyectoService.js";
import { ProyectoRepository } from "../../src/repositories/ProyectoRepository.js";
import { ColectivoRepository } from "../../src/repositories/ColectivoRepository.js";
import { PersonaColaboradoraRepository } from "../../src/repositories/PersonaColaboradoraRepository.js";
import { HabilidadRepository } from "../../src/repositories/HabilidadRepository.js";
import { Colectivo } from "../../src/domain/Colectivo.js";
import { Habilidad } from "../../src/domain/Habilidad.js";
import { PersonaColaboradora } from "../../src/domain/PersonaColaboradora.js";
import { EstadoProyecto } from "../../src/domain/enums.js";

function datosProyectoDePrueba(overrides = {}) {
    return {
        titulo: "Plataforma de Donaciones",
        descripcion: "Sistema de gestión de donaciones",
        unidadCompromiso: "HORAS_TOTALES",
        cantidadHoras: 20,
        modalidadesColaboracion: ["GRATUITA"],
        ...overrides
    };
}

function crearColectivoDePrueba(overrides = {}) {
    return ColectivoRepository.guardar(new Colectivo({
        nombre: "Colectivo Comunitario",
        descripcion: "Colectivo de ayuda social",
        tipo: "ONG",
        ...overrides
    }));
}

function crearHabilidadDePrueba(overrides = {}) {
    return HabilidadRepository.guardar(new Habilidad({
        titulo: "Desarrollo Web Node",
        codigo: "node_js",
        descripcion: "Backend en Node",
        ...overrides
    }));
}

function crearPersonaColaboradoraDePrueba(overrides = {}) {
    return PersonaColaboradoraRepository.guardar(new PersonaColaboradora({
        nombreFantasia: "Colaborador Dev",
        nombre: "Juan",
        apellido: "Pérez",
        ...overrides
    }));
}

describe("ProyectoService", () => {
    let proyectoService;

    beforeEach(() => {
        ProyectoRepository.limpiar();
        ColectivoRepository.limpiar();
        PersonaColaboradoraRepository.limpiar();
        HabilidadRepository.limpiar();
        proyectoService = new ProyectoService();
    });

    describe("crearProyecto", () => {
        test("crea y guarda un proyecto pasando objetos de dominio directamente", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();

            const datos = datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            });

            const proyectoCreado = proyectoService.crearProyecto(datos);

            expect(proyectoCreado).toHaveProperty("id");
            expect(proyectoCreado.titulo).toBe(datos.titulo);
            expect(proyectoCreado.estado).toBe(EstadoProyecto.PUBLICADO);
            expect(proyectoCreado.colectivo).toBe(colectivo);
            expect(proyectoCreado.habilidadesRequeridas).toContainEqual(habilidad);

            // Verifica que se haya agregado a la lista de proyectos del colectivo
            expect(colectivo.proyectos).toContain(proyectoCreado);

            // Verifica persistencia en el repositorio
            const guardado = ProyectoRepository.buscarPorId(proyectoCreado.id);
            expect(guardado).toEqual(proyectoCreado);
        });

        test("crea y guarda un proyecto resolviendo colectivoId y habilidadesRequeridasCodigos", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba({ codigo: "react_native", titulo: "React Native" });

            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridasCodigos: ["react_native"]
            });

            const proyectoCreado = proyectoService.crearProyecto(datos);

            expect(proyectoCreado.id).toBeDefined();
            expect(proyectoCreado.colectivo.id).toBe(colectivo.id);
            expect(proyectoCreado.habilidadesRequeridas).toEqual(
                expect.arrayContaining([expect.objectContaining({ codigo: "react_native" })])
            );
        });

        test("convierte una modalidad única (string) a un array", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();

            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridasCodigos: [habilidad.codigo],
                modalidadesColaboracion: "PAGA"
            });

            const proyectoCreado = proyectoService.crearProyecto(datos);
            expect(proyectoCreado.modalidadesColaboracion).toEqual(["PAGA"]);
        });

        test("lanza un error si no se indica colectivo ni colectivoId", () => {
            const habilidad = crearHabilidadDePrueba();
            const datos = datosProyectoDePrueba({
                habilidadesRequeridas: [habilidad]
            });

            expect(() => proyectoService.crearProyecto(datos)).toThrow("El proyecto requiere un colectivo asociado");
        });

        test("lanza un error si el colectivoId no existe", () => {
            const habilidad = crearHabilidadDePrueba();
            const datos = datosProyectoDePrueba({
                colectivoId: "id-inexistente",
                habilidadesRequeridas: [habilidad]
            });

            expect(() => proyectoService.crearProyecto(datos)).toThrow("No se encontró el colectivo con ID 'id-inexistente'");
        });

        test("lanza un error si no se indican habilidades requeridas", () => {
            const colectivo = crearColectivoDePrueba();
            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridas: [],
                habilidadesRequeridasCodigos: []
            });

            expect(() => proyectoService.crearProyecto(datos)).toThrow("El proyecto requiere al menos una habilidad requerida");
        });

        test("lanza un error si un código en habilidadesRequeridasCodigos no existe", () => {
            const colectivo = crearColectivoDePrueba();
            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridasCodigos: ["codigo_fantasma"]
            });

            expect(() => proyectoService.crearProyecto(datos)).toThrow("No se encontró la habilidad requerida con código 'codigo_fantasma'");
        });

        test("lanza un error si ya existe un proyecto con el mismo título en el colectivo", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();

            const datos1 = datosProyectoDePrueba({
                titulo: "Proyecto Único",
                colectivo,
                habilidadesRequeridas: [habilidad]
            });
            const datos2 = datosProyectoDePrueba({
                titulo: "Proyecto Único",
                colectivo,
                habilidadesRequeridas: [habilidad]
            });

            proyectoService.crearProyecto(datos1);
            expect(() => proyectoService.crearProyecto(datos2)).toThrow("El proyecto 'Proyecto Único' ya existe en el colectivo");
        });
    });

    describe("obtenerProyectos", () => {
        test("devuelve un array vacío si no hay proyectos", () => {
            const proyectos = proyectoService.obtenerProyectos();
            expect(proyectos).toEqual([]);
        });

        test("devuelve todos los proyectos guardados", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();

            proyectoService.crearProyecto(datosProyectoDePrueba({
                titulo: "Proyecto 1",
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            proyectoService.crearProyecto(datosProyectoDePrueba({
                titulo: "Proyecto 2",
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const proyectos = proyectoService.obtenerProyectos();
            expect(proyectos).toHaveLength(2);
            expect(proyectos.map((p) => p.titulo)).toEqual(["Proyecto 1", "Proyecto 2"]);
        });
    });

    describe("obtenerProyectoPorId", () => {
        test("devuelve el proyecto si existe", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();

            const creado = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const obtenido = proyectoService.obtenerProyectoPorId(creado.id);
            expect(obtenido).toEqual(creado);
        });

        test("lanza un error si el proyecto no existe", () => {
            expect(() => proyectoService.obtenerProyectoPorId("id-inexistente")).toThrow("No se encontró el proyecto con ID 'id-inexistente'");
        });
    });

    describe("anotarColaborador", () => {
        test("anota a un colaborador existente por ID si posee la habilidad requerida", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba({ codigo: "python" });
            const persona = crearPersonaColaboradoraDePrueba({
                habilidades: [habilidad]
            });

            const proyecto = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const colaboracion = proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: persona.id
            });

            expect(colaboracion).toBeDefined();
            expect(colaboracion.proyecto).toBe(proyecto);
            expect(colaboracion.personaColaboradora).toBe(persona);

            // Verifica que se guardó en el proyecto y en la persona
            expect(proyecto.colaboraciones).toContain(colaboracion);
            expect(persona.colaboraciones).toContain(colaboracion);
        });

        test("lanza un error si el proyecto a anotar no existe", () => {
            const persona = crearPersonaColaboradoraDePrueba();
            expect(() => proyectoService.anotarColaborador("id-invalido", {
                personaColaboradoraId: persona.id
            })).toThrow("No se encontró el proyecto con ID 'id-invalido'");
        });

        test("lanza un error si no se pasa colaborador ni ID de colaborador", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();
            const proyecto = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            expect(() => proyectoService.anotarColaborador(proyecto.id, {})).toThrow("Debe indicar una persona colaboradora para anotar en el proyecto");
        });

        test("lanza un error si el personaColaboradoraId no existe", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();
            const proyecto = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            expect(() => proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: "id-inexistente"
            })).toThrow("No se encontró la persona colaboradora con ID 'id-inexistente'");
        });

        test("lanza un error si el colaborador no cumple con las habilidades requeridas", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidadProyecto = crearHabilidadDePrueba({ codigo: "rust" });
            const persona = crearPersonaColaboradoraDePrueba({ habilidades: [] });

            const proyecto = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidadProyecto]
            }));

            expect(() => proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: persona.id
            })).toThrow("El colaborador no cuenta con las habilidades requeridas para este proyecto");
        });

        test("lanza un error si el proyecto ya está cerrado", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();
            const persona = crearPersonaColaboradoraDePrueba({ habilidades: [habilidad] });

            const proyecto = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            proyectoService.cerrarProyecto(proyecto.id);

            expect(() => proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: persona.id
            })).toThrow("No se pueden agregar colaboraciones a un proyecto cerrado");
        });
    });

    describe("cerrarProyecto", () => {
        test("cierra un proyecto publicado y actualiza su estado y fecha de cierre", () => {
            const colectivo = crearColectivoDePrueba();
            const habilidad = crearHabilidadDePrueba();

            const proyecto = proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const proyectoCerrado = proyectoService.cerrarProyecto(proyecto.id);

            expect(proyectoCerrado.estado).toBe(EstadoProyecto.CERRADO);
            expect(proyectoCerrado.fechaCierre).toBeInstanceOf(Date);

            // Verifica persistencia
            const guardado = ProyectoRepository.buscarPorId(proyecto.id);
            expect(guardado.estado).toBe(EstadoProyecto.CERRADO);
        });

        test("lanza un error si se intenta cerrar un proyecto inexistente", () => {
            expect(() => proyectoService.cerrarProyecto("id-inexistente")).toThrow("No se encontró el proyecto con ID 'id-inexistente'");
        });
    });
});
