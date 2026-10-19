import { HabilidadService } from "../../src/services/HabilidadService.js";
import { HabilidadRepository } from "../../src/repositories/HabilidadRepository.js";

function datosHabilidadDePrueba(overrides = {}) {
    return {
        titulo: "Desarrollo Web React",
        codigo: "desarrollo_web_react",
        descripcion: "desc",
        ...overrides
    };
}

describe("HabilidadService", () => {
    beforeEach(() => {
        HabilidadRepository.limpiar();
    });

    test("crearHabilidad guarda y devuelve la habilidad con los datos normalizados", async () => {
        const datos = datosHabilidadDePrueba();
        const habilidadCreada = await HabilidadService.crearHabilidad(datos);

        expect(habilidadCreada.titulo).toBe(datos.titulo);
        expect(habilidadCreada.codigo).toBe(datos.codigo);
        expect(habilidadCreada.descripcion).toBe(datos.descripcion);
        
        const habilidadGuardada = await HabilidadRepository.buscarPorCodigo(datos.codigo);
        expect(habilidadGuardada).toEqual(habilidadCreada);
    });

    test("crearHabilidad genera el código a partir del título si no se indica código", async () => {
        const datos = datosHabilidadDePrueba({ codigo: null });
        const habilidadCreada = await HabilidadService.crearHabilidad(datos);

        const codigoEsperado = datos.titulo.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        expect(habilidadCreada.codigo).toBe(codigoEsperado);
    });

    test("crearHabilidad normaliza el código (mayúsculas, espacios, caracteres especiales)", async () => {
        const datos = datosHabilidadDePrueba({ codigo: "  Desarrollo Web React!@#  " });
        const habilidadCreada = await HabilidadService.crearHabilidad(datos);

        expect(habilidadCreada.codigo).toBe("desarrollo_web_react");
    });

    test("crearHabilidad usa una descripción vacía si no se indica", async () => {
        const datos = datosHabilidadDePrueba({ descripcion: null });
        const habilidadCreada = await HabilidadService.crearHabilidad(datos);
        expect(habilidadCreada.descripcion).toBe("");
    });

    test("crearHabilidad lanza un error si falta el título", async () => {
        const datos = datosHabilidadDePrueba({ titulo: null });
        await expect(HabilidadService.crearHabilidad(datos)).rejects.toThrow("El título de la habilidad es requerido");
    });

    test("crearHabilidad lanza un error si ya existe una habilidad con el mismo código", async () => {
        const datos = datosHabilidadDePrueba();
        await HabilidadService.crearHabilidad(datos);
        await expect(HabilidadService.crearHabilidad(datos)).rejects.toThrow(`Ya existe una habilidad con el código '${datos.codigo}'`);
    });

    test("obtenerHabilidades devuelve una lista vacía si no hay habilidades guardadas", async () => {
        const habilidades = await HabilidadService.obtenerHabilidades();
        expect(habilidades).toEqual([]);
    });

    test("obtenerHabilidades devuelve todas las habilidades guardadas", async () => {
        const datos1 = datosHabilidadDePrueba({ titulo: "Habilidad 1", codigo: "habilidad_1" });
        const datos2 = datosHabilidadDePrueba({ titulo: "Habilidad 2", codigo: "habilidad_2" });
        await HabilidadService.crearHabilidad(datos1);
        await HabilidadService.crearHabilidad(datos2);

        const habilidades = await HabilidadService.obtenerHabilidades();
        expect(habilidades).toHaveLength(2);
        expect(habilidades.map(h => h.codigo)).toEqual(expect.arrayContaining([datos1.codigo, datos2.codigo]));
    });

    test("obtenerHabilidadPorCodigo devuelve la habilidad si existe", async () => {
        const datos = datosHabilidadDePrueba();
        await HabilidadService.crearHabilidad(datos);

        const habilidad = await HabilidadService.obtenerHabilidadPorCodigo(datos.codigo);
        expect(habilidad).toBeDefined();
        expect(habilidad.codigo).toBe(datos.codigo);
    });

    test("obtenerHabilidadPorCodigo lanza un error si no existe", async () => {
        await expect(HabilidadService.obtenerHabilidadPorCodigo("codigo-inexistente")).rejects.toThrow("No se encontró la habilidad con el código");
    });

    test("actualizarHabilidad modifica el título y la descripción", async () => {
        const datos = datosHabilidadDePrueba();
        await HabilidadService.crearHabilidad(datos);

        const actualizada = await HabilidadService.actualizarHabilidad(datos.codigo, {
            titulo: "Nuevo Titulo",
            descripcion: "Nueva desc"
        });

        expect(actualizada.titulo).toBe("Nuevo Titulo");
        expect(actualizada.descripcion).toBe("Nueva desc");
    });

    test("eliminarHabilidad remueve la habilidad existente", async () => {
        const datos = datosHabilidadDePrueba();
        await HabilidadService.crearHabilidad(datos);

        const eliminada = await HabilidadService.eliminarHabilidad(datos.codigo);
        expect(eliminada).toBe(true);
        await expect(HabilidadService.obtenerHabilidadPorCodigo(datos.codigo)).rejects.toThrow();
    });
});
