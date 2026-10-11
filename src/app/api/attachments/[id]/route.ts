import { db } from "@/lib/db";
import { INLINE } from "@/lib/uploads";
import { requireUser } from "@/lib/auth";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  try { await requireUser(); } catch { return new Response("Unauthorized", { status: 401 }); }
  const a = await db.attachment.findUnique({ where: { id } });
  if (!a) return new Response("Not found", { status: 404 });
  const inline = INLINE.has(a.mimeType) && a.mimeType !== "application/pdf" ? "inline" : "attachment";
  return new Response(a.fileData, { headers: { "Content-Type": a.mimeType, "Content-Length": String(a.fileSize),
    "Content-Disposition": `${inline}; filename*=UTF-8''${encodeURIComponent(a.originalFilename)}`,
    "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox; default-src 'none'", "Cache-Control": "private, max-age=3600" } });
}
