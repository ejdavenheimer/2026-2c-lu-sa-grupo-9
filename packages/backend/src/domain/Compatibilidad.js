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

    get proyecto() {
        return this.perfil?.proyecto ?? null;
    }

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
