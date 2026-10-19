import { PersonaColaboradoraService } from "../../src/services/PersonaColaboradoraService.js";
import { PersonaColaboradoraRepository } from "../../src/repositories/PersonaColaboradoraRepository.js";

function datosPersonaColaboradoraDePrueba(overrides = {}) {
    return {
        nombreFantasia: "Persona Test",
        ...overrides
    };
}

describe("PersonaColaboradoraService", () => {
    let personaColaboradoraService;

    beforeEach(() => {
        PersonaColaboradoraRepository.limpiar();
        personaColaboradoraService = new PersonaColaboradoraService();
    });

    test("crearPersonaColaboradora guarda y devuelve la persona con un id asignado", async () => {
        const personaColaboradora = datosPersonaColaboradoraDePrueba();
        const personaCreada = await personaColaboradoraService.crearPersonaColaboradora(personaColaboradora);
        expect(personaCreada).toHaveProperty("id");
        expect(personaCreada.nombreFantasia).toBe(personaColaboradora.nombreFantasia);
    });

    test("crearPersonaColaboradora propaga el error si no cumple ninguno de los requisitos del dominio", async () => {
        const personaColaboradora = datosPersonaColaboradoraDePrueba({ nombreFantasia: null });
        await expect(personaColaboradoraService.crearPersonaColaboradora(personaColaboradora)).rejects.toThrow("La persona colaboradora debe poseer al menos un nombre de fantasia o nombre y apellido");
    });

    test("crearPersonaColaboradora lanza un error si ya existe una persona con el mismo nombreFantasia", async () => {
        const personaColaboradora1 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona Test" });
        const personaColaboradora2 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona Test" });

        await personaColaboradoraService.crearPersonaColaboradora(personaColaboradora1);
        await expect(personaColaboradoraService.crearPersonaColaboradora(personaColaboradora2)).rejects.toThrow("Ya existe una persona colaboradora con el nombre de fantasía 'Persona Test'");

        const personas = await personaColaboradoraService.listarPersonasColaboradoras();
        expect(personas).toHaveLength(1);
    });

    test("listarPersonasColaboradoras devuelve una lista vacía si no hay personas guardadas", async () => {
        const personas = await personaColaboradoraService.listarPersonasColaboradoras();
        expect(personas).toEqual([]);
    });

    test("listarPersonasColaboradoras devuelve todas las personas guardadas", async () => {
        const persona1 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona 1" });
        const persona2 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona 2" });

        await personaColaboradoraService.crearPersonaColaboradora(persona1);
        await personaColaboradoraService.crearPersonaColaboradora(persona2);

        const personas = await personaColaboradoraService.listarPersonasColaboradoras();
        expect(personas).toHaveLength(2);
        expect(personas.map(p => p.nombreFantasia)).toEqual(expect.arrayContaining([persona1.nombreFantasia, persona2.nombreFantasia]));
    });

    test("obtenerPersonaColaboradoraPorId devuelve la persona si existe", async () => {
        const persona = datosPersonaColaboradoraDePrueba();
        const personaCreada = await personaColaboradoraService.crearPersonaColaboradora(persona);

        const personaObtenida = await personaColaboradoraService.obtenerPersonaColaboradoraPorId(personaCreada.id);
        expect(personaObtenida).toBeDefined();
        expect(personaObtenida.id).toBe(personaCreada.id);
    });

    test("obtenerPersonaColaboradoraPorId lanza un error si no existe", async () => {
        await expect(personaColaboradoraService.obtenerPersonaColaboradoraPorId("id-inexistente")).rejects.toThrow("Persona colaboradora no encontrada");
    });

    test("agregarHabilidad agrega la habilidad a una persona existente", async () => {
        const persona = datosPersonaColaboradoraDePrueba();
        const personaCreada = await personaColaboradoraService.crearPersonaColaboradora(persona);

        const habilidad = { titulo: "Habilidad Test", codigo: "habilidad_test", descripcion: "Descripción de prueba" };
        const personaActualizada = await personaColaboradoraService.agregarHabilidad(personaCreada.id, habilidad);

        expect(personaActualizada.habilidades).toContainEqual(habilidad);
    });

    test("agregarHabilidad lanza un error si la persona no existe", async () => {
        const habilidad = { titulo: "Habilidad Test", codigo: "habilidad_test", descripcion: "Descripción de prueba" };
        await expect(personaColaboradoraService.agregarHabilidad("id-inexistente", habilidad)).rejects.toThrow("Persona colaboradora no encontrada");
    });

    test("actualizarPersonaColaboradora modifica los datos del colaborador", async () => {
        const persona = datosPersonaColaboradoraDePrueba();
        const personaCreada = await personaColaboradoraService.crearPersonaColaboradora(persona);

        const actualizada = await personaColaboradoraService.actualizarPersonaColaboradora(personaCreada.id, {
            presentacion: "Nueva bio",
            nombreFantasia: "NuevoAlias"
        });

        expect(actualizada.presentacion).toBe("Nueva bio");
        expect(actualizada.nombreFantasia).toBe("NuevoAlias");
    });

    test("eliminarPersonaColaboradora borra la persona existente", async () => {
        const persona = datosPersonaColaboradoraDePrueba();
        const personaCreada = await personaColaboradoraService.crearPersonaColaboradora(persona);

        const eliminado = await personaColaboradoraService.eliminarPersonaColaboradora(personaCreada.id);
        expect(eliminado).toBe(true);
        await expect(personaColaboradoraService.obtenerPersonaColaboradoraPorId(personaCreada.id)).rejects.toThrow();
    });
});
