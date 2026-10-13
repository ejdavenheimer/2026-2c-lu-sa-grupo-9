const comoHabilidadPublica = (habilidad) => ({
    codigo: habilidad.codigo,
    titulo: habilidad.titulo,
    descripcion: habilidad.descripcion
});


export class Compatibilidad {
    constructor({
        perfil,
        personaColaboradora,
        puntaje = 0,
        requeridasFaltantes = [],
        opcionalesCumplidas = []
    } = {}) {
        this.perfil = perfil;
        this.personaColaboradora = personaColaboradora;
        this.puntaje = puntaje;
        this.requeridasFaltantes = requeridasFaltantes;
        this.opcionalesCumplidas = opcionalesCumplidas;
    }

    get esCompatible() {
        return this.requeridasFaltantes.length === 0;
    }

    get cumpleAlgunaRequerida() {
        return this.requeridasFaltantes.length < this.perfil.habilidadesRequeridas.length;
    }

    /**
     * Comparador para ordenar de mayor a menor puntaje. Ante igual puntaje desempata por
     * cantidad de opcionales cumplidas, para que el orden no quede al azar.
     *
     * Ojo: ordenar por puntaje no implica ordenar por compatibilidad. Las opcionales suman sin
     * ser requisito, así que alguien que no es compatible puede puntuar más alto que alguien
     * que sí lo es. Hay que filtrar por esCompatible ANTES de ordenar, nunca después.
     */
    static compararPorPuntaje(unaCompatibilidad, otraCompatibilidad) {
        if (otraCompatibilidad.puntaje !== unaCompatibilidad.puntaje) {
            return otraCompatibilidad.puntaje - unaCompatibilidad.puntaje;
        }
        return otraCompatibilidad.opcionalesCumplidas.length - unaCompatibilidad.opcionalesCumplidas.length;
    }

    toJSON() {
        return {
            esCompatible: this.esCompatible,
            cumpleAlgunaRequerida: this.cumpleAlgunaRequerida,
            puntaje: this.puntaje,
            requeridasFaltantes: this.requeridasFaltantes.map(comoHabilidadPublica),
            opcionalesCumplidas: this.opcionalesCumplidas.map(comoHabilidadPublica)
        };
    }
}
