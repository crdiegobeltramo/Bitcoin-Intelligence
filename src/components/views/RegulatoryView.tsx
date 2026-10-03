import React, { useState } from 'react';
import { REGULATORY_DATABASE } from '../../services/dataProviders/regulatoryProvider';
import { RegulatoryItem } from '../../types';
import { Scale, ExternalLink, ShieldAlert, Globe, Filter } from 'lucide-react';

export const RegulatoryView: React.FC = () => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');

  const filtered = REGULATORY_DATABASE.filter((item) => {
    if (selectedJurisdiction === 'ALL') return true;
    if (selectedJurisdiction === 'Argentina') return item.jurisdiction === 'Argentina';
    return item.jurisdiction !== 'Argentina';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Scale className="w-3.5 h-3.5" />
            <span>FINANCIAL REGULATION & VASP SUPERVISION RADAR</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">INTELIGENCIA REGULATORIA</h1>
          <p className="text-xs text-slate-400">
            Supervisión normativa en Argentina (CNV, ARCA, UIF, BCRA) y jurisprudencias internacionales (MiCA, SEC, Brasil, El Salvador).
          </p>
        </div>

        {/* Regulatory disclaimer */}
        <div className="text-xs text-slate-400 bg-[#0F172A] p-2.5 rounded-lg border border-slate-800 max-w-sm">
          <strong className="text-slate-200">Aviso Jurídico:</strong> La información provista es de carácter técnico-educativo y referencial. No constituye dictamen, asesoramiento legal ni patrocinio profesional vinculante.
        </div>
      </div>

      {/* Jurisdiction Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedJurisdiction('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedJurisdiction === 'ALL'
              ? 'bg-[#1E293B] text-white border border-slate-700'
              : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
          }`}
        >
          Todas las Jurisdicciones
        </button>
        <button
          onClick={() => setSelectedJurisdiction('Argentina')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedJurisdiction === 'Argentina'
              ? 'bg-[#1E293B] text-[#F7931A] font-medium border border-slate-700'
              : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
          }`}
        >
          Argentina (CNV / ARCA / UIF)
        </button>
        <button
          onClick={() => setSelectedJurisdiction('International')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedJurisdiction === 'International'
              ? 'bg-[#1E293B] text-cyan-400 font-medium border border-slate-700'
              : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
          }`}
        >
          Internacional (MiCA / SEC / Brasil / El Salvador)
        </button>
      </div>

      {/* Regulatory Cards Feed */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white bg-[#0F172A] px-2 py-0.5 rounded border border-slate-800">
                  {item.jurisdiction}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-cyan-400 font-semibold">{item.agency}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 font-mono-nums">{item.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                    item.status === 'Vigente'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
                <a
                  href={item.primarySourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-white p-1"
                  title="Ver norma oficial en fuente primaria"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {item.normReference}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                {item.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-900">
              <div className="p-2.5 rounded bg-[#0F172A] border border-slate-800 text-slate-300">
                <strong className="text-slate-200">Sujetos Alcanzados:</strong> {item.affectedParties}
              </div>
              <div className="p-2.5 rounded bg-[#0F172A] border border-slate-800 text-slate-400">
                <strong className="text-slate-300">Delimitación:</strong> {item.disclaimer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
