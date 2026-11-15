import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { flareBriefing, loadFlaresOnce, type FlareBriefing, type NasaDataOrigin } from '../services/nasaApi';

/** Dentro del evento de partículas solares: lo que el Sol real hizo este mes, según la NASA. */
export const RealFlareNote: React.FC = () => {
  const [note, setNote] = useState<{ origin: NasaDataOrigin; briefing: FlareBriefing } | null>(null);

  useEffect(() => {
    let active = true;
    loadFlaresOnce().then((result) => {
      const briefing = flareBriefing(result.flares, result.origin);
      if (active && briefing) setNote({ origin: result.origin, briefing });
    });
    return () => {
      active = false;
    };
  }, []);

  if (!note) return null;
  return (
    <div className="mt-2.5 p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1">
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
        <Radio className="w-3 h-3" />
        El Sol real, según la NASA · {note.origin === 'live' ? 'EN VIVO' : 'COPIA GUARDADA'}
      </p>
      <p className="text-xs text-slate-200 leading-relaxed">
        {note.briefing.fact} <strong className="text-rose-200">{note.briefing.comparison}</strong>
      </p>
      <p className="text-[10px] font-mono text-slate-400">Fuente: NASA DONKI, catálogo de clima espacial.</p>
    </div>
  );
};
