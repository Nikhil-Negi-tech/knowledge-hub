"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("knowledge-hub-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("knowledge-hub-theme", next ? "dark" : "light");
    setDark(next);
  }

  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>{dark ? "☀ Light" : "☾ Dark"}</button>;
}
