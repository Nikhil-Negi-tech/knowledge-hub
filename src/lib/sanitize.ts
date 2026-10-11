import sanitizeHtml from "sanitize-html";
export const clean = (html: string) => sanitizeHtml(html, {
  allowedTags: ["p","br","hr","h2","h3","ul","ol","li","b","i","u","s","strong","em","code","pre","blockquote","a","table","thead","tbody","tr","th","td"],
  allowedAttributes: { a: ["href"] }, allowedSchemes: ["http","https","mailto"],
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }) } });
