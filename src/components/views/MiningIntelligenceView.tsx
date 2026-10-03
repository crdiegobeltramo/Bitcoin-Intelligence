import React from 'react';
import { BitcoinNetworkData } from '../../types';
import { Cpu, ShieldAlert, Award, Zap, Server, BarChart3, AlertTriangle, Layers } from 'lucide-react';

interface MiningIntelligenceViewProps {
  networkData: BitcoinNetworkData | null;
}

export const MiningIntelligenceView: React.FC<MiningIntelligenceViewProps> = ({ networkData }) => {
  const pools = [
    { name: 'Foundry USA', share: 29.8, country: 'Estados Unidos', hashrateEh: 215.9 },
    { name: 'AntPool', share: 22.4, country: 'Global / Singapur', hashrateEh: 162.3 },
    { name: 'F2Pool', share: 11.2, country: 'Global', hashrateEh: 81.1 },
    { name: 'ViaBTC', share: 11.0, country: 'Global', hashrateEh: 79.7 },
    { name: 'Binance Pool', share: 7.5, country: 'Global', hashrateEh: 54.3 },
    { name: 'MaraPool', share: 4.8, country: 'Estados Unidos', hashrateEh: 34.7 },
    { name: 'Otros Pools / Minería Solo', share: 13.3, country: 'Descentralizado', hashrateEh: 96.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Cpu className="w-3.5 h-3.5" />
            <span>MINING INTELLIGENCE & CONSENSUS RESILIENCE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">MINING INTELLIGENCE</h1>
          <p className="text-xs text-slate-400">
            Poder de hash global, ciclo de ajuste de dificultad, concentración de pools y análisis de riesgo de minería.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono-nums text-xs bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">PRÓXIMO HALVING:</span>
          <span className="text-[#F7931A] font-bold">{networkData?.halvingEstimatedDate || 'Abril 2028'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">~{networkData?.halvingBlocksRemaining?.toLocaleString() || '159,550'} bloques</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <div className="text-xs text-slate-400">Hashrate Global Estimado</div>
          <div className="text-2xl font-mono-nums font-bold text-white">
            {networkData?.hashrateEh || 724.8} EH/s
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Máximos históricos de red</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <div className="text-xs text-slate-400">Dificultad Actual</div>
          <div className="text-2xl font-mono-nums font-bold text-white">
            {networkData?.difficultyTrillion || 104.2} T
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Próx. Ajuste: +{networkData?.estimatedNextDiffChange || 1.15}%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <div className="text-xs text-slate-400">Ingreso Diario Mineros</div>
          <div className="text-2xl font-mono-nums font-bold text-white">
            ${((networkData?.minerRevenueDailyUsd || 46200000) / 1e6).toFixed(1)} M USD
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Subsidio: 3.125 BTC por bloque</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <div className="text-xs text-slate-400">Comisiones sobre Recompensa</div>
          <div className="text-2xl font-mono-nums font-bold text-white">
            {networkData?.feesRewardPercentage || 4.12}%
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">Sostenibilidad a largo plazo</div>
        </div>
      </div>

      {/* Two Column Layout: Pool Distribution & Mining Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pool Concentration List */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F7931A]" />
              <span>Distribución de Hashrate por Pool</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono-nums">Últimos 1,000 bloques</span>
          </div>

          <div className="space-y-3">
            {pools.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">{idx + 1}.</span>
                    <span className="font-medium text-white">{p.name}</span>
                    <span className="text-slate-500">({p.country})</span>
                  </div>
                  <div className="font-mono-nums font-semibold text-slate-200">
                    {p.share}% <span className="text-slate-500 font-normal">({p.hashrateEh} EH/s)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-[#F7931A]'
                        : idx === 1
                        ? 'bg-amber-400'
                        : idx === 2
                        ? 'bg-cyan-400'
                        : 'bg-slate-500'
                    }`}
                    style={{ width: `${p.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-xs text-slate-400">
            <strong className="text-slate-200">Nota Técnica:</strong> Los pools actúan como coordinadores de distribución de trabajo. Gracias al protocolo Stratum V2, los mineros individuales pueden construir sus propios bloques de transacciones, impidiendo la censura centralizada.
          </div>
        </div>

        {/* Mining Risk Radar */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">MINING RISK RADAR</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Riesgo de Concentración de Pools</span>
                <span className="text-amber-400 font-mono font-bold">MODERADO (52.2% en Top 2)</span>
              </div>
              <p className="text-slate-300">
                Foundry USA y AntPool acumulan conjuntamente más del 50% de los bloques minados. La mitigación estructural descansa en la adopción paulatina de Stratum V2 y en la facilidad de los mineros para redirigir sus ASICs instantáneamente si un pool actúa en desacuerdo con el consenso.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Presión de Comisiones vs Subsidio</span>
                <span className="text-emerald-400 font-mono font-bold">ESTABLE (4.1% fees)</span>
              </div>
              <p className="text-slate-300">
                Tras el halving de 2024, el ratio de comisiones sobre subsidio se mantiene en niveles normales. Las olas periódicas de demanda de espacio en bloque (Runes, Inscriptions, consolidaciones) proporcionan ingresos suplementarios a los mineros.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Riesgo Geográfico & Regulatorio</span>
                <span className="text-cyan-400 font-mono font-bold">DIVERSIFICADO</span>
              </div>
              <p className="text-slate-300">
                El despliegue de operaciones de minería está distribuido entre Estados Unidos, Canadá, Escandinavia, Oriente Medio, Paraguay y proyectos con excedentes hidroeléctricos y gas venteado en Argentina y Rusia.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Inflexibilidad Energética</span>
                <span className="text-emerald-400 font-mono font-bold">BAJO RIESGO</span>
              </div>
              <p className="text-slate-300">
                La minería de Bitcoin se consolida como el demandante flexible de energía de última instancia (demand response), estabilizando redes intermitentes renovables y monetizando energía stranded sin mercado local.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
