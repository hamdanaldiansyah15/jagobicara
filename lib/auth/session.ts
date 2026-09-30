import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";

const DEVELOPMENT_AUTH_SECRET = "jago-bicara-development-secret-not-for-production";
export const COOKIE_NAME = "jb_session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters in production.");
  }
  return secret || DEVELOPMENT_AUTH_SECRET;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, getAuthSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getAuthSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        communityMembers: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      whatsapp: user.whatsapp,
      community: user.communityMembers[0]?.community || null,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
