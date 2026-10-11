import Link from "next/link";
import { db } from "@/lib/db";
import { isPreviewMode } from "@/lib/app-mode";

const PAGE = 12;
const demoPosts = [
  { id: "preview-1", title: "Welcome to our little corner of the internet", content: "A bright, calm place to share notes, recipes, rabbit holes, and the occasional brilliant question.", authorName: "The crew", createdAt: new Date("2026-10-09"), _count: { replies: 3, attachments: 2 } },
  { id: "preview-2", title: "What are you learning this week?", content: "Drop a link, a thought, or a useful shortcut. Small discoveries add up when we share them.", authorName: "Maya", createdAt: new Date("2026-10-08"), _count: { replies: 5, attachments: 0 } },
];

export default async function Feed({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; page?: string; tag?: string }> }) {
  const sp = await searchParams;
  const query = sp.q?.trim();
  const tag = sp.tag?.trim().toLowerCase();
  if (isPreviewMode) {
    const filtered = query ? demoPosts.filter(p => `${p.title} ${p.content} ${p.authorName}`.toLowerCase().includes(query.toLowerCase())) : demoPosts;
    return <Board posts={filtered} query={query} tag={tag} preview />;
  }
  const page = Math.max(1, Number(sp.page) || 1);
  const where = { ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" as const } }, { content: { contains: query, mode: "insensitive" as const } }, { authorName: { contains: query, mode: "insensitive" as const } }] } : {}), ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}) };
  const posts = await db.post.findMany({ where, orderBy: { createdAt: sp.sort === "oldest" ? "asc" : "desc" }, skip: (page - 1) * PAGE, take: PAGE + 1, select: { id: true, title: true, content: true, authorName: true, createdAt: true, tags: { select: { tag: { select: { name: true } } } }, _count: { select: { replies: true, attachments: true, bookmarks: true } } } });
  return <Board posts={posts.slice(0, PAGE)} query={query} tag={tag} page={page} hasOlder={posts.length > PAGE} sort={sp.sort} />;
}

function Board({ posts, query, tag, preview, page, hasOlder, sort }: { posts: Array<{ id: string; title: string; content: string; authorName: string; createdAt: Date; tags?: Array<{ tag: { name: string } }>; _count: { replies: number; attachments: number; bookmarks?: number } }>; query?: string; tag?: string; preview?: boolean; page?: number; hasOlder?: boolean; sort?: string }) {
  const params = (changes: Record<string, string>) => `/?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(tag ? { tag } : {}), ...(sort ? { sort } : {}), ...changes })}`;
  return <div className="board">
    <section className="hero">
      <div><p className="eyebrow">THE FRIENDS-ONLY KNOWLEDGE BOARD</p><h1>Big notes.<br /><em>Shared freely.</em></h1><p className="hero-copy">A lively little home for notes, discoveries, useful links, and conversations worth keeping.</p></div>
      <div className="hero-orbit" aria-hidden="true"><span>✦</span><span>↗</span><span>☼</span></div>
    </section>
    {preview && <div className="preview-banner">Preview mode is on. Add <code>DATABASE_URL</code> to save real posts in PostgreSQL.</div>}
    <section className="board-toolbar"><div><span className="section-kicker">LATEST DROPS</span><h2>{tag ? `Notes tagged #${tag}` : query ? `Results for “${query}”` : "What’s new"}</h2></div><form action="/" className="search"><input name="q" defaultValue={query} placeholder="Search the board..." aria-label="Search the board" /><button aria-label="Search">⌕</button></form></section>
    <div className="feed">{posts.map((p, i) => <Link className={`post-card tone-${i % 4}`} href={preview ? "#" : `/posts/${p.id}`} key={p.id}><div className="post-number">{String(i + 1).padStart(2, "0")}</div><div className="post-body"><div className="post-meta"><span className="avatar">{p.authorName.slice(0, 1).toUpperCase()}</span><span>{p.authorName}</span><span>·</span><time dateTime={p.createdAt.toISOString()}>{p.createdAt.toISOString().slice(0, 10)}</time></div><h3>{p.title}</h3><p>{p.content.replace(/<[^>]+>/g, " ").slice(0, 220)}{p.content.length > 220 ? "…" : ""}</p><div className="tags">{p.tags?.map(({ tag: item }) => <span key={item.name}>#{item.name}</span>)}</div><div className="post-stats"><span>◌ {p._count.replies} {p._count.replies === 1 ? "thought" : "thoughts"}</span>{p._count.attachments > 0 && <span>↗ {p._count.attachments} files</span>}{p._count.bookmarks !== undefined && <span>🔖 {p._count.bookmarks}</span>}</div></div></Link>)}</div>
    {posts.length === 0 && <div className="empty card"><h3>Nothing here yet.</h3><p>Be the first friend to drop a thought.</p><Link href="/posts/new" className="btn btn-primary">Share the first note</Link></div>}
    <div className="feed-footer">{page && page > 1 && <Link className="btn" href={params({ page: String(page - 1) })}>← Newer</Link>}{hasOlder && <Link className="btn" href={params({ page: String((page ?? 1) + 1) })}>Older →</Link>}</div>
  </div>;
}
