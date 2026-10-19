import {ConflictError, NotFoundError, UnprocessableEntityError} from "../errors/AppError.js";
import {TipoMedioContacto} from "./enums.js";
import {randomUUID} from "crypto";

export class PersonaColaboradora {
    constructor({
        id,
        nombreFantasia,
        nombre,
        apellido,
        pronombres = [],
        presentacion,
        cuentas = [],
        habilidades = [],
        colaboraciones = [],
        mensajesInternos = false,
        mediosDeContacto = []
    } = {}) {
        if (!nombreFantasia && (!nombre || !apellido) && cuentas.length === 0)  {
            throw new UnprocessableEntityError("La persona colaboradora debe poseer al menos un nombre de fantasia o nombre y apellido");
        }
        this.id = id || randomUUID();
        this.nombreFantasia = nombreFantasia;
        this.nombre = nombre;
        this.apellido = apellido;
        this.pronombres = [...new Set(
            pronombres.map((p) => String(p).trim()).filter(Boolean)
        )];
        this.presentacion = presentacion;
        this.cuentas = cuentas;
        this.habilidades = habilidades;
        this.colaboraciones = colaboraciones;
        this.mensajesInternos = mensajesInternos === true;
        this.mediosDeContacto = [];
        mediosDeContacto.forEach((medio) => this.agregarMedioDeContacto(medio));
    }

    agregarMedioDeContacto(medio) {
        const nuevo = this.#normalizarMedioDeContacto(medio);
        if (this.#existeMedio(nuevo)) return;
        this.mediosDeContacto.push(nuevo);
    }

    actualizarMediosDeContacto(medio) {
        const nuevo = this.#normalizarMedioDeContacto(medio);
        if (this.#existeMedio(nuevo)) return;
        const existente = this.mediosDeContacto.find((m) => m.tipo === nuevo.tipo);
        if (!existente) {
            throw new NotFoundError(`No existe un medio de contacto de tipo ${nuevo.tipo}`);
        }
        existente.valor = nuevo.valor;
    }

    aceptaMensajesInternos() {
        return this.mensajesInternos === true;
    }

    agregarHabilidad(habilidad) {
        if (!habilidad) {
            throw new UnprocessableEntityError("Debe proporcionar una habilidad para agregar");
        }

        if (this.habilidades.some((h) => h.codigo === habilidad.codigo)) {
            throw new ConflictError(`La habilidad '${habilidad.titulo || habilidad.codigo}' ya fue agregada a esta persona colaboradora`);
        }

        this.habilidades.push(habilidad);
    }

    agregarColaboracion(colaboracion) {
        if (!colaboracion) {
            throw new UnprocessableEntityError("Debe proporcionar una colaboracion para agregar");
        }
        this.colaboraciones.push(colaboracion);
    }

    tieneHabilidad(codigo) {
        if(!codigo || !Array.isArray(this.habilidades)) {
            return false;
        }
        return this.habilidades.some(h => h?.codigo === codigo)
    }

    codigosDeHabilidades() {
        if(!Array.isArray(this.habilidades)) {
            return [];
        }
        return [...new Set(this.habilidades.map(h => h?.codigo).filter(Boolean))];

    }

    #existeMedio({ tipo, valor }) {
        return this.mediosDeContacto.some((m) => m.tipo === tipo && m.valor === valor);
    }

    #normalizarMedioDeContacto(medio) {
        const tipo = medio?.tipo;
        const valor = typeof medio?.valor === "string" ? medio.valor.trim() : "";
        if (!Object.values(TipoMedioContacto).includes(tipo)) {
            throw new UnprocessableEntityError(`Tipo de medio de contacto inválido. Valores permitidos: ${Object.values(TipoMedioContacto).join(", ")}`);
        }
        if (!valor) {
            throw new UnprocessableEntityError("El medio de contacto debe tener un valor");
        }
        return { tipo, valor };
    }

    toJSON() {
        return {
            id: this.id,
            nombreFantasia: this.nombreFantasia,
            nombre: this.nombre,
            apellido: this.apellido,
            pronombres: this.pronombres,
            presentacion: this.presentacion,
            cuentas: this.cuentas,
            habilidades: this.habilidades,
            mensajesInternos: this.mensajesInternos,
            colaboraciones: this.colaboraciones.map((c) => ({
                id: c.id,
                fechaInscripcion: c.fechaInscripcion,
                proyecto: c.proyecto ? {
                    id: c.proyecto.id,
                    titulo: c.proyecto.titulo,
                    descripcion: c.proyecto.descripcion,
                    estado: c.proyecto.estado
                } : null
            }))
        };
    }
}

