import { TipoCuenta } from "./enums.js";
import { UnprocessableEntityError } from "../errors/AppError.js";

export class Cuenta {
    constructor({ nombreUsuario, tipo }) {
        if (!nombreUsuario || !tipo) {
            throw new UnprocessableEntityError("La cuenta requiere un nombre de usuario y un tipo.");
        }
        this.nombreUsuario = nombreUsuario;
        this.tipo = tipo;
    }
}
