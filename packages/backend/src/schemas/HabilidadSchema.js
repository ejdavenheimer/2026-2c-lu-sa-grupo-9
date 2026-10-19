import mongoose from "mongoose";

const HabilidadSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            lowercase: true
        },
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const HabilidadModel = mongoose.models.Habilidad || mongoose.model("Habilidad", HabilidadSchema);

export { HabilidadSchema, HabilidadModel };
