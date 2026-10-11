import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "../../actions/features";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await db.user.findUnique({ where: { id }, include: { posts: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true, createdAt: true } } } });
  if (!profile) notFound();
  const user = await getCurrentUser();
  return <div className="board"><Link href="/" className="back-link">← Back to the board</Link><div className="profile-card card"><div className="avatar">{profile.emoji}</div><p className="eyebrow">PROFILE</p><h1>{profile.name}</h1><p>{profile.bio || "Sharing notes with the crew."}</p>{user?.id === profile.id && <form action={updateProfile}><label htmlFor="name">Name</label><input id="name" name="name" defaultValue={profile.name} required /><label htmlFor="bio">Bio</label><textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={500} /><label htmlFor="emoji">Profile emoji</label><input id="emoji" name="emoji" defaultValue={profile.emoji} maxLength={8} /><button className="btn btn-primary">Save profile</button></form>}</div><h2>Notes by {profile.name}</h2><div className="feed">{profile.posts.map(post => <article className="post-card" key={post.id}><div className="post-body"><div className="post-meta"><time>{post.createdAt.toISOString().slice(0, 10)}</time></div><h3><Link href={`/posts/${post.id}`}>{post.title}</Link></h3></div></article>)}</div></div>;
}
