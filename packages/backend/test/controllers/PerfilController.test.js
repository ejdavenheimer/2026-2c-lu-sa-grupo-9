import { jest } from "@jest/globals";
import { PerfilController } from "../../src/controllers/PerfilController.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../../src/domain/enums.js";
import { BadRequestError, UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("PerfilController", () => {
    let mockPerfilService;
    let controller;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockPerfilService = {
            crearPerfil: jest.fn(),
            obtenerPerfiles: jest.fn(),
            obtenerPerfilPorId: jest.fn(),
            modificarPerfil: jest.fn(),
            eliminarPerfil: jest.fn()
        };
        controller = new PerfilController(mockPerfilService);
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe("crear", () => {
        test("crea perfil exitosamente con status 201", async () => {
            const perfilMock = { id: "perf-1", descripcion: "Frontend" };
            mockPerfilService.crearPerfil.mockReturnValue(perfilMock);

            const req = {
                params: { id: "proy-1" },
                body: {
                    descripcion: "Frontend",
                    habilidadesObligatoriasCodigos: ["react"],
                    habilidadesOpcionalesCodigos: ["redux"],
                    unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                    cantidadHoras: 10,
                    modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
                }
            };

            await controller.crear(req, mockRes, mockNext);

            expect(mockPerfilService.crearPerfil).toHaveBeenCalledWith("proy-1", req.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(perfilMock);
        });

        test("delega error en next si faltan campos obligatorios", async () => {
            const req = {
                params: { id: "proy-1" },
                body: {
                    descripcion: "Frontend"
                }
            };

            await controller.crear(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockNext.mock.calls[0][0]).toBeInstanceOf(BadRequestError);
            expect(mockPerfilService.crearPerfil).not.toHaveBeenCalled();
        });

        test("delega error en next si hay campos no reconocidos (strict)", async () => {
            const req = {
                params: { id: "proy-1" },
                body: {
                    descripcion: "Frontend",
                    habilidadesObligatoriasCodigos: ["react"],
                    unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
                    cantidadHoras: 10,
                    modalidadesColaboracion: [ModalidadColaboracion.GRATUITA],
                    campoExtra: "invalido"
                }
            };

            await controller.crear(req, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockNext.mock.calls[0][0]).toBeInstanceOf(BadRequestError);
        });
    });

    describe("listarPorProyecto", () => {
        test("retorna 200 y la lista de perfiles", async () => {
            const perfilesMock = [{ id: "perf-1" }, { id: "perf-2" }];
            mockPerfilService.obtenerPerfiles.mockReturnValue(perfilesMock);

            const req = { params: { id: "proy-1" } };

            await controller.listarPorProyecto(req, mockRes, mockNext);

            expect(mockPerfilService.obtenerPerfiles).toHaveBeenCalledWith("proy-1");
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(perfilesMock);
        });
    });

    describe("obtenerPorId", () => {
        test("retorna 200 y el perfil solicitado", async () => {
            const perfilMock = { id: "perf-1", descripcion: "Frontend" };
            mockPerfilService.obtenerPerfilPorId.mockReturnValue(perfilMock);

            const req = { params: { id: "proy-1", perfilId: "perf-1" } };

            await controller.obtenerPorId(req, mockRes, mockNext);

            expect(mockPerfilService.obtenerPerfilPorId).toHaveBeenCalledWith("proy-1", "perf-1");
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(perfilMock);
        });
    });

    describe("modificar", () => {
        test("retorna 200 y el perfil modificado", async () => {
            const perfilModificadoMock = { id: "perf-1", descripcion: "Actualizado" };
            mockPerfilService.modificarPerfil.mockReturnValue(perfilModificadoMock);

            const req = {
                params: { id: "proy-1", perfilId: "perf-1" },
                body: {
                    descripcion: "Actualizado",
                    cantidadHoras: 25
                }
            };

            await controller.modificar(req, mockRes, mockNext);

            expect(mockPerfilService.modificarPerfil).toHaveBeenCalledWith("proy-1", "perf-1", req.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(perfilModificadoMock);
        });
    });

    describe("eliminar", () => {
        test("retorna 204 tras eliminar el perfil", async () => {
            const req = { params: { id: "proy-1", perfilId: "perf-1" } };

            await controller.eliminar(req, mockRes, mockNext);

            expect(mockPerfilService.eliminarPerfil).toHaveBeenCalledWith("proy-1", "perf-1");
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.send).toHaveBeenCalled();
        });
    });
});
