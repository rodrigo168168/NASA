/**
 * Datos en vivo de las APIs públicas de la NASA, con copia guardada.
 *
 * Regla: el juego nunca depende de internet. Cada pedido tiene un límite de
 * tiempo y, si falla, se muestra la copia guardada (datos reales bajados el
 * 15/11/2026), avisando que es una copia.
 */

export type NasaDataOrigin = 'live' | 'saved';

// ---------------------------------------------------------------------------
// NASA POWER: energía del Sol que llega a un punto de la Tierra
// https://power.larc.nasa.gov/docs/services/api/
// ---------------------------------------------------------------------------

export interface SunDay {
  /** AAAAMMDD */
  date: string;
  /** Energía solar que llega al suelo, en kWh por m² por día */
  surface: number;
  /** Energía solar que llega al borde de la atmósfera, en kWh por m² por día */
  top: number;
}

export interface SunSummary {
  days: number;
  from: string;
  to: string;
  avgSurface: number;
  avgTop: number;
  /** Lo que llegaría a Marte a la misma latitud, antes de su atmósfera */
  marsTop: number;
  bestDay: SunDay;
  worstDay: SunDay;
}

/** Marte está a 1,524 veces la distancia Tierra-Sol: recibe 1 / 1,524² de la luz. */
export const MARS_SUNLIGHT_FRACTION = 1 / (1.524 * 1.524);

export const POWER_PLACE = { name: 'Santa Cruz de la Sierra, Bolivia', latitude: -17.78, longitude: -63.18 };

/** Copia guardada: respuesta real de NASA POWER para Santa Cruz, bajada el 15/11/2026. */
export const SAVED_SUN_DAYS: SunDay[] = [
  { date: '20261025', surface: 1.3596, top: 10.8792 },
  { date: '20261026', surface: 5.3971, top: 10.9013 },
  { date: '20261027', surface: 3.7265, top: 10.9229 },
  { date: '20261028', surface: 1.0102, top: 10.9438 },
  { date: '20261029', surface: 3.9907, top: 10.9639 },
  { date: '20261030', surface: 4.2106, top: 10.9836 },
  { date: '20261031', surface: 6.337, top: 11.0028 },
  { date: '20261101', surface: 6.9749, top: 11.0215 },
  { date: '20261102', surface: 6.8911, top: 11.0398 },
  { date: '20261103', surface: 7.375, top: 11.0573 },
  { date: '20261104', surface: 7.1614, top: 11.0743 },
  { date: '20261106', surface: 6.691, top: 11.107 },
  { date: '20261107', surface: 5.9328, top: 11.1226 },
  { date: '20261108', surface: 4.3961, top: 11.1379 },
  { date: '20261109', surface: 7.5348, top: 11.1526 },
  { date: '20261110', surface: 7.8665, top: 11.1667 },
];

/** NASA POWER marca con -999 los días que todavía no tienen medición. */
export function parsePowerResponse(json: unknown): SunDay[] {
  const parameter = (json as { properties?: { parameter?: Record<string, Record<string, number>> } })?.properties
    ?.parameter;
  const surface = parameter?.ALLSKY_SFC_SW_DWN;
  const top = parameter?.TOA_SW_DWN;
  if (!surface || !top) return [];
  return Object.keys(surface)
    .sort()
    .filter((date) => isValidReading(surface[date]) && isValidReading(top[date]))
    .map((date) => ({ date, surface: surface[date], top: top[date] }));
}

