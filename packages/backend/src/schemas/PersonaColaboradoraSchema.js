import mongoose from "mongoose";

const CuentaSubSchema = new mongoose.Schema(
    {
        nombreUsuario: { type: String, required: true },
        tipo: { type: String, required: true }
    },
    { _id: false }
);

const HabilidadPersonaSubSchema = new mongoose.Schema(
    {
        codigo: { type: String, required: true },
        titulo: { type: String },
        descripcion: { type: String }
    },
    { _id: false }
);

const MedioContactoSubSchema = new mongoose.Schema(
    {
        tipo: { type: String, required: true },
        valor: { type: String, required: true }
    },
    { _id: false }
);

const ColaboracionPersonaSubSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        fechaInscripcion: { type: Date, default: Date.now },
        proyectoId: { type: String },
        tituloProyecto: { type: String }
    },
    { _id: false }
);

const PersonaColaboradoraSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            required: true,
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
            type: String
        },
        cuentas: [CuentaSubSchema],
        habilidades: [HabilidadPersonaSubSchema],
        mensajesInternos: {
            type: Boolean,
            default: false
        },
        mediosDeContacto: [MedioContactoSubSchema],
        colaboraciones: [ColaboracionPersonaSubSchema]
    },
    {
        timestamps: true
    }
);

const PersonaColaboradoraModel =
    mongoose.models.PersonaColaboradora ||
    mongoose.model("PersonaColaboradora", PersonaColaboradoraSchema);

export { PersonaColaboradoraSchema, PersonaColaboradoraModel };