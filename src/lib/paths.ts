export const basename = (p: string) => p.slice(p.lastIndexOf("/") + 1);
export const dirname = (p: string) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
export const extname = (p: string) => {
  const b = basename(p);
  const i = b.lastIndexOf(".");
  return i > 0 ? b.slice(i).toLowerCase() : "";
};
export const join = (...parts: string[]) => parts.filter(Boolean).join("/").replace(/\/+/g, "/");
/** "Klasor/Not.md" -> "Not" */
export const title = (p: string) => {
  const b = basename(p);
  const e = extname(b);
  return e ? b.slice(0, -e.length) : b;
};
export const stripExt = (p: string) => {
  const e = extname(p);
  return e ? p.slice(0, -e.length) : p;
};

export const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif"]);
export const isNote = (p: string) => extname(p) === ".md";
export const isDrawing = (p: string) => extname(p) === ".excalidraw";
export const isImage = (p: string) => IMAGE_EXTS.has(extname(p));

/** Dosya adinda Windows'un kabul etmedigi karakterleri temizler. */
export function sanitizeName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001f#^[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "")
    .slice(0, 150);
}

export function todayStamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function timeStamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${todayStamp(d)} ${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
