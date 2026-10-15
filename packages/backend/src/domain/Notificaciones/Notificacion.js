import { randomUUID } from "crypto";

export class Notificacion {
    constructor({
        id,
        contenido,
        colectivo,
        personaColaboradora,
        perfil,
        fecha,
        leida = false,
        mediosExternosUtilizados = []
    } = {}) {
        if (!contenido || typeof contenido !== "string" || !contenido.trim()) {
            throw new Error("La notificación debe tener un contenido válido");
        }
        if (!colectivo) {
            throw new Error("La notificación debe tener un colectivo emisor");
        }
        if (!personaColaboradora) {
            throw new Error("La notificación debe tener una persona colaboradora destinataria");
        }
        if (!perfil) {
            throw new Error("La notificación debe estar asociada a un perfil de búsqueda");
        }

        this.id = id || randomUUID();
        this.contenido = contenido.trim();
        this.colectivo = colectivo;
        this.personaColaboradora = personaColaboradora;
        this.perfil = perfil;

        this.fecha = fecha || new Date();
        this.leida = Boolean(leida);
        this.mediosExternosUtilizados = [...mediosExternosUtilizados];
    }

    marcarLeida() {
        this.leida = true;
    }

    setLeida(estado = true) {
        this.leida = Boolean(estado);
    }

    registrarMedioUtilizado(medio) {
        if (!medio) {
            throw new Error("Debe proporcionar un medio de contacto para registrar");
        }
        this.mediosExternosUtilizados.push(medio);
    }

    toJSON() {
        return {
            id: this.id,
            contenido: this.contenido,
            fecha: this.fecha,
            leida: this.leida,
            colectivo: {
                id: this.colectivo.id,
                nombre: this.colectivo.nombre
            },
            personaColaboradora: {
                id: this.personaColaboradora.id,
                nombre: this.personaColaboradora.nombre,
                apellido: this.personaColaboradora.apellido,
                nombreFantasia: this.personaColaboradora.nombreFantasia
            },
            perfil: {
                id: this.perfil.id,
                nombre: this.perfil.nombre || this.perfil.descripcion
            },
            mediosExternosUtilizados: this.mediosExternosUtilizados
        };
    }
}