import { Pais } from "../../src/domain/Pais.js";

function crearPaisDePrueba(overrides = {}) {
    return new Pais({
        nombre: "Argentina",
        ...overrides
    });
}

describe("Pais", () => {
    test("se crea correctamente con nombre", () => {
        const pais = crearPaisDePrueba();
        expect(pais.nombre).toBe("Argentina");
    });

    test("lanza un error si falta el nombre", () => {
        expect(() => {
            crearPaisDePrueba({ nombre: null });
        }).toThrow("El nombre es requerido");
    });
});
