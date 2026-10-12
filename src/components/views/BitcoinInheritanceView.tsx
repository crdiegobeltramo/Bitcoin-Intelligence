import React, { useState, useMemo } from 'react';
import {
  InheritancePlan,
  InheritanceModality,
  Beneficiary,
  UTXOEntry,
  TimelockType,
  BitcoinNetwork,
} from '../../services/inheritance/types';
import {
  InheritancePlanStore,
  INITIAL_INHERITANCE_PLANS,
} from '../../services/inheritance/inheritancePlanStore';
import {
  buildMiniscriptPolicy,
  computeDescriptorChecksum,
} from '../../services/inheritance/miniscriptEngine';
import {
  createDefaultTimelockConfig,
  estimateBlockHeightFromDate,
  CURRENT_ESTIMATED_BLOCK_HEIGHT,
} from '../../services/inheritance/timelockCalculator';
import { auditInheritancePlan } from '../../services/inheritance/inheritanceAuditor';
import { buildInheritancePsbt } from '../../services/inheritance/psbtService';
import { BITCOIN_WALLETS_COMPATIBILITY } from '../../services/inheritance/walletCompatibility';
import { BITCOIN_COVENANTS_MATRIX } from '../../services/inheritance/covenantsKnowledge';
import { generateInheritanceDocumentation } from '../../services/inheritance/documentationGenerator';
import { generateRegtestCommands } from '../../services/inheritance/regtestLabService';
import {
  Shield,
  ShieldAlert,
  Clock,
  Key,
  KeyRound,
  FileText,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Send,
  Users,
  Wallet,
  Cpu,
  Layers,
  Zap,
  Calendar,
  Lock,
  Download,
  AlertCircle,
  HardDrive,
  Eye,
  ExternalLink,
  Info
} from 'lucide-react';

interface BitcoinInheritanceViewProps {
  onNavigate?: (section: any) => void;
}

type TabType =
  | 'dashboard'
  | 'builder'
  | 'miniscript'
  | 'timelock'
  | 'scheduled'
  | 'beneficiaries'
  | 'wallets'
  | 'psbt'
  | 'auditor'
  | 'monitor'
  | 'broadcaster'
  | 'recovery'
  | 'docs'
  | 'regtest'
  | 'covenants';

