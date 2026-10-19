module.exports = {
    testEnvironment: "node",
    globalSetup: "<rootDir>/test/setup/globalSetup.cjs",
    globalTeardown: "<rootDir>/test/setup/globalTeardown.cjs",
    setupFiles: ["<rootDir>/test/setup/globals.js"],
    setupFilesAfterEnv: ["<rootDir>/test/setup/connectMongoose.js"],

    // Un worker solo, a proposito.
    //
    // Las entidades de dominio tienen referencias circulares (Perfil.proyecto
    // apunta al Proyecto que lo contiene, Colectivo.proyectos al reves). Cuando
    // un test falla, Jest serializa el diff con JSON.stringify para mandarlo del
    // worker al proceso padre por IPC, y eso explota con "Converting circular
    // structure to JSON": el worker muere y en vez del diff se ve
    // "Jest worker encountered N child process exceptions".
    //
    // Sin workers no hay IPC, asi que las fallas se leen bien. Cuesta ~5s mas
    // sobre una corrida de ~12s.
    maxWorkers: 1,

    // El arranque del Mongo efimero puede tardar la primera vez.
    testTimeout: 20000,
};
