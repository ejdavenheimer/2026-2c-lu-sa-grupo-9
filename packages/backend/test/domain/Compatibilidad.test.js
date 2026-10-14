import { Compatibilidad } from "../../src/domain/Compatibilidad.js";

const habilidad = (codigo) => ({ codigo, titulo: codigo.toUpperCase(), descripcion: "desc" });

const habReact = habilidad("react");
const habNode = habilidad("node");
const habDocker = habilidad("docker");

const perfilCon = (...habilidadesRequeridas) => ({ habilidadesRequeridas });

const compatibilidad = (overrides = {}) => new Compatibilidad({
    perfil: perfilCon(habReact, habNode),
    personaColaboradora: { id: "colab-1" },
    puntaje: 0,
    requeridasFaltantes: [],
    opcionalesCumplidas: [],
    ...overrides
});

describe("Compatibilidad (Dominio)", () => {
    test("es compatible cuando no le falta ninguna habilidad requerida", () => {
        expect(compatibilidad().esCompatible).toBe(true);
    });

    test("no es compatible cuando le falta alguna requerida", () => {
        expect(compatibilidad({ requeridasFaltantes: [habNode] }).esCompatible).toBe(false);
    });

    test("cumpleAlgunaRequerida es true si le falta sólo una parte de las requeridas", () => {
        const resultado = compatibilidad({ requeridasFaltantes: [habNode] });
        expect(resultado.cumpleAlgunaRequerida).toBe(true);
    });

    test("cumpleAlgunaRequerida es false si le faltan todas las requeridas", () => {
        const resultado = compatibilidad({ requeridasFaltantes: [habReact, habNode] });
        expect(resultado.cumpleAlgunaRequerida).toBe(false);
    });

    describe("compararPorPuntaje", () => {
        test("ordena de mayor a menor puntaje", () => {
            const ordenadas = [
                compatibilidad({ puntaje: 35 }),
                compatibilidad({ puntaje: 100 }),
                compatibilidad({ puntaje: 70 })
            ].sort(Compatibilidad.compararPorPuntaje);

            expect(ordenadas.map((c) => c.puntaje)).toEqual([100, 70, 35]);
        });

        test("ante igual puntaje desempata por cantidad de opcionales cumplidas", () => {
            const sinOpcionales = compatibilidad({ puntaje: 70, opcionalesCumplidas: [] });
            const conOpcionales = compatibilidad({ puntaje: 70, opcionalesCumplidas: [habDocker] });

            const ordenadas = [sinOpcionales, conOpcionales].sort(Compatibilidad.compararPorPuntaje);
            expect(ordenadas[0]).toBe(conOpcionales);
        });
    });

    describe("toJSON", () => {
        test("incluye los getters, que JSON.stringify por sí solo perdería", () => {
            const json = JSON.parse(JSON.stringify(compatibilidad({ puntaje: 70 })));

            expect(json.esCompatible).toBe(true);
            expect(json.cumpleAlgunaRequerida).toBe(true);
            expect(json.puntaje).toBe(70);
        });

        test("no expone el perfil ni la persona: son el contexto de la búsqueda", () => {
            const json = compatibilidad().toJSON();

            expect(json.perfil).toBeUndefined();
            expect(json.personaColaboradora).toBeUndefined();
        });

        test("serializa las habilidades con código, título y descripción", () => {
            const json = compatibilidad({
                requeridasFaltantes: [habNode],
                opcionalesCumplidas: [habDocker]
            }).toJSON();

            expect(json.requeridasFaltantes).toEqual([
                { codigo: "node", titulo: "NODE", descripcion: "desc" }
            ]);
            expect(json.opcionalesCumplidas).toEqual([
                { codigo: "docker", titulo: "DOCKER", descripcion: "desc" }
            ]);
        });
    });
});
