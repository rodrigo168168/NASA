import { describe, it, expect } from 'vitest';
import { advanceSimulationCycle } from './simulationEngine';
import { GameState } from '../domain/types';
import { INITIAL_FACILITIES, INITIAL_CREW, PLANET_SCENARIOS } from '../domain/constants';
import { MISSION_ACTIONS } from './actions';

function createMockState(overrides: Partial<GameState> = {}): GameState {
  const planet = PLANET_SCENARIOS.mars;
  return {
    status: 'playing',
    planet,
    cycle: 1,
    maxCycles: 15,
    crew: JSON.parse(JSON.stringify(INITIAL_CREW)),
    facilities: JSON.parse(JSON.stringify(INITIAL_FACILITIES)),
    subResources: {
      oxygenCurrent: 80,
      oxygenMax: 100,
      oxygenProduction: 4,
      oxygenConsumption: 3.36,
      waterCurrent: 200,
      waterMax: 300,
      waterRecyclingEfficiency: 0.85,
      waterConsumption: 10,
      foodCurrent: 150,
      foodMax: 200,
      foodProduction: 3,
      foodConsumption: 2.48,
      batteryStorageCurrent: 400,
      batteryStorageMax: 600,
      solarEfficiency: 0.95,
      generatorBackupActive: false,
      shieldIntegrity: 90,
      radiationExposureAccumulated: 0.5,
      currentCycleRadiationFlux: 0.67,
      stormShelterActive: false,
    },
    mainResources: {
      energyPercent: 67,
      powerGenerationKw: 100,
      powerConsumptionKw: 95,
      lifeSupportPercent: 80,
      radiationProtectionPercent: 90,
      crewHours: 26,
      crewHoursMax: 26,
      spareKg: 300,
      scienceHours: 0,
    },
    policy: 'SURVIVAL',
    activeEvent: null,
    history: [],
    pendingActions: [],
    decisionsLog: [],
    defeatCause: null,
    victorySummary: null,
    stemDiscoveriesUnlocked: [],
    ...overrides,
  };
}

