import { Notificacion } from "../domain/Notificaciones/Notificacion.js";
import { NotificadorSender } from "../domain/Notificaciones/estrategias/NotificadorSender.js";
import { NotificacionRepository } from "../repositories/NotificacionRepository.js";
import { ColectivoRepository } from "../repositories/ColectivoRepository.js";
import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { PerfilRepository } from "../repositories/PerfilRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class NotificacionService {
    constructor({
        notificacionRepository = NotificacionRepository,
        colectivoRepository = ColectivoRepository,
        personaColaboradoraRepository = PersonaColaboradoraRepository,
        perfilRepository = PerfilRepository,
        notificadorSender = new NotificadorSender()
    } = {}) {
        this.notificacionRepository = notificacionRepository;
        this.colectivoRepository = colectivoRepository;
        this.personaColaboradoraRepository = personaColaboradoraRepository;
        this.perfilRepository = perfilRepository;
        this.notificadorSender = notificadorSender;
    }

    async #reconstruir(registro) {
        if (!registro) return null;
        const colectivo = await this.colectivoRepository.buscarPorId(registro.colectivoId);
        const personaColaboradora = await this.personaColaboradoraRepository.buscarPorId(registro.personaColaboradoraId);
        const perfil = await this.perfilRepository.buscarPorId(registro.perfilId);

        if (!colectivo || !personaColaboradora || !perfil) {
            return null; // Referencia huérfana
        }

        return new Notificacion({
            id: registro.id,
            contenido: registro.contenido,
            fecha: registro.fecha,
            leida: registro.leida,
            colectivo,
            personaColaboradora,
            perfil,
            mediosExternosUtilizados: registro.mediosExternosUtilizados || []
        });
    }

    enviarNotificacion = async ({
        colectivoId,
        personaColaboradoraId,
        perfilId,
        contenido,
        replicarMediosExternos = true
    } = {}) => {
        if (!contenido || typeof contenido !== "string" || !contenido.trim()) {
            throw new UnprocessableEntityError("La notificación debe tener un contenido válido");
        }

        const colectivo = await this.colectivoRepository.buscarPorId(colectivoId);
        if (!colectivo) {
            throw new NotFoundError(`No se encontró el colectivo con ID '${colectivoId}'`);
        }

        const personaColaboradora = await this.personaColaboradoraRepository.buscarPorId(personaColaboradoraId);
        if (!personaColaboradora) {
            throw new NotFoundError(`No se encontró la persona colaboradora con ID '${personaColaboradoraId}'`);
        }

        const perfil = await this.perfilRepository.buscarPorId(perfilId);
        if (!perfil) {
            throw new NotFoundError(`No se encontró el perfil con ID '${perfilId}'`);
        }

        // Validación de consentimiento (HU10): La persona debe haber aceptado mensajes internos
        if (personaColaboradora.mensajesInternos !== true) {
            throw new UnprocessableEntityError("La persona colaboradora no ha aceptado ser contactada mediante mensajes internos");
        }

        const notificacion = new Notificacion({
            contenido,
            colectivo,
            personaColaboradora,
            perfil
        });

        // 1. Persistir primero el mensaje interno
        await this.notificacionRepository.guardar(notificacion);

        // 2. Replicar en medios externos si corresponde y la persona posee medios de contacto registrados (HU11)
        if (
            replicarMediosExternos &&
            Array.isArray(personaColaboradora.mediosDeContacto) &&
            personaColaboradora.mediosDeContacto.length > 0
        ) {
            await this.notificadorSender.replicarPorMedios(personaColaboradora.mediosDeContacto, notificacion);
            await this.notificacionRepository.guardar(notificacion);
        }

        return notificacion.toJSON();
    };

    obtenerNotificaciones = async ({ destinatarioId, colectivoId, soloNoLeidas } = {}) => {
        const filtro = {};
        if (destinatarioId) {
            filtro.personaColaboradoraId = destinatarioId;
        }
        if (colectivoId) {
            filtro.colectivoId = colectivoId;
        }
        if (soloNoLeidas === true || soloNoLeidas === "true") {
            filtro.leida = false;
        }

        const registros = await this.notificacionRepository.buscarTodos(filtro);
        const reconstruidos = await Promise.all(registros.map((r) => this.#reconstruir(r)));
        return reconstruidos
            .filter(Boolean)
            .map((n) => n.toJSON());
    };

    obtenerNotificacionPorId = async (id) => {
        const registro = await this.notificacionRepository.buscarPorId(id);
        const notificacion = registro ? await this.#reconstruir(registro) : null;
        if (!notificacion) {
            throw new NotFoundError(`No se encontró la notificación con ID '${id}'`);
        }
        return notificacion.toJSON();
    };

    actualizarEstadoLectura = async (id, leida) => {
        const registro = await this.notificacionRepository.buscarPorId(id);
        const notificacion = registro ? await this.#reconstruir(registro) : null;
        if (!notificacion) {
            throw new NotFoundError(`No se encontró la notificación con ID '${id}'`);
        }

        notificacion.setLeida(leida);
        await this.notificacionRepository.guardar(notificacion);
        return notificacion.toJSON();
    };
}
