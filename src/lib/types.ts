/** A single track (lesson) within a course. */
export interface Track {
  /** Track number as taught in the course, e.g. 1, 2, 3… */
  number: number;
  /** Short human title, e.g. "Convertible words (-al) & Spanish pronunciation". */
  title: string;
  /** The topic summary. May contain lightweight **bold** / *italic* markdown. */
  summary: string;
}

/** A thematic part grouping several consecutive tracks. */
export interface Part {
  /** 1-based part number. */
  id: number;
  /** Theme title, e.g. "Cognates & first sentences". */
  title: string;
  trackStart: number;
  trackEnd: number;
  tracks: Track[];
  /** Flashcard download for this part, if one exists yet. */
  flashcard: FlashcardFile | null;
}

/** A downloadable flashcard deck (CSV) for a part. */
export interface FlashcardFile {
  /** File name within /public/flashcards/<slug>/. */
  fileName: string;
  /** Public URL path to download. */
  href: string;
  /** Number of cards (rows) in the file. */
  cardCount: number;
}

/** Availability of a language on the site. */
export type CourseStatus = 'available' | 'planned';

/** Language-level metadata (from course.json), before tracks are parsed. */
export interface CourseMeta {
  slug: string;
  name: string;
  endonym?: string;
  /** ISO 3166-1 alpha-2 country code (lowercase) for the flag SVG, e.g. "es". */
  flag: string;
  status: CourseStatus;
  courseName: string;
  trackCount: number;
  tagline: string;
  officialCourseUrl?: string;
  summariesDownload?: string;
  notes?: string;
}

/** A fully-loaded course: metadata + parsed parts/tracks. */
export interface Course extends CourseMeta {
  parts: Part[];
  /** Total flashcards across all parts. */
  totalCards: number;
}
