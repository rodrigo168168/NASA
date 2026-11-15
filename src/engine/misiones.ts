// Misiones con código, datos reales que cambian la partida y misiones históricas de entrenamiento.
//
// 1. DATOS REALES: la fuerza de la tormenta de polvo y de la tormenta solar sale de mediciones
//    publicadas por la NASA (guardadas acá para que el juego funcione sin internet).
// 2. CÓDIGO DE MISIÓN: el mismo código da los mismos eventos en el mismo orden, para comparar
//    puntajes dentro de un aula.
// 3. MISIONES HISTÓRICAS: situaciones reales muy difíciles, para entrenar como se entrena a los
//    astronautas: con los peores días que ya ocurrieron.

import { GameEvent, GameState, PlanetType } from '../domain/types';
import { GAME_EVENTS_DECK, pickNextCycleEvent } from './events';
import { advanceSimulationCycle, SimulationStepResult } from './simulationEngine';
import { crearGenerador, normalizarCodigo, semillaDeTexto } from './rng';

// ---------------------------------------------------------------------------
// 1. Datos reales de la NASA
// ---------------------------------------------------------------------------

/** Energía diaria del rover Opportunity mientras llegaba la tormenta de polvo de 2018 (Wh por sol). */
export const OPPORTUNITY_2018_WH = {
  antes: 645, // 3 de junio de 2018
  dia1: 345, // 4 de junio
  dia2: 133, // 6 de junio
  dia3: 22, // 10 de junio: última señal del rover
} as const;

/** Dosis que midió el instrumento RAD de Curiosity en la tormenta solar del 20 de mayo de 2024. */
export const CURIOSITY_X12_MICROGRAYS = 8100;

export interface DatoReal {
  /** Fracción de la energía solar que queda ese sol (1 = normal). */
  factorSolar?: number;
  /** Dosis extra de radiación de ese sol, antes de descontar el blindaje (mSv). */
  dosisExtraMsv?: number;
  /** Frase que se le muestra al estudiante. */
  resumen: string;
  fuente: string;
}

const FUENTE_OPPORTUNITY =
  'NASA JPL, informes de la misión Opportunity sobre la tormenta de polvo de junio de 2018';
const FUENTE_CURIOSITY = 'NASA, "NASA Watches Mars Light Up During Epic Solar Storm" (2024)';

const fraccion = (wh: number) => wh / OPPORTUNITY_2018_WH.antes;
const porciento = (f: number) => Math.round(f * 100);

export const DATOS_REALES_POR_EVENTO: Record<string, DatoReal> = {
  dust_storm_mars: {
    factorSolar: fraccion(OPPORTUNITY_2018_WH.dia1),
    resumen: `Este sol tus paneles rinden el ${porciento(fraccion(OPPORTUNITY_2018_WH.dia1))} %: es la caída real de Opportunity el primer día de la tormenta de 2018 (de ${OPPORTUNITY_2018_WH.antes} a ${OPPORTUNITY_2018_WH.dia1} Wh).`,
    fuente: FUENTE_OPPORTUNITY,
  },
  hist_opp_dia1: {
    factorSolar: fraccion(OPPORTUNITY_2018_WH.dia1),
    resumen: `Este sol tus paneles rinden el ${porciento(fraccion(OPPORTUNITY_2018_WH.dia1))} %: Opportunity pasó de ${OPPORTUNITY_2018_WH.antes} a ${OPPORTUNITY_2018_WH.dia1} Wh el 4 de junio de 2018.`,
    fuente: FUENTE_OPPORTUNITY,
  },
  hist_opp_dia2: {
    factorSolar: fraccion(OPPORTUNITY_2018_WH.dia2),
    resumen: `Este sol tus paneles rinden el ${porciento(fraccion(OPPORTUNITY_2018_WH.dia2))} %: el 6 de junio de 2018 Opportunity generó ${OPPORTUNITY_2018_WH.dia2} Wh.`,
    fuente: FUENTE_OPPORTUNITY,
  },
  hist_opp_dia3: {
    factorSolar: fraccion(OPPORTUNITY_2018_WH.dia3),
    resumen: `Este sol tus paneles rinden el ${porciento(fraccion(OPPORTUNITY_2018_WH.dia3))} %: el 10 de junio de 2018 Opportunity generó ${OPPORTUNITY_2018_WH.dia3} Wh y envió su última señal.`,
    fuente: FUENTE_OPPORTUNITY,
  },
  solar_flare_lunar: {
    // 8.100 micrograys = 8,1 miligrays. Se toma 1 a 1 como milisieverts (aproximación didáctica).
    dosisExtraMsv: CURIOSITY_X12_MICROGRAYS / 1000,
    resumen: `Este sol llega una dosis extra de hasta ${(CURIOSITY_X12_MICROGRAYS / 1000).toLocaleString('es')} mSv, la que midió Curiosity el 20 de mayo de 2024. Cuanto mejor esté tu blindaje, menos pasa.`,
    fuente: FUENTE_CURIOSITY,
  },
};

