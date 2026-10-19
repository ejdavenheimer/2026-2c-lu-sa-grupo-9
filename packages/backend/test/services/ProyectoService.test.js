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

async function crearColectivoDePrueba(overrides = {}) {
    return await ColectivoRepository.guardar(new Colectivo({
        nombre: "Colectivo Comunitario",
        descripcion: "Colectivo de ayuda social",
        tipo: "ONG",
        ...overrides
    }));
}

async function crearHabilidadDePrueba(overrides = {}) {
    return await HabilidadRepository.guardar(new Habilidad({
        titulo: "Desarrollo Web Node",
        codigo: "node_js",
        descripcion: "Backend en Node",
        ...overrides
    }));
}

async function crearPersonaColaboradoraDePrueba(overrides = {}) {
    return await PersonaColaboradoraRepository.guardar(new PersonaColaboradora({
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
        test("crea y guarda un proyecto pasando objetos de dominio directamente", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            const datos = datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            });

            const proyectoCreado = await proyectoService.crearProyecto(datos);

            expect(proyectoCreado).toHaveProperty("id");
            expect(proyectoCreado.titulo).toBe(datos.titulo);
            expect(proyectoCreado.estado).toBe(EstadoProyecto.PUBLICADO);
            expect(proyectoCreado.colectivo).toBe(colectivo);
            expect(proyectoCreado.habilidadesRequeridas).toContainEqual(habilidad);

            // Verifica que se haya agregado a la lista de proyectos del colectivo
            expect(colectivo.proyectos).toContain(proyectoCreado);

            // Verifica persistencia en el repositorio
            const guardado = await ProyectoRepository.buscarPorId(proyectoCreado.id);
            expect(guardado).toEqual(proyectoCreado);
        });

        test("crea y guarda un proyecto resolviendo colectivoId y habilidadesRequeridasCodigos", async () => {
            const colectivo = await crearColectivoDePrueba();
            await crearHabilidadDePrueba({ codigo: "react_native", titulo: "React Native" });

            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridasCodigos: ["react_native"]
            });

            const proyectoCreado = await proyectoService.crearProyecto(datos);

            expect(proyectoCreado.id).toBeDefined();
            expect(proyectoCreado.colectivo.id).toBe(colectivo.id);
            expect(proyectoCreado.habilidadesRequeridas).toEqual(
                expect.arrayContaining([expect.objectContaining({ codigo: "react_native" })])
            );
        });

        test("convierte una modalidad única (string) a un array", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridasCodigos: [habilidad.codigo],
                modalidadesColaboracion: "PAGA"
            });

            const proyectoCreado = await proyectoService.crearProyecto(datos);
            expect(proyectoCreado.modalidadesColaboracion).toEqual(["PAGA"]);
        });

        test("lanza un error si no se indica colectivo ni colectivoId", async () => {
            const habilidad = await crearHabilidadDePrueba();
            const datos = datosProyectoDePrueba({
                habilidadesRequeridas: [habilidad]
            });

            await expect(proyectoService.crearProyecto(datos)).rejects.toThrow("El proyecto requiere un colectivo asociado");
        });

        test("lanza un error si el colectivoId no existe", async () => {
            const habilidad = await crearHabilidadDePrueba();
            const datos = datosProyectoDePrueba({
                colectivoId: "id-inexistente",
                habilidadesRequeridas: [habilidad]
            });

            await expect(proyectoService.crearProyecto(datos)).rejects.toThrow("No se encontró el colectivo con ID 'id-inexistente'");
        });

        test("lanza un error si no se indican habilidades requeridas", async () => {
            const colectivo = await crearColectivoDePrueba();
            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridas: [],
                habilidadesRequeridasCodigos: []
            });

            await expect(proyectoService.crearProyecto(datos)).rejects.toThrow("El proyecto requiere al menos una habilidad requerida");
        });

        test("lanza un error si un código en habilidadesRequeridasCodigos no existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const datos = datosProyectoDePrueba({
                colectivoId: colectivo.id,
                habilidadesRequeridasCodigos: ["codigo_fantasma"]
            });

            await expect(proyectoService.crearProyecto(datos)).rejects.toThrow("No se encontró la habilidad requerida con código 'codigo_fantasma'");
        });

        test("lanza un error si ya existe un proyecto con el mismo título en el colectivo", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

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

            await proyectoService.crearProyecto(datos1);
            await expect(proyectoService.crearProyecto(datos2)).rejects.toThrow("El proyecto 'Proyecto Único' ya existe en el colectivo");
        });
    });

    describe("obtenerProyectos", () => {
        test("devuelve un array vacío si no hay proyectos", async () => {
            const proyectos = await proyectoService.obtenerProyectos();
            expect(proyectos).toEqual([]);
        });

        test("devuelve todos los proyectos guardados", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            await proyectoService.crearProyecto(datosProyectoDePrueba({
                titulo: "Proyecto 1",
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            await proyectoService.crearProyecto(datosProyectoDePrueba({
                titulo: "Proyecto 2",
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const proyectos = await proyectoService.obtenerProyectos();
            expect(proyectos).toHaveLength(2);
            expect(proyectos.map((p) => p.titulo)).toEqual(["Proyecto 1", "Proyecto 2"]);
        });
    });

    describe("obtenerProyectoPorId", () => {
        test("devuelve el proyecto si existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            const creado = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const obtenido = await proyectoService.obtenerProyectoPorId(creado.id);
            expect(obtenido).toEqual(creado);
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.obtenerProyectoPorId("id-inexistente")).rejects.toThrow("No se encontró el proyecto con ID 'id-inexistente'");
        });
    });

    describe("anotarColaborador", () => {
        test("anota a un colaborador existente por ID si posee la habilidad requerida", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba({ codigo: "python" });
            const persona = await crearPersonaColaboradoraDePrueba({
                habilidades: [habilidad]
            });

            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const colaboracion = await proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: persona.id
            });

            expect(colaboracion).toBeDefined();
            expect(colaboracion.proyecto).toBe(proyecto);
            expect(colaboracion.personaColaboradora).toBe(persona);

            // Verifica que se guardó en el proyecto y en la persona
            expect(proyecto.colaboraciones).toContain(colaboracion);
            expect(persona.colaboraciones).toContain(colaboracion);
        });

        test("lanza un error si el proyecto a anotar no existe", async () => {
            const persona = await crearPersonaColaboradoraDePrueba();
            await expect(proyectoService.anotarColaborador("id-invalido", {
                personaColaboradoraId: persona.id
            })).rejects.toThrow("No se encontró el proyecto con ID 'id-invalido'");
        });

        test("lanza un error si no se pasa colaborador ni ID de colaborador", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            await expect(proyectoService.anotarColaborador(proyecto.id, {})).rejects.toThrow("Debe indicar una persona colaboradora para anotar en el proyecto");
        });

        test("lanza un error si el personaColaboradoraId no existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            await expect(proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: "id-inexistente"
            })).rejects.toThrow("No se encontró la persona colaboradora con ID 'id-inexistente'");
        });

        test("lanza un error si el colaborador no cumple con las habilidades requeridas", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidadProyecto = await crearHabilidadDePrueba({ codigo: "rust" });
            const persona = await crearPersonaColaboradoraDePrueba({ habilidades: [] });

            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidadProyecto]
            }));

            await expect(proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: persona.id
            })).rejects.toThrow("El colaborador no cuenta con las habilidades requeridas para este proyecto");
        });

        test("lanza un error si el proyecto ya está cerrado", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const persona = await crearPersonaColaboradoraDePrueba({ habilidades: [habilidad] });

            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            await proyectoService.cerrarProyecto(proyecto.id);

            await expect(proyectoService.anotarColaborador(proyecto.id, {
                personaColaboradoraId: persona.id
            })).rejects.toThrow("No se pueden agregar colaboraciones a un proyecto cerrado");
        });
    });

    describe("cerrarProyecto", () => {
        test("cierra un proyecto publicado y actualiza su estado y fecha de cierre", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const proyectoCerrado = await proyectoService.cerrarProyecto(proyecto.id);

            expect(proyectoCerrado.estado).toBe(EstadoProyecto.CERRADO);
            expect(proyectoCerrado.fechaCierre).toBeInstanceOf(Date);

            // Verifica persistencia
            const guardado = await ProyectoRepository.buscarPorId(proyecto.id);
            expect(guardado.estado).toBe(EstadoProyecto.CERRADO);
        });

        test("lanza un error si se intenta cerrar un proyecto inexistente", async () => {
            await expect(proyectoService.cerrarProyecto("id-inexistente")).rejects.toThrow("No se encontró el proyecto con ID 'id-inexistente'");
        });
    });

    describe("actualizarProyecto", () => {
        test("actualiza los datos de un proyecto", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const actualizado = await proyectoService.actualizarProyecto(proyecto.id, {
                titulo: "Nuevo Titulo",
                cantidadHoras: 30
            });

            expect(actualizado.titulo).toBe("Nuevo Titulo");
            expect(actualizado.cantidadHoras).toBe(30);
        });
    });

    describe("eliminarProyecto", () => {
        test("elimina un proyecto existente", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();

            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));

            const eliminado = await proyectoService.eliminarProyecto(proyecto.id);
            expect(eliminado).toBe(true);
            await expect(proyectoService.obtenerProyectoPorId(proyecto.id)).rejects.toThrow();
        });
    });

    describe("registrarHito", () => {
        test("registra un hito, lo persiste y lo devuelve", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const hito = await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 50, descripcion: "Primer hito" });
            expect(hito.porcentajeConcrecion).toBe(50);
            expect(hito.descripcion).toBe("Primer hito");
            expect(proyecto.hitos).toContain(hito);
            const proyectoGuardado = await ProyectoRepository.buscarPorId(proyecto.id);
            expect(proyectoGuardado.hitos).toContainEqual(expect.objectContaining({ id: hito.id }));
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.registrarHito("id-inexistente", { porcentajeConcrecion: 50, descripcion: "Hito" })).rejects.toThrow("No se encontró el proyecto con ID 'id-inexistente'");
        });

        test("lanza un error si el porcentaje no es mayor al del último hito", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 50, descripcion: "Primer hito" });
            await expect(proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 40, descripcion: "Segundo hito" })).rejects.toThrow("El porcentaje de concreción debe ser mayor al del último hito registrado");
        });
    });

    describe("obtenerHitos", () => {
        test("devuelve un array vacío si el proyecto no tiene hitos", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const hitos = await proyectoService.obtenerHitos(proyecto.id);
            expect(hitos).toEqual([]);
        });

        test("devuelve todos los hitos del proyecto", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const hito1 = await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 50, descripcion: "Primer hito" });
            const hito2 = await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 70, descripcion: "Segundo hito" });
            const hitos = await proyectoService.obtenerHitos(proyecto.id);
            expect(hitos).toEqual([hito1, hito2]);
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.obtenerHitos("id-inexistente")).rejects.toThrow("No se encontró el proyecto con ID 'id-inexistente'");
        });
    });

    describe("obtenerHitoPorId", () => {
        test("devuelve el hito si existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const hito = await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 50, descripcion: "Primer hito" });
            const obtenido = await proyectoService.obtenerHitoPorId(proyecto.id, hito.id);
            expect(obtenido).toEqual(hito);
        });

        test("lanza un error si el hito no existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            await expect(proyectoService.obtenerHitoPorId(proyecto.id, "hito-inexistente")).rejects.toThrow("Hito con id hito-inexistente no encontrado");
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.obtenerHitoPorId("proyecto-inexistente", "hito-inexistente")).rejects.toThrow("No se encontró el proyecto con ID 'proyecto-inexistente'");
        });
    });

    describe("actualizarHito", () => {
        test("actualiza el hito y lo persiste", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const hito = await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 50, descripcion: "Primer hito" });
            const hitoActualizado = await proyectoService.actualizarHito(proyecto.id, hito.id, { porcentajeConcrecion: 60, descripcion: "Hito actualizado" });
            const proyectoGuardado = await ProyectoRepository.buscarPorId(proyecto.id);
            const hitoGuardado = proyectoGuardado.hitos.find(h => h.id === hito.id);
            expect(hitoActualizado.porcentajeConcrecion).toBe(60);
            expect(hitoActualizado.descripcion).toBe("Hito actualizado");
            expect(hitoGuardado.porcentajeConcrecion).toBe(60);
            expect(hitoGuardado.descripcion).toBe("Hito actualizado");
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.actualizarHito("proyecto-inexistente", "hito-inexistente", { porcentajeConcrecion: 60, descripcion: "Hito actualizado" })).rejects.toThrow("No se encontró el proyecto con ID 'proyecto-inexistente'");
        });

        test("lanza un error si el hito no existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            await expect(proyectoService.actualizarHito(proyecto.id, "hito-inexistente", { porcentajeConcrecion: 60, descripcion: "Hito actualizado" })).rejects.toThrow("Hito con id hito-inexistente no encontrado");
        });
    });

    describe("eliminarHito", () => {
        test("elimina el hito y lo persiste", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const hito = await proyectoService.registrarHito(proyecto.id, { porcentajeConcrecion: 50, descripcion: "Primer hito" });
            await proyectoService.eliminarHito(proyecto.id, hito.id);
            const proyectoGuardado = await ProyectoRepository.buscarPorId(proyecto.id);
            expect(proyectoGuardado.hitos).not.toContainEqual(expect.objectContaining({ id: hito.id }));
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.eliminarHito("proyecto-inexistente", "hito-inexistente")).rejects.toThrow("No se encontró el proyecto con ID 'proyecto-inexistente'");
        });

        test("lanza un error si el hito no existe", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            await expect(proyectoService.eliminarHito(proyecto.id, "hito-inexistente")).rejects.toThrow("Hito con id hito-inexistente no encontrado");
        });
    });

    describe("actualizarEnlaces", () => {
        test("actualiza los enlaces y los persiste", async () => {
            const colectivo = await crearColectivoDePrueba();
            const habilidad = await crearHabilidadDePrueba();
            const proyecto = await proyectoService.crearProyecto(datosProyectoDePrueba({
                colectivo,
                habilidadesRequeridas: [habilidad]
            }));
            const enlacesActualizados = {
                enlaceSistemaEnFuncionamiento: "https://nuevo-enlace.com",
                enlaceCodigoFuente: "https://nuevo-enlace-codigo.com"
            };
            await proyectoService.actualizarEnlaces(proyecto.id, enlacesActualizados);
            const proyectoGuardado = await ProyectoRepository.buscarPorId(proyecto.id);
            expect(proyectoGuardado.enlaceSistemaEnFuncionamiento).toBe(enlacesActualizados.enlaceSistemaEnFuncionamiento);
            expect(proyectoGuardado.enlaceCodigoFuente).toBe(enlacesActualizados.enlaceCodigoFuente);
        });

        test("lanza un error si el proyecto no existe", async () => {
            await expect(proyectoService.actualizarEnlaces("proyecto-inexistente", { enlaceSistemaEnFuncionamiento: "https://nuevo-enlace.com" })).rejects.toThrow("No se encontró el proyecto con ID 'proyecto-inexistente'");
        });
    });
});
