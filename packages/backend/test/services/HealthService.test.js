import { HealthService } from "../../src/services/HealthService.js";

describe("HealthService", () => {
    test("getHealth devuelve status ok y un timestamp", () => {
        const health = HealthService.getHealth();
        expect(health.status).toBe("ok");
        expect(health.timestamp).toBeDefined();
    });
});
