import { ProyectoRepository } from "../../src/repositories/ProyectoRepository.js";
import { ColectivoRepository } from "../../src/repositories/ColectivoRepository.js";
import { Proyecto } from "../../src/domain/Proyecto.js";
import { Colectivo } from "../../src/domain/Colectivo.js";

const perfilCon = (nombre, ...codigos) => ({
    nombre,
    descripcion: nombre,
    habilidadesRequeridas: codigos.map((codigo) => ({ codigo, titulo: codigo })),
    unidadCompromiso: "HORAS_TOTALES",
    cantidadHoras: 10,
    modalidadesColaboracion: ["GRATUITA"]
});

// El colectivo se persiste, no solo se instancia: el proyecto guarda una
// referencia por id, asi que sin guardarlo queda colgada al releer.
const guardarColectivo = async (titulo) =>
    await ColectivoRepository.guardar(
        new Colectivo({ nombre: `Colectivo ${titulo}`, descripcion: "desc", tipo: "ONG" })
    );

const guardarProyecto = async (titulo, ...perfiles) =>
    await ProyectoRepository.guardar(
        new Proyecto({
            titulo,
            descripcion: "desc",
            colectivo: await guardarColectivo(titulo),
            perfiles
        })
    );

describe("ProyectoRepository.buscarPorHabilidadesRequeridas", () => {
    beforeEach(async () => {
        await ProyectoRepository.limpiar();
    });

    test("devuelve lista vacía si no se le pasan códigos", async () => {
        await guardarProyecto("Portal", perfilCon("Frontend", "react"));

        expect(await ProyectoRepository.buscarPorHabilidadesRequeridas([])).toEqual([]);
        expect(await ProyectoRepository.buscarPorHabilidadesRequeridas()).toEqual([]);
    });

    test("devuelve los proyectos con algún perfil que requiera alguna de esas habilidades", async () => {
        const portal = await guardarProyecto("Portal", perfilCon("Frontend", "react"));
        await guardarProyecto("Censo", perfilCon("Datos", "python"));
        const app = await guardarProyecto("App", perfilCon("Backend", "node"), perfilCon("Mobile", "react"));

        const encontrados = await ProyectoRepository.buscarPorHabilidadesRequeridas(["react"]);

        expect(encontrados).toHaveLength(2);
        expect(encontrados.map((p) => p.id).sort()).toEqual([portal.id, app.id].sort());
        expect(encontrados.map((p) => p.titulo).sort()).toEqual(["App", "Portal"]);
    });

    test("alcanza con que matchee uno de los perfiles del proyecto", async () => {
        const app = await guardarProyecto("App", perfilCon("Backend", "node"), perfilCon("Mobile", "react"));

        const encontrados = await ProyectoRepository.buscarPorHabilidadesRequeridas(["node"]);

        expect(encontrados).toHaveLength(1);
        expect(encontrados[0].id).toBe(app.id);
        expect(encontrados[0].titulo).toBe("App");
        // El proyecto vuelve completo, con sus dos perfiles y su colectivo.
        expect(encontrados[0].perfiles.map((p) => p.nombre).sort()).toEqual(["Backend", "Mobile"]);
        expect(encontrados[0].colectivo.nombre).toBe("Colectivo App");
    });

    test("un proyecto sin perfiles nunca aparece en los resultados", async () => {
        await ProyectoRepository.guardar(
            new Proyecto({
                titulo: "Legado",
                descripcion: "desc",
                colectivo: new Colectivo({ nombre: "Colectivo Legado", descripcion: "desc", tipo: "ONG" }),
                unidadCompromiso: "HORAS_TOTALES",
                cantidadHoras: 10,
                modalidadesColaboracion: ["GRATUITA"],
                habilidadesRequeridas: [{ codigo: "react", titulo: "React" }]
            })
        );

        expect(await ProyectoRepository.buscarPorHabilidadesRequeridas(["react"])).toEqual([]);
    });

    test("devuelve lista vacía si ningún perfil requiere esas habilidades", async () => {
        await guardarProyecto("Portal", perfilCon("Frontend", "react"));

        expect(await ProyectoRepository.buscarPorHabilidadesRequeridas(["cobol"])).toEqual([]);
    });

    test("devuelve instancias de dominio, que es lo que el dominio necesita para evaluar", async () => {
        await guardarProyecto("Portal", perfilCon("Frontend", "react"));

        const [proyecto] = await ProyectoRepository.buscarPorHabilidadesRequeridas(["react"]);

        expect(proyecto).toBeInstanceOf(Proyecto);
        expect(typeof proyecto.evaluarPerfilesPara).toBe("function");
    });
});
