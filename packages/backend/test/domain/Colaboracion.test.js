import { Colaboracion } from "../../src/domain/Colaboracion.js";

function crearColaboracionDePrueba(overrides = {}) {
    return new Colaboracion({
        personaColaboradora: { nombreFantasia: "Persona Test" },
        proyecto: { titulo: "Proyecto Test" },
        ...overrides
    });
}

describe("Colaboracion", () => {
    test("se crea correctamente con personaColaboradora y proyecto", () => {
        const colaboracion = crearColaboracionDePrueba();
        expect(colaboracion.personaColaboradora.nombreFantasia).toBe("Persona Test");
        expect(colaboracion.proyecto.titulo).toBe("Proyecto Test");
    });

    test("lanza un error si falta personaColaboradora", () => {
        expect(() => {
            crearColaboracionDePrueba({ personaColaboradora: null });
        }).toThrow("La colaboracion debe tener una persona colaboradora y un proyecto");
    });

    test("lanza un error si falta proyecto", () => {
        expect(() => {
            crearColaboracionDePrueba({ proyecto: null });
        }).toThrow("La colaboracion debe tener una persona colaboradora y un proyecto");
    });
});
