import { Router } from "express";
import { ColectivoController } from "../controllers/ColectivoController.js";

const colectivoController = new ColectivoController();

const router = Router();

router.route("/")
    .get(colectivoController.listar)
    .post(colectivoController.crear);
    
router.route("/:id")
    .get(colectivoController.obtenerPorCodigo);

// TODO: PUT y DELETE /colectivos/:id estaban registrados contra
// colectivoController.actualizar y .eliminar, que no existen. Express valida el handler al
// registrar la ruta, así que eso impedía que la aplicación arrancara. Para volver a exponerlos
// hay que implementar esos dos métodos en ColectivoController: ColectivoService ya tiene
// actualizarColectivo() y eliminarColectivo(), y Swagger ya los documenta.

export default router;