import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GameState,
  PlanetScenario,
  PolicyMode,
  MissionAction,
  GameEventChoice,
} from './domain/types';
import {
  INITIAL_FACILITIES,
  INITIAL_CREW,
  PLANET_SCENARIOS,
  NASA_ECLSS_METRICS,
} from './domain/constants';
import {
  MISIONES_HISTORICAS,
  avanzarSolConDatosReales,
  buscarMision,
  normalizarSoles,
  factorDeReservas,
  DURACIONES,
  SOLES_MIN,
  SOLES_MAX,
  eventoDelSol,
} from './engine/misiones';
import { normalizarCodigo } from './engine/rng';
import { RealFlareNote } from './components/RealFlareNote';
import { MISSION_ACTIONS } from './engine/actions';
import { storageService } from './services/storageService';
import {
  clearCareerHistory,
  loadCareerHistory,
  recordFromGame,
  saveCareerRecord,
  type CareerRecord,
} from './services/careerHistory';
import { CareerHistoryPanel } from './components/CareerHistoryPanel';
import { soundService } from './services/soundService';

// Icons
import {
  Zap,
  Wind,
  Droplets,
  Shield,
  Coins,
  Sparkles,
  Rocket,
  RotateCcw,
  BookOpen,
  LineChart,
  HelpCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Layers,
  Activity,
  CheckCircle2,
  Trophy,
  Skull,
  HeartPulse,
  Sprout,
  User,
  Play,
  Dices,
  ArrowRight,
  Wrench,
  Star,
  Info,
} from 'lucide-react';

import confetti from 'canvas-confetti';

// Sub-modals for deep dive
import { ColonyVisualizer } from './components/ColonyVisualizer';
import { HistoryTelemetryModal } from './components/HistoryTelemetryModal';
import { STEMLearningCenter } from './components/STEMLearningCenter';
import { HowToPlayModal } from './components/HowToPlayModal';

export interface CommanderSetup {
  name: string;
  countryFlag: string;
  countryName: string;
  specialtyId: 'energy' | 'biotech' | 'commander';
  specialtyName: string;
}

const COUNTRIES = [
  // Todas las nacionalidades salvo los adversarios extranjeros de EE. UU.
  // (China, Corea del Norte, Cuba, Irán, Rusia y Venezuela). Primero los de siempre.
  { flag: '🇧🇴', name: 'Bolivia' },
  { flag: '🇦🇷', name: 'Argentina' },
  { flag: '🇲🇽', name: 'México' },
  { flag: '🇪🇸', name: 'España' },
  { flag: '🇨🇴', name: 'Colombia' },
  { flag: '🇨🇱', name: 'Chile' },
  { flag: '🇵🇪', name: 'Perú' },
  { flag: '🇺🇾', name: 'Uruguay' },
  { flag: '🇺🇸', name: 'EE. UU.' },
  { flag: '🇦🇫', name: 'Afganistán' },
  { flag: '🇦🇱', name: 'Albania' },
  { flag: '🇩🇪', name: 'Alemania' },
  { flag: '🇦🇩', name: 'Andorra' },
  { flag: '🇦🇴', name: 'Angola' },
  { flag: '🇦🇬', name: 'Antigua y Barbuda' },
  { flag: '🇸🇦', name: 'Arabia Saudí' },
  { flag: '🇩🇿', name: 'Argelia' },
  { flag: '🇦🇲', name: 'Armenia' },
  { flag: '🇦🇺', name: 'Australia' },
  { flag: '🇦🇹', name: 'Austria' },
  { flag: '🇦🇿', name: 'Azerbaiyán' },
  { flag: '🇧🇸', name: 'Bahamas' },
  { flag: '🇧🇩', name: 'Bangladés' },
  { flag: '🇧🇧', name: 'Barbados' },
  { flag: '🇧🇭', name: 'Baréin' },
  { flag: '🇧🇪', name: 'Bélgica' },
  { flag: '🇧🇿', name: 'Belice' },
  { flag: '🇧🇯', name: 'Benín' },
  { flag: '🇧🇾', name: 'Bielorrusia' },
  { flag: '🇧🇦', name: 'Bosnia y Herzegovina' },
  { flag: '🇧🇼', name: 'Botsuana' },
  { flag: '🇧🇷', name: 'Brasil' },
  { flag: '🇧🇳', name: 'Brunéi' },
  { flag: '🇧🇬', name: 'Bulgaria' },
  { flag: '🇧🇫', name: 'Burkina Faso' },
  { flag: '🇧🇮', name: 'Burundi' },
  { flag: '🇧🇹', name: 'Bután' },
  { flag: '🇨🇻', name: 'Cabo Verde' },
  { flag: '🇰🇭', name: 'Camboya' },
  { flag: '🇨🇲', name: 'Camerún' },
  { flag: '🇨🇦', name: 'Canadá' },
  { flag: '🇶🇦', name: 'Catar' },
  { flag: '🇹🇩', name: 'Chad' },
  { flag: '🇨🇿', name: 'Chequia' },
  { flag: '🇨🇾', name: 'Chipre' },
  { flag: '🇻🇦', name: 'Ciudad del Vaticano' },
  { flag: '🇰🇲', name: 'Comoras' },
  { flag: '🇨🇬', name: 'Congo' },
  { flag: '🇰🇷', name: 'Corea del Sur' },
  { flag: '🇨🇷', name: 'Costa Rica' },
  { flag: '🇨🇮', name: 'Côte d’Ivoire' },
  { flag: '🇭🇷', name: 'Croacia' },
  { flag: '🇩🇰', name: 'Dinamarca' },
  { flag: '🇩🇲', name: 'Dominica' },
  { flag: '🇪🇨', name: 'Ecuador' },
  { flag: '🇪🇬', name: 'Egipto' },
  { flag: '🇸🇻', name: 'El Salvador' },
  { flag: '🇦🇪', name: 'Emiratos Árabes Unidos' },
  { flag: '🇪🇷', name: 'Eritrea' },
  { flag: '🇸🇰', name: 'Eslovaquia' },
  { flag: '🇸🇮', name: 'Eslovenia' },
  { flag: '🇪🇪', name: 'Estonia' },
  { flag: '🇸🇿', name: 'Esuatini' },
  { flag: '🇪🇹', name: 'Etiopía' },
  { flag: '🇵🇭', name: 'Filipinas' },
  { flag: '🇫🇮', name: 'Finlandia' },
  { flag: '🇫🇯', name: 'Fiyi' },
  { flag: '🇫🇷', name: 'Francia' },
  { flag: '🇬🇦', name: 'Gabón' },
  { flag: '🇬🇲', name: 'Gambia' },
  { flag: '🇬🇪', name: 'Georgia' },
  { flag: '🇬🇭', name: 'Ghana' },
  { flag: '🇬🇩', name: 'Granada' },
  { flag: '🇬🇷', name: 'Grecia' },
  { flag: '🇬🇹', name: 'Guatemala' },
  { flag: '🇬🇳', name: 'Guinea' },
  { flag: '🇬🇶', name: 'Guinea Ecuatorial' },
  { flag: '🇬🇼', name: 'Guinea-Bisáu' },
  { flag: '🇬🇾', name: 'Guyana' },
  { flag: '🇭🇹', name: 'Haití' },
  { flag: '🇭🇳', name: 'Honduras' },
  { flag: '🇭🇺', name: 'Hungría' },
  { flag: '🇮🇳', name: 'India' },
  { flag: '🇮🇩', name: 'Indonesia' },
  { flag: '🇮🇶', name: 'Irak' },
  { flag: '🇮🇪', name: 'Irlanda' },
  { flag: '🇮🇸', name: 'Islandia' },
  { flag: '🇲🇭', name: 'Islas Marshall' },
  { flag: '🇸🇧', name: 'Islas Salomón' },
  { flag: '🇮🇱', name: 'Israel' },
  { flag: '🇮🇹', name: 'Italia' },
  { flag: '🇯🇲', name: 'Jamaica' },
  { flag: '🇯🇵', name: 'Japón' },
  { flag: '🇯🇴', name: 'Jordania' },
  { flag: '🇰🇿', name: 'Kazajistán' },
  { flag: '🇰🇪', name: 'Kenia' },
  { flag: '🇰🇬', name: 'Kirguistán' },
  { flag: '🇰🇮', name: 'Kiribati' },
  { flag: '🇽🇰', name: 'Kosovo' },
  { flag: '🇰🇼', name: 'Kuwait' },
  { flag: '🇱🇦', name: 'Laos' },
  { flag: '🇱🇸', name: 'Lesoto' },
  { flag: '🇱🇻', name: 'Letonia' },
  { flag: '🇱🇧', name: 'Líbano' },
  { flag: '🇱🇷', name: 'Liberia' },
  { flag: '🇱🇾', name: 'Libia' },
  { flag: '🇱🇮', name: 'Liechtenstein' },
  { flag: '🇱🇹', name: 'Lituania' },
  { flag: '🇱🇺', name: 'Luxemburgo' },
  { flag: '🇲🇰', name: 'Macedonia del Norte' },
  { flag: '🇲🇬', name: 'Madagascar' },
  { flag: '🇲🇾', name: 'Malasia' },
  { flag: '🇲🇼', name: 'Malaui' },
  { flag: '🇲🇻', name: 'Maldivas' },
  { flag: '🇲🇱', name: 'Mali' },
  { flag: '🇲🇹', name: 'Malta' },
  { flag: '🇲🇦', name: 'Marruecos' },
  { flag: '🇲🇺', name: 'Mauricio' },
  { flag: '🇲🇷', name: 'Mauritania' },
  { flag: '🇫🇲', name: 'Micronesia' },
  { flag: '🇲🇩', name: 'Moldavia' },
  { flag: '🇲🇨', name: 'Mónaco' },
  { flag: '🇲🇳', name: 'Mongolia' },
  { flag: '🇲🇪', name: 'Montenegro' },
  { flag: '🇲🇿', name: 'Mozambique' },
  { flag: '🇲🇲', name: 'Myanmar (Birmania)' },
  { flag: '🇳🇦', name: 'Namibia' },
  { flag: '🇳🇷', name: 'Nauru' },
  { flag: '🇳🇵', name: 'Nepal' },
  { flag: '🇳🇮', name: 'Nicaragua' },
  { flag: '🇳🇪', name: 'Níger' },
  { flag: '🇳🇬', name: 'Nigeria' },
  { flag: '🇳🇴', name: 'Noruega' },
  { flag: '🇳🇿', name: 'Nueva Zelanda' },
  { flag: '🇴🇲', name: 'Omán' },
  { flag: '🇳🇱', name: 'Países Bajos' },
  { flag: '🇵🇰', name: 'Pakistán' },
  { flag: '🇵🇼', name: 'Palaos' },
  { flag: '🇵🇸', name: 'Palestina' },
  { flag: '🇵🇦', name: 'Panamá' },
  { flag: '🇵🇬', name: 'Papúa Nueva Guinea' },
  { flag: '🇵🇾', name: 'Paraguay' },
  { flag: '🇵🇱', name: 'Polonia' },
  { flag: '🇵🇹', name: 'Portugal' },
  { flag: '🇵🇷', name: 'Puerto Rico' },
  { flag: '🇬🇧', name: 'Reino Unido' },
  { flag: '🇨🇫', name: 'República Centroafricana' },
  { flag: '🇨🇩', name: 'República Democrática del Congo' },
  { flag: '🇩🇴', name: 'República Dominicana' },
  { flag: '🇷🇼', name: 'Ruanda' },
  { flag: '🇷🇴', name: 'Rumanía' },
  { flag: '🇼🇸', name: 'Samoa' },
  { flag: '🇰🇳', name: 'San Cristóbal y Nieves' },
  { flag: '🇸🇲', name: 'San Marino' },
  { flag: '🇻🇨', name: 'San Vicente y las Granadinas' },
  { flag: '🇱🇨', name: 'Santa Lucía' },
  { flag: '🇸🇹', name: 'Santo Tomé y Príncipe' },
  { flag: '🇸🇳', name: 'Senegal' },
  { flag: '🇷🇸', name: 'Serbia' },
  { flag: '🇸🇨', name: 'Seychelles' },
  { flag: '🇸🇱', name: 'Sierra Leona' },
  { flag: '🇸🇬', name: 'Singapur' },
  { flag: '🇸🇾', name: 'Siria' },
  { flag: '🇸🇴', name: 'Somalia' },
  { flag: '🇱🇰', name: 'Sri Lanka' },
  { flag: '🇿🇦', name: 'Sudáfrica' },
  { flag: '🇸🇩', name: 'Sudán' },
  { flag: '🇸🇸', name: 'Sudán del Sur' },
  { flag: '🇸🇪', name: 'Suecia' },
  { flag: '🇨🇭', name: 'Suiza' },
  { flag: '🇸🇷', name: 'Surinam' },
  { flag: '🇹🇭', name: 'Tailandia' },
  { flag: '🇹🇼', name: 'Taiwán' },
  { flag: '🇹🇿', name: 'Tanzania' },
  { flag: '🇹🇯', name: 'Tayikistán' },
  { flag: '🇹🇱', name: 'Timor-Leste' },
  { flag: '🇹🇬', name: 'Togo' },
  { flag: '🇹🇴', name: 'Tonga' },
  { flag: '🇹🇹', name: 'Trinidad y Tobago' },
  { flag: '🇹🇳', name: 'Túnez' },
  { flag: '🇹🇲', name: 'Turkmenistán' },
  { flag: '🇹🇷', name: 'Turquía' },
  { flag: '🇹🇻', name: 'Tuvalu' },
  { flag: '🇺🇦', name: 'Ucrania' },
  { flag: '🇺🇬', name: 'Uganda' },
  { flag: '🇺🇿', name: 'Uzbekistán' },
  { flag: '🇻🇺', name: 'Vanuatu' },
  { flag: '🇻🇳', name: 'Vietnam' },
  { flag: '🇾🇪', name: 'Yemen' },
  { flag: '🇩🇯', name: 'Yibuti' },
  { flag: '🇿🇲', name: 'Zambia' },
  { flag: '🇿🇼', name: 'Zimbabue' },
];

