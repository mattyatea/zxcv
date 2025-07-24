import { OpenAPIGenerator } from "@orpc/openapi";
import { orpcRouter } from "./server/orpc/router";
// Create OpenAPI generator instance
const generator = new OpenAPIGenerator({
    title: "zxcv API",
    version: "1.0.0",
    description: "API for managing and sharing AI coding rules",
    baseURL: "http://localhost:3000/api",
});
// Generate OpenAPI specification
const spec = generator.generate(orpcRouter);
// Print the full spec
console.log("=== Full OpenAPI Spec ===");
console.log(JSON.stringify(spec, null, 2));
// Print just the paths for easier debugging
console.log("\n=== Generated Paths ===");
if (spec.paths) {
    for (const [path, methods] of Object.entries(spec.paths)) {
        console.log(`\nPath: ${path}`);
        for (const [method, operation] of Object.entries(methods)) {
            console.log(`  ${method.toUpperCase()}: ${operation.operationId || "no operationId"}`);
        }
    }
}
else {
    console.log("No paths found in the spec!");
}
// Print router structure for debugging
console.log("\n=== Router Structure ===");
console.log("Router keys:", Object.keys(orpcRouter));
// Check if router has the expected procedures
console.log("\n=== Auth Procedures ===");
if (orpcRouter.auth) {
    console.log("Auth keys:", Object.keys(orpcRouter.auth));
}
else {
    console.log("No auth procedures found!");
}
console.log("\n=== Health Procedures ===");
if (orpcRouter.health) {
    console.log("Health keys:", Object.keys(orpcRouter.health));
}
else {
    console.log("No health procedures found!");
}
