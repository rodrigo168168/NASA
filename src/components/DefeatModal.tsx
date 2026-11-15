import React, { useEffect } from 'react';
import { DefeatCause, GameState } from '../domain/types';
import { Skull, AlertTriangle, RotateCcw, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DefeatModalProps {
  defeatCause: DefeatCause;
  state: GameState;
  onRestart: () => void;
  onOpenSTEM: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({
  defeatCause,
  state,
  onRestart,
  onOpenSTEM,
}) => {
  useEffect(() => {
    soundService.playAlert();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/95 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-space-900 border border-red-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950/80 via-space-900 to-red-950/80 border-b border-red-500/40 text-center relative">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-lg shadow-red-500/20 mb-2">
            <Skull className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-red-400 uppercase tracking-wider">
            {defeatCause.title}
          </h2>
          <p className="text-xs font-mono text-red-300 mt-1">
            Fallo crítico alcanzado en el Sol {state.cycle} de {state.maxCycles} en {state.planet.name.split('—')[0].trim()}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Critical Reason */}
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-red-200 font-sans leading-relaxed">
            <strong className="block font-heading uppercase text-red-300 mb-1">Diagnóstico Oficial:</strong>
            {defeatCause.reason}
          </div>

          {/* Sequence of Events */}
          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <h3 className="text-xs font-heading font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Secuencia de Acontecimientos Críticos
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              {defeatCause.sequenceOfEvents.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scientific Explanation */}
          <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-1.5">
            <h3 className="text-xs font-heading font-bold text-violet-300 uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
              Principio Científico Detrás del Colapso
            </h3>
            <p className="text-xs text-violet-200 leading-relaxed font-sans">
              {defeatCause.stemExplanation}
            </p>
          </div>

          {/* Recommendations for Next Attempt */}
          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <h3 className="text-xs font-heading font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Recomendaciones del Centro de Control para el Próximo Intento
            </h3>
            <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
              {defeatCause.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-space-950/80 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onOpenSTEM();
            }}
            className="px-4 py-2 rounded-lg bg-violet-950 text-violet-300 border border-violet-500/40 hover:bg-violet-900 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Consultar Centro STEM</span>
          </button>

          <button
            onClick={() => {
              soundService.playConfirm();
              onRestart();
            }}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINTENTAR MISIÓN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

