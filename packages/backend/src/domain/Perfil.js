import { randomUUID } from "crypto";
import { UnidadCompromiso, ModalidadColaboracion } from "./enums.js";
import { UnprocessableEntityError } from "../errors/AppError.js";

export class Perfil {
    constructor({
        id,
        descripcion,
        habilidadesObligatorias = [],
        habilidadesOpcionales = [],
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion = [],
        proyecto
    } = {}) {
        if (!descripcion || typeof descripcion !== "string" || !descripcion.trim()) {
            throw new UnprocessableEntityError("El perfil requiere una descripción no vacía");
        }
        if (!Array.isArray(habilidadesObligatorias) || habilidadesObligatorias.length === 0) {
            throw new UnprocessableEntityError("El perfil requiere al menos una habilidad obligatoria");
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
        this.descripcion = descripcion.trim();
        this.habilidadesObligatorias = habilidadesObligatorias;
        this.habilidadesOpcionales = Array.isArray(habilidadesOpcionales) ? habilidadesOpcionales : [];

        if (this.habilidadesOpcionales.some((opc) => this.habilidadesObligatorias.some((ob) => ob.codigo === opc.codigo))) {
            throw new UnprocessableEntityError("Una habilidad no puede ser obligatoria y opcional simultáneamente");
        }

        this.unidadCompromiso = unidadCompromiso;
        this.cantidadHoras = cantidadHoras;
        this.modalidadesColaboracion = modalidadesColaboracion;
        this.proyecto = proyecto || null;
    }

    get habilidadesRequeridas() {
        return this.habilidadesObligatorias;
    }

    validarColaborador(personaColaboradora) {
        if (!personaColaboradora || !Array.isArray(personaColaboradora.habilidades)) {
            return false;
        }
        return this.habilidadesObligatorias.some((habOblig) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habOblig.codigo)
        );
    }

    cumpleTodasObligatorias(personaColaboradora) {
        if (!personaColaboradora || !Array.isArray(personaColaboradora.habilidades)) {
            return false;
        }
        return this.habilidadesObligatorias.every((habOblig) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habOblig.codigo)
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
            descripcion: this.descripcion,
            habilidadesObligatorias: this.habilidadesObligatorias.map((h) => ({
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
