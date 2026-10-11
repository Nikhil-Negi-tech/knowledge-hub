"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const postIdOf = (fd: FormData) => String(fd.get("postId"));

export async function toggleBookmark(fd: FormData) {
  const user = await requireUser();
  const postId = postIdOf(fd);
  const existing = await db.bookmark.findUnique({ where: { userId_postId: { userId: user.id, postId } } });
  if (existing) await db.bookmark.delete({ where: { userId_postId: { userId: user.id, postId } } });
  else await db.bookmark.create({ data: { userId: user.id, postId } });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/bookmarks");
}

export async function toggleReaction(fd: FormData) {
  const user = await requireUser();
  const postId = postIdOf(fd);
  const kind = String(fd.get("kind") || "useful").slice(0, 30);
  const existing = await db.reaction.findUnique({ where: { userId_postId_kind: { userId: user.id, postId, kind } } });
  if (existing) await db.reaction.delete({ where: { userId_postId_kind: { userId: user.id, postId, kind } } });
  else await db.reaction.create({ data: { userId: user.id, postId, kind } });
  revalidatePath(`/posts/${postId}`);
}

export async function saveDraft(fd: FormData) {
  const user = await requireUser();
  const title = String(fd.get("title") || "").slice(0, 200);
  const content = String(fd.get("content") || "").slice(0, 50000);
  await db.draft.upsert({ where: { userId: user.id }, create: { userId: user.id, title, content }, update: { title, content } });
}

export async function deleteDraft() {
  const user = await requireUser();
  await db.draft.deleteMany({ where: { userId: user.id } });
}

export async function updateProfile(fd: FormData) {
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { name: String(fd.get("name") || "").trim().slice(0, 80), bio: String(fd.get("bio") || "").trim().slice(0, 500), emoji: String(fd.get("emoji") || user.emoji).slice(0, 8) } });
  revalidatePath(`/users/${user.id}`);
  revalidatePath("/");
}

export async function markNotificationsRead() {
  const user = await requireUser();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}
