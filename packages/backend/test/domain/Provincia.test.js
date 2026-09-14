import { Provincia } from "../../src/domain/Provincia.js";

function crearProvinciaDePrueba(overrides = {}) {
    return new Provincia({
        nombre: "Buenos Aires",
        ...overrides
    });
}

describe("Provincia", () => {
    test("se crea correctamente con nombre", () => {
        const provincia = crearProvinciaDePrueba();
        expect(provincia.nombre).toBe("Buenos Aires");
    });

    test("lanza un error si falta el nombre", () => {
        expect(() => {
            crearProvinciaDePrueba({ nombre: null });
        }).toThrow("El nombre es requerido");
    });
});
