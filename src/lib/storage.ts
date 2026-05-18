import { v2 as cloudinary } from "cloudinary";
import { getConfig } from "./config";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Configura Cloudinary dinámicamente usando variables de sistema de la base de datos.
 */
async function configureCloudinary() {
  const cloudName = await getConfig("CLOUDINARY_CLOUD_NAME");
  const apiKey = await getConfig("CLOUDINARY_API_KEY");
  const apiSecret = await getConfig("CLOUDINARY_API_SECRET");

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
}

/**
 * Sube un archivo a Cloudinary o Localmente.
 */
export async function uploadFile(file: File): Promise<string> {
  const isCloudinaryActive = await configureCloudinary();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (isCloudinaryActive) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "gymos/uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("[Storage] Cloudinary Upload Error:", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          },
        )
        .end(buffer);
    });
  } else {
    // Almacenamiento Local (Fallback)
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "").replace(/\.+/g, ".");
    const filename = `${timestamp}-${safeOriginalName}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }
}

export interface DeleteFileResult {
  success: boolean;
  notFound: boolean;
  error?: string;
}

/**
 * Elimina físicamente un archivo de Cloudinary o del Servidor Local.
 */
export async function deleteFile(
  url: string | null | undefined,
): Promise<DeleteFileResult> {
  if (!url) return { success: false, notFound: true, error: "URL no proporcionada" };

  try {
    if (url.includes("cloudinary.com")) {
      // Eliminar de Cloudinary
      const configured = await configureCloudinary();
      if (!configured) {
        console.warn(
          "[Storage] No se pudo configurar Cloudinary para eliminar:",
          url,
        );
        return { success: false, notFound: false, error: "Cloudinary no configurado" };
      }

      // Extraer public_id de la URL
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex === -1) {
        console.warn("[Storage] No se encontró 'upload' en la URL:", url);
        return { success: false, notFound: true, error: "Estructura de URL de Cloudinary inválida" };
      }

      // Saltar la versión (v12345) si existe
      const afterUpload = parts.slice(uploadIndex + 1);
      const startIndex = afterUpload[0]?.startsWith("v") ? 1 : 0;
      const publicIdWithExt = afterUpload.slice(startIndex).join("/");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // Quitar extensión

      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === "not found") {
        return { success: false, notFound: true, error: "Archivo no encontrado en Cloudinary" };
      }
      if (result.result === "ok") {
        return { success: true, notFound: false };
      }
      return { success: false, notFound: false, error: `Cloudinary destroy retornó: ${result.result}` };
    } else if (url.startsWith("/uploads/")) {
      // Eliminar Localmente con prevención de Path Traversal
      const filename = url.replace("/uploads/", "").replace(/\.\./g, "").replace(/[^a-zA-Z0-9.\-_]/g, "");
      const filePath = join(process.cwd(), "public", "uploads", filename);

      console.log("[Storage] Eliminando archivo local:", filePath);
      try {
        await unlink(filePath);
        return { success: true, notFound: false };
      } catch (err: any) {
        if (err.code === "ENOENT") {
          return { success: false, notFound: true, error: "Archivo local no encontrado" };
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("[Storage] Error al eliminar archivo físico:", error);
    return { success: false, notFound: false, error: error?.message || "Error interno al eliminar archivo físico" };
  }

  return { success: false, notFound: true, error: "Tipo de URL no soportada" };
}
