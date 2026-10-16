import { jest } from "@jest/globals";
import { NotificacionService } from "../../src/services/NotificacionService.js";
import { TipoMedioContacto } from "../../src/domain/enums.js";
import { NotFoundError, UnprocessableEntityError } from "../../src/errors/AppError.js";

describe("NotificacionService", () => {
    let service;
    let mockColectivo;
    let mockPersona;
    let mockPerfil;
    let mockColectivoRepo;
    let mockPersonaRepo;
    let mockPerfilRepo;
    let mockNotifRepo;
    let mockSender;
    let notificacionesDb;

    beforeEach(() => {
        notificacionesDb = [];

        mockColectivo = { id: "col-1", nombre: "Colectivo Prueba" };
        mockPersona = {
            id: "colab-1",
            nombre: "Ana",
            apellido: "García",
            nombreFantasia: "AnaDev",
            mensajesInternos: true,
            mediosDeContacto: [{ tipo: TipoMedioContacto.EMAIL, valor: "ana@example.com" }]
        };
        mockPerfil = { id: "perf-1", nombre: "Dev Frontend" };

        mockColectivoRepo = {
            buscarPorId: jest.fn((id) => (id === mockColectivo.id ? mockColectivo : null))
        };
        mockPersonaRepo = {
            buscarPorId: jest.fn((id) => (id === mockPersona.id ? mockPersona : null))
        };
        mockPerfilRepo = {
            buscarPorId: jest.fn((id) => (id === mockPerfil.id ? mockPerfil : null))
        };

        mockNotifRepo = {
            guardar: jest.fn(async (notificacion) => {
                const reg = {
                    id: notificacion.id,
                    contenido: notificacion.contenido,
                    fecha: notificacion.fecha,
                    leida: notificacion.leida,
                    colectivoId: notificacion.colectivo?.id || notificacion.colectivoId,
                    personaColaboradoraId: notificacion.personaColaboradora?.id || notificacion.personaColaboradoraId,
                    perfilId: notificacion.perfil?.id || notificacion.perfilId,
                    mediosExternosUtilizados: notificacion.mediosExternosUtilizados
                };
                const idx = notificacionesDb.findIndex((n) => n.id === reg.id);
                if (idx >= 0) {
                    notificacionesDb[idx] = reg;
                } else {
                    notificacionesDb.push(reg);
                }
                return notificacion;
            }),
            buscarPorId: jest.fn(async (id) => {
                const n = notificacionesDb.find((item) => item.id === id);
                return n ? { ...n } : null;
            }),
            buscarTodos: jest.fn(async (filtro = {}) => {
                return notificacionesDb.filter((n) => {
                    if (filtro.personaColaboradoraId && n.personaColaboradoraId !== filtro.personaColaboradoraId) {
                        return false;
                    }
                    if (filtro.colectivoId && n.colectivoId !== filtro.colectivoId) {
                        return false;
                    }
                    if (filtro.leida !== undefined && n.leida !== filtro.leida) {
                        return false;
                    }
                    return true;
                });
            })
        };

        mockSender = {
            replicarPorMedios: jest.fn().mockImplementation(async (medios, notif) => {
                for (const m of medios) {
                    notif.registrarMedioUtilizado({
                        tipo: m.tipo,
                        valor: m.valor,
                        exitoso: true
                    });
                }
                return medios.map((m) => ({ medio: m, enviado: true }));
            })
        };

        service = new NotificacionService({
            notificacionRepository: mockNotifRepo,
            colectivoRepository: mockColectivoRepo,
            personaColaboradoraRepository: mockPersonaRepo,
            perfilRepository: mockPerfilRepo,
            notificadorSender: mockSender
        });
    });

    describe("enviarNotificacion", () => {
        test("crea y envía una notificación exitosamente y replica a medios externos guardando dos veces", async () => {
            const notificacion = await service.enviarNotificacion({
                colectivoId: mockColectivo.id,
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                contenido: "Te invitamos al proyecto",
                replicarMediosExternos: true
            });

            expect(notificacion.id).toBeDefined();
            expect(notificacion.contenido).toBe("Te invitamos al proyecto");
            expect(notificacion.colectivo).toEqual({ id: mockColectivo.id, nombre: mockColectivo.nombre });
            expect(notificacion.personaColaboradora).toEqual({
                id: mockPersona.id,
                nombre: mockPersona.nombre,
                apellido: mockPersona.apellido,
                nombreFantasia: mockPersona.nombreFantasia
            });
            expect(notificacion.perfil).toEqual({ id: mockPerfil.id, nombre: mockPerfil.nombre });
            expect(notificacion.leida).toBe(false);

            // Verifica que no existan ids planos en el nivel superior
            expect(notificacion.colectivoId).toBeUndefined();
            expect(notificacion.personaColaboradoraId).toBeUndefined();
            expect(notificacion.perfilId).toBeUndefined();

            // Verifica replicación y doble persistencia (mensaje y luego medios registrados)
            expect(mockSender.replicarPorMedios).toHaveBeenCalled();
            expect(mockNotifRepo.guardar).toHaveBeenCalledTimes(2);
            expect(notificacion.mediosExternosUtilizados).toHaveLength(1);
            expect(notificacion.mediosExternosUtilizados[0].tipo).toBe(TipoMedioContacto.EMAIL);
        });

        test("si no tiene medios de contacto o replicarMediosExternos es false, persiste 1 sola vez", async () => {
            mockPersona.mediosDeContacto = [];

            const notificacion = await service.enviarNotificacion({
                colectivoId: mockColectivo.id,
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                contenido: "Sin medios externos"
            });

            expect(mockSender.replicarPorMedios).not.toHaveBeenCalled();
            expect(mockNotifRepo.guardar).toHaveBeenCalledTimes(1);
            expect(notificacion.mediosExternosUtilizados).toHaveLength(0);
        });

        test("rechaza el envío si la persona colaboradora tiene mensajesInternos en false (HU10)", async () => {
            mockPersona.mensajesInternos = false;

            await expect(
                service.enviarNotificacion({
                    colectivoId: mockColectivo.id,
                    personaColaboradoraId: mockPersona.id,
                    perfilId: mockPerfil.id,
                    contenido: "Mensaje"
                })
            ).rejects.toThrow(UnprocessableEntityError);

            expect(mockNotifRepo.guardar).not.toHaveBeenCalled();
        });

        test("rechaza el envío si la persona nunca registró consentimiento (mensajesInternos no es true)", async () => {
            mockPersona.mensajesInternos = undefined;

            await expect(
                service.enviarNotificacion({
                    colectivoId: mockColectivo.id,
                    personaColaboradoraId: mockPersona.id,
                    perfilId: mockPerfil.id,
                    contenido: "Mensaje"
                })
            ).rejects.toThrow(UnprocessableEntityError);

            expect(mockNotifRepo.guardar).not.toHaveBeenCalled();
        });

        test("lanza UnprocessableEntityError si el contenido está vacío o en blanco", async () => {
            await expect(
                service.enviarNotificacion({
                    colectivoId: mockColectivo.id,
                    personaColaboradoraId: mockPersona.id,
                    perfilId: mockPerfil.id,
                    contenido: "   "
                })
            ).rejects.toThrow(UnprocessableEntityError);
        });

        test("lanza NotFoundError si el colectivo no existe", async () => {
            await expect(
                service.enviarNotificacion({
                    colectivoId: "col-inexistente",
                    personaColaboradoraId: mockPersona.id,
                    perfilId: mockPerfil.id,
                    contenido: "Mensaje"
                })
            ).rejects.toThrow(NotFoundError);
        });

        test("lanza NotFoundError si la persona colaboradora no existe", async () => {
            await expect(
                service.enviarNotificacion({
                    colectivoId: mockColectivo.id,
                    personaColaboradoraId: "colab-inexistente",
                    perfilId: mockPerfil.id,
                    contenido: "Mensaje"
                })
            ).rejects.toThrow(NotFoundError);
        });

        test("lanza NotFoundError si el perfil no existe", async () => {
            await expect(
                service.enviarNotificacion({
                    colectivoId: mockColectivo.id,
                    personaColaboradoraId: mockPersona.id,
                    perfilId: "perf-inexistente",
                    contenido: "Mensaje"
                })
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("obtenerNotificaciones y filtros", () => {
        test("filtra notificaciones delegando filtro en el repositorio", async () => {
            await service.enviarNotificacion({
                colectivoId: mockColectivo.id,
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                contenido: "Mensaje 1"
            });

            const todas = await service.obtenerNotificaciones();
            expect(todas).toHaveLength(1);

            const porDestinatario = await service.obtenerNotificaciones({
                destinatarioId: mockPersona.id
            });
            expect(porDestinatario).toHaveLength(1);
            expect(mockNotifRepo.buscarTodos).toHaveBeenCalledWith({ personaColaboradoraId: mockPersona.id });

            const porOtroDestinatario = await service.obtenerNotificaciones({
                destinatarioId: "colab-otro"
            });
            expect(porOtroDestinatario).toHaveLength(0);

            const noLeidas = await service.obtenerNotificaciones({ soloNoLeidas: true });
            expect(noLeidas).toHaveLength(1);
            expect(mockNotifRepo.buscarTodos).toHaveBeenCalledWith({ leida: false });
        });

        test("omite notificaciones huérfanas en el listado si la entidad ya no existe", async () => {
            await service.enviarNotificacion({
                colectivoId: mockColectivo.id,
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                contenido: "Mensaje válido"
            });

            // Agregamos una notificación huérfana directamente a la base mockeada
            notificacionesDb.push({
                id: "notif-huerfana",
                contenido: "Huérfana",
                fecha: new Date(),
                leida: false,
                colectivoId: "col-inexistente",
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                mediosExternosUtilizados: []
            });

            const listado = await service.obtenerNotificaciones();
            // Solo debe retornar la válida, omitiendo la huérfana
            expect(listado).toHaveLength(1);
            expect(listado[0].contenido).toBe("Mensaje válido");
        });
    });

    describe("obtenerNotificacionPorId", () => {
        test("devuelve la notificación reconstruida con objetos completos", async () => {
            const enviada = await service.enviarNotificacion({
                colectivoId: mockColectivo.id,
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                contenido: "Mensaje por ID"
            });

            const obtenida = await service.obtenerNotificacionPorId(enviada.id);
            expect(obtenida.id).toBe(enviada.id);
            expect(obtenida.colectivo.id).toBe(mockColectivo.id);
            expect(obtenida.personaColaboradora.id).toBe(mockPersona.id);
        });

        test("lanza NotFoundError si no existe en el repositorio", async () => {
            await expect(service.obtenerNotificacionPorId("notif-inexistente")).rejects.toThrow(NotFoundError);
        });

        test("lanza NotFoundError si la notificación existe pero es huérfana", async () => {
            notificacionesDb.push({
                id: "notif-huerfana-id",
                contenido: "Huérfana",
                fecha: new Date(),
                leida: false,
                colectivoId: "col-borrado",
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id
            });

            await expect(service.obtenerNotificacionPorId("notif-huerfana-id")).rejects.toThrow(NotFoundError);
        });
    });

    describe("actualizarEstadoLectura", () => {
        test("actualiza el estado de lectura de una notificación y persiste en el repositorio", async () => {
            const notificacion = await service.enviarNotificacion({
                colectivoId: mockColectivo.id,
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id,
                contenido: "Mensaje para leer"
            });

            expect(notificacion.leida).toBe(false);

            const actualizada = await service.actualizarEstadoLectura(notificacion.id, true);
            expect(actualizada.leida).toBe(true);

            // Comprueba persistencia en repositorio
            const enRepo = await mockNotifRepo.buscarPorId(notificacion.id);
            expect(enRepo.leida).toBe(true);
        });

        test("lanza NotFoundError si la notificación a marcar no existe", async () => {
            await expect(service.actualizarEstadoLectura("notif-inexistente", true)).rejects.toThrow(NotFoundError);
        });

        test("lanza NotFoundError si la notificación a marcar es huérfana", async () => {
            notificacionesDb.push({
                id: "notif-huerfana-patch",
                contenido: "Huérfana",
                fecha: new Date(),
                leida: false,
                colectivoId: "col-inexistente",
                personaColaboradoraId: mockPersona.id,
                perfilId: mockPerfil.id
            });

            await expect(service.actualizarEstadoLectura("notif-huerfana-patch", true)).rejects.toThrow(NotFoundError);
        });
    });
});

