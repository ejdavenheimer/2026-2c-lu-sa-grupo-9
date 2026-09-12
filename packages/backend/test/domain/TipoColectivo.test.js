import { TipoColectivo } from "../../src/domain/TipoColectivo.js";

function crearTipoColectivoDePrueba(overrides = {}) {
    return new TipoColectivo({
        id: "1",
        nombre: "ONG",
        ...overrides
    });
}

describe("TipoColectivo", () => {
    test("se crea correctamente con id y nombre", () => {
        const tipoColectivo = crearTipoColectivoDePrueba();
        expect(tipoColectivo.id).toBe("1");
        expect(tipoColectivo.nombre).toBe("ONG");
    });

    test("lanza un error si falta el nombre", () => {
        expect(() => {
            crearTipoColectivoDePrueba({ nombre: null });
        }).toThrow("El nombre es requerido");
    });
});
