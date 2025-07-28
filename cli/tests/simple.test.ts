import { describe, expect, test } from "bun:test";

describe("Simple test", () => {
	test("should pass", () => {
		expect(1 + 1).toBe(2);
	});

	test("should work with strings", () => {
		expect("hello" + " world").toBe("hello world");
	});
});
