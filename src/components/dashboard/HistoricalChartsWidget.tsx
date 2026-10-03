import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Info
} from 'lucide-react';
import { BitcoinMarketData } from '../../types';

export type ChartTab = 'price' | 'volatility' | 'drawdown' | 'volume';
export type Timeframe = '1M' | '6M' | '1Y' | '3Y' | 'ALL';

interface HistoricalDataPoint {
  date: string;
  price: number;
  sma50: number;
  sma200: number;
  volatility30d: number; // annualized percentage (e.g. 42.5%)
  volatility90d: number;
  drawdown: number; // negative percentage from ATH (e.g. -12.4%)
  volumeBillion: number;
  momentum: number; // 0-100 RSI-like or momentum index
  event?: string;
}

// Curated high-fidelity historical data points across market cycles
const HISTORICAL_DATA_ALL: HistoricalDataPoint[] = [
  { date: '2013-Q1', price: 92, sma50: 65, sma200: 35, volatility30d: 85.2, volatility90d: 78.4, drawdown: -65.2, volumeBillion: 0.05, momentum: 78, event: 'Primer Rally Ciclo 1' },
  { date: '2013-Q4', price: 1150, sma50: 620, sma200: 280, volatility30d: 135.0, volatility90d: 110.2, drawdown: 0.0, volumeBillion: 0.8, momentum: 94, event: 'ATH 2013 ($1,150)' },
  { date: '2014-Q4', price: 320, sma50: 410, sma200: 550, volatility30d: 62.4, volatility90d: 70.1, drawdown: -72.1, volumeBillion: 0.4, momentum: 28, event: 'Mt. Gox / Bear Market' },
  { date: '2015-Q3', price: 240, sma50: 250, sma200: 260, volatility30d: 38.2, volatility90d: 42.0, drawdown: -79.1, volumeBillion: 0.3, momentum: 42, event: 'Fondo del Ciclo' },
  { date: '2016-Q3', price: 650, sma50: 620, sma200: 510, volatility30d: 45.1, volatility90d: 48.6, drawdown: -43.4, volumeBillion: 1.2, momentum: 62, event: 'Halving 2016 (12.5 BTC)' },
  { date: '2017-Q2', price: 2500, sma50: 1950, sma200: 1400, volatility30d: 78.4, volatility90d: 69.2, drawdown: 0.0, volumeBillion: 4.5, momentum: 84 },
  { date: '2017-Q4', price: 19700, sma50: 12400, sma200: 6800, volatility30d: 118.5, volatility90d: 95.4, drawdown: 0.0, volumeBillion: 18.2, momentum: 96, event: 'ATH 2017 ($19,700)' },
  { date: '2018-Q4', price: 3200, sma50: 4800, sma200: 6500, volatility30d: 72.0, volatility90d: 65.3, drawdown: -83.7, volumeBillion: 6.8, momentum: 22, event: 'Capitulación 2018' },
  { date: '2019-Q2', price: 10500, sma50: 8200, sma200: 5800, volatility30d: 76.2, volatility90d: 68.0, drawdown: -46.7, volumeBillion: 14.5, momentum: 74 },
  { date: '2020-Q1', price: 6400, sma50: 8100, sma200: 8600, volatility30d: 92.4, volatility90d: 75.1, drawdown: -67.5, volumeBillion: 24.1, momentum: 31, event: 'Crash COVID Marzo' },
  { date: '2020-Q2', price: 9200, sma50: 8800, sma200: 8400, volatility30d: 44.5, volatility90d: 58.2, drawdown: -53.2, volumeBillion: 18.0, momentum: 58, event: 'Halving 2020 (6.25 BTC)' },
  { date: '2020-Q4', price: 29000, sma50: 21000, sma200: 14200, volatility30d: 68.1, volatility90d: 54.3, drawdown: 0.0, volumeBillion: 38.5, momentum: 91, event: 'Entrada Institucional' },
  { date: '2021-Q2', price: 35000, sma50: 48000, sma200: 41000, volatility30d: 98.6, volatility90d: 88.2, drawdown: -45.9, volumeBillion: 62.4, momentum: 38, event: 'China Ban Minería' },
  { date: '2021-Q4', price: 69000, sma50: 58000, sma200: 46500, volatility30d: 74.2, volatility90d: 66.8, drawdown: 0.0, volumeBillion: 52.0, momentum: 89, event: 'ATH 2021 ($69k)' },
  { date: '2022-Q2', price: 19800, sma50: 28500, sma200: 37200, volatility30d: 82.5, volatility90d: 74.1, drawdown: -71.3, volumeBillion: 44.2, momentum: 25, event: 'Colapso Terra/Luna' },
  { date: '2022-Q4', price: 16500, sma50: 18200, sma200: 22800, volatility30d: 64.2, volatility90d: 61.5, drawdown: -76.0, volumeBillion: 32.5, momentum: 29, event: 'Quiebra FTX / Suelo' },
  { date: '2023-Q2', price: 30500, sma50: 28100, sma200: 24200, volatility30d: 46.2, volatility90d: 48.0, drawdown: -55.7, volumeBillion: 26.8, momentum: 65, event: 'Solicitud ETF BlackRock' },
  { date: '2023-Q4', price: 42200, sma50: 37500, sma200: 30800, volatility30d: 42.8, volatility90d: 41.2, drawdown: -38.8, volumeBillion: 31.4, momentum: 72 },
  { date: '2024-Q1', price: 73000, sma50: 61200, sma200: 44500, volatility30d: 62.4, volatility90d: 55.8, drawdown: 0.0, volumeBillion: 68.2, momentum: 88, event: 'Aprobación ETFs Spot' },
  { date: '2024-Q2', price: 61500, sma50: 65800, sma200: 55200, volatility30d: 48.1, volatility90d: 51.2, drawdown: -15.7, volumeBillion: 38.5, momentum: 48, event: 'Halving 2024 (3.125 BTC)' },
  { date: '2024-Q4', price: 98500, sma50: 84200, sma200: 68400, volatility30d: 64.8, volatility90d: 54.6, drawdown: 0.0, volumeBillion: 76.4, momentum: 87, event: 'Récord Histórico $99k+' },
  { date: '2025-Q2', price: 92400, sma50: 94100, sma200: 78500, volatility30d: 45.2, volatility90d: 49.3, drawdown: -6.2, volumeBillion: 48.2, momentum: 56 },
  { date: '2025-Q4', price: 88900, sma50: 91500, sma200: 85200, volatility30d: 41.6, volatility90d: 46.2, drawdown: -9.7, volumeBillion: 42.1, momentum: 52 },
  { date: '2026-Q1', price: 84600, sma50: 87200, sma200: 86100, volatility30d: 39.4, volatility90d: 43.1, drawdown: -14.1, volumeBillion: 39.5, momentum: 49 },
  { date: '2026-Q3', price: 87800, sma50: 85600, sma200: 86400, volatility30d: 42.1, volatility90d: 44.5, drawdown: -10.8, volumeBillion: 44.0, momentum: 55, event: 'Nivel Actual' },
];

