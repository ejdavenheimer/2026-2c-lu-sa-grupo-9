import { TipoCuenta } from "./enums.js";

export class Cuenta {
    constructor({ nombreUsuario, tipo }) {
        if (!nombreUsuario || !tipo) {
            throw new Error("La cuenta requiere un nombre de usuario y un tipo.");
        }
        this.nombreUsuario = nombreUsuario;
        this.tipo = tipo;
    }
}
