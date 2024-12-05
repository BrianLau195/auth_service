import { verify } from "argon2";

export default async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await verify(hashedPassword, password);
}
