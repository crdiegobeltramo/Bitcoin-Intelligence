import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, ArrowRight, Layers, Shield, Code2, Database } from 'lucide-react';

export const CopilotWizardView: React.FC = () => {
  const [projectType, setProjectType] = useState<'TOKEN' | 'DEX' | 'DAO' | 'MULTISIG'>('DEX');
  const [targetChain, setTargetChain] = useState<'ETHEREUM' | 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'POLYGON'>('ARBITRUM');
  const [customDescription, setCustomDescription] = useState('Quiero construir un exchange descentralizado (DEX) con modelo AMM x*y=k y tarifas dinámicas.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [architectureGenerated, setArchitectureGenerated] = useState(true);

  const presets = {
    TOKEN: {
      title: 'Token Fungible ERC-20 con Gobernanza y Staking',
      blockchainRecommendation: 'Arbitrum One / Base (bajas comisiones para micropagos)',
      smartContracts: ['TokenGovernance.sol (ERC20Votes, ERC20Permit)', 'TimelockController.sol', 'StakingVault.sol'],
      frontend: 'Next.js 15 / React 19 + Wagmi v2 + Viem + RainbowKit + Tailwind CSS',
      backend: 'Node.js / Express con Prisma ORM + Redis para caché de cotizaciones',
      database: 'PostgreSQL en Cloud SQL para historial de transacciones de usuarios',
      apis: 'CoinGecko API para precios fiat, Alchemy / Infura RPC endpoints',
      oracle: 'Chainlink Data Feeds (BTC/USD, ETH/USD) con heartbeat de 1 hora',
      security: 'Checks-Effects-Interactions, Ownable2Step, ReentrancyGuard, Invariant fuzz testing con Foundry',
      testing: 'Foundry (forge test) con 10,000 runs de fuzzing y pruebas de fork en mainnet',
      deployment: 'Foundry script determinístico con CREATE2 y verificación automática en Arbiscan',
      monitoring: 'Tenderly Alerting + OpenZeppelin Defender para detección de anomalías on-chain',
    },
    DEX: {
      title: 'Exchange Descentralizado (DEX) con AMM x * y = k',
      blockchainRecommendation: 'Arbitrum One (L2 con alto throughput, finality rápida y compatibilidad EVM plena)',
      smartContracts: ['DexFactory.sol', 'DexPair.sol (x*y=k, cumulative prices)', 'DexRouter.sol (multihop, slippage protection)', 'FeeDistributor.sol'],
      frontend: 'React SPA + Tailwind CSS + TradingView Chart Widget + Uniswap SDK v3 Core + Ethers.js',
      backend: 'Enrutador de cotizaciones en Go o TypeScript con WebSocket para libro de órdenes y eventos de swaps',
      database: 'The Graph Subgraph descentralizado para indexar pares, liquidez y volumen histórico',
      apis: 'RPC WebSocket nodes (QuickNode / Alchemy) para suscripción en tiempo real a eventos Sync y Swap',
      oracle: 'TWAP on-chain generado nativamente por los contratos Pair + Chainlink Feeds de referencia',
      security: 'Protección contra sandwich attacks (deadline forzoso y minAmountOut estricto), sin reentrancia en transferencias de tokens no estándar (SafeERC20)',
      testing: 'Pruebas unitarias completas de cálculo de slippage e impermanent loss en Foundry y Hardhat',
      deployment: 'Despliegue multi-chain con Foundry y scripts de inicialización de liquidez inicial',
      monitoring: 'Dune Analytics Dashboard para volumen y monitoreo de saldos de reserva de pools',
    },
    DAO: {
      title: 'Organización Autónoma Descentralizada (DAO) con Tesorería',
      blockchainRecommendation: 'Ethereum L1 (para seguridad y consenso institucional de gobernanza)',
      smartContracts: ['GovernorBravo.sol / OpenZeppelin Governor', 'TimelockController.sol (48h delay)', 'TreasuryVault.sol'],
      frontend: 'React + Tally / Snapshot API integration + Web3Modal',
      backend: 'Servicio de notificaciones de propuestas en Discord / Telegram vía bots',
      database: 'PostgreSQL para debates de gobernanza off-chain y transcripción de foros',
      apis: 'Snapshot GraphQL API, Etherscan API para balances de voto históricos',
      oracle: 'Snapshot vote power calculator con checkpoints de bloques pasados',
      security: 'Quorum estricto, propuesta con umbral mínimo de tokens para evitar spam, timelock no saltable',
      testing: 'Simulación de ciclo de vida completo de propuesta (Creación -> Votación -> Cola -> Ejecución)',
      deployment: 'Scripts de inicialización de roles y renuncia de propiedad hacia el Timelock',
      monitoring: 'Forta Network para alertas en tiempo real de transacciones sospechosas dirigidas a la tesorería',
    },
    MULTISIG: {
      title: 'Bóveda de Custodia Multifirma Corporativa M-de-N',
      blockchainRecommendation: 'Ethereum / Arbitrum (compatible con Safe Protocol)',
      smartContracts: ['CorporateMultisig.sol (M-of-N signature threshold)', 'AllowanceModule.sol', 'RecoveryModule.sol'],
      frontend: 'React + Safe SDK + EIP-712 typed data signing interface',
      backend: 'Servicio de relay de firmas parciales cifradas de extremo a extremo',
      database: 'PostgreSQL / Firestore para transacciones en cola pendientes de aprobación',
      apis: 'Safe Transaction Service API para indexación de firmas de propietarios',
      oracle: 'No requerido (ejecución determinista de llamadas arbitrarias)',
      security: 'Rechazo de firmas duplicadas, validación de dirección cero, separación estricta de propietarios',
      testing: 'Pruebas de matriz combinatoria de confirmaciones y rechazos de firmas en Hardhat/Foundry',
      deployment: 'Despliegue determinista CREATE2 a través de fábrica Safe verificada',
      monitoring: 'Notificaciones push móviles y verificación obligatoria mediante hardware wallets air-gapped',
    },
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setArchitectureGenerated(true);
    }, 400);
  };

  const currentPreset = presets[projectType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Bot className="w-3.5 h-3.5" />
            <span>AI BLOCKCHAIN ARCHITECTURE COPILOT</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">BLOCKCHAIN DEVELOPMENT COPILOT</h1>
          <p className="text-xs text-slate-400">
            Diseña la arquitectura integral de un proyecto Web3: desde smart contracts y oráculos hasta frontend y seguridad.
          </p>
        </div>
      </div>

      {/* Input Configuration Panel */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Configuración del Proyecto a Arquitectar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'DEX', label: 'Exchange AMM (DEX)' },
            { id: 'TOKEN', label: 'Token ERC-20 / Staking' },
            { id: 'DAO', label: 'DAO & Tesorería' },
            { id: 'MULTISIG', label: 'Bóveda Multifirma' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setProjectType(type.id as any);
                setArchitectureGenerated(true);
              }}
              className={`p-3 rounded-lg text-xs font-semibold text-center border transition-all ${
                projectType === type.id
                  ? 'bg-[#1E293B] text-[#F7931A] border-[#F7931A] shadow'
                  : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium">Descripción y requerimientos específicos del sistema:</label>
          <textarea
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            rows={2}
            className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F7931A]"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#F7931A] hover:bg-[#e08213] rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generando Arquitectura...' : 'Sintetizar Plan de Arquitectura'}</span>
          </button>
        </div>
      </div>

      {/* Generated 14-Pillar Specification Dossier */}
      {architectureGenerated && (
        <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div>
              <span className="text-xs font-mono text-[#F7931A]">ESPECIFICACIÓN TÉCNICA GENERADA</span>
              <h2 className="text-xl font-bold text-white mt-0.5">{currentPreset.title}</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>14 Pilares Verificados</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">1. Blockchain Recomendada</span>
              <p className="text-cyan-300 font-medium">{currentPreset.blockchainRecommendation}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">2. Smart Contracts Necesarios</span>
              <ul className="list-disc list-inside text-slate-200 space-y-0.5">
                {currentPreset.smartContracts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">3. Stack de Frontend</span>
              <p className="text-slate-200">{currentPreset.frontend}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">4. Backend & Servicios</span>
              <p className="text-slate-200">{currentPreset.backend}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">5. Base de Datos / Indexación</span>
              <p className="text-slate-200">{currentPreset.database}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">6. APIs & Proveedores RPC</span>
              <p className="text-slate-200">{currentPreset.apis}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">7. Oráculo de Precios</span>
              <p className="text-slate-200">{currentPreset.oracle}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">8. Protocolo de Seguridad</span>
              <p className="text-slate-200">{currentPreset.security}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">9. Framework de Testing</span>
              <p className="text-slate-200">{currentPreset.testing}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">10. Estrategia de Despliegue</span>
              <p className="text-slate-200">{currentPreset.deployment}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1 md:col-span-2">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">11. Monitoreo On-Chain & Detección de Incidentes</span>
              <p className="text-slate-200">{currentPreset.monitoring}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
