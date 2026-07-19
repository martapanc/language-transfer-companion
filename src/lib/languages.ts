/**
 * Registry of languages shown on the site.
 *
 * `available` slugs must have a matching `content/<slug>/course.json` and
 * `content/<slug>/summaries.md`. Add a language by dropping those files in and
 * listing the slug here.
 *
 * `planned` languages are the other Language Transfer courses we'd love to cover
 * next — they render as "coming soon" cards so contributors know what's missing.
 */

export const AVAILABLE_SLUGS = ['spanish', 'french', 'italian'] as const;

export interface PlannedLanguage {
  name: string;
  /** ISO 3166-1 alpha-2 country code (lowercase) for the flag SVG. */
  flag: string;
  /** Roughly how many tracks the official course has, for flavour. */
  note: string;
}

export const PLANNED_LANGUAGES: PlannedLanguage[] = [
  { name: 'German', flag: 'de', note: 'Complete German · 50 tracks' },
  { name: 'Greek', flag: 'gr', note: 'Complete Greek · 120 tracks' },
  { name: 'Turkish', flag: 'tr', note: 'Complete Turkish · 44 tracks' },
  { name: 'Arabic', flag: 'sa', note: 'Complete Arabic · 38 tracks' },
  { name: 'Swahili', flag: 'ke', note: 'Introduction to Swahili · 45 tracks' },
];
