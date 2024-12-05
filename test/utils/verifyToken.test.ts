import { describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";
import verifyToken from "../../src/utils/verifyToken";

process.env.JWT_SECRET = "test-secret";

describe("verifyToken", () => {
  it("should verify a token and return the payload", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);
    const decoded = verifyToken(token);
    expect(decoded).toEqual({
      ...payload,
      iat: expect.any(Number),
    });
  });

  it("should throw an error if the token is invalid", () => {
    const invalidToken = "invalid-token";
    expect(() => verifyToken(invalidToken)).toThrow(
      "Token verification failed: jwt malformed",
    );
  });

  it("should throw an error if JWT_SECRET is not defined", () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const token = jwt.sign(
      { userId: "123", email: "test@example.com" },
      "test-secret",
    );
    expect(() => verifyToken(token)).toThrow(
      "JWT_SECRET environment variable is not defined",
    );
    process.env.JWT_SECRET = originalSecret;
  });

  it("should return the decoded token with complete option", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);
    const decoded = verifyToken(token, { complete: true });
    expect(decoded.header).toBeDefined();
    expect(decoded.payload).toEqual({
      ...payload,
      iat: expect.any(Number),
    });
    expect(decoded.signature).toBeDefined();
  });
});
