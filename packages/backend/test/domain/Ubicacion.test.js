import { Ubicacion } from "../../src/domain/Ubicacion.js";

function crearUbicacionDePrueba(overrides = {}) {
    return new Ubicacion({
        pais: "Argentina",
        provincia: "Buenos Aires",
        ciudad: "La Plata",
        ...overrides
    });
}

describe("Ubicacion", () => {
    test("se crea correctamente con pais, provincia y ciudad", () => {
        const ubicacion = crearUbicacionDePrueba();
        expect(ubicacion.pais).toBe("Argentina");
        expect(ubicacion.provincia).toBe("Buenos Aires");
        expect(ubicacion.ciudad).toBe("La Plata");
    });

    test("provincia queda en null si no se indica", () => {
        const ubicacion = crearUbicacionDePrueba({ provincia: null });
        expect(ubicacion.provincia).toBeNull();
    });

    test("ciudad queda en null si no se indica", () => {
        const ubicacion = crearUbicacionDePrueba({ ciudad: null });
        expect(ubicacion.ciudad).toBeNull();
    });
});
