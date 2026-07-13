# Language Transfer Companion

An **unofficial, community-made** companion website for the
[Language Transfer](https://www.languagetransfer.org) audio courses. For each course it offers:

1. **A per-track topic list** — a short summary of what every track teaches, grouped into
   thematic parts, so you can find, preview, or review a lesson.
2. **Downloadable practice flashcards** — vocabulary exported to plain CSV, ready to import
   into Anki, Quizlet, or any spaced-repetition app.

It starts with **Spanish** and is built to extend to French, Italian, German, Turkish, and the
other Language Transfer courses.

> This is an independent fan project. It is **not affiliated with or endorsed by** Language
> Transfer. The audio courses are free (and donation-supported) — please go listen at
> [languagetransfer.org](https://www.languagetransfer.org).

## Tech stack

- [Astro](https://astro.build) — static site generator. No client-side framework; every page is
  prerendered to plain HTML at build time.
- Plain CSS with custom properties (light + dark themes). No CSS framework.

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # static build into dist/
npm run preview  # preview the production build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages…).
On Vercel, the Astro preset is auto-detected — no config needed.

## How the content is organised

```
content/
  <language>/
    course.json     # language metadata + part→flashcard mapping
    summaries.md    # per-track topic summaries (source of truth)
public/
  flashcards/
    <language>/     # the downloadable CSV decks
  downloads/
    <language>/     # e.g. the summaries as a downloadable .md
src/
  lib/
    languages.ts    # registry of available + planned languages
    content.ts      # parses summaries.md + course.json into typed data
    inline.ts       # tiny **bold**/*italic* renderer for summaries
    types.ts
  layouts/Base.astro
  components/PartSection.astro
  pages/
    index.astro      # home / language picker
    [language].astro # one page per available language
```

### `summaries.md` format

The parser expects part headings and track headings in this shape:

```markdown
# Part 1 · Cognates & first sentences (Tracks 1–9)

## Track 1 — Introduction & how to use the course
Summary paragraph. Inline **bold** and *italic* are supported.

## Track 2 — Convertible words (-al) & Spanish pronunciation
Another summary…
```

### `course.json` format

```jsonc
{
  "slug": "spanish",
  "name": "Spanish",
  "flag": "🇪🇸",
  "status": "available",
  "courseName": "Complete Spanish",
  "trackCount": 90,
  "tagline": "…",
  "summariesDownload": "/downloads/spanish/language-transfer-spanish-summaries.md",
  "notes": "…",
  "parts": [
    { "id": 1, "flashcardFile": "lt-01-09-....csv", "cardCount": 163 }
    // one entry per part; flashcardFile/cardCount may be null if no deck yet
  ]
}
```

Each flashcard CSV is a headerless `English,Spanish` file (English prompt, target-language answer).

## Adding a new language

1. Create `content/<language>/summaries.md` and `content/<language>/course.json`
   (copy Spanish's and edit).
2. Drop the flashcard CSVs into `public/flashcards/<language>/` and reference their file names
   and card counts in `course.json`.
3. Add the slug to `AVAILABLE_SLUGS` in `src/lib/languages.ts`, and remove the language from
   `PLANNED_LANGUAGES` there.

That's it — a new page at `/<language>` is generated automatically.

## Credits

- The **Language Transfer** method and courses are the work of Mihalis Eleftheriou and the
  Language Transfer community. Support them at [languagetransfer.org](https://www.languagetransfer.org).
- Topic summaries and flashcards in this repo were compiled by learners from the freely-available
  course transcripts.
