import { jest } from "@jest/globals";
import { Proyecto } from "../../src/domain/Proyecto.js";
import { Colectivo } from "../../src/domain/Colectivo.js";
import { EstadoProyecto } from "../../src/domain/enums.js";

function crearColectivoDePrueba() {
    return new Colectivo({ nombre: "Colectivo Test", descripcion: "desc", tipo: "ONG" });
}

function crearProyectoDePrueba(colectivo, overrides = {}) {
    return new Proyecto({
        titulo: "Proyecto Test",
        descripcion: "desc",
        unidadCompromiso: "HORAS_TOTALES",
        cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivo,
        habilidadesRequeridas: [{ titulo: "React", codigo: "react", descripcion: "desc" }],
        ...overrides
    });
}

describe("Proyecto", () => {
    test("se crea en estado PUBLICADO", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(proyecto.estado).toBe(EstadoProyecto.PUBLICADO);
    });

    test("lanza un error si falta un dato obligatorio", () => {
        expect(() => crearProyectoDePrueba(crearColectivoDePrueba(), { titulo: undefined })).toThrow();
    });

    test("cerrarProyecto cambia el estado a CERRADO", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.cerrarProyecto();
        expect(proyecto.estado).toBe(EstadoProyecto.CERRADO);
        expect(proyecto.fechaCierre).toBeInstanceOf(Date);
    });

    test("validarColaborador devuelve true si el colaborador tiene al menos una habilidad requerida", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const colaboradorConHabilidad = { habilidades: [{ codigo: "react" }] };
        expect(proyecto.validarColaborador(colaboradorConHabilidad)).toBe(true);
    });

    test("validarColaborador devuelve false si el colaborador no tiene ninguna habilidad requerida", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const colaboradorSinHabilidad = { habilidades: [] };
        expect(proyecto.validarColaborador(colaboradorSinHabilidad)).toBe(false);
    });

    test("validarColaborador devuelve false si el colaborador es null", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(proyecto.validarColaborador(null)).toBe(false);
    });

    test("validarColaborador devuelve false si el colaborador no tiene habilidades", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const colaboradorSinHabilidades = { habilidades: null };
        expect(proyecto.validarColaborador(colaboradorSinHabilidades)).toBe(false);
    });

    test("agregarColaboracion agrega una colaboración si el colaborador tiene las habilidades requeridas", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const colaboradorConHabilidad = { habilidades: [{ codigo: "react" }], agregarColaboracion: jest.fn() };
        const colaboracion = proyecto.agregarColaboracion(colaboradorConHabilidad);
        expect(proyecto.colaboraciones).toContain(colaboracion);
        expect(colaboradorConHabilidad.agregarColaboracion).toHaveBeenCalledWith(colaboracion);
    });

    test("agregarColaboracion lanza un error si el proyecto está cerrado", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.cerrarProyecto();
        const colaboradorConHabilidad = { habilidades: [{ codigo: "react" }] };
        expect(() => proyecto.agregarColaboracion(colaboradorConHabilidad)).toThrow("No se pueden agregar colaboraciones a un proyecto cerrado");
        expect(proyecto.colaboraciones.length).toBe(0);
    });
    
    test("agregarColaboracion lanza un error si el colaborador no tiene las habilidades requeridas", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const colaboradorSinHabilidad = { habilidades: [] };
        expect(() => proyecto.agregarColaboracion(colaboradorSinHabilidad)).toThrow("El colaborador no cuenta con las habilidades requeridas para este proyecto");
        expect(proyecto.colaboraciones.length).toBe(0);
    });

    test("validarHito devuelve true si no hay hitos previos", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(proyecto.validarHito()).toBe(true);
    });

    test("validarHito devuelve true si el porcentaje es mayor al del último hito", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        expect(proyecto.validarHito(60)).toBe(true);
    });

    test("validarHito devuelve false si el porcentaje es igual al del último hito", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        expect(proyecto.validarHito(50)).toBe(false);
    });

    test("validarHito devuelve false si el porcentaje es menor al del último hito", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        expect(proyecto.validarHito(40)).toBe(false);
    });

    test("agregarHito agrega el primer hito sin restricciones de porcentaje", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito = proyecto.agregarHito({ porcentajeConcrecion: 30, descripcion: "Primer hito" });
        expect(proyecto.hitos).toContain(hito);
        expect(hito.porcentajeConcrecion).toBe(30);
        expect(hito.descripcion).toBe("Primer hito");
    });

    test("agregarHito agrega un segundo hito con porcentaje mayor al anterior", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        const hito = proyecto.agregarHito({ porcentajeConcrecion: 60, descripcion: "Segundo hito" });
        expect(proyecto.hitos).toContain(hito);
        expect(hito.porcentajeConcrecion).toBe(60);
        expect(hito.descripcion).toBe("Segundo hito");
    });

    test("agregarHito lanza un error si el porcentaje es igual al del último hito", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        expect(() => proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Segundo hito" })).toThrow("El porcentaje de concreción debe ser mayor al del último hito registrado");
        expect(proyecto.hitos.length).toBe(1);
    });

    test("agregarHito lanza un error si el porcentaje no es mayor al del último hito", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        expect(() => proyecto.agregarHito({ porcentajeConcrecion: 40, descripcion: "Segundo hito" })).toThrow("El porcentaje de concreción debe ser mayor al del último hito registrado");
        expect(proyecto.hitos.length).toBe(1);
    });

    test("agregarHito lanza un error si el proyecto está cerrado", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.cerrarProyecto();
        expect(() => proyecto.agregarHito({ porcentajeConcrecion: 60, descripcion: "Hito en proyecto cerrado" })).toThrow("No se pueden agregar hitos a un proyecto cerrado");
        expect(proyecto.hitos.length).toBe(0);
    });

    test("obtenerPorcentajeAvance devuelve 0 si no hay hitos", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(proyecto.obtenerPorcentajeAvance()).toBe(0);
    });

    test("obtenerPorcentajeAvance devuelve el porcentaje del último hito", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.agregarHito({ porcentajeConcrecion: 30, descripcion: "Primer hito" });
        proyecto.agregarHito({ porcentajeConcrecion: 70, descripcion: "Segundo hito" });
        expect(proyecto.obtenerPorcentajeAvance()).toBe(70);
    });

    test("actualizarEnlaces actualiza solo enlaceSistemaEnFuncionamiento si es lo único que se pasa", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.actualizarEnlaces({ enlaceSistemaEnFuncionamiento: "http://sistema.com" });
        expect(proyecto.enlaceSistemaEnFuncionamiento).toBe("http://sistema.com");
        expect(proyecto.enlaceCodigoFuente).toBeUndefined();
    });

    test("actualizarEnlaces actualiza solo enlaceCodigoFuente si es lo único que se pasa", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.actualizarEnlaces({ enlaceCodigoFuente: "http://codigo.com" });
        expect(proyecto.enlaceCodigoFuente).toBe("http://codigo.com");
        expect(proyecto.enlaceSistemaEnFuncionamiento).toBeUndefined();
    });

    test("actualizarEnlaces actualiza los dos enlaces si se pasan juntos", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.actualizarEnlaces({ enlaceSistemaEnFuncionamiento: "http://sistema.com", enlaceCodigoFuente: "http://codigo.com" });
        expect(proyecto.enlaceSistemaEnFuncionamiento).toBe("http://sistema.com");
        expect(proyecto.enlaceCodigoFuente).toBe("http://codigo.com");
    });

    test("actualizarEnlaces no pisa un enlace ya cargado si no se lo vuelve a pasar", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.actualizarEnlaces({ enlaceSistemaEnFuncionamiento: "http://sistema.com" });
        proyecto.actualizarEnlaces({ enlaceCodigoFuente: "http://codigo.com" });
        expect(proyecto.enlaceSistemaEnFuncionamiento).toBe("http://sistema.com");
        expect(proyecto.enlaceCodigoFuente).toBe("http://codigo.com");
    });

    test("getHito devuelve el hito si existe", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        const hitoObtenido = proyecto.getHito(hito.id);
        expect(hitoObtenido).toBe(hito);
    });

    test("getHito lanza un error si el hito no existe", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(() => proyecto.getHito("hito-inexistente")).toThrow(`Hito con id hito-inexistente no encontrado`);
    });

    test("eliminarHito saca el hito de la lista", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        proyecto.eliminarHito(hito.id);
        expect(proyecto.hitos).not.toContain(hito);
    });

    test("eliminarHito lanza un error si el hito no existe", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(() => proyecto.eliminarHito("hito-inexistente")).toThrow(`Hito con id hito-inexistente no encontrado`);
    });

    test("actualizarHito actualiza la descripcion", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        proyecto.actualizarHito(hito.id, { descripcion: "Hito actualizado" });
        expect(hito.descripcion).toBe("Hito actualizado");
    });

    test("actualizarHito actualiza el porcentaje si es válido", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Primer hito" });
        proyecto.actualizarHito(hito.id, { porcentajeConcrecion: 60 });
        expect(hito.porcentajeConcrecion).toBe(60);
    });

    test("actualizarHito permite actualizar el porcentaje de un hito del medio si respeta a los dos vecinos", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito1 = proyecto.agregarHito({ porcentajeConcrecion: 30, descripcion: "Primer hito" });
        const hito2 = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Segundo hito" });
        const hito3 = proyecto.agregarHito({ porcentajeConcrecion: 70, descripcion: "Tercer hito" });
        proyecto.actualizarHito(hito2.id, { porcentajeConcrecion: 60 });
        expect(hito2.porcentajeConcrecion).toBe(60);
    });

    test("actualizarHito lanza un error si el porcentaje no es mayor al del hito anterior", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito1 = proyecto.agregarHito({ porcentajeConcrecion: 30, descripcion: "Primer hito" });
        const hito2 = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Segundo hito" });
        expect(() => proyecto.actualizarHito(hito2.id, { porcentajeConcrecion: 20 })).toThrow("El porcentaje de concreción debe ser mayor al del hito anterior");
        expect(hito2.porcentajeConcrecion).toBe(50);
    });

    test("actualizarHito lanza un error si el porcentaje no es menor al del hito siguiente", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const hito1 = proyecto.agregarHito({ porcentajeConcrecion: 30, descripcion: "Primer hito" });
        const hito2 = proyecto.agregarHito({ porcentajeConcrecion: 50, descripcion: "Segundo hito" });
        expect(() => proyecto.actualizarHito(hito1.id, { porcentajeConcrecion: 60 })).toThrow("El porcentaje de concreción debe ser menor al del hito siguiente");
        expect(hito1.porcentajeConcrecion).toBe(30);
    });

    test("actualizarHito lanza un error si el hito no existe", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        expect(() => proyecto.actualizarHito("hito-inexistente", { descripcion: "Nuevo" })).toThrow(`Hito con id hito-inexistente no encontrado`);
    });
});
