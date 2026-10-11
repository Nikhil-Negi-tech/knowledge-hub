import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./actions/auth";
import { db } from "@/lib/db";
import { ThemeToggle } from "./theme-toggle";

export const metadata = {
  title: "Knowledge Hub",
  description: "A bright, shared corner for four curious minds."
};

export default async function Root({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unread = user ? await db.notification.count({ where: { userId: user.id, readAt: null } }) : 0;
  return <html lang="en"><body>
    <header className="topbar">
      <Link href="/" className="brand"><span className="brand-mark">✦</span><span>Knowledge<span className="brand-accent">Hub</span></span></Link>
      <nav className="top-actions" aria-label="Quick actions">
        <Link href="/" className="top-link">The board</Link>
        <ThemeToggle />
        {user ? <><Link href={`/users/${user.id}`} className="user-chip"><span className="profile-emoji" aria-hidden="true">{user.emoji}</span><span className="top-user"><small>Signed in as</small>{user.name}</span></Link><Link href="/bookmarks" className="top-link">Saved</Link><Link href="/notifications" className="top-link">Alerts{unread ? ` (${unread})` : ""}</Link><form action={logout}><button className="top-link top-button">Log out</button></form><Link href="/posts/new" className="btn btn-primary">+ Share a note</Link></> : <><Link href="/login" className="top-link">Log in</Link><Link href="/register" className="btn btn-primary">Join the hub</Link></>}
      </nav>
    </header>
    <main>{children}</main>
    <footer className="footer">Made for friends who never stop swapping good notes.</footer>
  </body></html>;
}
