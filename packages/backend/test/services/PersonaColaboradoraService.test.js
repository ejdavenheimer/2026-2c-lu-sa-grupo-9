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

    test("crearPersonaColaboradora guarda y devuelve la persona con un id asignado", () => {
        const personaColaboradora = datosPersonaColaboradoraDePrueba();
        const personaCreada = personaColaboradoraService.crearPersonaColaboradora(personaColaboradora);
        expect(personaCreada).toHaveProperty("id");
        expect(personaCreada.nombreFantasia).toBe(personaColaboradora.nombreFantasia);
    });

    test("crearPersonaColaboradora propaga el error si no cumple ninguno de los requisitos del dominio", () => {
        const personaColaboradora = datosPersonaColaboradoraDePrueba({ nombreFantasia: null });
        expect(() => personaColaboradoraService.crearPersonaColaboradora(personaColaboradora)).toThrow("La persona colaboradora debe poseer al menos un nombre de fantasia o nombre y apellido");
    });

    test("crearPersonaColaboradora lanza un error si ya existe una persona con el mismo nombreFantasia", () => {
        const personaColaboradora1 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona Test" });
        const personaColaboradora2 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona Test" });

        personaColaboradoraService.crearPersonaColaboradora(personaColaboradora1);
        expect(() => personaColaboradoraService.crearPersonaColaboradora(personaColaboradora2)).toThrow("Ya existe una persona colaboradora con el nombre de fantasía 'Persona Test'");

        const personas = personaColaboradoraService.listarPersonasColaboradoras();
        expect(personas).toHaveLength(1);
    });

    test("listarPersonasColaboradoras devuelve una lista vacía si no hay personas guardadas", () => {
        const personas = personaColaboradoraService.listarPersonasColaboradoras();
        expect(personas).toEqual([]);
    });

    test("listarPersonasColaboradoras devuelve todas las personas guardadas", () => {
        const persona1 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona 1" });
        const persona2 = datosPersonaColaboradoraDePrueba({ nombreFantasia: "Persona 2" });

        personaColaboradoraService.crearPersonaColaboradora(persona1);
        personaColaboradoraService.crearPersonaColaboradora(persona2);

        const personas = personaColaboradoraService.listarPersonasColaboradoras();
        expect(personas).toHaveLength(2);
        expect(personas.map(p => p.nombreFantasia)).toEqual(expect.arrayContaining([persona1.nombreFantasia, persona2.nombreFantasia]));
    });

    test("obtenerPersonaColaboradoraPorId devuelve la persona si existe", () => {
        const persona = datosPersonaColaboradoraDePrueba();
        const personaCreada = personaColaboradoraService.crearPersonaColaboradora(persona);

        const personaObtenida = personaColaboradoraService.obtenerPersonaColaboradoraPorId(personaCreada.id);
        expect(personaObtenida).toBeDefined();
        expect(personaObtenida.id).toBe(personaCreada.id);
    });

    test("obtenerPersonaColaboradoraPorId lanza un error si no existe", () => {
        expect(() => personaColaboradoraService.obtenerPersonaColaboradoraPorId("id-inexistente")).toThrow("Persona colaboradora no encontrada");
    });

    test("agregarHabilidad agrega la habilidad a una persona existente", () => {
        const persona = datosPersonaColaboradoraDePrueba();
        const personaCreada = personaColaboradoraService.crearPersonaColaboradora(persona);

        const habilidad = { titulo: "Habilidad Test", codigo: "habilidad_test", descripcion: "Descripción de prueba" };
        const personaActualizada = personaColaboradoraService.agregarHabilidad(personaCreada.id, habilidad);

        expect(personaActualizada.habilidades).toContainEqual(habilidad);
    });

    test("agregarHabilidad lanza un error si la persona no existe", () => {
        const habilidad = { titulo: "Habilidad Test", codigo: "habilidad_test", descripcion: "Descripción de prueba" };
        expect(() => personaColaboradoraService.agregarHabilidad("id-inexistente", habilidad)).toThrow("Persona colaboradora no encontrada");
    });
});
