import { Perfil } from "../../src/domain/Perfil.js";
import { Habilidad } from "../../src/domain/Habilidad.js";
import { PersonaColaboradora } from "../../src/domain/PersonaColaboradora.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../../src/domain/enums.js";

function crearHabilidad(codigo, titulo = "Habilidad") {
    return new Habilidad({ codigo, titulo, descripcion: "desc" });
}

describe("Perfil (Dominio)", () => {
    const habReact = crearHabilidad("react", "React");
    const habNode = crearHabilidad("node", "NodeJS");
    const habDocker = crearHabilidad("docker", "Docker");

    const perfilDePrueba = (overrides = {}) => new Perfil({
        descripcion: "Fullstack",
        habilidadesRequeridas: [habReact, habNode],
        habilidadesOpcionales: [habDocker],
        unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
        cantidadHoras: 10,
        modalidadesColaboracion: [ModalidadColaboracion.GRATUITA],
        ...overrides
    });

    const personaCon = (...habilidades) => new PersonaColaboradora({
        nombreFantasia: "Candidata Test",
        habilidades
    });

    test("se crea exitosamente con campos válidos", () => {
        const perfil = new Perfil({
            nombre: "Desarrollador Fullstack",
            descripcion: "Desarrollador Fullstack Senior",
            habilidadesRequeridas: [habReact, habNode],
            habilidadesOpcionales: [habDocker],
            unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.id).toBeDefined();
        expect(perfil.nombre).toBe("Desarrollador Fullstack");
        expect(perfil.descripcion).toBe("Desarrollador Fullstack Senior");
        expect(perfil.habilidadesRequeridas.length).toBe(2);
        expect(perfil.habilidadesOpcionales.length).toBe(1);
        expect(perfil.unidadCompromiso).toBe(UnidadCompromiso.HORAS_SEMANALES);
        expect(perfil.cantidadHoras).toBe(10);
        expect(perfil.modalidadesColaboracion).toEqual([ModalidadColaboracion.GRATUITA]);
    });

    test("lanza error si falta la descripción o está vacía", () => {
        expect(() => new Perfil({
            descripcion: "",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere una descripción no vacía");

        expect(() => new Perfil({
            descripcion: "   ",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere una descripción no vacía");
    });

    test("lanza error si no tiene habilidades requeridas", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere al menos una habilidad requerida");
    });

    test("lanza error si unidad de compromiso no es válida", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: "INVALIDO",
            cantidadHoras: 5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("El perfil requiere una unidad de compromiso válida");
    });

    test("lanza error si cantidad de horas no es un número positivo", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 0,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("La cantidad de horas debe ser un número positivo");

        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: -5,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("La cantidad de horas debe ser un número positivo");
    });

    test("lanza error si modalidades de colaboración está vacía o es inválida", () => {
        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: []
        })).toThrow("Debe indicar al menos una modalidad de colaboración válida");

        expect(() => new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: ["MODALIDAD_INEXISTENTE"]
        })).toThrow("Debe indicar al menos una modalidad de colaboración válida");
    });

    test("lanza error si una habilidad es requerida y opcional simultáneamente", () => {
        expect(() => new Perfil({
            descripcion: "Fullstack",
            habilidadesRequeridas: [habReact],
            habilidadesOpcionales: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        })).toThrow("Una habilidad no puede ser requerida y opcional simultáneamente");
    });

    test("validarColaborador devuelve true si el colaborador tiene al menos una habilidad requerida", () => {
        const perfil = new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact, habNode],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        const colaboradorConUna = { habilidades: [{ codigo: "react" }] };
        expect(perfil.validarColaborador(colaboradorConUna)).toBe(true);
    });

    test("validarColaborador devuelve false si el colaborador no tiene habilidades requeridas o es null", () => {
        const perfil = new Perfil({
            descripcion: "Frontend",
            habilidadesRequeridas: [habReact],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.validarColaborador(null)).toBe(false);
        expect(perfil.validarColaborador({ habilidades: [] })).toBe(false);
        expect(perfil.validarColaborador({ habilidades: [{ codigo: "python" }] })).toBe(false);
    });

    test("cumpleTodasRequeridas valida que tenga todas las requeridas", () => {
        const perfil = new Perfil({
            descripcion: "Fullstack",
            habilidadesRequeridas: [habReact, habNode],
            unidadCompromiso: UnidadCompromiso.HORAS_TOTALES,
            cantidadHoras: 10,
            modalidadesColaboracion: [ModalidadColaboracion.GRATUITA]
        });

        expect(perfil.cumpleTodasRequeridas({ habilidades: [{ codigo: "react" }] })).toBe(false);
        expect(perfil.cumpleTodasRequeridas({ habilidades: [{ codigo: "react" }, { codigo: "node" }] })).toBe(true);
    });

    test("calcularAfinidadOpcionales cuenta las coincidencias opcionales", () => {
        const perfil = new Perfil({
            descripcion: "Fullstack",
            habilidadesRequeridas: [habReact],
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
            nombre: "Fullstack",
            descripcion: "Fullstack Developer",
            habilidadesRequeridas: [habReact],
            habilidadesOpcionales: [habDocker],
            unidadCompromiso: UnidadCompromiso.HORAS_SEMANALES,
            cantidadHoras: 15,
            modalidadesColaboracion: [ModalidadColaboracion.CON_INCENTIVO_ECONOMICO]
        });

        const json = perfil.toJSON();
        expect(json.id).toBe(perfil.id);
        expect(json.nombre).toBe("Fullstack");
        expect(json.descripcion).toBe("Fullstack Developer");
        expect(json.unidadCompromiso).toBe(UnidadCompromiso.HORAS_SEMANALES);
        expect(json.cantidadHoras).toBe(15);
        expect(json.modalidadesColaboracion).toEqual([ModalidadColaboracion.CON_INCENTIVO_ECONOMICO]);
        expect(json.habilidadesRequeridas[0].codigo).toBe("react");
        expect(json.habilidadesOpcionales[0].codigo).toBe("docker");
    });

    describe("codigosRequeridos", () => {
        test("devuelve los códigos de las habilidades requeridas", () => {
            expect(perfilDePrueba().codigosRequeridos()).toEqual(["react", "node"]);
        });

        test("no incluye las opcionales: son para puntuar, no para buscar", () => {
            expect(perfilDePrueba().codigosRequeridos()).not.toContain("docker");
        });

        test("no repite códigos", () => {
            const perfil = perfilDePrueba({ habilidadesRequeridas: [habReact, habReact, habNode] });
            expect(perfil.codigosRequeridos()).toEqual(["react", "node"]);
        });
    });

    describe("evaluarCompatibilidad", () => {
        test("cumple todas las requeridas y todas las opcionales: compatible con puntaje 100", () => {
            const resultado = perfilDePrueba().evaluarCompatibilidad(personaCon(habReact, habNode, habDocker));
            expect(resultado.esCompatible).toBe(true);
            expect(resultado.puntaje).toBe(100);
            expect(resultado.requeridasFaltantes).toEqual([]);
            expect(resultado.opcionalesCumplidas).toEqual([habDocker]);
        });

        test("cumple todas las requeridas sin ninguna opcional: compatible con puntaje 70", () => {
            const resultado = perfilDePrueba().evaluarCompatibilidad(personaCon(habReact, habNode));
            expect(resultado.esCompatible).toBe(true);
            expect(resultado.puntaje).toBe(70);
        });

        test("cumple una sola requerida: no es compatible aunque cumpla alguna", () => {
            const resultado = perfilDePrueba().evaluarCompatibilidad(personaCon(habReact));
            expect(resultado.esCompatible).toBe(false);
            expect(resultado.cumpleAlgunaRequerida).toBe(true);
            expect(resultado.puntaje).toBe(35);
            expect(resultado.requeridasFaltantes).toEqual([habNode]);
        });

        test("las opcionales suben el puntaje pero no alcanzan para ser compatible", () => {
            const resultado = perfilDePrueba().evaluarCompatibilidad(personaCon(habReact, habDocker));
            expect(resultado.esCompatible).toBe(false);
            expect(resultado.puntaje).toBe(65);
        });

        test("sin ninguna habilidad en común: puntaje 0 y todas las requeridas faltantes", () => {
            const resultado = perfilDePrueba().evaluarCompatibilidad(personaCon());
            expect(resultado.esCompatible).toBe(false);
            expect(resultado.cumpleAlgunaRequerida).toBe(false);
            expect(resultado.puntaje).toBe(0);
            expect(resultado.requeridasFaltantes).toEqual([habReact, habNode]);
        });

        test("si el perfil no declara opcionales, las requeridas valen el 100%", () => {
            const resultado = perfilDePrueba({ habilidadesOpcionales: [] })
                .evaluarCompatibilidad(personaCon(habReact, habNode));
            expect(resultado.puntaje).toBe(100);
        });

        test("las habilidades repetidas de la persona no inflan el puntaje", () => {
            const resultado = perfilDePrueba().evaluarCompatibilidad(personaCon(habReact, habReact, habNode));
            expect(resultado.puntaje).toBe(70);
            expect(resultado.requeridasFaltantes).toEqual([]);
        });

        test("lanza error si no se le pasa una persona colaboradora", () => {
            expect(() => perfilDePrueba().evaluarCompatibilidad())
                .toThrow("Se requiere una persona colaboradora para evaluar la compatibilidad");
        });

        test("lanza error si recibe un objeto plano en lugar de una persona de dominio", () => {
            expect(() => perfilDePrueba().evaluarCompatibilidad({ habilidades: [habReact, habNode] }))
                .toThrow("Se requiere una persona colaboradora");
        });

        test("esCompatible coincide siempre con cumpleTodasRequeridas", () => {
            const perfil = perfilDePrueba();
            for (const persona of [personaCon(), personaCon(habReact), personaCon(habReact, habNode)]) {
                expect(perfil.evaluarCompatibilidad(persona).esCompatible)
                    .toBe(perfil.cumpleTodasRequeridas(persona));
            }
        });
    });
});
