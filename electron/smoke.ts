/**
 * Otomatik duman testi (sadece DEFTER_SMOKE=<klasor> ortam degiskeni verilirse calisir).
 * Uygulamayi gercek pencerede gezer, her adimin ekran goruntusunu kaydeder ve kapanir.
 */
import { app, type BrowserWindow } from "electron";
import { promises as fs, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runSmoke(win: BrowserWindow, outDir: string): Promise<void> {
  await fs.mkdir(outDir, { recursive: true });
  const wc = win.webContents;
  const log: string[] = [];
  wc.on("console-message", (e) => {
    if (e.level === "error" || e.level === "warning") log.push(`[${e.level}] ${e.message}`);
  });
  const shot = async (name: string) => {
    const img = await wc.capturePage();
    await fs.writeFile(path.join(outDir, `${name}.png`), img.toPNG());
  };
  const key = async (keyCode: string, modifiers: ("control" | "shift" | "alt")[] = []) => {
    wc.sendInputEvent({ type: "keyDown", keyCode, modifiers });
    wc.sendInputEvent({ type: "keyUp", keyCode, modifiers });
    await wait(400);
  };
  const type = async (text: string) => {
    for (const ch of text) wc.sendInputEvent({ type: "char", keyCode: ch });
    await wait(300);
  };
  const vault = process.env.DEFTER_VAULT || "";
  const read = (rel: string) => {
    try {
      return readFileSync(path.join(vault, rel), "utf8");
    } catch (e) {
      return `OKUNAMADI: ${String(e)}`;
    }
  };
  const js = (code: string) => wc.executeJavaScript(code, true);
  const clickRow = (title: string) =>
    js(`(() => { const r = [...document.querySelectorAll('.tree-row')].find(e => e.title === ${JSON.stringify(title)}); r?.click(); return !!r; })()`);

  try {
    win.focus();
    await wait(2500);
    await shot("01-hosgeldin-duzenleme");
    await key("\\", ["control"]);
    await wait(2500);
    await shot("02-yan-yana");
    await key("E", ["control"]);
    await wait(1500);
    await shot("03-okuma");
    log.push(`ders notu acildi: ${await clickRow("Örnek ders notu.md")}`);
    await wait(500);
    await key("E", ["control"]);
    await wait(1500);
    await shot("04-ders-notu");
    log.push(`kod notu acildi: ${await clickRow("Örnek kod notu.md")}`);
    await wait(500);
    await key("E", ["control"]);
    await wait(2500);
    await shot("05-kod-notu");
    await key("G", ["control", "shift"]);
    await wait(3000);
    await shot("06-grafik");
    await clickRow("Çizimler");
    await wait(300);
    log.push(`cizim acildi: ${await clickRow("Çizimler/Örnek şema.excalidraw")}`);
    await wait(5000);
    await shot("07-cizim");
    await key("P", ["control"]);
    await wait(500);
    await shot("08-komut-paleti");
    await key("Escape");
    await key(",", ["control"]);
    await wait(500);
    await shot("09-ayarlar");
    await key("Escape");
    await js(`document.querySelector('.dialog .btn.primary')?.click()`);
    // --- yeni not, yazma, otomatik kaydetme
    await key("N", ["control"]);
    await wait(400);
    await type("Test notu");
    await key("Return");
    await wait(900);
    await key("End", ["control"]);
    await type("Merhaba [[Örnek ders notu");
    await key("Escape");
    await type("]] #test");
    await wait(1500);
    log.push(`TEST NOTU DISKTE: ${JSON.stringify(read(TEST_NOTE))}`);
    await shot("10-yeni-not");
    // --- yeniden adlandirma + baglanti guncelleme
    await clickRow("Örnek ders notu.md");
    await wait(400);
    await key("F2");
    await wait(300);
    await type("Fizik notu");
    await key("Return");
    await wait(2000);
    log.push(`YENIDEN ADLANDIRMA: eski var mi=${!read("Örnek ders notu.md").startsWith("OKUNAMADI") } yeni var mi=${!read("Fizik notu.md").startsWith("OKUNAMADI")}`);
    log.push(`TEST NOTU BAGLANTI: ${JSON.stringify(read(TEST_NOTE))}`);
    log.push(`HOSGELDIN BAGLANTI: ${(read("Defter'e hoş geldin.md").match(/\[\[[^\]]*(Fizik|ders)[^\]]*\]\]/g) || []).join(" ")}`);
    // --- arama
    await key("F", ["control", "shift"]);
    await wait(300);
    await type("enerji");
    await wait(800);
    await shot("11-arama");
    // --- acik tema
    await key("P", ["control"]);
    await type("açık tema");
    await key("Return");
    await wait(1200);
    await clickRow("Fizik notu.md");
    await wait(1500);
    await shot("12-acik-tema");
    log.push(`font fetch: ${await js(`fetch("defter://app/fonts/Excalifont/Excalifont-Regular-349fac6ca4700ffec595a7150a0d1e1d.woff2").then(r => r.status + " " + r.headers.get("content-type")).catch(e => "ERR " + e)`)}`);
    log.push(`fonts: ${await js(`[...document.fonts].filter(f => f.family.includes("Excalifont")).map(f => f.status).join(",")`)}`);
    log.push(`hatalar: ${JSON.stringify(await js("window.__errors || []"))}`);
  } catch (e) {
    log.push(`SMOKE HATA: ${String(e)}`);
  }
  await fs.writeFile(path.join(outDir, "log.txt"), log.join("\n"), "utf8");
  // --- kapanirken kaydetme: yaz ve hemen kapat (600 ms otomatik kayit beklenmeden)
  try {
    await key("O", ["control"]);
    await type("Test notu");
    await key("Return");
    await wait(600);
    await key("End", ["control"]);
    await type(" KAPANIS");
    await shot("13-kapanis-oncesi");
    win.on("closed", () => {
      writeFileSync(path.join(outDir, "log.txt"), `${log.join("\n")}\nKAPANISTA DISK: ${JSON.stringify(read(TEST_NOTE))}`, "utf8");
    });
    win.close();
  } catch {
    app.quit();
  }
}

const TEST_NOTE = "Çizimler/Test notu.md";
