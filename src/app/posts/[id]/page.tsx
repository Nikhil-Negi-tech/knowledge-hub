import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Form } from "../../form";
import { addReply, deletePost, deleteReply } from "../../actions/posts";
import { RichEditor } from "../../rich-editor";
import { UploadPicker } from "../../upload-picker";
import { getCurrentUser } from "@/lib/auth";
import { toggleBookmark, toggleReaction } from "../../actions/features";
import { ConfirmDelete } from "../../confirm-delete";

type Attachment = { id: string; originalFilename: string; mimeType: string; fileSize: number };
type R = { id: string; parentId: string | null; authorId: string | null; content: string; createdAt: Date; authorName: string; author: { emoji: string } | null; attachments: Attachment[] };

function Attachments({ attachments }: { attachments: Attachment[] }) {
  return <>{attachments.map(a => <p className="attachment" key={a.id}>{a.mimeType.startsWith("image/") && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/api/attachments/${a.id}`} alt={a.originalFilename} /> }<a href={`/api/attachments/${a.id}`} download={a.originalFilename}>↗ {a.originalFilename}</a><span className="muted"> ({Math.ceil(a.fileSize / 1024)} KB)</span></p>)}</>;
}

function Thread({ all, parent, postId, canReply, userId }: { all: R[]; parent: string | null; postId: string; canReply: boolean; userId?: string }) {
  return <>{all.filter(r => r.parentId === parent).map(r => <div key={r.id} className={parent ? "thread" : ""}><div className="reply-card"><div className="post-meta"><span className="avatar small">{r.author?.emoji ?? r.authorName.slice(0, 1).toUpperCase()}</span><strong>{r.authorName}</strong><span>·</span><time>{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</time></div><div dangerouslySetInnerHTML={{ __html: r.content }} /><Attachments attachments={r.attachments} />{canReply && <details><summary>Reply to {r.authorName}</summary><Form action={addReply} submit="Send reply" encType="multipart/form-data"><input type="hidden" name="postId" value={postId} /><input type="hidden" name="parentId" value={r.id} /><label htmlFor={`reply-content-${r.id}`}>Your reply</label><RichEditor id={`reply-content-${r.id}`} name="content" placeholder="Add to the conversation..." required /><label htmlFor={`reply-files-${r.id}`}>Add files <span className="muted">(optional)</span></label><UploadPicker id={`reply-files-${r.id}`} /><p className="muted">PNG, JPG, GIF, and PDF · up to 10 MB each. Choose a resolution for each image.</p></Form></details>}{r.authorId === userId && <ConfirmDelete action={deleteReply} field="id" value={r.id} label="Delete reply" />}</div><Thread all={all} parent={r.id} postId={postId} canReply={canReply} userId={userId} /></div>)}</>;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const post = await db.post.findUnique({ where: { id }, include: { author: { select: { id: true, emoji: true } }, tags: { include: { tag: true } }, bookmarks: { select: { userId: true } }, reactions: { select: { userId: true, kind: true } }, attachments: { select: { id: true, originalFilename: true, mimeType: true, fileSize: true } }, replies: { orderBy: { createdAt: "asc" }, take: 500, select: { id: true, parentId: true, authorId: true, content: true, createdAt: true, authorName: true, author: { select: { emoji: true } }, attachments: { select: { id: true, originalFilename: true, mimeType: true, fileSize: true } } } } } });
  if (!post) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === post.authorId;
  const bookmarked = Boolean(user && post.bookmarks.some(bookmark => bookmark.userId === user.id));
  return <div className="detail-wrap"><Link href="/" className="back-link">← Back to the board</Link><article className="detail-card"><div className="post-meta"><span className="avatar">{post.author?.emoji ?? post.authorName.slice(0, 1).toUpperCase()}</span><Link href={`/users/${post.author?.id ?? ""}`}><strong>{post.authorName}</strong></Link><span>·</span><time>{post.createdAt.toISOString().slice(0, 10)}</time></div><h1>{post.title}</h1><div className="tags">{post.tags.map(({ tag }) => <Link key={tag.name} href={`/?tag=${encodeURIComponent(tag.name)}`}>#{tag.name}</Link>)}</div><div className="rich-content" dangerouslySetInnerHTML={{ __html: post.content }} /><Attachments attachments={post.attachments} /><div className="detail-actions">{user && <><form action={toggleBookmark}><input type="hidden" name="postId" value={post.id} /><button className="btn">{bookmarked ? "★ Saved" : "☆ Save note"} ({post.bookmarks.length})</button></form><form action={toggleReaction}><input type="hidden" name="postId" value={post.id} /><input type="hidden" name="kind" value="useful" /><button className="btn">💡 Useful ({post.reactions.filter(reaction => reaction.kind === "useful").length})</button></form></>}{isOwner && <><Link href={`/posts/${post.id}/edit`} className="btn">Edit note</Link><ConfirmDelete action={deletePost} field="id" value={post.id} label="Delete note" /></>}</div></article><section className="discussion"><div className="section-heading"><div><p className="section-kicker">KEEP IT GOING</p><h2>Discussion <span>{post.replies.length}</span></h2></div></div>{user ? <div className="reply-composer card"><Form action={addReply} submit="Add to the thread" encType="multipart/form-data"><input type="hidden" name="postId" value={post.id} /><label htmlFor="reply-content">Your thought</label><RichEditor id="reply-content" name="content" placeholder="Ask a question, add context, or mention @name..." required /><label htmlFor="reply-files">Add files <span className="muted">(optional)</span></label><UploadPicker id="reply-files" /><p className="muted">PNG, JPG, GIF, and PDF · up to 10 MB each. Choose a resolution for each image.</p></Form></div> : <p className="auth-prompt"><Link href="/login">Log in</Link> to join the discussion.</p>}<Thread all={post.replies} parent={null} postId={post.id} canReply={Boolean(user)} userId={user?.id} /></section></div>;
}
