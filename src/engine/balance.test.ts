import { describe, it, expect } from 'vitest';
import {
  SOLES_ENTRE_NAVES,
  avanzarSolConDatosReales,
  eventoDelSol,
  factorDeReservas,
  reabastecer,
  tocaNave,
} from './misiones';
import { advanceSimulationCycle } from './simulationEngine';
import { createInitialGameState } from '../App';
import { PLANET_SCENARIOS } from '../domain/constants';
import { GameState, PolicyMode } from '../domain/types';

const tope = (v: number, max: number) => Math.max(0, Math.min(max, v));

/** Táctica de un comandante atento: mira los medidores y cambia de modo, sin usar acciones. */
function tactica(e: GameState): PolicyMode {
  const s = e.subResources;
  if (s.batteryStorageCurrent < 60) return 'SURVIVAL';
  if (s.shieldIntegrity < 62) return 'FULL_SHIELD';
  if (s.foodCurrent < 30 || s.oxygenCurrent < 25) return 'PRODUCTION';
  return 'SURVIVAL';
}

/** Juega una partida entera con código (eventos fijos) eligiendo siempre la misma opción. */
function jugar(planeta: 'mars' | 'moon', soles: number, codigo: string, opcion: number, conNave: boolean) {
  let estado = createInitialGameState(PLANET_SCENARIOS[planeta], undefined, { soles, missionCode: codigo });
  for (let i = 0; i < 70 && estado.status === 'playing'; i++) {
    const ev = estado.activeEvent;
    if (ev) {
      const pagables = ev.choices.filter(
        (c) => estado.mainResources.credits + (c.consequences.creditsDelta || 0) >= 0,
      );
      const lista = pagables.length ? pagables : ev.choices;
      const c = lista[Math.min(opcion, lista.length - 1)].consequences;
      const s = estado.subResources;
      estado = {
        ...estado,
        activeEvent: null,
        crew: estado.crew.map((m) => ({
          ...m,
          health: m.health > 0 ? tope(m.health + (c.crewHealthDelta || 0), 100) : 0,
          morale: tope(m.morale + (c.crewMoraleDelta || 0), 100),
        })),
        subResources: {
          ...s,
          batteryStorageCurrent: tope(s.batteryStorageCurrent + (c.batteryDelta || 0), s.batteryStorageMax),
          oxygenCurrent: tope(s.oxygenCurrent + (c.oxygenDelta || 0), s.oxygenMax),
          waterCurrent: tope(s.waterCurrent + (c.waterDelta || 0), s.waterMax),
          foodCurrent: tope(s.foodCurrent + (c.foodDelta || 0), s.foodMax),
          shieldIntegrity: tope(s.shieldIntegrity + (c.shieldDelta || 0), 100),
        },
        mainResources: {
          ...estado.mainResources,
          credits: Math.max(0, estado.mainResources.credits + (c.creditsDelta || 0)),
        },
      };
    }
    estado = { ...estado, policy: tactica(estado) };
    estado = (conNave ? avanzarSolConDatosReales(estado) : advanceSimulationCycle(estado)).nextState;
    if (estado.status === 'playing') {
      const sig = eventoDelSol(
        { cycle: estado.cycle, planetId: estado.planet.id, maxCycles: estado.maxCycles, missionCode: codigo },
        [],
      );
      estado = { ...estado, activeEvent: sig, currentEventId: sig.id };
    }
  }
  return estado;
}

/** Porcentaje de partidas ganadas sobre varios códigos y opciones. */
function victorias(planeta: 'mars' | 'moon', soles: number, conNave: boolean): number {
  let ganadas = 0;
  let total = 0;
  for (let n = 1; n <= 25; n++) {
    for (const op of [0, 1, 2]) {
      total++;
      if (jugar(planeta, soles, `AULA-${n}`, op, conNave).status === 'victory') ganadas++;
    }
  }
  return Math.round((ganadas / total) * 100);
}

