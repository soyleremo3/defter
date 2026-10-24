export type FileEntry = { path: string; name: string; ext: string; dir: boolean; mtime: number; size: number };
export type ViewMode = "edit" | "split" | "read";

export type Settings = {
  vaultPath: string;
  theme: "system" | "dark" | "light";
  fontSize: number;
  editorFont: "sans" | "mono";
  readableWidth: boolean;
  spellcheck: boolean;
  defaultMode: ViewMode;
  session: { tabs: string[]; active: string | null; leftOpen: boolean; rightOpen: boolean };
  dark: boolean;
};

type DefterApi = {
  settings: {
    get(): Promise<Settings>;
    set(patch: Partial<Settings>): Promise<Settings>;
    setTitlebar(bg: string, fg: string): Promise<void>;
  };
  vault: {
    info(): Promise<{ path: string; name: string }>;
    choose(): Promise<{ path: string; name: string } | null>;
    list(): Promise<FileEntry[]>;
    readAll(): Promise<Record<string, string>>;
    read(rel: string): Promise<string>;
    write(rel: string, content: string): Promise<void>;
    writeBinary(rel: string, data: Uint8Array): Promise<void>;
    unique(rel: string): Promise<string>;
    mkdir(rel: string): Promise<void>;
    rename(from: string, to: string): Promise<void>;
    trash(rel: string): Promise<void>;
    reveal(rel: string): Promise<void>;
    openFolder(): Promise<void>;
    onChanged(cb: (paths: string[]) => void): () => void;
  };
  app: {
    openExternal(url: string): Promise<void>;
    version(): Promise<string>;
    onThemeChanged(cb: (dark: boolean) => void): () => void;
    onFlush(cb: () => void): () => void;
    flushed(): void;
  };
  exporter: {
    html(html: string, name: string): Promise<boolean>;
    pdf(html: string, name: string): Promise<boolean>;
  };
};

declare global {
  interface Window {
    defter: DefterApi;
    EXCALIDRAW_ASSET_PATH?: string;
    __errors?: string[];
  }
}

export const api: DefterApi = window.defter;

/** Kasa dosyasinin uygulama icindeki adresi (resimler, cizimler). */
export const vaultUrl = (rel: string) => `defter://vault/${rel.split("/").map(encodeURIComponent).join("/")}`;
