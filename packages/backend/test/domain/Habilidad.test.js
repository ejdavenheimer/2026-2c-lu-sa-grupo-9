import { Habilidad } from "../../src/domain/Habilidad.js";

function crearHabilidadDePrueba(overrides = {}) {
    return new Habilidad({
        titulo: "Desarrollo Web React",
        codigo: "desarrollo_web_react",
        descripcion: "desc",
        ...overrides
    });
}

describe("Habilidad", () => {
    test("se crea correctamente con titulo, codigo y descripcion", () => {
        const habilidad = crearHabilidadDePrueba();
        expect(habilidad.titulo).toBe("Desarrollo Web React");
        expect(habilidad.codigo).toBe("desarrollo_web_react");
        expect(habilidad.descripcion).toBe("desc");
    });

    test("lanza un error si falta el titulo", () => {
        expect(() => {
            crearHabilidadDePrueba({ titulo: null });
        }).toThrow("La habilidad requiere un titulo, codigo y descripcion");
    });

    test("lanza un error si falta el codigo", () => {
        expect(() => {
            crearHabilidadDePrueba({ codigo: null });
        }).toThrow("La habilidad requiere un titulo, codigo y descripcion");
    });

    test("lanza un error si falta la descripcion", () => {
        expect(() => {
            crearHabilidadDePrueba({ descripcion: null });
        }).toThrow("La habilidad requiere un titulo, codigo y descripcion");
    });
});
