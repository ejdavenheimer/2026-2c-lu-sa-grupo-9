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

    test("agregarPerfil agrega un perfil y lo asocia al proyecto", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const perfil = proyecto.agregarPerfil({
            descripcion: "Backend Dev",
            habilidadesRequeridas: [{ codigo: "node", titulo: "NodeJS" }],
            unidadCompromiso: "HORAS_SEMANALES",
            cantidadHoras: 10,
            modalidadesColaboracion: ["GRATUITA"]
        });

        expect(proyecto.perfiles).toContain(perfil);
        expect(perfil.proyecto).toBe(proyecto);
        expect(proyecto.obtenerPerfil(perfil.id)).toBe(perfil);
    });

    test("agregarPerfil lanza error si el proyecto está cerrado", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        proyecto.cerrarProyecto();
        expect(() => proyecto.agregarPerfil({
            descripcion: "Backend Dev",
            habilidadesRequeridas: [{ codigo: "node", titulo: "NodeJS" }],
            unidadCompromiso: "HORAS_SEMANALES",
            cantidadHoras: 10,
            modalidadesColaboracion: ["GRATUITA"]
        })).toThrow("No se pueden agregar perfiles a un proyecto cerrado");
    });

    test("modificarPerfil actualiza datos del perfil", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const perfil = proyecto.agregarPerfil({
            descripcion: "Backend Dev",
            habilidadesRequeridas: [{ codigo: "node", titulo: "NodeJS" }],
            unidadCompromiso: "HORAS_SEMANALES",
            cantidadHoras: 10,
            modalidadesColaboracion: ["GRATUITA"]
        });

        proyecto.modificarPerfil(perfil.id, {
            descripcion: "Senior Backend Dev",
            cantidadHoras: 20
        });

        expect(perfil.descripcion).toBe("Senior Backend Dev");
        expect(perfil.cantidadHoras).toBe(20);
    });

    test("quitarPerfil elimina el perfil del proyecto", () => {
        const proyecto = crearProyectoDePrueba(crearColectivoDePrueba());
        const perfil = proyecto.agregarPerfil({
            descripcion: "Backend Dev",
            habilidadesRequeridas: [{ codigo: "node", titulo: "NodeJS" }],
            unidadCompromiso: "HORAS_SEMANALES",
            cantidadHoras: 10,
            modalidadesColaboracion: ["GRATUITA"]
        });

        const eliminado = proyecto.quitarPerfil(perfil.id);
        expect(eliminado).toBe(true);
        expect(proyecto.obtenerPerfil(perfil.id)).toBeNull();
    });

    test("validarColaborador funciona con perfiles", () => {
        const proyecto = new Proyecto({
            titulo: "Proyecto Moderno",
            descripcion: "desc",
            colectivo: crearColectivoDePrueba(),
            perfiles: [{
                descripcion: "Frontend Dev",
                habilidadesRequeridas: [{ codigo: "vue", titulo: "VueJS" }],
                unidadCompromiso: "HORAS_TOTALES",
                cantidadHoras: 15,
                modalidadesColaboracion: ["GRATUITA"]
            }]
        });

        expect(proyecto.validarColaborador({ habilidades: [{ codigo: "vue" }] })).toBe(true);
        expect(proyecto.validarColaborador({ habilidades: [{ codigo: "angular" }] })).toBe(false);
    });
});
