import { CrewMember } from '../domain/types';

/**
 * Horas de trabajo útil por persona y por sol. En la Estación Espacial cada astronauta
 * tiene unas 6,5 horas por día para tareas: el resto se va en dormir, comer, hacer
 * ejercicio (2 h obligatorias contra la pérdida de hueso y músculo) y la higiene.
 */
export const HORAS_POR_PERSONA = 6.5;

/** Lo que rinde cada estado de salud: alguien estresado o herido trabaja menos, y alguien grave no trabaja. */
const RINDE: Record<CrewMember['status'], number> = {
  healthy: 1,
  stressed: 0.75,
  injured: 0.5,
  critical: 0,
};

/** Horas de tripulación disponibles en un sol, según cuántos están vivos y cómo están. */
export function horasDeTripulacion(crew: CrewMember[]): number {
  const total = crew.reduce((acc, m) => (m.health > 0 ? acc + HORAS_POR_PERSONA * RINDE[m.status] : acc), 0);
  return Math.round(total * 2) / 2;
}

/** Repuestos y materiales (kg) con los que arranca una misión normal, antes de escalar por duración. */
export const REPUESTOS_INICIALES_KG = 300;

/** Kilos de repuestos que trae cada nave de carga. */
export const REPUESTOS_POR_NAVE_KG = 160;

/** Kilos extra que suma la especialidad de Logística. */
export const REPUESTOS_LOGISTICA_KG = 80;
