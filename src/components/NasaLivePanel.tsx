import React, { useEffect, useState } from 'react';
import { ExternalLink, Radio, Sun, Zap } from 'lucide-react';
import {
  MARS_SUNLIGHT_FRACTION,
  POWER_PLACE,
  loadFlaresOnce,
  loadSunDays,
  summarizeSun,
  type NasaDataOrigin,
  type SolarFlare,
  type SunDay,
} from '../services/nasaApi';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Acepta AAAAMMDD o AAAA-MM-DD */
function shortDate(value: string): string {
  const digits = value.replace(/-/g, '');
  const month = MONTHS[parseInt(digits.slice(4, 6), 10) - 1] ?? '';
  return `${parseInt(digits.slice(6, 8), 10)} ${month} ${digits.slice(0, 4)}`;
}

const oneDecimal = (n: number) => n.toFixed(1).replace('.', ',');

const OriginBadge: React.FC<{ origin: NasaDataOrigin | null }> = ({ origin }) => {
  if (origin === null) {
    return <span className="text-[10px] font-mono text-slate-400">Consultando a la NASA…</span>;
  }
  return origin === 'live' ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
      <Radio className="w-3 h-3" /> EN VIVO
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/40 border border-slate-600 text-[10px] font-mono font-bold text-slate-300">
      COPIA GUARDADA
    </span>
  );
};

export const NasaLivePanel: React.FC = () => {
  const [sun, setSun] = useState<{ origin: NasaDataOrigin; days: SunDay[] } | null>(null);
  const [flares, setFlares] = useState<{ origin: NasaDataOrigin; flares: SolarFlare[] } | null>(null);

  useEffect(() => {
    let active = true;
    loadSunDays().then((result) => active && setSun(result));
    loadFlaresOnce().then((result) => active && setFlares(result));
    return () => {
      active = false;
    };
  }, []);

  const summary = sun ? summarizeSun(sun.days) : null;
  const maxSurface = sun ? Math.max(...sun.days.map((d) => d.surface), 1) : 1;
  const topFlares = flares ? flares.flares.slice(0, 5) : [];

  return (
    <div>
      <h3 className="text-xs font-heading font-black uppercase tracking-wider text-cyan-300 mb-2">
        Datos que la NASA está midiendo ahora
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* NASA POWER */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-heading font-black text-slate-100 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-300" /> El Sol en {POWER_PLACE.name}
            </p>
            <OriginBadge origin={sun ? sun.origin : null} />
          </div>
          {summary && sun && (
            <>
              <div className="flex items-end gap-0.5 h-14" aria-hidden="true">
                {sun.days.map((day) => (
                  <div
                    key={day.date}
                    title={`${shortDate(day.date)}: ${oneDecimal(day.surface)} kWh/m²`}
                    className="flex-1 rounded-t bg-amber-400/80"
                    style={{ height: `${Math.max(4, (day.surface / maxSurface) * 100)}%` }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                {summary.days} días medidos por satélite: del {shortDate(summary.from)} al {shortDate(summary.to)}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Al suelo llegaron en promedio <strong className="text-amber-300">{oneDecimal(summary.avgSurface)} kWh</strong>{' '}
                por metro cuadrado por día. El mejor día fue el {shortDate(summary.bestDay.date)} (
                {oneDecimal(summary.bestDay.surface)}) y el peor, nublado, el {shortDate(summary.worstDay.date)} (
                {oneDecimal(summary.worstDay.surface)}).
              </p>
              <p className="text-[11px] text-cyan-300 leading-relaxed">
                <strong>En el juego:</strong> Marte está 1,5 veces más lejos del Sol y recibe solo el{' '}
                {Math.round(MARS_SUNLIGHT_FRACTION * 100)}% de esa luz: unos {oneDecimal(summary.marsTop)} kWh contra{' '}
                {oneDecimal(summary.avgTop)} de la Tierra, antes de la atmósfera. Por eso tus paneles rinden poco, y un
                día de tormenta de polvo es como el peor día nublado de la lista, pero durante semanas.
              </p>
            </>
          )}
          <a
            href="https://power.larc.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 underline"
          >
            <ExternalLink className="w-3 h-3" /> NASA POWER — Prediction Of Worldwide Energy Resources
          </a>
        </div>

        {/* NASA DONKI */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-heading font-black text-slate-100 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-rose-300" /> Fulguraciones solares
            </p>
            <OriginBadge origin={flares ? flares.origin : null} />
          </div>
          {flares && (
            <>
              <p className="text-[10px] font-mono text-slate-400">
                {flares.origin === 'live'
                  ? `Últimos 30 días: ${flares.flares.length} fulguraciones registradas. Las más fuertes:`
                  : 'Las cinco más fuertes de 2024 vistas desde la Tierra:'}
              </p>
              <ul className="space-y-1">
                {topFlares.map((flare, index) => (
                  <li key={`${flare.date}-${flare.classType}-${index}`} className="flex items-center gap-2 text-xs">
                    <span
                      className={`w-12 text-center px-1 py-0.5 rounded font-mono font-bold ${
                        flare.classType.toUpperCase().startsWith('X')
                          ? 'bg-rose-500/25 text-rose-200'
                          : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {flare.classType}
                    </span>
                    <span className="text-slate-300">{shortDate(flare.date)}</span>
                    {flare.region !== null && (
                      <span className="text-[10px] font-mono text-slate-500">región {flare.region}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-cyan-300 leading-relaxed">
                <strong>En el juego:</strong> las letras van de menor a mayor (C, M, X) y cada una es 10 veces más
                fuerte que la anterior. Una clase X es la que dispara el evento de partículas solares: si tu escudo
                está por debajo del 50%, la dosis se multiplica.
              </p>
            </>
          )}
          <a
            href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 underline"
          >
            <ExternalLink className="w-3 h-3" /> NASA DONKI — catálogo de clima espacial
          </a>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
        Si no hay internet, el juego muestra la última copia que guardó (15 de noviembre de 2026) y lo avisa.
      </p>
    </div>
  );
};
