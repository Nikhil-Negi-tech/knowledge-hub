"use client";
import { useActionState, useRef } from "react";
import Link from "next/link";
export type FormState = { error?: string; success?: { postId: string } } | undefined;
export function Form({ action, children, submit, encType, showSuccess = false }: { action: (s: FormState, f: FormData) => Promise<FormState>; children: React.ReactNode; submit: string; encType?: string; showSuccess?: boolean }) {
  const [s, a, pending] = useActionState(action, undefined);
  const form = useRef<HTMLFormElement>(null);
  function clearAll() {
    const currentForm = form.current;
    if (!currentForm) return;
    currentForm.querySelectorAll<HTMLInputElement>("input:not([type='hidden']), textarea").forEach(field => {
      field.value = "";
    });
    currentForm.querySelectorAll<HTMLInputElement>("input[type='file']").forEach(field => {
      field.value = "";
    });
    currentForm.dispatchEvent(new Event("clear-all"));
    currentForm.querySelectorAll<HTMLElement>(".editor-surface").forEach(editor => {
      editor.innerHTML = "";
      const hidden = editor.parentElement?.querySelector<HTMLInputElement>("input[type='hidden']");
      if (hidden) hidden.value = "";
    });
  }
  if (showSuccess && s?.success) return <div className="success-card" role="status"><p className="eyebrow">PUBLISHED</p><h2>Your note is live.</h2><p>Share another thought or open the one you just published.</p><div className="form-actions"><Link className="btn btn-primary" href="/posts/new">Submit another note</Link><Link className="btn" href={`/posts/${s.success.postId}`}>View this note</Link></div></div>;
  return (<form ref={form} action={a} encType={encType}>{children}
    {s?.error && <p role="alert" className="err">{s.error}</p>}
    <p className="form-actions"><button className="btn" disabled={pending}>{pending ? "Working…" : submit}</button><button type="button" onClick={clearAll} className="btn btn-secondary" disabled={pending}>Clear all</button></p></form>);
}
