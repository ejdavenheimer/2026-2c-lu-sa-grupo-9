import { randomUUID } from "crypto";
import { UnidadCompromiso, ModalidadColaboracion } from "./enums.js";
import { UnprocessableEntityError } from "../errors/AppError.js";

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
