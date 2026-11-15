import { describe, expect, it } from 'vitest';
import { PLANET_SCENARIOS } from '../domain/constants';
import { createInitialGameState } from '../App';
import { addRecord, profileOf, recordFromGame, recordsOf, type CareerRecord } from './careerHistory';

const base = () => createInitialGameState(PLANET_SCENARIOS.mars);

const record = (over: Partial<CareerRecord>): CareerRecord => ({
  finishedAt: 1,
  commander: 'Ana',
  flag: '🇧🇴',
  specialty: 'Ingeniera',
  place: 'Marte',
  mission: null,
  code: null,
  won: false,
  solesReached: 5,
  solesTotal: 15,
  ovr: 40,
  crewAlive: 4,
  crewTotal: 4,
  cause: null,
  ...over,
});

describe('historial de carreras', () => {
  it('no guarda una partida que todavía se está jugando', () => {
    expect(recordFromGame({ ...base(), status: 'playing' }, 50, null, 1)).toBeNull();
  });

  it('guarda una derrota con el sol alcanzado, la misión, el código y la causa', () => {
    const state = {
      ...base(),
      status: 'defeat' as const,
      cycle: 8,
      missionCode: 'SANTA-CRUZ-15',
      commanderProfile: {
        name: ' Ana ',
        countryFlag: '🇧🇴',
        countryName: 'Bolivia',
        specialtyId: 'energy' as const,
        specialtyName: 'Especialista Solar',
      },
      defeatCause: {
        title: 'INANICIÓN',
        reason: '',
        criticalMetric: '',
        sequenceOfEvents: [],
        stemExplanation: '',
        recommendations: [],
      },
    };
    const saved = recordFromGame(state, 51.4, 'Opportunity', 123);
    expect(saved).toMatchObject({
      commander: 'Ana',
      place: 'Marte',
      mission: 'Opportunity',
      code: 'SANTA-CRUZ-15',
      won: false,
      solesReached: 8,
      solesTotal: state.maxCycles,
      ovr: 51,
      cause: 'INANICIÓN',
      finishedAt: 123,
    });
  });

  it('una victoria no lleva causa y no pasa de los soles de la misión', () => {
    const state = { ...base(), status: 'victory' as const };
    const saved = recordFromGame({ ...state, cycle: state.maxCycles + 1 }, 88, null, 1);
    expect(saved?.won).toBe(true);
    expect(saved?.cause).toBeNull();
    expect(saved?.solesReached).toBe(state.maxCycles);
  });

  it('la carrera más nueva queda primera y el historial tiene tope', () => {
    let list: CareerRecord[] = [];
    for (let i = 1; i <= 60; i++) list = addRecord(list, record({ finishedAt: i }));
    expect(list).toHaveLength(50);
    expect(list[0].finishedAt).toBe(60);
  });

  it('el perfil junta solo las carreras de ese comandante, sin importar mayúsculas', () => {
    const list = [
      record({ commander: 'Ana', won: true, ovr: 80, solesReached: 15 }),
      record({ commander: 'ana ', ovr: 30, solesReached: 4 }),
      record({ commander: 'Luis', won: true, ovr: 99, solesReached: 15 }),
    ];
    expect(recordsOf(list, 'ANA')).toHaveLength(2);
    expect(profileOf(list, 'Ana')).toEqual({ played: 2, won: 1, bestOvr: 80, bestSoles: 15 });
    expect(profileOf(list, 'Nadie')).toEqual({ played: 0, won: 0, bestOvr: 0, bestSoles: 0 });
  });
});
