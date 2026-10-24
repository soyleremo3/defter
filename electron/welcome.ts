/** Ilk acilista kasaya konan ornek notlar, cizim ve sablonlar. */

const box = (id: string, x: number, y: number, w: number, h: number, bg: string) => ({
  id, type: "rectangle", x, y, width: w, height: h, angle: 0, strokeColor: "#1e1e1e", backgroundColor: bg,
  fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid", roughness: 1, opacity: 100, roundness: { type: 3 },
  seed: 1, version: 1, versionNonce: 1, isDeleted: false, groupIds: [], boundElements: [], locked: false,
});
const text = (id: string, x: number, y: number, t: string, size = 20) => ({
  id, type: "text", x, y, width: t.length * size * 0.55, height: size * 1.25, angle: 0, strokeColor: "#1e1e1e",
  backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100,
  seed: 2, version: 1, versionNonce: 1, isDeleted: false, groupIds: [], boundElements: [], locked: false,
  text: t, originalText: t, fontSize: size, fontFamily: 5, textAlign: "left", verticalAlign: "top", lineHeight: 1.25,
  containerId: null, autoResize: true,
});
const arrow = (id: string, x: number, y: number, dx: number, dy: number) => ({
  id, type: "arrow", x, y, width: Math.abs(dx), height: Math.abs(dy), angle: 0, strokeColor: "#1e1e1e",
  backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid", roughness: 1, opacity: 100,
  seed: 3, version: 1, versionNonce: 1, isDeleted: false, groupIds: [], boundElements: [], locked: false,
  points: [[0, 0], [dx, dy]], startArrowhead: null, endArrowhead: "arrow", startBinding: null, endBinding: null,
});

const SAMPLE_DRAWING = {
  type: "excalidraw",
  version: 2,
  source: "defter",
  elements: [
    box("a", 0, 0, 200, 90, "#ffc9c9"), text("at", 40, 30, "Fikir 💡"),
    box("b", 320, 0, 200, 90, "#a5d8ff"), text("bt", 355, 30, "Araştırma"),
    box("c", 640, 0, 200, 90, "#b2f2bb"), text("ct", 690, 30, "Uygula"),
    arrow("ab", 205, 45, 110, 0), arrow("bc", 525, 45, 110, 0),
    text("note", 230, 140, "Çift tıkla, yaz, sürükle — her şey otomatik kaydedilir.", 16),
  ],
  appState: { viewBackgroundColor: "#ffffff", gridSize: null },
  files: {},
};

export const WELCOME_FILES: Record<string, string> = {
  "Defter'e hoş geldin.md": `# Defter'e hoş geldin 👋

Defter; fikirlerin, ders notların, kod parçaların ve çizimlerin için **yerel**, **hızlı** ve **bağlantılı** bir defter.
Tüm notların bilgisayarında düz \`.md\` dosyaları olarak durur (Obsidian ile uyumlu).

## Hızlı başlangıç
- \`Ctrl+N\` yeni not · \`Ctrl+O\` hızlı aç · \`Ctrl+P\` komut paleti · \`Ctrl+Shift+F\` ara
- \`Ctrl+E\` okuma / düzenleme · \`Ctrl+\\\` yan yana önizleme
- \`[[\` yazınca notlar arasında bağlantı kurarsın: [[Örnek ders notu]] · [[Örnek kod notu]]
- \`#etiket\` yazarak etiketle: #başlangıç
- Resim yapıştır (\`Ctrl+V\`) → otomatik olarak *Ekler* klasörüne kaydedilir.

## Çizim ve şemalar
Sol üstteki ✏️ ile yeni çizim aç. Çizimler nota gömülebilir:

![[Çizimler/Örnek şema.excalidraw]]

Kodla şema da çizebilirsin (Mermaid):

\`\`\`mermaid
flowchart LR
  Fikir --> Not --> Bağlantı --> Bilgi
\`\`\`

> [!tip] İpucu
> Sağ paneldeki **Bağlantılar** sekmesi bu nota kimlerin bağlandığını gösterir. Sol şeritteki 🕸️ simgesi tüm notların grafiğini açar.

## Yapılacaklar
- [x] Defter'i kur
- [ ] İlk ders notunu yaz
- [ ] Bir şema çiz
`,
  "Örnek ders notu.md": `# Fizik — Enerji

#ders #fizik

> [!note] Tanım
> Enerji, bir sistemin iş yapabilme kapasitesidir.

Kütle–enerji eşdeğerliği: $E = mc^2$

$$
E_k = \\frac{1}{2} m v^2 \\qquad E_p = m g h
$$

| Tür | Formül | Birim |
|---|---|---|
| Kinetik | $\\tfrac12 mv^2$ | J |
| Potansiyel | $mgh$ | J |

==Sınavda çıkar:== enerji korunumu[^1].

- [ ] Problem setini çöz
- [ ] Konuyu [[Defter'e hoş geldin|giriş notu]] ile bağla

[^1]: Kapalı sistemde toplam enerji sabittir.
`,
  "Örnek kod notu.md": `# API tasarım notları

#yazılım #api

\`\`\`ts
export async function getUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
\`\`\`

\`\`\`python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

\`\`\`mermaid
sequenceDiagram
  İstemci->>Sunucu: GET /api/users/42
  Sunucu->>Veritabanı: SELECT
  Veritabanı-->>Sunucu: satır
  Sunucu-->>İstemci: 200 JSON
\`\`\`

> [!warning] Dikkat
> Hata durumlarında her zaman anlamlı bir mesaj döndür.
`,
  "Çizimler/Örnek şema.excalidraw": JSON.stringify(SAMPLE_DRAWING, null, 2),
  "Şablonlar/Ders notu.md": `# {{title}}

#ders
**Tarih:** {{date}} · **Ders:**

## Konular
-

## Önemli
> [!important]
>

## Sorular
- [ ]
`,
  "Şablonlar/Kod notu.md": `# {{title}}

#yazılım
**Tarih:** {{date}}

## Problem

## Çözüm
\`\`\`ts

\`\`\`

## Notlar
`,
  "Şablonlar/Toplantı.md": `# {{title}}

**Tarih:** {{date}} · **Katılımcılar:**

## Gündem
1.

## Kararlar
-

## Aksiyonlar
- [ ]
`,
  "Şablonlar/Proje fikri.md": `# {{title}}

#fikir
**Tarih:** {{date}}

## Problem

## Fikir

## İlk adımlar
- [ ]
`,
};
