import jwt, { JwtPayload, Algorithm } from "jsonwebtoken";

interface SignTokenOptions {
  expiresIn?: string | number;
  algorithm?: Algorithm;
}

export default function signToken(
  payload: JwtPayload,
  options?: SignTokenOptions,
): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  const defaultOptions: SignTokenOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    algorithm: process.env.JWT_ALGORITHM as Algorithm,
  };

  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
}
