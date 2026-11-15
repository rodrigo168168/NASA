/**
 * Historial de carreras: cada partida terminada queda guardada en este
 * dispositivo, para que cada comandante vea cómo le fue en cada misión.
 */
import { GameState } from '../domain/types';

const STORAGE_KEY = 'MARS1_CAREER_HISTORY_V1';
const MAX_RECORDS = 50;

export interface CareerRecord {
  /** Momento en que terminó, en milisegundos */
  finishedAt: number;
  commander: string;
  flag: string;
  specialty: string;
  /** "Marte" o "Luna" */
  place: string;
  /** Nombre de la misión histórica, si se jugó una */
  mission: string | null;
  /** Código de misión del aula, si se usó */
  code: string | null;
  won: boolean;
  solesReached: number;
  solesTotal: number;
  /** Puntaje general de la base al terminar (0 a 100) */
  ovr: number;
  crewAlive: number;
  crewTotal: number;
  /** Por qué terminó la carrera, si se perdió */
  cause: string | null;
}

export interface CareerProfile {
  played: number;
  won: number;
  bestOvr: number;
  /** Mayor cantidad de soles sobrevividos en una partida */
  bestSoles: number;
}

/** Arma el registro de una partida terminada. Devuelve null si todavía no terminó. */
export function recordFromGame(
  state: GameState,
  ovr: number,
  missionName: string | null,
  finishedAt: number
): CareerRecord | null {
  if (state.status !== 'victory' && state.status !== 'defeat') return null;
  const won = state.status === 'victory';
  return {
    finishedAt,
    commander: state.commanderProfile?.name?.trim() || 'Comandante',
    flag: state.commanderProfile?.countryFlag ?? '',
    specialty: state.commanderProfile?.specialtyName ?? '',
    place: state.planet.id === 'moon' ? 'Luna' : 'Marte',
    mission: missionName,
    code: state.missionCode ?? null,
    won,
    solesReached: Math.min(state.cycle, state.maxCycles),
    solesTotal: state.maxCycles,
    ovr: Math.max(0, Math.min(100, Math.round(ovr))),
    crewAlive: state.crew.filter((member) => member.health > 0).length,
    crewTotal: state.crew.length,
    cause: won ? null : state.defeatCause?.title ?? null,
  };
}

/** La más nueva primero, con un tope para no llenar el dispositivo. */
export function addRecord(records: CareerRecord[], record: CareerRecord): CareerRecord[] {
  return [record, ...records].slice(0, MAX_RECORDS);
}

const sameCommander = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function recordsOf(records: CareerRecord[], commander: string): CareerRecord[] {
  return records.filter((record) => sameCommander(record.commander, commander));
}

export function profileOf(records: CareerRecord[], commander: string): CareerProfile {
  const own = recordsOf(records, commander);
  return {
    played: own.length,
    won: own.filter((record) => record.won).length,
    bestOvr: own.reduce((best, record) => Math.max(best, record.ovr), 0),
    bestSoles: own.reduce((best, record) => Math.max(best, record.solesReached), 0),
  };
}

function isRecord(value: unknown): value is CareerRecord {
  const record = value as CareerRecord;
  return (
    !!record &&
    typeof record.finishedAt === 'number' &&
    typeof record.commander === 'string' &&
    typeof record.won === 'boolean' &&
    typeof record.solesReached === 'number' &&
    typeof record.ovr === 'number'
  );
}

export function loadCareerHistory(): CareerRecord[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch (error) {
    console.warn('No se pudo leer el historial de carreras.', error);
    return [];
  }
}

export function saveCareerRecord(record: CareerRecord): CareerRecord[] {
  const records = addRecord(loadCareerHistory(), record);
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('No se pudo guardar la carrera en el historial.', error);
  }
  return records;
}

export function clearCareerHistory(): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('No se pudo borrar el historial de carreras.', error);
  }
}
