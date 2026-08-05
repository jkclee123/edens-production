/**
 * Client-side image compression, used before uploading task photos.
 *
 * Photos are downscaled to fit within MAX_DIMENSION and re-encoded as JPEG at
 * QUALITY, which brings a typical phone photo (3-6 MB) down to ~150-350 KB
 * while staying legible for text in a photographed document.
 */

const MAX_DIMENSION = 1600;
const QUALITY = 0.8;

/** Reject anything absurdly large before we even try to decode it. */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("無法讀取圖片"));
    };
    img.src = url;
  });
}

/**
 * Compress an image file to a JPEG blob.
 * Falls back to the original file if the browser cannot encode the canvas.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("只可以上載圖片");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("圖片太大");
  }

  const img = await loadImage(file);

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight)
  );
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );

  // Keep the original if compression somehow made it bigger (e.g. a small PNG).
  if (!blob) return file;
  return blob.size < file.size ? blob : file;
}
