import { describe, expect, it } from 'vitest';
import { PLANET_SCENARIOS } from '../domain/constants';
import { createInitialGameState } from '../App';
import { CycleTelemetryRecord } from '../domain/types';
import { buildMissionFeedback } from './missionFeedback';

const rec = (cycle: number, over: Partial<CycleTelemetryRecord>): CycleTelemetryRecord => ({
  cycle,
  energyProducedKw: 0,
  energyConsumedKw: 0,
  batteryStored: 100,
  oxygen: 100,
  water: 100,
  food: 100,
  radiationFlux: 0,
  shieldIntegrity: 100,
  spareKg: 0,
  crewHoursUsed: 0,
  crewAverageHealth: 100,
  activePolicy: createInitialGameState(PLANET_SCENARIOS.mars).policy,
  ...over,
});

const stateWith = (history: CycleTelemetryRecord[]) => ({ ...createInitialGameState(PLANET_SCENARIOS.mars), history });

describe('retroalimentación del final', () => {
  it('no opina sin telemetría', () => {
    expect(buildMissionFeedback(stateWith([rec(1, {})]))).toBeNull();
  });

  it('marca como flojo lo que llegó al rojo, aunque después se haya recuperado', () => {
    const fb = buildMissionFeedback(stateWith([rec(1, {}), rec(2, { food: 10 }), rec(3, { food: 90 })]))!;
    expect(fb.weak.map((a) => a.id)).toEqual(['food']);
    expect(fb.weak[0].lowestSol).toBe(2);
    expect(fb.weak[0].lowestPercent).toBe(10);
    expect(fb.strong.map((a) => a.id)).not.toContain('food');
    expect(fb.study).toHaveLength(1);
    expect(fb.study[0]).toMatch(/Hidroponía/);
  });

  it('ordena lo flojo de peor a mejor y siempre deja algo para estudiar', () => {
    const fb = buildMissionFeedback(stateWith([rec(1, {}), rec(2, { water: 20, shieldIntegrity: 5 })]))!;
    expect(fb.weak.map((a) => a.id)).toEqual(['shield', 'water']);
    const bien = buildMissionFeedback(stateWith([rec(1, {}), rec(2, { oxygen: 80 })]))!;
    expect(bien.weak).toHaveLength(0);
    expect(bien.strong).toHaveLength(6);
    expect(bien.study).toHaveLength(1);
    expect(bien.study[0]).toMatch(/oxígeno/);
  });
});
