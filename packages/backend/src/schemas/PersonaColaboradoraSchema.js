let PersonaColaboradoraModel = null;
let PersonaColaboradoraSchema = null;

try {
    const mongooseModule = await import("mongoose").catch(() => null);
    if (mongooseModule) {
        const mongoose = mongooseModule.default || mongooseModule;

        PersonaColaboradoraSchema = new mongoose.Schema(
            {
                id: {
                    type: String,
                    unique: true,
                    sparse: true,
                    index: true
                },
                nombre: {
                    type: String,
                    trim: true
                },
                apellido: {
                    type: String,
                    trim: true
                },
                nombreFantasia: {
                    type: String,
                    trim: true
                },
                pronombres: [
                    {
                        type: String,
                        trim: true
                    }
                ],
                presentacion: {
                    type: String,
                    trim: true
                },
                cuentas: [
                    {
                        nombreUsuario: { type: String, trim: true },
                        tipo: { type: String, trim: true }
                    }
                ],
                habilidades: [
                    {
                        titulo: { type: String, trim: true },
                        codigo: { type: String, trim: true },
                        descripcion: { type: String, trim: true }
                    }
                ],
                colaboraciones: [
                    {
                        id: { type: String, trim: true },
                        proyecto: { type: String, trim: true },
                        fechaInscripcion: { type: Date, default: Date.now },
                        esAnonima: { type: Boolean, default: false }
                    }
                ],
                mensajesInternos: {
                    type: Boolean,
                    default: true
                },
                mediosDeContacto: [
                    {
                        tipo: { type: String, required: true },
                        valor: { type: String, required: true }
                    }
                ]
            },
            {
                timestamps: true
            }
        );

        PersonaColaboradoraModel = mongoose.models.PersonaColaboradora || mongoose.model("PersonaColaboradora", PersonaColaboradoraSchema);
    }
} catch {
    // Continuar sin romper tests unitarios si mongoose no está conectado
}

export { PersonaColaboradoraSchema, PersonaColaboradoraModel };
