import { describe, expect, it } from 'vitest';
import {
  MARS_SUNLIGHT_FRACTION,
  SAVED_FLARES,
  SAVED_SUN_DAYS,
  flareBriefing,
  flareStrength,
  parseFlaresResponse,
  parsePowerResponse,
  summarizeSun,
} from './nasaApi';

describe('NASA POWER', () => {
  it('descarta los días sin medición (-999)', () => {
    const days = parsePowerResponse({
      properties: {
        parameter: {
          ALLSKY_SFC_SW_DWN: { '20261110': 7.8665, '20261111': -999, '20261109': 7.5348 },
          TOA_SW_DWN: { '20261110': 11.1667, '20261111': -999, '20261109': 11.1526 },
        },
      },
    });
    expect(days.map((d) => d.date)).toEqual(['20261109', '20261110']);
    expect(days[1].surface).toBe(7.8665);
  });

  it('una respuesta rota no rompe el juego', () => {
    expect(parsePowerResponse(null)).toEqual([]);
    expect(parsePowerResponse({ properties: {} })).toEqual([]);
    expect(summarizeSun([])).toBeNull();
  });

  it('resume la copia guardada y calcula lo que llega a Marte', () => {
    const summary = summarizeSun(SAVED_SUN_DAYS)!;
    expect(summary.days).toBe(16);
    expect(summary.bestDay.date).toBe('20261110');
    expect(summary.worstDay.date).toBe('20261028');
    expect(summary.avgSurface).toBeGreaterThan(5);
    expect(summary.avgSurface).toBeLessThan(6);
    expect(MARS_SUNLIGHT_FRACTION).toBeCloseTo(0.43, 2);
    expect(summary.marsTop).toBeCloseTo(summary.avgTop * 0.4306, 2);
  });
});

describe('NASA DONKI', () => {
  it('ordena las clases: cada letra vale 10 veces la anterior', () => {
    expect(flareStrength('X1.0')).toBeCloseTo(flareStrength('M1.0') * 10);
    expect(flareStrength('X8.7')).toBeGreaterThan(flareStrength('X5.8'));
    expect(flareStrength('M9.9')).toBeLessThan(flareStrength('X1.0'));
    expect(flareStrength('cualquier cosa')).toBe(0);
  });

  it('lee la respuesta y pone primero la más fuerte', () => {
    const flares = parseFlaresResponse([
      { classType: 'M2.1', peakTime: '2026-11-02T10:00Z', activeRegionNum: 14001 },
      { classType: 'X1.4', peakTime: '2026-11-05T03:12Z', activeRegionNum: null },
      { classType: '', peakTime: '2026-11-06T00:00Z' },
      { classType: 'C5.0', beginTime: '2026-11-07T08:00Z' },
    ]);
    expect(flares.map((f) => f.classType)).toEqual(['X1.4', 'M2.1', 'C5.0']);
    expect(flares[0]).toEqual({ date: '2026-11-05', classType: 'X1.4', region: null });
  });

  it('una respuesta que no es una lista se ignora', () => {
    expect(parseFlaresResponse({ error: { code: 'OVER_RATE_LIMIT' } })).toEqual([]);
  });

  it('la copia guardada está ordenada de mayor a menor', () => {
    const strengths = SAVED_FLARES.map((f) => flareStrength(f.classType));
    expect(strengths).toEqual([...strengths].sort((a, b) => b - a));
  });
});

describe('El Sol real dentro de la partida', () => {
  it('compara la fulguración real del mes con la del evento', () => {
    const briefing = flareBriefing(
      [
        { date: '2026-11-07', classType: 'M1.9', region: 14566 },
        { date: '2026-11-05', classType: 'M3.5', region: 14566 },
      ],
      'live',
    )!;
    expect(briefing.fact).toBe(
      'La fulguración más fuerte de los últimos 30 días fue una M3.5, el 5 nov 2026, región 14566 del Sol.',
    );
    expect(briefing.comparison).toContain('unas 34 veces más fuerte');
  });

  it('con la copia guardada habla de 2024 y no dice que es de este mes', () => {
    const briefing = flareBriefing(SAVED_FLARES, 'saved')!;
    expect(briefing.fact).toContain('de 2024');
    expect(briefing.fact).toContain('X9.0, el 3 oct 2024');
    expect(briefing.comparison).toContain('casi tan fuerte');
  });

  it('sin fulguraciones no muestra nada', () => {
    expect(flareBriefing([], 'live')).toBeNull();
  });
});
