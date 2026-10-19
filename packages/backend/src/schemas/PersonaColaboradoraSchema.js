import mongoose from "mongoose";

const CuentaSubSchema = new mongoose.Schema(
    {
        nombreUsuario: { type: String, required: true },
        tipo: { type: String, required: true }
    },
    { _id: false }
);

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

