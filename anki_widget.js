// ── Anki Habit Tracker — Scriptable Widget ───────────────────────────────────
// Displays a heatmap of your Anki review history on your iPhone home screen.
// Requires anki_sync.py running on your PC on the same WiFi network.
// ─────────────────────────────────────────────────────────────────────────────

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PC_IP = "192.168.1.x"   // ← replace with your PC's IPv4 (from ipconfig)
const PORT  = 8080
const WEEKS = 26
// ─────────────────────────────────────────────────────────────────────────────

const DONE_COLOR  = new Color("#32CD32")
const EMPTY_COLOR = new Color("#1e2d1e")
const CELL_SIZE   = 9
const GAP         = 2

// Try to fetch fresh data from PC
let reviewDates = []
try {
  const req = new Request(`http://${PC_IP}:${PORT}/anki_data.json`)
  req.timeoutInterval = 3
  reviewDates = await req.loadJSON()
} catch(e) {
  console.log("PC unreachable — falling back to cache")
}

// Cache locally so widget still shows data when away from home WiFi
const fm = FileManager.local()
const cachePath = fm.joinPath(fm.documentsDirectory(), "anki_cache.json")

if (reviewDates.length > 0) {
  fm.writeString(cachePath, JSON.stringify(reviewDates))
} else if (fm.fileExists(cachePath)) {
  reviewDates = JSON.parse(fm.readString(cachePath))
}

const doneSet = new Set(reviewDates)

function toKey(d) {
  return d.toISOString().split("T")[0]
}

// Build widget
const widget = new ListWidget()
widget.backgroundColor = new Color("#111811")
widget.setPadding(12, 14, 12, 14)

const row = widget.addStack()
row.layoutHorizontally()
row.spacing = GAP

const today = new Date()
const start = new Date(today)
start.setDate(start.getDate() - (WEEKS * 7 - 1))

for (let w = 0; w < WEEKS; w++) {
  const col = row.addStack()
  col.layoutVertically()
  col.spacing = GAP

  for (let d = 0; d < 7; d++) {
    const date = new Date(start)
    date.setDate(date.getDate() + w * 7 + d)

    const cell = col.addStack()
    cell.size = new Size(CELL_SIZE, CELL_SIZE)
    cell.cornerRadius = 2

    const future = date > today
    const done = doneSet.has(toKey(date))
    cell.backgroundColor = (!future && done) ? DONE_COLOR : EMPTY_COLOR
  }
}

Script.setWidget(widget)
Script.complete()
