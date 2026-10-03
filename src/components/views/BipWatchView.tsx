import React, { useState } from 'react';
import { BIP_REGISTRY } from '../../services/dataProviders/bitcoinCoreProvider';
import { BipEntry } from '../../types';
import { Layers, Search, ExternalLink, Filter, AlertCircle, ArrowUpRight } from 'lucide-react';

export const BipWatchView: React.FC = () => {
  const [filterLayer, setFilterLayer] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBip, setSelectedBip] = useState<BipEntry | null>(BIP_REGISTRY[0]);

  const filteredBips = BIP_REGISTRY.filter((bip) => {
    const matchesSearch =
      bip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bip.number.toString().includes(searchTerm) ||
      bip.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bip.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLayer = filterLayer === 'ALL' || bip.layer === filterLayer;
    const matchesStatus = filterStatus === 'ALL' || bip.status === filterStatus;

    return matchesSearch && matchesLayer && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Layers className="w-3.5 h-3.5" />
            <span>BITCOIN IMPROVEMENT PROPOSALS · REGISTRO TÉCNICO</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">BIP WATCH</h1>
          <p className="text-xs text-slate-400">
            Monitoreo y análisis riguroso de propuestas de mejora de Bitcoin. Una propuesta en borrador no representa un cambio adoptado por consenso.
          </p>
        </div>

        {/* Disclaimer reminder */}
        <div className="text-xs text-slate-400 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800 max-w-md">
          <strong className="text-slate-200">Principio de Consenso:</strong> Ningún BIP se activa sin amplio consenso técnico de los operadores de nodos completos y desarrolladores.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-[#0A0E17] border border-[#1E293B]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número (ej. 340, 119), título, autor o concepto..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0F172A] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#F7931A]"
          />
        </div>

        {/* Layer Filter Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs">
          {['ALL', 'Consensus', 'Peer-to-Peer', 'Applications'].map((layer) => (
            <button
              key={layer}
              onClick={() => setFilterLayer(layer)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                filterLayer === layer
                  ? 'bg-[#1E293B] text-[#F7931A] font-medium border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer === 'ALL' ? 'Todas las Capas' : layer}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Workspace: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of BIPs */}
        <div className="lg:col-span-5 space-y-2 max-h-[680px] overflow-y-auto pr-1">
          {filteredBips.map((bip) => {
            const isSelected = selectedBip?.number === bip.number;
            return (
              <div
                key={bip.number}
                onClick={() => setSelectedBip(bip)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#0F172A] border-[#F7931A] shadow-md'
                    : 'bg-[#0A0E17] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#F7931A]">BIP {bip.number}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{bip.layer}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                      bip.status === 'Final'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : bip.status === 'Proposed'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {bip.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white truncate">
                  {bip.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  Autores: {bip.author}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Specification View */}
        <div className="lg:col-span-7">
          {selectedBip ? (
            <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#1E293B] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A] mb-1">
                    <span>PROPUESTA DE MEJORA #{selectedBip.number}</span>
                    <span>·</span>
                    <span>{selectedBip.type}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedBip.title}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Autor(es): <strong className="text-slate-200">{selectedBip.author}</strong> · Fecha: {selectedBip.date}
                  </div>
                </div>

                <a
                  href={selectedBip.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 transition-colors shrink-0"
                >
                  <span>GitHub BIP</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Status & Dependencies Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-nums">
                <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">ESTADO ACTUAL</span>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedBip.status}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">CAPA DE PROTOCOLO</span>
                  <div className="text-sm font-semibold text-cyan-400 mt-0.5">{selectedBip.layer}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">DEPENDENCIAS</span>
                  <div className="text-sm font-semibold text-slate-300 mt-0.5">{selectedBip.dependencies}</div>
                </div>
              </div>

              {/* Technical Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resumen Técnico de la Propuesta
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed bg-[#0F172A] p-4 rounded-lg border border-slate-800">
                  {selectedBip.summary}
                </p>
              </div>

              {/* Impact on Consensus / Node Operations */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Impacto en Consenso, Tamaño en Bloque y Rendimiento
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed bg-[#0C1322] p-4 rounded-lg border border-slate-800">
                  {selectedBip.technicalImpact}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-[#0A0E17] rounded-xl border border-[#1E293B]">
              Selecciona una propuesta de la lista para ver la ficha técnica completa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
