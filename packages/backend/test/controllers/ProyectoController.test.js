import { jest } from "@jest/globals";
import { ProyectoController } from "../../src/controllers/ProyectoController.js";
import { EstadoProyecto } from "../../src/domain/enums.js";

describe("ProyectoController", () => {
    let mockProyectoService;
    let controller;
    let mockRes;

    beforeEach(() => {
        mockProyectoService = {
            cerrarProyecto: jest.fn(),
            crearProyecto: jest.fn(),
            obtenerProyectos: jest.fn(),
            obtenerProyectoPorId: jest.fn(),
            anotarColaborador: jest.fn()
        };
        controller = new ProyectoController(mockProyectoService);
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe("actualizar (PATCH /proyectos/:id)", () => {
        test("cierra el proyecto exitosamente cuando recibe estado CERRADO", () => {
            const proyectoMock = { id: "proy-1", estado: EstadoProyecto.CERRADO };
            mockProyectoService.cerrarProyecto.mockReturnValue(proyectoMock);

            const req = {
                params: { id: "proy-1" },
                body: { estado: "CERRADO" }
            };

            controller.actualizar(req, mockRes);

            expect(mockProyectoService.cerrarProyecto).toHaveBeenCalledWith("proy-1");
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(proyectoMock);
        });

        test("retorna 400 si el estado enviado no es válido", () => {
            const req = {
                params: { id: "proy-1" },
                body: { estado: "CANCELADO" }
            };

            controller.actualizar(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockProyectoService.cerrarProyecto).not.toHaveBeenCalled();
        });

        test("retorna 400 si el body contiene campos no permitidos (strict)", () => {
            const req = {
                params: { id: "proy-1" },
                body: { estado: "CERRADO", campoInvalido: true }
            };

            controller.actualizar(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockProyectoService.cerrarProyecto).not.toHaveBeenCalled();
        });

        test("retorna 404 si el proyecto a cerrar no existe", () => {
            mockProyectoService.cerrarProyecto.mockImplementation(() => {
                throw new Error("No se encontró el proyecto con ID 'id-inexistente'");
            });

            const req = {
                params: { id: "id-inexistente" },
                body: { estado: "CERRADO" }
            };

            controller.actualizar(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: "No se encontró el proyecto con ID 'id-inexistente'"
            });
        });
    });
});
