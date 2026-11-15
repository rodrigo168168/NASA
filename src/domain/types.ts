// MARS-1: Space Outpost Simulator Domain Types

export type PlanetType = 'mars' | 'moon';

export type PolicyMode = 'SURVIVAL' | 'PRODUCTION' | 'FULL_SHIELD';

export type ModuleStatus = 'operational' | 'damaged' | 'upgraded' | 'critical';

export interface BaseModule {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  health: number; // 0 - 100%
  level: number; // 1, 2, 3
  energyDemand: number; // kW
}

export interface ColonyFacilities {
  habitat: BaseModule;
  solarArray: BaseModule;
  greenhouse: BaseModule;
  lifeSupport: BaseModule;
  researchLab: BaseModule;
  radiationShield: BaseModule;
}

export interface SubResources {
  // Oxygen in kg (standard crew consumes ~0.84kg/person/day)
  oxygenCurrent: number;
  oxygenMax: number;
  oxygenProduction: number;
  oxygenConsumption: number;

  // Water in Liters (crew needs ~2.5L direct + ECLSS recycling)
  waterCurrent: number;
  waterMax: number;
  waterRecyclingEfficiency: number; // e.g. 0.85 = 85% recovered
  waterConsumption: number;

  // Food in Rations/kg (crew needs ~3000 kcal/day)
  foodCurrent: number;
  foodMax: number;
  foodProduction: number;
  foodConsumption: number;

  // Energy sub-metrics (in Kilowatt-hours / kW)
  batteryStorageCurrent: number;
  batteryStorageMax: number;
  solarEfficiency: number; // 0.0 - 1.0 (affected by dust or night)
  generatorBackupActive: boolean;

  // Radiation sub-metrics
  shieldIntegrity: number; // 0 - 100%
  radiationExposureAccumulated: number; // in milliSieverts (mSv)
  currentCycleRadiationFlux: number; // mSv this sol
  stormShelterActive: boolean;
}

export interface MainResources {
  // Energy index (0 - 100%) or battery %
  energyPercent: number;
  powerGenerationKw: number;
  powerConsumptionKw: number;

  // Life support index (0 - 100%, aggregate of O2, H2O, Food)
  lifeSupportPercent: number;

  // Radiation protection index (0 - 100%)
  radiationProtectionPercent: number;

  // Mission budget in kCredits (k$)
  credits: number;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  health: number; // 0 - 100
  morale: number; // 0 - 100
  status: 'healthy' | 'stressed' | 'injured' | 'critical';
}

export interface PlanetScenario {
  id: PlanetType;
  name: string;
  subtitle: string;
  gravity: number; // m/s^2 (Mars: 3.72, Moon: 1.62)
  dayNightCycleDays: number; // Sol length or lunar day
  solarIrradianceBase: number; // W/m^2
  radiationHazardLevel: 'Alta' | 'Extrema';
  dustStormRisk: boolean;
  extremeThermalSwings: boolean;
  description: string;
  initialResources: {
    oxygen: number;
    water: number;
    food: number;
    battery: number;
    credits: number;
  };
  stemFocus: string;
}

export interface GameEventChoice {
  id: string;
  text: string;
  costCredits?: number;
  energyCost?: number;
  description: string;
  consequences: {
    oxygenDelta?: number;
    waterDelta?: number;
    foodDelta?: number;
    batteryDelta?: number;
    creditsDelta?: number;
    shieldDelta?: number;
    crewMoraleDelta?: number;
    crewHealthDelta?: number;
    facilityWearDelta?: { [key in keyof ColonyFacilities]?: number };
    customMessage: string;
  };
  stemLesson: string;
}

export interface GameEvent {
  id: string;
  title: string;
  severity: 'baja' | 'media' | 'alta' | 'critica' | 'positiva';
  type: 'emergency' | 'discovery' | 'malfunction' | 'opportunity';
  description: string;
  applicablePlanets?: PlanetType[];
  triggerMinCycle?: number;
  choices: GameEventChoice[];
  stemExplanation: string;
  iconName: string;
}

export interface MissionAction {
  id: string;
  name: string;
  category: 'maintenance' | 'upgrade' | 'emergency' | 'science';
  costCredits: number;
  energyCostKw: number;
  executionCycles: number;
  expectedBenefit: string;
  risksAndConsequences: string;
  stemExplanation: string;
  disabledReason?: string;
  apply: (state: GameState) => Partial<GameState>;
}

export interface CycleTelemetryRecord {
  cycle: number;
  energyProducedKw: number;
  energyConsumedKw: number;
  batteryStored: number;
  oxygen: number;
  water: number;
  food: number;
  radiationFlux: number;
  shieldIntegrity: number;
  credits: number;
  crewAverageHealth: number;
  activePolicy: PolicyMode;
  eventTriggered?: string;
}

export type GameStatus = 'welcome' | 'playing' | 'victory' | 'defeat';

export interface DefeatCause {
  title: string;
  reason: string;
  criticalMetric: string;
  sequenceOfEvents: string[];
  stemExplanation: string;
  recommendations: string[];
}

export interface VictorySummary {
  finalScore: number;
  survivingCrewCount: number;
  cyclesCompleted: number;
  totalEnergyGenerated: number;
  waterRecycledPercent: number;
  scientificBreakthroughs: number;
  stemKeyTakeaways: string[];
}

export interface GameState {
  status: GameStatus;
  planet: PlanetScenario;
  cycle: number;
  maxCycles: number; // 15
  crew: CrewMember[];
  facilities: ColonyFacilities;
  subResources: SubResources;
  mainResources: MainResources;
  policy: PolicyMode;
  activeEvent: GameEvent | null;
  history: CycleTelemetryRecord[];
  pendingActions: string[];
  decisionsLog: { cycle: number; text: string; category: string }[];
  defeatCause: DefeatCause | null;
  victorySummary: VictorySummary | null;
  stemDiscoveriesUnlocked: string[];
  commanderProfile?: {
    name: string;
    countryFlag: string;
    countryName: string;
    specialtyId: 'energy' | 'biotech' | 'commander';
    specialtyName: string;
  };
  /** Código de misión del aula: el mismo código da los mismos eventos en el mismo orden. */
  missionCode?: string;
  /** Misión histórica real que se está entrenando (Opportunity 2018, Apolo 13). */
  historicalMissionId?: string;
  /** Evento que tocó en el sol actual: de él sale el dato real que cambia la simulación. */
  currentEventId?: string;
  lastSolSummary?: {
    sol: number;
    batteryDelta: number;
    oxygenDelta: number;
    waterDelta: number;
    foodDelta: number;
    shieldDelta: number;
    creditsDelta: number;
    headline: string;
  } | null;
}

