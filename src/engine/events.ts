import { GameEvent } from '../domain/types';

export const GAME_EVENTS_DECK: GameEvent[] = [
  {
    id: 'dust_storm_mars',
    title: 'Tormenta Global de Polvo Marciano',
    severity: 'alta',
    type: 'emergency',
    description:
      'Un frente masivo de polvo de silicato y óxidos de hierro cubre la atmósfera superior del Cráter Jezero. La opacidad óptica (Tau) ha subido a 4.2, bloqueando el 75% de los fotones solares directos.',
    applicablePlanets: ['mars'],
    triggerMinCycle: 2,
    iconName: 'Wind',
    stemExplanation:
      'HECHO REAL: en junio de 2018 una tormenta de polvo cubrió todo Marte y tapó el Sol. El rover Opportunity, que funcionaba con paneles solares, envió su última señal el 10 de junio de 2018 y nunca volvió a responder, después de casi 15 años de trabajo. En Marte no llueve, así que el polvo puede quedar flotando durante semanas. (Fuente: NASA Science, misión Opportunity.)',
    choices: [
      {
        id: 'opt_dust_generators',
        text: 'Encender Generadores Stirling/RTG Auxiliares',
        costHours: 4,
        costKg: 40,
        energyCost: 0,
        description: 'Activa la generación auxiliar de emergencia a costa de combustible y repuestos del generador.',
        consequences: {
          batteryDelta: 80,
          crewMoraleDelta: 5,
          customMessage: 'Los generadores nucleares auxiliares estabilizaron la red eléctrica durante la tormenta.',
        },
        stemLesson:
          'Los generadores termoeléctricos por radioisótopos (RTG) proporcionan calor y electricidad constantes sin importar la luz solar mediante la desintegración de Plutonio-238.',
      },
      {
        id: 'opt_dust_brownout',
        text: 'Protocolo de Ahorro Crítico (Apagar Laboratorios)',
        energyCost: 0,
        description: 'Desconecta el laboratorio de investigación y reduce la calefacción del hábitat al mínimo seguro.',
        consequences: {
          batteryDelta: -30,
          crewMoraleDelta: -15,
          crewHealthDelta: -5,
          customMessage: 'La tripulación resistió en penumbra y frío controlado, ahorrando energía pero sufriendo fatiga térmica.',
        },
        stemLesson:
          'El racionamiento térmico es una técnica aeroespacial estándar para evitar el colapso del bus de potencia a costa del bienestar de la tripulación.',
      },
      {
        id: 'opt_dust_clean_panels',
        text: 'EVA para Limpiar los Paneles y Bajar el Consumo a la Mitad',
        costHours: 10,
        costKg: 5,
        description: 'La tripulación sale a barrer el polvo de los paneles mientras la base funciona a media carga.',
        consequences: {
          batteryDelta: 35,
          crewHealthDelta: -4,
          crewMoraleDelta: -5,
          facilityWearDelta: { solarArray: 8 },
          customMessage: 'Paneles despejados por unas horas: algo de energía recuperada, con una tripulación cansada y cubierta de polvo.',
        },
        stemLesson:
          'El módulo InSight de la NASA perdió energía por el polvo acumulado en sus paneles hasta apagarse en 2022. Una tripulación puede limpiarlos; un robot depende del viento.',
      },
    ],
  },
  {
    id: 'solar_flare_lunar',
    title: 'Evento de Partículas Solares (SPE) / Fulguración',
    severity: 'critica',
    type: 'emergency',
    description:
      'El observatorio espacial detectó una eyección de masa coronal dirigida hacia el sistema Tierra-Luna. Un flujo letal de protones de alta energía (100 MeV) impactará en menos de 4 horas.',
    applicablePlanets: ['moon', 'mars'],
    triggerMinCycle: 3,
    iconName: 'SunAlert',
    stemExplanation:
      'HECHO REAL: el 20 de mayo de 2024 una fulguración solar de clase X12 alcanzó Marte. El instrumento RAD del rover Curiosity midió 8.100 micrograys, lo mismo que 30 radiografías de tórax de una sola vez: la mayor dosis desde que aterrizó en 2012. Ni la Luna ni Marte tienen un campo magnético global que desvíe esas partículas, así que la única defensa es un refugio blindado. (Fuente: NASA, "NASA Watches Mars Light Up During Epic Solar Storm".)',
    choices: [
      {
        id: 'opt_solar_shelter',
        text: 'Evacuación Total al Refugio Subterráneo de Regolito',
        costHours: 8,
        costKg: 10,
        energyCost: 40,
        description: 'Refugia a los astronautas bajo 3 metros de regolito sinterizado y canaliza agua residual a los escudos.',
        consequences: {
          shieldDelta: -10,
          crewHealthDelta: 0,
          crewMoraleDelta: -5,
          customMessage: 'El blindaje de regolito rico en hidrógeno absorbió el 94% de la radiación ionizante.',
        },
        stemLesson:
          'El regolito lunar y el agua son ricos en átomos ligeros como hidrógeno, ideales para moderar neutrones y dispersar protones sin generar radiación secundaria por Bremsstrahlung.',
      },
      {
        id: 'opt_magnetic_overdrive',
        text: 'Sobrecargar Bobinas Magnéticas Deflectoras',
        costHours: 4,
        costKg: 60,
        energyCost: 90,
        description: 'Genera una magnetosfera artificial temporal a máxima potencia.',
        consequences: {
          batteryDelta: -90,
          facilityWearDelta: { radiationShield: -15 },
          crewHealthDelta: 0,
          crewMoraleDelta: 10,
          customMessage: 'La magnetosfera artificial desvió el frente de plasma, aunque las bobinas sufrieron estrés térmico.',
        },
        stemLesson:
          'La protección electromagnética activa simula el campo geomagnético de Lorentz (F = q(v x B)) para desviar partículas cargadas antes del impacto.',
      },
      {
        id: 'opt_solar_water_wall',
        text: 'Refugio Improvisado con los Tanques de Agua y las Provisiones',
        costHours: 6,
        description: 'Sin gastar repuestos ni energía: se apilan agua y víveres alrededor del dormitorio como blindaje.',
        consequences: {
          waterDelta: -12,
          shieldDelta: -4,
          crewHealthDelta: -6,
          crewMoraleDelta: -8,
          customMessage: 'El muro de agua frenó buena parte de los protones, pero no todos: la tripulación recibió algo de dosis.',
        },
        stemLesson:
          'Es el plan real de la nave Orion: en una tormenta solar la tripulación se mete en el compartimento central y se rodea con la carga y el agua, porque el hidrógeno frena los protones.',
      },
    ],
  },
  {
    id: 'eclss_sabatier_anomaly',
    title: 'Fuga de Gas y Fallo de Catalizador en ECLSS',
    severity: 'alta',
    type: 'malfunction',
    description:
      'El reactor Sabatier presenta saturación por monóxido de carbono y micro-grietas en la celda de electrólisis. El reciclaje de oxígeno ha caído un 40%.',
    triggerMinCycle: 2,
    iconName: 'AlertTriangle',
    stemExplanation:
      'El sistema Sabatier combina dióxido de carbono exhalado con hidrógeno para producir metano y agua ($CO_2 + 4H_2 \\rightarrow CH_4 + 2H_2O$). El agua luego se descompone por electrólisis en oxígeno respirable. Si el catalizador se degrada, el ciclo vital se interrumpe.',
    choices: [
      {
        id: 'opt_replace_catalyst',
        text: 'Sustituir Módulo de Rutenio con Repuestos Críticos',
        costHours: 6,
        costKg: 55,
        description: 'Reemplaza el catalizador y sella la tubería presurizada con sellante epóxico aeroespacial.',
        consequences: {
          oxygenDelta: 15,
          facilityWearDelta: { lifeSupport: 20 },
          crewMoraleDelta: 5,
          customMessage: 'El reactor Sabatier fue restaurado a su eficiencia nominal del 95%.',
        },
        stemLesson:
          'La redundancia física y los repuestos modulares (ORUs - Orbital Replacement Units) son fundamentales en bases alejadas de la Tierra.',
      },
      {
        id: 'opt_manual_bypass',
        text: 'Bypass de Emergencia con Cilindros de Oxígeno Criogénico',
        costHours: 2,
        costKg: 5,
        description: 'Consume las reservas comprimidas para no gastar el catalizador de repuesto.',
        consequences: {
          oxygenDelta: -25,
          crewMoraleDelta: -10,
          customMessage: 'Se ahorraron repuestos, pero las reservas de emergencia de oxígeno bajaron sustancialmente.',
        },
        stemLesson:
          'Consumir reservas finitas no renovables aumenta exponencialmente el riesgo ante futuras contingencias.',
      },
      {
        id: 'opt_sabatier_field_repair',
        text: 'Reparación en Campo: Limpiar el Catalizador y Operar a Carga Reducida',
        costHours: 12,
        costKg: 15,
        description: 'Regeneras el catalizador con calor y sellas las grietas; el reactor queda funcionando, pero no como nuevo.',
        consequences: {
          oxygenDelta: -8,
          facilityWearDelta: { lifeSupport: 8 },
          crewMoraleDelta: -3,
          customMessage: 'El reactor volvió a funcionar a carga reducida. Costó menos, pero se perdió algo de oxígeno durante la parada.',
        },
        stemLesson:
          'En la Estación Espacial muchas fallas del soporte vital se resuelven reparando en órbita lo que hay, porque el repuesto puede tardar meses en llegar.',
      },
    ],
  },
  {
    id: 'subsurface_ice_discovery',
    title: 'Detección de Lentejón de Hielo Puro Subterráneo',
    severity: 'positiva',
    type: 'discovery',
    description:
      'El radar de penetración terrestre (RIMFAX) del laboratorio localizó un depósito masivo de hielo glacial a solo 1.8 metros bajo la superficie.',
    triggerMinCycle: 3,
    iconName: 'Droplet',
    stemExplanation:
      'El hielo subsuperficial en Marte y en cráteres en sombra permanente de la Luna es el recurso más valioso de la exploración espacial: provee agua potable, oxígeno para respirar y propelente (LH2/LOX) para naves.',
    choices: [
      {
        id: 'opt_mine_ice',
        text: 'Desplegar Sonda Térmica y Extracción Rodriguez Well',
        costHours: 10,
        costKg: 30,
        energyCost: 45,
        description: 'Funde el hielo in-situ y bombea agua purificada directamente a los tanques de la base.',
        consequences: {
          waterDelta: 85,
          batteryDelta: -45,
          crewMoraleDelta: 15,
          customMessage: '¡Éxito minero! Se bombearon 85 litros de agua glacial de alta pureza.',
        },
        stemLesson:
          'El pozo Rodriguez calienta y derrite hielo subterráneo formando un bolsón de agua líquida subterránea que se succiona con un mínimo de partes móviles.',
      },
      {
        id: 'opt_scientific_core',
        text: 'Tomar Testigos Criogénicos para Análisis Astrobiológico',
        costHours: 8,
        costKg: 2,
        description: 'Prioriza la recolección de muestras científicas para buscar biofirmas o registros paleoclimáticos.',
        consequences: {
          scienceHoursDelta: 20,
          waterDelta: 20,
          crewMoraleDelta: 20,
          customMessage: '¡Las muestras ya viajan en los datos a la Tierra! La misión sumó 20 horas de ciencia.',
        },
        stemLesson:
          'Los núcleos de hielo espacial almacenan registros fósiles de la atmósfera primitiva del sistema solar.',
      },
      {
        id: 'opt_ice_shield',
        text: 'Usar el Hielo como Blindaje: Cubrir el Hábitat',
        costHours: 14,
        costKg: 5,
        description: 'Extraes bloques de hielo y los apilas sobre el hábitat: menos agua para beber, más protección contra la radiación.',
        consequences: {
          batteryDelta: -20,
          waterDelta: 25,
          shieldDelta: 18,
          crewMoraleDelta: 8,
          customMessage: 'El hielo apilado sobre el hábitat reforzó el blindaje y además dejó algo de agua en los tanques.',
        },
        stemLesson:
          'El concepto Mars Ice Home de la NASA Langley propone un hábitat cubierto de hielo: el hidrógeno del agua es de los mejores escudos contra los rayos cósmicos.',
      },
    ],
  },
  {
    id: 'greenhouse_botanical_breakthrough',
    title: 'Optimización de Espectro LED en Invernadero',
    severity: 'positiva',
    type: 'opportunity',
    description:
      'La Dra. Amara Chen descubrió que pulsos de fotones rojo lejano (730 nm) y azul profundo (450 nm) incrementan la fotosíntesis de lechugas y patatas marcianas en un 35%.',
    triggerMinCycle: 4,
    iconName: 'Sprout',
    stemExplanation:
      'La radiación fotosintéticamente activa (PAR) puede ajustarse digitalmente con LEDs para excitar los fotosistemas I y II con la máxima eficiencia energética por mol de fotones.',
    choices: [
      {
        id: 'opt_upgrade_grow_lights',
        text: 'Reconfigurar y Recalibrar Iluminación LED',
        costHours: 6,
        costKg: 15,
        description: 'Aplica el nuevo espectro fotosintético a todas las bandejas hidropónicas.',
        consequences: {
          foodDelta: 45,
          oxygenDelta: 10,
          crewMoraleDelta: 12,
          customMessage: 'La cosecha hidropónica maduró antes de tiempo, generando biomasa nutritiva fresca.',
        },
        stemLesson:
          'En ambientes extraterrestres, cada watt eléctrico invertido en iluminación vegetal debe maximizar los gramos de biomasa digestible.',
      },
      {
        id: 'opt_grow_lights_half',
        text: 'Aplicarlo Solo a la Mitad de las Bandejas (Ensayo Controlado)',
        costHours: 3,
        costKg: 6,
        description: 'Pruebas el nuevo espectro en media cosecha y dejas la otra mitad como control.',
        consequences: {
          foodDelta: 22,
          oxygenDelta: 5,
          crewMoraleDelta: 6,
          customMessage: 'El ensayo confirmó el resultado: la mitad tratada rindió más, sin arriesgar toda la cosecha.',
        },
        stemLesson:
          'Todo experimento serio deja un grupo de control. Así trabaja el sistema Veggie de la Estación Espacial al probar recetas de luz.',
      },
      {
        id: 'opt_grow_lights_publish',
        text: 'Mantener el Cultivo Actual y Enviar los Datos a la Tierra',
        costHours: 2,
        description: 'No cambias nada en el invernadero: documentas el hallazgo y envías los datos a la Tierra.',
        consequences: {
          scienceHoursDelta: 10,
          crewMoraleDelta: 4,
          customMessage: 'Los datos llegaron a la Tierra y suman 10 horas de ciencia, pero la cosecha siguió igual.',
        },
        stemLesson:
          'El conocimiento también es un producto de la misión: lo que se aprende cultivando en el espacio mejora la agricultura en la Tierra.',
      },
    ],
  },
  {
    id: 'micrometeorite_puncture',
    title: 'Impacto de Micrometeorito en el Domo del Hábitat',
    severity: 'critica',
    type: 'emergency',
    description:
      'Un fragmento de roca de 2 mm a 18 km/s perforó la capa externa de Kevlar y Nextel del hábitat. Los sensores indican despresurización leve pero constante (0.4 kPa/min).',
    applicablePlanets: ['moon', 'mars'],
    triggerMinCycle: 5,
    iconName: 'ShieldAlert',
    stemExplanation:
      'Los escudos Whipple utilizan varias láminas delgadas de aluminio o cerámica para pulverizar los proyectiles a hipervelocidad antes de que alcancen el casco de presión interna.',
    choices: [
      {
        id: 'opt_rapid_patch',
        text: 'EVA Inmediato y Sellado con Parche de Resina Curada por UV',
        costHours: 12,
        costKg: 20,
        description: 'Dos astronautas salen al exterior para sellar el orificio y colocar un blindaje Whipple adicional.',
        consequences: {
          oxygenDelta: -12,
          facilityWearDelta: { habitat: 15 },
          crewMoraleDelta: 8,
          customMessage: 'El EVA fue exitoso; la presión interna del hábitat se estabilizó de inmediato.',
        },
        stemLesson:
          'Los procedimientos de actividad extravehicular (EVA) de emergencia requieren redundancia en trajes espaciales y uso de materiales compuestos avanzados.',
      },
      {
        id: 'opt_seal_bulkhead',
        text: 'Aislar el Compartimento Afectado (Cierre de Mamparos)',
        costHours: 2,
        description: 'Cierra herméticamente la bahía afectada reduciendo el espacio útil del hábitat.',
        consequences: {
          facilityWearDelta: { habitat: -25 },
          crewMoraleDelta: -20,
          customMessage: 'Se evitó la pérdida de aire global pero el hacinamiento generó fricción psicológica.',
        },
        stemLesson:
          'La compartimentación estanca es la primera regla naval y aeroespacial para evitar pérdidas catastróficas descontroladas.',
      },
      {
        id: 'opt_internal_patch',
        text: 'Parche Interno de Emergencia, sin Salir al Exterior',
        costHours: 4,
        costKg: 6,
        description: 'Se sella el orificio desde adentro con un kit de parche. Nadie sale, pero queda como arreglo provisorio.',
        consequences: {
          oxygenDelta: -6,
          facilityWearDelta: { habitat: -8 },
          crewMoraleDelta: -5,
          customMessage: 'La fuga quedó contenida desde adentro. El parche aguanta, pero el casco sigue debilitado.',
        },
        stemLesson:
          'HECHO REAL: en agosto de 2018 la Estación Espacial tuvo una fuga por un orificio de 2 mm en una nave Soyuz acoplada. La tripulación la selló desde adentro con resina epoxi y gasa.',
      },
    ],
  },
  {
    id: 'generator_inverter_fault',
    title: 'Fallo Térmico en Inversor del Generador Eléctrico',
    severity: 'alta',
    type: 'malfunction',
    description:
      'Un cortocircuito por descarga de plasma en el inversor principal del bus de corriente continua ha reducido la potencia neta de la colonia en 45 kW.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 3,
    iconName: 'Zap',
    stemExplanation:
      'Los sistemas de potencia en el vacío o bajo baja presión marciana son vulnerables al efecto Paschen: el gas enrarecido tiene menor rigidez dieléctrica, facilitando arcos eléctricos espontáneos.',
    choices: [
      {
        id: 'opt_replace_solid_state_relay',
        text: 'Sustituir Relés de Estado Sólido de Respaldo',
        costHours: 6,
        costKg: 35,
        description: 'Instala repuestos de semiconductores de carburo de silicio (SiC) resistentes a alta temperatura.',
        consequences: {
          batteryDelta: 50,
          facilityWearDelta: { solarArray: 15 },
          crewMoraleDelta: 5,
          customMessage: 'El bus eléctrico se estabilizó con semiconductores de SiC de grado aeroespacial.',
        },
        stemLesson:
          'Los semiconductores de carburo de silicio (SiC) y nitruro de galio (GaN) operan a mayores frecuencias y temperaturas sin sufrir avalancha térmica.',
      },
      {
        id: 'opt_derate_load',
        text: 'Reducir Carga Nominal del Bus (Derating)',
        description: 'Disminuye la potencia tolerada operando al 70% de la capacidad para no fundir los transformadores.',
        consequences: {
          batteryDelta: -40,
          crewMoraleDelta: -8,
          customMessage: 'Se evitó el incendio pero el almacenamiento de energía nocturna se vio mermado.',
        },
        stemLesson:
          'El derating (desclasificación térmica) alarga la vida útil de componentes deteriorados reduciendo el esfuerzo térmico (I²R).',
      },
      {
        id: 'opt_reroute_bus',
        text: 'Reconfigurar el Bus: Pasar la Carga a la Línea Secundaria',
        costHours: 8,
        costKg: 4,
        description: 'Aíslas el inversor dañado y repartes la carga por la línea de respaldo, que trabajará forzada.',
        consequences: {
          batteryDelta: 15,
          facilityWearDelta: { solarArray: -6 },
          crewMoraleDelta: -2,
          customMessage: 'La línea secundaria tomó la carga. La base tiene energía, pero el sistema quedó sin respaldo y más exigido.',
        },
        stemLesson:
          'Las naves llevan buses eléctricos redundantes justamente para esto: aislar la rama dañada y seguir con la otra mientras se planifica la reparación.',
      },
    ],
  },
  {
    id: 'emergency_resupply_capsule',
    title: 'Llegada de Cápsula de Suministros Automatizada (ISRU Delivery)',
    severity: 'positiva',
    type: 'opportunity',
    description:
      'Una etapa de descenso no tripulada con repuestos de la Tierra ha realizado un aterrizaje de precisión a 800 metros de la colonia.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 6,
    iconName: 'Package',
    stemExplanation:
      'Las ventanas de transferencia orbital de Hohmann ocurren cada 26 meses hacia Marte. La recepción de cargueros automáticos requiere sincronización orbital milimétrica.',
    choices: [
      {
        id: 'opt_recover_vital_cargo',
        text: 'Desplegar Rover de Carga para Recuperar Contenedores',
        costHours: 10,
        energyCost: 20,
        description: 'Recupera raciones de comida liofilizada, filtros de agua y unos 80 kg de repuestos.',
        consequences: {
          spareKgDelta: 80,
          waterDelta: 40,
          foodDelta: 50,
          oxygenDelta: 15,
          crewMoraleDelta: 18,
          customMessage: '¡Cargamento recuperado! La tripulación disfruta de alimentos frescos y nuevos filtros de soporte vital.',
        },
        stemLesson:
          'El soporte logístico automatizado complementa la autosuficiencia local durante las fases iniciales de colonización.',
      },
      {
        id: 'opt_recycle_lander_parts',
        text: 'Desmantelar Cápsula para Extraer Baterías y Titanio',
        costHours: 12,
        energyCost: 10,
        description: 'Aprovecha las celdas de energía, el blindaje y unos 40 kg de titanio y cables de la cápsula.',
        consequences: {
          spareKgDelta: 40,
          batteryDelta: 95,
          shieldDelta: 8,
          crewMoraleDelta: 10,
          customMessage: 'Las celdas de combustible de la cápsula recargaron los bancos de baterías de la base.',
        },
        stemLesson:
          'En ingeniería espacial, reutilizar las etapas de descenso como blindaje o almacén reduce la masa total lanzada desde la Tierra.',
      },
      {
        id: 'opt_capsule_medical',
        text: 'Priorizar el Botiquín, los Filtros y el Correo de la Tierra',
        costHours: 6,
        description: 'Recuperas primero lo médico y lo personal; del resto solo se salvan unos 25 kg de repuestos.',
        consequences: {
          spareKgDelta: 25,
          foodDelta: 15,
          oxygenDelta: 8,
          crewHealthDelta: 15,
          crewMoraleDelta: 25,
          customMessage: 'Medicinas, filtros nuevos y cartas de casa: la tripulación recuperó salud y ánimo.',
        },
        stemLesson:
          'Las naves de carga a la Estación Espacial llevan paquetes personales y comida fresca: la salud mental de la tripulación es parte del soporte vital.',
      },
    ],
  },
  {
    id: 'sol1_initial_deployment',
    title: 'Aterrizaje Completado: Primer Día en la Base',
    severity: 'positiva',
    type: 'opportunity',
    description:
      'Los sistemas principales acaban de encenderse tras el aterrizaje. Control de Misión en Houston pregunta cuál será tu prioridad inicial para arrancar la temporada en el puesto de avanzada.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 1,
    iconName: 'Rocket',
    stemExplanation:
      'Las primeras 24 horas tras el aterrizaje (Post-Landing Checkouts) definen la estabilidad del soporte vital (ECLSS) y la calibración de los paneles solares.',
    choices: [
      {
        id: 'opt_sol1_solar_boost',
        text: 'Calibrar Paneles Solares al Máximo',
        costHours: 4,
        description: 'Alinea los paneles fotovoltaicos con el ángulo solar óptimo para asegurar reserva de batería desde el inicio.',
        consequences: {
          batteryDelta: 75,
          crewMoraleDelta: 5,
          customMessage: '¡Paneles alineados! Las baterías recibieron una carga extra de +75 kWh.',
        },
        stemLesson:
          'El seguimiento solar en dos ejes maximiza el coseno del ángulo de incidencia, aumentando hasta un 35% la captación de energía.',
      },
      {
        id: 'opt_sol1_water_reserve',
        text: 'Sintetizar Reserva Extra de Agua y Oxígeno',
        costHours: 4,
        description: 'Activa los tanques químicos iniciales para llenar las reservas de agua potable y aire respirable.',
        consequences: {
          waterDelta: 45,
          oxygenDelta: 12,
          crewMoraleDelta: 5,
          customMessage: '¡Soporte vital reforzado! +45L de agua y +12kg de oxígeno añadidos a las reservas.',
        },
        stemLesson:
          'Contar con un colchón de agua y oxígeno (Buffer Stock) protege a la tripulación frente a fluctuaciones en el reciclador.',
      },
      {
        id: 'opt_sol1_nasa_grant',
        text: 'Enviar la Telemetría a Control de Misión',
        description: 'Los ingenieros en la Tierra revisan los sistemas por ti. Cada mensaje tarda entre 4 y 24 minutos en llegar, pero te ahorran 8 horas de chequeos.',
        consequences: {
          hoursDelta: 8,
          crewMoraleDelta: 10,
          customMessage: 'Control de Misión revisó los sistemas desde la Tierra y le ahorró 8 horas de chequeos a la tripulación.',
        },
        stemLesson:
          'Las comunicaciones por banda Ka y óptica láser permiten transmitir datos científicos de alta velocidad desde la Luna y Marte.',
      },
    ],
  },
  {
    id: 'earth_university_contract',
    title: 'Pedido de Investigación de Universidades de la Tierra',
    severity: 'positiva',
    type: 'opportunity',
    description:
      'Un consorcio de universidades pide que la tripulación dedique horas de este Sol a pruebas de cultivo en baja gravedad o a medir la radiación del hábitat.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 2,
    iconName: 'Award',
    stemExplanation:
      'La ciencia es la razón de ser de la misión: cada hora de experimentos genera conocimiento aplicable en la Tierra. Pero compite con las horas que pide el mantenimiento de la base.',
    choices: [
      {
        id: 'opt_contract_accept',
        text: 'Aceptar el Experimento (Usar Energía del Laboratorio)',
        costHours: 6,
        energyCost: 35,
        description: 'Dedica energía de las baterías y 6 horas de trabajo para completar el estudio entero.',
        consequences: {
          scienceHoursDelta: 25,
          batteryDelta: -35,
          crewMoraleDelta: 8,
          customMessage: '¡Experimento exitoso! La misión sumó 25 horas de ciencia.',
        },
        stemLesson:
          'En la Estación Espacial se hacen cientos de experimentos por año que solo funcionan en microgravedad, por ejemplo cristales de proteínas para medicamentos.',
      },
      {
        id: 'opt_contract_botany',
        text: 'Enfocar el Estudio en Duplicar Raciones de Comida',
        costHours: 6,
        costKg: 5,
        description: 'Aprovecha los reactivos del consorcio para acelerar los cultivos del invernadero local.',
        consequences: {
          foodDelta: 45,
          oxygenDelta: 10,
          crewMoraleDelta: 10,
          customMessage: 'Los nutrientes experimentales produjeron +45 kg de comida fresca y +10 kg de oxígeno.',
        },
        stemLesson:
          'El uso de bacterias fijadoras de nitrógeno en regolito tratado multiplica el rendimiento agrícola espacial.',
      },
      {
        id: 'opt_contract_radiation',
        text: 'Proponer el Estudio de Dosimetría de Radiación',
        costHours: 4,
        costKg: 3,
        description: 'Instalas dosímetros del consorcio en el hábitat: menos ciencia para la Tierra, pero los datos te ayudan a mejorar el blindaje.',
        consequences: {
          scienceHoursDelta: 10,
          batteryDelta: -15,
          shieldDelta: 10,
          crewMoraleDelta: 6,
          customMessage: 'El mapa de dosis mostró los puntos débiles del blindaje y se reforzaron. Además sumó 10 horas de ciencia.',
        },
        stemLesson:
          'El instrumento RAD del rover Curiosity mide la radiación en Marte desde 2012; con esos datos se diseñan los refugios de las futuras tripulaciones.',
      },
    ],
  },
  {
    id: 'crew_fatigue_dilemma',
    title: 'Sobrecarga de Turnos y Fatiga de la Tripulación',
    severity: 'media',
    type: 'malfunction',
    description:
      'El aislamiento espacial y el ruido constante de las bombas de aire están afectando el sueño de los 4 astronautas. El médico recomienda intervenir.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 3,
    iconName: 'HeartPulse',
    stemExplanation:
      'En el espacio, la alteración del ritmo circadiano disminuye la atención cognitiva y aumenta la probabilidad de errores humanos.',
    choices: [
      {
        id: 'opt_crew_rest_day',
        text: 'Declarar Jornada Recreativa y Banquete Especial',
        costHours: 12,
        description: 'Sirve raciones gourmet e ilumina el hábitat con luz cálida para recuperar salud y moral al instante.',
        consequences: {
          foodDelta: -10,
          crewHealthDelta: 18,
          crewMoraleDelta: 25,
          customMessage: '¡La tripulación recuperó energías! +18% de salud y +25% de moral en todo el equipo.',
        },
        stemLesson:
          'La psicología espacial de la NASA incluye comidas especiales y contacto familiar para mitigar el síndrome del tercer cuarto de misión.',
      },
      {
        id: 'opt_crew_double_shift',
        text: 'Mantener Turnos Dobles para Recargar Recursos',
        description: 'Exige un esfuerzo extra a la tripulación para producir más agua, oxígeno y energía hoy.',
        consequences: {
          batteryDelta: 55,
          waterDelta: 30,
          oxygenDelta: 12,
          crewMoraleDelta: -12,
          crewHealthDelta: -5,
          customMessage: 'Se logró un superávit de +55 kWh y +30L de agua, aunque los astronautas terminaron agotados.',
        },
        stemLesson:
          'En situaciones límite, priorizar las reservas físicas del hábitat garantiza la supervivencia a largo plazo.',
      },
      {
        id: 'opt_crew_rotating_shifts',
        text: 'Turnos Rotativos con Ciclo de Luz Controlado',
        costHours: 4,
        description: 'Reorganizas los horarios y ajustas la iluminación al ritmo de sueño: nadie descansa un día entero, nadie hace doble turno.',
        consequences: {
          batteryDelta: 15,
          crewHealthDelta: 8,
          crewMoraleDelta: 8,
          customMessage: 'Con horarios ordenados y luz regulada, la tripulación duerme mejor sin frenar la base.',
        },
        stemLesson:
          'La Estación Espacial usa luces LED que cambian de color a lo largo del día para sostener el ritmo circadiano de los astronautas.',
      },
    ],
  },
  {
    id: 'water_condenser_boost',
    title: 'Condensación Atmosférica en el Invernadero',
    severity: 'baja',
    type: 'opportunity',
    description:
      'La transpiración de las plantas en el invernadero ha generado una alta humedad relativa. Puedes recolectarla para los tanques de agua o usarla para refrigerar los reactores.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 2,
    iconName: 'Droplets',
    stemExplanation:
      'Las plantas transpiran hasta el 97% del agua que absorben. En un circuito cerrado, los deshumidificadores recuperan ese vapor como agua destilada pura.',
    choices: [
      {
        id: 'opt_harvest_humidity',
        text: 'Condensar Vapor hacia los Tanques de Agua Potable',
        costHours: 2,
        description: 'Recupera cada gota de humedad ambiental para aumentar gratuitamente tus reservas de agua.',
        consequences: {
          waterDelta: 55,
          crewMoraleDelta: 5,
          customMessage: '¡Agua pura recolectada! Tus tanques sumaron +55 Litros sin costo.',
        },
        stemLesson:
          'El sistema de recuperación de condensado de la ISS es una de las fuentes más limpias de agua en órbita.',
      },
      {
        id: 'opt_cool_solar_inverters',
        text: 'Usar el Agua en el Circuito de Refrigeración Eléctrica',
        costHours: 4,
        description: 'Enfría las baterías y paneles para obtener una descarga extra de energía y proteger los módulos.',
        consequences: {
          batteryDelta: 65,
          shieldDelta: 6,
          facilityWearDelta: { solarArray: 12, lifeSupport: 10 },
          customMessage: '¡Sistemas refrigerados! Ganaste +65 kWh de batería y reparaste módulos clave.',
        },
        stemLesson:
          'El control térmico activo mediante intercambiadores de calor de agua evita el sobrecalentamiento de la electrónica de potencia.',
      },
      {
        id: 'opt_humidity_greenhouse',
        text: 'Devolver la Humedad al Riego del Invernadero',
        costHours: 3,
        description: 'Cierras el ciclo dentro del invernadero: el vapor vuelve a las plantas y la cosecha se adelanta.',
        consequences: {
          waterDelta: 15,
          foodDelta: 25,
          oxygenDelta: 8,
          crewMoraleDelta: 4,
          customMessage: 'El ciclo cerrado de riego adelantó la cosecha: más comida y algo de oxígeno extra.',
        },
        stemLesson:
          'En un sistema de soporte vital biorregenerativo las plantas hacen tres trabajos a la vez: dan comida, producen oxígeno y purifican el agua.',
      },
    ],
  },
];

export function pickNextCycleEvent(
  cycle: number,
  planetId: 'mars' | 'moon',
  recentEventIds: string[],
  rng: () => number = Math.random
): GameEvent {
  if (cycle === 1) {
    const sol1 = GAME_EVENTS_DECK.find((e) => e.id === 'sol1_initial_deployment');
    if (sol1) return sol1;
  }

  // El Sol 3 siempre trae la tormenta solar: es el evento que se compara con el Sol real (NASA DONKI).
  if (cycle === 3) {
    const solar = GAME_EVENTS_DECK.find((e) => e.id === 'solar_flare_lunar');
    if (solar) return solar;
  }

  const eligible = GAME_EVENTS_DECK.filter((ev) => {
    if (ev.id === 'sol1_initial_deployment') return false;
    if (ev.applicablePlanets && !ev.applicablePlanets.includes(planetId)) return false;
    if (ev.triggerMinCycle && cycle < ev.triggerMinCycle) return false;
    return true;
  });

  const notRecent = eligible.filter((ev) => !recentEventIds.includes(ev.id));
  const pool = notRecent.length > 0 ? notRecent : eligible;
  const randomIndex = Math.floor(rng() * pool.length);
  return pool[randomIndex] || GAME_EVENTS_DECK[0];
}


