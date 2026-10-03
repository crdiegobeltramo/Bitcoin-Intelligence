import React, { useState } from 'react';
import { PROMPT_LIBRARY } from '../../services/knowledge/promptLibrary';
import { PromptTemplate } from '../../types';
import { Compass, Copy, Check, Play, Edit3, Filter } from 'lucide-react';

interface PromptLibraryViewProps {
  onExecutePrompt?: (promptText: string) => void;
}

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ onExecutePrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  const categories = ['ALL', 'DeFi & DEX', 'Security Audit', 'Solidity', 'Bitcoin Core', 'On-Chain Analytics', 'Testing & Formal Verification'];

  const filtered = PROMPT_LIBRARY.filter(
    (p) => selectedCategory === 'ALL' || p.category === selectedCategory
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Compass className="w-3.5 h-3.5" />
            <span>EXPERT PROMPT REPOSITORY & WORKFLOW TEMPLATES</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">PROMPT ENGINEERING LAB</h1>
          <p className="text-xs text-slate-400">
            Biblioteca de prompts de alta precisión para arquitectura Web3, auditoría de contratos, análisis on-chain y consensos.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#1E293B] text-[#F7931A] font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
            }`}
          >
            {cat === 'ALL' ? 'Todas las Categorías' : cat}
          </button>
        ))}
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-[#0F172A] border border-slate-800 text-cyan-300">
                  {item.category}
                </span>
                <span className="text-slate-500 text-[11px]">Rol: {item.targetRole}</span>
              </div>

              <h2 className="text-sm font-bold text-white">{item.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#05080E] border border-slate-800 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap font-sans text-xs">{item.promptText}</pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleCopy(item.id, item.promptText)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 transition-colors"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? 'Copiado' : 'Copiar'}</span>
              </button>
              {onExecutePrompt && (
                <button
                  onClick={() => onExecutePrompt(item.promptText)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-[#F7931A] hover:bg-[#e08213] text-white font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Cargar en Agente</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
