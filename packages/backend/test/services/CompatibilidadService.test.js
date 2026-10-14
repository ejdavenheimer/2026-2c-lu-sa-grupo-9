import { CompatibilidadService } from "../../src/services/CompatibilidadService.js";
import { ProyectoRepository } from "../../src/repositories/ProyectoRepository.js";
import { PersonaColaboradoraRepository } from "../../src/repositories/PersonaColaboradoraRepository.js";
import { ColectivoRepository } from "../../src/repositories/ColectivoRepository.js";
import { Proyecto } from "../../src/domain/Proyecto.js";
import { Colectivo } from "../../src/domain/Colectivo.js";
import { PersonaColaboradora } from "../../src/domain/PersonaColaboradora.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../../src/domain/enums.js";
import { NotFoundError } from "../../src/errors/AppError.js";

const habilidad = (codigo) => ({ codigo, titulo: codigo, descripcion: "desc" });

const perfilCon = (nombre, { requeridas = [], opcionales = [] } = {}) => ({
    nombre,
    descripcion: nombre,
    habilidadesRequeridas: requeridas.map(habilidad),
    habilidadesOpcionales: opcionales.map(habilidad),
    unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
    cantidadHoras: 10,
    modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
});

describe("CompatibilidadService", () => {
    let service;
    let colectivo;

    const crearProyecto = (titulo, ...perfiles) =>
        ProyectoRepository.guardar(new Proyecto({
            titulo,
            descripcion: "desc",
            colectivo,
            perfiles
        }));

    const crearPersona = (nombreFantasia, ...codigos) =>
        PersonaColaboradoraRepository.guardar(new PersonaColaboradora({
            nombreFantasia,
            habilidades: codigos.map(habilidad)
        }));

    beforeEach(() => {
        ProyectoRepository.limpiar();
        PersonaColaboradoraRepository.limpiar();
        ColectivoRepository.limpiar();

        service = new CompatibilidadService({
            proyectoRepository: ProyectoRepository,
            personaColaboradoraRepository: PersonaColaboradoraRepository
        });

        colectivo = ColectivoRepository.guardar(new Colectivo({
            nombre: "Colectivo Comunitario",
            descripcion: "Org social",
            tipo: "ONG"
        }));
    });

    describe("buscarColaboradoresCompatibles (HU08)", () => {
        test("falla con 404 si no existe el proyecto", async () => {
            await expect(service.buscarColaboradoresCompatibles("proy-9", "perf-1"))
                .rejects.toThrow(NotFoundError);
        });

        test("falla con 404 si el perfil no pertenece al proyecto", async () => {
            const proyecto = crearProyecto("Portal", perfilCon("Frontend", { requeridas: ["react"] }));

            await expect(service.buscarColaboradoresCompatibles(proyecto.id, "perf-inexistente"))
                .rejects.toThrow("No se encontró el perfil con ID 'perf-inexistente'");
        });

        test("devuelve sólo a quienes cumplen todas las requeridas, ordenados por puntaje", async () => {
            const proyecto = crearProyecto(
                "Portal",
                perfilCon("Fullstack", { requeridas: ["react", "node"], opcionales: ["docker"] })
            );
            const [perfil] = proyecto.perfiles;

            crearPersona("Beto", "react", "node");
            crearPersona("Ana", "react", "node", "docker");
            crearPersona("Cris", "react");

            const resultados = await service.buscarColaboradoresCompatibles(proyecto.id, perfil.id);

            expect(resultados.map((r) => r.personaColaboradora.nombreFantasia)).toEqual(["Ana", "Beto"]);
            expect(resultados.map((r) => r.compatibilidad.puntaje)).toEqual([100, 70]);
        });

        test("con estricto en false incluye a quien cumple alguna requerida", async () => {
            const proyecto = crearProyecto(
                "Portal",
                perfilCon("Fullstack", { requeridas: ["react", "node"] })
            );
            const [perfil] = proyecto.perfiles;

            crearPersona("Beto", "react", "node");
            crearPersona("Cris", "react");

            const resultados = await service.buscarColaboradoresCompatibles(
                proyecto.id,
                perfil.id,
                { estricto: false }
            );

            expect(resultados.map((r) => r.personaColaboradora.nombreFantasia)).toEqual(["Beto", "Cris"]);
        });

        test("no deja pasar a un candidato con más puntaje que no cumple todas las requeridas", async () => {
            const proyecto = crearProyecto("Portal", perfilCon("Analista", {
                requeridas: ["r1", "r2", "r3", "r4", "r5"],
                opcionales: ["extra"]
            }));
            const [perfil] = proyecto.perfiles;

            crearPersona("Incompleta", "r1", "r2", "r3", "r4", "extra");
            crearPersona("Completa", "r1", "r2", "r3", "r4", "r5");

            const estrictos = await service.buscarColaboradoresCompatibles(proyecto.id, perfil.id);

            expect(estrictos.map((r) => r.personaColaboradora.nombreFantasia)).toEqual(["Completa"]);
            expect(estrictos[0].compatibilidad.puntaje).toBe(70);

            const laxos = await service.buscarColaboradoresCompatibles(
                proyecto.id,
                perfil.id,
                { estricto: false }
            );

            expect(laxos.map((r) => r.compatibilidad.puntaje)).toEqual([86, 70]);
            expect(laxos[0].compatibilidad.esCompatible).toBe(false);
        });

        test("respeta el límite de resultados", async () => {
            const proyecto = crearProyecto("Portal", perfilCon("Frontend", { requeridas: ["react"] }));
            const [perfil] = proyecto.perfiles;

            crearPersona("Ana", "react");
            crearPersona("Beto", "react");
            crearPersona("Cris", "react");

            const resultados = await service.buscarColaboradoresCompatibles(
                proyecto.id,
                perfil.id,
                { limite: 2 }
            );

            expect(resultados.length).toBe(2);
        });

        test("devuelve lista vacía si no hay candidatos, no un 404", async () => {
            const proyecto = crearProyecto("Portal", perfilCon("Cobolera", { requeridas: ["cobol"] }));
            const [perfil] = proyecto.perfiles;

            crearPersona("Ana", "react");

            await expect(service.buscarColaboradoresCompatibles(proyecto.id, perfil.id))
                .resolves.toEqual([]);
        });

        test("no expone el historial de colaboraciones del candidato", async () => {
            const proyecto = crearProyecto("Portal", perfilCon("Frontend", { requeridas: ["react"] }));
            const [perfil] = proyecto.perfiles;
            crearPersona("Ana", "react");

            const [resultado] = await service.buscarColaboradoresCompatibles(proyecto.id, perfil.id);

            expect(resultado.personaColaboradora.colaboraciones).toBeUndefined();
            expect(Object.keys(resultado.personaColaboradora)).toEqual([
                "id", "nombreFantasia", "nombre", "apellido", "pronombres", "presentacion", "habilidades"
            ]);
        });
    });

    describe("buscarProyectosCompatibles (HU09)", () => {
        test("falla con 404 si no existe la persona colaboradora", async () => {
            await expect(service.buscarProyectosCompatibles("colab-9"))
                .rejects.toThrow(NotFoundError);
        });

        test("devuelve el par proyecto y perfil que matcheó", async () => {
            const portal = crearProyecto("Portal", perfilCon("Frontend", { requeridas: ["react"] }));
            const persona = crearPersona("Ana", "react");

            const [resultado] = await service.buscarProyectosCompatibles(persona.id);

            expect(resultado.proyecto.id).toBe(portal.id);
            expect(resultado.proyecto.colectivo.nombre).toBe("Colectivo Comunitario");
            expect(resultado.perfil.nombre).toBe("Frontend");
            expect(resultado.perfil.cantidadHoras).toBe(10);
            expect(resultado.compatibilidad.esCompatible).toBe(true);
        });

        test("un proyecto con dos perfiles compatibles devuelve dos propuestas distintas", async () => {
            const app = crearProyecto(
                "App",
                perfilCon("Backend", { requeridas: ["node"] }),
                perfilCon("Mobile", { requeridas: ["react"] })
            );
            const persona = crearPersona("Ana", "react", "node");

            const resultados = await service.buscarProyectosCompatibles(persona.id);

            expect(resultados.length).toBe(2);
            expect(resultados.every((r) => r.proyecto.id === app.id)).toBe(true);
            expect(resultados.map((r) => r.perfil.nombre).sort()).toEqual(["Backend", "Mobile"]);
        });

        test("excluye los proyectos cerrados: no tiene sentido ofrecerlos", async () => {
            const cerrado = crearProyecto("Cerrado", perfilCon("Frontend", { requeridas: ["react"] }));
            cerrado.cerrarProyecto();
            crearProyecto("Abierto", perfilCon("Frontend", { requeridas: ["react"] }));

            const persona = crearPersona("Ana", "react");

            const resultados = await service.buscarProyectosCompatibles(persona.id);

            expect(resultados.map((r) => r.proyecto.titulo)).toEqual(["Abierto"]);
        });

        test("por defecto es laxo: muestra también proyectos donde le falta alguna habilidad", async () => {
            crearProyecto("Portal", perfilCon("Fullstack", { requeridas: ["react", "node"] }));
            const persona = crearPersona("Ana", "react");

            const resultados = await service.buscarProyectosCompatibles(persona.id);

            expect(resultados.length).toBe(1);
            expect(resultados[0].compatibilidad.esCompatible).toBe(false);
            expect(resultados[0].compatibilidad.requeridasFaltantes.map((h) => h.codigo)).toEqual(["node"]);
        });

        test("con estricto en true deja sólo los perfiles que puede cubrir por completo", async () => {
            crearProyecto(
                "Portal",
                perfilCon("Fullstack", { requeridas: ["react", "node"] }),
                perfilCon("Frontend", { requeridas: ["react"] })
            );
            const persona = crearPersona("Ana", "react");

            const resultados = await service.buscarProyectosCompatibles(persona.id, { estricto: true });

            expect(resultados.map((r) => r.perfil.nombre)).toEqual(["Frontend"]);
        });

        test("devuelve lista vacía si la persona no tiene habilidades", async () => {
            crearProyecto("Portal", perfilCon("Frontend", { requeridas: ["react"] }));
            const persona = crearPersona("Ana");

            await expect(service.buscarProyectosCompatibles(persona.id)).resolves.toEqual([]);
        });
    });
});
