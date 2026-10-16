import { ConflictError, UnprocessableEntityError } from "../errors/AppError.js";
import { TipoMedioContacto } from "./enums.js";

export class PersonaColaboradora {
    constructor({
        nombreFantasia,
        nombre,
        apellido,
        pronombres = [],
        presentacion,
        cuentas = [],
        habilidades = [],
        colaboraciones = [],
        mediosDeContacto = [],
        mensajesInternos
    } = {}) {
        if (!nombreFantasia && (!nombre || !apellido) && cuentas.length === 0)  {
            throw new UnprocessableEntityError("La persona colaboradora debe poseer al menos un nombre de fantasia o nombre y apellido");
        }
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
        this.mediosDeContacto = mediosDeContacto;
        this.mensajesInternos = mensajesInternos;
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

    agregarMedioDeContacto(medioDeContacto){
        if (!medioDeContacto.tipo || !medioDeContacto.valor){
            throw new UnprocessableEntityError("Debe proporcionar un medio de contacto valido.")
        }
        if (this.mediosDeContacto.some((mc) => mc.valor === medioDeContacto.valor && mc.tipo === medioDeContacto.tipo)){
            throw new ConflictError(`El medio de contacto '${medioDeContacto.tipo || medioDeContacto.valor}' ya fue agregado a esta persona colaboradora`)
        }
        this.mediosDeContacto.push(medioDeContacto)
    }

    modificarMedioContacto(medioContacto){
        const medioContactoViejo = this.mediosDeContacto.find(mc => mc.tipo === medioContacto.tipo)
        if (!medioContactoViejo) {
            throw new ConflictError('El medio de contacto que desea modificar nunca se agrego a la persona colaboradoa')
        }
        medioContactoViejo.valor = medioContacto.valor; 
    }

    eliminarMedioContacto(medioContacto){
        const index = this.mediosDeContacto.findIndex(mc => mc.tipo === medioContacto.tipo);
        if (index === -1) {
            throw new ConflictError('El medio de contacto que desea eliminar no existe');
        }
        this.mediosDeContacto.splice(index, 1);
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
            })),
            mediosDeContacto: this.mediosDeContacto.length > 0 
                ? this.mediosDeContacto.map(mc => mc.toJSON()) 
                : this.mediosDeContacto,
            mensajesInternos: this.mensajesInternos
        };
    }
}

