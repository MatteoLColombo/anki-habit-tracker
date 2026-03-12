# Anki Habit Tracker

iPhone home screen widget showing your Anki review history as a heatmap. Uses a small Python script on your PC to read the Anki database and serve it over WiFi to [Scriptable](https://scriptable.app).

---

## Setup

**On your PC** — close Anki, then run:
```bash
python anki_sync.py
```
It'll print your local IP. Leave the terminal open.

> If your Anki profile isn't "User 1", update the `ANKI_DB` path in `anki_sync.py`. You can find your profile name in `%APPDATA%\Anki2`.

**On your iPhone** — paste `anki_widget.js` into Scriptable, set `PC_IP` to your PC's IP, and run it. Then add a Scriptable widget to your home screen and point it to the script.

**Auto-start on login (optional)** — add `anki_sync.py` to Task Scheduler with trigger "When I log on" so it runs automatically.

---

Works only on home WiFi. When away, the widget shows the last cached data.
