import React from 'react';
import { History, Skull, Trophy } from 'lucide-react';
import { profileOf, recordsOf, type CareerRecord } from '../services/careerHistory';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function whenText(finishedAt: number): string {
  const d = new Date(finishedAt);
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${d.getHours()}:${minutes}`;
}

interface Props {
  records: CareerRecord[];
  /** Nombre del comandante escrito en la pantalla inicial */
  commander: string;
  onClear: () => void;
}

/** Perfil del comandante y lista de sus carreras, en la pantalla inicial. */
export const CareerHistoryPanel: React.FC<Props> = ({ records, commander, onClear }) => {
  if (records.length === 0) return null;
  const own = recordsOf(records, commander);
  const profile = profileOf(records, commander);
  const showingOwn = own.length > 0;
  const list = (showingOwn ? own : records).slice(0, 8);
  const name = commander.trim() || 'Comandante';

  return (
    <div className="p-4 rounded-2xl bg-[#0d1428] border border-amber-400/30 space-y-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" /> {showingOwn ? `Historial de ${name}` : 'Carreras jugadas en este dispositivo'}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] font-mono text-slate-500 underline hover:text-slate-300"
        >
          Borrar historial
        </button>
      </div>

      {showingOwn ? (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Carreras', value: profile.played },
            { label: 'Completadas', value: profile.won },
            { label: 'Mejor puntaje', value: profile.bestOvr },
            { label: 'Más soles', value: profile.bestSoles },
          ].map((stat) => (
            <div key={stat.label} className="py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-lg font-heading font-black text-white leading-none">{stat.value}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">
          {name} todavía no tiene carreras. Estas son las últimas que se jugaron acá:
        </p>
      )}

      <ul className="space-y-1.5">
        {list.map((record) => (
          <li
            key={`${record.finishedAt}-${record.commander}`}
            className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800"
          >
            <span
              className={`mt-0.5 shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center font-heading font-black text-sm leading-none ${
                record.won ? 'bg-amber-400/20 text-amber-300' : 'bg-red-500/15 text-red-300'
              }`}
              title="Puntaje general de la base al terminar"
            >
              {record.ovr}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-100 font-bold flex items-center gap-1 flex-wrap">
                {record.won ? (
                  <Trophy className="w-3 h-3 text-amber-300" />
                ) : (
                  <Skull className="w-3 h-3 text-red-400" />
                )}
                {record.won ? 'Misión completada' : `Cayó en el sol ${record.solesReached} de ${record.solesTotal}`}
                <span className="font-normal text-slate-400">
                  · {record.place}
                  {record.mission ? ` · ${record.mission}` : ''}
                </span>
              </p>
              <p className="text-[10px] font-mono text-slate-400 leading-snug">
                {!showingOwn && `${record.flag} ${record.commander} · `}
                {whenText(record.finishedAt)} · tripulación {record.crewAlive}/{record.crewTotal}
                {record.code ? ` · código ${record.code}` : ''}
                {record.cause ? ` · ${record.cause}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
