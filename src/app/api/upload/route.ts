import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile, deleteFile } from "@/lib/storage";
import { headers } from "next/headers";

/**
 * Maneja la subida de archivos (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo" },
        { status: 400 },
      );
    }

    // Validar tamaño (4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande (máx 4MB)" },
        { status: 400 },
      );
    }

    // Usar utilidad de almacenamiento (Local o Cloudinary)
    const url = await uploadFile(file);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Error en POST /api/upload:", error);
    return NextResponse.json(
      { error: "Error al procesar la subida" },
      { status: 500 },
    );
  }
}

/**
 * Maneja la eliminación física de archivos (DELETE)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL de archivo requerida" },
        { status: 400 },
      );
    }

    // Eliminar físicamente el archivo
    const success = await deleteFile(url);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "No se pudo eliminar el archivo físico" },
        { status: 404 },
      );
    }
  } catch (error: any) {
    console.error("Error en DELETE /api/upload:", error);
    return NextResponse.json(
      { error: "Error al procesar la eliminación" },
      { status: 500 },
    );
  }
}
