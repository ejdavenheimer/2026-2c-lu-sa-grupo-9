import { PersonaColaboradoraRepository } from "../../src/repositories/PersonaColaboradoraRepository.js";
import { PersonaColaboradora } from "../../src/domain/PersonaColaboradora.js";

const guardarPersona = (nombreFantasia, ...codigos) =>
    PersonaColaboradoraRepository.guardar(
        new PersonaColaboradora({
            nombreFantasia,
            habilidades: codigos.map((codigo) => ({ codigo, titulo: codigo }))
        })
    );

describe("PersonaColaboradoraRepository.buscarPorHabilidades", () => {
    beforeEach(() => {
        PersonaColaboradoraRepository.limpiar();
    });

    test("devuelve lista vacía si no se le pasan códigos", async () => {
        guardarPersona("Ana", "react");

        expect(await PersonaColaboradoraRepository.buscarPorHabilidades([])).toEqual([]);
        expect(await PersonaColaboradoraRepository.buscarPorHabilidades()).toEqual([]);
    });

    test("devuelve a quienes tienen al menos una de las habilidades pedidas", async () => {
        const ana = guardarPersona("Ana", "react", "node");
        guardarPersona("Beto", "python");
        const cris = guardarPersona("Cris", "node");

        const encontradas = await PersonaColaboradoraRepository.buscarPorHabilidades(["node"]);

        expect(encontradas).toEqual([ana, cris]);
    });

    test("no exige tener todas: acota el conjunto, no decide compatibilidad", async () => {
        const ana = guardarPersona("Ana", "react");

        const encontradas = await PersonaColaboradoraRepository.buscarPorHabilidades(["react", "node"]);

        expect(encontradas).toEqual([ana]);
    });

    test("devuelve lista vacía si nadie tiene esas habilidades", async () => {
        guardarPersona("Ana", "react");

        expect(await PersonaColaboradoraRepository.buscarPorHabilidades(["cobol"])).toEqual([]);
    });

    test("devuelve instancias de dominio, que es lo que el dominio necesita para evaluar", async () => {
        guardarPersona("Ana", "react");

        const [persona] = await PersonaColaboradoraRepository.buscarPorHabilidades(["react"]);

        expect(persona).toBeInstanceOf(PersonaColaboradora);
        expect(typeof persona.tieneHabilidad).toBe("function");
    });
});
