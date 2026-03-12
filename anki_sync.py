import sqlite3, json, shutil, os
from datetime import datetime, timezone
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

# ── CONFIG ────────────────────────────────────────────────────────────────────
# If your Anki profile is not "User 1", change the folder name below
ANKI_DB  = Path(os.environ["APPDATA"]) / "Anki2" / "User 1" / "collection.anki2"
DB_COPY  = Path.home() / "anki_collection_copy.anki2"
OUT_FILE = Path.home() / "anki_data.json"
PORT     = 8080
# ─────────────────────────────────────────────────────────────────────────────

def sync():
    if not ANKI_DB.exists():
        print(f"ERROR: Could not find Anki database at:\n  {ANKI_DB}")
        print("Make sure Anki is installed and you have reviewed at least once.")
        return

    # Copy DB — never open the live file directly while Anki could be running
    shutil.copy2(ANKI_DB, DB_COPY)

    conn = sqlite3.connect(DB_COPY)
    cursor = conn.execute("SELECT id FROM revlog")

    dates = set()
    for (ts_ms,) in cursor.fetchall():
        date = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
        dates.add(date)

    conn.close()
    DB_COPY.unlink()

    OUT_FILE.write_text(json.dumps(sorted(dates)))
    print(f"✓ Synced {len(dates)} review days → {OUT_FILE}")

sync()

# Serve the JSON file over local WiFi so Scriptable can fetch it
os.chdir(Path.home())
print(f"\nServing on http://0.0.0.0:{PORT}")
print("Find your PC's IP with:  ipconfig  (look for IPv4 Address under Wi-Fi)")
print("Then set PC_IP in the Scriptable widget to that IP.\n")
print("Leave this window open while you want the widget to update.")

server = HTTPServer(("0.0.0.0", PORT), SimpleHTTPRequestHandler)
server.serve_forever()
