import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function BookmarksPage() {
  const user = await requireUser();
  const bookmarks = await db.bookmark.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { post: { select: { id: true, title: true, authorName: true, createdAt: true } } } });
  return <div className="board"><Link href="/" className="back-link">← Back to the board</Link><p className="eyebrow">YOUR LIBRARY</p><h1>Saved notes</h1>{bookmarks.length ? <div className="feed">{bookmarks.map(({ post }) => <article className="post-card" key={post.id}><div className="post-body"><div className="post-meta"><span>{post.authorName}</span><span>·</span><time>{post.createdAt.toISOString().slice(0, 10)}</time></div><h3><Link href={`/posts/${post.id}`}>{post.title}</Link></h3></div></article>)}</div> : <div className="empty card"><h3>No saved notes yet.</h3><p>Save useful notes to find them quickly later.</p></div>}</div>;
}
