import React, { useState } from 'react';
import { CONTRACT_TEMPLATES, ContractTemplate } from '../../services/security/contractTemplates';
import { NavigationSection } from '../../types';
import { Code2, Copy, Check, ShieldCheck, FileCode, Play, Terminal, Shield, ArrowRight } from 'lucide-react';

interface SmartContractLabViewProps {
  onNavigate?: (section: NavigationSection) => void;
}

export const SmartContractLabView: React.FC<SmartContractLabViewProps> = ({ onNavigate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate>(CONTRACT_TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<'CODE' | 'TESTS' | 'SECURITY'>('CODE');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'CODE' ? selectedTemplate.solidityCode : selectedTemplate.testSuiteCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Code2 className="w-3.5 h-3.5" />
            <span>SOLIDITY SMART CONTRACT LAB & FACTORY</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">SMART CONTRACT LAB</h1>
          <p className="text-xs text-slate-400">
            Plantillas profesionales probadas en batalla (ERC-20, Multisig, Staking) con suites de prueba y notas de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('openzeppelin')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-cyan-800 text-cyan-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Abrir OpenZeppelin v5 Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Código'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {CONTRACT_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => setSelectedTemplate(tmpl)}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all border ${
              selectedTemplate.id === tmpl.id
                ? 'bg-[#1E293B] text-[#F7931A] border-[#F7931A] shadow'
                : 'bg-[#0A0E17] text-slate-400 border-[#1E293B] hover:text-white'
            }`}
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* Main Workspace */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">{selectedTemplate.name}</h2>
            <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0F172A] rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('CODE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'CODE' ? 'bg-[#1E293B] text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solidity (.sol)
            </button>
            <button
              onClick={() => setActiveTab('TESTS')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'TESTS' ? 'bg-[#1E293B] text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Test Suite (.ts)
            </button>
            <button
              onClick={() => setActiveTab('SECURITY')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'SECURITY' ? 'bg-[#1E293B] text-[#F7931A] font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Revisión de Seguridad
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        {activeTab === 'CODE' && (
          <div className="bg-[#05080E] p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
            <pre>{selectedTemplate.solidityCode}</pre>
          </div>
        )}

        {activeTab === 'TESTS' && (
          <div className="bg-[#05080E] p-4 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[500px]">
            <pre>{selectedTemplate.testSuiteCode}</pre>
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Notas de Seguridad & Buenas Prácticas del Patrón</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {selectedTemplate.securityNotes}
            </p>
            <div className="p-3 rounded bg-[#080B10] border border-slate-900 text-slate-400 text-[11px]">
              <strong className="text-slate-200">Preliminary AI Security Review:</strong> Este contrato ha sido analizado para mitigar reentrancia, desbordamiento de enteros (vía Solidity 0.8+) y accesos no autorizados.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
