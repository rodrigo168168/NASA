import { PlanetScenario, ColonyFacilities, CrewMember } from './types';

// Authentic NASA/Aerospace Engineering Constants
export const NASA_ECLSS_METRICS = {
  // Baseline consumption per astronaut per sol / day
  OXYGEN_KG_PER_CREW_DAY: 0.84,
  WATER_L_PER_CREW_DAY: 2.50,
  FOOD_KG_PER_CREW_DAY: 0.62, // ~3000 kcal dehydrated meals

  // Baseline waste recovery rates
  BASELINE_WATER_RECYCLING_EFFICIENCY: 0.85, // 85% recovered via distillation & catalytic oxidation
  MAX_UPGRADED_WATER_RECYCLING: 0.98, // Advanced closed loop (ISS standard)

  // Atmospheric partial pressures (kPa)
  STANDARD_HABITAT_PRESSURE_KPA: 101.3,
  SAFE_MINIMUM_OXYGEN_KPA: 19.5,

  // Límite de carrera: NASA-STD-3001 Vol. 1 (actualizado en 2022), 600 mSv para todos los astronautas
  MAX_CAREER_RADIATION_MSV: 600,
  LETHAL_ACUTE_RADIATION_MSV: 1000,
  SOLAR_STORM_FLUX_SPIKE_MSV: 120, // Coronal Mass Ejection unshielded
  BACKGROUND_MARS_MSV_PER_CYCLE: 0.67,
  BACKGROUND_MOON_MSV_PER_CYCLE: 1.10,
};

export const INITIAL_FACILITIES: ColonyFacilities = {
  habitat: {
    id: 'habitat',
    name: 'Módulo de Hábitat Central (E-HAB)',
    description: 'Presurización, dormitorios, bahía médica y control ambiental para la tripulación.',
    status: 'operational',
    health: 100,
    level: 1,
    energyDemand: 35, // 35 kW baseline
  },
  solarArray: {
    id: 'solarArray',
    name: 'Granja Solar Fotovoltaica & Almacenamiento',
    description: 'Arreglos de perovskita/silicio con baterías de iones de litio y estado sólido.',
    status: 'operational',
    health: 100,
    level: 1,
    energyDemand: 5,
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Biolab e Invernadero Hidropónico',
    description: 'Cultivo de biomasa vegetal, lechugas, tubérculos y producción secundaria de O2.',
    status: 'operational',
    health: 95,
    level: 1,
    energyDemand: 25,
  },
  lifeSupport: {
    id: 'lifeSupport',
    name: 'Sistema de Soporte Vital Regenerativo (ECLSS)',
    description: 'Reciclador Sabatier de CO2, electrólisis de agua y procesador de orina.',
    status: 'operational',
    health: 98,
    level: 1,
    energyDemand: 30,
  },
  researchLab: {
    id: 'researchLab',
    name: 'Laboratorio de Geología y Astrobiología',
    description: 'Análisis de muestras de regolito, perforación de hielo subterráneo y manufactura in-situ.',
    status: 'operational',
    health: 100,
    level: 1,
    energyDemand: 20,
  },
  radiationShield: {
    id: 'radiationShield',
    name: 'Cúpula Deflectora & Refugio de Regolito',
    description: 'Bóveda compactada con regolito y bobinas de campo electromagnético activo.',
    status: 'operational',
    health: 95,
    level: 1,
    energyDemand: 15,
  },
};

export const INITIAL_CREW: CrewMember[] = [
  {
    id: 'c1',
    name: 'Dra. Elena Vance',
    role: 'Comandante & Especialista de Misión',
    health: 100,
    morale: 95,
    status: 'healthy',
  },
  {
    id: 'c2',
    name: 'Ing. Mateo Rossi',
    role: 'Jefe de Sistemas ECLSS y Energía',
    health: 98,
    morale: 90,
    status: 'healthy',
  },
  {
    id: 'c3',
    name: 'Dra. Amara Chen',
    role: 'Astrobióloga e Invernadero',
    health: 100,
    morale: 92,
    status: 'healthy',
  },
  {
    id: 'c4',
    name: 'Dr. Lucas Ortiz',
    role: 'Oficial Médico y Físico de Radiación',
    health: 96,
    morale: 88,
    status: 'healthy',
  },
];

export const PLANET_SCENARIOS: Record<'mars' | 'moon', PlanetScenario> = {
  mars: {
    id: 'mars',
    name: 'Marte — Cráter Jezero',
    subtitle: 'Atmósfera casi inexistente (0,6% de la presión terrestre) y tormentas de polvo que tapan el Sol.',
    gravity: 3.72,
    dayNightCycleDays: 1.02, // 1 sol = 24h 39m
    solarIrradianceBase: 590, // W/m^2 en la superficie
    radiationHazardLevel: 'Alta',
    dustStormRisk: true,
    extremeThermalSwings: false,
    description:
      'Marte posee una atmósfera tenue de CO2 (0.6% de la terrestre) y abundante regolito rico en percloratos. El mayor reto logístico radica en las tormentas estacionales de polvo que reducen drásticamente la irradiancia solar y desgastan las juntas mecánicas. La nave de reabastecimiento se retrasó 15 soles: arrancas con las reservas justas.',
    initialResources: {
      oxygen: 28, // kg
      water: 50, // Litros
      food: 14, // kg
      battery: 145, // kWh
    },
    stemFocus: 'Utilización de recursos in-situ (ISRU), reacción Sabatier y mitigación de polvo electrostático.',
  },
  moon: {
    id: 'moon',
    name: 'Luna — Borde del Cráter Shackleton',
    subtitle: 'Polo Sur lunar: luz casi perpetua en picos pero sombras gélidas y radiación pura.',
    gravity: 1.62,
    dayNightCycleDays: 28, // 14 días luz / 14 días oscuridad (salvo picos de luz eterna)
    solarIrradianceBase: 1361, // W/m^2 al no haber atmósfera
    radiationHazardLevel: 'Extrema',
    dustStormRisk: false,
    extremeThermalSwings: true,
    description:
      'Sin atmósfera ni magnetosfera, la Luna está directamente expuesta a rayos cósmicos galácticos (GCR) y micro-meteoritos continuos. Los picos del borde del cráter ofrecen luz solar casi constante, pero los contrastes térmicos van de +120°C a -130°C. La nave de reabastecimiento se retrasó 15 soles: arrancas con las reservas justas y el escudo se desgasta más rápido que en Marte.',
    initialResources: {
      oxygen: 27,
      water: 44,
      food: 14,
      battery: 150,
    },
    stemFocus: 'Blindaje térmico criogénico, protección por regolito sinterizado y gestión de energía en oscuridad.',
  },
};