describe('La misión se abastece según su duración', () => {
  it('una misión corta sale con menos carga y desde 15 soles con la carga completa', () => {
    expect(factorDeReservas(5)).toBeLessThan(factorDeReservas(10));
    expect(factorDeReservas(10)).toBeLessThan(1);
    expect(factorDeReservas(15)).toBe(1);
    expect(factorDeReservas(60)).toBe(1);
    const corta = createInitialGameState(PLANET_SCENARIOS.mars, undefined, { soles: 5 });
    const normal = createInitialGameState(PLANET_SCENARIOS.mars, undefined, { soles: 15 });
    expect(corta.subResources.waterCurrent).toBeLessThan(normal.subResources.waterCurrent);
    expect(corta.subResources.foodCurrent).toBeLessThan(normal.subResources.foodCurrent);
    expect(normal.subResources.waterCurrent).toBe(PLANET_SCENARIOS.mars.initialResources.water);
  });

  it('la nave de carga llega al empezar los soles 16, 31 y 46, y nunca en una misión de 15', () => {
    const base = createInitialGameState(PLANET_SCENARIOS.mars, undefined, { soles: 60 });
    expect(SOLES_ENTRE_NAVES).toBe(15);
    expect([1, 15, 16, 17, 31, 46].map((cycle) => tocaNave({ ...base, cycle }))).toEqual([
      false, false, true, false, true, true,
    ]);
    expect(tocaNave({ ...base, cycle: 16, status: 'victory' })).toBe(false);

    // En el sol 15 de una misión de 15 se gana: no llega ninguna nave.
    const fin15: GameState = {
      ...createInitialGameState(PLANET_SCENARIOS.mars, undefined, { soles: 15 }),
      cycle: 15,
      activeEvent: null,
    };
    const r15 = avanzarSolConDatosReales(fin15);
    expect(r15.nextState.status).toBe('victory');
    expect(r15.warnings.some((w) => w.includes('NAVE DE CARGA'))).toBe(false);

    // En el sol 15 de una misión de 30, llega y repone.
    const fin30: GameState = { ...fin15, maxCycles: 30 };
    const sinNave = advanceSimulationCycle(fin30).nextState;
    const r30 = avanzarSolConDatosReales(fin30);
    expect(r30.warnings[0]).toContain('NAVE DE CARGA');
    expect(r30.nextState.subResources.waterCurrent).toBeGreaterThan(sinNave.subResources.waterCurrent);
    expect(r30.nextState.subResources.foodCurrent).toBeGreaterThan(sinNave.subResources.foodCurrent);
    expect(r30.nextState.mainResources.credits).toBeGreaterThan(sinNave.mainResources.credits);
    expect(r30.nextState.facilities.solarArray.health).toBeGreaterThan(sinNave.facilities.solarArray.health);
  });

  it('la nave no pasa los topes de los depósitos ni el 100 % de los módulos', () => {
    const lleno = createInitialGameState(PLANET_SCENARIOS.moon, undefined, { soles: 30 });
    const tras = reabastecer({
      ...lleno,
      subResources: { ...lleno.subResources, waterCurrent: 299, foodCurrent: 249, oxygenCurrent: 99, shieldIntegrity: 99 },
    });
    expect(tras.subResources.waterCurrent).toBe(300);
    expect(tras.subResources.foodCurrent).toBe(250);
    expect(tras.subResources.oxygenCurrent).toBe(100);
    expect(tras.subResources.shieldIntegrity).toBe(100);
    expect(tras.facilities.habitat.health).toBe(100);
  });

  it('informe: partidas ganadas por duración, con y sin la nave de carga', () => {
    const filas: string[] = [];
    const tasa: Record<string, number> = {};
    for (const planeta of ['mars', 'moon'] as const) {
      for (const soles of [5, 10, 15, 20, 30, 45, 60]) {
        const con = victorias(planeta, soles, true);
        const sin = victorias(planeta, soles, false);
        tasa[`${planeta}-${soles}`] = con;
        filas.push(`${planeta} ${soles} soles: gana ${con} % (sin nave ${sin} %)`);
      }
    }
    console.log(filas.join('\n'));
    expect(filas.length).toBe(14);
    // Una misión larga con nave de carga se puede ganar; sin ella, no.
    expect(tasa['mars-30']).toBeGreaterThan(10);
    expect(tasa['moon-30']).toBeGreaterThan(10);
    expect(tasa['mars-5']).toBeGreaterThan(40);
    expect(tasa['moon-5']).toBeGreaterThan(40);
  });
});

describe('Todo evento ofrece tres opciones', () => {
  it('ningún evento, del mazo ni histórico, tiene menos o más de tres, y no se repiten ids', async () => {
    const { GAME_EVENTS_DECK } = await import('./events');
    const { EVENTOS_HISTORICOS } = await import('./misiones');
    const todos = [...GAME_EVENTS_DECK, ...EVENTOS_HISTORICOS];
    expect(todos.filter((e) => e.choices.length !== 3).map((e) => e.id)).toEqual([]);
    const ids = todos.flatMap((e) => e.choices.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
