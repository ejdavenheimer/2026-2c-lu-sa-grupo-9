import { PersonaColaboradora } from "../../src/domain/PersonaColaboradora.js";

function crearPersonaColaboradoraDePrueba(overrides = {}) {
    return new PersonaColaboradora({
        nombreFantasia: "Persona Test",
        ...overrides
    });
}

describe("PersonaColaboradora", () => {
    test("se crea correctamente si tiene nombreFantasia", () => {
        const persona = crearPersonaColaboradoraDePrueba();
        expect(persona.nombreFantasia).toBe("Persona Test");
    });

    test("se crea correctamente si tiene nombre y apellido, sin nombreFantasia", () => {
        const persona = crearPersonaColaboradoraDePrueba({nombreFantasia: undefined, nombre: "Juan", apellido: "Pérez" });
        expect(persona.nombre).toBe("Juan");
        expect(persona.apellido).toBe("Pérez");
    });

    test("se crea correctamente si tiene al menos una cuenta, sin nombreFantasia ni nombre/apellido", () => {
        const persona = crearPersonaColaboradoraDePrueba({ nombreFantasia: undefined, cuentas: ["cuenta1"] });
        expect(persona.cuentas).toEqual(["cuenta1"]);
    });

    test("lanza un error si no tiene nombreFantasia, ni nombre y apellido, ni cuentas", () => {
        expect(() => crearPersonaColaboradoraDePrueba({ nombreFantasia: undefined, nombre: undefined, apellido: undefined, cuentas: [] })).toThrowError('La persona colaboradora debe poseer al menos un nombre de fantasia o nombre y apellido');
    });

    test("lanza un error si tiene nombre pero no apellido (y nada más)", () => {
        expect(() => crearPersonaColaboradoraDePrueba({ nombreFantasia: undefined, nombre: "Juan", apellido: undefined, cuentas: [] })).toThrowError('La persona colaboradora debe poseer al menos un nombre de fantasia o nombre y apellido');
    });

    test("los pronombres quedan sin duplicados, sin espacios y sin vacíos", () => {
        const persona = crearPersonaColaboradoraDePrueba({ pronombres: ["el", "ella", "el", " ", ""] });
        expect(persona.pronombres).toEqual(["el", "ella"]);
    });

    test("agregarHabilidad agrega una habilidad nueva a la lista", () => {
        const persona = crearPersonaColaboradoraDePrueba();
        const habilidad = { codigo: "habilidad1" };
        persona.agregarHabilidad(habilidad);
        expect(persona.habilidades.length).toBe(1);
        expect(persona.habilidades[0]).toBe(habilidad);
    });

    test("agregarHabilidad lanza un error si ya existe una habilidad con el mismo código", () => {
        const persona = crearPersonaColaboradoraDePrueba();
        const habilidad1 = { codigo: "habilidad1" };
        const habilidad2 = { codigo: "habilidad1" };
        persona.agregarHabilidad(habilidad1);
        expect(() => persona.agregarHabilidad(habilidad2)).toThrow("ya fue agregada a esta persona colaboradora");
        expect(persona.habilidades.length).toBe(1);
    });

    test("agregarHabilidad lanza un error si no se le pasa una habilidad", () => {
        const persona = crearPersonaColaboradoraDePrueba();
        expect(() => persona.agregarHabilidad()).toThrowError("Debe proporcionar una habilidad para agregar");
    });

    test("agregarColaboracion agrega una colaboración a la lista", () => {
        const persona = crearPersonaColaboradoraDePrueba();
        const colaboracion = { proyecto: "Proyecto Test" };
        persona.agregarColaboracion(colaboracion);
        expect(persona.colaboraciones.length).toBe(1);
        expect(persona.colaboraciones[0]).toBe(colaboracion);
    });

    test("agregarColaboracion lanza un error si no se le pasa una colaboración", () => {
        const persona = crearPersonaColaboradoraDePrueba();
        expect(() => persona.agregarColaboracion()).toThrowError("Debe proporcionar una colaboracion para agregar");
    });
});