export const BitcoinInheritanceView: React.FC<BitcoinInheritanceViewProps> = ({ onNavigate }) => {
  const [plans, setPlans] = useState<InheritancePlan[]>(() => InheritancePlanStore.getPlans());
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan-modality-a-family');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Plan
  const activePlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0] || INITIAL_INHERITANCE_PLANS[0];
  }, [plans, selectedPlanId]);

  // Security Audit Report
  const auditReport = useMemo(() => {
    return auditInheritancePlan(activePlan);
  }, [activePlan]);

  // PSBT calculation
  const psbtInspection = useMemo(() => {
    return buildInheritancePsbt({
      network: activePlan.network,
      inputs: activePlan.utxos,
      beneficiaryAddress: activePlan.beneficiaries[0]?.pubkeyOrXpub ? 'bc1q9heir' + activePlan.beneficiaries[0].pubkeyOrXpub.substring(0, 30) : 'bc1q9heiraddressxxxxxxxx',
      beneficiaryAmountSat: activePlan.totalSatoshis - 1500,
      changeAddress: activePlan.emergencySweepAddress || 'bc1qownerchangecoldwalletsxxxxxxxx',
      feeRateSatVb: activePlan.feeRateSatVb,
      nLockTime: activePlan.timelock.nLockTimeValue,
      nSequence: activePlan.timelock.nSequenceValue,
    });
  }, [activePlan]);

  // Generated Legal & Technical Documentation
  const documentationMarkdown = useMemo(() => {
    return generateInheritanceDocumentation(activePlan);
  }, [activePlan]);

  // Regtest Commands
  const regtestSteps = useMemo(() => {
    return generateRegtestCommands(activePlan);
  }, [activePlan]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Copiado al portapapeles: ${label}`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Heartbeat pulse simulation
  const handleHeartbeatPulse = () => {
    const updated = InheritancePlanStore.recordHeartbeat(activePlan.id);
    if (updated) {
      setPlans(InheritancePlanStore.getPlans());
      showToast('¡Heartbeat registrado! El contador de inactividad se ha reiniciado en la blockchain.');
    }
  };

  // Emergency Revocation
  const handleEmergencySweep = () => {
    const confirmed = window.confirm(
      '¿Está seguro de iniciar el PROTOCOLO DE REVOCACIÓN DE EMERGENCIA? Los fondos se marcarán para barrido inmediato hacia su cold storage y el PSBT sucesorio quedará revocado.'
    );
    if (confirmed) {
      const updated = InheritancePlanStore.triggerEmergencyRevocation(activePlan.id);
      if (updated) {
        setPlans(InheritancePlanStore.getPlans());
        showToast('PLAN REVOCADO: Fondos asignados a la dirección de barrido de emergencia.');
      }
    }
  };

  // Update Modality via Plan Builder
  const handleSelectModality = (modality: InheritanceModality) => {
    const defaultTimelock = createDefaultTimelockConfig(modality);
    const updatedPolicy = buildMiniscriptPolicy({
      modality,
      ownerPubkey: activePlan.ownerPubkey,
      heirPubkeys: activePlan.beneficiaries.map((b) => b.pubkeyOrXpub),
      timelockBlocksOrTimestamp: modality === 'MODALITY_C_INACTIVITY' ? 25920 : defaultTimelock.nLockTimeValue,
      timelockType: modality === 'MODALITY_C_INACTIVITY' ? 'CSV_OLDER' : 'CLTV_AFTER',
    });

    const updatedPlan: InheritancePlan = {
      ...activePlan,
      modality,
      timelock: defaultTimelock,
      policy: updatedPolicy,
      isRevoked: false,
    };

    InheritancePlanStore.updatePlan(updatedPlan);
    setPlans(InheritancePlanStore.getPlans());
    showToast(`Modalidad actualizada a: ${modality}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#0F172A] border border-[#F7931A] text-white shadow-2xl text-xs font-mono">
          <Zap className="w-4 h-4 text-[#F7931A] shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#111C33] to-[#0A0F1D] border border-[#1E293B] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7931A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A] text-xs font-mono font-bold tracking-wider uppercase">
                <KeyRound className="w-3.5 h-3.5" />
                Bitcoin Inheritance & Timelock Planner
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                <CheckCircle2 className="w-3 h-3" />
                Non-Custodial & Miniscript
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Red: <strong className="text-white uppercase">{activePlan.network}</strong>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white mt-2 tracking-tight">
              Planificación Sucesoria & Transferencias Temporizadas de Bitcoin
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Diseñe, valide criptográficamente y documente planes de herencia soberanos utilizando{' '}
              <span className="text-[#F7931A] font-semibold">Miniscript, Taproot, PSBT y Timelocks (CLTV/CSV)</span>.
              Autocustodia estricta sin intermediarios ni exposición de claves privadas.
            </p>
          </div>

          {/* Quick Plan Switcher & Status Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Plan Activo:
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="bg-[#0A0E17] border border-slate-700 hover:border-[#F7931A] text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-[#F7931A] transition-colors"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title.length > 35 ? p.title.substring(0, 35) + '...' : p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Heartbeat pulse button */}
            {activePlan.modality === 'MODALITY_C_INACTIVITY' && (
              <button
                onClick={handleHeartbeatPulse}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all shadow-md self-end sm:self-auto"
                title="Emitir transacción de refresco (Heartbeat) para reiniciar el contador de inactividad"
              >
                <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                Pulsar Heartbeat (Vida)
              </button>
            )}

            {/* Emergency Panic Revocation */}
            <button
              onClick={handleEmergencySweep}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all shadow-md self-end sm:self-auto ${
                activePlan.isRevoked
                  ? 'bg-rose-950 border-rose-600 text-rose-300 opacity-60 cursor-not-allowed'
                  : 'bg-rose-900/30 hover:bg-rose-900/50 border-rose-700/50 text-rose-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              {activePlan.isRevoked ? 'Plan Revocado' : 'Revocar Plan (Pánico)'}
            </button>
          </div>
        </div>

        {/* Plan KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-[#1E293B]">
          <div className="p-2.5 rounded-xl bg-[#090E1A]/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Fondos Protegidos</span>
            <div className="text-base font-bold text-[#F7931A] font-mono mt-0.5">
              {(activePlan.totalSatoshis / 100000000).toFixed(4)} BTC
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {activePlan.totalSatoshis.toLocaleString()} sats
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090E1A]/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Modalidad</span>
            <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">
              {activePlan.modality === 'MODALITY_A_TIMELOCK'
                ? 'Mod. A — Timelock'
                : activePlan.modality === 'MODALITY_B_SCHEDULED'
                ? 'Mod. B — Programada'
                : 'Mod. C — Inactividad'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {activePlan.modality === 'MODALITY_C_INACTIVITY' ? 'CSV (older)' : 'CLTV (after)'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090E1A]/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Condición Temporal</span>
            <div className="text-xs font-bold text-sky-400 font-mono mt-0.5 truncate">
              {activePlan.timelock.relativePeriodDays} días
            </div>
            <span className="text-[10px] text-slate-500 font-mono truncate block">
              ~{activePlan.timelock.relativeBlocksCount.toLocaleString()} bloques
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090E1A]/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Score Seguridad</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-base font-bold font-mono ${
                  auditReport.score >= 80
                    ? 'text-emerald-400'
                    : auditReport.score >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {auditReport.score}/100
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                {auditReport.status}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {auditReport.passedRulesCount}/{auditReport.totalRulesEvaluated} reglas
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090E1A]/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Estado PSBT</span>
            <div className="text-xs font-bold font-mono mt-0.5 text-amber-400 truncate">
              {activePlan.psbtStatus}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {activePlan.isRevoked ? 'Revocado' : 'Válido bloqueado'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090E1A]/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Beneficiarios</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {activePlan.beneficiaries.length} Heredero(s)
            </div>
            <span className="text-[10px] text-slate-500 font-mono truncate block">
              {activePlan.beneficiaries[0]?.alias || 'Sin asignar'}
            </span>
          </div>
        </div>
      </div>

      {/* 14 Sections Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#1E293B] scrollbar-thin">
        {[
          { id: 'dashboard', label: '1. Dashboard', icon: Activity },
          { id: 'builder', label: '2. Plan Builder', icon: Layers },
          { id: 'miniscript', label: '3. Miniscript Policy', icon: Terminal },
          { id: 'timelock', label: '4. Timelock Engine', icon: Clock },
          { id: 'scheduled', label: '5. Transferencias', icon: Calendar },
          { id: 'beneficiaries', label: '6. Beneficiarios', icon: Users },
          { id: 'wallets', label: '7. Wallets & Descriptores', icon: Wallet },
          { id: 'psbt', label: '8. PSBT & Tx Builder', icon: Cpu },
          { id: 'auditor', label: '9. Security Auditor', icon: ShieldAlert },
          { id: 'monitor', label: '10. Monitor de Estado', icon: Eye },
          { id: 'broadcaster', label: '11. Broadcaster', icon: Send },
          { id: 'recovery', label: '12. Recuperación & Pánico', icon: RefreshCw },
          { id: 'docs', label: '13. Testamento Digital', icon: FileText },
          { id: 'regtest', label: '14. Regtest & Testnet Lab', icon: HardDrive },
          { id: 'covenants', label: 'Covenants & BIPs', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#F7931A] text-black font-bold shadow-md shadow-[#F7931A]/20'
                  : 'bg-[#0B0F19] text-slate-400 hover:text-white hover:bg-[#131B2E] border border-transparent hover:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Spending Path Topology */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-[#0D1322] border border-[#1E293B]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#F7931A]" />
                  <h3 className="text-sm font-bold text-white font-mono">
                    ARQUITECTURA DE GASTO CRIPTOGRÁFICO (SPENDING TOPOLOGY)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Miniscript P2WSH / Taproot
                </span>
              </div>

              <div className="space-y-4 mt-4">
                {activePlan.policy.spendingPaths.map((path, idx) => (
                  <div
                    key={path.id}
                    className={`p-4 rounded-xl border transition-all ${
                      path.type === 'PRIMARY_OWNER'
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : path.type === 'BENEFICIARY_TIMELOCK'
                        ? 'bg-amber-950/20 border-amber-800/40'
                        : 'bg-indigo-950/20 border-indigo-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              path.type === 'PRIMARY_OWNER'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : path.type === 'BENEFICIARY_TIMELOCK'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-indigo-500/20 text-indigo-400'
                            }`}
                          >
                            Ruta {idx + 1}: {path.type}
                          </span>
                          <h4 className="text-sm font-bold text-white">{path.name}</h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {path.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">Condición:</span>
                        <span className="text-xs font-mono font-bold text-[#F7931A]">
                          {path.timelockCondition || 'Inmediata (Sin retardo)'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-wrap gap-2">
                      <span>Miniscript: <code className="text-slate-200">{path.miniscriptSnippet}</code></span>
                      <span>Firmantes requeridos: <strong className="text-white">{path.quorumRequired}</strong></span>
                      <span>Peso: ~{path.vbytesEstimate} vB</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notice regarding self-custody and no-death verification */}
              <div className="mt-4 p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <p>
                  <strong>Invariante de Autocustodia:</strong> En Bitcoin, el timelock evalúa únicamente el avance de bloques o timestamps de consenso. La inactividad representa una condición técnica de recuperación programada y <strong>no una confirmación jurídica de fallecimiento</strong>.
                </p>
              </div>
            </div>

            {/* Plan Health & Quick Actions */}
            <div className="space-y-6">
              {/* Health Card */}
              <div className="p-5 rounded-xl bg-[#0D1322] border border-[#1E293B]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white font-mono">ESTADO DE SALUD DEL PLAN</h3>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Auditoría Criptográfica:</span>
                    <span className="text-emerald-400 font-mono font-bold">{auditReport.score}/100 ÓPTIMO</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Descriptor BIP 380:</span>
                    <span className="text-emerald-400 font-mono">Con Checksum Válido</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">UTXO Confirmado:</span>
                    <span className="text-white font-mono">
                      {activePlan.utxos[0]?.confirmations || 0} confirmaciones
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">RBF (BIP 125):</span>
                    <span className="text-emerald-400 font-mono">Activado (Fee-bumping permitido)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Último Heartbeat:</span>
                    <span className="text-slate-300 font-mono">
                      {activePlan.lastHeartbeatDate ? new Date(activePlan.lastHeartbeatDate).toLocaleDateString() : 'Pendiente'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('docs')}
                    className="w-full py-2 px-3 rounded-lg bg-[#F7931A]/10 hover:bg-[#F7931A]/20 border border-[#F7931A]/30 text-[#F7931A] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generar Testamento Criptográfico
                  </button>
                  <button
                    onClick={() => setActiveTab('psbt')}
                    className="w-full py-2 px-3 rounded-lg bg-[#141E33] hover:bg-[#1A2845] border border-slate-700 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Inspeccionar Transacción PSBT
                  </button>
                </div>
              </div>

              {/* Hardware Wallet Compatibility Quick Reference */}
              <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                <span className="text-xs font-bold text-white font-mono block mb-2">
                  HARDWARE WALLETS VALIDAS
                </span>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Coldcard Mk4 / Q (Air-Gapped)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Blockstream Jade (QR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Keystone 3 Pro (MicroSD/QR)</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Metamask / Phantom: INCOMPATIBLES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: INHERITANCE PLAN BUILDER (3 MODALITIES) */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              SELECCIÓN DE MODALIDAD DEL PLAN SUCESORIO
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Elija una de las 3 modalidades canónicas de herencia en Bitcoin. Cada modalidad configura una arquitectura de script diferente con distintas garantías de revocabilidad y recuperación.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Modalidad A */}
              <div
                onClick={() => handleSelectModality('MODALITY_A_TIMELOCK')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  activePlan.modality === 'MODALITY_A_TIMELOCK'
                    ? 'bg-[#F7931A]/10 border-[#F7931A] shadow-lg shadow-[#F7931A]/10'
                    : 'bg-[#090E1A] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F7931A]/20 text-[#F7931A]">
                    MODALIDAD A
                  </span>
                  {activePlan.modality === 'MODALITY_A_TIMELOCK' && (
                    <CheckCircle2 className="w-4 h-4 text-[#F7931A]" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-3">Herencia con Timelock</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  El titular conserva una vía de acceso instantánea e incondicional. El beneficiario dispone de una vía alternativa condicionada por un timelock absoluto o relativo.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div>• Vía titular: <strong>pk(owner)</strong> inmediata</div>
                  <div>• Vía sucesor: <strong>older(N)</strong> o <strong>after(T)</strong></div>
                  <div>• Revocable en cualquier momento</div>
                </div>
              </div>

              {/* Modalidad B */}
              <div
                onClick={() => handleSelectModality('MODALITY_B_SCHEDULED')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  activePlan.modality === 'MODALITY_B_SCHEDULED'
                    ? 'bg-[#F7931A]/10 border-[#F7931A] shadow-lg shadow-[#F7931A]/10'
                    : 'bg-[#090E1A] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400">
                    MODALIDAD B
                  </span>
                  {activePlan.modality === 'MODALITY_B_SCHEDULED' && (
                    <CheckCircle2 className="w-4 h-4 text-[#F7931A]" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-3">Transferencia Programada</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Transacción prefirmada para una fecha determinada en el futuro (nLockTime). No se transmite automáticamente; requiere un operador o daemon que la inyecte cuando MTP sea elegible.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div>• nLockTime fijado en timestamp/bloque</div>
                  <div>• PSBT completamente firmado y resguardado</div>
                  <div>• Revocable gastando el UTXO original</div>
                </div>
              </div>

              {/* Modalidad C */}
              <div
                onClick={() => handleSelectModality('MODALITY_C_INACTIVITY')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  activePlan.modality === 'MODALITY_C_INACTIVITY'
                    ? 'bg-[#F7931A]/10 border-[#F7931A] shadow-lg shadow-[#F7931A]/10'
                    : 'bg-[#090E1A] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400">
                    MODALIDAD C
                  </span>
                  {activePlan.modality === 'MODALITY_C_INACTIVITY' && (
                    <CheckCircle2 className="w-4 h-4 text-[#F7931A]" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-3">Recuperación por Inactividad</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Basado en timelocks relativos (OP_CHECKSEQUENCEVERIFY / older). Si el titular no realiza transacciones en N meses, se habilita el heredero. Un movimiento (Heartbeat) reinicia el contador.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div>• Contador relativo en bloques (144/día)</div>
                  <div>• Cascada de herederos (Primario y Albacea)</div>
                  <div>• Heartbeat restablece el contador a cero</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MINISCRIPT POLICY BUILDER */}
      {activeTab === 'miniscript' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">CONSTRUCTOR VISUAL DE MINISCRIPT & DESCRIPTORES</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Políticas formales compiladas y verificadas para P2WSH (Native SegWit) y Taproot (P2TR).
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                BIP 380 Compliant
              </span>
            </div>

            <div className="space-y-5 mt-5">
              {/* Output Descriptor Box */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
                  <span>Descriptor Canónico WSH (con Checksum):</span>
                  <button
                    onClick={() => copyToClipboard(activePlan.policy.descriptorWsh, 'Descriptor WSH')}
                    className="text-[#F7931A] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </button>
                </div>
                <div className="p-3.5 rounded-lg bg-[#080C16] border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all">
                  {activePlan.policy.descriptorWsh}
                </div>
              </div>

              {/* Miniscript Expression */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
                  <span>Expresión Miniscript:</span>
                  <button
                    onClick={() => copyToClipboard(activePlan.policy.miniscriptExpression, 'Miniscript')}
                    className="text-[#F7931A] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[#080C16] border border-slate-800 font-mono text-xs text-amber-300 break-all">
                  {activePlan.policy.miniscriptExpression}
                </div>
              </div>

              {/* Script Opcodes Pipeline */}
              <div>
                <span className="text-xs text-slate-400 font-mono block mb-2">
                  Desglose de Opcodes en Pila de Script:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activePlan.policy.scriptOpcodes.map((op, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        op.startsWith('OP_')
                          ? 'bg-blue-950 border border-blue-700 text-blue-300'
                          : 'bg-slate-900 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: TIMELOCK CONFIGURATION & MTP */}
      {activeTab === 'timelock' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              CONFIGURACIÓN DE BLOQUEOS TEMPORALES & REGLAS DE CONSENSO
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Bitcoin implementa timelocks a través de <strong>BIP 65 (CLTV)</strong> para marcas absolutas y <strong>BIP 112 (CSV) / BIP 68 (nSequence)</strong> para retardos relativos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F7931A]" />
                  PARÁMETROS DEL TIMELOCK
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block mb-1">Tipo de Timelock:</span>
                    <span className="text-white font-bold">{activePlan.timelock.timelockType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Fecha Objetivo Estimada:</span>
                    <span className="text-[#F7931A] font-bold">{new Date(activePlan.timelock.targetDateUtc).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Altura de Bloque Estimada:</span>
                    <span className="text-sky-400 font-bold">#{activePlan.timelock.targetBlockHeight.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Valor nLockTime en Cabecera:</span>
                    <span className="text-white font-bold">{activePlan.timelock.nLockTimeValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Valor nSequence (BIP 68):</span>
                    <span className="text-white font-bold">0x{activePlan.timelock.nSequenceValue.toString(16).padStart(8, '0')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  REGLA DE CONSENSO MTP (MEDIAN TIME PAST)
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Para prevenir que los mineros manipulen los relojes locales de sus bloques, Bitcoin evalúa el nLockTime contra el <strong>Median Time Past (MTP)</strong> de los 11 bloques anteriores.
                </p>

                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                  {activePlan.timelock.clockAccuracyWarning}
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-1">
                  <div>• Altura actual de la red: <strong>~{CURRENT_ESTIMATED_BLOCK_HEIGHT.toLocaleString()}</strong></div>
                  <div>• Cadencia promedio: <strong>~144 bloques por día</strong> (10 min/bloque)</div>
                  <div>• Granularidad BIP 68 flag bit 22: <strong>512 segundos por unidad</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: SCHEDULED TRANSFER PLANNER */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              PLANIFICADOR DE TRANSFERENCIAS PROGRAMADAS & PREFIRMADAS
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Diseño y ciclo de vida de transferencias desde UTXOs de custodia hacia beneficiarios en fechas futuras.
            </p>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                <span className="text-xs font-mono text-slate-400 block mb-2">
                  ESTADOS DEL CICLO DE VIDA DE LA TRANSACCIÓN:
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">1. Diseñada:</span>
                    <span className="text-white font-bold">Parámetros fijados</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">2. Prefirmada:</span>
                    <span className="text-emerald-400 font-bold">Firma titular ok</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
                    <span className="text-amber-400 block text-[10px]">3. Bloqueada:</span>
                    <span className="text-amber-300 font-bold">Esperando Timelock</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">4. Transmitida:</span>
                    <span className="text-slate-400 font-bold">Inyectada a red</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: BENEFICIARY MANAGER */}
      {activeTab === 'beneficiaries' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">GESTIÓN DE BENEFICIARIOS & CLAVES SUCESORIAS</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Registre las claves públicas secp256k1 y cuotas asignadas para cada heredero legítimo.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {activePlan.beneficiaries.map((ben, idx) => (
                <div key={ben.id} className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#F7931A]" />
                        <h3 className="text-sm font-bold text-white font-mono">
                          {ben.alias} ({ben.relation})
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ben.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-mono text-slate-400 space-y-1">
                        <div>Clave Pública / Xpub: <code className="text-slate-200">{ben.pubkeyOrXpub}</code></div>
                        <div>Método de Entrega: <strong className="text-white">{ben.deliveryMethod}</strong></div>
                        <div>Contacto / Email: <span className="text-slate-300">{ben.emailOrContact || 'No especificado'}</span></div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 font-mono block">Cuota Sucesoria:</span>
                      <span className="text-lg font-bold text-[#F7931A] font-mono">{ben.sharePercentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: WALLETS & DESCRIPTORS COMPATIBILITY */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              MATRIZ DE COMPATIBILIDAD DE WALLETS & DESCRIPTORES
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Para garantizar que los herederos puedan ejecutar el plan sin depender de intermediarios, solo se admiten billeteras de Bitcoin nativas con soporte formal de <strong>BIP 174 (PSBT)</strong> y <strong>BIP 380 (Output Descriptors)</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {BITCOIN_WALLETS_COMPATIBILITY.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-4 rounded-xl border ${
                    wallet.isCompatible
                      ? 'bg-[#090E1A] border-slate-800'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white font-mono">{wallet.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        wallet.isCompatible
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {wallet.isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {wallet.warningNote}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Miniscript: {wallet.supportsMiniscript ? '✅ Soportado' : '❌ No'}</span>
                    <span>PSBT: {wallet.supportsPSBT ? '✅ Soportado' : '❌ No'}</span>
                    <span>Taproot: {wallet.supportsTaproot ? '✅ Soportado' : '❌ No'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: PSBT & TRANSACTION BUILDER */}
      {activeTab === 'psbt' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  INSPECTOR Y CONSTRUCTOR DE TRANSACCIONES PSBT (BIP 174)
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Desglose exacto de entradas UTXO, salidas de gasto, comisiones de minería y retardo temporal.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                {psbtInspection.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Inputs */}
              <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                <span className="text-xs font-mono text-slate-400 block mb-2">ENTRADAS UTXO (INPUTS):</span>
                {psbtInspection.inputs.map((inp, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-white truncate">txid: {inp.txid}</div>
                    <div className="text-slate-400">vout: {inp.vout} | Valor: {(inp.valueSat / 100000000).toFixed(4)} BTC</div>
                    <div className="text-sky-400">nSequence: {inp.sequenceHex} (RBF: {inp.isRbfEnabled ? 'SÍ' : 'NO'})</div>
                  </div>
                ))}
              </div>

              {/* Outputs */}
              <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                <span className="text-xs font-mono text-slate-400 block mb-2">SALIDAS (OUTPUTS):</span>
                <div className="space-y-2">
                  {psbtInspection.outputs.map((out, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{out.purpose}</span>
                        <span className="text-white">{out.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-slate-300 truncate">{out.address}</div>
                      <div className="text-[#F7931A] font-bold">{(out.valueSat / 100000000).toFixed(4)} BTC ({out.valueSat.toLocaleString()} sats)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fees and Timelock */}
            <div className="mt-6 p-4 rounded-xl bg-[#080C16] border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Comisión Minera:</span>
                <span className="text-white font-bold">{psbtInspection.feeSat.toLocaleString()} sats</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tasa de Comisión:</span>
                <span className="text-white font-bold">{psbtInspection.feeRateSatVb} sat/vB</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tamaño Virtual:</span>
                <span className="text-white font-bold">~{psbtInspection.estimatedVbytes} vB</span>
              </div>
              <div>
                <span className="text-slate-500 block">Condición nLockTime:</span>
                <span className="text-amber-400 font-bold">{psbtInspection.locktimeFormatted}</span>
              </div>
            </div>

            {/* Base64 PSBT Payload */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
                <span>Payload Base64 de PSBT (Para importar en Sparrow o Coldcard):</span>
                <button
                  onClick={() => copyToClipboard(psbtInspection.base64Psbt, 'PSBT Base64')}
                  className="text-[#F7931A] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar PSBT
                </button>
              </div>
              <div className="p-3 rounded-lg bg-[#080C16] border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                {psbtInspection.base64Psbt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: INHERITANCE SECURITY AUDITOR */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  MOTOR DE AUDITORÍA CRIPTOGRÁFICA & TEORÍA DE JUEGOS
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Evaluación automatizada de 12 reglas de seguridad para prevenir pérdidas irreversibles de fondos.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-400">{auditReport.score}/100</span>
                <span className="text-[10px] text-slate-400 block font-mono">ÍNDICE DE ROBUSTEZ</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {auditReport.findings.map((finding) => (
                <div
                  key={finding.id}
                  className={`p-4 rounded-xl border transition-all ${
                    finding.passed
                      ? 'bg-emerald-950/10 border-emerald-800/30'
                      : finding.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-800/40'
                      : 'bg-amber-950/20 border-amber-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            finding.passed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {finding.ruleCode}
                        </span>
                        <h4 className="text-sm font-bold text-white">{finding.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {finding.description}
                      </p>
                      <div className="text-[11px] text-[#F7931A] font-mono mt-2">
                        💡 Recomendación: {finding.recommendation}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {finding.passed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          SUPERADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-mono font-bold">
                          <AlertTriangle className="w-4 h-4" />
                          {finding.severity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: PLAN MONITOR */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  MONITOR DE UTXO & VIGENCIA EN MEMPOOL
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Supervisión continua en tiempo real de los UTXOs asociados al plan sucesorio.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                UTXOs Intactos
              </span>
            </div>

            <div className="space-y-4 mt-6">
              {activePlan.utxos.map((utxo, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#090E1A] border border-slate-800 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/60">
                    <span>Outpoint: {utxo.txid.substring(0, 24)}...:{utxo.vout}</span>
                    <span className="text-emerald-400 font-bold">ESTADO: INTACTO & CONFIRMADO</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Monto:</span>
                      <span className="text-[#F7931A] font-bold">{(utxo.amountSat / 100000000).toFixed(4)} BTC</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Confirmaciones:</span>
                      <span className="text-white font-bold">{utxo.confirmations.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Bloque:</span>
                      <span className="text-white font-bold">#{utxo.blockHeight}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Tipo de Script:</span>
                      <span className="text-white font-bold">{utxo.scriptType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: TRANSACTION BROADCASTER */}
      {activeTab === 'broadcaster' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              CONFIGURACIÓN DEL TRANSMISOR (BROADCASTER DAEMON)
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Una transacción con timelock requiere un operador responsable que la inyecte a la mempool cuando MTP alcance el valor programado.
            </p>

            <div className="p-4 rounded-xl bg-[#090E1A] border border-slate-800 mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">Tipo de Operador:</span>
                  <span className="text-white font-bold">{activePlan.broadcaster.operatorType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Mempool API Endpoint:</span>
                  <span className="text-sky-400 font-bold">{activePlan.broadcaster.mempoolApiEndpoint}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Reemplazo por Tarifa (RBF):</span>
                  <span className="text-emerald-400 font-bold">{activePlan.broadcaster.rbfEnabled ? 'ACTIVADO' : 'DESACTIVADO'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Tarifa Máxima Permitida:</span>
                  <span className="text-white font-bold">{activePlan.broadcaster.maxFeeSatVb} sat/vB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: RECOVERY AND EMERGENCY PROCEDURES */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              PROCEDIMIENTOS DE RECUPERACIÓN & PROTOCOLO DE PÁNICO
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Mecanismos de contingencia para que el titular revoque el plan o para que los herederos rescaten fondos ante imprevistos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Titular Panic Button */}
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-base font-bold font-mono">BARRIDO DE PÁNICO DEL TITULAR</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Si sospecha que una de las claves de los herederos ha sido comprometida o desea anular el plan de forma irrevocable, transmita una transacción gastando el UTXO hacia su dirección fría externa.
                </p>
                <div className="text-xs font-mono text-slate-400">
                  Dirección configurada: <code className="text-rose-300 break-all">{activePlan.emergencySweepAddress}</code>
                </div>
                <button
                  onClick={handleEmergencySweep}
                  className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-colors"
                >
                  Ejecutar Barrido Inmediato
                </button>
              </div>

              {/* Heir Recovery Protocol */}
              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Key className="w-5 h-5" />
                  <h3 className="text-base font-bold font-mono">KIT DE RECUPERACIÓN DEL HEREDERO</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pasos a seguir por el sucesor una vez cumplido el plazo de inactividad o la fecha del timelock:
                </p>
                <ol className="text-xs text-slate-300 font-mono space-y-2 list-decimal list-inside">
                  <li>Importar el descriptor oficial en Sparrow Wallet.</li>
                  <li>Conectar la hardware wallet del heredero.</li>
                  <li>Generar transacción de retiro hacia una nueva dirección propia.</li>
                  <li>Firmar y propagar a la red Bitcoin.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 13: INHERITANCE DOCUMENTATION GENERATOR */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  GENERADOR DE TESTAMENTO DIGITAL & CARTA DE INSTRUCCIONES
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Documento técnico y legal imprimible para el beneficiario y escribano público (sin claves privadas).
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(documentationMarkdown, 'Protocolo Sucesorio')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7931A] hover:bg-[#F7931A]/90 text-black text-xs font-mono font-bold transition-all shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Todo el Documento
              </button>
            </div>

            <div className="mt-5 p-5 rounded-xl bg-[#080C16] border border-slate-800 max-h-[600px] overflow-y-auto">
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-all">
                {documentationMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 14: TESTNET & REGTEST LAB */}
      {activeTab === 'regtest' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <h2 className="text-lg font-bold text-white font-mono mb-2">
              LABORATORIO DE SIMULACIÓN EN REGTEST / TESTNET
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Comandos de <code>bitcoin-cli</code> para verificar la ejecución de timelocks sin esperar meses en la red principal.
            </p>

            <div className="space-y-4 mt-6">
              {regtestSteps.map((step) => (
                <div key={step.stepNumber} className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F7931A] font-mono">
                      PASO {step.stepNumber}: {step.title}
                    </span>
                    <button
                      onClick={() => copyToClipboard(step.command, `Paso ${step.stepNumber}`)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      Copiar Comando
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{step.description}</p>
                  <div className="mt-3 p-2.5 rounded bg-black/60 border border-slate-900 font-mono text-xs text-emerald-400 break-all select-all">
                    $ {step.command}
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-500">
                    Resultado esperado: <span className="text-slate-400">{step.expectedResult}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 15: BITCOIN COVENANTS MATRIX */}
      {activeTab === 'covenants' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0D1322] border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  EVALUACIÓN DE BITCOIN COVENANTS & PROPUESTAS FUTURAS
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Análisis comparativo de propuestas de covenants. Ningún covenant está activo en Bitcoin Mainnet.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold">
                Mainnet Gating Active
              </span>
            </div>

            <div className="space-y-4 mt-6">
              {BITCOIN_COVENANTS_MATRIX.map((cov, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#090E1A] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white font-mono">
                      {cov.proposalName} ({cov.bipNumber})
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {cov.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{cov.mechanism}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-xs font-mono">
                    <div className="text-amber-300">⚠️ Riesgo en Mainnet: {cov.mainnetRisk}</div>
                    <div className="text-emerald-400">🛡️ Alternativa estándar hoy: {cov.alternativeCompatibleDesign}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
