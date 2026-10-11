import { db } from "@/lib/db";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, include: { tags: { include: { tag: true } }, replies: { orderBy: { createdAt: "asc" }, select: { authorName: true, content: true, createdAt: true } } } });
  if (!post) return new Response("Not found", { status: 404 });
  const markdown = `# ${post.title}\n\nBy ${post.authorName} · ${post.createdAt.toISOString()}\n\nTags: ${post.tags.map(({ tag }) => `#${tag.name}`).join(" ")}\n\n${post.content.replace(/<[^>]+>/g, "")}\n\n## Discussion\n\n${post.replies.map(reply => `**${reply.authorName}** (${reply.createdAt.toISOString()}):\n\n${reply.content.replace(/<[^>]+>/g, "")}`).join("\n\n")}`;
  return new Response(markdown, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="${post.title.replace(/[^A-Za-z0-9_-]+/g, "-")}.md"` } });
}
