import { Notificacion } from "../../src/domain/Notificaciones/Notificacion.js";

describe("Notificacion - Dominio", () => {
    const mockColectivo = { id: "col-1", nombre: "Fundación Test" };
    const mockPersona = { id: "colab-1", nombre: "Juan", apellido: "Pérez" };
    const mockPerfil = { id: "perf-1", nombre: "Frontend React" };

    test("crea una notificación exitosamente con todos los campos", () => {
        const notificacion = new Notificacion({
            contenido: "Hola, te invitamos al proyecto",
            colectivo: mockColectivo,
            personaColaboradora: mockPersona,
            perfil: mockPerfil
        });

        expect(notificacion.id).toBeDefined();
        expect(notificacion.contenido).toBe("Hola, te invitamos al proyecto");
        expect(notificacion.colectivo).toBe(mockColectivo);
        expect(notificacion.personaColaboradora).toBe(mockPersona);
        expect(notificacion.perfil).toBe(mockPerfil);
        expect(notificacion.leida).toBe(false);
        expect(notificacion.mediosExternosUtilizados).toEqual([]);
    });

    test("marcarLeida y setLeida cambian correctamente el estado de lectura", () => {
        const notificacion = new Notificacion({
            contenido: "Aviso importante",
            colectivo: mockColectivo,
            personaColaboradora: mockPersona,
            perfil: mockPerfil
        });

        expect(notificacion.leida).toBe(false);

        notificacion.marcarLeida();
        expect(notificacion.leida).toBe(true);

        notificacion.setLeida(false);
        expect(notificacion.leida).toBe(false);

        notificacion.setLeida(true);
        expect(notificacion.leida).toBe(true);
    });

    test("registrarMedioUtilizado agrega el registro a la lista", () => {
        const notificacion = new Notificacion({
            contenido: "Aviso",
            colectivo: mockColectivo,
            personaColaboradora: mockPersona,
            perfil: mockPerfil
        });

        notificacion.registrarMedioUtilizado({
            tipo: "EMAIL",
            valor: "juan@example.com",
            exitoso: true
        });

        expect(notificacion.mediosExternosUtilizados).toHaveLength(1);
        expect(notificacion.mediosExternosUtilizados[0].tipo).toBe("EMAIL");
        expect(notificacion.mediosExternosUtilizados[0].valor).toBe("juan@example.com");
    });

    test("lanza error si falta contenido válido", () => {
        expect(() => {
            new Notificacion({
                contenido: "   ",
                colectivo: mockColectivo,
                personaColaboradora: mockPersona,
                perfil: mockPerfil
            });
        }).toThrow("La notificación debe tener un contenido válido");
    });

    test("lanza error si falta colectivo", () => {
        expect(() => {
            new Notificacion({
                contenido: "Contenido",
                personaColaboradora: mockPersona,
                perfil: mockPerfil
            });
        }).toThrow("La notificación debe tener un colectivo emisor");
    });

    test("lanza error si falta persona colaboradora", () => {
        expect(() => {
            new Notificacion({
                contenido: "Contenido",
                colectivo: mockColectivo,
                perfil: mockPerfil
            });
        }).toThrow("La notificación debe tener una persona colaboradora destinataria");
    });

    test("lanza error si falta perfil", () => {
        expect(() => {
            new Notificacion({
                contenido: "Contenido",
                colectivo: mockColectivo,
                personaColaboradora: mockPersona
            });
        }).toThrow("La notificación debe estar asociada a un perfil de búsqueda");
    });

    test("toJSON formatea adecuadamente la notificación", () => {
        const notificacion = new Notificacion({
            id: "notif-abc",
            contenido: "Mensaje",
            colectivo: mockColectivo,
            personaColaboradora: mockPersona,
            perfil: mockPerfil,
            leida: true
        });

        const json = notificacion.toJSON();
        expect(json.id).toBe("notif-abc");
        expect(json.contenido).toBe("Mensaje");
        expect(json.leida).toBe(true);
        expect(json.colectivoId).toBeUndefined();
        expect(json.personaColaboradoraId).toBeUndefined();
        expect(json.perfilId).toBeUndefined();
        expect(json.colectivo).toEqual({ id: "col-1", nombre: "Fundación Test" });
        expect(json.personaColaboradora).toEqual({ id: "colab-1", nombre: "Juan", apellido: "Pérez", nombreFantasia: undefined });
        expect(json.perfil).toEqual({ id: "perf-1", nombre: "Frontend React" });
    });
});
