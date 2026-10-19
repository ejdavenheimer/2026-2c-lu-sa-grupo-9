import mongoose from "mongoose";

const HitoSubSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        fecha: { type: Date, default: Date.now },
        porcentajeConcrecion: { type: Number, required: true, min: 0, max: 100 },
        descripcion: { type: String, required: true }
    },
    { _id: false }
);

const ColaboracionSubSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        fechaInscripcion: { type: Date, default: Date.now },
        personaColaboradoraId: { type: String, required: true },
        personaColaboradora: {
            id: String,
            nombreFantasia: String,
            nombre: String,
            apellido: String
        }
    },
    { _id: false }
);

const PerfilProyectoSubSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true },
        habilidadesRequeridas: [
            {
                codigo: { type: String, required: true },
                titulo: String,
                descripcion: String
            }
        ],
        habilidadesOpcionales: [
            {
                codigo: { type: String, required: true },
                titulo: String,
                descripcion: String
            }
        ],
        unidadCompromiso: { type: String },
        cantidadHoras: { type: Number },
        modalidadesColaboracion: [{ type: String }]
    },
    { _id: false }
);

const ProyectoSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
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
        unidadCompromiso: { type: String },
        cantidadHoras: { type: Number },
        modalidadesColaboracion: [{ type: String }],
        estado: {
            type: String,
            enum: ["PUBLICADO", "CERRADO"],
            default: "PUBLICADO"
        },
        fechaAlta: { type: Date, default: Date.now },
        fechaCierre: { type: Date },
        enlaceSistemaEnFuncionamiento: { type: String },
        enlaceCodigoFuente: { type: String },
        colectivoId: { type: String, index: true },
        colectivo: {
            id: String,
            nombre: String,
            descripcion: String,
            tipo: String,
            ubicacion: {
                pais: String,
                provincia: String,
                ciudad: String
            }
        },
        habilidadesRequeridas: [
            {
                codigo: String,
                titulo: String,
                descripcion: String
            }
        ],
        perfiles: [PerfilProyectoSubSchema],
        hitos: [HitoSubSchema],
        colaboraciones: [ColaboracionSubSchema]
    },
    {
        timestamps: true
    }
);

const ProyectoModel = mongoose.models.Proyecto || mongoose.model("Proyecto", ProyectoSchema);

export { ProyectoSchema, ProyectoModel };
