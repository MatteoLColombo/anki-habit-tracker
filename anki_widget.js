// ── Anki Habit Tracker — Scriptable Widget ───────────────────────────────────

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PC_IP = "192.168.1.x"   // ← replace with your PC's IPv4
const PORT  = 8080
const WEEKS = 26
const COLORS = ["#9B59B6", "#E74C3C", "#2E86C1"]
const EMPTY  = new Color("#1a1a2e")
// ─────────────────────────────────────────────────────────────────────────────

function seededRand(seed) {
  let x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getColor(date) {
  const idx = Math.floor(seededRand(date.getTime() / 86400000 + 99) * COLORS.length)
  return new Color(COLORS[idx])
}

let reviewDates = []
try {
  const req = new Request(`http://${PC_IP}:${PORT}/anki_data.json`)
  req.timeoutInterval = 3
  reviewDates = await req.loadJSON()
} catch(e) {
  console.log("PC unreachable — falling back to cache")
}

const fm = FileManager.local()
const cachePath = fm.joinPath(fm.documentsDirectory(), "anki_cache.json")

if (reviewDates.length