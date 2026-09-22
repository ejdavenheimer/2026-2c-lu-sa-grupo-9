import { z } from 'zod';
import { ColectivoService } from '../services/ColectivoService.js';

const entidadGeograficaEsquema = z.union([
    z.string(),
    z.object({
        id: z.string().optional().nullable(),
        nombre: z.string()
    }).strict()
]);

const ubicacionEsquema = z.object({
    pais: entidadGeograficaEsquema,
    provincia: entidadGeograficaEsquema.optional().nullable(),
    ciudad: z.string().optional().nullable()
}).strict();

const colectivoEsquema = z.object({
    nombre: z.string(),
    descripcion: z.string(),
    tipo: z.string(),
    ubicacion: ubicacionEsquema.optional()
}).strict();

export class ColectivoController {

    constructor(colectivoService = new ColectivoService()){
        this.colectivoService = colectivoService;
    }

    listar = (req, res) => {
        res.status(200).json(this.colectivoService.obtenerColectivos());
    }

    obtenerPorId = (req, res) => {
        const id = req.params.id;
        try {
            const colectivo = this.colectivoService.obtenerColectivoPorId(id);
            res.status(200).json(colectivo);
        } catch(error) {
            res.status(404).json({ error: error.message });
        }
    }

    obtenerPorCodigo = (req, res) => this.obtenerPorId(req, res);
    
    crear = (req, res) => {
        const esquemaValido = colectivoEsquema.safeParse(req.body);
        if(esquemaValido.error){
            return res.status(400).json(esquemaValido.error.issues);
        }
        try{
            const nuevoColectivo = this.colectivoService.crearColectivo(esquemaValido.data);
            return res.status(201).json(nuevoColectivo);
        } catch(error){
            return res.status(409).json({ error: error.message });
        }
    }

    actualizar = (req, res) => {
        const id = req.params.id;
        const esquemaValido = colectivoEsquema.partial().safeParse(req.body);
        if (esquemaValido.error) {
            return res.status(400).json(esquemaValido.error.issues);
        }
        try {
            const colectivoActualizado = this.colectivoService.actualizarColectivo(id, esquemaValido.data);
            return res.status(200).json(colectivoActualizado);
        } catch (error) {
            const status = error.message.includes("No se encontro") ? 404 : 409;
            return res.status(status).json({ error: error.message });
        }
    }

    eliminar = (req, res) => {
        const id = req.params.id;
        try {
            this.colectivoService.eliminarColectivo(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }
}