import React, { useState } from 'react';
import { SPECIALIZED_AGENTS, AgentOrchestrator } from '../../services/aiOrchestrator/agentOrchestrator';
import { AgentDescriptor, AgentExecutionTrace } from '../../types';
import { Bot, Send, Sparkles, Terminal, CheckCircle2, ChevronRight, Layers, Shield } from 'lucide-react';

export const AgentOrchestratorView: React.FC = () => {
  const [queryInput, setQueryInput] = useState<string>(
    '¿Qué impacto técnico y de incentivos tiene el Pull Request de Cluster Mempool sobre las transacciones v3 en Lightning?'
  );
  const [selectedAgent, setSelectedAgent] = useState<AgentDescriptor>(SPECIALIZED_AGENTS[0]);
  const [executionTrace, setExecutionTrace] = useState<AgentExecutionTrace | null>(() =>
    AgentOrchestrator.executePipeline(
      '¿Qué impacto técnico y de incentivos tiene el Pull Request de Cluster Mempool sobre las transacciones v3 en Lightning?'
    )
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunQuery = () => {
    if (!queryInput.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const trace = AgentOrchestrator.executePipeline(queryInput);
      setExecutionTrace(trace);
      setIsProcessing(false);
    }, 450);
  };

  const handleSelectSample = (sample: string) => {
    setQueryInput(sample);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Bot className="w-3.5 h-3.5" />
            <span>AUTONOMOUS SPECIALIZED MULTI-AGENT SWARM & ROUTER</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">AI AGENT ORCHESTRATOR</h1>
          <p className="text-xs text-slate-400">
            Enrutamiento inteligente entre 10 agentes especializados (Bitcoin Core, Security Auditor, DeFi Analyst, Quant, Regulatory, etc.).
          </p>
        </div>
      </div>

      {/* Query Dispatch Box */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F7931A]" />
            <span>Consulta Multidisciplinaria al Swarm de Agentes</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
              placeholder="Escribe tu consulta técnica (ej. ¿Cómo auditar este swap? ¿Qué implica el BIP 119?)..."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg pl-4 pr-28 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F7931A]"
            />
            <button
              onClick={handleRunQuery}
              disabled={isProcessing}
              className="absolute right-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#F7931A] hover:bg-[#e08213] rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{isProcessing ? 'Enrutando...' : 'Despachar'}</span>
            </button>
          </div>
        </div>

        {/* Sample Query Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-500 text-[11px] whitespace-nowrap">Ejemplos:</span>
          {SPECIALIZED_AGENTS.slice(0, 4).map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleSelectSample(agent.sampleQuery)}
              className="px-2.5 py-1 rounded bg-[#0F172A] border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {agent.name}: {agent.sampleQuery.slice(0, 38)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Pane: Roster of Agents & Traceable Synthesis Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agent Roster */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Agentes Especializados Disponibles ({SPECIALIZED_AGENTS.length})
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {SPECIALIZED_AGENTS.map((agent) => {
              const isSelected = selectedAgent.id === agent.id;
              const isDispatched = executionTrace?.dispatchedAgents.includes(agent.name);
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F172A] border-[#F7931A]'
                      : 'bg-[#0A0E17] border-[#1E293B] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{agent.name}</span>
                    {isDispatched && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{agent.role}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Orchestrated Execution Trace */}
        <div className="lg:col-span-8 space-y-4">
          {executionTrace && (
            <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <span className="text-xs font-mono text-[#F7931A]">TRAZA DE EJECUCIÓN ORQUESTADA</span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Timestamp: {executionTrace.timestamp} · ID: {executionTrace.id}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{executionTrace.dispatchedAgents.length} Agentes Asignados</span>
                </div>
              </div>

              {/* Reasoning Step Box */}
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1 text-xs">
                <span className="font-mono text-[#F7931A] font-semibold text-[11px] uppercase">
                  Paso de Razonamiento del Orchestrator
                </span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                  {executionTrace.reasoningStep}
                </p>
              </div>

              {/* Multi-Agent Output Synthesis */}
              <div className="bg-[#05080E] p-5 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-3 max-h-[420px] overflow-y-auto">
                <div className="prose prose-invert prose-xs max-w-none whitespace-pre-line">
                  {executionTrace.output}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
