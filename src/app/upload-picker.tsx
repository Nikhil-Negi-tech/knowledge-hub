"use client";

import { useEffect, useRef, useState } from "react";

type PickedFile = { name: string; isImage: boolean };

export function UploadPicker({ id }: { id: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PickedFile[]>([]);

  useEffect(() => {
    const form = input.current?.closest("form");
    if (!form) return;
    const clear = () => setFiles([]);
    form.addEventListener("clear-all", clear);
    return () => form.removeEventListener("clear-all", clear);
  }, []);

  return <div className="upload-picker">
    <input ref={input} id={id} name="files" type="file" multiple accept=".png,.jpg,.jpeg,.gif,.pdf" onChange={event => setFiles(Array.from(event.target.files ?? []).map(file => ({ name: file.name, isImage: file.type.startsWith("image/") })))} />
    {files.length > 0 && <div className="upload-list">{files.map((file, index) => <label className="upload-row" key={`${file.name}-${index}`}><span>{file.name}</span>{file.isImage ? <select name="imageSizes" defaultValue="medium" aria-label={`Resolution for ${file.name}`}><option value="verySmall">Very small (320px)</option><option value="small">Small (640px)</option><option value="medium">Medium (1280px)</option><option value="original">Original</option></select> : <><input type="hidden" name="imageSizes" value="original" /><span className="muted">Original (PDF)</span></>}</label>)}</div>}
  </div>;
}
