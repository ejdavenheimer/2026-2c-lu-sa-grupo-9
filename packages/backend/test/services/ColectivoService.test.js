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

    test("crearColectivo guarda y devuelve el colectivo con un id asignado", async () => {
        const datos = datosColectivoDePrueba();
        const colectivoCreado = await colectivoService.crearColectivo(datos);

        expect(colectivoCreado).toHaveProperty("id");
        expect(colectivoCreado.nombre).toBe(datos.nombre);
        expect(colectivoCreado.descripcion).toBe(datos.descripcion);
        expect(colectivoCreado.tipo).toBe(datos.tipo);
    });

    test("crearColectivo propaga el error si faltan datos obligatorios", async () => {
        const datos = datosColectivoDePrueba({ nombre: null });
        await expect(colectivoService.crearColectivo(datos)).rejects.toThrow("El colectivo debe poseer un nombre y un tipo");
    });

    test("crearColectivo lanza un error si ya existe un colectivo con el mismo nombre", async () => {
        const datos1 = datosColectivoDePrueba({ nombre: "Colectivo Repetido" });
        const datos2 = datosColectivoDePrueba({ nombre: "Colectivo Repetido", descripcion: "Nueva descripción" });

        await colectivoService.crearColectivo(datos1);
        await expect(colectivoService.crearColectivo(datos2)).rejects.toThrow("Ya existe un colectivo con el nombre 'Colectivo Repetido'");

        const colectivos = await colectivoService.obtenerColectivos();
        expect(colectivos).toHaveLength(1);
    });

    test("obtenerColectivos devuelve una lista vacía si no hay colectivos guardados", async () => {
        const colectivos = await colectivoService.obtenerColectivos();
        expect(colectivos).toEqual([]);
    });

    test("obtenerColectivos devuelve todos los colectivos guardados", async () => {
        const datos1 = datosColectivoDePrueba({ nombre: "Colectivo 1" });
        const datos2 = datosColectivoDePrueba({ nombre: "Colectivo 2" });

        await colectivoService.crearColectivo(datos1);
        await colectivoService.crearColectivo(datos2);

        const colectivos = await colectivoService.obtenerColectivos();
        expect(colectivos).toHaveLength(2);
    });

    test("obtenerColectivoPorId devuelve el colectivo si existe", async () => {
        const datos = datosColectivoDePrueba();
        const colectivoCreado = await colectivoService.crearColectivo(datos);
        const colectivoObtenido = await colectivoService.obtenerColectivoPorId(colectivoCreado.id);

        expect(colectivoObtenido).toEqual(colectivoCreado);
    });

    test("obtenerColectivoPorId lanza un error si no existe", async () => {
        await expect(colectivoService.obtenerColectivoPorId("id-inexistente")).rejects.toThrow("No se encontro el colectivo con id");
    });

    test("actualizarColectivo modifica los datos del colectivo", async () => {
        const colectivo = await colectivoService.crearColectivo(datosColectivoDePrueba());
        const colectivoActualizado = await colectivoService.actualizarColectivo(colectivo.id, {
            descripcion: "Nueva descripcion",
            tipo: "FUNDACION"
        });

        expect(colectivoActualizado.descripcion).toBe("Nueva descripcion");
        expect(colectivoActualizado.tipo).toBe("FUNDACION");
    });

    test("eliminarColectivo borra el colectivo existente", async () => {
        const colectivo = await colectivoService.crearColectivo(datosColectivoDePrueba());
        const eliminado = await colectivoService.eliminarColectivo(colectivo.id);

        expect(eliminado).toBe(true);
        await expect(colectivoService.obtenerColectivoPorId(colectivo.id)).rejects.toThrow();
    });
});
