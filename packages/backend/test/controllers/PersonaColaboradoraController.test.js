import { jest } from "@jest/globals";
import { PersonaColaboradoraController } from "../../src/controllers/PersonaColaboradoraController.js";
import { BadRequestError } from "../../src/errors/AppError.js";

describe("PersonaColaboradoraController", () => {
    let mockPersonaColaboradoraService;
    let mockCompatibilidadService;
    let controller;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockPersonaColaboradoraService = {
            listarPersonasColaboradoras: jest.fn(),
            obtenerPersonaColaboradoraPorId: jest.fn(),
            crearPersonaColaboradora: jest.fn(),
            agregarHabilidad: jest.fn()
        };
        mockCompatibilidadService = {
            buscarProyectosCompatibles: jest.fn().mockResolvedValue([])
        };
        controller = new PersonaColaboradoraController(
            mockPersonaColaboradoraService,
            mockCompatibilidadService
        );
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe("buscarProyectosCompatibles (HU09)", () => {
        test("retorna 200 y los pares proyecto-perfil que devolvió el service", async () => {
            const oportunidades = [
                {
                    proyecto: { id: "proy-1", titulo: "Portal del Barrio" },
                    perfil: { id: "perf-3", nombre: "Tester" },
                    compatibilidad: { esCompatible: true, puntaje: 100 }
                }
            ];
            mockCompatibilidadService.buscarProyectosCompatibles.mockResolvedValue(oportunidades);

            const req = { params: { id: "colab-7" }, query: {} };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockCompatibilidadService.buscarProyectosCompatibles)
                .toHaveBeenCalledWith("colab-7", {});
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(oportunidades);
        });

        test("sin query params no manda ninguna opción: el default es del service", async () => {
            const req = { params: { id: "colab-7" }, query: {} };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockCompatibilidadService.buscarProyectosCompatibles)
                .toHaveBeenCalledWith("colab-7", {});
        });

        test("estricto=true llega al service como booleano", async () => {
            const req = { params: { id: "colab-7" }, query: { estricto: "true" } };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockCompatibilidadService.buscarProyectosCompatibles)
                .toHaveBeenCalledWith("colab-7", { estricto: true });
        });

        test("acepta estricto y limite juntos", async () => {
            const req = { params: { id: "colab-7" }, query: { estricto: "false", limite: "3" } };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockCompatibilidadService.buscarProyectosCompatibles)
                .toHaveBeenCalledWith("colab-7", { estricto: false, limite: 3 });
        });

        test("devuelve 200 con lista vacía cuando no hay oportunidades, no un 404", async () => {
            const req = { params: { id: "colab-7" }, query: {} };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith([]);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test("delega error en next si estricto no es true ni false", async () => {
            const req = { params: { id: "colab-7" }, query: { estricto: "si" } };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockCompatibilidadService.buscarProyectosCompatibles).not.toHaveBeenCalled();
        });

        test("delega error en next si el query trae un param desconocido", async () => {
            const req = { params: { id: "colab-7" }, query: { habilidad: "react" } };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockNext.mock.calls[0][0]).toBeInstanceOf(BadRequestError);
            expect(mockCompatibilidadService.buscarProyectosCompatibles).not.toHaveBeenCalled();
        });

        test("delega en next el error que lanza el service", async () => {
            const error = new Error("No se encontró la persona colaboradora");
            mockCompatibilidadService.buscarProyectosCompatibles.mockRejectedValue(error);

            const req = { params: { id: "colab-9" }, query: {} };

            await controller.buscarProyectosCompatibles(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });
});
