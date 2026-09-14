import { Cuenta } from "../../src/domain/Cuenta.js";

function crearCuentaDePrueba(overrides = {}) {
    return new Cuenta({
        nombreUsuario: "usuario_test",
        tipo: "GITHUB",
        ...overrides
    });
}

describe("Cuenta", () => {
    test("se crea correctamente con nombreUsuario y tipo", () => {
        const cuenta = crearCuentaDePrueba();
        expect(cuenta.nombreUsuario).toBe("usuario_test");
        expect(cuenta.tipo).toBe("GITHUB");
    });

    test("lanza un error si falta el nombreUsuario", () => {
        expect(() => {
            crearCuentaDePrueba({ nombreUsuario: null });
        }).toThrow("La cuenta requiere un nombre de usuario y un tipo.");
    });

    test("lanza un error si falta el tipo", () => {
        expect(() => {
            crearCuentaDePrueba({ tipo: null });
        }).toThrow("La cuenta requiere un nombre de usuario y un tipo.");
    });
});
