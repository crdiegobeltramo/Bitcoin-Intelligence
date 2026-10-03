import React, { useState, useEffect } from 'react';
import {
  getSubscriptionTiers,
  PAYMENT_METHODS,
  SubscriptionBillingEngine,
} from '../../services/billing/subscriptionPlans';
import {
  AdminSettingsService,
  ADMIN_AUTHORIZED_EMAIL,
  DEFAULT_TIER_SCOPES_CONFIG,
} from '../../services/admin/adminSettingsService';
import {
  SubscriptionTier,
  BillingCycle,
  PaymentMethodId,
  PaymentDetails,
  PaymentReceipt,
  SubscriptionPlanId,
  AuthUser,
  NavigationSection,
  AdminTierScopesConfig,
} from '../../types';
import {
  Zap,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Download,
  ArrowRight,
  Sliders,
  Save,
  Lock,
  Unlock,
  RotateCcw,
  ShieldAlert,
  DollarSign,
} from 'lucide-react';

interface SubscriptionsViewProps {
  activePlanId: SubscriptionPlanId;
  onUpgradePlan: (planId: SubscriptionPlanId) => void;
  btcSpotUsd?: number;
  usdArsRate?: number;
  currentUser?: AuthUser | null;
  onNavigate?: (section: NavigationSection) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  activePlanId,
  onUpgradePlan,
  btcSpotUsd = 96420,
  usdArsRate = 1230,
  currentUser = null,
  onNavigate,
}) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>(() => getSubscriptionTiers());
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('pro');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('lightning');
  const [payerEmail, setPayerEmail] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'VERIFYING' | 'SUCCESS'>('DETAILS');
  const [latestReceipt, setLatestReceipt] = useState<PaymentReceipt | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Admin Pricing Edit State
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() =>
    AdminSettingsService.isAuthorized(currentUser)
  );
  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string>('');
  const [scopesDraft, setScopesDraft] = useState<AdminTierScopesConfig>(() =>
    AdminSettingsService.getTierScopesConfig()
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsAdminAuthorized(AdminSettingsService.isAuthorized(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const syncTiers = () => {
      setTiers(getSubscriptionTiers());
      setScopesDraft(AdminSettingsService.getTierScopesConfig());
    };
    window.addEventListener('subscription-tiers-updated', syncTiers);
    return () => window.removeEventListener('subscription-tiers-updated', syncTiers);
  }, []);

  const selectedPlan = tiers.find((t) => t.id === selectedPlanId) || tiers[1];
  const isAnnual = billingCycle === 'annual';
  const currentPriceUsd = isAnnual ? selectedPlan.annualPriceUsd : selectedPlan.monthlyPriceUsd;

  const paymentDetails: PaymentDetails = SubscriptionBillingEngine.calculatePaymentDetails(
    currentPriceUsd,
    selectedMethod,
    btcSpotUsd,
    usdArsRate
  );

  const handleOpenCheckout = (plan: SubscriptionTier) => {
    setSelectedPlanId(plan.id);
    setPaymentStep('DETAILS');
    setIsCheckoutOpen(true);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(paymentDetails.recipientAddress || paymentDetails.qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleConfirmPayment = () => {
    setPaymentStep('VERIFYING');
    setTimeout(() => {
      const receipt = SubscriptionBillingEngine.generateReceipt(
        selectedPlan,
        billingCycle,
        selectedMethod,
        paymentDetails,
        payerEmail
      );
      setLatestReceipt(receipt);
      SubscriptionBillingEngine.saveActiveSubscription(selectedPlan.id, receipt.expiresAt);
      onUpgradePlan(selectedPlan.id);
      setPaymentStep('SUCCESS');
    }, 1800);
  };

  const downloadReceiptJson = () => {
    if (!latestReceipt) return;
    const blob = new Blob([JSON.stringify(latestReceipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo_${latestReceipt.receiptId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (AdminSettingsService.unlockSession(passkeyInput)) {
      setIsAdminAuthorized(true);
      setShowUnlockPrompt(false);
      setIsEditingPrices(true);
      setPasskeyInput('');
      setUnlockError('');
    } else {
      setUnlockError('Clave maestra o CUIT inválido. Verifica tus credenciales de administrador.');
    }
  };

  const handleSaveAdminPrices = () => {
    AdminSettingsService.saveTierScopesConfig(scopesDraft);
    setTiers(getSubscriptionTiers());
    setIsEditingPrices(false);
    setSaveSuccessMsg('Montos de suscripción actualizados correctamente en todos los planes y pasarelas.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleRestoreDefaultPrices = () => {
    const restored: AdminTierScopesConfig = {
      ...scopesDraft,
      free: {
        ...scopesDraft.free,
        name: DEFAULT_TIER_SCOPES_CONFIG.free.name,
        monthlyPriceUsd: DEFAULT_TIER_SCOPES_CONFIG.free.monthlyPriceUsd,
        annualPriceUsd: DEFAULT_TIER_SCOPES_CONFIG.free.annualPriceUsd,
      },
      pro: {
        ...scopesDraft.pro,
        name: DEFAULT_TIER_SCOPES_CONFIG.pro.name,
        monthlyPriceUsd: DEFAULT_TIER_SCOPES_CONFIG.pro.monthlyPriceUsd,
        annualPriceUsd: DEFAULT_TIER_SCOPES_CONFIG.pro.annualPriceUsd,
      },
      institutional: {
        ...scopesDraft.institutional,
        name: DEFAULT_TIER_SCOPES_CONFIG.institutional.name,
        monthlyPriceUsd: DEFAULT_TIER_SCOPES_CONFIG.institutional.monthlyPriceUsd,
        annualPriceUsd: DEFAULT_TIER_SCOPES_CONFIG.institutional.annualPriceUsd,
      },
    };
    setScopesDraft(restored);
    AdminSettingsService.saveTierScopesConfig(restored);
    setTiers(getSubscriptionTiers());
    setSaveSuccessMsg('Montos restaurados a los valores originales.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notification for Admin Price Updates */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#0F172A] border border-slate-800 text-[#F7931A]">
          <Zap className="w-3.5 h-3.5" />
          <span>PLANES DE SUSCRIPCIÓN & CHECKOUT MULTIMONEDA</span>
        </div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
          Elige el Nivel de Inteligencia & Desarrollo
        </h1>
        <p className="text-sm text-slate-400">
          Paga de forma soberana en Bitcoin on-chain, satoshis en Lightning Network, Solana, Bitcoin Cash, Ethereum o moneda local con Mercado Pago.
        </p>

        {/* Billing Cycle Toggle & Admin Price Editor Trigger */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <div className="inline-flex items-center p-1 rounded-lg bg-[#0F172A] border border-slate-800 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-[#F7931A] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                2 Meses Gratis
              </span>
            </button>
          </div>

          {isAdminAuthorized ? (
            <button
              onClick={() => setIsEditingPrices(!isEditingPrices)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                isEditingPrices
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                  : 'bg-[#0F172A] hover:bg-[#1E293B] text-purple-300 border-purple-800/80'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditingPrices ? 'Cerrar Editor de Montos' : 'Editar Montos de Planes (Admin)'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowUnlockPrompt(!showUnlockPrompt)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-[#0A0E17] hover:bg-[#0F172A] text-slate-400 hover:text-amber-300 border border-slate-800 transition-colors"
              title="Exclusivo para el administrador con permisos"
            >
              <Lock className="w-3.5 h-3.5 text-[#F7931A]" />
              <span>Admin: Configurar Tarifas</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Admin Passkey Unlock Box (if admin isn't unlocked yet) */}
      {!isAdminAuthorized && showUnlockPrompt && (
        <form
          onSubmit={handleUnlockAdmin}
          className="max-w-xl mx-auto p-5 rounded-2xl bg-[#0A0E17] border border-rose-900/60 space-y-3 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F7931A]">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>AUTORIZACIÓN DE ADMINISTRADOR ({ADMIN_AUTHORIZED_EMAIL})</span>
            </div>
            <button
              type="button"
              onClick={() => setShowUnlockPrompt(false)}
              className="text-xs text-slate-500 hover:text-white font-mono"
            >
              Cerrar
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Ingresa tu clave maestra administrativa o CUIT titular para habilitar la edición directa de los montos a pagar de cada plan de suscripción.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Clave maestra o CUIT (ej. 30-71829401-9)"
              className="flex-1 bg-[#080B10] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F7931A]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Desbloquear Edición</span>
            </button>
          </div>
          {unlockError && <p className="text-xs text-rose-400 font-mono">{unlockError}</p>}
        </form>
      )}

      {/* Admin Pricing Control Panel (Visible when Authorized Admin enables Edit Mode) */}
      {isAdminAuthorized && isEditingPrices && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#131B2E] to-[#1A132B] border border-purple-600/60 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px] font-bold uppercase">
                  PERMISOS DE ADMINISTRADOR ACTIVOS
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Operador: <strong className="text-white">{ADMIN_AUTHORIZED_EMAIL}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Editor de Montos a Pagar por Plan de Suscripción
              </h2>
              <p className="text-xs text-slate-300">
                Modifica el precio mensual y anual (en USD) de cualquiera de los 3 planes. El checkout multimoneda recalculará automáticamente los importes en BTC, Lightning (SATS), SOL, BCH, ETH y ARS.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRestoreDefaultPrices}
                className="px-3 py-2 rounded-xl bg-[#080B10] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurar Originales</span>
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="px-3 py-2 rounded-xl bg-[#080B10] hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono transition-colors"
                >
                  Panel Admin Completo
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveAdminPrices}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Montos</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Explorer Plan Pricing Editor */}
            <div className="p-4 rounded-xl bg-[#080B10] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  1. Plan Explorer
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setScopesDraft({
                      ...scopesDraft,
                      free: {
                        ...scopesDraft.free,
                        annualPriceUsd: Math.round(scopesDraft.free.monthlyPriceUsd * 10),
                      },
                    })
                  }
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                >
                  Anual = 10x Mensual
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Monto Mensual (USD):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesDraft.free.monthlyPriceUsd}
                      onChange={(e) =>
                        setScopesDraft({
                          ...scopesDraft,
                          free: {
                            ...scopesDraft.free,
                            monthlyPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-7 pr-2.5 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Monto Anual (USD):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesDraft.free.annualPriceUsd}
                      onChange={(e) =>
                        setScopesDraft({
                          ...scopesDraft,
                          free: {
                            ...scopesDraft.free,
                            annualPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-7 pr-2.5 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-900">
                <span>ARS Mensual: ${(scopesDraft.free.monthlyPriceUsd * usdArsRate).toLocaleString('es-AR')}</span>
                <span>{Math.round((scopesDraft.free.monthlyPriceUsd / btcSpotUsd) * 1e8).toLocaleString()} SATS</span>
              </div>
            </div>

            {/* Pro Plan Pricing Editor */}
            <div className="p-4 rounded-xl bg-[#080B10] border border-[#F7931A]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#F7931A] uppercase">
                  2. Plan Pro Terminal
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setScopesDraft({
                      ...scopesDraft,
                      pro: {
                        ...scopesDraft.pro,
                        annualPriceUsd: Math.round(scopesDraft.pro.monthlyPriceUsd * 10),
                      },
                    })
                  }
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                >
                  Anual = 10x Mensual
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Monto Mensual (USD):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-[#F7931A] absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesDraft.pro.monthlyPriceUsd}
                      onChange={(e) =>
                        setScopesDraft({
                          ...scopesDraft,
                          pro: {
                            ...scopesDraft.pro,
                            monthlyPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#F7931A]/60 rounded-lg pl-7 pr-2.5 py-1.5 text-sm font-bold text-[#F7931A] font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Monto Anual (USD):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-[#F7931A] absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesDraft.pro.annualPriceUsd}
                      onChange={(e) =>
                        setScopesDraft({
                          ...scopesDraft,
                          pro: {
                            ...scopesDraft.pro,
                            annualPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#F7931A]/60 rounded-lg pl-7 pr-2.5 py-1.5 text-sm font-bold text-[#F7931A] font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-900">
                <span>ARS Mensual: ${(scopesDraft.pro.monthlyPriceUsd * usdArsRate).toLocaleString('es-AR')}</span>
                <span>{Math.round((scopesDraft.pro.monthlyPriceUsd / btcSpotUsd) * 1e8).toLocaleString()} SATS</span>
              </div>
            </div>

            {/* Institutional Plan Pricing Editor */}
            <div className="p-4 rounded-xl bg-[#080B10] border border-purple-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                  3. Plan Institutional
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setScopesDraft({
                      ...scopesDraft,
                      institutional: {
                        ...scopesDraft.institutional,
                        annualPriceUsd: Math.round(scopesDraft.institutional.monthlyPriceUsd * 10),
                      },
                    })
                  }
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                >
                  Anual = 10x Mensual
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Monto Mensual (USD):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesDraft.institutional.monthlyPriceUsd}
                      onChange={(e) =>
                        setScopesDraft({
                          ...scopesDraft,
                          institutional: {
                            ...scopesDraft.institutional,
                            monthlyPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-purple-700/60 rounded-lg pl-7 pr-2.5 py-1.5 text-sm font-bold text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    Monto Anual (USD):
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesDraft.institutional.annualPriceUsd}
                      onChange={(e) =>
                        setScopesDraft({
                          ...scopesDraft,
                          institutional: {
                            ...scopesDraft.institutional,
                            annualPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-purple-700/60 rounded-lg pl-7 pr-2.5 py-1.5 text-sm font-bold text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-900">
                <span>ARS Mensual: ${(scopesDraft.institutional.monthlyPriceUsd * usdArsRate).toLocaleString('es-AR')}</span>
                <span>{Math.round((scopesDraft.institutional.monthlyPriceUsd / btcSpotUsd) * 1e8).toLocaleString()} SATS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tier Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {tiers.map((tier) => {
          const isCurrentActive = activePlanId === tier.id;
          const price = isAnnual ? tier.annualPriceUsd : tier.monthlyPriceUsd;

          return (
            <div
              key={tier.id}
              className={`p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all border relative ${
                tier.isPopular
                  ? 'bg-[#0B101D] border-[#F7931A] shadow-xl'
                  : 'bg-[#0A0E17] border-[#1E293B]'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F7931A] text-white tracking-wider">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{tier.name}</h2>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{tier.description}</p>
                </div>

                <div className="border-b border-slate-800/80 pb-4">
                  <div className="flex items-baseline gap-1 font-mono-nums">
                    <span className="text-3xl font-extrabold text-white">
                      ${price === 0 ? '0' : price.toLocaleString('en-US')}
                    </span>
                    <span className="text-xs text-slate-500">
                      USD / {isAnnual ? 'año' : 'mes'}
                    </span>
                  </div>
                  {price > 0 && (
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                      <span>~${Math.round(price * usdArsRate).toLocaleString('es-AR')} ARS</span>
                      <span>·</span>
                      <span className="text-[#F7931A]">
                        {Math.round((price / btcSpotUsd) * 1e8).toLocaleString()} SATS
                      </span>
                    </div>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-900 mt-6">
                {isCurrentActive ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold"
                  >
                    PLAN ACTIVO ACTUALMENTE
                  </button>
                ) : tier.id === 'free' && price === 0 ? (
                  <button
                    onClick={() => onUpgradePlan('free')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Continuar en Free
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(tier)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                      tier.isPopular
                        ? 'bg-[#F7931A] hover:bg-[#e08213] text-white'
                        : 'bg-[#1E293B] hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>Seleccionar {tier.name.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Currency Payment Gateway Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-2xl bg-[#0A0E17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-[#0C1322] border-b border-[#1E293B] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#F7931A]">CHECKOUT MULTIMONEDA SEGURO</span>
                <h2 className="text-base font-bold text-white">
                  Suscripción a {selectedPlan.name} ({isAnnual ? 'Anual' : 'Mensual'})
                </h2>
              </div>
              <div className="text-right font-mono-nums">
                <div className="text-lg font-bold text-white">${currentPriceUsd} USD</div>
                <div className="text-[10px] text-slate-400">Total a pagar</div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {paymentStep === 'DETAILS' && (
                <>
                  {/* Select Payment Method Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      1. Elige tu Método de Pago Preferido:
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#1E293B] border-[#F7931A] shadow-md'
                                : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-mono font-bold text-white">{method.symbol}</span>
                              <span className="text-[10px] font-mono text-slate-400">{method.badge}</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-200 truncate">{method.name}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{method.speed}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Details Container */}
                  <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[11px] text-slate-400">Importe exacto a transferir:</span>
                        <div className="text-xl font-mono-nums font-extrabold text-[#F7931A]">
                          {paymentDetails.amountInCurrency.toLocaleString()}{' '}
                          <span className="text-sm font-semibold">{paymentDetails.currencyCode}</span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        Red: <strong className="text-slate-200">{paymentDetails.networkName}</strong>
                      </div>
                    </div>

                    {/* QR Code and Address Box */}
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Stylized QR Code Frame */}
                      <div className="p-3 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                          <QrCode className="w-20 h-20 text-[#F7931A]" />
                          <span className="text-[9px] font-mono text-white mt-1 uppercase font-bold">
                            {paymentDetails.currencyCode} QR
                          </span>
                        </div>
                      </div>

                      {/* Recipient Address / Invoice and Copy Button */}
                      <div className="space-y-2 flex-1 w-full text-xs">
                        <label className="text-slate-400 font-medium">
                          {selectedMethod === 'lightning'
                            ? 'Factura Lightning BOLT11:'
                            : selectedMethod === 'mercadopago'
                            ? 'Alias / CVU Mercado Pago:'
                            : 'Dirección de Recepción:'}
                        </label>
                        <div className="flex items-center gap-1.5 bg-[#080B10] p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 break-all">
                          <span className="truncate flex-1">{paymentDetails.recipientAddress}</span>
                          <button
                            onClick={handleCopyPayload}
                            className="p-1.5 hover:bg-slate-800 rounded text-[#F7931A] transition-colors shrink-0"
                            title="Copiar"
                          >
                            {copiedPayload ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {paymentDetails.instructions}
                        </p>
                      </div>
                    </div>

                    {/* User Email input for receipt */}
                    <div className="space-y-1 text-xs pt-2 border-t border-slate-800/80">
                      <label className="text-slate-300">Email para envío de Comprobante / Factura electrónica:</label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="tu-email@empresa.com"
                        className="w-full bg-[#080B10] border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#F7931A]"
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentStep === 'VERIFYING' && (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 border-3 border-[#F7931A] border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-base font-bold text-white">
                    Verificando Transacción en {paymentDetails.networkName}...
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Escuchando evento de confirmación en la mempool / red de pagos. Validando prueba criptográfica y firma de liquidación.
                  </p>
                </div>
              )}

              {paymentStep === 'SUCCESS' && latestReceipt && (
                <div className="p-6 rounded-xl bg-[#0F172A] border border-emerald-800/80 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">¡Suscripción Activada con Éxito!</h3>
                      <p className="text-xs text-slate-400">
                        El plan <strong className="text-emerald-300">{latestReceipt.planName}</strong> ha quedado habilitado de forma inmediata en tu cuenta.
                      </p>
                    </div>
                  </div>

                  {/* Receipt Details Box */}
                  <div className="p-4 rounded-lg bg-[#080B10] border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>N° Comprobante:</span>
                      <span className="text-white font-bold">{latestReceipt.receiptId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Monto Abonado:</span>
                      <span className="text-emerald-400 font-bold">
                        {latestReceipt.currencyAmount} {latestReceipt.currency} (${latestReceipt.amountUsd} USD)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Método de Pago:</span>
                      <span className="text-white uppercase">{latestReceipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Vigencia hasta:</span>
                      <span className="text-white">{new Date(latestReceipt.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Hash / Preimagen:</span>
                      <span className="text-slate-300 truncate max-w-[280px]">
                        {latestReceipt.transactionHashOrProof}
                      </span>
                    </div>
                    {latestReceipt.fiscalInvoiceId && (
                      <div className="flex justify-between text-cyan-400 pt-1 border-t border-slate-900">
                        <span>Factura Electrónica ARCA:</span>
                        <span className="font-bold">{latestReceipt.fiscalInvoiceId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#0C1322] border-t border-[#1E293B] flex items-center justify-between">
              {paymentStep === 'DETAILS' ? (
                <>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-white transition-colors flex items-center gap-1.5 shadow"
                  >
                    <span>Confirmar Pago & Activar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : paymentStep === 'SUCCESS' ? (
                <>
                  <button
                    onClick={downloadReceiptJson}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Comprobante (.json)</span>
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Comenzar a Usar {selectedPlan.name}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