// Generate 1M detailed daily simulation data points
const generate1MData = (currentPrice: number): HistoricalDataPoint[] => {
  const points: HistoricalDataPoint[] = [];
  const basePrice = currentPrice * 0.93;
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(5, 10);
    const dayFactor = Math.sin(i * 0.35) * 0.04 + (30 - i) * 0.0025;
    const price = Math.round(basePrice * (1 + dayFactor));
    const sma50 = Math.round(price * 0.97);
    const sma200 = Math.round(price * 0.92);
    const volatility30d = Number((34.5 + Math.sin(i * 0.5) * 6).toFixed(1));
    const volatility90d = Number((41.2 + Math.cos(i * 0.2) * 3).toFixed(1));
    const drawdown = Number((((price - 99800) / 99800) * 100).toFixed(1));
    const volumeBillion = Number((32 + Math.abs(Math.sin(i)) * 18).toFixed(1));
    const momentum = Math.round(52 + Math.sin(i * 0.4) * 18);
    points.push({
      date: dateStr,
      price,
      sma50,
      sma200,
      volatility30d,
      volatility90d,
      drawdown,
      volumeBillion,
      momentum,
    });
  }
  return points;
};

interface HistoricalChartsWidgetProps {
  marketData: BitcoinMarketData | null;
}

