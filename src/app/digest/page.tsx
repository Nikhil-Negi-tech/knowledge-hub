import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function DigestPage() {
  await requireUser();
  const notes = await db.post.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, authorName: true, createdAt: true, _count: { select: { replies: true, bookmarks: true } } } });
  return <div className="board"><Link href="/" className="back-link">← Back to the board</Link><p className="eyebrow">WEEKLY DIGEST</p><h1>This week in the hub</h1><p className="lead">A shareable roundup of the latest notes, discussions, and saved-worthy discoveries.</p><div className="feed">{notes.map(note => <article className="post-card" key={note.id}><div className="post-body"><div className="post-meta"><span>{note.authorName}</span><span>·</span><time>{note.createdAt.toISOString().slice(0, 10)}</time></div><h3><Link href={`/posts/${note.id}`}>{note.title}</Link></h3><p>{note._count.replies} replies · {note._count.bookmarks} saves</p></div></article>)}</div></div>;
}
