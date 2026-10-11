import sharp from "sharp";

const MAX = Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024;
const IMAGE_SIZES = { verySmall: 320, small: 640, medium: 1280 } as const;
const SIGS: Record<string, { mime: string; magic: number[] }> = {
  png: { mime: "image/png", magic: [0x89,0x50,0x4e,0x47] }, jpg: { mime: "image/jpeg", magic: [0xff,0xd8,0xff] },
  gif: { mime: "image/gif", magic: [0x47,0x49,0x46,0x38] }, pdf: { mime: "application/pdf", magic: [0x25,0x50,0x44,0x46] } };
export const INLINE = new Set(["image/png","image/jpeg","image/gif","application/pdf"]);
export async function validateFile(f: File) {
  if (f.size === 0 || f.size > MAX) throw new Error(`${f.name}: file must be between 1 byte and ${MAX / 1048576} MB`);
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  const sig = SIGS[ext === "jpeg" ? "jpg" : ext];
  const buf = Buffer.from(await f.arrayBuffer());
  if (!sig || !sig.magic.every((b, i) => buf[i] === b)) throw new Error(`${f.name}: only PNG, JPG, GIF and PDF files are allowed`);
  return { buf, mime: sig.mime, name: f.name.replace(/[\\/\x00-\x1f"]/g, "_").slice(0, 200) };
}

export async function prepareFiles(fd: FormData) {
  const sizes = fd.getAll("imageSizes").map(String);
  return Promise.all(fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).map(async (file, index) => {
    const checked = await validateFile(file);
    const width = IMAGE_SIZES[sizes[index] as keyof typeof IMAGE_SIZES];
    if (!width || checked.mime === "application/pdf") return checked;
    return { ...checked, buf: await sharp(checked.buf).resize({ width, height: width, fit: "inside", withoutEnlargement: true }).toBuffer() };
  }));
}
