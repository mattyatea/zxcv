// import { describe, it, expect } from "vitest";
// import { hashPassword, verifyPassword } from "../../server/utils/crypto";
//
// describe("Crypto Utils", () => {
//   describe("hashPassword", () => {
//     it("should hash a password", async () => {
//       const password = "testPassword123";
//       const hash = await hashPassword(password);
//
//       expect(hash).toBeDefined();
//       expect(hash).not.toBe(password);
//       expect(hash.length).toBeGreaterThan(50); // Argon2 hashes are typically long
//     });
//
//     it("should produce different hashes for the same password", async () => {
//       const password = "testPassword123";
//       const hash1 = await hashPassword(password);
//       const hash2 = await hashPassword(password);
//
//       expect(hash1).not.toBe(hash2);
//     });
//   });
//
//   describe("verifyPassword", () => {
//     it("should verify correct password", async () => {
//       const password = "testPassword123";
//       const hash = await hashPassword(password);
//
//       const isValid = await verifyPassword(password, hash);
//       expect(isValid).toBe(true);
//     });
//
//     it("should reject incorrect password", async () => {
//       const password = "testPassword123";
//       const wrongPassword = "wrongPassword456";
//       const hash = await hashPassword(password);
//
//       const isValid = await verifyPassword(wrongPassword, hash);
//       expect(isValid).toBe(false);
//     });
//
//     it("should handle empty password", async () => {
//       const password = "";
//       const hash = await hashPassword(password);
//
//       const isValid = await verifyPassword(password, hash);
//       expect(isValid).toBe(true);
//
//       const isInvalid = await verifyPassword("notEmpty", hash);
//       expect(isInvalid).toBe(false);
//     });
//   });
// });