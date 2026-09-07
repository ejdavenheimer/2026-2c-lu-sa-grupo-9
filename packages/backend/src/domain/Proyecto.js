import { UnidadCompromiso, ModalidadColaboracion, EstadoProyecto } from "./enums.js";
import { Colectivo } from "./Colectivo.js";
import { Colaboracion } from "./Colaboracion.js"
import { Habilidad } from "./Habilidad.js"

export class Proyecto {
    constructor({titulo, descripcion, unidadCompromiso, cantidadHoras, modalidadesColaboracion, estado, fechaAlta, colectivo, habilidadesRequeridas, colaboraciones}) {
        if(!titulo || !descripcion || !unidadCompromiso || !cantidadHoras || !modalidadesColaboracion || !estado || !fechaAlta || !colectivo || !habilidadesRequeridas || !colaboraciones) {
            throw new Error("El proyecto requiere un titulo, descripcion, unidadCompromiso, cantidadHoras, modalidadesColaboracion, estado, fechaAlta, colectivo, habilidadesRequeridas y una colaboracion");
        }
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.unidadCompromiso = unidadCompromiso;
        this.cantidadHoras = cantidadHoras;
        this.modalidadesColaboracion = modalidadesColaboracion;
        this.estado = EstadoProyecto.PUBLICADO;
        this.fechaAlta = fechaAlta;
        this.fechaCierre = undefined;
        this.colectivo = colectivo;
        this.habilidadesRequeridas = habilidadesRequeridas;
        this.colaboraciones = colaboraciones;
        }

        agregarColaboracion(personaColaboradora) {
            if(this.validarColaborador(personaColaboradora) && this.fechaCierre == undefined) {
                let nuevaColaboracion = new Colaboracion(new Date(), personaColaboradora, this);
                this.colaboraciones.push(nuevaColaboracion);
            } else {
                throw new Error("El colaborador no puede colaborar en este proyecto")
            }
        }
        
        validarColaborador(personaColaboradora) {
            return this.habilidadesRequeridas.some((habilidadRequerida) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habilidadRequerida.codigo)
        )
    }
        cerrarProyecto() {
            this.fechaCierre = new Date();
            this.estado = EstadoProyecto.CERRADO;
        }


    }

