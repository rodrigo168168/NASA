import React from 'react';
import { HelpCircle, X, Shield, Zap, HeartPulse, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-space-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-space-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-black uppercase tracking-wider text-slate-100">
                Manual de Instrucciones del Comandante
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Protocolos de Supervivencia y Operación de Puestos de Avanzada Extraterrestres
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans text-slate-300">
          {/* Main objective */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
            <h3 className="font-heading font-bold text-cyan-300 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Objetivo de la Misión
            </h3>
            <p className="leading-relaxed">
              Como Comandante de la base espacial, tu meta es <strong>sobrevivir con tu tripulación durante los Soles que elijas, de 5 a 60 (15 por defecto). En misiones largas llega una nave de carga con el relevo cada 15 Soles</strong>. Para lograrlo, debes mantener un balance positivo o estable en los 4 recursos fundamentales y responder a emergencias aeroespaciales en tiempo real.
            </p>
          </div>

          {/* Core rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-heading font-bold">
                <Zap className="w-4 h-4" />
                <span>1. Energía Eléctrica</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                La base requiere energía para soportar el hábitat, las bombas de oxígeno y las lámparas del invernadero. Si tus baterías llegan a 0 kWh, se producirá un apagón que causará hipotermia y fallos en cadena. Limpia el polvo de los paneles o construye un generador Stirling de respaldo.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-heading font-bold">
                <HeartPulse className="w-4 h-4" />
                <span>2. Soporte Vital (ECLSS)</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Tus 4 astronautas consumen O2 (~3.36 kg/sol), agua (~10 L/sol) y alimentos. El reciclaje Sabatier recupera agua y oxígeno, mientras que el invernadero produce biomasa y O2 fotosintético. ¡Nunca dejes que el agua o el oxígeno lleguen a 0!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-violet-400 font-heading font-bold">
                <Shield className="w-4 h-4" />
                <span>3. Blindaje de Radiación</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                En Marte y la Luna, los rayos cósmicos y las fulguraciones solares penetran sin resistencia. Mantén la integridad del domo de regolito o activa el <em>Modo Escudo Total</em> ante alertas de tormenta solar.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-heading font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Políticas Estratégicas</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Alterna entre <strong>Supervivencia</strong> (ahorro de energía cuando las reservas son escasas), <strong>Producción</strong> (cuando necesites acelerar cosechas) y <strong>Escudo Total</strong> (para repeler eventos solares de alta radiación).
              </p>
            </div>
          </div>

          {/* Turn Flow */}
          <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <h4 className="font-heading font-bold text-slate-200">Flujo de Cada Sol</h4>
            <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-300">
              <li>Revisa la telemetría y el balance neto de energía y soporte vital.</li>
              <li>Ajusta la directiva operacional (Supervivencia, Producción o Escudo).</li>
              <li>Ejecuta mejoras o reparaciones en el Centro de Ingeniería si tienes créditos.</li>
              <li>Pulsa <strong>"AVANZAR SOL"</strong> para procesar la simulación física del ciclo.</li>
              <li>Resuelve cualquier anomalía o descubrimiento científico que surja.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-space-950 text-right">
          <button
            onClick={() => {
              soundService.playConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-heading font-bold text-xs"
          >
            ENTENDIDO, VOLVER AL CENTRO DE CONTROL
          </button>
        </div>
      </div>
    </div>
  );
};

