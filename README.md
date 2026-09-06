# My-Song-Builder
Not Your Song Builder
# Chord Section Builder — V1

A mobile-friendly browser app for entering guitar/bass chord shapes, grouping them into song sections, arranging those sections, and generating practice/theory views.

## Included in V1

- 4–8 strings
- Guitar/bass/custom instrument mode
- Common tuning presets + editable custom tuning
- Fret entry low → high using `X`, `0`, `1`, `2`, etc.
- Automatic sounding-note calculation
- Automatic chord-name estimation
- Chord shape library:
  - starter standard guitar/bass shapes
  - automatically learns shapes you enter for each tuning
- Sections with letters, names, and notes
- Section label preference:
  - `C — Chorus`
  - `Section C`
- Drag sections into the organizer
- Drag arrangement entries to reorder
- Copy mode with the in-app note: **“Select Copy to duplicate.”**
- Repeat count and arrangement notes
- Practice output
- Theory output with ranked key estimate + confidence
- PNG practice-card export
- Local browser song saving
- Installable/offline-capable PWA shell

## Running it

### Simplest
Open `index.html` in a modern browser.

### Recommended
Run from a tiny local web server so the offline/PWA features work correctly.

If Python is installed:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## V1 design note

The layout already uses the split-screen concept on larger displays:
- chord entry/sections on the left
- song organizer on the right

On narrow mobile screens it collapses to one column.

## Key detection

The app uses:
- all sounding pitch classes
- estimated chord roots/qualities
- repeated sections
- first/last harmonic emphasis
- major/minor scale fit

It ranks likely keys instead of claiming certainty because relative major/minor, modes, borrowed harmony, and modulation can remain genuinely ambiguous.

## Storage

Songs and learned chord shapes are saved in `localStorage` in the current browser/device.
