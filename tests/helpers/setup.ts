// import { afterEach, beforeEach } from "vitest";
// import { env } from "cloudflare:test";
//
// // Test data cleanup
// export async function cleanupDatabase() {
//   const tables = [
//     "email_verifications",
//     "password_resets",
//     "api_keys", 
//     "team_members",
//     "teams",
//     "rule_versions",
//     "rules",
//     "users",
//     "rate_limits",
//   ];
//
//   for (const table of tables) {
//     try {
//       await env.DB.prepare(`DELETE FROM ${table}`).run();
//     } catch (error) {
//       // Table might not exist, ignore
//     }
//   }
// }
//
// // Mock R2 storage
// export const mockR2 = {
//   put: async (key: string, value: any, options?: any) => {
//     return Promise.resolve();
//   },
//   get: async (key: string) => {
//     return Promise.resolve({
//       text: async () => "mock content",
//       json: async () => ({ mock: "data" }),
//     });
//   },
//   delete: async (key: string) => {
//     return Promise.resolve();
//   },
// };
//
// // Mock Email Sender
// export const mockEmailSender = {
//   send: async (email: any) => {
//     return Promise.resolve();
//   },
// };
//
// // Setup hooks for tests
// export function setupTestHooks() {
//   beforeEach(async () => {
//     // Clean database before each test
//     await cleanupDatabase();
//   });
//
//   afterEach(async () => {
//     // Clean database after each test
//     await cleanupDatabase();
//   });
// }
//
// // Create test user helper
// export async function createTestUser(data?: {
//   email?: string;
//   username?: string;
//   password?: string;
//   emailVerified?: boolean;
// }) {
//   // Import SELF from cloudflare:test
//   const { SELF } = await import("cloudflare:test");
//  
//   const email = data?.email || `test-${Date.now()}@example.com`;
//   const username = data?.username || `user${Math.floor(Math.random() * 10000)}`;
//   const password = data?.password || "password123";
//  
//   const response = await SELF.fetch("http://localhost/auth/register", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email,
//       username,
//       password,
//     }),
//   });
//
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`Failed to create test user: ${error}`);
//   }
//
//   const result = await response.json();
//  
//   // If emailVerified is true or undefined (default), update the user in the database
//   if (data?.emailVerified !== false) {
//     await env.DB.prepare("UPDATE users SET email_verified = 1 WHERE email = ?")
//       .bind(email)
//       .run();
//   }
//  
//   // Login to get token
//   const loginResponse = await SELF.fetch("http://localhost/auth/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email,
//       password,
//     }),
//   });
//
//   if (!loginResponse.ok) {
//     const error = await loginResponse.text();
//     throw new Error(`Failed to login test user: ${error}`);
//   }
//
//   const loginResult = await loginResponse.json();
//  
//   return {
//     user: { ...loginResult.user, emailVerified: data?.emailVerified !== false },
//     token: loginResult.token,
//     message: result.message,
//   };
// }
//
// // Create verified test user and get login token
// export async function createVerifiedTestUser(data?: {
//   email?: string;
//   username?: string;
//   password?: string;
// }) {
//   const userResult = await createTestUser({ ...data, emailVerified: true });
//  
//   // Login to get token
//   const { SELF } = await import("cloudflare:test");
//  
//   const loginResponse = await SELF.fetch("http://localhost/auth/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email: userResult.user.email,
//       password: data?.password || "password123",
//     }),
//   });
//
//   if (!loginResponse.ok) {
//     const error = await loginResponse.text();
//     throw new Error(`Failed to login test user: ${error}`);
//   }
//
//   const loginResult = await loginResponse.json();
//   return {
//     user: loginResult.user,
//     token: loginResult.token,
//   };
// }
//
// // Wait helper for async operations
// export async function waitFor(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
//
// // Create test team helper
// export async function createTestTeam(authToken: string, data?: {
//   name?: string;
//   displayName?: string;
//   description?: string;
// }) {
//   const { SELF } = await import("cloudflare:test");
//  
//   const response = await SELF.fetch("http://localhost/teams", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${authToken}`,
//     },
//     body: JSON.stringify({
//       name: data?.name || `team-${Date.now()}`,
//       displayName: data?.displayName || "Test Team",
//       description: data?.description || "Test team description",
//     }),
//   });
//
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`Failed to create test team: ${error}`);
//   }
//
//   return await response.json();
// }
//
// // Create test team with verified user
// export async function createTestTeamWithUser(data?: {
//   name?: string;
//   displayName?: string;
//   description?: string;
//   userEmail?: string;
//   username?: string;
//   password?: string;
// }) {
//   const { user, token } = await createVerifiedTestUser({
//     email: data?.userEmail,
//     username: data?.username,
//     password: data?.password,
//   });
//
//   const team = await createTestTeam(token, {
//     name: data?.name,
//     displayName: data?.displayName,
//     description: data?.description,
//   });
//
//   return { user, token, team };
// }
//
// // Create test rule helper
// export async function createTestRule(authToken: string, data?: {
//   name?: string;
//   org?: string;
//   visibility?: string;
//   description?: string;
//   content?: string;
//   tags?: string[];
//   teamId?: string;
// }) {
//   const { SELF } = await import("cloudflare:test");
//  
//   const response = await SELF.fetch("http://localhost/rules", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${authToken}`,
//     },
//     body: JSON.stringify({
//       name: data?.name || `test-rule-${Date.now()}`,
//       org: data?.org,
//       visibility: data?.visibility || "public",
//       description: data?.description || "Test rule description",
//       content: data?.content || '{"rules": {"no-console": "error"}}',
//       tags: data?.tags || ["test"],
//       teamId: data?.teamId,
//     }),
//   });
//
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`Failed to create test rule: ${error}`);
//   }
//
//   return await response.json();
// }
//
// // Create test API key helper
// export async function createTestApiKey(authToken: string, data?: {
//   name?: string;
//   scopes?: string[];
//   expiresAt?: number;
// }) {
//   const { SELF } = await import("cloudflare:test");
//  
//   const response = await SELF.fetch("http://localhost/api-keys", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${authToken}`,
//     },
//     body: JSON.stringify({
//       name: data?.name || `test-key-${Date.now()}`,
//       scopes: data?.scopes || ["rules:read"],
//       expires_at: data?.expiresAt,
//     }),
//   });
//
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`Failed to create test API key: ${error}`);
//   }
//
//   return await response.json();
// }