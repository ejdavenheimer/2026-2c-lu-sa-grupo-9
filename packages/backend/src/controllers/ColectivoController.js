import { z } from 'zod';
import { ColectivoService } from '../services/ColectivoService.js';

const ubicacionEsquema = z.object({
    pais: z.string(),
    provincia: z.string().optional(),
    ciudad: z.string().optional()
})

const colectivoEsquema = z.object({
    nombre: z.string(),
    descripcion: z.string(),
    tipo: z.string(),
    ubicacion: ubicacionEsquema.optional()
}).strict()

export class ColectivoController {

    constructor(colectivoService = new ColectivoService()){
        this.colectivoService = colectivoService
    }

    listar = (req, res) => {
        res.status(200).json(this.colectivoService.obtenerColectivos());
    }

    obtenerPorCodigo = (req, res) => {
        const id = req.params.codigo;
        try{
            const colectivo = this.colectivoService.obtenerColectivoPorId(id);
            res.status(200).json(colectivo)
        } catch(error){
            res.status(404).json(error.message)
        }
    }
    
    crear = (req, res) => {
        const esquemaValido = colectivoEsquema.safeParse(req.body)
        if(esquemaValido.error){
            return res.status(400).json(esquemaValido.error.issues)
        }
        try{
            const nuevoColectivo = this.colectivoService.crearColectivo(esquemaValido.data)
            return res.status(201).json(nuevoColectivo)
        } catch(error){
            return res.status(409).json(error.message)
        }
        
    }
}