const { MongoMemoryServer } = require("mongodb-memory-server");

/**
 * Levanta un MongoDB efimero para toda la corrida de tests.
 *
 * Se usa un Mongo real (no un fallback en memoria dentro de los repositories)
 * para que los tests ejerciten el mismo camino de codigo que produccion:
 * populate, virtuals e indices de Mongoose.
 */
module.exports = async () => {
    const mongo = await MongoMemoryServer.create();

    // globalSetup y globalTeardown corren en el mismo proceso, asi que el
    // teardown puede recuperar la instancia desde aca.
    globalThis.__MONGO_TEST_SERVER__ = mongo;

    // process.env se propaga a los workers de Jest.
    process.env.MONGO_TEST_URI = mongo.getUri();
};
