import { jest } from "@jest/globals";
import { NotificacionController } from "../../src/controllers/NotificacionController.js";
import { BadRequestError } from "../../src/errors/AppError.js";

describe("NotificacionController", () => {
    let mockService;
    let controller;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockService = {
            enviarNotificacion: jest.fn(),
            obtenerNotificaciones: jest.fn(),
            obtenerNotificacionPorId: jest.fn(),
            actualizarEstadoLectura: jest.fn()
        };
        controller = new NotificacionController(mockService);
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe("enviar", () => {
        test("crea notificación exitosamente con status 201", async () => {
            const notifMock = { id: "notif-1", contenido: "Hola" };
            mockService.enviarNotificacion.mockResolvedValue(notifMock);

            const req = {
                body: {
                    colectivoId: "col-1",
                    personaColaboradoraId: "colab-1",
                    perfilId: "perf-1",
                    contenido: "Te invitamos al proyecto"
                }
            };

            await controller.enviar(req, mockRes, mockNext);

            expect(mockService.enviarNotificacion).toHaveBeenCalledWith(req.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(notifMock);
        });

        test("delega error en next si faltan campos obligatorios", async () => {
            const req = {
                body: {
                    colectivoId: "col-1"
                }
            };

            await controller.enviar(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });

    describe("listar", () => {
        test("devuelve lista de notificaciones con status 200", async () => {
            const notificacionesMock = [{ id: "notif-1" }];
            mockService.obtenerNotificaciones.mockResolvedValue(notificacionesMock);

            const req = {
                query: {
                    destinatarioId: "colab-1",
                    soloNoLeidas: "true"
                }
            };

            await controller.listar(req, mockRes, mockNext);

            expect(mockService.obtenerNotificaciones).toHaveBeenCalledWith({
                destinatarioId: "colab-1",
                colectivoId: undefined,
                soloNoLeidas: true
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(notificacionesMock);
        });

        test("delega error en next si el servicio arroja error", async () => {
            const error = new Error("DB error");
            mockService.obtenerNotificaciones.mockRejectedValue(error);

            const req = { query: {} };
            await controller.listar(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe("obtenerPorId", () => {
        test("obtiene notificación por ID con status 200", async () => {
            const notifMock = { id: "notif-1" };
            mockService.obtenerNotificacionPorId.mockResolvedValue(notifMock);

            const req = {
                params: { id: "notif-1" }
            };

            await controller.obtenerPorId(req, mockRes, mockNext);

            expect(mockService.obtenerNotificacionPorId).toHaveBeenCalledWith("notif-1");
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(notifMock);
        });

        test("delega error en next si el servicio arroja error", async () => {
            const error = new Error("Not found");
            mockService.obtenerNotificacionPorId.mockRejectedValue(error);

            const req = { params: { id: "inexistente" } };
            await controller.obtenerPorId(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe("actualizarLectura", () => {
        test("actualiza lectura exitosamente con status 200", async () => {
            const notifActualizada = { id: "notif-1", leida: true };
            mockService.actualizarEstadoLectura.mockResolvedValue(notifActualizada);

            const req = {
                params: { id: "notif-1" },
                body: {
                    leida: true
                }
            };

            await controller.actualizarLectura(req, mockRes, mockNext);

            expect(mockService.actualizarEstadoLectura).toHaveBeenCalledWith("notif-1", true);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(notifActualizada);
        });

        test("delega error en next si leida no es booleano", async () => {
            const req = {
                params: { id: "notif-1" },
                body: {
                    leida: "no-es-boolean"
                }
            };

            await controller.actualizarLectura(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });

        test("delega error en next si el servicio arroja error", async () => {
            const error = new Error("Service error");
            mockService.actualizarEstadoLectura.mockRejectedValue(error);

            const req = {
                params: { id: "notif-1" },
                body: { leida: true }
            };

            await controller.actualizarLectura(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
