import React, { useState } from 'react';
import { DailyReport } from '../../types';
import { Download, Printer, Copy, Check, ExternalLink, Calendar, ShieldCheck, Share2 } from 'lucide-react';

interface DailyIntelligenceViewProps {
  report: DailyReport;
}

export const DailyIntelligenceView: React.FC<DailyIntelligenceViewProps> = ({ report }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const copyAsMarkdown = () => {
    let md = `# BITCOIN DAILY INTELLIGENCE REPORT\n`;
    md += `**Fecha:** ${report.date} | **Actualizado:** ${report.updatedAt}\n`;
    md += `**BIS (Bitcoin Intelligence Score):** ${report.bis.score}/100 - ${report.bis.label}\n\n`;
    md += `## TOP 5 ACONTECIMIENTOS\n\n`;

    report.top5Events.forEach((e, i) => {
      md += `### ${i + 1}. [${e.category}] ${e.title}\n`;
      md += `- **Impacto:** ${e.impact} | **Fuente:** ${e.source}\n`;
      md += `- **Resumen:** ${e.summary}\n`;
      md += `- **Evidencia:** ${e.evidence}\n\n`;
    });

    md += `## DESARROLLOS POR ÁREA CLAVE\n\n`;
    md += `### Protocolo & Bitcoin Core\n${report.topTechnical.title}\n${report.topTechnical.summary}\n\n`;
    md += `### Regulación Internacional & Local\n${report.topRegulatory.title}\n${report.topRegulatory.summary}\n\n`;
    md += `### Minería & Consenso\n${report.topMining.title}\n${report.topMining.summary}\n\n`;
    md += `### Seguridad & Criptografía\n${report.topSecurity.title}\n${report.topSecurity.summary}\n\n`;
    md += `### IA & Computación Cuántica\n${report.topAiQuantum.title}\n${report.topAiQuantum.summary}\n\n`;
    md += `## CONCLUSIÓN EJECUTIVA\n${report.conclusion}\n\n`;
    md += `*Descargo de responsabilidad: Plataforma de inteligencia y desarrollo. No constituye asesoramiento financiero.*\n`;

    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const copyAsJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#F7931A] font-mono font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>BITCOIN DAILY INTELLIGENCE · INFORME OFICIAL</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Informe Diario de Inteligencia de Red
          </h1>
          <p className="text-xs text-slate-400">
            Fecha de emisión: {report.date} · Última actualización: {new Date(report.updatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyAsMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 transition-colors"
          >
            {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'md' ? 'Copiado MD' : 'Copiar Markdown'}</span>
          </button>
          <button
            onClick={copyAsJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 transition-colors"
          >
            {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'json' ? 'Copiado JSON' : 'Exportar JSON'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-white font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Body Container */}
      <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-6 sm:p-8 space-y-8 text-slate-200 print:bg-white print:text-black print:border-none">
        {/* Report Header */}
        <div className="border-b border-[#1E293B] pb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono-nums">
            <span>BITCOIN INTELLIGENCE OS · RESEARCH DEPARTMENT</span>
            <span>ID: BDIR-{report.date.replace(/-/g, '')}</span>
          </div>

          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            BITCOIN DAILY INTELLIGENCE
          </h2>

          <div className="flex items-center gap-4 text-xs font-mono-nums">
            <span className="text-slate-400">FECHA: {report.date}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">BIS SCORE: <strong className="text-[#F7931A]">{report.bis.score}/100</strong> ({report.bis.label})</span>
          </div>
        </div>

        {/* Section 1: Executive BIS Summary */}
        <div className="p-4 rounded-lg bg-[#0C1322] border border-[#1E293B] space-y-2">
          <div className="text-xs font-semibold text-[#F7931A] uppercase tracking-wide">
            1. Diagnóstico de Intensidad Informativa (BIS)
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {report.bis.summary}
          </p>
        </div>

        {/* Section 2: Top 5 Events */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            2. Top 5 Acontecimientos Clave de la Jornada
          </h3>

          <div className="space-y-4">
            {report.top5Events.map((evt, idx) => (
              <div key={evt.id} className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#F7931A] font-bold">EVENTO #{idx + 1} · {evt.category}</span>
                  <span className="text-slate-400 font-mono-nums">{evt.date} · Fuente: {evt.source}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{evt.summary}</p>
                <div className="text-[11px] text-slate-400 bg-[#080B10] p-2 rounded border border-slate-900">
                  <strong>Evidencia Factual:</strong> {evt.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Pillars Breakdown */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            3. Desarrollo Estructural por Áreas de Inteligencia
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-cyan-400">DESARROLLO TÉCNICO & PROTOCOLO</span>
              <h5 className="text-xs font-bold text-white">{report.topTechnical.title}</h5>
              <p className="text-xs text-slate-300">{report.topTechnical.summary}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-emerald-400">DESARROLLO DE MERCADO</span>
              <h5 className="text-xs font-bold text-white">{report.topMarket.title}</h5>
              <p className="text-xs text-slate-300">{report.topMarket.summary}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-amber-400">REGULACIÓN INTERNACIONAL</span>
              <h5 className="text-xs font-bold text-white">{report.topRegulatory.title}</h5>
              <p className="text-xs text-slate-300">{report.topRegulatory.summary}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-rose-400">SEGURIDAD & CRIPTOGRAFÍA</span>
              <h5 className="text-xs font-bold text-white">{report.topSecurity.title}</h5>
              <p className="text-xs text-slate-300">{report.topSecurity.summary}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-purple-400">MINERÍA & ENERGÍA</span>
              <h5 className="text-xs font-bold text-white">{report.topMining.title}</h5>
              <p className="text-xs text-slate-300">{report.topMining.summary}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-indigo-400">INTELIGENCIA ARTIFICIAL & CUÁNTICA</span>
              <h5 className="text-xs font-bold text-white">{report.topAiQuantum.title}</h5>
              <p className="text-xs text-slate-300">{report.topAiQuantum.summary}</p>
            </div>
          </div>
        </div>

        {/* Section 4: Conclusion */}
        <div className="p-5 rounded-lg bg-[#0F172A] border-l-4 border-[#F7931A] space-y-2">
          <div className="text-xs font-semibold text-white uppercase tracking-wider">
            4. Conclusión Factual del Sistema
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {report.conclusion}
          </p>
        </div>

        {/* Footer Attribution */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Emitido por el Motor de Inteligencia de Bitcoin Intelligence OS</span>
          <span>Inspirado en los principios de rigor de Diego Eduardo Beltramo</span>
        </div>
      </div>
    </div>
  );
};