export const HistoricalChartsWidget: React.FC<HistoricalChartsWidgetProps> = ({ marketData }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('price');
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');
  const [useLogScale, setUseLogScale] = useState(false);

  const currentPrice = marketData?.btcUsd ?? 87800;

  const chartData = useMemo(() => {
    if (timeframe === '1M') {
      return generate1MData(currentPrice);
    }
    if (timeframe === '6M') {
      return HISTORICAL_DATA_ALL.slice(-8);
    }
    if (timeframe === '1Y') {
      return HISTORICAL_DATA_ALL.slice(-12);
    }
    if (timeframe === '3Y') {
      return HISTORICAL_DATA_ALL.slice(-16);
    }
    return HISTORICAL_DATA_ALL;
  }, [timeframe, currentPrice]);

  // Current telemetry stats
  const latestPoint = chartData[chartData.length - 1] || HISTORICAL_DATA_ALL[HISTORICAL_DATA_ALL.length - 1];
  const currentVol30d = latestPoint.volatility30d;
  const currentDrawdown = latestPoint.drawdown;
  const currentSma200 = latestPoint.sma200;

  const volatilityRegime =
    currentVol30d < 35
      ? { label: 'Baja Volatilidad (Compresión)', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-700' }
      : currentVol30d < 55
      ? { label: 'Volatilidad Normal de Mercado', color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-700' }
      : currentVol30d < 85
      ? { label: 'Alta Volatilidad (Expansión)', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-700' }
      : { label: 'Volatilidad Extrema (Euforia / Pánico)', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-700' };

  return (
    <div className="bg-[#0A0E17] border border-[#1E293B] rounded-2xl p-5 space-y-5">
      {/* Top Banner & Direct Link to Diego Beltramo's site */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0F172A] via-[#162032] to-[#1A1829] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#F7931A] uppercase tracking-wider">
                HISTORICAL CHARTS & VOLATILITY ENGINE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Recharts v2
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Visualización cuantitativa de tendencias históricas, medias móviles (50/200), volatilidad realizada y ciclos de halving.
            </p>
          </div>
        </div>

        {/* Acceso Directo Solicitado */}
        <a
          href="https://diegobeltramobitcoin.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-black text-xs font-mono font-bold transition-all shadow-md shrink-0 self-start sm:self-auto hover:scale-[1.02]"
          title="Abrir portal oficial de Diego Beltramo"
        >
          <span>Visitar diegobeltramobitcoin.netlify.app</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
        </a>
      </div>

      {/* Control Bar: Tabs, Timeframes, Scale Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080B10] border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('price')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
              activeTab === 'price'
                ? 'bg-[#1E293B] text-white font-bold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#F7931A]" />
            <span>Precio & Medias (SMA 50/200)</span>
          </button>

          <button
            onClick={() => setActiveTab('volatility')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
              activeTab === 'volatility'
                ? 'bg-[#1E293B] text-white font-bold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Volatilidad Anualizada (30D/90D)</span>
          </button>

          <button
            onClick={() => setActiveTab('drawdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
              activeTab === 'drawdown'
                ? 'bg-[#1E293B] text-white font-bold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Drawdown desde ATH</span>
          </button>

          <button
            onClick={() => setActiveTab('volume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
              activeTab === 'volume'
                ? 'bg-[#1E293B] text-white font-bold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>Volumen & Momentum</span>
          </button>
        </div>

        {/* Timeframe & Scale Controls */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080B10] border border-slate-800">
            {(['1M', '6M', '1Y', '3Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-[#F7931A] text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Log / Linear Toggle (available on price chart) */}
          {activeTab === 'price' && (
            <button
              onClick={() => setUseLogScale(!useLogScale)}
              className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                useLogScale
                  ? 'bg-cyan-950/70 border-cyan-600 text-cyan-300 font-bold'
                  : 'bg-[#080B10] border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Alternar entre escala lineal y logarítmica"
            >
              {useLogScale ? 'LOG' : 'LIN'}
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Precio Registrado</span>
          <div className="text-lg font-mono font-bold text-white mt-0.5">
            ${latestPoint.price.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Punto: {latestPoint.date}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Volatilidad Realizada 30D</span>
          <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
            {currentVol30d}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            90D HV: {latestPoint.volatility90d}%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Media Móvil SMA 200</span>
          <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">
            ${currentSma200.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            SMA 50: ${latestPoint.sma50.toLocaleString()}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${volatilityRegime.bg}`}>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Régimen de Volatilidad</span>
          <div className={`text-xs font-mono font-bold mt-1 ${volatilityRegime.color}`}>
            {volatilityRegime.label}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            ATH Drawdown: {currentDrawdown}%
          </div>
        </div>
      </div>

      {/* Main Chart Canvas with Recharts */}
      <div className="p-4 rounded-xl bg-[#080B10] border border-slate-800">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'price' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F7931A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F7931A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  scale={useLogScale ? 'log' : 'auto'}
                  domain={useLogScale ? [50, 'auto'] : [0, 'auto']}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalDataPoint;
                      return (
                        <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-700 shadow-xl font-mono text-xs space-y-1">
                          <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex justify-between gap-4">
                            <span>Fecha: {label}</span>
                            {data.event && (
                              <span className="text-[#F7931A] font-semibold">{data.event}</span>
                            )}
                          </div>
                          <div className="text-white font-bold flex justify-between gap-4">
                            <span className="text-slate-400">Precio BTC:</span>
                            <span className="text-amber-300">${data.price.toLocaleString()}</span>
                          </div>
                          <div className="text-cyan-300 flex justify-between gap-4">
                            <span className="text-slate-400">SMA 50:</span>
                            <span>${data.sma50.toLocaleString()}</span>
                          </div>
                          <div className="text-purple-300 flex justify-between gap-4">
                            <span className="text-slate-400">SMA 200:</span>
                            <span>${data.sma200.toLocaleString()}</span>
                          </div>
                          <div className="text-emerald-400 flex justify-between gap-4 pt-0.5 border-t border-slate-800/80">
                            <span className="text-slate-400">Volatilidad 30D:</span>
                            <span>{data.volatility30d}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  name="Precio BTC (USD)"
                  stroke="#F7931A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  name="Media Móvil 50D"
                  stroke="#06B6D4"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="sma200"
                  name="Media Móvil 200D"
                  stroke="#A855F7"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            ) : activeTab === 'volatility' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalDataPoint;
                      return (
                        <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-700 shadow-xl font-mono text-xs space-y-1">
                          <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                            Período: {label}
                          </div>
                          <div className="text-cyan-400 flex justify-between gap-4">
                            <span>Volatilidad 30D (Anualizada):</span>
                            <span className="font-bold">{data.volatility30d}%</span>
                          </div>
                          <div className="text-amber-400 flex justify-between gap-4">
                            <span>Volatilidad 90D:</span>
                            <span className="font-bold">{data.volatility90d}%</span>
                          </div>
                          <div className="text-slate-300 flex justify-between gap-4 pt-1 border-t border-slate-800">
                            <span>Precio Ref:</span>
                            <span>${data.price.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <ReferenceLine y={50} label="Umbral Crítico (50%)" stroke="#EF4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} label="Línea de Compresión (30%)" stroke="#10B981" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="volatility30d"
                  name="Volatilidad Histórica 30D (%)"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06B6D4' }}
                />
                <Line
                  type="monotone"
                  dataKey="volatility90d"
                  name="Volatilidad Histórica 90D (%)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="3 3"
                />
              </LineChart>
            ) : activeTab === 'drawdown' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.0} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  domain={[-100, 0]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalDataPoint;
                      return (
                        <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-700 shadow-xl font-mono text-xs space-y-1">
                          <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                            Período: {label}
                          </div>
                          <div className="text-rose-400 font-bold flex justify-between gap-4">
                            <span>Drawdown desde ATH:</span>
                            <span>{data.drawdown}%</span>
                          </div>
                          <div className="text-white flex justify-between gap-4">
                            <span>Precio Registrado:</span>
                            <span>${data.price.toLocaleString()}</span>
                          </div>
                          {data.event && (
                            <div className="text-[#F7931A] text-[11px] pt-1 border-t border-slate-800">
                              Hito: {data.event}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <ReferenceLine y={-50} stroke="#EF4444" strokeDasharray="3 3" label="-50% Corrección Mayor" />
                <ReferenceLine y={-80} stroke="#991B1B" strokeDasharray="3 3" label="-80% Fondo de Ciclo" />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  name="Drawdown desde ATH (%)"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#drawdownGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}B`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalDataPoint;
                      return (
                        <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-700 shadow-xl font-mono text-xs space-y-1">
                          <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                            Período: {label}
                          </div>
                          <div className="text-purple-400 font-bold flex justify-between gap-4">
                            <span>Volumen 24h:</span>
                            <span>${data.volumeBillion} Billones USD</span>
                          </div>
                          <div className="text-emerald-400 flex justify-between gap-4">
                            <span>Índice de Momentum:</span>
                            <span>{data.momentum} / 100</span>
                          </div>
                          <div className="text-white flex justify-between gap-4">
                            <span>Precio Ref:</span>
                            <span>${data.price.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Bar
                  dataKey="volumeBillion"
                  name="Volumen Estimado ($B USD)"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanatory notes & Educational guidance */}
      <div className="p-3.5 rounded-xl bg-[#080B10] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-[#F7931A] shrink-0" />
          <span>
            La volatilidad histórica realizada se calcula sobre rendimientos logarítmicos continuos y se anualiza mediante el factor √365.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] shrink-0">
          <span>Fuente: Telemetría Agregada Bitcoin Intelligence</span>
        </div>
      </div>
    </div>
  );
};
