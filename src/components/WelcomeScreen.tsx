import React, { useState } from 'react';
import { PlanetType, PlanetScenario } from '../domain/types';
import { PLANET_SCENARIOS } from '../domain/constants';
import {
  Rocket,
  Shield,
  Sun,
  Wind,
  HelpCircle,
  BookOpen,
  Play,
  Sparkles,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface WelcomeScreenProps {
  onStartMission: (selectedPlanet: PlanetScenario) => void;
  onOpenHowToPlay: () => void;
  onOpenSTEM: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartMission,
  onOpenHowToPlay,
  onOpenSTEM,
}) => {
  const [selectedPlanetId, setSelectedPlanetId] = useState<PlanetType>('mars');

  const selectedScenario = PLANET_SCENARIOS[selectedPlanetId];

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background stars & glowing nebula */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 p-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-cyan-300" />
          </div>
          <span className="font-heading font-black text-sm tracking-wider text-cyan-400">
            NASA SPACE APPS CHALLENGE
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundService.playClick();
              onOpenHowToPlay();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-space-900/80 hover:bg-space-850 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>CÓMO JUGAR</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onOpenSTEM();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-violet-950/80 hover:bg-violet-900/80 border border-violet-500/40 text-xs font-mono text-violet-300 hover:text-white transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>CENTRO DE APRENDIZAJE</span>
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        {/* Planet sphere visual representation */}
        <div className="relative mb-6">
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full shadow-2xl transition-all duration-700 flex items-center justify-center relative overflow-hidden ${
              selectedPlanetId === 'mars'
                ? 'bg-gradient-to-tr from-red-950 via-amber-800 to-red-600 shadow-red-600/30 ring-4 ring-red-500/30'
                : 'bg-gradient-to-tr from-slate-900 via-slate-600 to-slate-300 shadow-slate-400/20 ring-4 ring-slate-400/30'
            }`}
          >
            {/* Crater details */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,transparent_20%,rgba(0,0,0,0.8)_90%)]" />
            <div className="absolute w-8 h-8 rounded-full border border-black/30 top-6 left-8 opacity-40" />
            <div className="absolute w-12 h-12 rounded-full border border-black/40 bottom-6 right-10 opacity-30" />
            <div className="relative z-10 text-white/90 font-mono text-[10px] tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
              {selectedPlanetId === 'mars' ? 'MARTE — JEZERO' : 'LUNA — SHACKLETON'}
            </div>
          </div>
          <div className="absolute -inset-2 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        {/* Big Title & Motto */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium tracking-widest uppercase">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Simulador Táctico de Ingeniería Aeroespacial</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-wider text-white">
            MARS-1: <span className="text-cyan-400">SPACE OUTPOST</span>
          </h1>

          <p className="text-sm sm:text-base font-heading font-bold text-slate-300 tracking-wide uppercase">
            "Every decision determines survival."
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed font-sans pt-1">
            Asume el mando de una colonia espacial de avanzada. Gestiona la red eléctrica, el bucle cerrado de soporte vital (ECLSS) y los blindajes contra radiación cósmica. Sobrevive de 5 a 60 Soles, los que elijas, tomando decisiones fundamentadas en ingeniería real de la NASA.
          </p>
        </div>

        {/* Planet Selection Cards */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          {/* MARTE */}
          <button
            onClick={() => {
              soundService.playClick();
              setSelectedPlanetId('mars');
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md ${
              selectedPlanetId === 'mars'
                ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/50 ring-2 ring-red-400/40'
                : 'bg-space-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider">
                  Misión A: Marte (Cráter Jezero)
                </h3>
              </div>
              {selectedPlanetId === 'mars' && (
                <CheckCircle2 className="w-4 h-4 text-red-400" />
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
              {PLANET_SCENARIOS.mars.description}
            </p>

            <div className="space-y-1.5 text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2.5">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Wind className="w-3.5 h-3.5 shrink-0" />
                <span>Riesgo de tormentas globales de polvo fino</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Sun className="w-3.5 h-3.5 shrink-0" />
                <span>Irradiancia solar de ~590 W/m² (atenuación por distancia)</span>
              </div>
              <div className="text-slate-400 text-[10px]">
                Enfoque STEM: Reacción Sabatier, ISRU y mitigación electrostática.
              </div>
            </div>
          </button>

          {/* LUNA */}
          <button
            onClick={() => {
              soundService.playClick();
              setSelectedPlanetId('moon');
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md ${
              selectedPlanetId === 'moon'
                ? 'bg-slate-800/40 border-slate-400 shadow-xl shadow-slate-900/50 ring-2 ring-slate-300/40'
                : 'bg-space-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider">
                  Misión B: Luna (Cráter Shackleton)
                </h3>
              </div>
              {selectedPlanetId === 'moon' && (
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
              {PLANET_SCENARIOS.moon.description}
            </p>

            <div className="space-y-1.5 text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2.5">
              <div className="flex items-center gap-1.5 text-violet-300">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Radiación cósmica extrema sin campo magnético global</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Sun className="w-3.5 h-3.5 shrink-0" />
                <span>1361 W/m² de luz pura pero prolongada oscuridad en fondo de cráter</span>
              </div>
              <div className="text-slate-400 text-[10px]">
                Enfoque STEM: Blindaje por regolito sinterizado y gestión criogénica.
              </div>
            </div>
          </button>
        </div>

        {/* Primary Start Mission Button */}
        <button
          onClick={() => {
            soundService.playConfirm();
            onStartMission(selectedScenario);
          }}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-space-950 font-heading font-black text-base sm:text-lg tracking-widest uppercase shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          <span>INICIAR MISIÓN: {selectedScenario.name.split('—')[0].trim()}</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs font-mono text-slate-500 border-t border-slate-800/80">
        MARS-1 Simulator v1.0.0 | Desarrollado para Hackathon STEM | Diseñado según directivas de soporte vital de la NASA
      </footer>
    </div>
  );
};

