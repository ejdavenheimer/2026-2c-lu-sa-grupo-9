let ProyectoModel = null;
let ProyectoSchema = null;

try {
    const mongooseModule = await import("mongoose").catch(() => null);
    if (mongooseModule) {
        const mongoose = mongooseModule.default || mongooseModule;

        ProyectoSchema = new mongoose.Schema(
            {
                id: {
                    type: String,
                    unique: true,
                    sparse: true,
                    index: true
                },
                titulo: {
                    type: String,
                    required: true,
                    trim: true
                },
                descripcion: {
                    type: String,
                    required: true,
                    trim: true
                },
                unidadCompromiso: {
                    type: String,
                    trim: true
                },
                cantidadHoras: {
                    // Number, no String: el controller valida z.number() y el
                    // dominio exige un numero. Con String, Mongo casteaba al
                    // guardar y al releer volvia "20" en vez de 20.
                    type: Number
                },
                modalidadesColaboracion: [
                    {
                        type: String,
                        trim: true
                    }
                ],
                estado: {
                    type: String,
                    trim: true
                },
                fechaAlta:{
                    type: Date,
                    default: Date.now
                },
                fechaCierre:{
                    type: Date,
                },
                enlaceSistemaEnFuncionamiento:{
                    type: String,
                    trim: true
                },
                enlaceCodigoFuente:{
                    type: String,
                    trim: true
                },
                colectivo: { type: String },
                habilidadesRequeridas:[{ type: String }],
                perfiles: [{ type: String }],
                hitos: [
                    {
                        id: { type: String, trim: true },
                        fecha: { type: Date },
                        porcentajeConcrecion: { type: Number, min: 0, max: 100 },
                        descripcion: { type: String, trim: true },
                    }
                ],
                colaboraciones:[
                    {
                        // id y esAnonima faltaban en el schema. Con strict mode
                        // (el default), Mongoose descarta en silencio todo campo
                        // no declarado: la colaboracion se guardaba sin su id y
                        // las contribuciones anonimas perdian esa marca.
                        id: { type: String },
                        fechaInscripcion: { type: Date, required: true, default: Date.now },
                        esAnonima: { type: Boolean, default: false },
                        personaColaboradora: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "PersonaColaboradora",
                            required: true,
                        },
                    }
                ]
            },
            {
                timestamps: true
            }
        );

        ProyectoSchema.virtual("colectivoDoc", {
            ref: "Colectivo",
            localField: "colectivo",
            foreignField: "id",
            justOne: true,
        });

        ProyectoSchema.virtual("habilidadesDocs", {
            ref: "Habilidad",
            localField: "habilidadesRequeridas",
            foreignField: "codigo",
        });

        ProyectoSchema.virtual("perfilesDocs", {
            ref: "Perfil",
            localField: "perfiles",
            foreignField: "id",
        });

        ProyectoModel = mongoose.models.Proyecto || mongoose.model("Proyecto", ProyectoSchema);
    }
} catch {
    // Continuar sin romper tests unitarios si mongoose no está conectado
}

export { ProyectoSchema , ProyectoModel };
