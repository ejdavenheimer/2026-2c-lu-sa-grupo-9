export class Ubicacion {
    constructor({ pais, provincia, ciudad }) {
        this.pais = pais;
        this.provincia = provincia || null;
        this.ciudad = ciudad || null;
    }
}
