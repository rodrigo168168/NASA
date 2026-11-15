import { describe, it, expect } from 'vitest';
import {
  MISIONES_HISTORICAS,
  OPPORTUNITY_2018_WH,
  avanzarSolConDatosReales,
  eventoDelSol,
  normalizarSoles,
  programaDeEventos,
} from './misiones';
import { advanceSimulationCycle } from './simulationEngine';
import { crearGenerador, normalizarCodigo, semillaDeTexto } from './rng';
import { createInitialGameState } from '../App';
import { PLANET_SCENARIOS } from '../domain/constants';
import { GameState } from '../domain/types';

const ids = (codigo: string, planeta: 'mars' | 'moon' = 'mars') =>
  programaDeEventos(codigo, planeta, 15).map((e) => e.id);

describe('Código de misión', () => {
  it('el mismo código da los mismos eventos en el mismo orden', () => {
    expect(ids('SANTA-CRUZ-15')).toEqual(ids('SANTA-CRUZ-15'));
    expect(ids('SANTA-CRUZ-15')).toHaveLength(15);
  });

  it('códigos distintos dan partidas distintas', () => {
    expect(ids('SANTA-CRUZ-15')).not.toEqual(ids('COCHABAMBA-7'));
  });

  it('el código se lee igual con minúsculas, tildes o espacios', () => {
    expect(normalizarCodigo('  santa cruz 15 ')).toBe('SANTA-CRUZ-15');
    expect(normalizarCodigo('Misión ñandú')).toBe('MISION-NANDU');
  });

  it('el generador repite la serie con la misma semilla', () => {
    const a = crearGenerador(semillaDeTexto('X'));
    const b = crearGenerador(semillaDeTexto('X'));
    const serieA = [a(), a(), a()];
    expect(serieA).toEqual([b(), b(), b()]);
    serieA.forEach((n) => expect(n >= 0 && n < 1).toBe(true));
  });

  it('eventoDelSol con código no depende de los eventos recientes ni del azar', () => {
    const partida = { cycle: 7, planetId: 'mars' as const, maxCycles: 15, missionCode: 'AULA-3' };
    const uno = eventoDelSol(partida, []);
    const dos = eventoDelSol(partida, ['dust_storm_mars', uno.id]);
    expect(uno.id).toBe(dos.id);
    expect(uno.id).toBe(ids('AULA-3')[6]);
  });

  it('respeta el destino: en la Luna no salen eventos solo de Marte', () => {
    expect(ids('SANTA-CRUZ-15', 'moon')).not.toContain('dust_storm_mars');
  });
});

describe('Duración de la misión', () => {
  it('sin elegir dura 15 soles, y lo pedido se ajusta entre el mínimo y el máximo', () => {
    expect(normalizarSoles()).toBe(15);
    expect(normalizarSoles(20)).toBe(20);
    expect(normalizarSoles(1)).toBe(5);
    expect(normalizarSoles(500)).toBe(60);
    expect(normalizarSoles(7.6)).toBe(8);
    expect(normalizarSoles(NaN)).toBe(15);
  });

  it('una misión de 5 soles se gana al terminar el sol 5, y una de 30 sigue', () => {
    for (const [soles, esperado] of [[5, 'victory'], [30, 'playing']] as const) {
      let estado: GameState = {
        ...createInitialGameState(PLANET_SCENARIOS.mars, undefined, { soles }),
        activeEvent: null,
      };
      expect(estado.maxCycles).toBe(soles);
      for (let i = 0; i < 5 && estado.status === 'playing'; i++) {
        estado = { ...advanceSimulationCycle(estado).nextState, activeEvent: null };
      }
      expect(estado.status).toBe(esperado);
    }
  });

  it('con el mismo código, la misión larga empieza igual que la corta', () => {
    const corta = programaDeEventos('AULA-3', 'mars', 5).map((e) => e.id);
    const larga = programaDeEventos('AULA-3', 'mars', 30).map((e) => e.id);
    expect(larga).toHaveLength(30);
    expect(larga.slice(0, 5)).toEqual(corta);
  });
});

describe('Misiones históricas', () => {
  it('cada misión pone sus eventos reales en los soles fijados', () => {
    for (const m of MISIONES_HISTORICAS) {
      for (const [sol, id] of Object.entries(m.eventosPorSol)) {
        const ev = eventoDelSol(
          { cycle: Number(sol), planetId: m.planetId, maxCycles: 15, historicalMissionId: m.id },
          [],
        );
        expect(ev.id).toBe(id);
        expect(ev.choices.length).toBeGreaterThanOrEqual(2);
        expect(ev.stemExplanation).toContain('HECHO REAL');
      }
    }
  });

  it('la partida de una misión histórica guarda la misión y el código', () => {
    const estado = createInitialGameState(PLANET_SCENARIOS.moon, undefined, {
      historicalMissionId: 'apolo_13',
      missionCode: 'santa cruz 15',
    });
    expect(estado.historicalMissionId).toBe('apolo_13');
    expect(estado.missionCode).toBe('SANTA-CRUZ-15');
    expect(estado.currentEventId).toBe(estado.activeEvent?.id);
  });
});

