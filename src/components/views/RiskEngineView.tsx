import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ChevronRight, Layers, FileText } from 'lucide-react';

interface RiskDimension {
  id: string;
  name: string;
  category: string;
  rating: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  score: number; // 0-100
  factors: string[];
  mitigations: string[];
  historicalPrecedents: string;
}

export const RiskEngineView: React.FC = () => {
  const dimensions: RiskDimension[] = [
    {
      id: 'r-sc',
      name: 'Riesgo de Smart Contract',
      category: 'Técnico / Código',
      rating: 'MODERADO',
      score: 72,
      factors: [
        'Complejidad ciclomatica del código EVM',
        'Ausencia de pruebas de verificación formal o fuzzing intensivo con Echidna/Foundry',
        'Uso de contratos actualizables (Proxies UUPS / Transparent) con almacenamiento mutable',
      ],
      mitigations: [
        'Auditorías múltiples independientes por firmas reconocidas',
        'Programas de Bug Bounty públicos en Immunefi con recompensas superiores a $1M',
        'Contratos inmutables con timelocks estrictos',
      ],
      historicalPrecedents: 'The DAO (2016, reentrancy), Parity Multisig (2017, selfdestruct), Wormhole bridge uninitialized proxy (2022).',
    },
    {
      id: 'r-oracle',
      name: 'Riesgo de Oráculo de Precios',
      category: 'Mercado / Datos',
      rating: 'CRÍTICO',
      score: 88,
      factors: [
        'Dependencia de precios spot derivados directamente de reservas de AMMs (getReserves)',
        'Frecuencia de actualización lenta o ventanas TWAP demasiado cortas (&lt; 30 min)',
        'Falta de fallback descentralizado ante desvíos de feed centralizado',
      ],
      mitigations: [
        'Integración obligatoria de Chainlink Data Feeds multi-validador con heartbeat',
        'TWAP de Uniswap v3 con al menos 1800 segundos de ventana de observación',
        'Circuit breakers automatizados ante variaciones superiores al 10% en un bloque',
      ],
      historicalPrecedents: 'Mango Markets (2022, manipulación de precio en libro de órdenes fino), Harvest Finance (2020, flash loan oracle skew).',
    },
    {
      id: 'r-liquidity',
      name: 'Riesgo de Liquidez y Slippage',
      category: 'Económico',
      rating: 'MODERADO',
      score: 65,
      factors: [
        'Baja profundidad de reservas frente al volumen proyectado',
        'Incentivos de minería de liquidez temporales (liquidez mercenaria que fuga al cesar el subsidio)',
        'Descalce de vencimientos entre activos colaterales y deudas de corto plazo',
      ],
      mitigations: [
        'Protocol-Owned Liquidity (POL) vía bonos Olympus-style',
        'Curvas de interés dinámicas que penalizan la utilización &gt; 90% en lending',
      ],
      historicalPrecedents: 'Liquidaciones en cascada durante el Black Thursday de marzo 2020 en MakerDAO (colaterales liquidados a 0 DAI por congestión de gas).',
    },
    {
      id: 'r-gov',
      name: 'Riesgo de Gobernanza & Timelock',
      category: 'Institucional',
      rating: 'ALTO',
      score: 79,
      factors: [
        'Concentración de tokens de voto en ballenas o fondos de capital riesgo',
        'Timelocks inferiores a 48 horas para propuestas ejecutivas',
        'Ataques de gobernanza financiados mediante préstamos relámpago (Flash Loans)',
      ],
      mitigations: [
        'Checkpoints de bloques históricos para snapshot de votos (ERC20Votes)',
        'Timelock irrevocable con veto de seguridad descentralizado (Guardian Multisig)',
        'Quorum ponderado por antigüedad de staking (veTokenomics)',
      ],
      historicalPrecedents: 'Build Finance DAO takeover (2022, atacante acumuló votos suficientes para vaciar tesorería), Tornado Cash governance hack (2023).',
    },
    {
      id: 'r-counterparty',
      name: 'Riesgo de Contraparte & Emisores',
      category: 'Financiero',
      rating: 'MODERADO',
      score: 58,
      factors: [
        'Exposición a stablecoins centralizadas sujetas a congelamiento de fondos (USDT/USDC)',
        'Opacidad en la composición de reservas de bonos corporativos tradicionales',
        'Riesgo de corrida bancaria en bancos custodios de reservas fiduciarias',
      ],
      mitigations: [
        'Diversificación entre stablecoins respaldadas por fiat y colateral descentralizado sobre-colateralizado (LUSD, DAI)',
        'Auditorías mensuales de atestación de reservas (Proof of Reserves)',
      ],
      historicalPrecedents: 'Despegue de paridad de USDC tras la caída de Silicon Valley Bank (marzo 2023, reservas atrapadas transitoriamente).',
    },
    {
      id: 'r-bridge',
      name: 'Riesgo de Puente Inter-Cadena (Cross-Chain Bridge)',
      category: 'Infraestructura',
      rating: 'CRÍTICO',
      score: 92,
      factors: [
        'Contratos de depósito centralizados en una cadena que emiten wrapped tokens en otra',
        'Mecanismo de verificación multifirma con quórum reducido de validadores off-chain',
        'Complejidad del serializado de mensajes cross-chain',
      ],
      mitigations: [
        'Evitar bridges con custodios federados en favor de pruebas de estado con zero-knowledge (ZK-bridges)',
        'Límites de velocidad de retiro por hora (rate limits)',
      ],
      historicalPrecedents: 'Ronin Bridge ($625M hackeado vía robo de claves de validadores), Poly Network ($611M), Nomad Bridge ($190M por fallo de verificación de raíz cero).',
    },
    {
      id: 'r-economic',
      name: 'Riesgo de Ataques Económicos & MEV',
      category: 'Teoría de Juegos',
      rating: 'ALTO',
      score: 81,
      factors: [
        'Explotación de bucles de retroalimentación en pools algorítmicos sin respaldo externo',
        'Ataques de sándwich y frontrunning por bots en mempools públicos de L1',
        'Márgenes de liquidación insuficientes en episodios de alta volatilidad',
      ],
      mitigations: [
        'Uso de Private RPCs (Flashbots Protect, MEV-Blocker) para omitir mempools públicos',
        'Márgenes de liquidación superiores a la volatilidad histórica de 24 horas',
      ],
      historicalPrecedents: 'Colapso de Terra/Luna (mayo 2022, espiral de la muerte algorítmica por arbitraje destructivo entre UST y LUNA).',
    },
    {
      id: 'r-concentration',
      name: 'Riesgo de Concentración de Activos',
      category: 'Estructural',
      rating: 'BAJO',
      score: 42,
      factors: [
        'Excesiva ponderación en un único tipo de colateral exótico o token con baja liquidez',
        'Falta de límites máximos de deuda por activo colateral (Borrow / Supply Caps)',
      ],
      mitigations: [
        'Implementación estricta de Supply Caps y Borrow Caps configurables por gobernanza',
        'Aislamiento de activos volátiles en mercados de crédito cerrados (Isolated Pools)',
      ],
      historicalPrecedents: 'Explotación de CRV en Aave v2 (noviembre 2022, intento de manipulación con préstamo masivo para generar deudas incobrables).',
    },
  ];

  const [selectedDimension, setSelectedDimension] = useState<RiskDimension>(dimensions[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <Shield className="w-3.5 h-3.5" />
            <span>8-PILLAR COMPREHENSIVE PROTOCOL RISK EVALUATOR</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">DEFI RISK ENGINE</h1>
          <p className="text-xs text-slate-400">
            Evaluación multidimensional de protocolos DeFi. Rechaza scores opacos y detalla los factores causales, mitigaciones y precedentes históricos.
          </p>
        </div>
      </div>

      {/* Grid of 8 Risk Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {dimensions.map((dim) => {
          const isSelected = selectedDimension.id === dim.id;
          return (
            <div
              key={dim.id}
              onClick={() => setSelectedDimension(dim)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-[#0F172A] border-rose-500 shadow-md'
                  : 'bg-[#0A0E17] border-[#1E293B] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-mono">{dim.category}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    dim.rating === 'CRÍTICO'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : dim.rating === 'ALTO'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : dim.rating === 'MODERADO'
                      ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {dim.rating}
                </span>
              </div>
              <div className="text-xs font-bold text-white leading-snug">
                {dim.name}
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    dim.score > 80 ? 'bg-rose-500' : dim.score > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Dimension Dossier */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <span className="text-xs font-mono text-slate-400">PILAR DE EVALUACIÓN DE RIESGO DEFI</span>
            <h2 className="text-xl font-bold text-white mt-0.5">{selectedDimension.name}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono-nums">
              Severidad Teórica: <strong className="text-white">{selectedDimension.score}/100</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Causal Factors */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Factores Causales de Riesgo</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              {selectedDimension.factors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Mitigations */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Medidas Obligatorias de Mitigación</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              {selectedDimension.mitigations.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Historical Precedent */}
        <div className="p-4 rounded-lg bg-[#080B10] border border-slate-800 space-y-1.5 text-xs">
          <span className="font-bold text-slate-200">Precedentes Históricos Documentados en la Industria:</span>
          <p className="text-slate-400 leading-relaxed">{selectedDimension.historicalPrecedents}</p>
        </div>
      </div>
    </div>
  );
};
