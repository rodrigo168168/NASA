import { GameState, MissionAction } from '../domain/types';

export const MISSION_ACTIONS: MissionAction[] = [
  {
    id: 'clean_solar_panels',
    name: 'Limpieza Electrostática de Paneles Solares',
    category: 'maintenance',
    costHours: 6,
    costKg: 2,
    energyCostKw: 15,
    executionCycles: 1,
    expectedBenefit: 'Restaura la eficiencia fotovoltaica al 100% y recupera la salud de los paneles.',
    risksAndConsequences: 'Consume energía del banco de baterías durante la operación de soplado y electroestática.',
    stemExplanation:
      'El polvo en Marte y la Luna es abrasivo y electrostático. Mediante ondas de choque electrodinámicas (EDS) se pueden expulsar las partículas cargadas sin desgastar mecánicamente el vidrio protector de las celdas solares.',
    apply: (state: GameState) => {
      const updatedArray = {
        ...state.facilities.solarArray,
        health: Math.min(100, state.facilities.solarArray.health + 20),
      };
      return {
        subResources: {
          ...state.subResources,
          solarEfficiency: 1.0,
          batteryStorageCurrent: Math.max(0, state.subResources.batteryStorageCurrent - 15),
        },
        facilities: {
          ...state.facilities,
          solarArray: updatedArray,
        },
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 2),
          crewHours: Math.max(0, state.mainResources.crewHours - 6),
        },
      };
    },
  },
  {
    id: 'upgrade_eclss_water',
    name: 'Mejora del Reactor Sabatier y Filtración Catalítica',
    category: 'upgrade',
    costHours: 16,
    costKg: 60,
    energyCostKw: 25,
    executionCycles: 1,
    expectedBenefit: 'Aumenta permanentemente la eficiencia de reciclaje de agua al 95% y genera +15 kg de O2 de reserva.',
    risksAndConsequences: 'Se lleva 60 kg de repuestos y dos días de trabajo de una persona; requiere calibración cuidadosa del lecho catalítico.',
    stemExplanation:
      'La recuperación de agua en la Estación Espacial Internacional (ISS) supera el 93% mediante descompresión al vacío y ósmosis inversa por etapas. En Marte, cada gota recuperada reduce la necesidad de minería criogénica intensiva.',
    apply: (state: GameState) => {
      const updatedEclss = {
        ...state.facilities.lifeSupport,
        level: state.facilities.lifeSupport.level + 1,
        health: 100,
        status: 'upgraded' as const,
      };
      return {
        subResources: {
          ...state.subResources,
          waterRecyclingEfficiency: Math.min(0.96, state.subResources.waterRecyclingEfficiency + 0.08),
          oxygenCurrent: Math.min(state.subResources.oxygenMax, state.subResources.oxygenCurrent + 15),
        },
        facilities: {
          ...state.facilities,
          lifeSupport: updatedEclss,
        },
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 60),
          crewHours: Math.max(0, state.mainResources.crewHours - 16),
        },
        stemDiscoveriesUnlocked: [...state.stemDiscoveriesUnlocked, 'Bucle Cerrado ECLSS Avanzado'],
      };
    },
  },
  {
    id: 'expand_aeroponics_greenhouse',
    name: 'Expansión de Invernadero Aeropónico Vertical',
    category: 'upgrade',
    costHours: 14,
    costKg: 50,
    energyCostKw: 30,
    executionCycles: 1,
    expectedBenefit: '+40% en producción de alimentos frescos y +1.5 kg O2 por ciclo mediante fotosíntesis biológica.',
    risksAndConsequences: 'Aumenta la demanda continua de energía en +10 kW para bombear nutrientes y luces LED espectrales.',
    stemExplanation:
      'La aeroponía nebuliza una solución de agua y sales minerales directamente sobre las raíces suspendidas de las plantas, consumiendo hasta un 95% menos agua que la agricultura terrestre tradicional y acelerando el ciclo vegetativo.',
    apply: (state: GameState) => {
      const updatedGreenhouse = {
        ...state.facilities.greenhouse,
        level: state.facilities.greenhouse.level + 1,
        energyDemand: state.facilities.greenhouse.energyDemand + 10,
        health: 100,
        status: 'upgraded' as const,
      };
      return {
        subResources: {
          ...state.subResources,
          foodCurrent: Math.min(state.subResources.foodMax, state.subResources.foodCurrent + 35),
        },
        facilities: {
          ...state.facilities,
          greenhouse: updatedGreenhouse,
        },
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 50),
          crewHours: Math.max(0, state.mainResources.crewHours - 14),
        },
        stemDiscoveriesUnlocked: [...state.stemDiscoveriesUnlocked, 'Cultivo Aeropónico Espacial'],
      };
    },
  },
  {
    id: 'sinter_regolith_radiation_shield',
    name: 'Sinterizado de Regolito y Bóveda Anti-Radiación',
    category: 'upgrade',
    costHours: 18,
    costKg: 10,
    energyCostKw: 45,
    executionCycles: 1,
    expectedBenefit: 'Aumenta la integridad del escudo al 100% y reduce la dosis ionizante por ciclo a la mitad.',
    risksAndConsequences: 'Elevado consumo eléctrico durante el proceso térmico por microondas in-situ.',
    stemExplanation:
      'El regolito contiene óxidos de silicio, aluminio e hierro que al calentarse por encima de 1100°C con microondas se fusionan formando ladrillos cerámicos ultrarresistentes capaces de frenar micrometeoritos y radiación cósmica galáctica.',
    apply: (state: GameState) => {
      const updatedShield = {
        ...state.facilities.radiationShield,
        level: state.facilities.radiationShield.level + 1,
        health: 100,
        status: 'upgraded' as const,
      };
      return {
        subResources: {
          ...state.subResources,
          shieldIntegrity: 100,
          batteryStorageCurrent: Math.max(0, state.subResources.batteryStorageCurrent - 45),
        },
        facilities: {
          ...state.facilities,
          radiationShield: updatedShield,
        },
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 10),
          crewHours: Math.max(0, state.mainResources.crewHours - 18),
        },
        stemDiscoveriesUnlocked: [...state.stemDiscoveriesUnlocked, 'Blindaje por Sinterizado de Regolito'],
      };
    },
  },
  {
    id: 'deploy_backup_generator',
    name: 'Ensamblar Generador Stirling / RTG de Respaldo',
    category: 'upgrade',
    costHours: 20,
    costKg: 120,
    energyCostKw: 0,
    executionCycles: 1,
    expectedBenefit: 'Proporciona +35 kW continuos de energía ininterrumpida de fondo (inmune a tormentas o noche).',
    risksAndConsequences: 'Se lleva 120 kg de repuestos, gran parte de lo que trajo la misión, y casi todas las horas de un sol.',
    stemExplanation:
      'Los convertidores Stirling avanzados (ASRG) utilizan el calor de decaimiento radiactivo para expandir y contraer gas helio, moviendo un pistón lineal con una eficiencia cuatro veces superior a los termopares convencionales.',
    apply: (state: GameState) => {
      return {
        subResources: {
          ...state.subResources,
          generatorBackupActive: true,
        },
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 120),
          crewHours: Math.max(0, state.mainResources.crewHours - 20),
        },
        stemDiscoveriesUnlocked: [...state.stemDiscoveriesUnlocked, 'Generación Stirling Espacial'],
      };
    },
  },
  {
    id: 'drill_subsurface_ice',
    name: 'Perforación y Extracción de Hielo Subterráneo',
    category: 'emergency',
    costHours: 12,
    costKg: 15,
    energyCostKw: 35,
    executionCycles: 1,
    expectedBenefit: '+70 Litros de agua purificada inyectados de inmediato en los tanques de la colonia.',
    risksAndConsequences: 'Estrés en la broca perforadora y consumo sustancial de batería.',
    stemExplanation:
      'La técnica ISRU (In-Situ Resource Utilization) evita el costo prohibitivo de lanzar agua desde la gravedad de la Tierra ($4,000+ por kg). Fundir hielo subterráneo permite auto-sustento perpetuo.',
    apply: (state: GameState) => {
      return {
        subResources: {
          ...state.subResources,
          waterCurrent: Math.min(state.subResources.waterMax, state.subResources.waterCurrent + 70),
          batteryStorageCurrent: Math.max(0, state.subResources.batteryStorageCurrent - 35),
        },
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 15),
          crewHours: Math.max(0, state.mainResources.crewHours - 12),
        },
      };
    },
  },
  {
    id: 'preventive_maintenance_overhaul',
    name: 'Mantenimiento Preventivo General de la Base',
    category: 'maintenance',
    costHours: 16,
    costKg: 30,
    energyCostKw: 10,
    executionCycles: 1,
    expectedBenefit: 'Restaura +20% de salud estructural a todos los módulos y sella micro-fisuras.',
    risksAndConsequences: 'Requiere lubricantes especiales y tiempo de trabajo de la tripulación.',
    stemExplanation:
      'El mantenimiento predictivo y preventivo previene el fenómeno de "fallo en cascada", donde la sobrecarga de un subsistema secundario termina derribando el bus de datos o la presurización primaria.',
    apply: (state: GameState) => {
      const nextFacilities = { ...state.facilities };
      for (const k of Object.keys(nextFacilities) as (keyof typeof nextFacilities)[]) {
        nextFacilities[k] = {
          ...nextFacilities[k],
          health: Math.min(100, nextFacilities[k].health + 20),
          status: nextFacilities[k].health + 20 >= 60 ? (nextFacilities[k].level > 1 ? 'upgraded' : 'operational') : 'damaged',
        };
      }
      return {
        facilities: nextFacilities,
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 30),
          crewHours: Math.max(0, state.mainResources.crewHours - 16),
        },
      };
    },
  },
  {
    id: 'ration_and_crew_telemetry_check',
    name: 'Protocolo de Racionamiento y Descanso Médico',
    category: 'emergency',
    costHours: 2,
    costKg: 0,
    energyCostKw: 0,
    executionCycles: 1,
    expectedBenefit: 'Reduce el consumo de alimentos en un 30% temporalmente y restaura +10% de salud a la tripulación.',
    risksAndConsequences: 'Leve caída de moral temporal (-8 puntos) debido al control estricto de carbohidratos.',
    stemExplanation:
      'El control de consumo calórico adaptativo permite prolongar la supervivencia sin inducir catabolismo muscular severo si se acompaña de suplementos electrolíticos y descanso programado.',
    apply: (state: GameState) => {
      const updatedCrew = state.crew.map((c) => ({
        ...c,
        health: Math.min(100, c.health + 10),
        morale: Math.max(10, c.morale - 8),
      }));
      return {
        crew: updatedCrew,
        mainResources: {
          ...state.mainResources,
          spareKg: Math.max(0, state.mainResources.spareKg - 0),
          crewHours: Math.max(0, state.mainResources.crewHours - 2),
        },
      };
    },
  },
];

