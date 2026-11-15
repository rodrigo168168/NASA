/**
 * Fuentes de los números y de los hechos reales que usa el simulador.
 * Los datos y las fotos viven dentro del proyecto: el juego no necesita internet para mostrarlos.
 * Los enlaces se comprobaron el 15/11/2026.
 */

export interface DataSource {
  id: string;
  /** Qué dato del juego respalda */
  gameValue: string;
  /** Qué dice la fuente, en palabras simples */
  fact: string;
  /** Dónde se usa dentro del juego */
  usedIn: string;
  sourceName: string;
  url: string;
}

/** Foto real de la biblioteca de imágenes de la NASA (images.nasa.gov), guardada en public/nasa */
export interface NasaImage {
  /** Identificador en images.nasa.gov */
  nasaId: string;
  /** Archivo dentro de public/nasa */
  file: string;
  caption: string;
  credit: string;
}

export interface RealEvent {
  id: string;
  date: string;
  title: string;
  whatHappened: string;
  inTheGame: string;
  sourceName: string;
  url: string;
  images: NasaImage[];
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'oxygen',
    gameValue: '0,84 kg de oxígeno por astronauta por día',
    fact: 'Es el consumo metabólico de referencia que la NASA usa para diseñar el soporte vital (ECLSS) de la Estación Espacial Internacional.',
    usedIn: 'Consumo de oxígeno de la tripulación en cada sol.',
    sourceName: 'NASA — Environmental Control and Life Support Systems (ECLSS)',
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
  },
  {
    id: 'water',
    gameValue: 'Reciclaje de agua del 85% al 98%',
    fact: 'En 2023 la Estación Espacial Internacional alcanzó el 98% de recuperación de agua, el umbral que hace falta para viajar a Marte.',
    usedIn: 'Eficiencia del ECLSS y la mejora del reactor Sabatier.',
    sourceName: 'NASA — Water Recovery Milestone on the International Space Station',
    url: 'https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/',
  },
  {
    id: 'radiation_mars',
    gameValue: '0,67 mSv por día en la superficie de Marte',
    fact: 'Lo midió el instrumento RAD del rover Curiosity en el cráter Gale (Hassler y otros, revista Science, 2014).',
    usedIn: 'Radiación de fondo de cada sol en Marte.',
    sourceName: 'NASA — Curiosity (Mars Science Laboratory)',
    url: 'https://science.nasa.gov/mission/msl-curiosity/',
  },
  {
    id: 'radiation_limit',
    gameValue: '600 mSv de límite para toda la carrera de un astronauta',
    fact: 'Es el límite del estándar NASA-STD-3001, actualizado en 2022: el mismo para todos los astronautas, sin importar edad ni sexo.',
    usedIn: 'Referencia para la dosis acumulada de la tripulación.',
    sourceName: 'NASA — Human Spaceflight Standards (NASA-STD-3001)',
    url: 'https://www.nasa.gov/directorates/esdmd/hhp/human-spaceflight-and-aviation-standards/',
  },
  {
    id: 'radiation_space',
    gameValue: 'Sin campo magnético, el blindaje es la única defensa',
    fact: 'Ni la Luna ni Marte tienen un campo magnético global como el de la Tierra. La NASA estudia cubrir los hábitats con regolito o agua.',
    usedIn: 'Desgaste del escudo y daño a la tripulación cuando baja del 50%.',
    sourceName: 'NASA — Space Radiation',
    url: 'https://www.nasa.gov/humans-in-space/space-radiation/',
  },
  {
    id: 'mars_atmosphere',
    gameValue: 'Atmósfera de Marte: menos del 1% de la presión terrestre',
    fact: 'La atmósfera marciana es muy tenue y casi toda de dióxido de carbono; aun así levanta tormentas de polvo que cubren el planeta entero.',
    usedIn: 'Escenario de Marte y evento de tormenta de polvo.',
    sourceName: 'NASA Science — Mars Facts',
    url: 'https://science.nasa.gov/mars/facts/',
  },
  {
    id: 'jezero',
    gameValue: 'Cráter Jezero, Marte',
    fact: 'Es el lugar donde aterrizó el rover Perseverance en febrero de 2021: el delta de un antiguo lago.',
    usedIn: 'Ubicación del puesto de avanzada marciano.',
    sourceName: 'NASA Science — Mars 2020 Perseverance',
    url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
  },
  {
    id: 'shackleton',
    gameValue: 'Polo sur lunar, borde del cráter Shackleton',
    fact: 'Es la región que el programa Artemis eligió para volver a la Luna: tiene picos con luz casi permanente y cráteres en sombra con hielo de agua.',
    usedIn: 'Ubicación del puesto de avanzada lunar.',
    sourceName: 'NASA — Artemis',
    url: 'https://www.nasa.gov/humans-in-space/artemis/',
  },
];

