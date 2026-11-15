import { describe, expect, it } from 'vitest';
import { parseQuestions, questionsFromHash, questionsLink, scheduleQuestions } from './instructorQuestions';

describe('preguntas del instructor', () => {
  it('toma una pregunta por línea y saltea las vacías', () => {
    expect(parseQuestions(' ¿Por qué baja la batería? \n\n¿Qué es un sol?\n')).toEqual([
      '¿Por qué baja la batería?',
      '¿Qué es un sol?',
    ]);
  });

  it('las reparte a lo largo de la misión, dentro de sus soles', () => {
    const plan = scheduleQuestions('a\nb\nc', 15);
    expect(plan.map((q) => q.sol)).toEqual([4, 8, 11]);
    const corta = scheduleQuestions('a\nb\nc\nd\ne\nf\ng', 5);
    expect(corta.every((q) => q.sol >= 1 && q.sol <= 5)).toBe(true);
    expect(scheduleQuestions('', 15)).toEqual([]);
  });

  it('el link lleva las preguntas con acentos y vuelve a leerlas igual', () => {
    const texto = '¿Cuánta energía llega a Marte?\n¿Por qué 38% & no más?';
    const link = questionsLink(texto, 'https://ejemplo.test/NASA/#viejo');
    expect(link.startsWith('https://ejemplo.test/NASA/#preguntas=')).toBe(true);
    expect(questionsFromHash(link.slice(link.indexOf('#')))).toBe(texto);
    expect(questionsFromHash('#otra=1')).toBe('');
    expect(questionsFromHash('#preguntas=%E0%A4%A')).toBe('');
    expect(questionsLink('  ', 'https://ejemplo.test/NASA/')).toBe('https://ejemplo.test/NASA/');
  });
});
