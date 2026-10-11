export default { outputFileTracingRoot: new URL(".", import.meta.url).pathname, serverExternalPackages:["@node-rs/argon2"], experimental:{serverActions:{bodySizeLimit:"26mb"}},
 async headers(){return[{source:"/(.*)",headers:[
 {key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"DENY"},{key:"Referrer-Policy",value:"same-origin"},
 {key:"Content-Security-Policy",value:"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"}]}]}};
