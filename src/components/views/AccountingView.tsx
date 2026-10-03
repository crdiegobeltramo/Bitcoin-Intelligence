import React, { useState } from 'react';
import { ACCOUNTING_FRAMEWORKS } from '../../services/dataProviders/accountingProvider';
import { AccountingFramework } from '../../types';
import { Calculator, BookOpen, CheckCircle2, ShieldCheck, ExternalLink, Info } from 'lucide-react';

export const AccountingView: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<AccountingFramework>(ACCOUNTING_FRAMEWORKS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Calculator className="w-3.5 h-3.5" />
            <span>FINANCIAL REPORTING, IFRS & LOCAL TAXATION</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">BITCOIN ACCOUNTING & TAX INTELLIGENCE</h1>
          <p className="text-xs text-slate-400">
            Doctrina contable internacional (NIIF / NIC 38, NIC 2, NIIF 13) y marco fiscal en Argentina (ARCA, FACPCE, CPCE).
          </p>
        </div>

        <div className="text-xs bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg max-w-sm text-slate-300">
          <strong className="text-slate-200">Aviso Profesional Contable:</strong> Elaborado conforme a las interpretaciones del IFRIC y resoluciones técnicas. No sustituye la auditoría formal de estados contables ni la liquidación impositiva individual.
        </div>
      </div>

      {/* Two Column Layout: Standards Selector & Specification Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Standard Selection List */}
        <div className="lg:col-span-5 space-y-3">
          {ACCOUNTING_FRAMEWORKS.map((fw) => {
            const isSelected = selectedStandard.standard === fw.standard;
            return (
              <div
                key={fw.standard}
                onClick={() => setSelectedStandard(fw)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] border-emerald-500 shadow-md'
                    : 'bg-[#0A0E17] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-emerald-400">{fw.standard}</span>
                  <span className="text-slate-400 font-mono-nums text-[11px]">{fw.jurisdiction}</span>
                </div>
                <div className="text-xs font-semibold text-white leading-snug">
                  {fw.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {fw.scope}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Technical Dossier */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
            <div className="border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <span>NORMA TÉCNICA · {selectedStandard.standard}</span>
                <span>·</span>
                <span>{selectedStandard.jurisdiction}</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {selectedStandard.title}
              </h2>
            </div>

            {/* Scope & Measurement Model */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Alcance y Criterio de Aplicación</span>
                <p className="text-slate-200 leading-relaxed">{selectedStandard.scope}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Modelo de Medición Contable</span>
                <div className="text-sm font-semibold text-emerald-300 font-mono-nums">{selectedStandard.measurementModel}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Tratamiento Fiscal / Ganancias y Bienes Personales</span>
                <p className="text-slate-200 leading-relaxed">{selectedStandard.taxImplications}</p>
              </div>
            </div>

            {/* Audit Evidence Checklist */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Evidencia de Auditoría Requerida para Dictamen Limpio</span>
              </h3>

              <div className="space-y-2">
                {selectedStandard.auditEvidenceRequired.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded bg-[#080B10] border border-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Source Badge */}
            <div className="p-3 rounded-lg bg-[#080B10] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div>
                <strong className="text-slate-300">Fuente Oficial Primaria:</strong> {selectedStandard.officialSource}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
