import mongoose from "mongoose";

// Registra todos los modelos antes de cualquier query. En produccion esto pasa
// solo, porque index.js importa el router y el router arrastra todos los
// schemas; en un test aislado se carga solo el schema que el test toca, y los
// populate() contra modelos no registrados fallan con MissingSchemaError.
import "../../src/schemas/ColectivoSchema.js";
import "../../src/schemas/HabilidadSchema.js";
import "../../src/schemas/NotificacionSchema.js";
import "../../src/schemas/PerfilSchema.js";
import "../../src/schemas/PersonaColaboradoraSchema.js";
import "../../src/schemas/ProyectoSchema.js";

/**
 * Conecta Mongoose al Mongo efimero antes de cada suite.
 *
 * Cada worker de Jest usa su propia base (test_<workerId>) para que las suites
 * que corren en paralelo no se pisen al limpiar colecciones.
 */
const nombreBase = `test_${process.env.JEST_WORKER_ID ?? "1"}`;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI, { dbName: nombreBase });
});

afterEach(async () => {
    const colecciones = mongoose.connection.collections;
    for (const nombre of Object.keys(colecciones)) {
        await colecciones[nombre].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
});
