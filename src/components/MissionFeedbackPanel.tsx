import React from 'react';
import { GameState } from '../domain/types';
import { buildMissionFeedback } from '../services/missionFeedback';

/** Retroalimentación al terminar la carrera: lo fuerte, lo flojo, cómo mejorar y qué estudiar. */
export const MissionFeedbackPanel: React.FC<{ state: GameState }> = ({ state }) => {
  const feedback = buildMissionFeedback(state);
  if (!feedback) return null;
  return (
    <div className="p-3 bg-[#080d1a] rounded-2xl border border-emerald-500/30 text-left text-xs font-sans text-slate-300 space-y-2.5">
      <div>
        <strong className="block font-mono text-[10px] uppercase text-emerald-400">📋 Tu retroalimentación</strong>
        <p>{feedback.summary}</p>
      </div>

      {feedback.strong.length > 0 && (
        <div>
          <strong className="block font-mono text-[10px] uppercase text-emerald-300">✅ Lo que manejaste bien</strong>
          <p>{feedback.strong.map((area) => area.label).join(' · ')}</p>
        </div>
      )}

      {feedback.weak.length > 0 && (
        <div className="space-y-1.5">
          <strong className="block font-mono text-[10px] uppercase text-red-300">⚠️ Dónde te equivocaste</strong>
          {feedback.weak.map((area) => (
            <p key={area.id}>
              <span className="font-bold text-slate-100">{area.label}:</span> cayó al {area.lowestPercent}% de lo que
              tenías al empezar (sol {area.lowestSol}). {area.improve}
            </p>
          ))}
        </div>
      )}

      <div>
        <strong className="block font-mono text-[10px] uppercase text-cyan-400">📚 Qué tienes que estudiar más</strong>
        <ul className="list-disc pl-4 space-y-0.5">
          {feedback.study.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
