

export class PersonaColaboradora {
    constructor({
        nombreFantasia,
        nombre,
        apellido,
        pronombres = [],
        presentacion,
        cuentas = [],
        habilidades = [],
        colaboraciones = []
    }) {
        if (!nombreFantasia || cuentas.length === 0) {
            throw new Error("La persona colaboradora debe poseer al menos un nombre de fantasia");
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
    }

    agregarHabilidad(habilidad) {
        if (!habilidad) {
            throw new Error("Debe proporcionar una habilidad para agregar");
        }

        if (!this.habilidades.some((h) => h.codigo === habilidad.codigo)) {
            this.habilidades.push(habilidad);
        }
    }

    agregarColaboracion(colaboracion) {
        if (!colaboracion) {
            throw new Error("Debe proporcionar una colaboracion para agregar");
        }
        this.colaboraciones.push(colaboracion);
    }

    finalizarProyecto(proyecto) {
        if (proyecto && typeof proyecto.cerrarProyecto === "function") {
            proyecto.cerrarProyecto();
        }
    }

}
