let PerfilModel = null;
let PerfilSchema = null;

try {
    const mongooseModule = await import("mongoose").catch(() => null);
    if (mongooseModule) {
        const mongoose = mongooseModule.default || mongooseModule;
        const { UnidadCompromiso, ModalidadColaboracion } = await import("../domain/enums.js");

        PerfilSchema = new mongoose.Schema(
            {
                id: {
                    type: String,
                    required: true,
                    unique: true,
                    index: true
                },
                descripcion: {
                    type: String,
                    required: true,
                    trim: true
                },
                habilidadesObligatorias: [
                    {
                        codigo: { type: String, required: true },
                        titulo: { type: String },
                        descripcion: { type: String }
                    }
                ],
                habilidadesOpcionales: [
                    {
                        codigo: { type: String, required: true },
                        titulo: { type: String },
                        descripcion: { type: String }
                    }
                ],
                unidadCompromiso: {
                    type: String,
                    enum: Object.values(UnidadCompromiso),
                    required: true
                },
                cantidadHoras: {
                    type: Number,
                    required: true,
                    min: 1
                },
                modalidadesColaboracion: [
                    {
                        type: String,
                        enum: Object.values(ModalidadColaboracion),
                        required: true
                    }
                ],
                proyectoId: {
                    type: String,
                    required: true,
                    index: true
                }
            },
            {
                timestamps: true
            }
        );

        PerfilModel = mongoose.models.Perfil || mongoose.model("Perfil", PerfilSchema);
    }
} catch {
    // Si mongoose aún no está instalado en node_modules local, se continúa sin romper tests unitarios
}

export { PerfilSchema, PerfilModel };
