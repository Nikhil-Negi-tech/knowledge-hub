import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { markNotificationsRead } from "../actions/features";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div className="board"><Link href="/" className="back-link">← Back to the board</Link><div className="section-heading"><div><p className="eyebrow">INBOX</p><h1>Notifications</h1></div><form action={markNotificationsRead}><button className="btn">Mark all read</button></form></div><div className="feed">{notifications.map(notification => <article className={`post-card ${notification.readAt ? "" : "card"}`} key={notification.id}><div className="post-body"><div className="post-meta"><time>{notification.createdAt.toISOString().slice(0, 16).replace("T", " ")}</time></div><p>{notification.message}</p>{notification.postId && <Link href={`/posts/${notification.postId}`}>Open note →</Link>}</div></article>)}</div></div>;
}
