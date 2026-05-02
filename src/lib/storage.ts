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
    const originalName = file.name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${originalName}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }
}

/**
 * Elimina físicamente un archivo de Cloudinary o del Servidor Local.
 */
export async function deleteFile(
  url: string | null | undefined,
): Promise<boolean> {
  if (!url) return false;

  try {
    if (url.includes("cloudinary.com")) {
      // Eliminar de Cloudinary
      const configured = await configureCloudinary();
      if (!configured) {
        console.warn(
          "[Storage] No se pudo configurar Cloudinary para eliminar:",
          url,
        );
        return false;
      }

      // Extraer public_id de la URL
      // Formato: https://res.cloudinary.com/cloud-name/image/upload/v12345/folder/public_id.jpg
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex === -1) {
        console.warn("[Storage] No se encontró 'upload' en la URL:", url);
        return false;
      }

      // Saltar la versión (v12345) si existe
      const afterUpload = parts.slice(uploadIndex + 1);
      const startIndex = afterUpload[0]?.startsWith("v") ? 1 : 0;
      const publicIdWithExt = afterUpload.slice(startIndex).join("/");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // Quitar extensión

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } else if (url.startsWith("/uploads/")) {
      // Eliminar Localmente
      const filename = url.replace("/uploads/", "");
      const filePath = join(process.cwd(), "public", "uploads", filename);

      console.log("[Storage] Eliminando archivo local:", filePath);
      await unlink(filePath);
      return true;
    }
  } catch (error) {
    console.error("[Storage] Error al eliminar archivo físico:", error);
    return false;
  }

  return false;
}
