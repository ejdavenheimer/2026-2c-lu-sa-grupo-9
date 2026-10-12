import { UnprocessableEntityError } from "../errors/AppError.js";

export class MedioDeContacto{
    constructor(tipo, valor){
        if (!tipo || !valor){
            throw new UnprocessableEntityError('El medio de contacto debe tener un tipo y valor.')
        }
        this.tipo = tipo
        this.valor = valor
    }

    toJSON() {
        return {
            tipo: this.tipo,
            valor: this.valor
        }
    }
}