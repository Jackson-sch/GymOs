import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AuthContext {
  secret: string;
  internalAdapter: {
    createSession: (userId: string) => Promise<{ token: string }>;
  };
  authCookies: {
    sessionToken: {
      name: string;
      attributes: {
        httpOnly?: boolean;
        sameSite?: "lax" | "strict" | "none";
        path?: string;
        secure?: boolean;
        maxAge?: number;
      };
    };
  };
}

function isDevEnvironment() {
  return process.env.NODE_ENV === "development";
}

export async function GET() {
  if (!isDevEnvironment()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    take: 20,
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  if (!isDevEnvironment()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Usuario no encontrado o inactivo" }, { status: 404 });
  }

  const ctx = (await (auth as unknown as { $context: Promise<AuthContext> }).$context);
  const session = await ctx.internalAdapter.createSession(user.id);
  const signature = crypto
    .createHmac("sha256", ctx.secret)
    .update(session.token)
    .digest("base64");
  const signedToken = `${session.token}.${signature}`;

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });

  const { name, attributes } = ctx.authCookies.sessionToken;
  response.cookies.set(name, signedToken, {
    httpOnly: attributes.httpOnly ?? true,
    sameSite: attributes.sameSite ?? "lax",
    path: attributes.path ?? "/",
    secure: attributes.secure ?? false,
    maxAge: attributes.maxAge,
  });

  return response;
}
