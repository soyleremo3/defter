import { lazy, Suspense, useState } from "react";
import {
  BookOpen, CalendarDays, Columns2, Download, ExternalLink, FilePlus, FileText, Image as ImageIcon, MoreHorizontal, Network,
  PenLine, PenTool, Pencil, Trash2, X,
} from "lucide-react";
import { api, vaultUrl, type ViewMode } from "../api";
import { exportNote } from "../lib/exporter";
import { basename, dirname, title } from "../lib/paths";
import {
  closeTab, deletePath, isDark, moveTab, newDrawing, newNote, openDaily, renamePath, setActive, setMode, useIndex, useStore,
  type Tab,
} from "../store";
import { Editor } from "./Editor";
import { GraphView } from "./GraphView";
import { openMenu } from "./Overlays";
import { Preview } from "./Preview";

const DrawingView = lazy(() => import("./DrawingView"));

function tabIcon(tab: Tab) {
  if (tab.kind === "graph") return <Network size={14} />;
  if (tab.kind === "drawing") return <PenTool size={14} />;
  if (tab.kind === "image") return <ImageIcon size={14} />;
  return <FileText size={14} />;
}

function TabBar() {
  const tabs = useStore((s) => s.tabs);
  const active = useStore((s) => s.active);
  const dirty = useStore((s) => s.dirty);
  const [dragId, setDragId] = useState<string | null>(null);
  return (
    <div className="tabbar" onDoubleClick={(e) => e.target === e.currentTarget && newNote()}>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          className={`tab${t.id === active ? " active" : ""}`}
          draggable
          onDragStart={() => setDragId(t.id)}
          onDragOver={(e) => dragId && e.preventDefault()}
          onDrop={() => {
            if (dragId) moveTab(dragId, i);
            setDragId(null);
          }}
          onMouseDown={(e) => e.button === 0 && setActive(t.id)}
          onAuxClick={(e) => e.button === 1 && closeTab(t.id)}
          title={t.kind === "graph" ? "Grafik" : t.path}
        >
          <span className="tab-icon">{tabIcon(t)}</span>
          <span className="tab-title">{t.kind === "graph" ? "Grafik" : t.kind === "note" ? title(t.path) : basename(t.path)}</span>
          {dirty[t.path] ? <span className="dirty-dot" /> : null}
          <button
            className="tab-close"
            title="Kapat (Ctrl+W)"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              closeTab(t.id);
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <button className="icon-btn new-tab" title="Yeni not (Ctrl+N)" onClick={() => newNote()}>
        <FilePlus size={15} />
      </button>
    </div>
  );
}

function ModeSwitch({ path }: { path: string }) {
  const mode = useStore((s) => s.modes[path] ?? s.settings?.defaultMode ?? "edit");
  const btn = (m: ViewMode, icon: React.ReactNode, label: string) => (
    <button className={mode === m ? "on" : ""} title={label} onClick={() => setMode(path, m)}>
      {icon}
    </button>
  );
  return (
    <div className="seg small">
      {btn("edit", <PenLine size={14} />, "Düzenle (Ctrl+E)")}
      {btn("split", <Columns2 size={14} />, "Yan yana (Ctrl+\\)")}
      {btn("read", <BookOpen size={14} />, "Oku (Ctrl+E)")}
    </div>
  );
}

