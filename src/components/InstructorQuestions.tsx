import React, { useState } from 'react';
import { MAX_QUESTIONS, parseQuestions, questionsLink, type InstructorQuestion } from '../services/instructorQuestions';

/** Pantalla inicial: el instructor escribe sus preguntas y copia el link para el grupo. */
export const InstructorQuestionsEditor: React.FC<{ value: string; onChange: (text: string) => void }> = ({
  value,
  onChange,
}) => {
  const [copied, setCopied] = useState(false);
  const count = parseQuestions(value).length;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(questionsLink(value, window.location.href));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.warn('No se pudo copiar el link de las preguntas.', error);
      window.prompt('Copia este link y compártelo con el grupo:', questionsLink(value, window.location.href));
    }
  };
  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor="preguntas-instructor"
        className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5"
      >
        ❓ 6. Preguntas del instructor (opcional)
      </label>
      <textarea
        id="preguntas-instructor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={'Una pregunta por línea. Ejemplo:\n¿Por qué en Marte llega menos luz del Sol que en la Tierra?'}
        className="w-full px-3 py-2.5 rounded-xl bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
      />
      <p className="text-[11px] text-slate-400 leading-snug">
        {count > 0
          ? `${count} ${count === 1 ? 'pregunta' : 'preguntas'}: aparecen repartidas a lo largo de la misión y las respuestas se ven al final.`
          : `El instructor escribe hasta ${MAX_QUESTIONS} preguntas, una por línea, y comparte el link: cada estudiante las responde durante su misión.`}
      </p>
      {count > 0 && (
        <button
          type="button"
          onClick={copy}
          className="px-3 py-1.5 rounded-lg border border-emerald-400/50 text-emerald-300 text-[11px] font-mono font-bold"
        >
          {copied ? '✅ Link copiado' : '🔗 Copiar link con estas preguntas para el grupo'}
        </button>
      )}
    </div>
  );
};

/** Durante la misión: las preguntas que tocan en este sol, con lugar para responder. */
export const InstructorQuestionsNow: React.FC<{
  questions: InstructorQuestion[];
  sol: number;
  answers: Record<string, string>;
  onAnswer: (question: string, answer: string) => void;
}> = ({ questions, sol, answers, onAnswer }) => {
  const now = questions.filter((question) => question.sol === sol);
  if (now.length === 0) return null;
  return (
    <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-400/40 space-y-2 text-left">
      <strong className="block font-mono text-[10px] uppercase tracking-wider text-emerald-300">
        ❓ Pregunta de tu instructor
      </strong>
      {now.map((question) => (
        <div key={question.text} className="space-y-1">
          <p className="text-xs text-slate-100 font-bold">{question.text}</p>
          <textarea
            value={answers[question.text] ?? ''}
            onChange={(e) => onAnswer(question.text, e.target.value)}
            rows={2}
            placeholder="Escribe tu respuesta antes de pasar al siguiente sol"
            className="w-full px-2.5 py-2 rounded-lg bg-[#080d1a] border border-slate-700 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
          />
        </div>
      ))}
    </div>
  );
};

/** Al final: cada pregunta con lo que respondió el estudiante. */
export const InstructorQuestionsReview: React.FC<{
  questions: InstructorQuestion[];
  answers: Record<string, string>;
  /** Último sol que se jugó */
  solReached: number;
}> = ({ questions, answers, solReached }) => {
  if (questions.length === 0) return null;
  return (
    <div className="p-3 bg-[#080d1a] rounded-2xl border border-emerald-500/30 text-left text-xs font-sans text-slate-300 space-y-2">
      <strong className="block font-mono text-[10px] uppercase text-emerald-400">
        ❓ Preguntas de tu instructor: muéstrale tus respuestas
      </strong>
      {questions.map((question) => {
        const answer = (answers[question.text] ?? '').trim();
        return (
          <div key={question.text}>
            <p className="font-bold text-slate-100">
              Sol {question.sol}: {question.text}
            </p>
            <p className={answer ? 'text-slate-300' : 'text-slate-500 italic'}>
              {answer || (question.sol > solReached ? 'No llegaste a este sol.' : 'Sin responder.')}
            </p>
          </div>
        );
      })}
    </div>
  );
};
