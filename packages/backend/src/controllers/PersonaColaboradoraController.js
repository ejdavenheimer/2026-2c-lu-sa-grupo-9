import { PersonaColaboradoraService } from "../services/PersonaColaboradoraService.js";
import { z } from 'zod';

const personaColaboradoraValida = z.object({
    nombreFantasia: z.string().default(null),
    nombre: z.string().default(null),
    apellido: z.string().default(null),
    pronombres: z.array().default([]),
    presentacion: z.string().default(""),
    cuentas: z.array().default([]),
    habilidades: z.array().default([]),
    colaboraciones: z.array().default([])
})

const habilidadEsquema = z.object({
    titulo: z.string(),
    codigo: z.string(),
    descripcion: z.string()
})

export class PersonaColaboradoraController{
    
    constructor(personaColaboradoraService = new PersonaColaboradoraService()){
        this.personaColaboradoraService = personaColaboradoraService
    }
    
    obtenerPersonasColaboradoras = (req, res) => {
        res.status(200).json(this.personaColaboradoraService.listarPersonasColaboradoras())
    }
    
    obtenerPersonaColaboradoraPorId = (req, res) => {
        try {
            const {codigo} = req.param
            res.status(200).json(this.personaColaboradoraService.obtenerPersonaColaboradoraPorId(codigo))
        } catch (error) { 
            return res.status(404).json({
                error: error.message
            });
        }
    }
    
    crearPersonaColaboradora = (req, res) => {
        const body = req.body
        const esquemaValido = personaColaboradoraValida.safeParse(body)
        if(esquemaValido.error){
            res.status(400).json(esquemaValido.error.issues)
        }
        try{
            res.status(201).json(this.personaColaboradoraService.crearPersonaColaboradora(body))
        } catch (error){
            res.status(409).json(error.message)
        }
    }

    agregarHabilidad = (req, res) => {
        const habilidadValida = habilidadEsquema.safeParse(req.body)
        const id = req.params.codigo

        if(habilidadValida.error){
            res.status(400).json(habilidadValida.error.issues)
        }

        try { 
            res.status(200).json(this.personaColaboradoraService.agregarHabilidad(id, habilidadValida.data))
        } catch (error) {
            res.status(404).json({error: error.message});
        }
        
    }
}