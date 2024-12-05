import { describe, expect, it } from "@jest/globals";
import { hashPassword } from "../../src/utils";

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const hashedPassword = await hashPassword("password");
    expect(hashedPassword).toBeDefined();
  });
});
