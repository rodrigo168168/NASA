/**
 * Preguntas del instructor: las escribe él, viajan en el link que comparte
 * con el grupo y aparecen repartidas a lo largo de la misión. Las respuestas
 * se muestran al final, junto a la retroalimentación.
 */

const STORAGE_KEY = 'MARS1_INSTRUCTOR_QUESTIONS_V1';
const HASH_KEY = 'preguntas';
export const MAX_QUESTIONS = 10;

export interface InstructorQuestion {
  /** Sol en que aparece */
  sol: number;
  text: string;
}

/** Una pregunta por línea; las vacías no cuentan. */
export function parseQuestions(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_QUESTIONS);
}

/** Reparte las preguntas parejo entre el sol 1 y el último, sin repetir sol mientras alcance. */
export function scheduleQuestions(text: string, totalSoles: number): InstructorQuestion[] {
  const questions = parseQuestions(text);
  const soles = Math.max(1, Math.floor(totalSoles));
  return questions.map((question, index) => ({
    sol: Math.min(soles, Math.max(1, Math.round(((index + 1) * soles) / (questions.length + 1)))),
    text: question,
  }));
}

export function questionsLink(text: string, baseUrl: string): string {
  const clean = parseQuestions(text).join('\n');
  const base = baseUrl.split('#')[0];
  return clean ? `${base}#${HASH_KEY}=${encodeURIComponent(clean)}` : base;
}

export function questionsFromHash(hash: string): string {
  const match = new RegExp(`[#&]${HASH_KEY}=([^&]*)`).exec(hash);
  if (!match) return '';
  try {
    return parseQuestions(decodeURIComponent(match[1])).join('\n');
  } catch (error) {
    console.warn('No se pudieron leer las preguntas del link.', error);
    return '';
  }
}

/** Las del link mandan; si no hay, las que quedaron escritas en este dispositivo. */
export function loadQuestionsText(): string {
  try {
    if (typeof window === 'undefined') return '';
    const fromLink = questionsFromHash(window.location.hash);
    if (fromLink) return fromLink;
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch (error) {
    console.warn('No se pudieron leer las preguntas del instructor.', error);
    return '';
  }
}

export function saveQuestionsText(text: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, text);
  } catch (error) {
    console.warn('No se pudieron guardar las preguntas del instructor.', error);
  }
}
