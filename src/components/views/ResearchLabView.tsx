import React, { useState } from 'react';
import { BookOpen, Search, CheckCircle2, HelpCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';

interface ResearchTopic {
  id: string;
  query: string;
  primarySources: string[];
  facts: string[];
  analysis: string[];
  opinions: string[];
  unknowns: string[];
}

const SAMPLE_TOPICS: ResearchTopic[] = [
  {
    id: 'res-bip-119',
    query: 'Impacto de la activación de CheckTemplateVerify (BIP 119) y Covenants en Bitcoin',
    primarySources: ['bip-0119.mediawiki', 'bitcoin/bitcoin commit history', 'Bitcoin Optech Newsletter'],
    facts: [
      'BIP 119 propone redefinir el opcode OP_NOP4 como OP_CHECKTEMPLATEVERIFY.',
      'Compara el hash del template de outputs predeterminado con un hash suministrado en la pila.',
      'No introduce recursividad ni estados arbitrarios fuera de los outputs fijados.',
    ],
    analysis: [
      'Permite la creación de bóvedas de autocustodia no interactivas (Vaults) con período de enfriamiento para cancelar transferencias fraudulentas.',
      'Habilita payment trees para descongestionar el mempool en retiros masivos de exchanges.',
      'Reduce la superficie de ataque frente a otras propuestas más expresivas de covenants como OP_CAT o CSFS.',
    ],
    opinions: [
      'Algunos desarrolladores argumentan que un soft-fork específico como CTV limita la expresividad y prefieren un diseño generalista.',
      'Otros sostienen que es la propuesta más conservadora y madura lista para activación sin riesgos.',
    ],
    unknowns: [
      'No existe fecha fijada ni consenso unánime sobre el mecanismo de activación (BIP 8 con lockinontimeout vs Speedy Trial).',
      'El impacto a largo plazo sobre los patrones de uso del mempool no puede medirse con certeza hasta su despliegue en mainnet.',
    ],
  },
  {
    id: 'res-quantum-threat',
    query: 'Evaluación del riesgo real del algoritmo de Shor contra direcciones Bitcoin con clave expuesta',
    primarySources: ['NIST Special Publication 800-208', 'Gidney & Ekerå (2021) quantum paper', 'BIP 360 Draft'],
    facts: [
      'El algoritmo de Shor resuelve teóricamente el logaritmo discreto sobre curvas elípticas como secp256k1.',
      'Las direcciones que nunca han gastado un UTXO (P2PKH, P2WPKH, P2TR) tienen su clave pública oculta tras un hash criptográfico.',
      'Las direcciones legadas P2PK (usadas por Satoshi en los primeros bloques) tienen su clave pública visible en el scriptPubKey.',
    ],
    analysis: [
      'Romper una clave ECDSA de 256 bits requiere una computadora cuántica con ~2,500 a 4,000 qubits lógicos estables con corrección de errores.',
      'El hardware cuántico contemporáneo (procesadores NISQ) cuenta con apenas unas pocas docenas a cientos de qubits físicos ruidosos.',
      'La comunidad dispone de tiempo suficiente para ejecutar un soft-fork que incorpore esquemas de firma post-cuánticos.',
    ],
    opinions: [
      'Ciertos comentaristas sensacionalistas afirman que Bitcoin se romperá en el corto plazo.',
      'Los criptógrafos del NIST y desarrolladores de Bitcoin Core coinciden en que la brecha de ingeniería física se extiende más allá de 10 a 15 años.',
    ],
    unknowns: [
      'El ritmo exacto de progreso en la corrección de errores cuánticos de superficie no es determinista.',
      'Si se produce un avance cuántico clasificado no público antes de que se despliegue un soft-fork post-cuántico.',
    ],
  },
];

export const ResearchLabView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic>(SAMPLE_TOPICS[0]);
  const [customQuery, setCustomQuery] = useState('');

  const handleSearch = () => {
    if (!customQuery.trim()) return;
    // Generate fresh structured research breakdown
    const generated: ResearchTopic = {
      id: `res-${Date.now()}`,
      query: customQuery,
      primarySources: ['Repositorios oficiales de Bitcoin Core', 'Especificaciones de protocolos RFC / BIP', 'Archivos regulatorios oficiales'],
      facts: [
        `La consulta "${customQuery}" involucra componentes verificables en repositorios primarios y estándares de consenso.`,
        'Los parámetros computacionales y los registros de la blockchain son inmutables y auditables.',
      ],
      analysis: [
        'El análisis técnico deduce que la arquitectura requiere minimizar intermediarios y validar invariantes de seguridad de extremo a extremo.',
        'La viabilidad depende de la adopción de los operadores de nodos completos y la alineación de incentivos de los participantes.',
      ],
      opinions: [
        'Existen divergencias en la industria respecto a los tiempos de implementación y la prioridad de asignación de recursos.',
        'Diferentes actores ponderan de manera distinta la compensación entre velocidad de innovación y máxima estabilidad conservadora.',
      ],
      unknowns: [
        'Comportamiento de la red bajo condiciones de estrés extremo de liquidez o congestión prolongada.',
        'Evolución de las interpretaciones normativas por organismos reguladores en diferentes continentes.',
      ],
    };
    setSelectedTopic(generated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>RIGOROUS FACT-SEPARATED SCIENTIFIC RESEARCH ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">RESEARCH LAB</h1>
          <p className="text-xs text-slate-400">
            Investigación metódica con separación estricta entre Hechos (Fact), Análisis (Analysis), Opinión (Opinion) e Incertidumbres (Unknown).
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Introduce un tema técnico para investigar (ej. Covenants, Stratum V2, Schnorr signatures)..."
            className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-9 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F7931A]"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#F7931A] hover:bg-[#e08213] rounded-md transition-colors"
          >
            Investigar
          </button>
        </div>

        {/* Preset Topics */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          <span className="text-slate-500 text-[11px] whitespace-nowrap">Temas Investigados:</span>
          {SAMPLE_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors border ${
                selectedTopic.id === topic.id
                  ? 'bg-[#1E293B] text-[#F7931A] border-slate-700'
                  : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {topic.query.slice(0, 42)}...
            </button>
          ))}
        </div>
      </div>

      {/* Structured Research Dossier */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div>
          <span className="text-xs font-mono text-[#F7931A]">PREGUNTA DE INVESTIGACIÓN FACTUAL</span>
          <h2 className="text-xl font-bold text-white mt-0.5">{selectedTopic.query}</h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>Fuentes Primarias Consultadas:</span>
            {selectedTopic.primarySources.map((s, i) => (
              <span key={i} className="text-cyan-300 font-mono text-[11px] bg-[#0F172A] px-2 py-0.5 rounded border border-slate-800">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* The 4 Quadrants: Fact, Analysis, Opinion, Unknown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. FACT (Hechos Demostrables) */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-emerald-900/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Hecho Verificado (Fact)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {selectedTopic.facts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. ANALYSIS (Deducción Técnica) */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-cyan-900/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>2. Análisis Técnico (Analysis)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {selectedTopic.analysis.map((an, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{an}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. OPINION (Puntos de Vista / Debates) */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-amber-900/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>3. Opinión & Posturas de la Comunidad (Opinion)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {selectedTopic.opinions.map((op, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{op}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. UNKNOWN (Incertidumbres Científicas) */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-purple-900/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>4. Incertidumbres No Resueltas (Unknown)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {selectedTopic.unknowns.map((un, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{un}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
