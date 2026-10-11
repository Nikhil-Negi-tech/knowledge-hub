"use client";

export function ConfirmDelete({ action, label, field, value }: { action: (formData: FormData) => void | Promise<void>; label: string; field: string; value: string }) {
  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete this ${label.toLowerCase()} permanently?`)) event.preventDefault();
  }

  return <form action={action} onSubmit={confirmDelete}><input type="hidden" name={field} value={value} /><button className="btn danger" type="submit">{label}</button></form>;
}
