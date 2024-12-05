import { describe, expect, it } from "@jest/globals";
import jwt, { decode } from "jsonwebtoken";
import { signToken } from "../../src/utils";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_ALGORITHM = "HS256";
process.env.JWT_EXPIRES_IN = "24h";

describe("signToken", () => {
  it("should sign a payload and return a valid JWT token", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("should throw an error if JWT_SECRET is not defined", () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const payload = { userId: "123" };
    expect(() => signToken(payload)).toThrow(
      "JWT_SECRET environment variable is not defined",
    );

    process.env.JWT_SECRET = originalSecret;
  });

  it("should use the default expiration time if JWT_EXPIRES_IN is not defined", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = signToken(payload);
    expect(token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp! - decoded.iat!).toBe(24 * 60 * 60);
  });

  it("should use the provided expiration time if JWT_EXPIRES_IN is defined", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = signToken(payload, { expiresIn: "1h" });
    expect(token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp! - decoded.iat!).toBe(60 * 60);
  });

  it("should use the default algorithm if not provided", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = signToken(payload);
    expect(token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      complete: true,
    }) as jwt.JwtPayload;
    expect(decoded.header.alg).toBe("HS256");
  });

  it("should use the provided algorithm if provided", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = signToken(payload, { algorithm: "HS384" });
    expect(token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      complete: true,
    }) as jwt.JwtPayload;
    expect(decoded.header.alg).toBe("HS384");
  });
});
