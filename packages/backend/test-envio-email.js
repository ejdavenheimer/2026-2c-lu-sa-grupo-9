import "dotenv/config";
import { EstrategiaNotificacionEmail } from "./src/domain/Notificaciones/estrategias/EstrategiaNotificacionEmail.js";

async function probarEnvio() {
    console.log("Probando envío de correo...");
    console.log("Remitente (SMTP_USER):", process.env.SMTP_USER);
    console.log("Servidor:", process.env.SMTP_HOST, "Puerto:", process.env.SMTP_PORT);

    if (!process.env.SMTP_PASS || process.env.SMTP_PASS === "tu_password_de_aplicacion") {
        console.error("\n❌ ERROR: Tenés que configurar una contraseña de aplicación real en SMTP_PASS dentro de packages/backend/.env");
        process.exit(1);
    }

    const estrategia = new EstrategiaNotificacionEmail();

    try { 
        const resultado = await estrategia.notificar({
            destinatario: process.env.SMTP_USER,
            mensaje: "¡Hola! Este es un correo de prueba de Código a Voluntad enviado con Nodemailer.",
            notificacion: { asunto: "Prueba de envío - Código a Voluntad" }
        });
        console.log("\n✅ ¡Correo enviado con éxito!");
        console.log(resultado);
    } catch (error) {
        console.error("\n❌ Error al enviar el correo:", error.message);
        if (error.response) {
            console.error("Detalle del servidor SMTP:", error.response);
        }
    }
}

probarEnvio();