const RANDOM_NAMES = [
  'Cmdr. Lucía Vega',
  'Dra. Valentina Suárez',
  'Cap. Franco Quiroga',
  'Ing. Sofía Hernández',
  'Cmdr. Marcos Peña',
  'Dra. Elena Vance',
  'Cap. Mateo Rossi',
];

const SPECIALTIES: {
  id: 'energy' | 'biotech' | 'commander';
  name: string;
  badge: string;
  description: string;
  perks: string[];
  color: string;
}[] = [
  {
    id: 'energy',
    name: 'Especialista Solar & Potencia',
    badge: '⚡ +Batería y Paneles Nvl. 2',
    description: 'Experto en redes eléctricas espaciales. Ideal para evitar apagones en tormentas.',
    perks: ['+100 kWh Batería inicial', 'Granja Solar Mejorada (Nvl. 2)', '100% Eficiencia Solar'],
    color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300',
  },
  {
    id: 'biotech',
    name: 'Ingeniero Bio-ECLSS',
    badge: '💧 +Agua, +Oxígeno y Reciclaje',
    description: 'Maestro del soporte vital cerrado y botánica espacial. Nadie pasa sed ni falta de aire.',
    perks: ['+50L Agua y +15kg Oxígeno', '+40kg Comida inicial', '92% Reciclaje de Agua'],
    color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
  },
  {
    id: 'commander',
    name: 'Estratega de Blindaje & Fondos',
    badge: '🛡️ +$600k y Escudo 100%',
    description: 'Veterano con respaldo financiero de la NASA y cúpula antirradiación reforzada.',
    perks: ['+$600k Presupuesto extra', 'Escudo de Radiación al 100%', 'Moral inicial al 100%'],
    color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
  },
];

export function createInitialGameState(
  planet: PlanetScenario,
  commander?: CommanderSetup,
  mision: { missionCode?: string; historicalMissionId?: string; soles?: number } = {}
): GameState {
  const facilities = JSON.parse(JSON.stringify(INITIAL_FACILITIES));
  const crew = JSON.parse(JSON.stringify(INITIAL_CREW));

  // Una misión corta sale con menos carga; desde 15 soles, con la carga completa.
  const maxCycles = normalizarSoles(mision.soles);
  const carga = factorDeReservas(maxCycles);
  let oxygen = Math.round(planet.initialResources.oxygen * carga);
  let water = Math.round(planet.initialResources.water * carga);
  let food = Math.round(planet.initialResources.food * carga);
  let battery = planet.initialResources.battery;
  let credits = Math.round(planet.initialResources.credits * carga);
  let waterRecycling = 0.85;
  let solarEff = 0.95;
  let shield = 92;

  if (commander?.specialtyId === 'energy') {
    battery = Math.min(600, battery + 100);
    solarEff = 1.0;
    facilities.solarArray.level = 2;
    facilities.solarArray.status = 'upgraded';
  } else if (commander?.specialtyId === 'biotech') {
    water = Math.min(300, water + 50);
    oxygen = Math.min(100, oxygen + 15);
    food = Math.min(250, food + 40);
    waterRecycling = 0.92;
  } else if (commander?.specialtyId === 'commander') {
    credits += 600;
    shield = 100;
    crew.forEach((c: { morale: number; health: number }) => {
      c.morale = 100;
      c.health = 100;
    });
  }

  const missionCode = mision.missionCode ? normalizarCodigo(mision.missionCode) : '';
  const firstEvent = eventoDelSol(
    {
      cycle: 1,
      planetId: planet.id,
      maxCycles,
      missionCode,
      historicalMissionId: mision.historicalMissionId,
    },
    []
  );

  return {
    missionCode: missionCode || undefined,
    historicalMissionId: mision.historicalMissionId,
    currentEventId: firstEvent.id,
    status: 'playing',
    planet,
    cycle: 1,
    maxCycles,
    crew,
    facilities,
    subResources: {
      oxygenCurrent: oxygen,
      oxygenMax: 100,
      oxygenProduction: 3.5,
      oxygenConsumption: 3.36,
      waterCurrent: water,
      waterMax: 300,
      waterRecyclingEfficiency: waterRecycling,
      waterConsumption: 10.0,
      foodCurrent: food,
      foodMax: 250,
      foodProduction: 2.2,
      foodConsumption: 2.48,
      batteryStorageCurrent: battery,
      batteryStorageMax: 600,
      solarEfficiency: solarEff,
      generatorBackupActive: false,
      shieldIntegrity: shield,
      radiationExposureAccumulated: 0.45,
      currentCycleRadiationFlux: planet.id === 'mars' ? 0.67 : 1.1,
      stormShelterActive: false,
    },
    mainResources: {
      energyPercent: Math.round((battery / 600) * 100),
      powerGenerationKw: 104.5,
      powerConsumptionKw: 105.0,
      lifeSupportPercent: Math.round(((oxygen / 100 + water / 300 + food / 250) / 3) * 100),
      radiationProtectionPercent: shield,
      credits,
    },
    policy: 'SURVIVAL',
    activeEvent: firstEvent,
    history: [],
    pendingActions: [],
    decisionsLog: [],
    defeatCause: null,
    victorySummary: null,
    stemDiscoveriesUnlocked: [],
    commanderProfile: commander || {
      name: 'Cmdr. Alex Vega',
      countryFlag: '🇦🇷',
      countryName: 'Argentina',
      specialtyId: 'energy',
      specialtyName: 'Especialista Solar & Potencia',
    },
    lastSolSummary: null,
  };
}

