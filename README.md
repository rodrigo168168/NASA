# 🚀 MARS-1: SPACE OUTPOST SIMULATOR
> *"Every decision determines survival."*

**▶ Jugar ahora:** https://rodrigo168168.github.io/NASA/

Simulador táctico e interactivo de gestión y supervivencia en un puesto de avanzada espacial en **Marte** o la **Luna**, desarrollado para el **NASA Space Apps Challenge / Hackathon STEM (24 horas)**.

Permite a estudiantes, jueces y entusiastas del espacio experimentar en carne propia los dilemas, equilibrios termodinámicos y decisiones críticas de ingeniería aeroespacial que afrontan los directores de vuelo de la NASA y los comandantes de misiones extraterrestres.

---

## 🌞 Qué tiene de nuevo: datos reales de la NASA dentro de la partida

- **El Sol de este mes, en vivo.** En el Sol 3 llega la tormenta solar, y el juego le pregunta al catálogo **NASA DONKI** cuál fue la fulguración más fuerte de los últimos 30 días y la compara con la de la emergencia (clase X12, la que alcanzó Marte el 20 de mayo de 2024).
- **Energía solar medida por satélite.** **NASA POWER** da la energía que llegó al suelo en Santa Cruz de la Sierra en las últimas semanas, y el juego la compara con el 43 % que llega a Marte.
- **Misiones que pasaron de verdad.** Opportunity y la tormenta de polvo de 2018, y Apolo 13 (1970), con los hechos en el orden en que ocurrieron.
- **Código de misión del aula.** El profesor da un código y toda la clase juega la misma misión, con los mismos eventos en el mismo orden, para comparar decisiones.
- **Fotos reales** de la biblioteca de imágenes de la NASA (PIA22329, PIA22521, PIA26302), con su crédito.
- **No depende de internet.** Cada pedido tiene un límite de 8 segundos; si falla, se muestra la copia guardada y se avisa con la etiqueta "COPIA GUARDADA".

---

## 🛰️ 1. Objetivo del Simulador

Sobrevivir durante **15 Soles (ciclos completos de misión)** gestionando una colonia espacial bajo restricciones reales de masa, potencia, blindaje y soporte vital.

El jugador no solo compite por una puntuación alta; en cada decisión, avería o descubrimiento, aprende los fundamentos científicos de la NASA que rigen los viajes interplanetarios.

---

## 🧪 2. Arquitectura del Software (Clean Architecture)

El proyecto fue diseñado siguiendo los estándares de **Senior Software Engineer & Software Architect**:

```
src/
├── domain/                      # Capa de Dominio (Modelos puros y constantes STEM)
│   ├── types.ts                 # Tipos estrictos (GameState, ColonyFacilities, SubResources, Policies)
│   └── constants.ts             # Constantes aeroespaciales NASA ECLSS, irradiancia, radiación NASA-STD-3001
├── engine/                      # Capa de Negocio / Simulación Pura
│   ├── simulationEngine.ts      # Motor matemático de simulación por ciclo (Sol)
│   ├── simulationEngine.test.ts # Pruebas unitarias automatizadas con Vitest (9/9 tests passed)
│   ├── events.ts                # Baraja procedimental de emergencias, anomalías y descubrimientos
│   ├── actions.ts               # Decisiones de ingeniería y mejoras de infraestructura
│   └── stemKnowledge.ts         # Enciclopedia educativa STEM con casos reales (ISS, Curiosity, InSight)
├── services/                    # Capa de Infraestructura & Servicios
│   ├── soundService.ts          # Síntesis de telemetría y alarmas con HTML5 Web Audio API
│   └── storageService.ts        # Persistencia local resiliente (localStorage)
├── components/                  # Capa de Presentación (React + TailwindCSS + Lucide)
│   ├── Header.tsx               # Barra de telemetría, Sol 1-15, salud de tripulación, audio, control
│   ├── ResourceGauges.tsx       # 4 medidores clave (Energía, Soporte Vital, Radiación, Créditos) + submedidores
│   ├── ColonyVisualizer.tsx     # Esquema interactivo de la base (E-HAB, Solar, Invernadero, ECLSS, Lab, Domo)
│   ├── PolicySelector.tsx       # 3 directivas estratégicas (Supervivencia, Producción, Escudo Total)
│   ├── ActionsPanel.tsx         # Consola de ingeniería: reparaciones, mejoras, costes y riesgos
│   ├── EventModal.tsx           # Diálogo de alertas rojas/amarillas y decisiones tácticas
│   ├── HistoryTelemetryModal.tsx# Gráficos SVG históricos interactivos (Caja negra)
│   ├── STEMLearningCenter.tsx   # Hub educativo con fichas científicas y glosario aeroespacial
│   ├── HowToPlayModal.tsx       # Manual de operaciones del comandante
│   ├── VictoryModal.tsx         # Pantalla de victoria (Sol 15), puntuación, confeti y aprendizajes
│   ├── DefeatModal.tsx          # Pantalla de derrota con autopsia técnica y recomendaciones
│   └── WelcomeScreen.tsx        # Pantalla cinematográfica de bienvenida y selección de escenario
├── App.tsx                      # Orquestador del estado central reactivo
└── main.tsx                     # Punto de entrada
```

