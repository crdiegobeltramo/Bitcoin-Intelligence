import React, { useState } from 'react';
import { BITCOIN_TIMELINE } from '../../services/knowledge/timelineEvents';
import { History, Calendar, CheckCircle2 } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = BITCOIN_TIMELINE.filter(
    (e) => selectedCategory === 'ALL' || e.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <History className="w-3.5 h-3.5" />
            <span>CHRONOLOGY OF CONSENSUS & MILESTONES (2008 - 2026)</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">LÍNEA DE TIEMPO HISTÓRICA</h1>
          <p className="text-xs text-slate-400">
            Evolución cronológica de Bitcoin: desde el Whitepaper de Satoshi Nakamoto hasta los hitos de adopción global.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {['ALL', 'Genesis', 'Protocol', 'Halving', 'Regulatory'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1E293B] text-[#F7931A] font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-white bg-[#0A0E17] border border-[#1E293B]'
              }`}
            >
              {cat === 'ALL' ? 'Todos los Hitos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative border-l border-[#1E293B] ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
        {filtered.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#080B10] border-2 border-[#F7931A] group-hover:scale-125 transition-transform" />

            {/* Event Box */}
            <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] hover:border-slate-700 transition-colors space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#F7931A] font-bold text-sm">{item.year}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono-nums">{item.date}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-[#0F172A] border border-slate-800 text-cyan-300">
                  {item.category}
                </span>
              </div>

              <h2 className="text-base font-bold text-white group-hover:text-[#F7931A] transition-colors">
                {item.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              <div className="text-[11px] text-slate-400 bg-[#0F172A] p-2.5 rounded border border-slate-800 mt-2">
                <strong className="text-slate-200">Trascendencia Criptográfica:</strong> {item.significance}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
