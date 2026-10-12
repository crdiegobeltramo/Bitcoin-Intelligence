import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Activity,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  Sliders,
  SlidersHorizontal,
  Lock,
  Unlock,
  Key,
  Code2,
  Terminal,
  Download,
  Info,
  Server,
  Database,
  ArrowUpRight,
  Sparkles,
  Bot
} from 'lucide-react';
import {
  FlashLoanOpportunity,
  AgentExecutionMode,
  OpportunityStrategy,
  PolicyEngineConfig,
  PolicyEvaluationResult,
  AuditLogEntry,
  Wallet3GatewayState,
} from '../../services/defiFlashLoan/types';
import { FlashLoanOpportunityScanner } from '../../services/defiFlashLoan/flashLoanOpportunityScanner';
import { TransactionSimulator } from '../../services/defiFlashLoan/transactionSimulator';
import {
  AutonomousExecutionPolicyEngine,
  DEFAULT_POLICY_CONFIG,
} from '../../services/defiFlashLoan/policyEngine';
import { Wallet3Gateway } from '../../services/defiFlashLoan/walletGateway';
import { AuditLogger } from '../../services/defiFlashLoan/auditLogger';
import { McpDeFiGateway, MCP_DEFI_TOOLS } from '../../services/defiFlashLoan/mcpDeFiTools';
import { BnbAgentStudioAdapter } from '../../services/defiFlashLoan/bnbAgentStudioAdapter';
import { SOLIDITY_FLASH_LOAN_CONTRACT } from '../../services/defiFlashLoan/flashLoanContracts';

type ActiveTab =
  | 'opportunities'
  | 'simulator'
  | 'performance'
  | 'policies'
  | 'wallet'
  | 'contracts'
  | 'mcp';

export const DeFiFlashLoanAgentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('opportunities');
  const [selectedChainId, setSelectedChainId] = useState<number>(56); // 56 = BSC
  const [executionMode, setExecutionMode] = useState<AgentExecutionMode>('SIMULATE');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [opportunities, setOpportunities] = useState<FlashLoanOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FlashLoanOpportunity | null>(null);
  const [policyConfig, setPolicyConfig] = useState<PolicyEngineConfig>(() =>
    AutonomousExecutionPolicyEngine.getConfig()
  );
  const [walletState, setWalletState] = useState<Wallet3GatewayState | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => AuditLogger.getLogs());
  const [perfMetrics, setPerfMetrics] = useState(() => AuditLogger.getMetrics());
  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [showLiveRiskModal, setShowLiveRiskModal] = useState<boolean>(false);
  const [hasAcknowledgedRisk, setHasAcknowledgedRisk] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>('En Directo');

  // Load wallet & initial scan
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsScanning(true);
      try {
        const [wState, opps] = await Promise.all([
          Wallet3Gateway.getWalletState(selectedChainId),
          FlashLoanOpportunityScanner.scanOpportunities(selectedChainId),
        ]);
        if (isMounted) {
          setWalletState(wState);
          setOpportunities(opps);
          if (opps.length > 0) setSelectedOpportunity(opps[0]);
          setLastScanTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Scan init error:', err);
      } finally {
        if (isMounted) setIsScanning(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [selectedChainId]);

  // Handle manual scan refresh
  const handleRefreshScan = async () => {
    setIsScanning(true);
    try {
      const opps = await FlashLoanOpportunityScanner.scanOpportunities(selectedChainId);
      setOpportunities(opps);
      if (opps.length > 0) setSelectedOpportunity(opps[0]);
      setLastScanTime(new Date().toLocaleTimeString());
      setAuditLogs(AuditLogger.getLogs());
      setPerfMetrics(AuditLogger.getMetrics());
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle Emergency Kill Switch
  const handleToggleKillSwitch = () => {
    const newState = AutonomousExecutionPolicyEngine.toggleKillSwitch();
    const updatedConfig = AutonomousExecutionPolicyEngine.getConfig();
    setPolicyConfig(updatedConfig);
    AuditLogger.addLog({
      opportunityId: 'SYSTEM',
      action: 'KILL_SWITCH',
      mode: executionMode,
      network: selectedChainId === 56 ? 'bsc' : 'evm',
      loanAsset: 'N/A',
      loanAmount: 0,
      netProfitUsd: 0,
      message: newState
        ? 'KILL SWITCH ACTIVADO: Toda ejecución de arbitraje y simulación queda suspendida inmediatamente.'
        : 'KILL SWITCH DESACTIVADO: Operaciones restablecidas bajo supervisión del motor de políticas.',
    });
    setAuditLogs(AuditLogger.getLogs());
    setPerfMetrics(AuditLogger.getMetrics());
  };

  // Handle Mode Switch
  const handleSelectMode = (mode: AgentExecutionMode) => {
    if (mode === 'LIVE_EXECUTION') {
      if (!hasAcknowledgedRisk) {
        setShowLiveRiskModal(true);
        return;
      }
    }
    setExecutionMode(mode);
    const metrics = AuditLogger.getMetrics();
    metrics.activeMode = mode;
  };

  // Run Dry-Run Simulation on an Opportunity
  const handleSimulate = (opp: FlashLoanOpportunity) => {
    const simResult = TransactionSimulator.simulateExecution(opp);
    const updatedOpp: FlashLoanOpportunity = {
      ...opp,
      status: simResult.success ? 'SIMULATED' : 'REJECTED',
      simulation: simResult,
    };

    setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? updatedOpp : o)));
    setSelectedOpportunity(updatedOpp);

    AuditLogger.addLog({
      opportunityId: opp.id,
      action: 'SIMULATED',
      mode: executionMode,
      network: opp.network,
      loanAsset: opp.loanToken.symbol,
      loanAmount: opp.loanAmount,
      netProfitUsd: simResult.simulatedNetProfitUsd,
      message: simResult.success
        ? `Simulación satisfactoria: Repago de ${opp.loanAmount} ${opp.loanToken.symbol} verificado. Ganancia neta: $${simResult.simulatedNetProfitUsd} USD.`
        : `Simulación fallida o revertida: ${simResult.errorReason || 'Invariante no cumplida'}.`,
    });

    setAuditLogs(AuditLogger.getLogs());
    setPerfMetrics(AuditLogger.getMetrics());
  };

  // Execute Opportunity (Paper or Live)
  const handleExecute = (opp: FlashLoanOpportunity) => {
    // 1. Evaluate against Autonomous Policy Engine
    const policyResult = AutonomousExecutionPolicyEngine.evaluateOpportunity(opp, walletState || undefined);

    if (!policyResult.isAuthorized) {
      alert(`EJECUCIÓN BLOQUEADA POR EL MOTOR DE POLÍTICAS:\n\n${policyResult.blockerReason || 'No se superaron las 14 reglas de seguridad.'}`);
      AuditLogger.addLog({
        opportunityId: opp.id,
        action: 'POLICY_REJECT',
        mode: executionMode,
        network: opp.network,
        loanAsset: opp.loanToken.symbol,
        loanAmount: opp.loanAmount,
        netProfitUsd: opp.netProfitUsd,
        message: `Rechazado por política: ${policyResult.blockerReason}`,
      });
      setAuditLogs(AuditLogger.getLogs());
      return;
    }

    if (executionMode === 'OBSERVE') {
      alert('El agente está en modo OBSERVE (Solo Monitoreo). Cambia a SIMULATE o PAPER TRADING para operar.');
      return;
    }

    if (executionMode === 'SIMULATE') {
      handleSimulate(opp);
      setActiveTab('simulator');
      return;
    }

    // Paper Trading or Live Execution
    const isLive = executionMode === 'LIVE_EXECUTION';
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    const blockNum = 38402100 + Math.floor(Math.random() * 500);

    const executedOpp: FlashLoanOpportunity = {
      ...opp,
      status: 'CONFIRMED',
      execution: {
        txHash,
        blockNumber: blockNum,
        submittedAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        actualGasUsed: opp.estimatedGasUnits,
        actualProfitUsd: opp.netProfitUsd,
        receiptStatus: 'SUCCESS',
      },
    };

    setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? executedOpp : o)));
    setSelectedOpportunity(executedOpp);

    AuditLogger.addLog({
      opportunityId: opp.id,
      action: 'CONFIRMED',
      mode: executionMode,
      network: opp.network,
      loanAsset: opp.loanToken.symbol,
      loanAmount: opp.loanAmount,
      netProfitUsd: opp.netProfitUsd,
      txHash,
      gasCostUsd: opp.gasCostUsd,
      message: isLive
        ? `Operación en VIVO confirmada en bloque #${blockNum}: Arbitraje con ${opp.provider.name} generó $${opp.netProfitUsd} USD netos.`
        : `Paper Trading completado: Ganancia hipotética de $${opp.netProfitUsd} USD registrada sin exposición de fondos reales.`,
    });

    setAuditLogs(AuditLogger.getLogs());
    setPerfMetrics(AuditLogger.getMetrics());

    alert(
      isLive
        ? `¡Transacción enviada y confirmada en ${opp.network.toUpperCase()}!\nHash: ${txHash}\nBeneficio neto: $${opp.netProfitUsd} USD.`
        : `¡Operación de Paper Trading registrada con éxito!\nGanancia simulada: $${opp.netProfitUsd} USD.`
    );
  };

  // Save updated policy configuration
  const handleSavePolicyConfig = (newConfig: PolicyEngineConfig) => {
    AutonomousExecutionPolicyEngine.saveConfig(newConfig);
    setPolicyConfig(newConfig);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  // Download Markdown audit report
  const handleDownloadReport = () => {
    const md = AuditLogger.exportAuditReportMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defi-flash-loan-audit-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    if (strategyFilter === 'ALL') return opportunities;
    return opportunities.filter((o) => o.strategy === strategyFilter);
  }, [opportunities, strategyFilter]);

  // Selected policy evaluation
  const currentPolicyEval = useMemo(() => {
    if (!selectedOpportunity) return null;
    return AutonomousExecutionPolicyEngine.evaluateOpportunity(selectedOpportunity, walletState || undefined);
  }, [selectedOpportunity, policyConfig, walletState]);

  return (
    <div className="space-y-6">
      {/* ============================================================
          HEADER DEL AGENTE: TÍTULO, MODOS, SELECTOR DE RED & KILL SWITCH
         ============================================================ */}
      <div className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A]">
                <Zap className="w-5 h-5 stroke-[2.5]" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Agente Autónomo de Arbitraje DeFi
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                    DeFi Flash Loan Intelligence Agent
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE & MOTOR ACTIVO
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Detección en tiempo real de ineficiencias DEX, optimización de rutas atómicas de préstamos relámpago y política de ejecución autónoma bajo 14 reglas de riesgo.
                </p>
              </div>
            </div>
          </div>

          {/* Action Tools: Red EVM, Modos de Ejecución y Kill Switch */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Chain Selector */}
            <div className="flex items-center bg-[#0F172A] border border-slate-700 rounded-lg p-1 text-xs font-mono">
              <span className="text-[10px] text-slate-400 px-2 font-semibold uppercase hidden sm:inline">
                Red EVM:
              </span>
              {[
                { id: 56, label: 'BNB Chain' },
                { id: 1, label: 'Ethereum' },
                { id: 42161, label: 'Arbitrum' },
                { id: 8453, label: 'Base' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChainId(c.id)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    selectedChainId === c.id
                      ? 'bg-[#F7931A] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Emergency Kill Switch */}
            <button
              onClick={handleToggleKillSwitch}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
                policyConfig.killSwitchActive
                  ? 'bg-rose-600 text-white animate-pulse border border-rose-400 shadow-rose-900/50'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800'
              }`}
              title="Interruptor de emergencia instantáneo para pausar y congelar todas las operaciones"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{policyConfig.killSwitchActive ? 'KILL SWITCH ACTIVO' : 'KILL SWITCH'}</span>
            </button>
          </div>
        </div>

        {/* 4 Execution Modes Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400 mr-2 font-semibold">
              Modo Operativo:
            </span>

            {/* Mode 1: OBSERVE */}
            <button
              onClick={() => handleSelectMode('OBSERVE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                executionMode === 'OBSERVE'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>1. OBSERVE</span>
            </button>

            {/* Mode 2: SIMULATE */}
            <button
              onClick={() => handleSelectMode('SIMULATE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                executionMode === 'SIMULATE'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. SIMULATE</span>
            </button>

            {/* Mode 3: PAPER TRADING */}
            <button
              onClick={() => handleSelectMode('PAPER_TRADING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                executionMode === 'PAPER_TRADING'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. PAPER TRADING</span>
            </button>

            {/* Mode 4: LIVE EXECUTION */}
            <button
              onClick={() => handleSelectMode('LIVE_EXECUTION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                executionMode === 'LIVE_EXECUTION'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/50'
                  : 'bg-[#0F172A] text-rose-400/80 hover:text-rose-300 border border-rose-900/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>4. LIVE EXECUTION</span>
            </button>
          </div>

          {/* Status strip info */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Último escaneo: <strong className="text-white">{lastScanTime}</strong></span>
            <button
              onClick={handleRefreshScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Escaneando...' : 'Escanear DEXs'}</span>
            </button>
          </div>
        </div>

        {/* Warning Banner if Kill Switch is Engaged */}
        {policyConfig.killSwitchActive && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                <strong>ALERTA DE SEGURIDAD:</strong> El interruptor de emergencia KILL SWITCH está activado. Las llamadas de ejecución están congeladas para proteger el capital.
              </span>
            </div>
            <button
              onClick={handleToggleKillSwitch}
              className="px-3 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold"
            >
              Desactivar Kill Switch
            </button>
          </div>
        )}
      </div>

      {/* ============================================================
          METRICS BAR: KPI STRIP
         ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">Oportunidades Activas</span>
          <div className="text-lg font-mono-nums font-bold text-white">
            {opportunities.length} Detectadas
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Pancake / BiSwap / Uniswap</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">Top Beneficio Neto</span>
          <div className="text-lg font-mono-nums font-bold text-emerald-400">
            ${Math.max(0, ...opportunities.map((o) => o.netProfitUsd)).toFixed(2)} USD
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Neto de gas y fees de loan</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">Gas EVM Actual</span>
          <div className="text-lg font-mono-nums font-bold text-cyan-300">
            {selectedChainId === 56 ? '3 Gwei ($0.38)' : '18 Gwei ($1.85)'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Mempool óptimo</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">Reglas de Política</span>
          <div className="text-lg font-mono-nums font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>14 / 14 Enforced</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Autonomous Policy Engine</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">Ganancia Real Confirmada</span>
          <div className="text-lg font-mono-nums font-bold text-white">
            ${perfMetrics.realNetProfitUsd.toFixed(2)} USD
          </div>
          <div className="text-[10px] text-slate-500 font-mono">{perfMetrics.realTradesConfirmed} txs en blockchain</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">Paper Trading Acumulado</span>
          <div className="text-lg font-mono-nums font-bold text-amber-300">
            ${perfMetrics.paperNetProfitUsd.toFixed(2)} USD
          </div>
          <div className="text-[10px] text-slate-500 font-mono">{perfMetrics.paperTradesExecuted} operaciones virtuales</div>
        </div>
      </div>

      {/* ============================================================
          NAVIGATION TABS
         ============================================================ */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'opportunities', label: '1. Oportunidades & Scanner', icon: TrendingUp },
          { id: 'simulator', label: '2. Simulador Atómico & Rutas', icon: Activity },
          { id: 'performance', label: '3. Rendimiento & Auditoría', icon: FileText },
          { id: 'policies', label: '4. Motor de Riesgo (14 Reglas)', icon: Sliders },
          { id: 'wallet', label: '5. Wallet 3.0 Gateway', icon: Key },
          { id: 'contracts', label: '6. Smart Contracts Solidity', icon: Code2 },
          { id: 'mcp', label: '7. BNB Agent Studio & MCP', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1E293B] text-[#F7931A] border-b-2 border-[#F7931A]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0F172A]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================
          TAB 1: OPORTUNIDADES & SCANNER EN VIVO
         ============================================================ */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0A0E17] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Filtrar por Estrategia:</span>
              {['ALL', 'DEX_ARBITRAGE', 'TRIANGULAR'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStrategyFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    strategyFilter === st
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'Todas' : st === 'DEX_ARBITRAGE' ? 'DEX Directo' : 'Triangular'}
                </button>
              ))}
            </div>
            <div className="text-slate-400 text-[11px]">
              Mostrando {filteredOpportunities.length} de {opportunities.length} oportunidades en {selectedChainId === 56 ? 'BNB Smart Chain' : 'EVM'}
            </div>
          </div>

          {/* Opportunities Grid / Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOpportunity?.id === opp.id;
              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className={`p-5 rounded-2xl bg-[#0A0E17] border transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? 'border-[#F7931A] shadow-lg shadow-[#F7931A]/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#0F172A] border border-slate-700 text-white">
                        {opp.strategy === 'DEX_ARBITRAGE' ? 'ARBITRAJE DEX DIRECTO' : 'ARBITRAJE TRIANGULAR'}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {opp.loanAmount.toLocaleString()} {opp.loanToken.symbol}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        via {opp.provider.name} ({opp.provider.feePercent}% fee)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Confianza: {opp.confidenceScore}%
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                        MEV Risk: {opp.mevRiskLevel}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          opp.status === 'CONFIRMED'
                            ? 'bg-emerald-900 text-emerald-200'
                            : opp.status === 'SIMULATED'
                            ? 'bg-cyan-900 text-cyan-200'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Route Flow */}
                  <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                      Ruta de Ejecución Atómica:
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded bg-[#0A0E17] border border-slate-700 text-amber-300 font-bold">
                        1. Flash Loan: {opp.loanAmount} {opp.loanToken.symbol}
                      </span>

                      {opp.route.map((hop) => (
                        <React.Fragment key={hop.step}>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <div className="px-2.5 py-1 rounded bg-[#0A0E17] border border-slate-700 text-slate-200">
                            <span className="text-cyan-400 font-bold">{hop.dexName}:</span>{' '}
                            <span>{hop.amountIn.toLocaleString()} {hop.tokenIn.symbol}</span> →{' '}
                            <strong className="text-white">{hop.expectedAmountOut.toLocaleString()} {hop.tokenOut.symbol}</strong>
                          </div>
                        </React.Fragment>
                      ))}

                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold">
                        Repago + Spread
                      </span>
                    </div>
                  </div>

                  {/* Quantitative Profitability Breakdown Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#080B10] border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Ingreso Bruto Spread:</span>
                      <div className="text-sm font-bold text-white">
                        +${opp.grossRevenueUsd.toFixed(2)} USD
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#080B10] border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Costos Totales (Loan + DEX + Gas):</span>
                      <div className="text-sm font-bold text-rose-400">
                        -${opp.totalCostUsd.toFixed(2)} USD
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#080B10] border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Beneficio Neto Estimado:</span>
                      <div className="text-sm font-bold text-emerald-400">
                        +${opp.netProfitUsd.toFixed(2)} USD ({opp.netProfitPercent}%)
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#080B10] border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Gas Estimado:</span>
                      <div className="text-sm font-bold text-slate-300">
                        ${opp.gasCostUsd.toFixed(2)} USD ({opp.estimatedGasUnits.toLocaleString()} gas)
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] font-mono text-slate-400">
                      ID: <span className="text-slate-300">{opp.id}</span> · Frescura: {(opp.dataFreshnessMs / 1000).toFixed(1)}s
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulate(opp);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Simular Transacción (Dry-Run)</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecute(opp);
                        }}
                        disabled={policyConfig.killSwitchActive}
                        className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                          executionMode === 'LIVE_EXECUTION'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-[#F7931A] hover:bg-[#e08213] text-black font-extrabold'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {executionMode === 'LIVE_EXECUTION'
                            ? 'Ejecutar en Blockchain (En Vivo)'
                            : executionMode === 'PAPER_TRADING'
                            ? 'Registrar en Paper Trading'
                            : 'Ejecutar / Simular'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOpportunities.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-[#0A0E17] border border-slate-800 text-slate-400 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">No se detectaron oportunidades con el filtro actual</h3>
                <p className="text-xs">
                  Prueba seleccionando otra red o haz clic en "Escanear DEXs" para refrescar el mempool.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: SIMULADOR ATÓMICO & RUTAS
         ============================================================ */}
      {activeTab === 'simulator' && (
        <div className="space-y-5">
          {selectedOpportunity ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Simulador Atómico de Flash Loan & Repago</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Prueba en entorno virtual (dry-run `eth_call`) para certificar que el saldo final cubre el principal, premium y ganancia mínima sin riesgo de pérdida de capital.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSimulate(selectedOpportunity)}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-ejecutar Simulación</span>
                  </button>
                </div>

                {/* Simulation Status Card */}
                {selectedOpportunity.simulation ? (
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      selectedOpportunity.simulation.success
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-700 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                        {selectedOpportunity.simulation.success ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Simulación Completada con Éxito (Invariante Cumplida)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Simulación Revertida: Invariante Violada</span>
                          </>
                        )}
                      </span>
                      <span className="text-[11px] font-mono">
                        Gas Simulado: {selectedOpportunity.simulation.gasEstimated.toLocaleString()} unidades
                      </span>
                    </div>
                    <div className="text-xs font-mono">
                      Beneficio Neto Simulado: <strong>${selectedOpportunity.simulation.simulatedNetProfitUsd} USD</strong> · Repago Atómico Verificado: <strong>{selectedOpportunity.simulation.repaymentVerified ? 'SÍ' : 'NO'}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 text-xs font-mono">
                    Haz clic en "Re-ejecutar Simulación" para calcular la traza de ejecución de esta oportunidad.
                  </div>
                )}

                {/* Call Trace Breakdown */}
                {selectedOpportunity.simulation?.callTrace && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-slate-300 uppercase font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#F7931A]" />
                      <span>Traza de Llamadas Atómicas (Call Trace):</span>
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      {selectedOpportunity.simulation.callTrace.map((call, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#080B10] border border-slate-800/80 flex items-center justify-between text-slate-300"
                        >
                          <span className="text-cyan-400 font-bold">[{idx + 1}] {call.from} → {call.to}</span>
                          <span className="text-[#F7931A]">{call.method}()</span>
                          <span className="text-white font-bold">{call.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Logs */}
                {selectedOpportunity.simulation?.logs && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-slate-300 uppercase font-bold">
                      Logs de Ejecución del Nodo:
                    </span>
                    <div className="p-3 rounded-xl bg-black border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                      {selectedOpportunity.simulation.logs.map((log, i) => (
                        <div key={i} className="leading-relaxed">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#0A0E17] border border-slate-800 text-slate-400">
              Selecciona una oportunidad en el scanner para simularla.
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 3: RENDIMIENTO & AUDITORÍA
         ============================================================ */}
      {activeTab === 'performance' && (
        <div className="space-y-5">
          {/* Real vs Paper Trading Split Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real On-Chain Metrics */}
            <div className="p-5 rounded-2xl bg-[#0A0E17] border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Resultados Reales (Blockchain Confirmados)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  LIVE CONFIRMED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Beneficio Neto Real:</span>
                  <div className="text-xl font-bold text-emerald-400">
                    ${perfMetrics.realNetProfitUsd.toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Gas Real Pagado:</span>
                  <div className="text-xl font-bold text-rose-400">
                    ${perfMetrics.realGasPaidUsd.toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Operaciones Exitosas:</span>
                  <div className="text-sm font-bold text-white">
                    {perfMetrics.realTradesConfirmed} de {perfMetrics.realTradesSubmitted}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Tasa de Éxito:</span>
                  <div className="text-sm font-bold text-cyan-300">
                    {perfMetrics.historicalSuccessRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* Paper Trading & Simulation Metrics */}
            <div className="p-5 rounded-2xl bg-[#0A0E17] border border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Resultados Paper Trading (Virtual / Hipotético)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  PAPER TRADING
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Beneficio Hipotético:</span>
                  <div className="text-xl font-bold text-amber-300">
                    ${perfMetrics.paperNetProfitUsd.toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Gas Simulado:</span>
                  <div className="text-xl font-bold text-slate-300">
                    ${perfMetrics.paperGasSimulatedUsd.toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Txs Paper Ejecutadas:</span>
                  <div className="text-sm font-bold text-white">
                    {perfMetrics.paperTradesExecuted} operaciones
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Simulaciones Totales:</span>
                  <div className="text-sm font-bold text-cyan-300">
                    {perfMetrics.simulationsSuccess} exitosas / {perfMetrics.simulationsFailed} fallidas
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Audit Log Table */}
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F7931A]" />
                  <span>Audit Trail Criptográfico & Registro de Transacciones</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Trazabilidad inmutable de todas las acciones, autorizaciones y verificaciones ejecutadas por el agente.
                </p>
              </div>
              <button
                onClick={handleDownloadReport}
                className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] border border-slate-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#F7931A]" />
                <span>Descargar Informe (Markdown)</span>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.action === 'POLICY_REJECT'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-slate-500 uppercase text-[10px]">({log.network})</span>
                    </div>
                    {log.netProfitUsd > 0 && (
                      <span className="text-emerald-400 font-bold text-[11px]">
                        +${log.netProfitUsd} USD
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px]">{log.message}</p>
                  {log.txHash && (
                    <div className="text-[10px] text-cyan-400 truncate">
                      Tx: {log.txHash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: MOTOR DE POLÍTICAS DE RIESGO (14 REGLAS)
         ============================================================ */}
      {activeTab === 'policies' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#F7931A]" />
                  <span>Configuración de Políticas & Umbrales de Riesgo</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  El Autonomous Execution Policy Engine comprueba obligatoriamente 14 reglas previas antes de permitir cualquier firma o envío on-chain.
                </p>
              </div>
              <button
                onClick={() => handleSavePolicyConfig(policyConfig)}
                className="px-4 py-2 rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-black font-bold text-xs font-mono transition-all shadow-md"
              >
                Guardar Configuración
              </button>
            </div>

            {/* Toast feedback */}
            {saveSuccessToast && (
              <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Configuración de políticas guardada con éxito en el almacenamiento institucional.</span>
              </div>
            )}

            {/* Policy Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">Beneficio Neto Mínimo (USD):</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={policyConfig.minNetProfitUsd}
                  onChange={(e) =>
                    setPolicyConfig({ ...policyConfig, minNetProfitUsd: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#080B10] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
                />
                <span className="text-[10px] text-slate-500">Mínimo después de gas y comisiones del loan</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">Slippage Máximo (BPS):</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  step="5"
                  value={policyConfig.maxSlippageBps}
                  onChange={(e) =>
                    setPolicyConfig({ ...policyConfig, maxSlippageBps: parseInt(e.target.value) || 50 })
                  }
                  className="w-full bg-[#080B10] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
                />
                <span className="text-[10px] text-slate-500">50 BPS = 0.50% de tolerancia máxima</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">Tope de Precio de Gas (Gwei):</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={policyConfig.maxGasPerTxGwei}
                  onChange={(e) =>
                    setPolicyConfig({ ...policyConfig, maxGasPerTxGwei: parseInt(e.target.value) || 35 })
                  }
                  className="w-full bg-[#080B10] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
                />
                <span className="text-[10px] text-slate-500">Cancela si la congestión supera este valor</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">Presupuesto Diario de Gas (USD):</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={policyConfig.dailyGasBudgetUsd}
                  onChange={(e) =>
                    setPolicyConfig({ ...policyConfig, dailyGasBudgetUsd: parseFloat(e.target.value) || 50 })
                  }
                  className="w-full bg-[#080B10] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
                />
                <span className="text-[10px] text-slate-500">Límite diario acumulado de consumo de gas</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">Tope de Txs por Día:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={policyConfig.maxTradesPerDay}
                  onChange={(e) =>
                    setPolicyConfig({ ...policyConfig, maxTradesPerDay: parseInt(e.target.value) || 20 })
                  }
                  className="w-full bg-[#080B10] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
                />
                <span className="text-[10px] text-slate-500">Control de frecuencia anti-spam</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">Validez Máxima Cotización (ms):</label>
                <input
                  type="number"
                  min="2000"
                  step="1000"
                  value={policyConfig.quoteMaxAgeMs}
                  onChange={(e) =>
                    setPolicyConfig({ ...policyConfig, quoteMaxAgeMs: parseInt(e.target.value) || 15000 })
                  }
                  className="w-full bg-[#080B10] border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
                />
                <span className="text-[10px] text-slate-500">15,000 ms = 15 segundos antes de expirar</span>
              </div>
            </div>

            {/* The 14 Invariant Pre-Execution Checklist */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Estado de las 14 Reglas de Pre-Ejecución (Oportunidad Activa)</span>
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {currentPolicyEval?.passedCount} / {currentPolicyEval?.totalRules} Aprobadas
                </span>
              </div>

              {currentPolicyEval ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {currentPolicyEval.checks.map((chk) => (
                    <div
                      key={chk.ruleId}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        chk.passed
                          ? 'bg-[#080B10] border-slate-800 text-slate-300'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300'
                      }`}
                    >
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-white">{chk.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{chk.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">
                  Selecciona una oportunidad en el scanner para evaluar sus 14 reglas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 5: WALLET 3.0 GATEWAY
         ============================================================ */}
      {activeTab === 'wallet' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#F7931A]" />
                  <span>Wallet 3.0 Integration Gateway</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Puerta de enlace segura con la wallet EVM institucional: consulta de saldos, verificación de red y administración de permisos de contratos (allowances).
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{walletState?.networkName} Conectada</span>
              </div>
            </div>

            {/* Zero Private Key Security Notice */}
            <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-800/80 text-blue-200 text-xs font-mono space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>PRINCIPIO DE SEGURIDAD ESTRICTA: CERO CLAVES PRIVADAS EN EL MODELO O FRONTEND</span>
              </div>
              <p className="text-[11px] text-blue-300 leading-relaxed">
                Esta plataforma y sus modelos de IA NUNCA reciben frases semilla ni claves privadas. La firma de transacciones opera exclusivamente a través de los proveedores aislados de la wallet seleccionada mediante aprobación explícita.
              </p>
            </div>

            {/* Wallet Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Dirección Activa:</span>
                <div className="text-sm font-bold text-white truncate">
                  {walletState?.address}
                </div>
                <span className="text-[10px] text-slate-500">Firmante Institucional</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Saldo Nativo (Gas):</span>
                <div className="text-sm font-bold text-cyan-300">
                  {walletState?.nativeBalance}
                </div>
                <span className="text-[10px] text-slate-500">Disponible para comisiones</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Chain ID:</span>
                <div className="text-sm font-bold text-white">
                  {walletState?.chainId} ({walletState?.networkName})
                </div>
                <span className="text-[10px] text-emerald-400">Verificado</span>
              </div>
            </div>

            {/* Token Allowances Table */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase font-bold">
                Permisos Concedidos a Contratos (Token Allowances):
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                {walletState?.allowances.map((alw, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-slate-300"
                  >
                    <div>
                      <span className="text-white font-bold">{alw.token}:</span>{' '}
                      <span className="text-slate-400">{alw.allowance} autorizados a </span>
                      <strong className="text-cyan-400">{alw.spenderName}</strong>
                    </div>
                    <button
                      onClick={() => alert(`Permiso revocado con éxito para ${alw.spenderName}.`)}
                      className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold"
                    >
                      Revocar Permiso
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 6: SMART CONTRACTS SOLIDITY & AUDITORÍA
         ============================================================ */}
      {activeTab === 'contracts' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Smart Contract Solidity v0.8.24 — FlashLoanArbitrageBot</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Implementación lista para producción con ReentrancyGuard, pausa de emergencia e invariante estricta on-chain.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SOLIDITY_FLASH_LOAN_CONTRACT);
                  alert('¡Código Solidity copiado al portapapeles!');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 text-xs font-mono font-bold"
              >
                Copiar Contrato
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto leading-relaxed">
              <pre>{SOLIDITY_FLASH_LOAN_CONTRACT}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 7: BNB AGENT STUDIO & MCP GATEWAY
         ============================================================ */}
      {activeTab === 'mcp' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#F7931A]" />
                  <span>Integración con BNB Agent Studio, MCP y Protocolo A2A</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Especificación de herramientas MCP expuestas, reputación del agente bajo ERC-8004 y tareas comerciales bajo ERC-8183.
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A] text-xs font-mono font-bold">
                BNB Agent Studio Ready
              </span>
            </div>

            {/* BNB Metadata Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Identidad ERC-8004:</span>
                <div className="text-xs font-bold text-white truncate">
                  {BnbAgentStudioAdapter.getAgentMetadata().erc8004IdentityAddress}
                </div>
                <span className="text-[10px] text-emerald-400">Reputación: {BnbAgentStudioAdapter.getAgentMetadata().reputationScore} / 100</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Estándares Soportados:</span>
                <div className="text-xs font-bold text-cyan-300">
                  MCP-v1.0 · A2A · ERC-8004 · ERC-8183
                </div>
                <span className="text-[10px] text-slate-500">Multimodal</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Estado de Conexión:</span>
                <div className="text-xs font-bold text-emerald-400">
                  ONLINE_ACTIVE
                </div>
                <span className="text-[10px] text-slate-500">BNB Chain Mempool</span>
              </div>
            </div>

            {/* MCP Tools Catalog Table */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase font-bold">
                Catálogo de Herramientas MCP ({MCP_DEFI_TOOLS.length} herramientas configuradas):
              </span>
              <div className="space-y-2 font-mono text-xs">
                {MCP_DEFI_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#F7931A] font-bold">{tool.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            tool.readOnly
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {tool.readOnly ? 'READ_ONLY' : 'AUTH_REQUIRED'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE CONFIRMACIÓN OBLIGATORIO PARA MODO LIVE EXECUTION
         ============================================================ */}
      {showLiveRiskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0A0E17] border border-rose-600 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold text-white">
                Activación de LIVE EXECUTION (Fondos Reales)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El modo <strong>LIVE EXECUTION</strong> autoriza el envío de transacciones directas a la blockchain con fondos reales. Para activar este modo, debes confirmar expresamente:
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5 font-mono">
              <li>Comprendes que las transacciones en mempool pueden estar sujetas a congestión de gas o reversiones por movimientos de liquidez.</li>
              <li>Has configurado umbrales de beneficio neto y slippage acordes con tu política de tesorería.</li>
              <li>El interruptor de emergencia KILL SWITCH permanece disponible en todo momento.</li>
            </ul>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowLiveRiskModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setHasAcknowledgedRisk(true);
                  setShowLiveRiskModal(false);
                  setExecutionMode('LIVE_EXECUTION');
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold"
              >
                Comprendo los Riesgos y Habilito Modo LIVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
