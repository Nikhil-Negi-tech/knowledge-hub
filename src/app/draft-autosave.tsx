"use client";

import { useEffect } from "react";

export function DraftAutosave() {
  useEffect(() => {
    const key = "knowledge-hub-draft";
    const form = document.querySelector("form");
    if (!form) return;
    const title = form.querySelector<HTMLInputElement>("[name=title]");
    const content = form.querySelector<HTMLInputElement>("[name=content]");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const draft = JSON.parse(saved) as { title?: string; content?: string };
        if (title && !title.value) title.value = draft.title ?? "";
        if (content && !content.value) content.value = draft.content ?? "";
      } catch {
        localStorage.removeItem(key);
      }
    }
    const timer = window.setInterval(() => localStorage.setItem(key, JSON.stringify({ title: title?.value ?? "", content: content?.value ?? "" })), 1000);
    const clear = () => localStorage.removeItem(key);
    form.addEventListener("submit", clear);
    return () => { window.clearInterval(timer); form.removeEventListener("submit", clear); };
  }, []);
  return <p className="muted">Your unfinished note is saved automatically on this device.</p>;
}