describe('El dato real cambia la partida', () => {
  const base = (eventId?: string): GameState => ({
    ...createInitialGameState(PLANET_SCENARIOS.mars),
    activeEvent: null,
    currentEventId: eventId,
  });

  it('sin evento con dato real, el resultado es el del motor de siempre', () => {
    const estado = base('subsurface_ice_discovery');
    expect(avanzarSolConDatosReales(estado).nextState.subResources).toEqual(
      advanceSimulationCycle(estado).nextState.subResources,
    );
  });

  it('la tormenta de polvo deja menos batería, en la proporción real de Opportunity', () => {
    const normal = avanzarSolConDatosReales(base()).nextState;
    const dia1 = avanzarSolConDatosReales(base('hist_opp_dia1')).nextState;
    const dia3 = avanzarSolConDatosReales(base('hist_opp_dia3')).nextState;
    expect(dia1.subResources.batteryStorageCurrent).toBeLessThan(normal.subResources.batteryStorageCurrent);
    expect(dia3.subResources.batteryStorageCurrent).toBeLessThan(dia1.subResources.batteryStorageCurrent);
    // Al pasar la tormenta, los paneles vuelven a rendir como antes.
    expect(dia3.subResources.solarEfficiency).toBe(base().subResources.solarEfficiency);
    expect(OPPORTUNITY_2018_WH.dia3 / OPPORTUNITY_2018_WH.antes).toBeLessThan(0.04);
  });

  it('la tormenta solar suma dosis, y suma más con el blindaje roto', () => {
    const sano = base('solar_flare_lunar');
    const roto: GameState = { ...sano, subResources: { ...sano.subResources, shieldIntegrity: 20 } };
    const extra = (s: GameState) =>
      avanzarSolConDatosReales(s).nextState.subResources.radiationExposureAccumulated -
      advanceSimulationCycle(s).nextState.subResources.radiationExposureAccumulated;
    expect(extra(sano)).toBeGreaterThan(0);
    expect(extra(roto)).toBeGreaterThan(extra(sano));
    expect(extra(roto)).toBeLessThanOrEqual(8.1);
  });
});

describe('Las misiones históricas son difíciles pero se pueden ganar', () => {
  // Juega la misión entera eligiendo siempre la misma opción de cada evento, con una táctica fija.
  function jugar(misionId: string, planeta: 'mars' | 'moon', opcion: number, policy: GameState['policy']) {
    let estado: GameState = {
      ...createInitialGameState(PLANET_SCENARIOS[planeta], undefined, { historicalMissionId: misionId }),
      policy,
    };
    for (let i = 0; i < 20 && estado.status === 'playing'; i++) {
      const ev = estado.activeEvent;
      if (ev) {
        const c = ev.choices[Math.min(opcion, ev.choices.length - 1)].consequences;
        const s = estado.subResources;
        const tope = (v: number, max: number) => Math.max(0, Math.min(max, v));
        estado = {
          ...estado,
          activeEvent: null,
          crew: estado.crew.map((m) => ({
            ...m,
            health: tope(m.health + (c.crewHealthDelta || 0), 100),
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
      estado = avanzarSolConDatosReales(estado).nextState;
      if (estado.status === 'playing') {
        const sig = eventoDelSol(
          { cycle: estado.cycle, planetId: estado.planet.id, maxCycles: estado.maxCycles, historicalMissionId: misionId },
          [],
        );
        estado = { ...estado, activeEvent: sig, currentEventId: sig.id };
      }
    }
    return estado;
  }

  it('cada misión tiene al menos una estrategia que sobrevive a sus soles históricos', () => {
    for (const m of MISIONES_HISTORICAS) {
      const resultados: string[] = [];
      const ultimoSol = Math.max(...Object.keys(m.eventosPorSol).map(Number));
      let alguienGana = false;
      for (const policy of ['SURVIVAL', 'PRODUCTION', 'FULL_SHIELD'] as const) {
        for (const op of [0, 1, 2, 3]) {
          const fin = jugar(m.id, m.planetId, op, policy);
          if (fin.status === 'victory' || fin.cycle >= ultimoSol + 3) alguienGana = true;
          resultados.push(
            `${m.id} ${policy} opción ${op}: ${fin.status} sol ${fin.cycle}` +
              (fin.defeatCause ? ` (${fin.defeatCause.title})` : ''),
          );
        }
      }
      console.log(resultados.join('\n'));
      expect(alguienGana).toBe(true);
    }
  });
});