export function App() {
  // Onboarding form state (Copero Career Creator)
  const [commanderName, setCommanderName] = useState('Cmdr. Alex Vega');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<'energy' | 'biotech' | 'commander'>('energy');
  const [selectedPlanetId, setSelectedPlanetId] = useState<'mars' | 'moon'>('mars');
  const [missionCodeInput, setMissionCodeInput] = useState('');
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string | null>(null);
  const [solesInput, setSolesInput] = useState(15);
  const [careerHistory, setCareerHistory] = useState<CareerRecord[]>(() => loadCareerHistory());
  const carreraGuardada = useRef(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = storageService.loadGame();
    if (saved && saved.status !== 'welcome') {
      return saved;
    }
    return {
      ...createInitialGameState(PLANET_SCENARIOS.mars),
      status: 'welcome',
    };
  });

  // Active view tab: 'card' (Copero main gameplay), 'actions' (Entrenar / Mejorar), 'colony' (Base & Tripulación)
  const [activeTab, setActiveTab] = useState<'card' | 'actions' | 'colony'>('card');
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [showSTEM, setShowSTEM] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [expandedFact, setExpandedFact] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; positive: boolean } | null>(null);
  const [recentEventIds, setRecentEventIds] = useState<string[]>(['sol1_initial_deployment']);
  const [lastDecisionFeedback, setLastDecisionFeedback] = useState<{
    title: string;
    message: string;
    stemLesson: string;
    badges: { label: string; positive: boolean }[];
  } | null>(null);
  const [selectedStatHelp, setSelectedStatHelp] = useState<string | null>(null);

  // Auto-save
  useEffect(() => {
    if (gameState.status === 'playing') {
      storageService.saveGame(gameState);
    }
  }, [gameState]);

  // Trigger confetti on Victory!
  useEffect(() => {
    if (gameState.status === 'victory') {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore in non-canvas environments
      }
    }
  }, [gameState.status]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
    if (!next) soundService.playClick();
  };

  const showToast = (text: string, positive = true) => {
    setFeedbackToast({ text, positive });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Calculate projected per-Sol deltas so the player sees exact +/- trends (like Copero attribute arrows)
  const projectedDeltas = useMemo(() => {
    const crewCount = gameState.crew.filter((c) => c.health > 0).length;
    let powerDemandMultiplier = 1.0;
    let lifeSupportPriorityMultiplier = 1.0;
    let productionBonus = 1.0;
    let shieldPowerDemandMultiplier = 1.0;

    if (gameState.policy === 'SURVIVAL') {
      powerDemandMultiplier = 0.7;
      productionBonus = 0.5;
      lifeSupportPriorityMultiplier = 1.15;
    } else if (gameState.policy === 'PRODUCTION') {
      powerDemandMultiplier = 1.25;
      productionBonus = 1.4;
    } else if (gameState.policy === 'FULL_SHIELD') {
      shieldPowerDemandMultiplier = 1.8;
      powerDemandMultiplier = 1.15;
    }

    const solarBaseKw =
      110 *
      gameState.facilities.solarArray.level *
      (gameState.facilities.solarArray.health / 100);
    const solarGenKw = solarBaseKw * gameState.subResources.solarEfficiency;
    const backupGenKw = gameState.subResources.generatorBackupActive ? 35 : 0;
    const totalPowerGenKw = solarGenKw + backupGenKw;

    const habitatDemand =
      gameState.facilities.habitat.energyDemand *
      (gameState.facilities.habitat.health > 20 ? 1 : 0.5);
    const eclssDemand = gameState.facilities.lifeSupport.energyDemand;
    const greenhouseDemand =
      gameState.facilities.greenhouse.energyDemand *
      (gameState.policy === 'SURVIVAL' ? 0.4 : 1.0);
    const labDemand =
      gameState.facilities.researchLab.energyDemand *
      (gameState.policy === 'SURVIVAL' ? 0.2 : 1.0);
    const shieldDemand =
      gameState.facilities.radiationShield.energyDemand * shieldPowerDemandMultiplier;

    const totalPowerConsumptionKw =
      (habitatDemand + eclssDemand + greenhouseDemand + labDemand + shieldDemand) *
      powerDemandMultiplier;

    const netBatteryDelta = Math.round(totalPowerGenKw - totalPowerConsumptionKw);

    const o2CrewConsumption = crewCount * NASA_ECLSS_METRICS.OXYGEN_KG_PER_CREW_DAY;
    const o2GreenhouseGen =
      1.2 *
      gameState.facilities.greenhouse.level *
      (gameState.facilities.greenhouse.health / 100) *
      productionBonus;
    const o2EclssRecycled =
      o2CrewConsumption *
      0.7 *
      (gameState.facilities.lifeSupport.health / 100) *
      lifeSupportPriorityMultiplier;
    const netO2Delta =
      Math.round((o2GreenhouseGen + o2EclssRecycled - o2CrewConsumption) * 10) / 10;

    const waterCrewConsumption = crewCount * NASA_ECLSS_METRICS.WATER_L_PER_CREW_DAY;
    const waterRecycled =
      waterCrewConsumption *
      gameState.subResources.waterRecyclingEfficiency *
      (gameState.facilities.lifeSupport.health / 100);
    const waterGreenhouseUse =
      (gameState.facilities.greenhouse.health > 20 ? 4.0 : 1.0) *
      (gameState.policy === 'PRODUCTION' ? 1.4 : 1.0);
    const netWaterDelta =
      Math.round((waterRecycled - (waterCrewConsumption + waterGreenhouseUse)) * 10) / 10;

    const foodCrewConsumption = crewCount * NASA_ECLSS_METRICS.FOOD_KG_PER_CREW_DAY;
    const foodGreenhouseProduction =
      1.8 *
      gameState.facilities.greenhouse.level *
      (gameState.facilities.greenhouse.health / 100) *
      productionBonus;
    const netFoodDelta =
      Math.round((foodGreenhouseProduction - foodCrewConsumption) * 10) / 10;

    return {
      battery: netBatteryDelta,
      oxygen: netO2Delta,
      water: netWaterDelta,
      food: netFoodDelta,
    };
  }, [gameState]);

  // Calculate OVR (Overall Rating 0-99) of the Colony
  const colonyOVR = useMemo(() => {
    const energyPct = Math.round(
      (gameState.subResources.batteryStorageCurrent /
        gameState.subResources.batteryStorageMax) *
        100
    );
    const o2Pct = Math.round(
      (gameState.subResources.oxygenCurrent / gameState.subResources.oxygenMax) * 100
    );
    const waterPct = Math.round(
      (gameState.subResources.waterCurrent / gameState.subResources.waterMax) * 100
    );
    const foodPct = Math.round(
      (gameState.subResources.foodCurrent / gameState.subResources.foodMax) * 100
    );
    const shieldPct = Math.round(gameState.subResources.shieldIntegrity);
    const aliveCrew = gameState.crew.filter((c) => c.health > 0);
    const crewHealthPct =
      aliveCrew.length > 0
        ? Math.round(
            aliveCrew.reduce((acc, c) => acc + c.health, 0) / gameState.crew.length
          )
        : 0;

    const raw =
      energyPct * 0.2 +
      o2Pct * 0.2 +
      waterPct * 0.2 +
      foodPct * 0.15 +
      shieldPct * 0.1 +
      crewHealthPct * 0.15;

    return Math.max(10, Math.min(99, Math.round(raw)));
  }, [gameState]);

  // Trophies / Medallas NASA (Like Copero Trophy Cabinet)
  const trophies = useMemo(() => {
    const aliveCrewCount = gameState.crew.filter((c) => c.health > 0).length;
    return [
      {
        id: 'water_master',
        title: 'Maestro del Agua',
        desc: 'Reciclaje de agua al 90%+',
        unlocked: gameState.subResources.waterRecyclingEfficiency >= 0.9,
        icon: '💧',
      },
      {
        id: 'nuclear_power',
        title: 'Energía Nuclear',
        desc: 'Generador RTG activo',
        unlocked: gameState.subResources.generatorBackupActive,
        icon: '⚛️',
      },
      {
        id: 'green_thumb',
        title: 'Cosecha Espacial',
        desc: 'Invernadero Nivel 2+',
        unlocked: gameState.facilities.greenhouse.level >= 2,
        icon: '🌱',
      },
      {
        id: 'iron_dome',
        title: 'Domo Impenetrable',
        desc: 'Escudo al 98%+',
        unlocked: gameState.subResources.shieldIntegrity >= 98,
        icon: '🛡️',
      },
      {
        id: 'veteran_10',
        title: 'Veterano Orbital',
        desc: 'Superar el Sol 10',
        unlocked: gameState.cycle >= 10,
        icon: '🚀',
      },
      {
        id: 'full_crew',
        title: 'Escuadrón Intacto',
        desc: '4/4 Astronautas sanos',
        unlocked: aliveCrewCount === 4 && gameState.cycle >= 5,
        icon: '👨‍🚀',
      },
    ];
  }, [gameState]);

  // Smart Coach Tip (Explains what to do right now in plain Spanish)
  const smartTip = useMemo(() => {
    const o2Pct =
      (gameState.subResources.oxygenCurrent / gameState.subResources.oxygenMax) * 100;
    const waterPct =
      (gameState.subResources.waterCurrent / gameState.subResources.waterMax) * 100;
    const energyPct =
      (gameState.subResources.batteryStorageCurrent /
        gameState.subResources.batteryStorageMax) *
      100;
    const foodPct =
      (gameState.subResources.foodCurrent / gameState.subResources.foodMax) * 100;

    if (waterPct < 35) {
      return {
        type: 'warning' as const,
        text: '¡Cuidado con el Agua! Está por debajo del 35%. Te conviene perforar hielo o mejorar el reciclador Sabatier.',
        SuggestedActionId: 'drill_subsurface_ice',
      };
    }
    if (o2Pct < 35) {
      return {
        type: 'warning' as const,
        text: '¡Oxígeno bajo! Mejora el Reactor Sabatier o cambia tu táctica a Cosecha para producir más O2.',
        SuggestedActionId: 'upgrade_eclss_water',
      };
    }
    if (energyPct < 30 || projectedDeltas.battery < -25) {
      return {
        type: 'warning' as const,
        text: 'Estás gastando mucha batería. Activa la Táctica "Ahorro" o limpia los paneles solares.',
        SuggestedActionId: 'clean_solar_panels',
      };
    }
    if (foodPct < 30) {
      return {
        type: 'warning' as const,
        text: 'Reservas de comida bajas. Activa la Táctica "Cosecha" o amplía el Invernadero.',
        SuggestedActionId: 'expand_aeroponics_greenhouse',
      };
    }
    if (gameState.activeEvent) {
      return {
        type: 'info' as const,
        text: `Paso 1: Elige una de las opciones de abajo para resolver la situación del Sol ${gameState.cycle}.`,
      };
    }
    return {
      type: 'ok' as const,
      text: `Sistemas estables. Ajusta tu táctica si quieres o pulsa "SIMULAR SOL ${gameState.cycle}" para avanzar.`,
    };
  }, [gameState, projectedDeltas]);

  // Start new career
  const handleStartMission = () => {
    soundService.playConfirm();
    const misionHistorica = buscarMision(selectedHistoricalId);
    const planet = PLANET_SCENARIOS[misionHistorica ? misionHistorica.planetId : selectedPlanetId];
    const spec =
      SPECIALTIES.find((s) => s.id === selectedSpecialtyId) || SPECIALTIES[0];
    const commander: CommanderSetup = {
      name: commanderName.trim() || 'Cmdr. Alex Vega',
      countryFlag: selectedCountry.flag,
      countryName: selectedCountry.name,
      specialtyId: spec.id,
      specialtyName: spec.name,
    };

    const newState = createInitialGameState(planet, commander, {
      missionCode: missionCodeInput,
      soles: solesInput,
      historicalMissionId: misionHistorica?.id,
    });
    setGameState(newState);
    setRecentEventIds(['sol1_initial_deployment']);
    setLastDecisionFeedback(null);
    setActiveTab('card');
    storageService.saveGame(newState);
  };

  const handleRestart = () => {
    soundService.playClick();
    storageService.clearSave();
    setLastDecisionFeedback(null);
    setGameState((prev) => ({ ...prev, status: 'welcome' }));
  };

  // Format consequence badges for any choice so the user sees exact +/- effects BEFORE clicking
  const getChoiceBadges = (choice: GameEventChoice) => {
    const badges: { label: string; positive: boolean }[] = [];
    const c = choice.consequences;
    const netCredits = (c.creditsDelta || 0);

    if (netCredits !== 0) {
      badges.push({
        label: `💰 ${netCredits > 0 ? '+' : ''}$${netCredits}k`,
        positive: netCredits > 0,
      });
    } else if (choice.costCredits && choice.costCredits > 0) {
      badges.push({
        label: `💰 -$${choice.costCredits}k`,
        positive: false,
      });
    }

    if (c.batteryDelta) {
      badges.push({
        label: `⚡ ${c.batteryDelta > 0 ? '+' : ''}${c.batteryDelta} kWh`,
        positive: c.batteryDelta > 0,
      });
    } else if (choice.energyCost && choice.energyCost > 0) {
      badges.push({
        label: `⚡ -${choice.energyCost} kWh`,
        positive: false,
      });
    }

    if (c.waterDelta) {
      badges.push({
        label: `💧 ${c.waterDelta > 0 ? '+' : ''}${c.waterDelta}L Agua`,
        positive: c.waterDelta > 0,
      });
    }
    if (c.oxygenDelta) {
      badges.push({
        label: `💨 ${c.oxygenDelta > 0 ? '+' : ''}${c.oxygenDelta}kg O2`,
        positive: c.oxygenDelta > 0,
      });
    }
    if (c.foodDelta) {
      badges.push({
        label: `🌱 ${c.foodDelta > 0 ? '+' : ''}${c.foodDelta}kg Comida`,
        positive: c.foodDelta > 0,
      });
    }
    if (c.shieldDelta) {
      badges.push({
        label: `🛡️ ${c.shieldDelta > 0 ? '+' : ''}${c.shieldDelta}% Escudo`,
        positive: c.shieldDelta > 0,
      });
    }
    if (c.crewHealthDelta) {
      badges.push({
        label: `❤️ ${c.crewHealthDelta > 0 ? '+' : ''}${c.crewHealthDelta}% Salud`,
        positive: c.crewHealthDelta > 0,
      });
    }
    if (c.crewMoraleDelta) {
      badges.push({
        label: `😊 ${c.crewMoraleDelta > 0 ? '+' : ''}${c.crewMoraleDelta}% Moral`,
        positive: c.crewMoraleDelta > 0,
      });
    }
    return badges;
  };

  // Choose tactical option in current card
  const handleEventChoice = (choice: GameEventChoice) => {
    soundService.playConfirm();
    const badges = getChoiceBadges(choice);
    const eventTitle = gameState.activeEvent?.title || `Decisión del Sol ${gameState.cycle}`;

    setGameState((prev) => {
      const c = choice.consequences;
      const curCredits = Math.max(0, prev.mainResources.credits + (c.creditsDelta ?? -(choice.costCredits || 0)));
      const curBattery = Math.max(
        0,
        Math.min(
          prev.subResources.batteryStorageMax,
          prev.subResources.batteryStorageCurrent + (c.batteryDelta ?? -(choice.energyCost || 0))
        )
      );
      const curO2 = Math.max(
        0,
        Math.min(prev.subResources.oxygenMax, prev.subResources.oxygenCurrent + (c.oxygenDelta || 0))
      );
      const curWater = Math.max(
        0,
        Math.min(prev.subResources.waterMax, prev.subResources.waterCurrent + (c.waterDelta || 0))
      );
      const curFood = Math.max(
        0,
        Math.min(prev.subResources.foodMax, prev.subResources.foodCurrent + (c.foodDelta || 0))
      );
      const curShield = Math.max(
        0,
        Math.min(100, prev.subResources.shieldIntegrity + (c.shieldDelta || 0))
      );

      const nextFacilities = { ...prev.facilities };
      if (c.facilityWearDelta) {
        for (const [key, wear] of Object.entries(c.facilityWearDelta)) {
          const facilityKey = key as keyof typeof nextFacilities;
          if (nextFacilities[facilityKey] && typeof wear === 'number') {
            nextFacilities[facilityKey] = {
              ...nextFacilities[facilityKey],
              health: Math.max(0, Math.min(100, nextFacilities[facilityKey].health + wear)),
            };
          }
        }
      }

      const updatedCrew = prev.crew.map((member) => ({
        ...member,
        health:
          member.health > 0
            ? Math.max(0, Math.min(100, member.health + (c.crewHealthDelta || 0)))
            : 0,
        morale:
          member.health > 0
            ? Math.max(0, Math.min(100, member.morale + (c.crewMoraleDelta || 0)))
            : 0,
      }));

      const energyPercent = Math.round(
        (curBattery / prev.subResources.batteryStorageMax) * 100
      );
      const lifeSupportPercent = Math.round(
        ((curO2 / prev.subResources.oxygenMax +
          curWater / prev.subResources.waterMax +
          curFood / prev.subResources.foodMax) /
          3) *
          100
      );

      return {
        ...prev,
        activeEvent: null,
        crew: updatedCrew,
        facilities: nextFacilities,
        subResources: {
          ...prev.subResources,
          batteryStorageCurrent: curBattery,
          oxygenCurrent: curO2,
          waterCurrent: curWater,
          foodCurrent: curFood,
          shieldIntegrity: curShield,
        },
        mainResources: {
          ...prev.mainResources,
          energyPercent,
          lifeSupportPercent,
          radiationProtectionPercent: curShield,
          credits: curCredits,
        },
        decisionsLog: [
          ...prev.decisionsLog,
          { cycle: prev.cycle, text: choice.text, category: 'decision' },
        ],
      };
    });

    setLastDecisionFeedback({
      title: choice.text,
      message: choice.consequences.customMessage,
      stemLesson: choice.stemLesson || `Decisión aplicada en ${eventTitle}.`,
      badges,
    });

    showToast(choice.consequences.customMessage, true);
  };

  // Advance Sol (The core loop of Copero: Simular Temporada / Sol)
  const handleAdvanceSol = useCallback(() => {
    if (gameState.status !== 'playing' || isSimulating) return;

    setIsSimulating(true);
    soundService.playCycleAdvance();

    const prevSub = gameState.subResources;
    const prevCreds = gameState.mainResources.credits;

    setTimeout(() => {
      const { nextState, warnings } = avanzarSolConDatosReales(gameState);

      let chosenEvent = null;
      if (nextState.status === 'playing') {
        chosenEvent = eventoDelSol(
          {
            cycle: nextState.cycle,
            planetId: nextState.planet.id,
            maxCycles: nextState.maxCycles,
            missionCode: nextState.missionCode,
            historicalMissionId: nextState.historicalMissionId,
          },
          recentEventIds
        );
        setRecentEventIds((prev) => [...prev.slice(-4), chosenEvent!.id]);
      }

      const solSummary = {
        sol: gameState.cycle,
        batteryDelta: Math.round(
          nextState.subResources.batteryStorageCurrent - prevSub.batteryStorageCurrent
        ),
        oxygenDelta:
          Math.round((nextState.subResources.oxygenCurrent - prevSub.oxygenCurrent) * 10) /
          10,
        waterDelta:
          Math.round((nextState.subResources.waterCurrent - prevSub.waterCurrent) * 10) /
          10,
        foodDelta:
          Math.round((nextState.subResources.foodCurrent - prevSub.foodCurrent) * 10) /
          10,
        shieldDelta: Math.round(
          nextState.subResources.shieldIntegrity - prevSub.shieldIntegrity
        ),
        creditsDelta: nextState.mainResources.credits - prevCreds,
        headline:
          warnings.length > 0
            ? warnings[0]
            : `Sol ${gameState.cycle} completado sin bajas.`,
      };

      setGameState({
        ...nextState,
        activeEvent: chosenEvent,
        currentEventId: chosenEvent?.id,
        lastSolSummary: solSummary,
      });

      setLastDecisionFeedback(null);

      if (warnings.length > 0) {
        showToast(warnings[0], false);
      } else {
        showToast(`¡Sol ${gameState.cycle} simulado! Avanzando al Sol ${nextState.cycle}`, true);
      }

      setIsSimulating(false);
      setExpandedFact(false);
    }, 300);
  }, [gameState, isSimulating, recentEventIds]);

  // Quick Action execution (Entrenamiento / Mejora)
  const handleQuickAction = (action: MissionAction) => {
    soundService.playConfirm();
    setGameState((prev) => {
      const updates = action.apply(prev);
      return {
        ...prev,
        ...updates,
        decisionsLog: [
          ...prev.decisionsLog,
          { cycle: prev.cycle, text: action.name, category: action.category },
        ],
      };
    });
    showToast(`✅ Mejora aplicada: ${action.name}`, true);
  };

  // Set Policy mode
  const setPolicy = (policy: PolicyMode) => {
    soundService.playClick();
    setGameState((prev) => ({ ...prev, policy }));
    const labels: Record<PolicyMode, string> = {
      SURVIVAL: '🔋 Modo Ahorro (-30% Consumo Eléctrico)',
      PRODUCTION: '🌱 Modo Cosecha (+40% Comida y Oxígeno)',
      FULL_SHIELD: '🛡️ Modo Blindaje (+35% Protección Radiación)',
    };
    showToast(`Táctica activa: ${labels[policy]}`, true);
  };

  // Etiqueta de la misión jugada: nombre de la misión histórica y código del aula.
  const misionJugada = buscarMision(gameState.historicalMissionId);

  // Historial: cada carrera terminada se guarda una sola vez en este dispositivo.
  const nombreMisionJugada = misionJugada ? misionJugada.nombre : null;
  useEffect(() => {
    if (gameState.status !== 'victory' && gameState.status !== 'defeat') {
      carreraGuardada.current = false;
      return;
    }
    if (carreraGuardada.current) return;
    const registro = recordFromGame(gameState, colonyOVR, nombreMisionJugada, Date.now());
    if (!registro) return;
    carreraGuardada.current = true;
    setCareerHistory(saveCareerRecord(registro));
  }, [gameState, colonyOVR, nombreMisionJugada]);
  const etiquetaMision =
    (misionJugada ? ` • ${misionJugada.nombre}` : '') +
    (gameState.missionCode ? ` • CÓDIGO ${gameState.missionCode}` : '');

  // -------------------------------------------------------------
  // 1. WELCOME SCREEN: CREA TU LEYENDA ESPACIAL (Estilo Copero)
  // -------------------------------------------------------------
  if (gameState.status === 'welcome') {
    const selectedPlanet = PLANET_SCENARIOS[selectedPlanetId];
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-between items-center p-3 sm:p-6 selection:bg-cyan-400 selection:text-black">
        {/* Top bar */}
        <header className="w-full max-w-2xl flex justify-between items-center pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
              <Rocket className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="font-heading font-black tracking-wider text-sm text-white block leading-none">
                MARS-1 <span className="text-cyan-400">PUESTO DE AVANZADA</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Simulador de misión espacial • Datos de la NASA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="px-3 py-1.5 rounded-xl bg-[#111a33] border border-cyan-500/30 text-xs font-mono text-cyan-300 hover:bg-cyan-950/60 flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo se juega?
            </button>
            <button
              onClick={() => setShowSTEM(true)}
              className="px-3 py-1.5 rounded-xl bg-violet-950/60 border border-violet-500/30 text-xs font-mono text-violet-300 hover:bg-violet-900/60 hidden sm:flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> Enciclopedia NASA
            </button>
          </div>
        </header>

        {/* Main Creator Card (Like Copero's "Convertite en Leyenda" Setup) */}
        <main className="w-full max-w-2xl bg-[#0d1428] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/50 space-y-5 my-auto">
          {/* Header Banner */}
          <div className="text-center space-y-1 border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-bold uppercase">
              <Trophy className="w-3.5 h-3.5" /> Modo Carrera: Convertite en Leyenda de la NASA
            </div>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white tracking-wide uppercase">
              CREA TU COMANDANTE ESPACIAL
            </h1>
            <p className="text-xs text-slate-400 font-sans max-w-lg mx-auto">
              Toma decisiones temporada tras temporada (tú eliges cuántos soles). Cada elección muestra exactamente qué ganas y qué pierdes antes de decidir.
            </p>
          </div>

          {/* STEP 1: Tu Identidad (Nombre y País) */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Tu Identidad y Nacionalidad
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7 flex gap-2">
                <input
                  type="text"
                  value={commanderName}
                  onChange={(e) => setCommanderName(e.target.value)}
                  placeholder="Nombre de tu Comandante..."
                  maxLength={28}
                  className="flex-1 bg-[#080d1a] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm font-heading font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    const next =
                      RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
                    setCommanderName(next);
                  }}
                  title="Nombre aleatorio"
                  className="px-3 py-2.5 rounded-xl bg-[#121c38] hover:bg-[#19274d] border border-slate-700 text-cyan-300 transition-colors"
                >
                  <Dices className="w-4 h-4" />
                </button>
              </div>

              {/* Country Selector: todas las nacionalidades en un desplegable */}
              <select
                value={selectedCountry.name}
                onChange={(e) => {
                  const c = COUNTRIES.find((x) => x.name === e.target.value);
                  if (c) {
                    soundService.playClick();
                    setSelectedCountry(c);
                  }
                }}
                title="Nacionalidad"
                aria-label="Nacionalidad"
                className="sm:col-span-5 bg-[#080d1a] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm font-heading font-bold text-white focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-[#080d1a]">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 2: Elige tu Especialidad (Like Copero's Position + Legend Attribute Draft) */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> 2. Elige tu Ventaja Inicial (Draft de Especialidad)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SPECIALTIES.map((spec) => {
                const isSelected = selectedSpecialtyId === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setSelectedSpecialtyId(spec.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${spec.color} ring-2 ring-cyan-400/50 shadow-lg scale-[1.01]`
                        : 'bg-[#080d1a] border-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-heading font-black text-white">
                          {spec.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-amber-300 mb-1.5">
                        {spec.badge}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-snug mb-2">
                        {spec.description}
                      </p>
                    </div>
                    <div className="space-y-0.5 border-t border-slate-800/80 pt-1.5">
                      {spec.perks.map((perk) => (
                        <div key={perk} className="text-[10px] font-mono text-emerald-300">
                          ✓ {perk}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Elige tu Destino (Marte vs Luna) */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" /> 3. Elige el Destino de tu Misión
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setSelectedPlanetId('mars'); setSelectedHistoricalId(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  selectedPlanetId === 'mars'
                    ? 'bg-red-950/40 border-red-400 ring-2 ring-red-400/30 shadow-lg'
                    : 'bg-[#080d1a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-900 to-amber-500 flex items-center justify-center text-xl shrink-0 shadow-md">
                  🪐
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-heading font-black text-white">
                      MARTE
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Recomendado
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    Cráter Jezero • Tormentas de polvo solar
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setSelectedPlanetId('moon'); setSelectedHistoricalId(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  selectedPlanetId === 'moon'
                    ? 'bg-slate-800/60 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg'
                    : 'bg-[#080d1a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-700 to-slate-200 flex items-center justify-center text-xl shrink-0 shadow-md">
                  🌕
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-heading font-black text-white">
                      LUNA
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                      Reto Experto
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    Polo Sur • Radiación extrema y frío
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 4: Entrenamiento con misiones reales */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> 4. Entrenamiento: revive una misión real (opcional)
            </label>
            <p className="text-[11px] text-slate-400 leading-snug">
              Así se entrena a los astronautas: con los días más difíciles que ya ocurrieron. Los
              números de estas misiones son los que midió la NASA.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MISIONES_HISTORICAS.map((m) => {
                const activa = selectedHistoricalId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setSelectedHistoricalId(activa ? null : m.id);
                      if (!activa) setSelectedPlanetId(m.planetId);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      activa
                        ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-[#080d1a] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-black text-xs text-white uppercase tracking-wide">
                        {m.nombre}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 shrink-0">
                        {m.anio} • {m.planetId === 'mars' ? 'MARTE' : 'LUNA'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">{m.resumen}</p>
                    {activa && (
                      <p className="text-[10px] text-amber-200/90 mt-1.5 leading-snug">
                        HECHO REAL: {m.hechoReal} (Fuente: {m.fuente}.)
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 5: Código de misión para el aula */}
          <div className="space-y-2">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" /> Duración de la misión: {solesInput} soles
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {DURACIONES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSolesInput(d)}
                  className={`px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                    solesInput === d
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#080d1a] border-slate-700 text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
              <input
                id="soles-mision"
                type="number"
                min={SOLES_MIN}
                max={SOLES_MAX}
                value={solesInput}
                onChange={(e) => setSolesInput(Number(e.target.value))}
                onBlur={() => setSolesInput(normalizarSoles(solesInput))}
                aria-label="Cantidad de soles de la misión"
                className="w-20 px-3 py-2 rounded-xl bg-[#080d1a] border border-slate-700 text-sm font-mono text-white outline-none focus:border-emerald-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Elige cuántos soles debe resistir la base, de {SOLES_MIN} a {SOLES_MAX}. Una misión corta sale con menos carga; en una larga llega una nave de carga con el relevo cada 15 soles, y hay que resistir hasta que llegue.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="codigo-mision"
              className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5"
            >
              <Dices className="w-3.5 h-3.5" /> 5. Código de misión del instructor (opcional)
            </label>
            <input
              id="codigo-mision"
              type="text"
              value={missionCodeInput}
              onChange={(e) => setMissionCodeInput(e.target.value)}
              maxLength={24}
              placeholder="Ejemplo: SANTA-CRUZ-15"
              className="w-full px-3 py-2.5 rounded-xl bg-[#080d1a] border border-slate-700 text-sm font-mono text-white uppercase placeholder:normal-case placeholder:text-slate-500 outline-none focus:border-emerald-400"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              {normalizarCodigo(missionCodeInput)
                ? `Todos los que escriban ${normalizarCodigo(missionCodeInput)} reciben los mismos eventos en el mismo orden: gana quien decide mejor, no quien tiene más suerte.`
                : 'El instructor da un código y todo el grupo entrena la misma misión, con los mismos eventos, para comparar resultados. Sin código, los eventos salen al azar.'}
            </p>
          </div>

          <CareerHistoryPanel
            records={careerHistory}
            commander={commanderName}
            onClear={() => {
              clearCareerHistory();
              setCareerHistory([]);
            }}
          />

          {/* Big Start Career Button */}
          <button
            type="button"
            onClick={handleStartMission}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-space-950 font-heading font-black text-sm sm:text-base tracking-wider uppercase shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              INICIAR CARRERA CON {selectedCountry.flag} {commanderName || 'COMANDANTE'} EN{' '}
              {selectedPlanet.id === 'mars' ? 'MARTE' : 'LA LUNA'}
            </span>
          </button>
        </main>

        <footer className="text-center text-[11px] font-mono text-slate-500 pt-2">
          Cada número del juego sale de datos públicos de la NASA • Míralos en el Centro STEM, pestaña Fuentes
        </footer>

        {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
        {showSTEM && <STEMLearningCenter onClose={() => setShowSTEM(false)} />}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. VICTORY CARD: CARTA DE RETIRO / LEYENDA NASA (Estilo Copero)
  // -------------------------------------------------------------
  if (gameState.status === 'victory' && gameState.victorySummary) {
    const summary = gameState.victorySummary;
    const cmdr = gameState.commanderProfile;
    const unlockedTrophies = trophies.filter((t) => t.unlocked);
    const tierLabel =
      colonyOVR >= 85
        ? 'LEYENDA INMORTAL NASA'
        : colonyOVR >= 70
        ? 'COMANDANTE ÉLITE'
        : 'SOBREVIVIENTE HEROICO';

    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg bg-gradient-to-b from-[#111c38] to-[#0a1022] border-2 border-amber-400/70 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
          {/* Legend Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-space-950 flex flex-col items-center justify-center font-heading font-black shadow-lg shadow-amber-500/30">
                <span className="text-2xl leading-none">{colonyOVR}</span>
                <span className="text-[9px] font-mono uppercase tracking-widest">OVR</span>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {tierLabel}
                </div>
                <h2 className="text-xl font-heading font-black text-white">
                  {cmdr?.countryFlag} {cmdr?.name || 'Comandante'}
                </h2>
                <p className="text-xs text-cyan-300 font-mono">
                  {cmdr?.specialtyName} • {gameState.planet.name.split('—')[0].trim()}{etiquetaMision}
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">TEMPORADAS</span>
              <span className="text-lg font-heading font-black text-emerald-400">{gameState.maxCycles} / {gameState.maxCycles}</span>
            </div>
          </div>

          {/* Core Career Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
            <div className="bg-[#080d1a] p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[9px] uppercase block">Puntaje Carrera</span>
              <span className="text-base font-heading font-black text-amber-400">
                {summary.finalScore}
              </span>
            </div>
            <div className="bg-[#080d1a] p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[9px] uppercase block">Tripulación</span>
              <span className="text-base font-heading font-black text-emerald-400">
                {summary.survivingCrewCount}/4 Vivos
              </span>
            </div>
            <div className="bg-[#080d1a] p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[9px] uppercase block">Reciclaje H2O</span>
              <span className="text-base font-heading font-black text-cyan-300">
                {summary.waterRecycledPercent}%
              </span>
            </div>
            <div className="bg-[#080d1a] p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[9px] uppercase block">Fondos Finales</span>
              <span className="text-base font-heading font-black text-amber-300">
                ${gameState.mainResources.credits}k
              </span>
            </div>
          </div>

          {/* Palmarés / Trofeos Ganados */}
          <div className="bg-[#080d1a] p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center justify-between">
              <span>🏆 Palmarés de la Misión ({unlockedTrophies.length}/{trophies.length})</span>
              <span>Medallas Oficiales NASA</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {trophies.map((t) => (
                <div
                  key={t.id}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 ${
                    t.unlocked
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <div className="text-[10px] font-heading font-bold leading-tight">{t.title}</div>
                    <div className="text-[9px] font-mono text-slate-400">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-space-950 font-heading font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 transition-all active:scale-95"
          >
            JUGAR NUEVA CARRERA ESPACIAL
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. DEFEAT CARD: RESUMEN DE RETIRO FORZADO (Estilo Copero)
  // -------------------------------------------------------------
  if (gameState.status === 'defeat' && gameState.defeatCause) {
    const cause = gameState.defeatCause;
    const cmdr = gameState.commanderProfile;
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#0d1428] border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-400/40">
            <Skull className="w-10 h-10" />
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
              FIN DE LA CARRERA EN EL SOL {gameState.cycle} / {gameState.maxCycles}{etiquetaMision}
            </div>
            <h2 className="text-lg font-heading font-black text-white mt-0.5">
              {cmdr?.countryFlag} {cmdr?.name}
            </h2>
            <p className="text-sm font-heading font-bold text-red-300 mt-1">{cause.title}</p>
          </div>

          <div className="p-3 bg-red-950/40 rounded-2xl border border-red-500/30 text-xs text-red-200 text-left font-sans space-y-1">
            <strong className="block font-mono text-[10px] uppercase text-red-300">
              ¿Qué falló? ({cause.criticalMetric}):
            </strong>
            <p>{cause.reason}</p>
          </div>

          <div className="p-3 bg-[#080d1a] rounded-2xl border border-cyan-500/30 text-left text-xs font-sans text-slate-300 space-y-1">
            <strong className="block font-mono text-[10px] uppercase text-cyan-400">
              💡 Consejo para tu próximo intento:
            </strong>
            <p>{cause.recommendations[0]}</p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-heading font-black text-sm tracking-wider uppercase shadow-xl shadow-red-600/30 transition-all active:scale-95"
          >
            INTENTAR NUEVA CARRERA
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. MAIN GAMEPLAY SCREEN: INTUITIVE COPERO SIMULATOR
  // -------------------------------------------------------------
  const aliveCrew = gameState.crew.filter((c) => c.health > 0).length;
  const avgCrewHealth =
    aliveCrew > 0
      ? Math.round(
          gameState.crew.filter((c) => c.health > 0).reduce((a, b) => a + b.health, 0) /
            aliveCrew
        )
      : 0;
  const currentEvent = gameState.activeEvent;
  const cmdr = gameState.commanderProfile;

  const energyPct = Math.round(
    (gameState.subResources.batteryStorageCurrent /
      gameState.subResources.batteryStorageMax) *
      100
  );
  const o2Pct = Math.round(
    (gameState.subResources.oxygenCurrent / gameState.subResources.oxygenMax) * 100
  );
  const waterPct = Math.round(
    (gameState.subResources.waterCurrent / gameState.subResources.waterMax) * 100
  );
  const foodPct = Math.round(
    (gameState.subResources.foodCurrent / gameState.subResources.foodMax) * 100
  );
  const shieldPct = Math.round(gameState.subResources.shieldIntegrity);

  const statItems = [
    {
      id: 'energy',
      label: 'ENERGÍA',
      pct: energyPct,
      raw: `${Math.round(gameState.subResources.batteryStorageCurrent)} kWh`,
      delta: projectedDeltas.battery,
      unit: 'kW/sol',
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
      barColor: energyPct <= 25 ? 'bg-red-500' : energyPct <= 50 ? 'bg-amber-400' : 'bg-cyan-400',
      help: 'Alimenta toda la base. Si baja, activa la Táctica "Ahorro" o limpia los paneles solares.',
      quickActionId: 'clean_solar_panels',
    },
    {
      id: 'oxygen',
      label: 'OXÍGENO',
      pct: o2Pct,
      raw: `${gameState.subResources.oxygenCurrent} kg`,
      delta: projectedDeltas.oxygen,
      unit: 'kg/sol',
      icon: <Wind className="w-3.5 h-3.5 text-emerald-400" />,
      barColor: o2Pct <= 25 ? 'bg-red-500' : o2Pct <= 50 ? 'bg-amber-400' : 'bg-emerald-400',
      help: 'Indispensable para respirar (si llega a 0 pierdes). Sube mejorando el Reactor Sabatier o el Invernadero.',
      quickActionId: 'upgrade_eclss_water',
    },
    {
      id: 'water',
      label: 'AGUA',
      pct: waterPct,
      raw: `${gameState.subResources.waterCurrent} L`,
      delta: projectedDeltas.water,
      unit: 'L/sol',
      icon: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
      barColor: waterPct <= 25 ? 'bg-red-500' : waterPct <= 50 ? 'bg-amber-400' : 'bg-blue-400',
      help: 'Hidrata a la tripulación y refrigera la base (si llega a 0 pierdes). Sube perforando hielo subterráneo.',
      quickActionId: 'drill_subsurface_ice',
    },
    {
      id: 'food',
      label: 'COMIDA',
      pct: foodPct,
      raw: `${gameState.subResources.foodCurrent} kg`,
      delta: projectedDeltas.food,
      unit: 'kg/sol',
      icon: <Sprout className="w-3.5 h-3.5 text-lime-400" />,
      barColor: foodPct <= 25 ? 'bg-red-500' : foodPct <= 50 ? 'bg-amber-400' : 'bg-lime-400',
      help: 'Alimenta a los astronautas. Sube activando la Táctica "Cosecha" o ampliando el Invernadero.',
      quickActionId: 'expand_aeroponics_greenhouse',
    },
    {
      id: 'shield',
      label: 'ESCUDO',
      pct: shieldPct,
      raw: `${shieldPct}%`,
      delta: gameState.facilities.radiationShield.health > 70 ? 1 : -2,
      unit: '%/sol',
      icon: <Shield className="w-3.5 h-3.5 text-violet-400" />,
      barColor: shieldPct <= 30 ? 'bg-red-500' : shieldPct <= 60 ? 'bg-amber-400' : 'bg-violet-400',
      help: 'Protege contra la radiación espacial. Sube con la Táctica "Escudo" o reforzando la bóveda de regolito.',
      quickActionId: 'sinter_regolith_radiation_shield',
    },
    {
      id: 'crew',
      label: 'SALUD TRIP.',
      pct: avgCrewHealth,
      raw: `${aliveCrew}/4 Vivos`,
      delta:
        o2Pct > 40 && waterPct > 30 && foodPct > 25 && energyPct > 20 ? 4 : -10,
      unit: '%/sol',
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-400" />,
      barColor:
        avgCrewHealth <= 35 ? 'bg-red-500' : avgCrewHealth <= 65 ? 'bg-amber-400' : 'bg-rose-400',
      help: 'Salud promedio de tus 4 astronautas. Se mantiene alta si tienes agua, oxígeno y comida suficientes.',
      quickActionId: 'ration_and_crew_telemetry_check',
    },
  ];

  const suggestedAction = smartTip.SuggestedActionId
    ? MISSION_ACTIONS.find((a) => a.id === smartTip.SuggestedActionId)
    : null;

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-between selection:bg-cyan-400 selection:text-black">
      {/* 1. TOP COPERO PLAYER / COLONY HEADER */}
      <header className="sticky top-0 z-30 bg-[#0a0f1f]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2.5 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Top Row: Commander Card + Sol Progress + Utility Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Commander & OVR Badge (rating general) */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-heading font-black border shadow-md ${
                  colonyOVR >= 80
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : colonyOVR >= 60
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'
                }`}
                title="Valoración General de tu Base (OVR)"
              >
                <span className="text-sm leading-none">{colonyOVR}</span>
                <span className="text-[8px] font-mono uppercase">OVR</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-heading font-black text-white">
                    {cmdr?.countryFlag || '🇦🇷'} {cmdr?.name || 'Comandante'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                    {gameState.planet.id === 'mars' ? '🪐 Marte' : '🌕 Luna'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {cmdr?.specialtyName || 'Misión Oficial NASA'}
                </div>
              </div>
            </div>

            {/* Center: Temporada / Sol Counter + Career Progress Bar */}
            <div className="flex items-center gap-3 bg-[#080d1a] px-3.5 py-1.5 rounded-2xl border border-cyan-500/40">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">SOL</span>
                  <span className="text-base font-heading font-black text-cyan-300">
                    {String(gameState.cycle).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">/ {gameState.maxCycles}</span>
                </div>
                <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(gameState.cycle / gameState.maxCycles) * 100}%` }}
                  />
                </div>
              </div>

              {/* Budget Pill */}
              <div className="pl-3 border-l border-slate-800 text-right font-mono">
                <span className="text-[9px] text-slate-400 uppercase block">PRESUPUESTO</span>
                <span className="text-xs font-heading font-black text-amber-300 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" /> ${gameState.mainResources.credits}k
                </span>
              </div>
            </div>

            {/* Right: Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowHowToPlay(true)}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-cyan-300 hover:text-white"
                title="Guía Rápida"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white"
                title="Sonido"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>
              <button
                onClick={() => setShowSTEM(true)}
                className="p-1.5 rounded-lg bg-violet-950 border border-violet-500/40 text-violet-300 hover:text-white"
                title="Enciclopedia NASA"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white"
                title="Gráficos de la Misión"
              >
                <LineChart className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-400 hover:text-red-400"
                title="Nueva Carrera"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 6 Intuitive Resource Bars with +/- Trend Indicators */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {statItems.map((st) => {
              const isSelected = selectedStatHelp === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setSelectedStatHelp(isSelected ? null : st.id);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#152244] border-cyan-400 ring-1 ring-cyan-400/50'
                      : st.pct <= 25
                      ? 'bg-red-950/40 border-red-500/60 animate-pulse'
                      : 'bg-[#0e162d] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[9px] font-mono font-bold text-slate-300 flex items-center gap-1">
                      {st.icon} {st.label}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded ${
                        st.delta >= 0
                          ? 'text-emerald-300 bg-emerald-950/80'
                          : 'text-amber-300 bg-amber-950/80'
                      }`}
                      title={`Cambio estimado por Sol (${st.unit})`}
                    >
                      {st.delta >= 0 ? `+${st.delta}` : st.delta}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between w-full mb-1">
                    <span className="text-xs font-heading font-black text-white">
                      {st.pct}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{st.raw}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.barColor}`}
                      style={{ width: `${Math.max(4, Math.min(100, st.pct))}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Stat Tooltip / Quick Fix Drawer when clicking any stat bar */}
          {selectedStatHelp && (
            <div className="p-2.5 rounded-xl bg-[#121d3a] border border-cyan-400/40 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
              {(() => {
                const st = statItems.find((s) => s.id === selectedStatHelp)!;
                const qAction = MISSION_ACTIONS.find((a) => a.id === st.quickActionId);
                const canAfford =
                  qAction && gameState.mainResources.credits >= qAction.costCredits;
                return (
                  <>
                    <div className="flex items-center gap-2 text-slate-200 font-sans">
                      {st.icon}
                      <span>
                        <strong>{st.label}:</strong> {st.help}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      {qAction && (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => {
                            handleQuickAction(qAction);
                            setSelectedStatHelp(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                            canAfford
                              ? 'bg-cyan-400 text-space-950 hover:bg-cyan-300'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          ⚡ {qAction.name} (-${qAction.costCredits}k)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedStatHelp(null)}
                        className="text-[11px] font-mono text-slate-400 hover:text-white px-1.5"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </header>

      {/* Floating toast notification */}
      {feedbackToast && (
        <div
          className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-mono text-center border animate-in fade-in slide-in-from-top-2 ${
            feedbackToast.positive
              ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200'
              : 'bg-red-950/95 border-red-400 text-red-200'
          }`}
        >
          {feedbackToast.text}
        </div>
      )}

      {/* 2. MAIN COPERO GAMEPLAY CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-3 flex flex-col justify-between gap-3">
        {/* Smart Assistant Banner (Step-by-step guidance so anyone understands what to do) */}
        <div
          className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
            smartTip.type === 'warning'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : smartTip.type === 'info'
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 font-sans">
            {smartTip.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{smartTip.text}</span>
          </div>

          {suggestedAction &&
            gameState.mainResources.credits >= suggestedAction.costCredits && (
              <button
                type="button"
                onClick={() => handleQuickAction(suggestedAction)}
                className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-space-950 font-heading font-bold text-[11px] shrink-0 transition-transform active:scale-95"
              >
                Solucionar ahora (-${suggestedAction.costCredits}k)
              </button>
            )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0b1224] p-1 rounded-2xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'card'
                ? 'bg-cyan-400 text-space-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. DECISIÓN DEL SOL {gameState.cycle}</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'actions'
                ? 'bg-cyan-400 text-space-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>2. MEJORAS Y TÁCTICA</span>
          </button>

          <button
            onClick={() => setActiveTab('colony')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'colony'
                ? 'bg-cyan-400 text-space-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. TU BASE ({aliveCrew}/4)</span>
          </button>
        </div>

        {/* TAB 1: THE COPERO SEASON / SOL DECISION CARD */}
        {activeTab === 'card' && (
          <div className="space-y-3">
            {/* Main Decision Card */}
            <div className="w-full bg-[#0d1428] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
              {/* Event / Situation Header */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                      currentEvent?.severity === 'critica' || currentEvent?.severity === 'alta'
                        ? 'bg-red-950/80 text-red-300 border-red-500/40'
                        : currentEvent?.severity === 'positiva'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {currentEvent
                      ? currentEvent.severity === 'positiva'
                        ? '🌟 OPORTUNIDAD DE TEMPORADA'
                        : `🚨 SITUACIÓN DEL SOL ${gameState.cycle} (${currentEvent.severity.toUpperCase()})`
                      : `✅ SOL ${gameState.cycle} LISTO PARA SIMULAR`}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    Presupuesto disponible:{' '}
                    <strong className="text-amber-300">${gameState.mainResources.credits}k</strong>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-heading font-black text-white leading-tight">
                  {currentEvent
                    ? currentEvent.title
                    : lastDecisionFeedback
                    ? `Decisión Aplicada: ${lastDecisionFeedback.title}`
                    : `Ciclo Operativo del Sol ${gameState.cycle}`}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mt-1.5">
                  {currentEvent
                    ? currentEvent.description
                    : lastDecisionFeedback
                    ? lastDecisionFeedback.message
                    : `Todos los sistemas están listos para cerrar el Sol ${gameState.cycle}. Revisa tu táctica abajo y pulsa "SIMULAR SOL".`}
                </p>
                {currentEvent?.id === 'solar_flare_lunar' && <RealFlareNote />}
              </div>

              {/* Choices List with Visual Consequence Pills (Copero Dilemma Buttons) */}
              {currentEvent ? (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                    👇 Elige qué hacer (mira los efectos de cada opción):
                  </div>
                  {currentEvent.choices.map((choice) => {
                    const cost = choice.costCredits || 0;
                    const canAfford = gameState.mainResources.credits >= cost;
                    const badges = getChoiceBadges(choice);

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleEventChoice(choice)}
                        disabled={!canAfford}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2 group active:scale-[0.99] ${
                          canAfford
                            ? 'bg-[#121c38] border-cyan-500/40 hover:border-cyan-300 hover:bg-[#17254a] shadow-lg'
                            : 'bg-space-950/60 border-slate-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-heading font-black text-xs sm:text-sm text-white flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                            <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
                            {choice.text}
                          </span>
                          {!canAfford && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 shrink-0">
                              Faltan fondos (${cost}k)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-sans pl-5 leading-snug">
                          {choice.description}
                        </p>

                        {/* Visual Consequence Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 pl-5 pt-1">
                          {badges.map((b, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                                b.positive
                                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                  {/* Sin presupuesto para ninguna opción: la partida no puede quedar trabada */}
                  {currentEvent.choices.every(
                    (choice) => gameState.mainResources.credits < (choice.costCredits || 0),
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleEventChoice({
                          id: `${currentEvent.id}-sin-fondos`,
                          text: 'Seguir sin intervenir',
                          description: 'El presupuesto no alcanza para ninguna opción.',
                          consequences: {
                            crewMoraleDelta: -5,
                            customMessage:
                              'Sin presupuesto, la tripulación dejó pasar la situación sin intervenir. La moral bajó un poco.',
                          },
                          stemLesson:
                            'En una misión real el presupuesto también es un recurso vital: si se gasta todo antes de tiempo, se pierden oportunidades.',
                        })
                      }
                      className="w-full text-left p-3.5 sm:p-4 rounded-2xl border bg-amber-950/40 border-amber-500/50 hover:border-amber-300 shadow-lg transition-all active:scale-[0.99]"
                    >
                      <span className="font-heading font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
                        Seguir sin intervenir
                      </span>
                      <p className="text-xs text-slate-300 font-sans pl-5 leading-snug mt-1">
                        El presupuesto no alcanza para ninguna opción. La tripulación sigue adelante, con la moral un
                        poco más baja (-5).
                      </p>
                    </button>
                  )}
                </div>
              ) : (
                /* Post-Decision Confirmation Card before advancing Sol */
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  {lastDecisionFeedback && (
                    <>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                          Efectos aplicados:
                        </span>
                        {lastDecisionFeedback.badges.map((b, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                              b.positive
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-950 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {b.label}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] font-sans text-slate-300 border-t border-emerald-500/20 pt-2">
                        <strong className="text-cyan-300 font-mono">Dato NASA: </strong>
                        {lastDecisionFeedback.stemLesson}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Quick Policy Selector (Táctica del Sol) */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    ⚙️ Estilo de Juego / Táctica para este Sol:
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Cambia cómo produce tu base
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPolicy('SURVIVAL')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      gameState.policy === 'SURVIVAL'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                        : 'bg-[#121c38] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xs font-heading font-bold">🔋 Ahorro</div>
                    <div className="text-[10px] font-mono text-emerald-300">Cuida Batería</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPolicy('PRODUCTION')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      gameState.policy === 'PRODUCTION'
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30'
                        : 'bg-[#121c38] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xs font-heading font-bold">🌱 Cosecha</div>
                    <div className="text-[10px] font-mono text-emerald-300">+Comida y O2</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPolicy('FULL_SHIELD')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      gameState.policy === 'FULL_SHIELD'
                        ? 'bg-violet-950/80 border-violet-400 text-violet-200 ring-2 ring-violet-400/30'
                        : 'bg-[#121c38] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xs font-heading font-bold">🛡️ Blindaje</div>
                    <div className="text-[10px] font-mono text-violet-300">+Escudo Solar</div>
                  </button>
                </div>
              </div>

              {/* Expandable Bite-Sized STEM Fact */}
              <div className="bg-[#080d1a] p-2.5 rounded-2xl border border-violet-500/30">
                <button
                  type="button"
                  onClick={() => setExpandedFact(!expandedFact)}
                  className="w-full flex items-center justify-between text-left text-[11px] font-mono text-violet-300 font-bold"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-violet-400" />
                    <span>¿Por qué ocurre esto en la vida real? (Ciencia NASA)</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 underline">
                    {expandedFact ? 'Ocultar' : 'Ver explicación'}
                  </span>
                </button>
                {expandedFact && (
                  <p className="text-xs font-sans text-slate-300 leading-relaxed pt-2 mt-1.5 border-t border-slate-800 animate-in fade-in">
                    {currentEvent
                      ? currentEvent.stemExplanation
                      : 'El sistema ECLSS de la Estación Espacial Internacional recicla hasta el 98% del agua y regenera oxígeno mediante la reacción Sabatier para no depender de envíos constantes desde la Tierra.'}
                  </p>
                )}
              </div>

              {/* Primary Action Button: "SIMULAR SIGUIENTE SOL" (Like Copero's "Simular Temporada") */}
              <button
                type="button"
                onClick={handleAdvanceSol}
                disabled={isSimulating || !!currentEvent}
                className={`w-full py-4 rounded-2xl font-heading font-black text-sm sm:text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xl ${
                  currentEvent
                    ? 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-space-950 shadow-cyan-500/30 animate-pulse'
                }`}
              >
                {currentEvent ? (
                  <>
                    <span>👆 ELIGE UNA OPCIÓN ARRIBA PARA CONTINUAR</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isSimulating
                        ? 'SIMULANDO SOL...'
                        : gameState.cycle === gameState.maxCycles
                        ? '🏆 SIMULAR ÚLTIMO SOL Y VER MI LEGADO'
                        : `SIMULAR SOL ${gameState.cycle} → PASAR AL SOL ${gameState.cycle + 1}`}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Last Sol Summary Strip (Like Copero's Season Summary Report) */}
            {gameState.lastSolSummary && (
              <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">
                    RESUMEN SOL {gameState.lastSolSummary.sol}
                  </span>
                  <span className="text-slate-300 font-sans text-xs">
                    {gameState.lastSolSummary.headline}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className={
                      gameState.lastSolSummary.batteryDelta >= 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    ⚡ {gameState.lastSolSummary.batteryDelta >= 0 ? '+' : ''}
                    {gameState.lastSolSummary.batteryDelta} kWh
                  </span>
                  <span
                    className={
                      gameState.lastSolSummary.waterDelta >= 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    💧 {gameState.lastSolSummary.waterDelta >= 0 ? '+' : ''}
                    {gameState.lastSolSummary.waterDelta}L
                  </span>
                  <span
                    className={
                      gameState.lastSolSummary.oxygenDelta >= 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    💨 {gameState.lastSolSummary.oxygenDelta >= 0 ? '+' : ''}
                    {gameState.lastSolSummary.oxygenDelta}kg
                  </span>
                </div>
              </div>
            )}

            {/* Live Trophy / Palmarés Bar (Copero Style) */}
            <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-2">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Trophy className="w-3.5 h-3.5" /> Medallas y Palmarés NASA Desbloqueados
                </span>
                <span>
                  {trophies.filter((t) => t.unlocked).length} / {trophies.length} Logros
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {trophies.map((t) => (
                  <div
                    key={t.id}
                    title={t.desc}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      t.unlocked
                        ? 'bg-amber-950/30 border-amber-400/50 text-amber-200 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-500 opacity-50'
                    }`}
                  >
                    <div className="text-base">{t.icon}</div>
                    <div className="text-[9px] font-heading font-bold truncate mt-0.5">
                      {t.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIONS & UPGRADES TAB (Entrenamientos y Mejoras de la Base) */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            <div className="bg-[#0d1428] border border-cyan-500/30 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-heading font-black text-white uppercase">
                    🛠️ Tienda de Mejoras y Acciones Inmediatas
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Usa tu presupuesto para recargar recursos o subir el nivel de tu base sin gastar el turno.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-400/40 font-mono text-xs text-amber-300 font-bold">
                  Disponible: ${gameState.mainResources.credits}k
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MISSION_ACTIONS.map((action) => {
                  const canAfford = gameState.mainResources.credits >= action.costCredits;
                  const hasBattery =
                    action.energyCostKw === 0 ||
                    gameState.subResources.batteryStorageCurrent >= action.energyCostKw;
                  const canRun = canAfford && hasBattery;

                  return (
                    <div
                      key={action.id}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
                        canRun
                          ? 'bg-[#121c38] border-slate-700 hover:border-cyan-400/60'
                          : 'bg-[#090e1c] border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-heading font-black text-white">
                            {action.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
                            -${action.costCredits}k
                          </span>
                        </div>
                        <p className="text-xs text-emerald-300 font-sans leading-snug">
                          ✓ {action.expectedBenefit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400">
                          {action.energyCostKw > 0
                            ? `Requiere ${action.energyCostKw} kWh`
                            : 'Sin gasto eléctrico'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickAction(action)}
                          disabled={!canRun}
                          className={`px-3.5 py-1.5 rounded-xl font-heading font-black text-xs transition-all ${
                            canRun
                              ? 'bg-cyan-400 hover:bg-cyan-300 text-space-950 active:scale-95 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canRun ? 'APLICAR AHORA' : 'NO DISPONIBLE'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COLONY & CREW VISUALIZER TAB */}
        {activeTab === 'colony' && (
          <div className="space-y-3">
            {/* Crew Roster Cards (Like Copero Squad Status) */}
            <div className="bg-[#0d1428] border border-cyan-500/30 rounded-2xl p-4">
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-cyan-300 mb-2.5">
                👨‍🚀 Estado de tu Escuadrón ({aliveCrew}/4 Astronautas Activos)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gameState.crew.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-[#080d1a] border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-heading font-bold text-white">
                        {member.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{member.role}</div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div
                        className={
                          member.health > 60
                            ? 'text-emerald-400 font-bold'
                            : member.health > 25
                            ? 'text-amber-400 font-bold'
                            : 'text-red-400 font-bold'
                        }
                      >
                        ❤️ {member.health}%
                      </div>
                      <div className="text-[10px] text-cyan-300">😊 Moral {member.morale}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ColonyVisualizer
              facilities={gameState.facilities}
              planet={gameState.planet}
              policy={gameState.policy}
              onOpenSTEMConcept={() => setShowSTEM(true)}
            />
          </div>
        )}
      </main>

      {/* 3. BOTTOM FOOTER */}
      <footer className="p-2.5 border-t border-slate-800/80 bg-[#070b16] text-center text-[10px] font-mono text-slate-500">
        MARS-1 Simulator • Modo Carrera Intuitivo • Sobrevive de 5 a 60 Soles con ingeniería real de la NASA
      </footer>

      {/* STEM Learning Center Modal */}
      {showSTEM && <STEMLearningCenter onClose={() => setShowSTEM(false)} />}

      {/* History Telemetry Modal */}
      {showHistory && (
        <HistoryTelemetryModal history={gameState.history} onClose={() => setShowHistory(false)} />
      )}

      {/* How to play guide */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
export default App;
