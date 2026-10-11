import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Form } from "../../../form";
import { updatePost } from "../../../actions/posts";
import { RichEditor } from "../../../rich-editor";
import { getCurrentUser } from "@/lib/auth";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const post = await db.post.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } });
  if (!post) notFound();
  const user = await getCurrentUser();
  if (!user || post.authorId !== user.id) notFound();
  return <div className="compose-wrap"><Link href={`/posts/${id}`} className="back-link">← Back to post</Link><div className="compose card"><p className="eyebrow">TUNE THE DROP</p><h1>Edit this note</h1><Form action={updatePost} submit="Save changes"><input type="hidden" name="id" value={id} /><label htmlFor="title">Headline</label><input id="title" name="title" defaultValue={post.title} required /><label htmlFor="tags">Tags <span className="muted">(comma separated)</span></label><input id="tags" name="tags" defaultValue={post.tags.map(({ tag }) => tag.name).join(", ")} /><label htmlFor="content">The good stuff</label><RichEditor id="content" name="content" placeholder="Update your note..." defaultValue={post.content} required /></Form></div></div>;
}