export const REAL_EVENTS: RealEvent[] = [
  {
    id: 'opportunity_2018',
    date: '10 de junio de 2018',
    title: 'La tormenta de polvo que apagó al rover Opportunity',
    whatHappened:
      'Una tormenta de polvo cubrió todo Marte y tapó el Sol. Opportunity, que funcionaba con paneles solares, envió su última señal el 10 de junio de 2018 y nunca volvió a responder. Había trabajado casi 15 años.',
    inTheGame:
      'Evento "Tormenta Global de Polvo Marciano": si la batería llega a cero, el soporte vital cae al 30% y el invernadero se apaga.',
    sourceName: 'NASA Science — Mars Exploration Rover Opportunity',
    url: 'https://science.nasa.gov/mission/mer-opportunity/',
    images: [
      {
        nasaId: 'PIA22329',
        file: 'PIA22329.jpg',
        caption:
          'Mapa de todo Marte del 6 de junio de 2018, tomado desde la órbita por la sonda Mars Reconnaissance Orbiter. La mancha clara es la tormenta; el punto azul es Opportunity.',
        credit: 'NASA/JPL-Caltech/MSSS',
      },
      {
        nasaId: 'PIA22521',
        file: 'PIA22521.jpg',
        caption:
          'Así se fue apagando el cielo para Opportunity: de un mediodía normal (izquierda) a un Sol que apenas se ve (derecha). Es una simulación hecha con sus mediciones.',
        credit: 'NASA/JPL-Caltech/TAMU',
      },
    ],
  },
  {
    id: 'solar_storm_2024',
    date: '20 de mayo de 2024',
    title: 'La tormenta solar más fuerte medida en Marte',
    whatHappened:
      'Una fulguración solar de clase X12 alcanzó Marte. El instrumento RAD de Curiosity midió 8.100 micrograys, lo mismo que 30 radiografías de tórax de una sola vez: la mayor dosis desde que el rover aterrizó en 2012.',
    inTheGame:
      'Evento "Evento de Partículas Solares": con el escudo por debajo del 50%, la dosis se multiplica y la tripulación pierde salud.',
    sourceName: 'NASA — NASA Watches Mars Light Up During Epic Solar Storm',
    url: 'https://www.nasa.gov/missions/mars-science-laboratory/nasa-watches-mars-light-up-during-epic-solar-storm/',
    images: [
      {
        nasaId: 'PIA26302',
        file: 'PIA26302.jpg',
        caption:
          'Foto de la cámara de navegación de Curiosity, 20 de mayo de 2024. Los puntos y rayas blancas no son polvo: son partículas del Sol golpeando el sensor de la cámara.',
        credit: 'NASA/JPL-Caltech',
      },
    ],
  },
];

/** Dirección de una foto guardada, válida también cuando el juego se sirve desde una subcarpeta */
export function nasaImageSrc(image: NasaImage): string {
  return `${import.meta.env.BASE_URL}nasa/${image.file}`;
}

/** Página de la foto en la biblioteca de imágenes de la NASA */
export function nasaImagePage(image: NasaImage): string {
  return `https://images.nasa.gov/details/${image.nasaId}`;
}

/** Catálogo público de la NASA donde se registra cada tormenta solar */
export const SPACE_WEATHER_CATALOG = {
  name: 'NASA DONKI — Space Weather Database Of Notifications, Knowledge, Information',
  url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
};
