import React, { useState } from 'react';
import { STEM_KNOWLEDGE_CARDS, STEM_GLOSSARY, STEMCard } from '../engine/stemKnowledge';
import { BookOpen, X, Search, Sparkles, Award, ExternalLink, HelpCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { DATA_SOURCES, REAL_EVENTS, SPACE_WEATHER_CATALOG, nasaImagePage, nasaImageSrc } from '../domain/sources';
import { NasaLivePanel } from './NasaLivePanel';

interface STEMLearningCenterProps {
  onClose: () => void;
  initialCardId?: string | null;
}

export const STEMLearningCenter: React.FC<STEMLearningCenterProps> = ({
  onClose,
  initialCardId,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'glossary' | 'sources'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(initialCardId || null);

  const categories = [
    'all',
    'ECLSS y Soporte Vital',
    'Energía y Fotónica',
    'Radiación y Física Espacial',
    'Ingeniería y Materiales',
  ];

  const filteredCards = STEM_KNOWLEDGE_CARDS.filter((card) => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredGlossary = STEM_GLOSSARY.filter((term) => {
    return (
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-space-900 border border-violet-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-space-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-heading font-black uppercase tracking-wider text-slate-100">
                  Centro de Aprendizaje STEM Aeroespacial
                </h2>
                <span className="text-[10px] font-mono bg-violet-900/60 text-violet-300 border border-violet-500/30 px-1.5 py-0.2 rounded">
                  NASA Standards
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Aprende los principios científicos y tecnológicos que rigen la supervivencia fuera de la Tierra.
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

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-800 bg-space-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'cards'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-space-900 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              Fichas Científicas ({STEM_KNOWLEDGE_CARDS.length})
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'glossary'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-space-900 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              Glosario Aeroespacial ({STEM_GLOSSARY.length})
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'sources'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-space-900 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              Fuentes NASA ({DATA_SOURCES.length + REAL_EVENTS.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar concepto o tecnología..."
              className="w-full bg-space-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-400 font-mono"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'cards' && (
            <>
              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                      selectedCategory === cat
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 font-bold'
                        : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat === 'all' ? 'Todas las Categorías' : cat}
                  </button>
                ))}
              </div>

              {/* Cards list */}
              <div className="space-y-3">
                {filteredCards.map((card) => {
                  const isExpanded = expandedCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      className="p-4 rounded-xl bg-space-950/70 border border-slate-800 hover:border-violet-500/40 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-violet-400 font-semibold tracking-wider">
                            {card.category}
                          </span>
                          <h3 className="text-sm font-heading font-bold text-slate-100 mt-0.5">
                            {card.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            soundService.playClick();
                            setExpandedCardId(isExpanded ? null : card.id);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-violet-950 text-violet-300 border border-violet-500/30 hover:bg-violet-900 transition-colors shrink-0"
                        >
                          {isExpanded ? 'Contraer' : 'Leer Lección'}
                        </button>
                      </div>

                      <div className="text-xs text-amber-300/90 font-mono font-medium flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{card.keyQuestion}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{card.summary}</p>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs font-sans animate-in fade-in">
                          <div className="p-3 rounded-lg bg-space-900 border border-slate-700/60 leading-relaxed text-slate-200">
                            <strong className="block text-violet-300 font-mono font-bold mb-1">
                              Explicación Técnica y Física:
                            </strong>
                            {card.detailedExplanation}
                          </div>

                          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 leading-relaxed">
                            <strong className="block text-cyan-300 font-mono font-bold mb-1 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> Caso Real de Misión Aeroespacial:
                            </strong>
                            {card.realWorldMissionExample}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {card.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-heading font-black uppercase tracking-wider text-amber-300 mb-2">
                  Esto pasó de verdad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REAL_EVENTS.map((ev) => (
                    <div key={ev.id} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                      {ev.images.map((image) => (
                        <figure key={image.nasaId} className="space-y-1">
                          <img
                            src={nasaImageSrc(image)}
                            alt={image.caption}
                            loading="lazy"
                            className="w-full rounded-lg border border-slate-700 bg-black"
                          />
                          <figcaption className="text-[10px] text-slate-400 leading-snug">
                            {image.caption}{' '}
                            <a
                              href={nasaImagePage(image)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 underline"
                            >
                              Foto {image.nasaId} · {image.credit}
                            </a>
                          </figcaption>
                        </figure>
                      ))}
                      <span className="text-[10px] font-mono text-amber-300">{ev.date}</span>
                      <p className="text-xs font-heading font-black text-slate-100">{ev.title}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.whatHappened}</p>
                      <p className="text-[11px] text-cyan-300 leading-relaxed">
                        <strong>En el juego:</strong> {ev.inTheGame}
                      </p>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 underline"
                      >
                        <ExternalLink className="w-3 h-3" /> {ev.sourceName}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <NasaLivePanel />
              <div>
                <h3 className="text-xs font-heading font-black uppercase tracking-wider text-emerald-300 mb-2">
                  De dónde sale cada número
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DATA_SOURCES.map((src) => (
                    <div key={src.id} className="p-3.5 rounded-xl bg-space-950/70 border border-slate-800 space-y-1.5">
                      <p className="text-xs font-heading font-black text-cyan-400">{src.gameValue}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{src.fact}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>En el juego:</strong> {src.usedIn}
                      </p>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 underline"
                      >
                        <ExternalLink className="w-3 h-3" /> {src.sourceName}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cada tormenta solar queda registrada en el catálogo público{' '}
                <a href={SPACE_WEATHER_CATALOG.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
                  {SPACE_WEATHER_CATALOG.name}
                </a>
                . Los valores del juego se simplificaron para jugar por turnos, pero parten de estas mediciones.
              </p>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGlossary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-space-950/70 border border-slate-800 space-y-1.5"
                >
                  <span className="text-xs font-heading font-black text-cyan-400">{item.term}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20">
                    <strong>Contexto Real:</strong> {item.realContext}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 border-t border-slate-800 bg-space-950 text-center text-[11px] font-mono text-slate-500">
          * Los conceptos presentados se basan en investigaciones de la NASA y la ESA. Ciertas ecuaciones han sido discretizadas para permitir la jugabilidad por turnos.
        </div>
      </div>
    </div>
  );
};

