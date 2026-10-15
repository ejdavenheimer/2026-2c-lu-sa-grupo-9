import { randomUUID } from "crypto";
import { UnidadCompromiso, ModalidadColaboracion } from "./enums.js";
import { UnprocessableEntityError } from "../errors/AppError.js";
import { Compatibilidad } from "./Compatibilidad.js";

const PESO_REQUERIDAS = 0.7;

export class Perfil {
    constructor({
        id,
        nombre,
        descripcion,
        habilidadesRequeridas = [],
        habilidadesOpcionales = [],
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion = [],
        proyecto
    } = {}) {
        const descTexto = descripcion && typeof descripcion === "string" ? descripcion.trim() : "";
        const nomTexto = nombre && typeof nombre === "string" ? nombre.trim() : "";

        if (!nomTexto && !descTexto) {
            throw new UnprocessableEntityError("El perfil requiere una descripción no vacía");
        }

        this.nombre = nomTexto || descTexto;
        this.descripcion = descTexto || nomTexto;

        if (!Array.isArray(habilidadesRequeridas) || habilidadesRequeridas.length === 0) {
            throw new UnprocessableEntityError("El perfil requiere al menos una habilidad requerida");
        }

        if (!unidadCompromiso || !Object.values(UnidadCompromiso).includes(unidadCompromiso)) {
            throw new UnprocessableEntityError("El perfil requiere una unidad de compromiso válida");
        }
        if (cantidadHoras === undefined || cantidadHoras === null || typeof cantidadHoras !== "number" || cantidadHoras <= 0) {
            throw new UnprocessableEntityError("La cantidad de horas debe ser un número positivo");
        }
        if (
            !Array.isArray(modalidadesColaboracion) ||
            modalidadesColaboracion.length === 0 ||
            !modalidadesColaboracion.every((m) => Object.values(ModalidadColaboracion).includes(m))
        ) {
            throw new UnprocessableEntityError("Debe indicar al menos una modalidad de colaboración válida");
        }

        this.id = id || `perf-${randomUUID()}`;
        this.habilidadesRequeridas = habilidadesRequeridas;
        this.habilidadesOpcionales = Array.isArray(habilidadesOpcionales) ? habilidadesOpcionales : [];

        if (this.habilidadesOpcionales.some((opc) => this.habilidadesRequeridas.some((ob) => ob.codigo === opc.codigo))) {
            throw new UnprocessableEntityError("Una habilidad no puede ser requerida y opcional simultáneamente");
        }

        this.unidadCompromiso = unidadCompromiso;
        this.cantidadHoras = cantidadHoras;
        this.modalidadesColaboracion = modalidadesColaboracion;
        this.proyecto = proyecto || null;
    }

    validarColaborador(personaColaboradora) {
        if (!personaColaboradora || !Array.isArray(personaColaboradora.habilidades)) {
            return false;
        }
        return this.habilidadesRequeridas.some((habReq) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habReq.codigo)
        );
    }

    cumpleTodasRequeridas(personaColaboradora) {
        if (!personaColaboradora || !Array.isArray(personaColaboradora.habilidades)) {
            return false;
        }
        return this.habilidadesRequeridas.every((habReq) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habReq.codigo)
        );
    }

    calcularAfinidadOpcionales(personaColaboradora) {
        if (!personaColaboradora || !Array.isArray(personaColaboradora.habilidades) || this.habilidadesOpcionales.length === 0) {
            return 0;
        }
        const coinciden = this.habilidadesOpcionales.filter((habOpc) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habOpc.codigo)
        );
        return coinciden.length;
    }

    codigosRequeridos() {
        return [...new Set(this.habilidadesRequeridas.map((h) => h?.codigo).filter(Boolean))];
    }

    evaluarCompatibilidad(personaColaboradora) {
        if (typeof personaColaboradora?.tieneHabilidad !== "function") {
            throw new UnprocessableEntityError(
                "Se requiere una persona colaboradora para evaluar la compatibilidad"
            );
        }

        const requeridasFaltantes = this.habilidadesRequeridas.filter(
            (habilidad) => !personaColaboradora.tieneHabilidad(habilidad.codigo)
        );

        const opcionalesCumplidas = this.habilidadesOpcionales.filter((habilidad) =>
            personaColaboradora.tieneHabilidad(habilidad.codigo)
        );

        const cantidadRequeridasCumplidas = this.habilidadesRequeridas.length - requeridasFaltantes.length;

        return new Compatibilidad({
            perfil: this,
            personaColaboradora,
            puntaje: this.#calcularPuntaje(cantidadRequeridasCumplidas, opcionalesCumplidas.length),
            requeridasFaltantes,
            opcionalesCumplidas
        });
    }

    #calcularPuntaje(requeridasCumplidas, opcionalesCumplidas) {
        const totalRequeridas = this.habilidadesRequeridas.length;
        const totalOpcionales = this.habilidadesOpcionales.length;

        if (totalRequeridas === 0) {
            return 0;
        }

        const proporcionRequeridas = requeridasCumplidas / totalRequeridas;

        if (totalOpcionales === 0) {
            return Math.round(100 * proporcionRequeridas);
        }

        const proporcionOpcionales = opcionalesCumplidas / totalOpcionales;

        return Math.round(
            100 * (PESO_REQUERIDAS * proporcionRequeridas + (1 - PESO_REQUERIDAS) * proporcionOpcionales)
        );
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            habilidadesRequeridas: this.habilidadesRequeridas.map((h) => ({
                id: h.id,
                titulo: h.titulo,
                codigo: h.codigo,
                descripcion: h.descripcion
            })),
            habilidadesOpcionales: this.habilidadesOpcionales.map((h) => ({
                id: h.id,
                titulo: h.titulo,
                codigo: h.codigo,
                descripcion: h.descripcion
            })),
            unidadCompromiso: this.unidadCompromiso,
            cantidadHoras: this.cantidadHoras,
            modalidadesColaboracion: this.modalidadesColaboracion,
            proyectoId: this.proyecto ? (this.proyecto.id || this.proyecto) : undefined
        };
    }
}
