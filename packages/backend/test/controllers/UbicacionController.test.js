import { jest } from "@jest/globals";
import { UbicacionController } from "../../src/controllers/UbicacionController.js";

describe("UbicacionController", () => {
    let mockUbicacionService;
    let controller;
    let mockRes;

    beforeEach(() => {
        mockUbicacionService = {
            obtenerProvincias: jest.fn(),
            obtenerPaises: jest.fn()
        };
        controller = new UbicacionController(mockUbicacionService);
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test("listarProvincias devuelve 200 con la lista de provincias", async () => {
        const provinciasMock = [{ id: "06", nombre: "Buenos Aires" }];
        mockUbicacionService.obtenerProvincias.mockResolvedValue(provinciasMock);

        await controller.listarProvincias({}, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(provinciasMock);
    });

    test("listarProvincias devuelve 500 si ocurre un error", async () => {
        mockUbicacionService.obtenerProvincias.mockRejectedValue(new Error("Error interno"));

        await controller.listarProvincias({}, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Error interno" });
    });

    test("listarPaises devuelve 200 con la lista de países", () => {
        const paisesMock = [{ id: "AR", nombre: "Argentina" }];
        mockUbicacionService.obtenerPaises.mockReturnValue(paisesMock);

        controller.listarPaises({}, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(paisesMock);
    });
});
