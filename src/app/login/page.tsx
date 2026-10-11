import Link from "next/link";
import { Form } from "../form";
import { login } from "../actions/auth";

export default function LoginPage() {
  return <div className="auth-wrap"><div className="auth-card card"><p className="eyebrow">WELCOME BACK</p><h1>Log in</h1><p className="lead">Pick up where you left off.</p><Form action={login} submit="Log in"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /><label htmlFor="password">Password</label><input id="password" name="password" type="password" required /></Form><p className="auth-switch">New here? <Link href="/register">Create an account</Link></p></div></div>;
}