function isValidReading(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function summarizeSun(days: SunDay[]): SunSummary | null {
  if (days.length === 0) return null;
  const avg = (pick: (d: SunDay) => number) => days.reduce((sum, d) => sum + pick(d), 0) / days.length;
  const avgTop = avg((d) => d.top);
  return {
    days: days.length,
    from: days[0].date,
    to: days[days.length - 1].date,
    avgSurface: avg((d) => d.surface),
    avgTop,
    marsTop: avgTop * MARS_SUNLIGHT_FRACTION,
    bestDay: days.reduce((a, b) => (b.surface > a.surface ? b : a)),
    worstDay: days.reduce((a, b) => (b.surface < a.surface ? b : a)),
  };
}

// ---------------------------------------------------------------------------
// NASA DONKI: catálogo de fulguraciones solares
// https://api.nasa.gov  (DONKI / FLR)
// ---------------------------------------------------------------------------

export interface SolarFlare {
  /** AAAA-MM-DD (hora universal) */
  date: string;
  /** Clase de la fulguración, por ejemplo "X8.7" */
  classType: string;
  /** Región activa del Sol donde nació, si se conoce */
  region: number | null;
}

/**
 * Copia guardada: las cinco fulguraciones más fuertes de 2024 vistas desde la Tierra.
 * La X12 que golpeó Marte el 20/05/2024 salió del lado del Sol que la Tierra no veía.
 */
export const SAVED_FLARES: SolarFlare[] = [
  { date: '2024-10-03', classType: 'X9.0', region: 13842 },
  { date: '2024-05-14', classType: 'X8.7', region: 13664 },
  { date: '2024-10-01', classType: 'X7.1', region: 13842 },
  { date: '2024-02-22', classType: 'X6.3', region: 13590 },
  { date: '2024-05-11', classType: 'X5.8', region: 13664 },
];

const FLARE_LETTERS = ['A', 'B', 'C', 'M', 'X'];

/** Cada letra es 10 veces más fuerte que la anterior: X1 = 10 × M1 = 100 × C1. */
export function flareStrength(classType: string): number {
  const match = /^([ABCMX])(\d+(?:\.\d+)?)$/i.exec(classType.trim());
  if (!match) return 0;
  const letterIndex = FLARE_LETTERS.indexOf(match[1].toUpperCase());
  const number = parseFloat(match[2]);
  return Math.pow(10, letterIndex) * number;
}

export function parseFlaresResponse(json: unknown): SolarFlare[] {
  if (!Array.isArray(json)) return [];
  const flares: SolarFlare[] = [];
  for (const item of json) {
    const classType = typeof item?.classType === 'string' ? item.classType : '';
    const time = typeof item?.peakTime === 'string' ? item.peakTime : item?.beginTime;
    if (!classType || typeof time !== 'string' || flareStrength(classType) === 0) continue;
    flares.push({
      date: time.slice(0, 10),
      classType,
      region: typeof item.activeRegionNum === 'number' ? item.activeRegionNum : null,
    });
  }
  return flares.sort((a, b) => flareStrength(b.classType) - flareStrength(a.classType));
}

// ---------------------------------------------------------------------------
// Pedidos en vivo
// ---------------------------------------------------------------------------

const TIMEOUT_MS = 8000;

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`La NASA respondió ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const compactDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
const dashedDate = (d: Date) => d.toISOString().slice(0, 10);

export async function loadSunDays(): Promise<{ origin: NasaDataOrigin; days: SunDay[] }> {
  try {
    const url =
      'https://power.larc.nasa.gov/api/temporal/daily/point' +
      '?parameters=ALLSKY_SFC_SW_DWN,TOA_SW_DWN&community=RE&format=JSON' +
      `&latitude=${POWER_PLACE.latitude}&longitude=${POWER_PLACE.longitude}` +
      `&start=${compactDate(daysAgo(21))}&end=${compactDate(daysAgo(1))}`;
    const days = parsePowerResponse(await fetchJson(url));
    if (days.length >= 3) return { origin: 'live', days };
    console.warn('NASA POWER devolvió muy pocos días con medición; se usa la copia guardada.');
  } catch (error) {
    console.warn('No se pudo leer NASA POWER; se usa la copia guardada.', error);
  }
  return { origin: 'saved', days: SAVED_SUN_DAYS };
}

export async function loadFlares(): Promise<{ origin: NasaDataOrigin; flares: SolarFlare[] }> {
  try {
    const url =
      'https://api.nasa.gov/DONKI/FLR' +
      `?startDate=${dashedDate(daysAgo(30))}&endDate=${dashedDate(daysAgo(0))}&api_key=DEMO_KEY`;
    const flares = parseFlaresResponse(await fetchJson(url));
    if (flares.length > 0) return { origin: 'live', flares };
    console.warn('NASA DONKI no devolvió fulguraciones; se usa la copia guardada.');
  } catch (error) {
    console.warn('No se pudo leer NASA DONKI; se usa la copia guardada.', error);
  }
  return { origin: 'saved', flares: SAVED_FLARES };
}
