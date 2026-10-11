import Link from "next/link";
import { Form } from "../form";
import { register } from "../actions/auth";
import { EmojiPicker } from "../emoji-picker";

export default function RegisterPage() {
  return <div className="auth-wrap"><div className="auth-card card"><p className="eyebrow">JOIN THE HUB</p><h1>Create your account</h1><p className="lead">Choose a profile emoji and start sharing notes.</p><Form action={register} submit="Create account"><label htmlFor="name">Name</label><input id="name" name="name" placeholder="Your display name" required /><label htmlFor="email">Email</label><input id="email" name="email" type="email" placeholder="you@example.com" required /><label htmlFor="password">Password</label><input id="password" name="password" type="password" required /><label htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" required /><EmojiPicker /></Form><p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p></div></div>;
}
