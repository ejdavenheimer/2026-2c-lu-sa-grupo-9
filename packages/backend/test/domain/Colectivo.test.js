import { jest } from "@jest/globals";
import { Colectivo } from "../../src/domain/Colectivo.js";

function crearColectivoDePrueba(overrides = {}) {
    return new Colectivo({
        nombre: "Colectivo Test",
        descripcion: "desc",
        tipo: "ONG",
        ...overrides
    });
}

describe("Colectivo", () => {
    test("se crea correctamente cuando se indican nombre y tipo", () => {
        const colectivo = crearColectivoDePrueba();
        expect(colectivo.nombre).toBe("Colectivo Test");
        expect(colectivo.descripcion).toBe("desc");
        expect(colectivo.tipo).toBe("ONG");
    });

    test("lanza un error si falta el nombre", () => {
        expect(() => crearColectivoDePrueba({ nombre: undefined })).toThrowError('El colectivo debe poseer un nombre y un tipo');
    });

    test("lanza un error si falta el tipo", () => {
        expect(() => crearColectivoDePrueba({ tipo: undefined })).toThrowError('El colectivo debe poseer un nombre y un tipo');
    });

    test("arranca con la lista de proyectos vacía", () => {
        const colectivo = crearColectivoDePrueba();
        expect(colectivo.proyectos).toBeInstanceOf(Array);
        expect(colectivo.proyectos.length).toBe(0);
    });

    test("agregarProyecto agrega un proyecto nuevo a la lista de proyectos", () => {
        const colectivo = crearColectivoDePrueba();
        const proyecto = { titulo: "Proyecto Test" };
        colectivo.agregarProyecto(proyecto);
        expect(colectivo.proyectos.length).toBe(1);
        expect(colectivo.proyectos[0]).toBe(proyecto);
    });

    test("agregarProyecto no agrega el proyecto si ya existe uno con el mismo título", () => {
        const colectivo = crearColectivoDePrueba();
        const proyecto1 = { titulo: "Proyecto Test" };
        const proyecto2 = { titulo: "Proyecto Test" };
        colectivo.agregarProyecto(proyecto1);
        colectivo.agregarProyecto(proyecto2);
        expect(colectivo.proyectos.length).toBe(1);
    });

    test("finalizarProyecto llama a cerrarProyecto() del proyecto que coincide por título", () => {
        const colectivo = crearColectivoDePrueba();
        const proyecto = { titulo: "Proyecto Test", cerrarProyecto: jest.fn() };
        colectivo.agregarProyecto(proyecto);
        colectivo.finalizarProyecto(proyecto);
        expect(proyecto.cerrarProyecto).toHaveBeenCalled();
    });
});
