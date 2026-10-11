"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { postSchema, replySchema } from "@/lib/validation";
import { clean } from "@/lib/sanitize";
import { prepareFiles } from "@/lib/uploads";
import { formDataFields } from "@/lib/form-data";
import type { FormState } from "../form";
import { requireUser } from "@/lib/auth";

const idOf = (fd: FormData) => String(fd.get("id"));
const tagNames = (value?: string) => [...new Set((value ?? "").split(",").map(tag => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8))];
async function notifyMentions(content: string, postId: string, authorId: string) {
  const names = [...new Set([...content.matchAll(/@([A-Za-z0-9_-]{2,80})/g)].map(match => match[1].toLowerCase()))];
  if (!names.length) return;
  const users = await db.user.findMany({ where: { name: { in: names, mode: "insensitive" } }, select: { id: true, name: true } });
  await db.notification.createMany({ data: users.filter(user => user.id !== authorId).map(user => ({ userId: user.id, type: "mention", message: `You were mentioned by ${authorId} in a note.`, postId })) });
}

export async function createPost(_: FormState, fd: FormData): Promise<FormState> {
  const p = postSchema.safeParse(formDataFields(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  try {
    const user = await requireUser();
    const checked = await prepareFiles(fd);
    const post = await db.post.create({
      data: {
        authorId: user.id,
        authorName: user.name,
        title: p.data.title,
        content: clean(p.data.content),
        tags: { create: tagNames(p.data.tags).map(name => ({ tag: { connectOrCreate: { where: { name }, create: { name, creatorId: user.id } } } })) },
        attachments: { create: checked.map(f => ({ originalFilename: f.name, mimeType: f.mime, fileSize: f.buf.length, fileData: f.buf })) }
      }
    });
    await notifyMentions(p.data.content, post.id, user.id);
    return { success: { postId: post.id } };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save the post" };
  }
}

export async function updatePost(_: FormState, fd: FormData): Promise<FormState> {
  const p = postSchema.safeParse(formDataFields(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  try {
    const user = await requireUser();
    const post = await db.post.findUnique({ where: { id: idOf(fd) }, select: { authorId: true } });
    if (!post || post.authorId !== user.id) return { error: "You can only edit your own posts" };
    await db.post.update({
      where: { id: idOf(fd) },
      data: {
        authorName: user.name,
        title: p.data.title,
        content: clean(p.data.content),
        tags: {
          deleteMany: {},
          create: tagNames(p.data.tags).map(name => ({ tag: { connectOrCreate: { where: { name }, create: { name, creatorId: user.id } } } }))
        }
      }
    });
  } catch {
    return { error: "That post could not be found or updated" };
  }
  revalidatePath(`/posts/${idOf(fd)}`);
  redirect(`/posts/${idOf(fd)}`);
}

export async function deletePost(fd: FormData) {
  const id = idOf(fd);
  const user = await requireUser();
  const post = await db.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post || post.authorId !== user.id) throw new Error("You can only delete your own posts");
  await db.post.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}

export async function addReply(_: FormState, fd: FormData): Promise<FormState> {
  const p = replySchema.safeParse({ ...formDataFields(fd), parentId: fd.get("parentId") || undefined });
  if (!p.success) return { error: p.error.issues[0].message };
  try {
    const user = await requireUser();
    if (p.data.parentId) {
      const parent = await db.reply.findUnique({ where: { id: p.data.parentId }, select: { postId: true } });
      if (!parent || parent.postId !== p.data.postId) return { error: "That reply no longer exists" };
    } else if (!(await db.post.findUnique({ where: { id: p.data.postId }, select: { id: true } }))) return { error: "That post no longer exists" };
    const checked = await prepareFiles(fd);
    await db.reply.create({
      data: {
        postId: p.data.postId,
        parentId: p.data.parentId,
        authorId: user.id,
        authorName: user.name,
        content: clean(p.data.content),
        attachments: { create: checked.map(f => ({ originalFilename: f.name, mimeType: f.mime, fileSize: f.buf.length, fileData: f.buf })) }
      }
    });
    const post = await db.post.findUnique({ where: { id: p.data.postId }, select: { authorId: true, title: true } });
    if (post?.authorId && post.authorId !== user.id) await db.notification.create({ data: { userId: post.authorId, type: "reply", message: `${user.name} replied to "${post.title}"`, postId: p.data.postId } });
    await notifyMentions(p.data.content, p.data.postId, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save the reply" };
  }
  revalidatePath(`/posts/${p.data.postId}`);
}

export async function deleteReply(fd: FormData) {
  const user = await requireUser();
  const reply = await db.reply.findUnique({ where: { id: idOf(fd) }, select: { postId: true, authorId: true } });
  if (reply) {
    if (reply.authorId !== user.id) throw new Error("You can only delete your own replies");
    await db.reply.delete({ where: { id: idOf(fd) } });
    revalidatePath(`/posts/${reply.postId}`);
  }
}
