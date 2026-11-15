/**
 * Retroalimentación al final de la carrera: qué manejó bien el comandante,
 * dónde se equivocó, cómo mejorar y qué tiene que estudiar más.
 * Sale de la telemetría sol por sol, no de la suerte del final.
 */
import { CycleTelemetryRecord, GameState } from '../domain/types';

export type FeedbackLevel = 'strong' | 'ok' | 'weak';

export interface FeedbackArea {
  id: string;
  label: string;
  level: FeedbackLevel;
  /** Punto más bajo de la carrera, como porcentaje del valor con que empezó */
  lowestPercent: number;
  /** Sol en que tocó ese punto más bajo */
  lowestSol: number;
  improve: string;
  study: string;
}

export interface MissionFeedback {
  strong: FeedbackArea[];
  weak: FeedbackArea[];
  /** Temas para estudiar, del más urgente al menos urgente */
  study: string[];
  summary: string;
}

const AREAS: { id: string; label: string; pick: (r: CycleTelemetryRecord) => number; improve: string; study: string }[] = [
  {
    id: 'energy',
    label: 'Energía',
    pick: (r) => r.batteryStored,
    improve: 'Usa la táctica Ahorro cuando la batería baja y no gastes energía en mejoras antes de una tormenta de polvo.',
    study: 'Paneles solares y baterías: cuánta luz llega a Marte y a la Luna, y qué pasa con el polvo y la noche.',
  },
  {
    id: 'oxygen',
    label: 'Oxígeno',
    pick: (r) => r.oxygen,
    improve: 'Activa Cosecha antes de que el oxígeno llegue a la mitad: producirlo lleva varios soles.',
    study: 'Cómo se fabrica oxígeno fuera de la Tierra: electrólisis del agua, el experimento MOXIE y la fotosíntesis.',
  },
  {
    id: 'water',
    label: 'Agua',
    pick: (r) => r.water,
    improve: 'Cuida el reciclaje de agua y no la gastes en opciones que la consumen cuando está baja.',
    study: 'Reciclaje de agua en la Estación Espacial Internacional y hielo en Marte y en los polos de la Luna.',
  },
  {
    id: 'food',
    label: 'Comida',
    pick: (r) => r.food,
    improve: 'Siembra temprano con Cosecha: el cultivo tarda, y sin comida la tripulación pierde salud cada sol.',
    study: 'Hidroponía y cuántas calorías necesita una persona por día: el cálculo de víveres de una misión.',
  },
  {
    id: 'shield',
    label: 'Escudo contra la radiación',
    pick: (r) => r.shieldIntegrity,
    improve: 'Pon Blindaje apenas se anuncia una tormenta solar y repara el escudo antes de que baje de la mitad.',
    study: 'Radiación espacial: fulguraciones solares, rayos cósmicos y por qué la Tierra tiene campo magnético y Marte no.',
  },
  {
    id: 'crew',
    label: 'Salud de la tripulación',
    pick: (r) => r.crewAverageHealth,
    improve: 'No dejes dos recursos vitales en rojo a la vez: la salud cae mucho más rápido cuando se juntan.',
    study: 'Qué le hace al cuerpo la radiación, la falta de comida y la falta de oxígeno.',
  },
];

export function buildMissionFeedback(state: GameState): MissionFeedback | null {
  const history = state.history;
  if (history.length < 2) return null;
  const areas: FeedbackArea[] = AREAS.map((area) => {
    const start = area.pick(history[0]);
    let lowest = history[0];
    for (const record of history) if (area.pick(record) < area.pick(lowest)) lowest = record;
    const lowestPercent = start > 0 ? Math.max(0, Math.round((area.pick(lowest) / start) * 100)) : 0;
    const level: FeedbackLevel = lowestPercent >= 60 ? 'strong' : lowestPercent >= 30 ? 'ok' : 'weak';
    return {
      id: area.id,
      label: area.label,
      level,
      lowestPercent,
      lowestSol: lowest.cycle,
      improve: area.improve,
      study: area.study,
    };
  });
  const byWorst = [...areas].sort((a, b) => a.lowestPercent - b.lowestPercent);
  const weak = byWorst.filter((area) => area.level === 'weak');
  const strong = areas.filter((area) => area.level === 'strong');
  // Siempre hay algo para estudiar: si nada quedó en rojo, va lo más flojo.
  const toStudy = weak.length > 0 ? weak : byWorst.slice(0, 1);
  const summary =
    weak.length === 0
      ? 'Mantuviste todos los sistemas lejos del rojo durante toda la carrera.'
      : weak.length === 1
      ? `Un solo sistema llegó al rojo: ${weak[0].label.toLowerCase()}.`
      : `${weak.length} sistemas llegaron al rojo. Empieza por el primero de la lista.`;
  return { strong, weak, study: toStudy.map((area) => area.study), summary };
}
