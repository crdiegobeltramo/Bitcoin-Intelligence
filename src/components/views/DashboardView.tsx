import React from 'react';
import {
  BitcoinMarketData,
  BitcoinNetworkData,
  OnChainMetrics,
  BitcoinIntelligenceScore,
  NavigationSection
} from '../../types';
import { TradingViewWidget } from '../tradingview/TradingViewWidget';
import { HistoricalChartsWidget } from '../dashboard/HistoricalChartsWidget';
import {
  Activity,
  Layers,
  Shield,
  Cpu,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Server,
  Zap,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  Globe
} from 'lucide-react';
import { TOP_INTELLIGENCE_EVENTS } from '../../services/dataProviders/intelligenceScoreProvider';

interface DashboardViewProps {
  marketData: BitcoinMarketData | null;
  networkData: BitcoinNetworkData | null;
  onChainMetrics: OnChainMetrics | null;
  bisScore: BitcoinIntelligenceScore;
  onNavigate: (section: NavigationSection) => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  marketData,
  networkData,
  onChainMetrics,
  bisScore,
  onNavigate,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">
            BITCOIN INTELLIGENCE TERMINAL
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Plataforma de inteligencia de red, copiloto de desarrollo blockchain y laboratorio analítico Web3.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Acceso Directo Solicitado */}
          <a
            href="https://diegobeltramobitcoin.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-black bg-[#F7931A] hover:bg-[#e08213] rounded-lg transition-all shadow-sm hover:scale-[1.02]"
            title="Abrir portal oficial de Diego Beltramo"
          >
            <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>diegobeltramobitcoin.netlify.app</span>
            <ExternalLink className="w-3 h-3 stroke-[2.5]" />
          </a>
          <button
            onClick={() => onNavigate('daily-intelligence')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] rounded-lg transition-colors"
          >
            <span>Ver Informe Diario</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#F7931A]" />
          </button>
          <button
            onClick={() => onNavigate('copilot-wizard')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-[#1E293B] hover:bg-[#283548] border border-slate-700 rounded-lg transition-colors"
          >
            <span>Copiloto de Desarrollo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BTC / USD Card */}
        <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>PRECIO SPOT BTC / USD</span>
            <TrendingUp className="w-4 h-4 text-[#F7931A]" />
          </div>
          <div>
            <div className="text-2xl font-mono-nums font-bold text-white">
              {marketData ? `$${marketData.btcUsd.toLocaleString('en-US')}` : 'Cargando...'}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono-nums">
              {marketData && (
                <>
                  <span className={marketData.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h}% (24h)
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">ATH: ${marketData.ath.toLocaleString()}</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex justify-between">
            <span>Fuente: {marketData?.attribution.source || 'CoinGecko'}</span>
            <span>Distancia: {marketData?.distanceToAth}%</span>
          </div>
        </div>

        {/* BTC / ARS Card */}
        <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>COTIZACIÓN LOCAL ARS</span>
            <span className="text-xs font-mono-nums text-slate-400">USD/ARS ${marketData?.usdArs || 1230}</span>
          </div>
          <div>
            <div className="text-2xl font-mono-nums font-bold text-white">
              {marketData ? `$${marketData.btcArs.toLocaleString('es-AR')}` : 'Cargando...'}
            </div>
            <div className="mt-1 text-xs text-slate-400 font-mono-nums">
              Pesos Argentinos (Referencia CCL / Oficial)
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex justify-between">
            <span>Jurisdicción: Argentina</span>
            <span>Mkt Cap: ${(marketData ? marketData.marketCap / 1e12 : 1.9).toFixed(2)}T</span>
          </div>
        </div>

        {/* Network Hashrate & Block Height */}
        <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>RED & CONSENSO</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-mono-nums font-bold text-white">
              {networkData ? `${networkData.hashrateEh} EH/s` : '724.8 EH/s'}
            </div>
            <div className="mt-1 text-xs font-mono-nums text-slate-400">
              Bloque: #{networkData?.blockHeight.toLocaleString() || '890,450'} · Dificultad: {networkData?.difficultyTrillion || 104.2} T
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex justify-between">
            <span>Ajuste próx: {networkData ? `+${networkData.estimatedNextDiffChange}%` : '+1.15%'}</span>
            <span>En ~{networkData?.difficultyAdjustmentDays || 4.8} días</span>
          </div>
        </div>

        {/* Mempool & Fee Rates */}
        <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>TARIFAS & MEMPOOL</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-mono-nums font-bold text-white">
              {networkData ? `${networkData.halfHourFeeSatVb} sat/vB` : '14 sat/vB'}
            </div>
            <div className="mt-1 text-xs font-mono-nums text-slate-400">
              Rápido: {networkData?.fastestFeeSatVb || 19} · Hora: {networkData?.hourFeeSatVb || 10} sat/vB
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex justify-between">
            <span>Mempool: {networkData?.mempoolVsizeMb || 142.6} MB</span>
            <span>Txs: {networkData?.mempoolTxCount.toLocaleString() || '168,420'}</span>
          </div>
        </div>
      </div>

      {/* Row 2: BIS (Bitcoin Intelligence Score) Banner */}
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#F7931A] font-semibold">
                BIS — BITCOIN INTELLIGENCE SCORE
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Métrica de Intensidad y Relevancia Informativa</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-display font-extrabold text-white">
                {bisScore.score}
              </span>
              <span className="text-xl font-mono text-slate-500">/ 100</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/40">
                {bisScore.label}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {bisScore.summary}
            </p>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="w-full lg:w-96 space-y-2 bg-[#080B10] p-4 rounded-lg border border-[#1E293B]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Desglose de Factores Relevantes
            </div>
            {bisScore.breakdown.slice(0, 4).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">{item.factor}</span>
                  <span className="text-white font-mono-nums">{item.intensity}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F7931A] to-amber-300 rounded-full"
                    style={{ width: `${item.intensity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recharts Historical Trends & Volatility Engine */}
      <HistoricalChartsWidget marketData={marketData} />

      {/* Row 4: TradingView Chart Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Activity className="w-4 h-4 text-[#F7931A]" />
            <span>Gráfico Técnico Oficial BTC / USD (TradingView)</span>
          </div>
          <span className="text-xs text-slate-500 font-mono-nums">Velas diarias · Binance Feed</span>
        </div>
        <TradingViewWidget marketData={marketData} />
      </div>

      {/* Row 5: On-Chain Intelligence Telemetry */}
      <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Métricas de Cadena (On-Chain Intelligence & Correlaciones)</h2>
          </div>
          <button
            onClick={() => onNavigate('onchain-analytics')}
            className="flex items-center gap-1.5 text-xs font-mono text-[#F7931A] hover:text-amber-300 font-semibold self-start sm:self-auto transition-colors"
          >
            <span>Ver 14 Fuentes & Correlaciones (LookIntoBitcoin, CryptoQuant, Mataf...)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-[11px] text-slate-400">MVRV Ratio</div>
            <div className="text-base font-mono-nums font-bold text-white mt-1">
              {onChainMetrics?.mvrvRatio ?? '2.18'}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Zona de utilidad activa</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-[11px] text-slate-400">SOPR</div>
            <div className="text-base font-mono-nums font-bold text-white mt-1">
              {onChainMetrics?.sopr ?? '1.018'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">&gt; 1.0 (En ganancia)</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-[11px] text-slate-400">NUPL</div>
            <div className="text-base font-mono-nums font-bold text-white mt-1">
              {onChainMetrics?.nupl ?? '0.54'}
            </div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Optimismo / Creencia</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-[11px] text-slate-400">Precio Realizado</div>
            <div className="text-base font-mono-nums font-bold text-white mt-1">
              ${onChainMetrics?.realizedPriceUsd?.toLocaleString() ?? '34,620'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Base de costo agregado</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-[11px] text-slate-400">Long-Term Holders</div>
            <div className="text-base font-mono-nums font-bold text-white mt-1">
              {onChainMetrics?.longTermHolderSupplyRatio ?? '74.2'}%
            </div>
            <div className="text-[10px] text-amber-400 mt-0.5">Monedas inmóviles &gt;155d</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-[11px] text-slate-400">Balances en Exchanges</div>
            <div className="text-base font-mono-nums font-bold text-white mt-1">
              {onChainMetrics?.exchangeBalanceBtc?.toLocaleString() ?? '2.18M'} BTC
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Mínimos plurianuales</div>
          </div>
        </div>
      </div>

      {/* Row 5: Top 5 Intelligence Developments */}
      <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Radar Diario: Top Acontecimientos de Inteligencia</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hechos técnicos, regulatorios, criptográficos y de minería verificados con fuentes primarias.
            </p>
          </div>
          <button
            onClick={() => onNavigate('daily-intelligence')}
            className="text-xs text-[#F7931A] hover:underline flex items-center gap-1"
          >
            <span>Ver Reporte Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {TOP_INTELLIGENCE_EVENTS.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#F7931A]">#{idx + 1}</span>
                  <span className="text-slate-400 font-medium">{item.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500 font-mono-nums">{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                      item.impact === 'CRITICAL'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : item.impact === 'HIGH'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    IMPACTO: {item.impact}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white p-1"
                    title="Ver fuente primaria"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 hover:text-[#F7931A] transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.summary}
              </p>

              <div className="text-[11px] text-slate-400 bg-[#080B10] p-2 rounded border border-slate-900 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">Evidencia Primaria:</strong> {item.evidence} (Fuente: {item.source})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
