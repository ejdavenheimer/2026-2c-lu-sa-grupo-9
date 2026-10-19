import { webcrypto } from "node:crypto";

/**
 * El entorno "node" de Jest 27 no expone el global `crypto`, que el driver de
 * MongoDB usa para generar los UUID de sesion. Sin esto, cualquier operacion
 * contra la base falla con "ReferenceError: crypto is not defined".
 *
 * Corre en setupFiles (antes del framework de tests) para que ya este disponible
 * cuando se importen los modulos de mongodb.
 */
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}
