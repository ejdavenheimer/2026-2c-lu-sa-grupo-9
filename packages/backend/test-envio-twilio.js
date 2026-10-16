import "dotenv/config";
import { EstrategiaNotificacionSMS } from "./src/domain/Notificaciones/estrategias/EstrategiaNotificacionSMS.js";
import { EstrategiaNotificacionWhatsApp } from "./src/domain/Notificaciones/estrategias/EstrategiaNotificacionWhatsApp.js";

const DESTINATARIO = process.argv[2] || "+541126730748";

async function probarTwilio() {
    console.log("=== PROBANDO TWILIO ===");
    console.log("Destinatario objetivo:", DESTINATARIO);
    console.log("TWILIO_SMS_FROM:", process.env.TWILIO_SMS_FROM);
    console.log("TWILIO_WHATSAPP_FROM:", process.env.TWILIO_WHATSAPP_FROM);

    // 1. Probar SMS
    console.log("\n1. Probando envío de SMS...");
    try {
        const sms = new EstrategiaNotificacionSMS();
        const resSMS = await sms.notificar({
            destinatario: DESTINATARIO,
            mensaje: "Prueba de SMS desde Código a Voluntad!"
        });
        console.log("✅ SMS enviado con éxito! SID:", resSMS.sid);
    } catch (err) {
        console.error("❌ Falló el SMS:", err.message);
        if (err.code) console.error("Código de error Twilio:", err.code);
    }

    // 2. Probar WhatsApp
    console.log("\n2. Probando envío de WhatsApp...");
    try {
        const wa = new EstrategiaNotificacionWhatsApp();
        const resWA = await wa.notificar({
            destinatario: DESTINATARIO,
            mensaje: "Prueba de WhatsApp desde Código a Voluntad!"
        });
        console.log("✅ WhatsApp enviado con éxito! SID:", resWA.sid);
    } catch (err) {
        console.error("❌ Falló WhatsApp:", err.message);
        if (err.code) console.error("Código de error Twilio:", err.code);
    }
}

probarTwilio();
