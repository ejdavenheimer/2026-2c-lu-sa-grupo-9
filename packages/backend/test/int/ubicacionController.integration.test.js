import { jest } from "@jest/globals";

// GeorefAdapter captura globalThis.fetch al construirse, y la ruta instancia el
// controller al importarse. Por eso se stubea fetch ANTES de importar la app:
// asi los tests no dependen de la API externa de Georef ni de tener red.
const fetchStub = jest.fn();
globalThis.fetch = fetchStub;

const { default: request } = await import("supertest");
const { buildTestServer } = await import("./utils/buildTestServer.js");

const app = buildTestServer();

const PROVINCIAS_ARGENTINAS = 24;

beforeEach(() => {
    fetchStub.mockReset();
});

describe("GET /api/ubicaciones/paises", () => {
    test("devuelve el catalogo de paises ordenado alfabeticamente", async () => {
        const res = await request(app).get("/api/ubicaciones/paises");

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.map((p) => p.nombre)).toContain("Argentina");

        const nombres = res.body.map((p) => p.nombre);
        expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, "es")));
    });

    test("no consulta el servicio externo", async () => {
        await request(app).get("/api/ubicaciones/paises");

        expect(fetchStub).not.toHaveBeenCalled();
    });
});

describe("GET /api/ubicaciones/provincias", () => {
    test("devuelve las provincias que informa el servicio externo", async () => {
        fetchStub.mockResolvedValue({
            ok: true,
            json: async () => ({
                provincias: [
                    { id: 6, nombre: "Buenos Aires" },
                    { id: 14, nombre: "Córdoba" }
                ]
            })
        });

        const res = await request(app).get("/api/ubicaciones/provincias");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: "6", nombre: "Buenos Aires" },
            { id: "14", nombre: "Córdoba" }
        ]);
    });

    test("cae al catalogo oficial si el servicio externo falla", async () => {
        fetchStub.mockRejectedValue(new Error("ECONNREFUSED"));

        const res = await request(app).get("/api/ubicaciones/provincias");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(PROVINCIAS_ARGENTINAS);
        expect(res.body.map((p) => p.nombre)).toContain("Tucumán");
    });

    test("cae al catalogo oficial si el servicio responde un error HTTP", async () => {
        fetchStub.mockResolvedValue({ ok: false, json: async () => ({}) });

        const res = await request(app).get("/api/ubicaciones/provincias");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(PROVINCIAS_ARGENTINAS);
    });

    test("cae al catalogo oficial si la respuesta no tiene el formato esperado", async () => {
        fetchStub.mockResolvedValue({ ok: true, json: async () => ({ otraCosa: [] }) });

        const res = await request(app).get("/api/ubicaciones/provincias");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(PROVINCIAS_ARGENTINAS);
    });
});
