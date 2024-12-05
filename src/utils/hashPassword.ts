import { hash } from "argon2";

export default async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}