export function datoRealDelEvento(eventId?: string | null): DatoReal | undefined {
  return eventId ? DATOS_REALES_POR_EVENTO[eventId] : undefined;
}

/**
 * Simula un sol aplicando el dato real del evento que tocó.
 * Sin dato real hace exactamente lo mismo que el motor de siempre.
 */
/**
 * Avanza un sol: aplica el dato real del evento y, cada ${SOLES_ENTRE_NAVES} soles, la nave de carga.
 */
export function avanzarSolConDatosReales(state: GameState): SimulationStepResult {
  const resultado = avanzarConDato(state);
  const { nextState } = resultado;
  if (!tocaNave(nextState)) return resultado;
  return {
    ...resultado,
    nextState: reabastecer(nextState),
    // El aviso va primero: la pantalla muestra el primero de la lista.
    warnings: [AVISO_NAVE, ...resultado.warnings],
  };
}

function avanzarConDato(state: GameState): SimulationStepResult {
  const dato = datoRealDelEvento(state.currentEventId);
  if (!dato) return advanceSimulationCycle(state);

  const eficienciaBase = state.subResources.solarEfficiency;
  const entrada: GameState =
    dato.factorSolar !== undefined
      ? {
          ...state,
          subResources: {
            ...state.subResources,
            solarEfficiency: eficienciaBase * dato.factorSolar,
          },
        }
      : state;

  const resultado = advanceSimulationCycle(entrada);
  let nextState = resultado.nextState;
  const warnings = [...resultado.warnings];

  if (dato.factorSolar !== undefined) {
    // La tormenta pasa: los paneles vuelven a su rendimiento de antes.
    nextState = {
      ...nextState,
      subResources: { ...nextState.subResources, solarEfficiency: eficienciaBase },
    };
    warnings.push(
      `DATO REAL NASA: los paneles rindieron el ${porciento(dato.factorSolar)} % por el polvo.`
    );
  }

  if (dato.dosisExtraMsv !== undefined) {
    const bonoBlindaje = state.policy === 'FULL_SHIELD' ? 0.35 : 0;
    const blindaje = Math.min(1, state.subResources.shieldIntegrity / 100 + bonoBlindaje);
    const dosis = Math.round(dato.dosisExtraMsv * (1 - blindaje * 0.88) * 100) / 100;
    nextState = {
      ...nextState,
      subResources: {
        ...nextState.subResources,
        radiationExposureAccumulated:
          Math.round((nextState.subResources.radiationExposureAccumulated + dosis) * 100) / 100,
      },
    };
    warnings.push(
      `DATO REAL NASA: la tormenta solar sumó ${dosis.toLocaleString('es')} mSv a la tripulación (el blindaje frenó el resto).`
    );
  }

  return { ...resultado, nextState, warnings };
}

// ---------------------------------------------------------------------------
// 3. Eventos de las misiones históricas
// ---------------------------------------------------------------------------

