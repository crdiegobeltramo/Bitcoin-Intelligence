import React, { useState } from 'react';
import { AmmSimulator } from '../../services/defi/ammSimulator';
import { DexSimulationInput } from '../../types';
import { Layers, ArrowRight, RefreshCw, Calculator, Info, ShieldAlert } from 'lucide-react';

export const DexLabView: React.FC = () => {
  const [modelType, setModelType] = useState<'CONSTANT_PRODUCT' | 'CONCENTRATED' | 'ORDER_BOOK'>('CONSTANT_PRODUCT');
  const [reserveA, setReserveA] = useState<number>(100); // 100 WBTC
  const [reserveB, setReserveB] = useState<number>(9600000); // 9,600,000 USDT (Spot ~96,000)
  const [tradeSize, setTradeSize] = useState<number>(2.5); // Trade 2.5 WBTC
  const [isTokenAToB, setIsTokenAToB] = useState<boolean>(true);
  const [feePercentage, setFeePercentage] = useState<number>(0.3); // 0.3% Uniswap v2 fee

  const simInput: DexSimulationInput = {
    tokenAName: 'WBTC',
    tokenBName: 'USDT',
    reserveA,
    reserveB,
    tradeSize,
    isTokenAToB,
    feePercentage,
  };

  const simOutput = AmmSimulator.simulateTrade(simInput);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Layers className="w-3.5 h-3.5" />
            <span>DEFI & DEX ARCHITECTURE LAB · LIQUIDITY MATHEMATICS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">DEX AMM SIMULATOR</h1>
          <p className="text-xs text-slate-400">
            Simulación analítica de modelos de liquidez: Constant Product (x · y = k), slippage, price impact y pérdida impermanente (IL).
          </p>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0F172A] rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setModelType('CONSTANT_PRODUCT')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              modelType === 'CONSTANT_PRODUCT'
                ? 'bg-[#1E293B] text-[#F7931A] border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Constant Product (v2)
          </button>
          <button
            onClick={() => setModelType('CONCENTRATED')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              modelType === 'CONCENTRATED'
                ? 'bg-[#1E293B] text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Concentrated (v3)
          </button>
          <button
            onClick={() => setModelType('ORDER_BOOK')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              modelType === 'ORDER_BOOK'
                ? 'bg-[#1E293B] text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order Book L2
          </button>
        </div>
      </div>

      {/* Main Two Column Simulation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#F7931A]" />
              <span>Parámetros del Pool AMM</span>
            </h2>
            <button
              onClick={() => {
                setReserveA(100);
                setReserveB(9600000);
                setTradeSize(2.5);
                setFeePercentage(0.3);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Trade Direction */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-medium">Dirección del Swap:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsTokenAToB(true)}
                className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                  isTokenAToB
                    ? 'bg-[#1E293B] text-white border-[#F7931A]'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800'
                }`}
              >
                Vender WBTC ➔ Comprar USDT
              </button>
              <button
                onClick={() => setIsTokenAToB(false)}
                className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                  !isTokenAToB
                    ? 'bg-[#1E293B] text-white border-cyan-400'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800'
                }`}
              >
                Vender USDT ➔ Comprar WBTC
              </button>
            </div>
          </div>

          {/* Reserve A Slider & Input */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-mono-nums">
              <span className="text-slate-400">Reserva Token A (WBTC):</span>
              <span className="text-white font-bold">{reserveA.toLocaleString()} WBTC</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="5"
              value={reserveA}
              onChange={(e) => setReserveA(Number(e.target.value))}
              className="w-full accent-[#F7931A]"
            />
          </div>

          {/* Reserve B Slider & Input */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-mono-nums">
              <span className="text-slate-400">Reserva Token B (USDT):</span>
              <span className="text-white font-bold">${reserveB.toLocaleString()} USDT</span>
            </div>
            <input
              type="range"
              min="100000"
              max="50000000"
              step="100000"
              value={reserveB}
              onChange={(e) => setReserveB(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Trade Size Slider & Input */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-mono-nums">
              <span className="text-slate-400">
                Tamaño del Trade ({isTokenAToB ? 'WBTC' : 'USDT'}):
              </span>
              <span className="text-[#F7931A] font-bold">
                {tradeSize.toLocaleString()} {isTokenAToB ? 'WBTC' : 'USDT'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max={isTokenAToB ? 50 : 2000000}
              step={isTokenAToB ? 0.1 : 10000}
              value={tradeSize}
              onChange={(e) => setTradeSize(Number(e.target.value))}
              className="w-full accent-[#F7931A]"
            />
          </div>

          {/* Fee Percentage */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-mono-nums">
              <span className="text-slate-400">Comisión del Pool (Swap Fee):</span>
              <span className="text-slate-200 font-semibold">{feePercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.05, 0.3, 1.0].map((fee) => (
                <button
                  key={fee}
                  onClick={() => setFeePercentage(fee)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold border ${
                    feePercentage === fee
                      ? 'bg-[#1E293B] text-white border-[#F7931A]'
                      : 'bg-[#0F172A] text-slate-400 border-slate-800'
                  }`}
                >
                  {fee}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Output & Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Resultados del Motor Analítico (Output)
              </h2>
              <span className="text-xs font-mono text-cyan-400">Invariante k = x · y</span>
            </div>

            {/* Primary KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
                <span className="text-[11px] text-slate-400">Precio Spot Inicial</span>
                <div className="text-lg font-mono-nums font-bold text-white mt-1">
                  ${simOutput.initialPrice.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Marginal (y / x)</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
                <span className="text-[11px] text-slate-400">Precio de Ejecución Efectivo</span>
                <div className="text-lg font-mono-nums font-bold text-cyan-300 mt-1">
                  ${simOutput.executionPrice.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Recibido / Entregado</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
                <span className="text-[11px] text-slate-400">Cantidad Recibida</span>
                <div className="text-lg font-mono-nums font-bold text-emerald-400 mt-1">
                  {simOutput.amountReceived.toLocaleString()} {isTokenAToB ? 'USDT' : 'WBTC'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Neto de comisión</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
                <span className="text-[11px] text-slate-400">Price Impact (Impacto en Precio)</span>
                <div className={`text-lg font-mono-nums font-bold mt-1 ${
                  simOutput.priceImpact > 2 ? 'text-rose-400' : 'text-slate-200'
                }`}>
                  {simOutput.priceImpact}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Por absorción de reserva</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
                <span className="text-[11px] text-slate-400">Comisión Pagada a LPs</span>
                <div className="text-lg font-mono-nums font-bold text-amber-300 mt-1">
                  {simOutput.feePaid.toLocaleString()} {isTokenAToB ? 'WBTC' : 'USDT'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">({feePercentage}% fee)</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800">
                <span className="text-[11px] text-slate-400">Impermanent Loss (IL) Est.</span>
                <div className="text-lg font-mono-nums font-bold text-slate-200 mt-1">
                  {simOutput.impermanentLossPercent}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Costo de oportunidad vs HODL</div>
              </div>
            </div>

            {/* Invariant & Reserves state */}
            <div className="p-4 rounded-lg bg-[#080B10] border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Invariante k Antes: {simOutput.constantProductBefore.toLocaleString()}</span>
                <span>Invariante k Después: {simOutput.constantProductAfter.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Nueva Reserva WBTC: {simOutput.newReserveA.toLocaleString()}</span>
                <span>Nueva Reserva USDT: ${simOutput.newReserveB.toLocaleString()}</span>
              </div>
            </div>

            {/* Mathematical Model Explanation */}
            <div className="p-4 rounded-lg bg-[#0C1322] border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deducción Matemática del Modelo Constant Product</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                El invariante fundamental establece que el producto de las reservas debe permanecer constante o crecer tras cada intercambio por la retención de comisiones:{' '}
                <code className="text-amber-300 font-mono">x · y = k</code>. Al ingresar <code className="text-cyan-300 font-mono">Δx</code> tokens con tarifa <code className="text-white font-mono">γ = (1 - fee)</code>, la cantidad saliente <code className="text-emerald-300 font-mono">Δy</code> se calcula analíticamente mediante la ecuación:
              </p>
              <div className="bg-[#05080E] p-2.5 rounded font-mono text-center text-xs text-amber-300 border border-slate-900">
                Δy = (y · Δx · γ) / (x + Δx · γ)
              </div>
              <p className="text-slate-400 text-[11px]">
                La pérdida impermanente cuantifica la divergencia frente a la estrategia estática de conservación pura: <code className="text-slate-200">IL(r) = 2 · √r / (1 + r) - 1</code>, donde <code className="text-slate-200">r = P_nuevo / P_inicial</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
