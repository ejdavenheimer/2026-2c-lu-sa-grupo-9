import { Hito } from "../../src/domain/Hito.js";

function crearHitoDePrueba(overrides = {}) {
    return new Hito({
        porcentajeConcrecion: 50,
        descripcion: "Primera entrega",
        proyecto: { id: "proy-1", titulo: "Proyecto Test" },
        ...overrides
    });
}

describe("Hito", () => {
    test("se crea correctamente con porcentajeConcrecion, descripcion y proyecto", () => {
        const hito = crearHitoDePrueba();
        expect(hito.porcentajeConcrecion).toBe(50);
        expect(hito.descripcion).toBe("Primera entrega");
        expect(hito.proyecto.id).toBe("proy-1");
    });

    test("lanza un error si falta la descripcion", () => {
        expect(() => crearHitoDePrueba({ descripcion: undefined })).toThrow('El hito debe tener una descripcion y un proyecto');
    });

    test("lanza un error si falta el proyecto", () => {
        expect(() => crearHitoDePrueba({ proyecto: undefined })).toThrow('El hito debe tener una descripcion y un proyecto');
    });

    test("lanza un error si porcentajeConcrecion no es un número", () => {
        expect(() => crearHitoDePrueba({ porcentajeConcrecion: "cincuenta" })).toThrow('El porcentaje de concreción debe ser un número entre 0 y 100 (inclusive)');
    });

    test("lanza un error si porcentajeConcrecion es NaN", () => {
        expect(() => crearHitoDePrueba({ porcentajeConcrecion: NaN })).toThrow('El porcentaje de concreción debe ser un número entre 0 y 100 (inclusive)');
    });

    test("lanza un error si porcentajeConcrecion es menor a 0", () => {
        expect(() => crearHitoDePrueba({ porcentajeConcrecion: -10 })).toThrow('El porcentaje de concreción debe ser un número entre 0 y 100 (inclusive)');
    });

    test("lanza un error si porcentajeConcrecion es mayor a 100", () => {
        expect(() => crearHitoDePrueba({ porcentajeConcrecion: 110 })).toThrow('El porcentaje de concreción debe ser un número entre 0 y 100 (inclusive)');
    });

    test("acepta porcentajeConcrecion en los límites 0 y 100", () => {
        const hitoCero = crearHitoDePrueba({ porcentajeConcrecion: 0 });
        expect(hitoCero.porcentajeConcrecion).toBe(0);

        const hitoCien = crearHitoDePrueba({ porcentajeConcrecion: 100 });
        expect(hitoCien.porcentajeConcrecion).toBe(100);
    });
});