export const EVENTOS_HISTORICOS: GameEvent[] = [
  // ---- Opportunity, junio de 2018 ----
  {
    id: 'hist_opp_dia1',
    title: 'Opportunity 2018 — Día 1: el cielo se oscurece',
    severity: 'alta',
    type: 'emergency',
    description:
      'Una tormenta de polvo que nació a miles de kilómetros ya cubre tu base. En un solo día la energía de los paneles cae casi a la mitad, igual que le pasó al rover Opportunity.',
    applicablePlanets: ['mars'],
    iconName: 'Wind',
    stemExplanation:
      'HECHO REAL: el 4 de junio de 2018 la energía del rover Opportunity bajó de 645 a 345 Wh en un día. En Marte no llueve: el polvo fino queda flotando semanas y tapa el Sol. (Fuente: NASA JPL, misión Opportunity.)',
    choices: [
      {
        id: 'opt_opp1_generadores',
        text: 'Encender los generadores auxiliares',
        costCredits: 250,
        description: 'Gastas presupuesto y combustible, pero la batería recibe carga hoy.',
        consequences: {
          creditsDelta: -250,
          batteryDelta: 80,
          customMessage: 'Los generadores sostienen la base mientras el polvo tapa el Sol.',
        },
        stemLesson:
          'Una base que depende solo del Sol necesita una segunda fuente. Los rovers Curiosity y Perseverance usan un generador nuclear (RTG) justamente por esto.',
      },
      {
        id: 'opt_opp1_ahorro',
        text: 'Apagar todo lo que no sea vital',
        description: 'No cuesta créditos, pero el invernadero y la tripulación lo sienten.',
        consequences: {
          batteryDelta: 40,
          foodDelta: -2,
          crewMoraleDelta: -8,
          customMessage: 'Base en mínimo consumo: se ahorra energía, se pierde cosecha.',
        },
        stemLesson:
          'Opportunity hizo lo mismo: apagó instrumentos para guardar energía. Ahorrar es gratis, pero tiene un costo en comida y ánimo.',
      },
    ],
  },
  {
    id: 'hist_opp_dia2',
    title: 'Opportunity 2018 — Día 2: casi de noche a mediodía',
    severity: 'critica',
    type: 'emergency',
    description:
      'El polvo es tan denso que al mediodía parece de noche. Los paneles entregan apenas la quinta parte de lo normal.',
    applicablePlanets: ['mars'],
    iconName: 'Wind',
    stemExplanation:
      'HECHO REAL: el 6 de junio de 2018 Opportunity generó solo 133 Wh. La opacidad de la atmósfera (Tau) llegó a 10,8, la más alta medida desde la superficie de Marte. (Fuente: NASA JPL, misión Opportunity.)',
    choices: [
      {
        id: 'opt_opp2_limpiar',
        text: 'Salir a limpiar los paneles a mano',
        description: 'Recuperas algo de energía, pero la tripulación sale en plena tormenta.',
        consequences: {
          batteryDelta: 50,
          crewHealthDelta: -6,
          customMessage: 'Paneles limpios por unas horas. La salida desgastó a la tripulación.',
        },
        stemLesson:
          'Un rover no puede limpiarse solo: dependía de que el viento barriera sus paneles. Una tripulación sí puede, y esa es una ventaja real de las misiones con personas.',
      },
      {
        id: 'opt_opp2_generadores',
        text: 'Encender los generadores auxiliares',
        costCredits: 250,
        description: 'Carga segura para hoy a cambio de presupuesto.',
        consequences: {
          creditsDelta: -250,
          batteryDelta: 80,
          customMessage: 'Los generadores cubren el día más oscuro.',
        },
        stemLesson:
          'El presupuesto también es un recurso de la misión: lo que gastas hoy no lo tendrás para la próxima emergencia.',
      },
    ],
  },
  {
    id: 'hist_opp_dia3',
    title: 'Opportunity 2018 — Día 3: la última señal',
    severity: 'critica',
    type: 'emergency',
    description:
      'Hoy los paneles no dan casi nada. Fue el día en que Opportunity envió su última señal a la Tierra. Tu base tiene que llegar a mañana.',
    applicablePlanets: ['mars'],
    iconName: 'Zap',
    stemExplanation:
      'HECHO REAL: el 10 de junio de 2018 Opportunity generó 22 Wh, entró en modo de falla por baja energía y dejó solo su reloj encendido. Nunca volvió a responder: la NASA cerró la misión en febrero de 2019, tras casi 15 años de trabajo de un rover diseñado para 90 días. (Fuente: NASA Science, misión Opportunity.)',
    choices: [
      {
        id: 'opt_opp3_hibernar',
        text: 'Hibernar la base: solo aire y reloj',
        description: 'Todo apagado menos lo que mantiene viva a la tripulación.',
        consequences: {
          batteryDelta: 60,
          oxygenDelta: -3,
          crewMoraleDelta: -12,
          customMessage: 'Base hibernando. Frío, oscuridad y silencio, pero la batería aguanta.',
        },
        stemLesson:
          'El modo de falla por baja energía existe en las naves reales: apagar casi todo para que lo esencial siga vivo hasta que vuelva el Sol.',
      },
      {
        id: 'opt_opp3_generadores',
        text: 'Encender los generadores auxiliares',
        costCredits: 250,
        description: 'Si todavía te queda presupuesto, es el día para usarlo.',
        consequences: {
          creditsDelta: -250,
          batteryDelta: 80,
          customMessage: 'Los generadores te llevan hasta el final de la tormenta.',
        },
        stemLesson:
          'Guardar una reserva para el peor día es lo que separa una misión que sobrevive de una que se apaga.',
      },
    ],
  },

  // ---- Apolo 13, abril de 1970 ----
  {
    id: 'hist_a13_explosion',
    title: 'Apolo 13 — "Houston, hemos tenido un problema"',
    severity: 'critica',
    type: 'emergency',
    description:
      'Un tanque de oxígeno acaba de explotar. Pierdes la mitad de la reserva de oxígeno y parte de la energía. No hay vuelta atrás: hay que decidir en minutos.',
    applicablePlanets: ['moon'],
    iconName: 'AlertTriangle',
    stemExplanation:
      'HECHO REAL: el 13 de abril de 1970, a las 55 horas y 55 minutos de vuelo y a unos 322.000 km de la Tierra, explotó el tanque de oxígeno n.º 2 del Apolo 13. La nave perdió su oxígeno y sus celdas de combustible, que daban electricidad y agua. Los tres astronautas usaron el módulo lunar como bote salvavidas. (Fuente: NASA, "Apollo 13: Mission Details".)',
    choices: [
      {
        id: 'opt_a13_cerrar',
        text: 'Cerrar las válvulas y pasar al módulo refugio',
        description: 'Das por perdido el tanque y salvas lo que queda.',
        consequences: {
          oxygenDelta: -13,
          batteryDelta: -60,
          crewMoraleDelta: -10,
          customMessage: 'Fuga aislada. Perdiste medio oxígeno, pero lo que queda está a salvo.',
        },
        stemLesson:
          'Aceptar una pérdida a tiempo evita perderlo todo. La tripulación real abandonó el módulo de mando y lo dejó apagado para poder usarlo en el regreso.',
      },
      {
        id: 'opt_a13_salvar',
        text: 'Intentar salvar el tanque dañado',
        costCredits: 100,
        description: 'Gastas menos energía, pero el oxígeno sigue escapando mientras lo intentas.',
        consequences: {
          oxygenDelta: -18,
          batteryDelta: -40,
          creditsDelta: -100,
          customMessage: 'El tanque no se pudo salvar y se escapó más oxígeno en el intento.',
        },
        stemLesson:
          'En una emergencia el tiempo también se gasta. Cada minuto dudando fue oxígeno que se fue al espacio.',
      },
    ],
  },
  {
    id: 'hist_a13_energia',
    title: 'Apolo 13 — Sobrevivir con casi nada de energía',
    severity: 'alta',
    type: 'emergency',
    description:
      'La energía que queda no alcanza para todo. O apagas casi todo y pasas frío, o mantienes la calefacción y gastas batería que vas a necesitar.',
    applicablePlanets: ['moon'],
    iconName: 'Zap',
    stemExplanation:
      'HECHO REAL: para que las baterías duraran los cuatro días del regreso, la tripulación del Apolo 13 apagó casi todos los sistemas. La cabina bajó a unos 3 °C y se llenó de humedad condensada. (Fuente: NASA, "Apollo 13: Mission Details".)',
    choices: [
      {
        id: 'opt_a13_apagar',
        text: 'Apagar casi todo: cabina a 3 °C',
        description: 'Guardas batería a costa de la salud y el ánimo.',
        consequences: {
          batteryDelta: 50,
          crewHealthDelta: -8,
          crewMoraleDelta: -8,
          customMessage: 'La base se enfría, pero la batería alcanza para más soles.',
        },
        stemLesson:
          'La energía es el recurso que sostiene a todos los demás. Sin electricidad no hay aire limpio, ni agua, ni comunicación.',
      },
      {
        id: 'opt_a13_calefaccion',
        text: 'Mantener la calefacción encendida',
        description: 'La tripulación descansa mejor, pero la batería baja.',
        consequences: {
          batteryDelta: -50,
          crewMoraleDelta: 5,
          customMessage: 'Cabina tibia y tripulación animada. La batería quedó más corta.',
        },
        stemLesson:
          'El bienestar de la tripulación importa, pero en una emergencia cada comodidad se paga con reservas.',
      },
    ],
  },
  {
    id: 'hist_a13_co2',
    title: 'Apolo 13 — El filtro cuadrado en el agujero redondo',
    severity: 'critica',
    type: 'malfunction',
    description:
      'El aire se está cargando de dióxido de carbono. Tienes filtros de repuesto, pero son de otra forma y no entran en el sistema del refugio.',
    applicablePlanets: ['moon'],
    iconName: 'HeartPulse',
    stemExplanation:
      'HECHO REAL: los filtros de CO2 del módulo de mando eran cuadrados y los del módulo lunar, redondos. Ingenieros en Tierra diseñaron en horas un adaptador con lo que había a bordo: bolsas de plástico, tapas de cartón del plan de vuelo, una manguera de traje y cinta adhesiva. Funcionó. (Fuente: NASA, "Apollo 13: Mission Details".)',
    choices: [
      {
        id: 'opt_a13_adaptador',
        text: 'Fabricar un adaptador con lo que hay a bordo',
        description: 'Ingenio en vez de repuestos: bolsas, cartón, manguera y cinta.',
        consequences: {
          oxygenDelta: 5,
          crewMoraleDelta: 12,
          customMessage: 'El adaptador improvisado funciona: el aire vuelve a ser respirable.',
        },
        stemLesson:
          'La ingeniería no es tener la pieza perfecta: es resolver el problema con lo que hay. Por eso los astronautas entrenan a improvisar.',
      },
      {
        id: 'opt_a13_esperar',
        text: 'Esperar a que el sistema aguante',
        description: 'No haces nada y confías en los filtros que quedan.',
        consequences: {
          oxygenDelta: -4,
          crewHealthDelta: -18,
          customMessage: 'El CO2 subió: dolor de cabeza, mareos y una tripulación debilitada.',
        },
        stemLesson:
          'El dióxido de carbono que exhalamos es veneno en un espacio cerrado. Si no se filtra, enferma antes de que falte el oxígeno.',
      },
    ],
  },
  {
    id: 'hist_a13_agua',
    title: 'Apolo 13 — Un vaso de agua por día',
    severity: 'alta',
    type: 'emergency',
    description:
      'Sin las celdas de combustible ya no se produce agua. Hay que decidir cuánto toma cada persona hasta que termine la emergencia.',
    applicablePlanets: ['moon'],
    iconName: 'Droplets',
    stemExplanation:
      'HECHO REAL: la tripulación del Apolo 13 racionó el agua a unos 0,2 litros por persona al día, la quinta parte de lo normal. Los tres volvieron deshidratados y entre todos perdieron unos 14 kilos. (Fuente: NASA, "Apollo 13: Mission Details".)',
    choices: [
      {
        id: 'opt_a13_racionar',
        text: 'Racionar: 0,2 litros por persona al día',
        description: 'Guardas agua, pero la tripulación se deshidrata.',
        consequences: {
          waterDelta: 10,
          crewHealthDelta: -6,
          customMessage: 'El agua alcanza. La tripulación está sedienta pero viva.',
        },
        stemLesson:
          'Racionar es repartir la escasez en el tiempo. Duele hoy para que mañana siga habiendo.',
      },
      {
        id: 'opt_a13_normal',
        text: 'Mantener el consumo normal',
        description: 'La tripulación se siente mejor, pero la reserva baja rápido.',
        consequences: {
          waterDelta: -15,
          crewMoraleDelta: 5,
          customMessage: 'Nadie pasó sed hoy. La reserva de agua quedó mucho más baja.',
        },
        stemLesson:
          'Consumir como si no pasara nada es la forma más rápida de que una emergencia se vuelva una tragedia.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Misiones históricas
// ---------------------------------------------------------------------------

export interface MisionHistorica {
  id: string;
  nombre: string;
  anio: number;
  planetId: PlanetType;
  /** Una línea para la tarjeta de la pantalla de inicio. */
  resumen: string;
  /** Qué pasó de verdad. */
  hechoReal: string;
  fuente: string;
  /** En qué sol aparece cada evento de la misión. Los demás soles salen del mazo, siempre igual. */
  eventosPorSol: Record<number, string>;
}

export const MISIONES_HISTORICAS: MisionHistorica[] = [
  {
    id: 'opportunity_2018',
    nombre: 'Opportunity: la tormenta que apagó un rover',
    anio: 2018,
    planetId: 'mars',
    resumen: 'Tres soles seguidos casi sin Sol. La energía cae como cayó de verdad.',
    hechoReal:
      'En junio de 2018 una tormenta de polvo cubrió todo Marte. La energía del rover Opportunity cayó de 645 a 22 Wh en una semana y nunca volvió a responder.',
    fuente: FUENTE_OPPORTUNITY,
    eventosPorSol: { 3: 'hist_opp_dia1', 4: 'hist_opp_dia2', 5: 'hist_opp_dia3' },
  },
  {
    id: 'apolo_13',
    nombre: 'Apolo 13: el fracaso más exitoso',
    anio: 1970,
    planetId: 'moon',
    resumen: 'Explota un tanque de oxígeno. Sin aire, sin energía y sin agua de sobra.',
    hechoReal:
      'En abril de 1970 explotó un tanque de oxígeno del Apolo 13 a 322.000 km de la Tierra. Con ingenio y racionando todo, los tres astronautas volvieron vivos.',
    fuente: 'NASA, "Apollo 13: Mission Details"',
    eventosPorSol: {
      2: 'hist_a13_explosion',
      3: 'hist_a13_energia',
      4: 'hist_a13_co2',
      5: 'hist_a13_agua',
    },
  },
];

export function buscarMision(id?: string | null): MisionHistorica | undefined {
  return id ? MISIONES_HISTORICAS.find((m) => m.id === id) : undefined;
}

function buscarEvento(id: string): GameEvent | undefined {
  return EVENTOS_HISTORICOS.find((e) => e.id === id) || GAME_EVENTS_DECK.find((e) => e.id === id);
}

// ---------------------------------------------------------------------------
// 2. Programa de eventos con semilla
// ---------------------------------------------------------------------------

/**
 * Arma los eventos de toda la partida, sol por sol, a partir de un texto.
 * El mismo texto y el mismo destino dan siempre el mismo programa.
 */
export function programaDeEventos(
  semilla: string,
  planetId: PlanetType,
  maxCycles: number,
  fijos: Record<number, string> = {}
): GameEvent[] {
  const rng = crearGenerador(semillaDeTexto(`${semilla}|${planetId}`));
  const recientes: string[] = ['sol1_initial_deployment'];
  const programa: GameEvent[] = [];
  for (let sol = 1; sol <= maxCycles; sol++) {
    const fijo = fijos[sol] ? buscarEvento(fijos[sol]) : undefined;
    const evento = fijo || pickNextCycleEvent(sol, planetId, recientes.slice(-5), rng);
    programa.push(evento);
    recientes.push(evento.id);
  }
  return programa;
}

// ---------------------------------------------------------------------------
// La misión se abastece según su duración, como en la realidad:
// una salida corta lleva menos carga, y a una estadía larga le llega una nave de carga
// cada cierto tiempo (a la Estación Espacial le llegan varias por año).
// ---------------------------------------------------------------------------

/** Cada cuántos soles llega una nave de carga. */
export const SOLES_ENTRE_NAVES = 15;

export const AVISO_NAVE =
  'LLEGÓ LA NAVE DE CARGA con el relevo: agua, comida, oxígeno, repuestos y tripulación descansada (su dosis de radiación arranca de cero).';

/** Lo que trae cada nave, como proporción de las reservas con las que arranca el destino. */
export const CARGA_NAVE = { consumibles: 1.0, creditos: 350, repuestos: 40, blindaje: 20, salud: 25, moral: 20 };

/**
 * Parte de las reservas normales con la que se sale: una misión de menos de 15 soles
 * lleva menos carga (nadie manda 15 soles de comida a una salida de 5).
 */
export function factorDeReservas(soles: number): number {
  if (soles >= SOLES_ENTRE_NAVES) return 1;
  return Math.round((0.55 + (0.45 * soles) / SOLES_ENTRE_NAVES) * 100) / 100;
}

/** ¿Empieza un tramo nuevo (sol 16, 31, 46…) en una partida que sigue en juego? */
export function tocaNave(state: GameState): boolean {
  return state.status === 'playing' && state.cycle > 1 && (state.cycle - 1) % SOLES_ENTRE_NAVES === 0;
}

/** Descarga la nave: repone consumibles, repuestos para los módulos y parches para el blindaje. */
export function reabastecer(state: GameState): GameState {
  const s = state.subResources;
  const ini = state.planet.initialResources;
  const k = CARGA_NAVE.consumibles;
  const facilities = { ...state.facilities };
  for (const clave of Object.keys(facilities) as (keyof typeof facilities)[]) {
    const modulo = facilities[clave];
    const health = Math.min(100, modulo.health + CARGA_NAVE.repuestos);
    facilities[clave] = {
      ...modulo,
      health,
      status: health <= 25 ? 'critical' : health <= 60 ? 'damaged' : modulo.level > 1 ? 'upgraded' : 'operational',
    };
  }
  return {
    ...state,
    facilities,
    // Relevo de tripulación: las agencias rotan al equipo para no pasar el límite de dosis.
    crew: state.crew.map((m) =>
      m.health > 0
        ? { ...m, health: Math.min(100, m.health + CARGA_NAVE.salud), morale: Math.min(100, m.morale + CARGA_NAVE.moral) }
        : m,
    ),
    subResources: {
      ...s,
      radiationExposureAccumulated: 0,
      oxygenCurrent: Math.min(s.oxygenMax, Math.round((s.oxygenCurrent + ini.oxygen * k) * 10) / 10),
      waterCurrent: Math.min(s.waterMax, Math.round((s.waterCurrent + ini.water * k) * 10) / 10),
      foodCurrent: Math.min(s.foodMax, Math.round((s.foodCurrent + ini.food * k) * 10) / 10),
      shieldIntegrity: Math.min(100, s.shieldIntegrity + CARGA_NAVE.blindaje),
    },
    mainResources: {
      ...state.mainResources,
      credits: state.mainResources.credits + CARGA_NAVE.creditos,
    },
  };
}

/** Duraciones que se ofrecen como botón; también se puede escribir otra. */
export const DURACIONES = [5, 10, 15, 20, 30];
export const SOLES_MIN = 5;
export const SOLES_MAX = 60;

/** Deja la duración pedida como un número entero de soles dentro de lo permitido (15 si no hay). */
export function normalizarSoles(soles?: number): number {
  if (soles === undefined || !Number.isFinite(soles)) return 15;
  return Math.max(SOLES_MIN, Math.min(SOLES_MAX, Math.round(soles)));
}

export interface DatosDePartida {
  cycle: number;
  planetId: PlanetType;
  maxCycles: number;
  missionCode?: string;
  historicalMissionId?: string;
}

/**
 * Evento que toca en un sol. Con misión histórica o con código, sale de un programa fijo;
 * en una partida libre, del mazo al azar como siempre.
 */
export function eventoDelSol(partida: DatosDePartida, recentEventIds: string[]): GameEvent {
  const mision = buscarMision(partida.historicalMissionId);
  const codigo = partida.missionCode ? normalizarCodigo(partida.missionCode) : '';
  let evento: GameEvent;
  if (mision || codigo) {
    const semilla = mision ? `${mision.id}|${codigo}` : codigo;
    const programa = programaDeEventos(
      semilla,
      partida.planetId,
      Math.max(partida.maxCycles, partida.cycle),
      mision?.eventosPorSol
    );
    evento = programa[partida.cycle - 1];
  } else {
    evento = pickNextCycleEvent(partida.cycle, partida.planetId, recentEventIds);
  }
  return conDatoReal(evento);
}

/** Le agrega al evento la frase que explica cómo el dato real cambia este sol. */
export function conDatoReal(evento: GameEvent): GameEvent {
  const dato = datoRealDelEvento(evento.id);
  if (!dato || evento.stemExplanation.includes('EN ESTA PARTIDA')) return evento;
  return {
    ...evento,
    stemExplanation: `${evento.stemExplanation} EN ESTA PARTIDA: ${dato.resumen}`,
  };
}
