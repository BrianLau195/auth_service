import { describe, expect, it } from "@jest/globals";
import { hash } from "argon2";
import { verifyPassword } from "../../src/utils";

describe("verifyPassword", () => {
  it("should verify a password", async () => {
    const hashedPassword = await hash("password");
    const result = await verifyPassword("password", hashedPassword);
    expect(result).toBe(true);
  });
});
