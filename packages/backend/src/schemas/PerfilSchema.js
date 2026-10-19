import mongoose from "mongoose";
import { UnidadCompromiso, ModalidadColaboracion } from "../domain/enums.js";

const PerfilSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            required: true,
            trim: true
        },
        habilidadesRequeridas: [
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

const PerfilModel = mongoose.models.Perfil || mongoose.model("Perfil", PerfilSchema);

export { PerfilSchema, PerfilModel };
