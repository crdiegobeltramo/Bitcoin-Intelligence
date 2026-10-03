import React, { useState } from 'react';
import { ShieldAlert, Zap, Lock, ArrowRight, Activity, Percent, AlertTriangle } from 'lucide-react';

export const DeFiIntelligenceView: React.FC = () => {
  const [collateralBtc, setCollateralBtc] = useState<number>(2.0); // 2 WBTC
  const [btcPrice, setBtcPrice] = useState<number>(96000);
  const [borrowedUsdc, setBorrowedUsdc] = useState<number>(100000); // 100k USDC
  const [liquidationThreshold, setLiquidationThreshold] = useState<number>(80); // 80% LTV threshold

  const collateralValueUsd = collateralBtc * btcPrice;
  const healthFactor = borrowedUsdc > 0
    ? (collateralValueUsd * (liquidationThreshold / 100)) / borrowedUsdc
    : 999;
  const currentLtv = collateralValueUsd > 0
    ? (borrowedUsdc / collateralValueUsd) * 100
    : 0;
  const liquidationPriceBtc = collateralBtc > 0
    ? borrowedUsdc / (collateralBtc * (liquidationThreshold / 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>LENDING PROTOCOLS, LIQUIDATIONS & FLASH LOANS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">DEFI PROTOCOL INTELLIGENCE</h1>
          <p className="text-xs text-slate-400">
            Simulador de factor de salud, colaterales, liquidaciones en cascada y dinámica de préstamos relámpago (Flash Loans).
          </p>
        </div>
      </div>

      {/* Lending Health Factor Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Simulador de Posición de Crédito (Lending)</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-mono-nums">
                <span className="text-slate-400">Colateral Depositado (WBTC):</span>
                <span className="text-white font-bold">{collateralBtc} WBTC</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={collateralBtc}
                onChange={(e) => setCollateralBtc(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono-nums">
                <span className="text-slate-400">Precio de Mercado Colateral (BTC):</span>
                <span className="text-white font-bold">${btcPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="40000"
                max="150000"
                step="1000"
                value={btcPrice}
                onChange={(e) => setBtcPrice(Number(e.target.value))}
                className="w-full accent-[#F7931A]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono-nums">
                <span className="text-slate-400">Deuda Prestada (USDC):</span>
                <span className="text-rose-400 font-bold">${borrowedUsdc.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={borrowedUsdc}
                onChange={(e) => setBorrowedUsdc(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono-nums">
                <span className="text-slate-400">Umbral de Liquidación (Threshold):</span>
                <span className="text-slate-200 font-semibold">{liquidationThreshold}% LTV</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="5"
                value={liquidationThreshold}
                onChange={(e) => setLiquidationThreshold(Number(e.target.value))}
                className="w-full accent-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Right: Output Health Metrics */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Diagnóstico de Riesgo de Liquidación
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                healthFactor < 1.0
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : healthFactor < 1.3
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {healthFactor < 1.0 ? 'EN LIQUIDACIÓN' : healthFactor < 1.3 ? 'RIESGO ALTO' : 'POSICIÓN SEGURA'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] text-slate-400">Factor de Salud (HF)</span>
              <div className={`text-xl font-mono-nums font-bold mt-1 ${
                healthFactor < 1.0 ? 'text-rose-400' : healthFactor < 1.3 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {healthFactor.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">&lt; 1.0 = Liquidable</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] text-slate-400">LTV Actual</span>
              <div className="text-xl font-mono-nums font-bold text-white mt-1">
                {currentLtv.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Máx: {liquidationThreshold}%</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] text-slate-400">Valor Colateral</span>
              <div className="text-xl font-mono-nums font-bold text-cyan-300 mt-1">
                ${collateralValueUsd.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">En USD</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
              <span className="text-[11px] text-slate-400">Precio de Liquidación</span>
              <div className="text-xl font-mono-nums font-bold text-amber-300 mt-1">
                ${Math.round(liquidationPriceBtc).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Precio BTC crítico</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0C1322] border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Mecánica de Liquidaciones en Cascada</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              Cuando el factor de salud cae por debajo de 1.00, bots liquidadores (MEV searchers) invocan la función de liquidación del contrato inteligente, reembolsando hasta el 50% de la deuda en USDC y reclamando el colateral en WBTC con una bonificación de liquidación (ej. 5% a 10%), vendiéndolo inmediatamente en AMMs y presionando el precio spot a la baja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
