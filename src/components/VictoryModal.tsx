import React, { useEffect } from 'react';
import { VictorySummary, GameState } from '../domain/types';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, BookOpen, CheckCircle, Sparkles, Zap, Droplets, Users } from 'lucide-react';
import { soundService } from '../services/soundService';

interface VictoryModalProps {
  summary: VictorySummary;
  state: GameState;
  onRestart: () => void;
  onOpenSTEM: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  summary,
  state,
  onRestart,
  onOpenSTEM,
}) => {
  useEffect(() => {
    soundService.playVictory();
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-space-900 border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-space-900 to-cyan-950 border-b border-emerald-500/30 text-center relative">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-lg shadow-emerald-500/20 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase tracking-wider">
            ¡MISIÓN CUMPLIDA CON ÉXITO!
          </h2>
          <p className="text-xs font-mono text-emerald-300 mt-1">
            Has asegurado la supervivencia de Outpost Alpha durante {state.maxCycles} Soles en {state.planet.name.split('—')[0].trim()}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Score Box */}
          <div className="p-4 rounded-xl bg-space-950 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400">Puntuación Final de Misión</span>
              <div className="text-3xl font-heading font-black text-emerald-400">
                {summary.finalScore.toLocaleString()} PTS
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-300 space-y-0.5">
              <div className="flex items-center gap-1 justify-end text-cyan-300">
                <Users className="w-3.5 h-3.5" />
                <span>Tripulantes Sobrevivientes: {summary.survivingCrewCount} / 4</span>
              </div>
              <div className="flex items-center gap-1 justify-end text-blue-300">
                <Droplets className="w-3.5 h-3.5" />
                <span>Reciclaje de Agua: {summary.waterRecycledPercent}%</span>
              </div>
              <div className="flex items-center gap-1 justify-end text-amber-300">
                <Zap className="w-3.5 h-3.5" />
                <span>Energía Generada: {summary.totalEnergyGenerated} kW</span>
              </div>
            </div>
          </div>

          {/* STEM Key Takeaways */}
          <div className="p-4 rounded-xl bg-space-950/70 border border-slate-800 space-y-2">
            <h3 className="text-xs font-heading font-bold text-violet-300 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Hitos de Aprendizaje STEM Alcanzados
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
              {summary.stemKeyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
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
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-space-950 font-heading font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NUEVA MISIÓN (OTRO PLANETA)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

