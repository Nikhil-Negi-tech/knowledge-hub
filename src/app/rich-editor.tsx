"use client";

import { useRef } from "react";

const TABLE_ROWS = 3;
const TABLE_COLUMNS = 3;

export function RichEditor({ name, id, placeholder, defaultValue = "", required = false }: {
  name: string;
  id: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const hiddenInput = useRef<HTMLInputElement>(null);

  function sync() {
    if (editor.current && hiddenInput.current) hiddenInput.current.value = editor.current.innerHTML;
  }

  function command(commandName: string, value?: string) {
    editor.current?.focus();
    document.execCommand(commandName, false, value);
    sync();
  }

  function insertLink() {
    const url = window.prompt("Enter a URL");
    if (url?.trim()) command("createLink", url.trim());
  }

  function currentCell() {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    return node instanceof Element ? node.closest("td, th") : node?.parentElement?.closest("td, th");
  }

  function changeTable(action: "row" | "column" | "delete-row" | "delete-column") {
    const cell = currentCell();
    if (!cell) {
      window.alert("Place your cursor inside a table cell first.");
      return;
    }
    const row = cell.parentElement;
    const table = cell.closest("table");
    if (!row || !table) return;
    const cellIndex = Array.from(row.children).indexOf(cell);
    if (action === "row") {
      const newRow = row.cloneNode(true) as HTMLTableRowElement;
      Array.from(newRow.children).forEach((child, index) => {
        child.textContent = index === 0 && child.tagName === "TH" ? `Header ${index + 1}` : "Cell";
      });
      row.after(newRow);
    } else if (action === "column") {
      Array.from(table.rows).forEach(tableRow => {
        const isHeader = tableRow.children[cellIndex]?.tagName === "TH";
        const newCell = document.createElement(isHeader ? "th" : "td");
        newCell.textContent = isHeader ? `Header ${cellIndex + 1}` : "Cell";
        tableRow.children[cellIndex]?.after(newCell);
      });
    } else if (action === "delete-row") {
      if (table.rows.length <= 1) {
        window.alert("A table must keep at least one row.");
        return;
      }
      row.remove();
    } else {
      if (row.children.length <= 1) {
        window.alert("A table must keep at least one column.");
        return;
      }
      Array.from(table.rows).forEach(tableRow => tableRow.children[cellIndex]?.remove());
    }
    sync();
  }

  function insertTable() {
    const rows = Array.from({ length: TABLE_ROWS }, (_, row) =>
      `<tr>${Array.from({ length: TABLE_COLUMNS }, (_, column) => `<${row === 0 ? "th" : "td"}>${row === 0 ? `Header ${column + 1}` : "Cell"}</${row === 0 ? "th" : "td"}>`).join("")}</tr>`
    ).join("");
    command("insertHTML", `<table><tbody>${rows}</tbody></table><p><br></p>`);
  }

  return <div className="rich-editor">
    <div className="editor-toolbar" aria-label="Formatting tools">
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("bold")} aria-label="Bold"><strong>B</strong></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("italic")} aria-label="Italic"><em>I</em></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("underline")} aria-label="Underline"><u>U</u></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("strikeThrough")} aria-label="Strikethrough"><s>S</s></button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("formatBlock", "<h2>")} aria-label="Large heading">H1</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("formatBlock", "<h3>")} aria-label="Small heading">H2</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("formatBlock", "<p>")} aria-label="Paragraph">¶</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("insertUnorderedList")} aria-label="Bulleted list">• List</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("insertOrderedList")} aria-label="Numbered list">1. List</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("outdent")} aria-label="Decrease indent">←</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("indent")} aria-label="Increase indent">→</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("formatBlock", "<pre>")} aria-label="Code block">&lt;/&gt;</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={insertLink} aria-label="Insert link">Link</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("insertHorizontalRule")} aria-label="Divider">—</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("removeFormat")} aria-label="Clear formatting">Clear</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("formatBlock", "<blockquote>")} aria-label="Quote">Quote</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={insertTable} aria-label="Insert table">Table</button>
      <span className="editor-toolbar-divider" aria-hidden="true" />
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => changeTable("row")} aria-label="Add table row">+ Row</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => changeTable("column")} aria-label="Add table column">+ Column</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => changeTable("delete-row")} aria-label="Delete table row">− Row</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => changeTable("delete-column")} aria-label="Delete table column">− Column</button>
    </div>
    <div
      ref={editor}
      id={`${id}-editor`}
      className="editor-surface"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      data-default-value={defaultValue}
      dangerouslySetInnerHTML={{ __html: defaultValue }}
      onInput={event => {
        if (hiddenInput.current) hiddenInput.current.value = event.currentTarget.innerHTML;
      }}
      role="textbox"
      aria-multiline="true"
      aria-label={placeholder}
    />
    <input ref={hiddenInput} name={name} type="hidden" defaultValue={defaultValue} required={required} />
  </div>;
}
