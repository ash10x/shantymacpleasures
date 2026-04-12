import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  id: number;
  username: string;
  role: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  return new SignJWT({ sub: String(payload.id), username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: Number(payload.sub),
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
