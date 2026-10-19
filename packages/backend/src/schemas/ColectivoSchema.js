import mongoose from "mongoose";

const ColectivoSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            trim: true,
            default: ""
        },
        tipo: {
            type: String,
            required: true
        },
        ubicacion: {
            pais: { type: String },
            provincia: { type: String },
            ciudad: { type: String }
        }
    },
    {
        timestamps: true
    }
);

const ColectivoModel = mongoose.models.Colectivo || mongoose.model("Colectivo", ColectivoSchema);

export { ColectivoSchema, ColectivoModel };

