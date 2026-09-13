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

    test("crearHabilidad guarda y devuelve la habilidad con los datos normalizados", () => {
        const datos = datosHabilidadDePrueba();
        const habilidadCreada = HabilidadService.crearHabilidad(datos);

        expect(habilidadCreada.titulo).toBe(datos.titulo);
        expect(habilidadCreada.codigo).toBe(datos.codigo);
        expect(habilidadCreada.descripcion).toBe(datos.descripcion);
        
        const habilidadGuardada = HabilidadRepository.buscarPorCodigo(datos.codigo);
        expect(habilidadGuardada).toEqual(habilidadCreada);
    });

    test("crearHabilidad genera el código a partir del título si no se indica código", () => {
        const datos = datosHabilidadDePrueba({ codigo: null });
        const habilidadCreada = HabilidadService.crearHabilidad(datos);

        const codigoEsperado = datos.titulo.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        expect(habilidadCreada.codigo).toBe(codigoEsperado);
    });

    test("crearHabilidad normaliza el código (mayúsculas, espacios, caracteres especiales)", () => {
        const datos = datosHabilidadDePrueba({ codigo: "  Desarrollo Web React!@#  " });
        const habilidadCreada = HabilidadService.crearHabilidad(datos);

        expect(habilidadCreada.codigo).toBe("desarrollo_web_react");
    });

    test("crearHabilidad lanza un error si no se indica descripción", () => {
        const datos = datosHabilidadDePrueba({ descripcion: null });
        expect(() => HabilidadService.crearHabilidad(datos)).toThrow("La habilidad requiere un titulo, codigo y descripcion");
    });

    test("crearHabilidad lanza un error si falta el título", () => {
        const datos = datosHabilidadDePrueba({ titulo: null });
        expect(() => HabilidadService.crearHabilidad(datos)).toThrow("El título de la habilidad es requerido");
    });

    test("crearHabilidad lanza un error si ya existe una habilidad con el mismo código", () => {
        const datos = datosHabilidadDePrueba();
        HabilidadService.crearHabilidad(datos);
        expect(() => HabilidadService.crearHabilidad(datos)).toThrow(`Ya existe una habilidad con el código '${datos.codigo}'`);
    });

    test("obtenerHabilidades devuelve una lista vacía si no hay habilidades guardadas", () => {
        const habilidades = HabilidadService.obtenerHabilidades();
        expect(habilidades).toEqual([]);
    });

    test("obtenerHabilidades devuelve todas las habilidades guardadas", () => {
        const datos1 = datosHabilidadDePrueba({ titulo: "Habilidad 1", codigo: "habilidad_1" });
        const datos2 = datosHabilidadDePrueba({ titulo: "Habilidad 2", codigo: "habilidad_2" });
        HabilidadService.crearHabilidad(datos1);
        HabilidadService.crearHabilidad(datos2);

        const habilidades = HabilidadService.obtenerHabilidades();
        expect(habilidades).toHaveLength(2);
        expect(habilidades.map(h => h.codigo)).toEqual(expect.arrayContaining([datos1.codigo, datos2.codigo]));
    });

    test("obtenerHabilidadPorCodigo devuelve la habilidad si existe", () => {
        const datos = datosHabilidadDePrueba();
        HabilidadService.crearHabilidad(datos);

        const habilidad = HabilidadService.obtenerHabilidadPorCodigo(datos.codigo);
        expect(habilidad).toBeDefined();
        expect(habilidad.codigo).toBe(datos.codigo);
    });

    test("obtenerHabilidadPorCodigo lanza un error si no existe", () => {
        expect(() => HabilidadService.obtenerHabilidadPorCodigo("codigo-inexistente")).toThrow("No se encontró la habilidad con el código");
    });
});
