import { ColectivoService } from "../../src/services/ColectivoService.js";
import { ColectivoRepository } from "../../src/repositories/ColectivoRepository.js";

function datosColectivoDePrueba(overrides = {}) {
    return {
        nombre: "Colectivo Test",
        descripcion: "desc",
        tipo: "ONG",
        ...overrides
    };
}

describe("ColectivoService", () => {
    let colectivoService;

    beforeEach(() => {
        ColectivoRepository.limpiar();
        colectivoService = new ColectivoService();
    });

    test("crearColectivo guarda y devuelve el colectivo con un id asignado", () => {
        const datos = datosColectivoDePrueba();
        const colectivoCreado = colectivoService.crearColectivo(datos);

        expect(colectivoCreado).toHaveProperty("id");
        expect(colectivoCreado.nombre).toBe(datos.nombre);
        expect(colectivoCreado.descripcion).toBe(datos.descripcion);
        expect(colectivoCreado.tipo).toBe(datos.tipo);
    });

    test("crearColectivo propaga el error si faltan datos obligatorios", () => {
        const datos = datosColectivoDePrueba({ nombre: null });
        expect(() => colectivoService.crearColectivo(datos)).toThrow("El colectivo debe poseer un nombre y un tipo");
    });

    test("crearColectivo lanza un error si ya existe un colectivo con el mismo nombre", () => {
        const datos1 = datosColectivoDePrueba({ nombre: "Colectivo Repetido" });
        const datos2 = datosColectivoDePrueba({ nombre: "Colectivo Repetido", descripcion: "Nueva descripción" });

        colectivoService.crearColectivo(datos1);
        expect(() => colectivoService.crearColectivo(datos2)).toThrow("Ya existe un colectivo con el nombre 'Colectivo Repetido'");

        const colectivos = colectivoService.obtenerColectivos();
        expect(colectivos).toHaveLength(1);
    });

    test("obtenerColectivos devuelve una lista vacía si no hay colectivos guardados", () => {
        const colectivos = colectivoService.obtenerColectivos();
        expect(colectivos).toEqual([]);
    });

    test("obtenerColectivos devuelve todos los colectivos guardados", () => {
        const datos1 = datosColectivoDePrueba({ nombre: "Colectivo 1" });
        const datos2 = datosColectivoDePrueba({ nombre: "Colectivo 2" });

        colectivoService.crearColectivo(datos1);
        colectivoService.crearColectivo(datos2);

        const colectivos = colectivoService.obtenerColectivos();
        expect(colectivos).toHaveLength(2);
    });

    test("obtenerColectivoPorId devuelve el colectivo si existe", () => {
        const datos = datosColectivoDePrueba();
        const colectivoCreado = colectivoService.crearColectivo(datos);
        const colectivoObtenido = colectivoService.obtenerColectivoPorId(colectivoCreado.id);

        expect(colectivoObtenido).toEqual(colectivoCreado);
    });

    test("obtenerColectivoPorId lanza un error si no existe", () => {
        expect(() => colectivoService.obtenerColectivoPorId("id-inexistente")).toThrow("No se encontro el colectivo con id");
    });

    test("actualizarColectivo modifica los datos del colectivo", () => {
        const colectivo = colectivoService.crearColectivo(datosColectivoDePrueba());
        const colectivoActualizado = colectivoService.actualizarColectivo(colectivo.id, {
            descripcion: "Nueva descripcion",
            tipo: "FUNDACION"
        });

        expect(colectivoActualizado.descripcion).toBe("Nueva descripcion");
        expect(colectivoActualizado.tipo).toBe("FUNDACION");
    });

    test("eliminarColectivo borra el colectivo existente", () => {
        const colectivo = colectivoService.crearColectivo(datosColectivoDePrueba());
        const eliminado = colectivoService.eliminarColectivo(colectivo.id);

        expect(eliminado).toBe(true);
        expect(() => colectivoService.obtenerColectivoPorId(colectivo.id)).toThrow();
    });
});
