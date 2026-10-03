import React, { useState } from 'react';
import { NavigationSection, AuthUser, SubscriptionPlanId } from '../../types';
import { SUBSCRIPTION_TIERS, PAYMENT_METHODS } from '../../services/billing/subscriptionPlans';
import { SPECIALIZED_AGENTS } from '../../services/aiOrchestrator/agentOrchestrator';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Code2,
  Terminal,
  BookOpen,
  Cpu,
  Layers,
  Lock,
  ExternalLink,
  Wallet,
  Play,
  CheckCircle2,
  Sparkles,
  Server,
  Activity,
  Globe,
  Bot,
  Coins,
  CreditCard,
  Copy,
  Check,
  FileCode,
  Shield
} from 'lucide-react';

interface LandingPageViewProps {
  onNavigate: (section: NavigationSection) => void;
  onOpenAuthModal: () => void;
  currentUser: AuthUser | null;
  activePlanId: SubscriptionPlanId;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  onOpenAuthModal,
  currentUser,
  activePlanId,
}) => {
  const [selectedFrameworkStepId, setSelectedFrameworkStepId] = useState<string>('b-background');
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);
  const [copiedOzCode, setCopiedOzCode] = useState(false);
  const [activeOzTab, setActiveOzTab] = useState<'ERC20' | 'ERC721' | 'AccessControl'>('ERC20');

  const ozSnippets: Record<string, { title: string; filename: string; code: string; notes: string }> = {
    ERC20: {
      title: 'ERC-20 Token con EIP-2612 Permit & Ownable2Step',
      filename: 'BitcoinIntelToken.sol',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title BitcoinIntelToken
 * @notice OpenZeppelin v5 standard compliant token with gasless approvals
 */
contract BitcoinIntelToken is ERC20, ERC20Permit, ERC20Burnable, Ownable2Step {
    constructor(address initialOwner)
        ERC20("Bitcoin Intelligence Token", "BIT")
        ERC20Permit("Bitcoin Intelligence Token")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 21_000_000 * 10 ** decimals());
    }

    // Unified OpenZeppelin v5 _update hook
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20)
    {
        super._update(from, to, value);
    }
}`,
      notes: 'Utiliza el hook unificado _update() de OpenZeppelin v5 con optimización de gas y compatibilidad con EIP-2612.'
    },
    ERC721: {
      title: 'ERC-721 NFT con URIStorage & ERC721Burnable',
      filename: 'BitcoinCertificateNFT.sol',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BitcoinCertificateNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("Bitcoin Developer Cert", "BDCERT")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
      notes: 'Resolución de herencias múltiples en supportsInterface() y tokenURI() conforme a Solidity 0.8.24 y OZ v5.'
    },
    AccessControl: {
      title: 'Control de Acceso Basado en Roles (RBAC)',
      filename: 'VaultSecurityGuard.sol',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VaultSecurityGuard is AccessControl, ReentrancyGuard {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor(address rootAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, rootAdmin);
        _grantRole(AUDITOR_ROLE, rootAdmin);
    }

    function criticalExecution() external onlyRole(OPERATOR_ROLE) nonReentrant {
        // Ejecución protegida contra reentrancia con verificación estricta de rol
    }
}`,
      notes: 'Separación estricta de privilegios con DEFAULT_ADMIN_ROLE y protección reentrante.'
    }
  };

  const handleCopyOzCode = () => {
    navigator.clipboard.writeText(ozSnippets[activeOzTab].code);
    setCopiedOzCode(true);
    setTimeout(() => setCopiedOzCode(false), 2000);
  };

  const frameworkSteps = [
    { id: 'step-B', letter: 'B', word: 'Background', desc: 'El contexto que el modelo necesita para no adivinar ni alucinar.', example: 'Contexto: Auditoría de contrato Uniswap v2 pair en Arbitrum One con tarifas dinámicas.' },
    { id: 'step-I-intent', letter: 'I', word: 'Intent', desc: 'El objetivo real de negocio detrás del requerimiento técnico.', example: 'Objetivo: Verificar que ningún atacante pueda drenar reservas mediante reentrancia de solo lectura.' },
    { id: 'step-T', letter: 'T', word: 'Task', desc: 'La acción concreta, determinista y acotada.', example: 'Tarea: Analizar el orden de ejecución en la función swap() e identificar violación del patrón CEI.' },
    { id: 'step-C', letter: 'C', word: 'Constraints', desc: 'Límites, directrices de seguridad y salvaguardas sin excepción.', example: 'Límites: Cumplir Solidity 0.8.24, no usar tx.origin, exigir SafeERC20 para transferencias.' },
    { id: 'step-O', letter: 'O', word: 'Output', desc: 'El formato exacto y estructurado de salida.', example: 'Salida: Tabla markdown con hallazgo, severidad (Critical/High), escenario PoC y código corregido.' },
    { id: 'step-I-info', letter: 'I', word: 'Information sources', desc: 'De dónde proviene la información y qué jamás inventar.', example: 'Fuentes: Documentación oficial OpenZeppelin v5.0 y especificación EIP-2612.' },
    { id: 'step-N', letter: 'N', word: 'Next actions', desc: 'Qué paso sigue tras la respuesta del copiloto.', example: 'Siguientes pasos: Escribir test suite en Foundry para reproducir el vector con fuzz testing.' },
  ];

  const currentFramework = frameworkSteps.find((s) => s.id === selectedFrameworkStepId) || frameworkSteps[0];

  return (
    <div className="space-y-16 max-w-6xl mx-auto pb-16 font-sans">
      {/* ============================================================
          HERO: DE ANALISTA A_CONSTRUCTOR (DUAL AESTHETIC)
         ============================================================ */}
      <section className="relative rounded-3xl overflow-hidden border border-[#1E293B] bg-[#0A0E17] shadow-2xl">
        {/* Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
          {/* Left Split: Editorial Paper / Fundamentos */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#EDE6D6] text-[#1B2430] space-y-4">
            <span className="text-xs uppercase font-mono tracking-widest text-[#8B3A2B] font-bold">
              CLAUDE PARA BITCOIN & BLOCKCHAIN
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.08]">
              De analista
            </h1>
            <p className="text-sm text-[#45505F] leading-relaxed max-w-md font-sans">
              Aprende a investigar, modelar balances y evaluar protocolos con el mismo rigor metodológico con el que se audita un estado financiero.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('learning-mode')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B2430] text-[#EDE6D6] text-xs font-mono font-semibold hover:bg-[#2B384B] transition-colors"
              >
                <span>Leer Modo Aprendizaje</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Split: Terminal / Constructores Web3 */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#090D12] text-[#EDE6D6] space-y-4 border-t md:border-t-0 md:border-l border-[#1E293B] relative">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121922] border border-[#F2A93B]/20 text-[10px] font-mono text-[#F2A93B]">
              <div className="w-2 h-2 rounded-full bg-[#F2A93B] animate-pulse" />
              <span>TERMINAL OS ONLINE</span>
            </div>

            <span className="text-xs uppercase font-mono tracking-widest text-[#F2A93B] font-bold">
              BUILDING ON-CHAIN
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold tracking-tight text-[#FFC876] leading-[1.08]">
              a_constructor
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md font-sans">
              Copiloto de arquitectura, contratos inteligentes con OpenZeppelin v5, auditoría estática, simuladores AMM y orquestación multi-agente.
            </p>
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F2A93B] text-[#1B1300] text-xs font-mono font-bold hover:bg-[#FFC876] transition-colors shadow-lg"
              >
                <Terminal className="w-4 h-4" />
                <span>Abrir Terminal Principal</span>
              </button>
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121922] hover:bg-[#1E293B] border border-slate-700 text-white text-xs font-mono transition-colors"
              >
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>{currentUser ? 'Wallet Conectada' : 'Conectar Wallet Web3'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Bottom Bar */}
        <div className="p-4 sm:p-5 bg-[#0C1322] border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono-nums">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold">Autor: Diego Eduardo Beltramo</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Contador Público · Asesor Idóneo en Mercado de Capitales · Full Stack</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://diegobeltramobitcoin.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F7931A]/15 hover:bg-[#F7931A]/25 border border-[#F7931A]/40 text-[#F7931A] text-xs font-mono font-semibold transition-all hover:scale-105"
            >
              <span>diegobeltramobitcoin.netlify.app</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          PREMISA FILOSÓFICA & MANIFIESTO
         ============================================================ */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <blockquote className="text-xl sm:text-2xl lg:text-3xl font-display italic text-slate-200 leading-snug">
          «"La inteligencia artificial no reemplaza al desarrollador, inversor ni al analista. Amplifica su capacidad de investigar, construir, verificar y tomar decisiones informadas."»
        </blockquote>
        <div className="w-16 h-1 bg-[#8B3A2B] mx-auto rounded-full" />
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed text-justify sm:text-center">
          Cada sección de la plataforma distingue explícitamente entre <strong className="text-white">HECHO</strong>, <strong className="text-white">ANÁLISIS</strong>, <strong className="text-white">OPINIÓN</strong> e <strong className="text-white">INCERTIDUMBRE</strong>. Ningún módulo inventa métricas, cotizaciones ni APIs. La seguridad y la verificación determinista rigen todo el sistema.
        </p>
      </section>

      {/* ============================================================
          INTERACTIVE FRAMEWORK B.I.T.C.O.I.N.
         ============================================================ */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <span className="text-xs font-mono text-[#F7931A] uppercase tracking-wider font-semibold">
              EL MÉTODO DE PROMPTING DE LA SERIE
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">Framework B.I.T.C.O.I.N.</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono-nums">
            7 Letras · Método Propietario para Análisis y Código
          </span>
        </div>

        {/* 7 Interactive Buttons */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {frameworkSteps.map((step) => {
            const isSelected = selectedFrameworkStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedFrameworkStepId(step.id)}
                className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#1E293B] border-[#F7931A] text-[#F7931A] shadow-md scale-105'
                    : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="font-display font-extrabold text-lg sm:text-2xl">{step.letter}</div>
                <div className="hidden sm:block text-[10px] font-mono mt-0.5 truncate">{step.word}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Framework Letter Display Box */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-2xl text-[#F7931A]">
                {currentFramework.letter}
              </span>
              <span className="font-bold text-white text-sm">{currentFramework.word}</span>
            </div>
            <span className="text-[11px] text-slate-500">Paso del Framework</span>
          </div>

          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {currentFramework.desc}
          </p>

          <div className="p-3 rounded-lg bg-[#080B10] border border-slate-900 text-cyan-300 overflow-x-auto">
            <strong className="text-slate-400">Ejemplo en Ingeniería de Prompts:</strong>
            <div className="mt-1 text-slate-200">{currentFramework.example}</div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PILARES DE DESARROLLO BLOCKCHAIN & WEB3
          (EVM, Solidity, OpenZeppelin, BitVM, Covenants, Ciberseguridad)
         ============================================================ */}
      <section className="space-y-6">
        <div className="border-b border-[#1E293B] pb-4">
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            TECNOLOGÍA & PROTOCOLOS
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Pilares Técnicos del Ecosistema Blockchain
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            De la Ethereum Virtual Machine a BitVM en Bitcoin, smart contracts en Solidity y ciberseguridad defensiva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 1: EVM & Solidity */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 w-fit">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">EVM & Solidity ^0.8.24</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                La Ethereum Virtual Machine ejecuta contratos inteligentes en un entorno Turing-completo seguro. Solidity traduce acuerdos y lógica económica sin intermediarios tradicionales.
              </p>
            </div>
            <button
              onClick={() => onNavigate('smart-contract-lab')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2"
            >
              <span>Smart Contract Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: OpenZeppelin Contracts v5.0 */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">OpenZeppelin v5 Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estándares probados en batalla: ERC-20 (Permit EIP-2612), ERC-721, ERC-1155, AccessControl, Ownable2Step y el nuevo hook unificado `_update` con ReentrancyGuard.
              </p>
            </div>
            <button
              onClick={() => onNavigate('openzeppelin')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2"
            >
              <span>Generar con OpenZeppelin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: BitVM & Covenants en Bitcoin */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-[#F7931A] w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">BitVM & Covenants Bitcoin</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cómputo off-chain con verificación en Bitcoin (Robin Linus). Covenants para bóvedas no interactivas, fideicomisos digitales, herencias e invariantes de gasto de UTXOs.
              </p>
            </div>
            <button
              onClick={() => onNavigate('bip-watch')}
              className="text-xs font-semibold text-[#F7931A] hover:text-amber-300 flex items-center gap-1 mt-2"
            >
              <span>Explorar BIPs y Covenants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 4: Ciberseguridad & Vulnerabilidades */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ciberseguridad & Anti-Honeypot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspección de vulnerabilidades CVE, mitigación de reentrancy, oráculos vulnerables a Flash Loans, BSCCheck y análisis estático con el AI Smart Contract Auditor.
              </p>
            </div>
            <button
              onClick={() => onNavigate('security-auditor')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 mt-2"
            >
              <span>Auditar Contratos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 5: DeFi AMM & Liquidez */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">DEX AMM Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modelado matemático del producto constante (x · y = k), cálculo de slippage, impacto en precio y deducción formal de la pérdida impermanente para LPs.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dex-lab')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2"
            >
              <span>Abrir Simulador DEX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 6: Infraestructura RPC & Oráculos */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-300 w-fit">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">QuickNode & Chainlink Feeds</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conectividad RPC con nodos completos de alta velocidad y oráculos descentralizados resistentes a ataques de desvío de reservas y arbitraje tóxico.
              </p>
            </div>
            <button
              onClick={() => onNavigate('copilot-wizard')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2"
            >
              <span>Copiloto de Arquitectura</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 7: Métricas On-Chain & Correlaciones */}
          <div className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-3 flex flex-col justify-between md:col-span-2 lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#F7931A]/20 border border-[#F7931A]/40 text-[#F7931A] w-fit">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Hub de Métricas On-Chain & Correlaciones Macroeconómicas</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Acceso analítico integrado a 14 fuentes primarias: <strong>Look Into Bitcoin</strong> (MVRV-Z, Puell, S2F), <strong>CryptoQuant</strong> (Reservas, Outflows), <strong>CoinGecko</strong>, <strong>CoinMarketCap</strong>, <strong>CryptoCompare</strong>, <strong>BitBo</strong>, <strong>Blockchain Explorer</strong>, <strong>NodeCharts</strong>, <strong>Bitcoin Visuals</strong>, <strong>LiveCoinWatch</strong>, <strong>Mataf</strong>, <strong>Stenox.ai</strong> y correlaciones cuantitativas (Oro, S&P 500, DXY, M2).
                </p>
              </div>
              <button
                onClick={() => onNavigate('onchain-analytics')}
                className="px-4 py-2 rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow"
              >
                <span>Explorar 14 Fuentes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          OPENZEPPELIN CONTRACTS V5.0 INTERACTIVE SHOWCASE
         ============================================================ */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>ESTÁNDARES DE LA INDUSTRIA AUDITADOS</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              OpenZeppelin Contracts v5.0 Interactive Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Genera contratos de grado producción con arquitectura de gas optimizado, hook unificado <code className="text-cyan-300">_update()</code> y protección reentrante.
            </p>
          </div>
          <button
            onClick={() => onNavigate('openzeppelin')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-colors self-start sm:self-auto"
          >
            <span>Abrir Studio Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2 overflow-x-auto">
          {(['ERC20', 'ERC721', 'AccessControl'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveOzTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeOzTab === tab
                  ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white bg-[#0F172A] border border-transparent'
              }`}
            >
              {tab === 'ERC20' ? 'ERC-20 (Permit EIP-2612)' : tab === 'ERC721' ? 'ERC-721 (NFT URIStorage)' : 'AccessControl & RBAC'}
            </button>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div className="rounded-xl bg-[#05080E] border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0C1322] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{ozSnippets[activeOzTab].filename}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Solidity ^0.8.24</span>
            </div>
            <button
              onClick={handleCopyOzCode}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {copiedOzCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOzCode ? 'Copiado' : 'Copiar Código'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 leading-relaxed scrollbar-thin">
            <code>{ozSnippets[activeOzTab].code}</code>
          </pre>

          <div className="p-3 bg-[#0C1322]/80 border-t border-slate-800/80 text-xs text-slate-400 font-sans flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{ozSnippets[activeOzTab].notes}</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          CATÁLOGO DE LOS 10 AGENTES ESPECIALIZADOS (AGENTS.md)
         ============================================================ */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A] font-semibold uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>AI ORCHESTRATOR & SWARM</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Catálogo de 10 Agentes Especializados
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enrutamiento inteligente hacia agentes con herramientas deterministas, reglas sin alucinación y trazabilidad total.
            </p>
          </div>
          <button
            onClick={() => onNavigate('agent-orchestrator')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-black text-xs font-mono font-bold transition-colors self-start sm:self-auto"
          >
            <span>Abrir Orquestador</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Agent Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SPECIALIZED_AGENTS.map((agent, idx) => {
            const isSelected = selectedAgentIndex === idx;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-[#1E293B] border-[#F7931A] shadow-md'
                    : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 hover:bg-[#152033]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#F7931A] text-black' : 'bg-slate-800 text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <Bot className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F7931A]' : 'text-slate-500'}`} />
                </div>
                <div className="text-xs font-bold text-white leading-tight truncate">
                  {agent.name.replace(' Agent', '')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Agent Details Card */}
        {SPECIALIZED_AGENTS[selectedAgentIndex] && (
          <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <div className="text-xs font-mono text-[#F7931A] font-semibold">
                  AGENTE ACTIVO #{selectedAgentIndex + 1}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {SPECIALIZED_AGENTS[selectedAgentIndex].name}
                </h3>
                <p className="text-xs text-slate-300">
                  {SPECIALIZED_AGENTS[selectedAgentIndex].role}
                </p>
              </div>
              <button
                onClick={() => onNavigate('agent-orchestrator')}
                className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 border border-slate-600 text-white text-xs font-mono transition-colors self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>Ejecutar Consulta</span>
                <ArrowRight className="w-3 h-3 text-[#F7931A]" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#080B10] border border-slate-900 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Especialidad de Dominio:</span>
                <p className="text-slate-200">{SPECIALIZED_AGENTS[selectedAgentIndex].specialty}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#080B10] border border-slate-900 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Herramientas y Conectores:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {SPECIALIZED_AGENTS[selectedAgentIndex].tools.map((tool, toolIdx) => (
                    <span key={`${SPECIALIZED_AGENTS[selectedAgentIndex].id}-tool-${toolIdx}`} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080B10] border border-slate-900 text-xs">
              <span className="text-slate-500 font-mono font-bold uppercase text-[10px]">Consulta de Muestra:</span>
              <p className="text-[#F7931A] font-mono mt-1">"{SPECIALIZED_AGENTS[selectedAgentIndex].sampleQuery}"</p>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          CATÁLOGO DE LIBROS DE DIEGO EDUARDO BELTRAMO
         ============================================================ */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="border-b border-[#1E293B] pb-4">
          <span className="text-xs font-mono text-[#F7931A] uppercase tracking-wider font-semibold">
            SERIE EDITORIAL OFICIAL
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Claude para Bitcoin — Dos Volúmenes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            El Volumen 1 se lee como un analista. El Volumen 2 se construye como un desarrollador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volumen 1 */}
          <div className="p-6 rounded-xl bg-[#F5F0E4] text-[#1B2430] space-y-4 shadow-lg border border-slate-300 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-[#8B3A2B] uppercase">Volumen 1</span>
              <h3 className="text-xl font-display font-bold">Fundamentos, Análisis e Inversión</h3>
              <p className="text-xs text-[#45505F] leading-relaxed">
                Para inversores, analistas de mercado y contadores. No requiere nociones previas de programación.
              </p>
              <div className="flex gap-4 font-mono text-xs pt-2">
                <div><strong className="text-lg">20</strong><div className="text-[10px] text-slate-500">Capítulos</div></div>
                <div><strong className="text-lg">6</strong><div className="text-[10px] text-slate-500">Anexos</div></div>
                <div><strong className="text-lg">100+</strong><div className="text-[10px] text-slate-500">Prompts</div></div>
              </div>
              <ul className="list-disc list-inside text-xs text-[#1B2430] space-y-1 pt-2">
                <li>Framework B.I.T.C.O.I.N. de prompting</li>
                <li>Análisis fundamental de nueve capas y métricas on-chain</li>
                <li>Ciclos de mercado sin determinismo ni adivinación</li>
                <li>Custodia, seguridad y amenazas de ingeniería social</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://play.google.com/store/books"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 text-center rounded-lg bg-[#1B2430] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Google Play Libros
              </a>
              <a
                href="https://www.hotmart.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 text-center rounded-lg bg-[#8B3A2B] text-white text-xs font-semibold hover:bg-[#6e2c20] transition-colors"
              >
                Hotmart EPUB
              </a>
            </div>
          </div>

          {/* Volumen 2 */}
          <div className="p-6 rounded-xl bg-[#090D12] text-white space-y-4 shadow-xl border border-[#F2A93B]/30 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-[#F2A93B] uppercase">Volumen 2</span>
              <h3 className="text-xl font-display font-bold text-[#FFC876]">Laboratorio, Desarrollo y Bitcoin Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Para desarrolladores y constructores. Nociones básicas de código y arquitectura de software.
              </p>
              <div className="flex gap-4 font-mono text-xs pt-2 text-slate-300">
                <div><strong className="text-lg text-[#F2A93B]">15</strong><div className="text-[10px] text-slate-500">Capítulos</div></div>
                <div><strong className="text-lg text-[#F2A93B]">4</strong><div className="text-[10px] text-slate-500">Anexos</div></div>
                <div><strong className="text-lg text-[#F2A93B]">50</strong><div className="text-[10px] text-slate-500">Proyectos</div></div>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-2">
                <li>Bitcoin Core, wallet educativa y Lightning Network</li>
                <li>Auditoría de código Solidity y Red Team defensivo</li>
                <li>Paper trading bots y orquestador multi-agente</li>
                <li>Empaquetado de la Claude Skill y Bitcoin Intelligence OS</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onNavigate('subscriptions')}
                className="flex-1 py-2 px-3 text-center rounded-lg bg-[#F2A93B] text-[#1B1300] text-xs font-bold hover:bg-[#FFC876] transition-colors"
              >
                Obtener Plan Pro / Enterprise
              </button>
              <button
                onClick={() => onNavigate('code-workspace')}
                className="py-2 px-3 rounded-lg bg-[#121922] hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
              >
                IDE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PLANES DE SUSCRIPCIÓN & MEDIOS DE PAGO MULTIMONEDA
          (Bitcoin, Lightning, Solana, Bitcoin Cash, Ethereum, Mercado Pago)
         ============================================================ */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A] font-semibold uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              <span>PAGOS SOBERANOS & LOCALES SIN FRICCIÓN</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Planes de Suscripción & Métodos de Pago
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Elige el nivel de acceso que necesitas. Aceptamos liquidación nativa en 6 redes y monedas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('subscriptions')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-black text-xs font-mono font-bold transition-colors self-start sm:self-auto"
          >
            <span>Ver Checkout Multimoneda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isCurrent = activePlanId === tier.id;
            return (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  tier.isPopular
                    ? 'bg-[#0E1626] border-[#F7931A] shadow-xl relative'
                    : 'bg-[#0A0E17] border-slate-800'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 right-5 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#F7931A] text-black uppercase tracking-wider">
                    {tier.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{tier.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      ${tier.monthlyPriceUsd}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">USD / mes</span>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                      Incluye:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {tier.features.slice(0, 4).map((f, i) => (
                        <li key={`${tier.id}-feat-${i}`} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4">
                  <button
                    onClick={() => onNavigate('subscriptions')}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                        : tier.isPopular
                        ? 'bg-[#F7931A] hover:bg-[#e08213] text-black shadow-md'
                        : 'bg-[#1E293B] hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PLAN ACTIVO</span>
                      </>
                    ) : (
                      <>
                        <span>{tier.monthlyPriceUsd === 0 ? 'Acceso Gratuito' : 'Suscribirse Ahora'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Payment Methods Grid */}
        <div className="p-4 rounded-xl bg-[#080B10] border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 font-semibold uppercase tracking-wider">
              6 Vías de Pago Integradas en la Tesorería:
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">Soberanía Financiera & Local</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="p-3 rounded-xl bg-[#0D131F] border border-slate-800 text-left space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${method.iconColor}20`, color: method.iconColor }}
                  >
                    {method.symbol}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono truncate max-w-[65px]">
                    {method.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{method.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 truncate">{method.speed}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          ACCESO SOBERANO WEB3 & GOOGLE (FIREBASE)
          (MetaMask, Trust Wallet, Phantom, Google Firebase)
         ============================================================ */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              <Wallet className="w-4 h-4" />
              <span>CONEXIÓN UNIVERSAL DE IDENTIDAD</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Acceso con Google (Firebase) & Wallets Web3
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa sin contraseña centralizada usando tu billetera criptográfica o autenticación de Google con Firebase.
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold transition-colors self-start sm:self-auto"
          >
            <span>{currentUser ? 'Gestionar Cuenta' : 'Conectar Ahora'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Login Connectors Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Google / Firebase */}
          <div
            onClick={onOpenAuthModal}
            className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-base">
                G
              </div>
              {currentUser?.provider === 'google' ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CONECTADO
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  FIREBASE
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Identity</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acceso con cuenta de Google y sesión persistente Firebase Auth.
              </p>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-1">
              <span>{currentUser?.provider === 'google' ? 'Sesión activa' : 'Conectar Google'}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* MetaMask */}
          <div
            onClick={onOpenAuthModal}
            className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-base">
                🦊
              </div>
              {currentUser?.provider === 'metamask' ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CONECTADO
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  EVM
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MetaMask</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ethereum Mainnet, Arbitrum, Polygon, Base y cadenas EVM.
              </p>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-1">
              <span>{currentUser?.provider === 'metamask' ? 'Wallet activa' : 'Conectar MetaMask'}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Trust Wallet */}
          <div
            onClick={onOpenAuthModal}
            className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-base">
                🛡️
              </div>
              {currentUser?.provider === 'trustwallet' ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CONECTADO
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  MULTI-CHAIN
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Trust Wallet</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Billetera móvil y de navegador para activos multi-cadena.
              </p>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-1">
              <span>{currentUser?.provider === 'trustwallet' ? 'Wallet activa' : 'Conectar Trust'}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Phantom (Solana) */}
          <div
            onClick={onOpenAuthModal}
            className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-base">
                👻
              </div>
              {currentUser?.provider === 'phantom' ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CONECTADO
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  SOLANA
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Phantom (Solana)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ecosistema Solana de sub-segundo con soporte SOL y tokens SPL.
              </p>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-1">
              <span>{currentUser?.provider === 'phantom' ? 'Wallet activa' : 'Conectar Phantom'}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================
          CALL TO ACTION: MULTI-PAYMENT & WALLET LOGIN
         ============================================================ */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#0A0E17] border border-[#1E293B] text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#1E293B] text-cyan-300">
          <Zap className="w-3.5 h-3.5" />
          <span>CHECKOUT MULTIMONEDA & ACCESO WEB3 LISTOS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight max-w-xl mx-auto">
          Comienza a Construir y Analizar con IA Soberana
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Accede con tu cuenta de Google (Firebase) o conecta tu wallet MetaMask, Trust Wallet o Phantom. Paga en Bitcoin on-chain, Lightning Network, Solana, BCH, Ethereum o Mercado Pago.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 rounded-xl bg-[#F7931A] hover:bg-[#e08213] text-white font-bold text-xs font-mono shadow-lg transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Ingresar a la Terminal</span>
          </button>
          <button
            onClick={onOpenAuthModal}
            className="px-6 py-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-white font-semibold text-xs font-mono transition-all flex items-center gap-2 border border-slate-700"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>{currentUser ? `Conectado: ${currentUser.name}` : 'Conectar Billetera / Iniciar Sesión'}</span>
          </button>
          <button
            onClick={() => onNavigate('subscriptions')}
            className="px-6 py-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-semibold text-xs font-mono transition-all flex items-center gap-2 border border-purple-800"
          >
            <span>Ver Planes & Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
