import { PersonaColaboradoraService } from "../services/PersonaColaboradoraService.js";
import { z } from 'zod';

const personaColaboradoraValida = z.object({
    nombreFantasia: z.string().default(null),
    nombre: z.string().default(null),
    apellido: z.string().default(null),
    pronombres: z.array(z.string()).default([]),
    presentacion: z.string().default(""),
    cuentas: z.array(z.any()).default([]),
    habilidades: z.array(z.any()).default([]),
    colaboraciones: z.array(z.any()).default([])
}).strict();

const habilidadEsquema = z.object({
    titulo: z.string().default(""),
    codigo: z.string().default(""),
    descripcion: z.string().default("")
}).strict();

export class PersonaColaboradoraController {

    constructor(personaColaboradoraService = new PersonaColaboradoraService()) {
        this.personaColaboradoraService = personaColaboradoraService
    }

    obtenerPersonasColaboradoras = (req, res) => {
        res.status(200).json(this.personaColaboradoraService.listarPersonasColaboradoras())
    }

    obtenerPersonaColaboradoraPorId = (req, res) => {
        try {
            const { id } = req.params;
            res.status(200).json(this.personaColaboradoraService.obtenerPersonaColaboradoraPorId(id))
        } catch (error) {
            return res.status(404).json({
                error: error.message
            });
        }
    }

    crearPersonaColaboradora = (req, res) => {
        const body = req.body
        const esquemaValido = personaColaboradoraValida.safeParse(body)
        if (esquemaValido.error) {
            return res.status(400).json(esquemaValido.error.issues)
        }
        try {
            return res.status(201).json(this.personaColaboradoraService.crearPersonaColaboradora(esquemaValido.data))
        } catch (error) {
            return res.status(409).json(error.message)
        }
    }

    agregarHabilidad = (req, res) => {
        const habilidadValida = habilidadEsquema.safeParse(req.body)
        const id = req.params.id

        if (habilidadValida.error) {
            return res.status(400).json(habilidadValida.error.issues)
        }

        try {
            return res.status(200).json(this.personaColaboradoraService.agregarHabilidad(id, habilidadValida.data))
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }

    }
}