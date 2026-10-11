import Link from "next/link";
import { Form } from "../../form";
import { createPost } from "../../actions/posts";
import { RichEditor } from "../../rich-editor";
import { UploadPicker } from "../../upload-picker";
import { DraftAutosave } from "../../draft-autosave";

export default function Page() {
  return <div className="compose-wrap"><Link href="/" className="back-link">← Back to the board</Link><div className="compose card"><p className="eyebrow">NEW DROP</p><h1>What’s on your mind?</h1><p className="lead">Write it down. Make it useful. Make it yours.</p>
    <DraftAutosave /><Form action={createPost} submit="Publish to the board" encType="multipart/form-data" showSuccess><label htmlFor="title">Headline</label><input id="title" name="title" placeholder="Give your note a memorable title" required /><label htmlFor="tags">Tags <span className="muted">(comma separated)</span></label><input id="tags" name="tags" placeholder="learning, links, recipes" /><label htmlFor="content">The good stuff</label><RichEditor id="content" name="content" placeholder="Share a note, question, link, recipe, or discovery..." required /><label htmlFor="files">Add files <span className="muted">(optional)</span></label><UploadPicker id="files" /><p className="muted">PNG, JPG, GIF, and PDF · up to 10 MB each. Choose a resolution for each image.</p></Form>
  </div></div>;
}
