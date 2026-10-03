import React, { useState } from 'react';
import { CORE_CHANGES } from '../../services/dataProviders/bitcoinCoreProvider';
import { BitcoinCoreChange } from '../../types';
import { GitBranch, GitPullRequest, ShieldAlert, ExternalLink, Code2, Bot, HelpCircle, CheckCircle2 } from 'lucide-react';

export const CoreWatchView: React.FC = () => {
  const [subsystemFilter, setSubsystemFilter] = useState<string>('ALL');
  const [selectedChange, setSelectedChange] = useState<BitcoinCoreChange>(CORE_CHANGES[0]);
  const [activeQuestion, setActiveQuestion] = useState<string | null>('¿Qué cambió?');

  const filteredChanges = CORE_CHANGES.filter((c) => {
    return subsystemFilter === 'ALL' || c.subsystem === subsystemFilter;
  });

  const getExplanationAnswer = (question: string, change: BitcoinCoreChange) => {
    switch (question) {
      case '¿Qué cambió?':
        return `En el cambio "${change.title}", el autor modificó la lógica en el subsistema ${change.subsystem}. El fragmento de diff muestra:\n${change.diffSnippet}\n\nSe ajustan las condiciones de control e invariantes para asegurar que la ejecución se mantenga acotada en tiempo y memoria.`;
      case '¿Por qué importa?':
        return `Este cambio es relevante para la estabilidad del nodo completo. ${change.impactSummary} Optimiza la eficiencia de validación de los pares y reduce el riesgo de divergencias en la regla de la cadena.`;
      case '¿Qué componente afecta?':
        return `Afecta directamente al módulo: ${change.subsystem}. Los nodos que compilan Bitcoin Core v28+ validan estas reglas de forma nativa. Si es consenso, todos los nodos deben verificar la misma invariante.`;
      case '¿Tiene implicancias de seguridad?':
        return change.hasSecurityImplications
          ? `SÍ. Tiene implicancias de endurecimiento de seguridad. Protege frente a vectores de desbordamiento, espionaje en la capa de red o ataques de agotamiento de recursos (DoS).`
          : `NO presenta vectores críticos de vulnerabilidad. Se trata de optimización económica, interoperabilidad o refactorización de código limpio.`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <GitBranch className="w-3.5 h-3.5" />
            <span>BITCOIN CORE · REPOSITORIO & RELEASES (GITHUB WATCH)</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">BITCOIN CODE WATCH</h1>
          <p className="text-xs text-slate-400">
            Monitoreo continuo de commits, pull requests de consenso, políticas de mempool y avisos de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/bitcoin/bitcoin"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 transition-colors"
          >
            <span>bitcoin/bitcoin GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Subsystem Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {['ALL', 'Consensus', 'Mempool', 'P2P', 'Security'].map((sub) => (
          <button
            key={sub}
            onClick={() => setSubsystemFilter(sub)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              subsystemFilter === sub
                ? 'bg-[#1E293B] text-[#F7931A] font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
            }`}
          >
            {sub === 'ALL' ? 'Todos los Subsistemas' : sub}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Feed & AI Code Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: PRs / Releases */}
        <div className="lg:col-span-5 space-y-3">
          {filteredChanges.map((change) => {
            const isSelected = selectedChange.id === change.id;
            return (
              <div
                key={change.id}
                onClick={() => {
                  setSelectedChange(change);
                  setActiveQuestion('¿Qué cambió?');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] border-[#F7931A]'
                    : 'bg-[#0A0E17] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-semibold">{change.subsystem}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 font-mono-nums">{change.date}</span>
                  </div>
                  {change.hasSecurityImplications && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                      <ShieldAlert className="w-3 h-3" />
                      <span>SEGURIDAD</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-white leading-snug">
                  {change.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Autor: {change.author} {change.prNumber ? `· PR #${change.prNumber}` : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: AI Code Explainer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#F7931A]" />
                <h2 className="text-sm font-bold text-white">
                  Diff de Código: {selectedChange.title}
                </h2>
              </div>
              <a
                href={selectedChange.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>Ver en GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Code Diff Box */}
            <div className="bg-[#05080E] p-4 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300">
              <pre>{selectedChange.diffSnippet}</pre>
            </div>

            {/* AI Code Explainer Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Code Explainer · Asistente de Inspección
                </h3>
              </div>

              {/* Question Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['¿Qué cambió?', '¿Por qué importa?', '¿Qué componente afecta?', '¿Tiene implicancias de seguridad?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setActiveQuestion(q)}
                    className={`p-2 rounded-lg text-xs font-medium text-left transition-colors border ${
                      activeQuestion === q
                        ? 'bg-[#1E293B] text-white border-[#F7931A]'
                        : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Explainer Response Box */}
              {activeQuestion && (
                <div className="p-4 rounded-lg bg-[#0C1322] border border-cyan-950/60 space-y-2">
                  <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeQuestion}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {getExplanationAnswer(activeQuestion, selectedChange)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
