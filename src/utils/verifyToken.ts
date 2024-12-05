import jwt, { JwtPayload } from "jsonwebtoken";

interface VerifyTokenOptions {
  complete?: boolean;
}

const defaultOptions: VerifyTokenOptions = {
  complete: false,
};

export default function verifyToken(
  token: string,
  options?: VerifyTokenOptions,
): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  try {
    const decoded = jwt.verify(token, secret, {
      ...defaultOptions,
      ...options,
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error(
      `Token verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
