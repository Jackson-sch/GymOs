import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check DB connectivity
    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startDb;

    // Optional: check other things like Cloudinary if needed, but DB is primary
    const isHealthy = true;

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: "up",
            latencyMs: dbLatency,
          },
        },
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
