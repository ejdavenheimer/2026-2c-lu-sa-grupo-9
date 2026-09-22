import { GeorefAdapter } from "./external/GeorefAdapter.js";

const PAISES_DISPONIBLES = [
    { id: "AR", nombre: "Argentina" },
    { id: "UY", nombre: "Uruguay" },
    { id: "CL", nombre: "Chile" },
    { id: "BR", nombre: "Brasil" },
    { id: "PY", nombre: "Paraguay" },
    { id: "BO", nombre: "Bolivia" }
].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export class UbicacionService {
    constructor(georefAdapter = new GeorefAdapter()) {
        this.georefAdapter = georefAdapter;
    }

    async obtenerProvincias() {
        return this.georefAdapter.obtenerProvincias();
    }

    obtenerPaises() {
        return PAISES_DISPONIBLES;
    }
}