---

## 🔬 3. Principios Científicos y Fórmulas STEM Implementadas

1. **Balance de Potencia Eléctrica:**
   - $P_{gen} = (\text{Base} \times \text{Nivel} \times \text{Salud} \times \eta_{solar}) + P_{RTG}$
   - En Marte, la acumulación de polvo electrostático ($\tau$) degrada $\eta_{solar}$ de forma progresiva. En la Luna, la radiación solar directa es máxima (1361 W/m²), pero los periodos en sombra exigen grandes bancos de baterías.
2. **Soporte Vital Regenerativo (ECLSS):**
   - Consumo metabólico por astronauta: $0.84\text{ kg } O_2/\text{sol}$, $2.5\text{ L } H_2O/\text{sol}$, $0.62\text{ kg alimentos}/\text{sol}$.
   - Reacción Sabatier catalizada por rutenio: $\text{CO}_2 + 4\text{H}_2 \rightarrow \text{CH}_4 + 2\text{H}_2\text{O}$, seguida de electrólisis del agua para regenerar oxígeno respirable.
   - Bucle de reciclaje con eficiencia configurable del 85% al 98% (estándar de la ISS).
3. **Fotosíntesis Biorregenerativa:**
   - Invernadero hidropónico/aeropónico con espectros LED específicos (PAR: 450 nm azul y 660-730 nm rojo lejano) que convierten $\text{CO}_2$ en carbohidratos y aportan $\text{O}_2$ complementario.
4. **Física de Radiación y Blindaje de Regolito:**
   - Rayos Cósmicos Galácticos (GCR) y Eventos de Partículas Solares (SPE).
   - Atenuación por materiales ricos en hidrógeno (agua y regolito compactado) para evitar la radiación secundaria por *Bremsstrahlung*.

---

## 🎮 4. Guía de Ejecución Local

### Prerrequisitos
- Node.js v18 o superior (probado en v24.21.0)
- npm v9 o superior

### Pasos
1. Clona o abre el directorio del proyecto:
   ```powershell
   cd c:\Users\jhona\Desktop\NASA
   ```
2. Instala las dependencias:
   ```powershell
   npm install
   ```
3. Ejecuta la suite de pruebas unitarias:
   ```powershell
   npx vitest run
   ```
4. Inicia el servidor de desarrollo local:
   ```powershell
   npm run dev
   ```
5. Abre en tu navegador la URL que aparece en pantalla (generalmente `http://localhost:5173/`).

---

## 🏆 5. Criterios de Evaluación y Control de Calidad

- **Cero errores en consola.**
- **Métricas estrictamente acotadas:** sin números negativos ni divisiones por cero.
- **Diseño Responsive:** adaptado para monitores de escritorio, portátiles y tablets.
- **Sonido procedural:** sin requerir descargas externas de audio (Web Audio API nativa).
- **Persistencia local:** guarda la partida automáticamente en `localStorage` para reanudarla ante recargas.
