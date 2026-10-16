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
