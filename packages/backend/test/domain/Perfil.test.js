import { Perfil } from "../../src/domain/Perfil.js";
import { Habilidad } from "../../src/domain/Habilidad.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../../src/domain/enums.js";

function crearHabilidad(codigo, titulo = "Habilidad") {
    return new Habilidad({ codigo, titulo, descripcion: "desc" });
}

describe("Perfil (Dominio)", () => {
    const habReact = crearHabilidad("react", "React");
    const habNode = crearHabilidad("node", "NodeJS");
    const habDocker = crearHabilidad("docker", "Docker");

    test("se crea exitosamente con campos válidos", () => {
        const perfil = new Perfil({
            descripcion: "Desarrollador Fullstack",
            habilidadesObligatorias: [habReact, habNode],
            habilidadesOpcionales: [habDocker],
            unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.id).toBeDefined();
        expect(perfil.descripcion).toBe("Desarrollador Fullstack");
        expect(perfil.habilidadesObligatorias.length).toBe(2);
        expect(perfil.habilidadesOpcionales.length).toBe(1);
        expect(perfil.unidadCompromiso).toBe(UnidadCompromiso.HORAS_SEMANALES);
        expect(perfil.cantidadHoras).toBe(10);
        expect(perfil.modalidadesColaboracion).toEqual([ModalidadColaboracion.GRATUITA]);
    });

    test("lanza error si falta la descripción o está vacía", () => {
        expect(() => new Perfil({
            descripcion: "",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere una descripción no vacía");

        expect(() => new Perfil({
            descripcion: "   ",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere una descripción no vacía");
    });

    test("lanza error si no tiene habilidades obligatorias", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere al menos una habilidad obligatoria");
    });

    test("lanza error si unidad de compromiso no es válida", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: "INVALIDO",
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere una unidad de compromiso válida");
    });

    test("lanza error si cantidad de horas no es un número positivo", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 0,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("La cantidad de horas debe ser un número positivo");

        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: -5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("La cantidad de horas debe ser un número positivo");
    });

    test("lanza error si modalidades de colaboración está vacía o es inválida", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: []
        })).toThrow("Debe indicar al menos una modalidad de colaboración válida");

        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: ["MODALIDAD_INEXISTENTE"]
        })).toThrow("Debe indicar al menos una modalidad de colaboración válida");
    });

    test("validarColaborador devuelve true si el colaborador tiene al menos una habilidad obligatoria", () => {
        const perfil = new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact, habNode],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        const colaboradorConUna = { habilidades: [{ codigo: "react" }] };
        expect(perfil.validarColaborador(colaboradorConUna)).toBe(true);
    });

    test("validarColaborador devuelve false si el colaborador no tiene habilidades obligatorias o es null", () => {
        const perfil = new Perfil({
            descripcion: "Frontend",
            habilidadesObligatorias: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.validarColaborador(null)).toBe(false);
        expect(perfil.validarColaborador({ habilidades: [] })).toBe(false);
        expect(perfil.validarColaborador({ habilidades: [{ codigo: "python" }] })).toBe(false);
    });

    test("cumpleTodasObligatorias valida que tenga todas las obligatorias", () => {
        const perfil = new Perfil({
            descripcion: "Fullstack",
            habilidadesObligatorias: [habReact, habNode],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.cumpleTodasObligatorias({ habilidades: [{ codigo: "react" }] })).toBe(false);
        expect(perfil.cumpleTodasObligatorias({ habilidades: [{ codigo: "react" }, { codigo: "node" }] })).toBe(true);
    });

    test("calcularAfinidadOpcionales cuenta las coincidencias opcionales", () => {
        const perfil = new Perfil({
            descripcion: "Fullstack",
            habilidadesObligatorias: [habReact],
            habilidadesOpcionales: [habNode, habDocker],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.calcularAfinidadOpcionales({ habilidades: [{ codigo: "react" }] })).toBe(0);
        expect(perfil.calcularAfinidadOpcionales({ habilidades: [{ codigo: "react" }, { codigo: "node" }] })).toBe(1);
        expect(perfil.calcularAfinidadOpcionales({ habilidades: [{ codigo: "node" }, { codigo: "docker" }] })).toBe(2);
    });

    test("toJSON retorna objeto serializable", () => {
        const perfil = new Perfil({
            descripcion: "Fullstack",
            habilidadesObligatorias: [habReact],
            habilidadesOpcionales: [habDocker],
            unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
            cantidadHoras: 15,
            modalidadesColaboracion: [ModalidadColaboracion.CON_INCENTIVO_ECONOMICO]
        });

        const json = perfil.toJSON();
        expect(json.id).toBe(perfil.id);
        expect(json.descripcion).toBe("Fullstack");
        expect(json.unidadCompromiso).toBe(UnidadCompromiso.HORAS_SEMANALES);
        expect(json.cantidadHoras).toBe(15);
        expect(json.modalidadesColaboracion).toEqual([ModalidadColaboracion.CON_INCENTIVO_ECONOMICO]);
        expect(json.habilidadesObligatorias[0].codigo).toBe("react");
        expect(json.habilidadesOpcionales[0].codigo).toBe("docker");
    });
});