describe('SimulationEngine Comprehensive Unit Tests', () => {
  it('should advance cycle by 1 and record telemetry history', () => {
    const initial = createMockState({ cycle: 1 });
    const result = advanceSimulationCycle(initial);

    expect(result.nextState.cycle).toBe(2);
    expect(result.nextState.history.length).toBe(1);
    expect(result.telemetry.cycle).toBe(1);
    expect(result.telemetry.energyProducedKw).toBeGreaterThan(0);
    expect(result.telemetry.batteryStored).toBeGreaterThanOrEqual(0);
  });

  it('should never produce negative resource quantities', () => {
    const nearEmpty = createMockState({
      subResources: {
        ...createMockState().subResources,
        oxygenCurrent: 0.1,
        waterCurrent: 0.1,
        foodCurrent: 0.1,
        batteryStorageCurrent: 1,
      },
    });

    const result = advanceSimulationCycle(nearEmpty);
    expect(result.nextState.subResources.oxygenCurrent).toBeGreaterThanOrEqual(0);
    expect(result.nextState.subResources.waterCurrent).toBeGreaterThanOrEqual(0);
    expect(result.nextState.subResources.foodCurrent).toBeGreaterThanOrEqual(0);
    expect(result.nextState.subResources.batteryStorageCurrent).toBeGreaterThanOrEqual(0);
  });

  it('should trigger defeat when oxygen is depleted to 0', () => {
    const criticalO2 = createMockState({
      subResources: {
        ...createMockState().subResources,
        oxygenCurrent: 0,
      },
      facilities: {
        ...createMockState().facilities,
        greenhouse: { ...createMockState().facilities.greenhouse, health: 0 },
        lifeSupport: { ...createMockState().facilities.lifeSupport, health: 0 },
      },
    });

    const result = advanceSimulationCycle(criticalO2);
    expect(result.nextState.status).toBe('defeat');
    expect(result.nextState.defeatCause).not.toBeNull();
    expect(result.nextState.defeatCause?.title).toContain('OXÍGENO');
  });

  it('should trigger defeat when water is depleted to 0', () => {
    const criticalH2O = createMockState({
      subResources: {
        ...createMockState().subResources,
        waterCurrent: 0,
      },
      facilities: {
        ...createMockState().facilities,
        lifeSupport: { ...createMockState().facilities.lifeSupport, health: 0 },
      },
    });

    const result = advanceSimulationCycle(criticalH2O);
    expect(result.nextState.status).toBe('defeat');
    expect(result.nextState.defeatCause).not.toBeNull();
    expect(result.nextState.defeatCause?.title).toContain('DESHIDRATACIÓN');
  });

  it('should trigger defeat when all crew members perish (0 health)', () => {
    const deadCrew = createMockState({
      crew: createMockState().crew.map((c) => ({ ...c, health: 0 })),
    });

    const result = advanceSimulationCycle(deadCrew);
    expect(result.nextState.status).toBe('defeat');
    expect(result.nextState.defeatCause?.title).toContain('PÉRDIDA TOTAL DE LA TRIPULACIÓN');
  });

  it('should apply SURVIVAL policy reducing energy consumption compared to PRODUCTION', () => {
    const baseState = createMockState();
    const survivalState = { ...baseState, policy: 'SURVIVAL' as const };
    const productionState = { ...baseState, policy: 'PRODUCTION' as const };

    const survivalResult = advanceSimulationCycle(survivalState);
    const productionResult = advanceSimulationCycle(productionState);

    expect(survivalResult.telemetry.energyConsumedKw).toBeLessThan(productionResult.telemetry.energyConsumedKw);
  });

  it('should trigger victory when reaching beyond maxCycles (cycle 15 completed)', () => {
    const finalCycleState = createMockState({ cycle: 15, maxCycles: 15 });
    const result = advanceSimulationCycle(finalCycleState);

    expect(result.nextState.status).toBe('victory');
    expect(result.nextState.victorySummary).not.toBeNull();
    expect(result.nextState.victorySummary?.cyclesCompleted).toBe(15);
    expect(result.nextState.victorySummary?.finalScore).toBeGreaterThan(0);
  });

  it('should correctly apply engineering actions and deduct crew hours and spare parts', () => {
    const state = createMockState({
      mainResources: { ...createMockState().mainResources, crewHours: 26, spareKg: 100 },
      subResources: { ...createMockState().subResources, solarEfficiency: 0.6 },
    });

    const cleanAction = MISSION_ACTIONS.find((a) => a.id === 'clean_solar_panels');
    expect(cleanAction).toBeDefined();

    if (cleanAction) {
      const updates = cleanAction.apply(state);
      expect(updates.mainResources?.crewHours).toBe(26 - cleanAction.costHours);
      expect(updates.mainResources?.spareKg).toBe(100 - cleanAction.costKg);
      expect(updates.subResources?.solarEfficiency).toBe(1.0);
    }
  });

  it('should simulate 15 full consecutive cycles without numerical errors or divergence', () => {
    let currentState = createMockState({
      subResources: {
        ...createMockState().subResources,
        oxygenCurrent: 90,
        waterCurrent: 250,
        foodCurrent: 200,
        batteryStorageCurrent: 500,
      },
    });

    for (let sol = 1; sol <= 15; sol++) {
      const { nextState } = advanceSimulationCycle(currentState);
      expect(nextState.subResources.oxygenCurrent).toBeGreaterThanOrEqual(0);
      expect(nextState.subResources.waterCurrent).toBeGreaterThanOrEqual(0);
      expect(nextState.subResources.foodCurrent).toBeGreaterThanOrEqual(0);
      expect(nextState.subResources.batteryStorageCurrent).toBeGreaterThanOrEqual(0);
      currentState = nextState;
      if (currentState.status !== 'playing') break;
    }

    expect(['playing', 'victory', 'defeat']).toContain(currentState.status);
  });
});
