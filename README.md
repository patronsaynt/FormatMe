# FormatMe

An intelligent, cross-platform resume builder & formatter with a soft beige interface,
dark/light mode, live PDF preview, and one-click export to PDF, Word, HTML, and plain text.

Built with **Tauri 2 + React + TypeScript**. The resume is rendered with
`@react-pdf/renderer`, so the on-screen preview *is* the exported PDF — they can never diverge.

## Features

- **Structured editor** — name & title header, a toggleable contact subheader, unlimited
  drag-to-reorder work & education entries, optional certifications and an optional footer
  (hobbies / interests).
- **Multiple templates** — Classic, Modern, and Two-Column.
- **Professional fonts** — Times New Roman plus EB Garamond, Merriweather, Lora, Helvetica,
  Open Sans, Lato, Montserrat, Source Sans 3, Roboto, and Courier (all bundled, fully offline).
- **Live preview** — a real PDF, debounced for smooth typing.
- **Exports** — PDF (vector / text-selectable, ATS-friendly), DOCX, HTML, and TXT.
- **Soft beige theme** with dark/light mode. Dark mode themes the editor only — the resume
  "paper" always stays light.
- **Autosave** to local storage, plus save/open `.json` project files.

## Develop

```bash
npm install
npm run tauri dev      # launch the desktop app (Mac / Linux / Windows)
```

## Build installers

```bash
npm run tauri build    # produces a native bundle for the current OS
```

## Project layout

```
src/
  types.ts            # the Resume data model (single source of truth)
  store/              # Zustand stores (resume + autosave, UI theme)
  components/
    editor/           # form sections
    preview/          # live PDF viewer
    toolbar/          # template / font / accent / export controls
    common/           # shared UI primitives + dnd-kit sortable list
  templates/          # react-pdf templates + registry
  export/             # pdf / docx / html / txt / json exporters
  fonts/              # bundled TTFs + react-pdf font registry
  theme/              # beige light/dark CSS variables
src-tauri/            # Rust backend (native file save/open)
```
