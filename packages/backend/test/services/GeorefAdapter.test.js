import { jest } from "@jest/globals";
import { GeorefAdapter } from "../../src/services/external/GeorefAdapter.js";

describe("GeorefAdapter", () => {
    test("obtiene y mapea las provincias ordenadas alfabéticamente", async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                provincias: [
                    { id: 14, nombre: "Córdoba" },
                    { id: 6, nombre: "Buenos Aires" }
                ]
            })
        });

        const adapter = new GeorefAdapter({ fetchFn: mockFetch });
        const provincias = await adapter.obtenerProvincias();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(provincias).toEqual([
            { id: "6", nombre: "Buenos Aires" },
            { id: "14", nombre: "Córdoba" }
        ]);
    });

    test("retorna el catálogo fallback si la API de Georef responde con error", async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500
        });

        const adapter = new GeorefAdapter({ fetchFn: mockFetch });
        const provincias = await adapter.obtenerProvincias();

        expect(provincias.length).toBe(24);
        expect(provincias.some((p) => p.nombre === "Buenos Aires")).toBe(true);
        expect(provincias.some((p) => p.nombre === "Ciudad Autónoma de Buenos Aires")).toBe(true);
    });

    test("retorna el catálogo fallback si la petición arroja una excepción de red", async () => {
        const mockFetch = jest.fn().mockRejectedValue(new Error("Network Error"));

        const adapter = new GeorefAdapter({ fetchFn: mockFetch });
        const provincias = await adapter.obtenerProvincias();

        expect(provincias.length).toBe(24);
    });
});
