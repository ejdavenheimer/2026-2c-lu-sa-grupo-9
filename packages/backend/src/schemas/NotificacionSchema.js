import mongoose from "mongoose";

const NotificacionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        contenido: {
            type: String,
            required: true,
            trim: true
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        leida: {
            type: Boolean,
            default: false,
            index: true
        },
        colectivoId: {
            type: String,
            required: true,
            index: true
        },
        personaColaboradoraId: {
            type: String,
            required: true,
            index: true
        },
        perfilId: {
            type: String,
            required: true
        },
        mediosExternosUtilizados: [
            {
                tipo: { type: String, required: true },
                valor: { type: String },
                fechaEnvio: { type: Date, default: Date.now },
                exitoso: { type: Boolean, default: true },
                error: { type: String }
            }
        ]
    },
    {
        timestamps: true
    }
);

const NotificacionModel = mongoose.models.Notificacion || mongoose.model("Notificacion", NotificacionSchema);

export { NotificacionSchema, NotificacionModel };