function NoteHeader({ tab }: { tab: Tab }) {
  const folder = dirname(tab.path);
  return (
    <div className="view-header">
      <div className="breadcrumb" onDoubleClick={() => renamePath(tab.path)} title="Çift tıkla: yeniden adlandır">
        {folder && <span className="crumb-dir">{folder.replace(/\//g, " / ")} / </span>}
        <span className="crumb-name">{tab.kind === "note" ? title(tab.path) : basename(tab.path)}</span>
      </div>
      <div className="view-actions">
        {tab.kind === "note" && <ModeSwitch path={tab.path} />}
        <button
          className="icon-btn"
          title="Diğer"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            openMenu(r.left - 150, r.bottom + 4, [
              ...(tab.kind === "note"
                ? [
                    { label: "PDF olarak dışa aktar", icon: <Download size={14} />, run: () => void exportNote(tab.path, "pdf") },
                    { label: "HTML olarak dışa aktar", icon: <Download size={14} />, run: () => void exportNote(tab.path, "html") },
                    "sep" as const,
                  ]
                : []),
              { label: "Yeniden adlandır", icon: <Pencil size={14} />, run: () => renamePath(tab.path) },
              { label: "Dosya Gezgini'nde göster", icon: <ExternalLink size={14} />, run: () => void api.vault.reveal(tab.path) },
              "sep",
              { label: "Sil", icon: <Trash2 size={14} />, danger: true, run: () => deletePath(tab.path) },
            ]);
          }}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

function NoteView({ tab, active }: { tab: Tab; active: boolean }) {
  const content = useStore((s) => s.notes[tab.path]);
  const mode = useStore((s) => s.modes[tab.path] ?? s.settings?.defaultMode ?? "edit");
  const spellcheck = useStore((s) => !!s.settings?.spellcheck);
  if (content === undefined) return <div className="empty-state">Not yükleniyor…</div>;
  return (
    <div className={`note-view mode-${mode}`}>
      {mode !== "read" && <Editor path={tab.path} content={content} active={active} spellcheck={spellcheck} />}
      {mode !== "edit" && <Preview path={tab.path} content={content} />}
    </div>
  );
}

function StatusBar() {
  const tab = useStore((s) => s.tabs.find((t) => t.id === s.active));
  const content = useStore((s) => (tab?.kind === "note" ? s.notes[tab.path] : undefined));
  const dirty = useStore((s) => (tab ? !!s.dirty[tab.path] : false));
  const idx = useIndex();
  if (!tab || tab.kind !== "note" || content === undefined) return <footer className="statusbar" />;
  const words = idx.parsed.get(tab.path)?.words ?? 0;
  const back = new Set((idx.backlinks.get(tab.path) ?? []).map((b) => b.from)).size;
  return (
    <footer className="statusbar">
      <span>{back} geri bağlantı</span>
      <span>{words.toLocaleString("tr")} kelime</span>
      <span>{content.length.toLocaleString("tr")} karakter</span>
      <span>~{Math.max(1, Math.round(words / 200))} dk okuma</span>
      <span className={dirty ? "saving" : "saved"}>{dirty ? "Kaydediliyor…" : "Kaydedildi"}</span>
    </footer>
  );
}

function EmptyState() {
  return (
    <div className="welcome">
      <div className="welcome-mark">D</div>
      <h2>Defter</h2>
      <p>Fikirlerin, derslerin, kodların ve çizimlerin tek yerde.</p>
      <div className="welcome-actions">
        <button className="btn primary" onClick={() => newNote()}><FilePlus size={15} /> Yeni not <kbd>Ctrl+N</kbd></button>
        <button className="btn" onClick={() => newDrawing()}><PenTool size={15} /> Yeni çizim <kbd>Ctrl+Shift+N</kbd></button>
        <button className="btn" onClick={() => void openDaily()}><CalendarDays size={15} /> Günlük not <kbd>Ctrl+Alt+D</kbd></button>
        <button className="btn" onClick={() => useStore.setState({ overlay: "switcher" })}><FileText size={15} /> Not aç <kbd>Ctrl+O</kbd></button>
      </div>
    </div>
  );
}

export function Workspace() {
  const tabs = useStore((s) => s.tabs);
  const active = useStore((s) => s.active);
  const dark = useStore(isDark);
  const current = tabs.find((t) => t.id === active);
  return (
    <main className="workspace">
      <TabBar />
      {current && current.kind !== "graph" && <NoteHeader tab={current} />}
      <div className="views">
        {!tabs.length && <EmptyState />}
        {tabs.map((t) => (
          <div key={t.id} className="view" style={{ display: t.id === active ? "flex" : "none" }}>
            {t.kind === "note" && <NoteView tab={t} active={t.id === active} />}
            {t.kind === "drawing" && (
              <Suspense fallback={<div className="empty-state">Çizim aracı yükleniyor…</div>}>
                <DrawingView path={t.path} dark={dark} active={t.id === active} />
              </Suspense>
            )}
            {t.kind === "image" && (
              <div className="image-view">
                <img src={vaultUrl(t.path)} alt={basename(t.path)} />
              </div>
            )}
            {t.kind === "graph" && <GraphView active={t.id === active} />}
          </div>
        ))}
      </div>
      <StatusBar />
    </main>
  );
}
