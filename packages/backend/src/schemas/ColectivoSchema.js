let ColectivoModel = null;
let ColectivoSchema = null;

try {
    const mongooseModule = await import("mongoose").catch(() => null);
    if (mongooseModule) {
        const mongoose = mongooseModule.default || mongooseModule;

        ColectivoSchema = new mongoose.Schema(
            {
                id: {
                    type: String,
                    unique: true,
                    sparse: true,
                    index: true
                },
                nombre: {
                    type: String,
                    required: true,
                    trim: true
                },
                descripcion: {
                    type: String,
                    trim: true
                },
                tipo: {
                    type: String
                }
            },
            {
                timestamps: true
            }
        );

        ColectivoModel = mongoose.models.Colectivo || mongoose.model("Colectivo", ColectivoSchema);
    }
} catch {
    // Continuar sin romper tests unitarios si mongoose no está conectado
}

export { ColectivoSchema, ColectivoModel };
