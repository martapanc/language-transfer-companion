import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AVAILABLE_SLUGS } from './languages';
import type { Course, CourseMeta, FlashcardFile, Part, Track } from './types';

/** Absolute path to the repo-root `content/` directory. */
const CONTENT_DIR = join(process.cwd(), 'content');

/** Shape of a part entry inside course.json (before tracks are attached). */
interface CoursePartMeta {
  id: number;
  flashcardFile: string | null;
  cardCount: number | null;
}

interface CourseJson extends CourseMeta {
  parts: CoursePartMeta[];
}

// --- markdown parsing --------------------------------------------------------

const PART_HEADING = /^#\s+Part\s+(\d+)\s*·\s*(.+?)\s*\(Tracks\s+(\d+)\D+(\d+)\)\s*$/;
const TRACK_HEADING = /^##\s+Track\s+(\d+)\s*[—–-]\s*(.+?)\s*$/;

interface ParsedPart {
  id: number;
  title: string;
  trackStart: number;
  trackEnd: number;
  tracks: Track[];
}

/**
 * Parse a `summaries.md` file into thematic parts and their tracks. The format
 * expected (matching the Language Transfer summaries) is:
 *
 *   # Part 1 · Cognates & first sentences (Tracks 1–9)
 *   ## Track 1 — Introduction & how to use the course
 *   <summary paragraph(s)>
 */
function parseSummaries(markdown: string): ParsedPart[] {
  const lines = markdown.split(/\r?\n/);
  const parts: ParsedPart[] = [];

  let currentPart: ParsedPart | null = null;
  let currentTrack: Track | null = null;
  let buffer: string[] = [];

  const flushTrack = () => {
    if (currentTrack) {
      currentTrack.summary = buffer.join('\n').trim();
      buffer = [];
      currentTrack = null;
    }
  };

  for (const line of lines) {
    const partMatch = line.match(PART_HEADING);
    if (partMatch) {
      flushTrack();
      currentPart = {
        id: Number(partMatch[1]),
        title: partMatch[2].trim(),
        trackStart: Number(partMatch[3]),
        trackEnd: Number(partMatch[4]),
        tracks: [],
      };
      parts.push(currentPart);
      continue;
    }

    const trackMatch = line.match(TRACK_HEADING);
    if (trackMatch && currentPart) {
      flushTrack();
      currentTrack = {
        number: Number(trackMatch[1]),
        title: trackMatch[2].trim(),
        summary: '',
      };
      currentPart.tracks.push(currentTrack);
      continue;
    }

    // Accumulate summary lines only while we're inside a track.
    if (currentTrack) {
      buffer.push(line);
    }
  }
  flushTrack();

  return parts;
}

// --- public API --------------------------------------------------------------

function readCourseJson(slug: string): CourseJson {
  const raw = readFileSync(join(CONTENT_DIR, slug, 'course.json'), 'utf8');
  return JSON.parse(raw) as CourseJson;
}

/** Load and assemble a full course (metadata + parsed tracks). */
export function getCourse(slug: string): Course {
  const meta = readCourseJson(slug);
  const markdown = readFileSync(join(CONTENT_DIR, slug, 'summaries.md'), 'utf8');
  const parsedParts = parseSummaries(markdown);

  const partMetaById = new Map(meta.parts.map((p) => [p.id, p]));

  const parts: Part[] = parsedParts.map((parsed) => {
    const pm = partMetaById.get(parsed.id);
    let flashcard: FlashcardFile | null = null;
    if (pm?.flashcardFile && pm.cardCount != null) {
      flashcard = {
        fileName: pm.flashcardFile,
        href: `/flashcards/${slug}/${pm.flashcardFile}`,
        cardCount: pm.cardCount,
      };
    }
    return { ...parsed, flashcard };
  });

  const totalCards = parts.reduce((sum, p) => sum + (p.flashcard?.cardCount ?? 0), 0);

  const { parts: _drop, ...courseMeta } = meta;
  return { ...courseMeta, parts, totalCards };
}

/** Slugs of every language currently available on the site. */
export function getAvailableSlugs(): string[] {
  return [...AVAILABLE_SLUGS];
}

/** Load every available course. */
export function getAvailableCourses(): Course[] {
  return getAvailableSlugs().map(getCourse);
}
