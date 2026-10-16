const PROVINCIAS_ARGENTINA_FALLBACK = [
    { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" },
    { id: "06", nombre: "Buenos Aires" },
    { id: "10", nombre: "Catamarca" },
    { id: "22", nombre: "Chaco" },
    { id: "26", nombre: "Chubut" },
    { id: "14", nombre: "Córdoba" },
    { id: "18", nombre: "Corrientes" },
    { id: "30", nombre: "Entre Ríos" },
    { id: "34", nombre: "Formosa" },
    { id: "38", nombre: "Jujuy" },
    { id: "42", nombre: "La Pampa" },
    { id: "46", nombre: "La Rioja" },
    { id: "50", nombre: "Mendoza" },
    { id: "54", nombre: "Misiones" },
    { id: "58", nombre: "Neuquén" },
    { id: "62", nombre: "Río Negro" },
    { id: "66", nombre: "Salta" },
    { id: "70", nombre: "San Juan" },
    { id: "74", nombre: "San Luis" },
    { id: "78", nombre: "Santa Cruz" },
    { id: "82", nombre: "Santa Fe" },
    { id: "86", nombre: "Santiago del Estero" },
    { id: "94", nombre: "Tierra del Fuego, Antártida e Islas del Atlántico Sur" },
    { id: "90", nombre: "Tucumán" }
].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export class GeorefAdapter {
    constructor({ baseUrl = "https://apis.datos.gob.ar/georef/api", fetchFn = globalThis.fetch } = {}) {
        this.baseUrl = baseUrl;
        this.fetch = fetchFn;
    }

    async obtenerProvincias() {
        try {
            const respuesta = await this.fetch(`${this.baseUrl}/provincias?campos=id,nombre&max=100`);
            if (!respuesta.ok) {
                return PROVINCIAS_ARGENTINA_FALLBACK;
            }
            const data = await respuesta.json();
            if (!data || !Array.isArray(data.provincias)) {
                return PROVINCIAS_ARGENTINA_FALLBACK;
            }

            return data.provincias
                .map((provincia) => ({
                    id: String(provincia.id),
                    nombre: provincia.nombre
                }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        } catch {
            // Ante falla de red o indisponibilidad del servicio externo, retorna el catálogo oficial
            return PROVINCIAS_ARGENTINA_FALLBACK;
        }
    }
}
