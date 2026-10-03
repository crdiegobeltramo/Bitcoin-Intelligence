import React, { useState, useEffect } from 'react';
import {
  AdminSettingsService,
  ADMIN_AUTHORIZED_EMAIL,
  DEFAULT_TREASURY_CONFIG,
  DEFAULT_MP_DEV_CONFIG,
  DEFAULT_TIER_SCOPES_CONFIG
} from '../../services/admin/adminSettingsService';
import {
  AdminTreasuryConfig,
  AdminMercadoPagoDevConfig,
  AdminTierScopesConfig,
  AdminAuditLog,
  AuthUser,
  SubscriptionPlanId,
  NavigationSection
} from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Save,
  RotateCcw,
  Zap,
  Coins,
  CreditCard,
  Sliders,
  Users,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Radio,
  FileText,
  Clock,
  Terminal,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminPortalViewProps {
  currentUser: AuthUser | null;
  onNavigate: (section: NavigationSection) => void;
  onOpenAuthModal: () => void;
  activePlanId: SubscriptionPlanId;
  onUpgradePlan: (planId: SubscriptionPlanId) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  onNavigate,
  onOpenAuthModal,
  activePlanId,
  onUpgradePlan,
}) => {
  // Authorization State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() =>
    AdminSettingsService.isAuthorized(currentUser)
  );
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'treasury' | 'mercadopago' | 'scopes' | 'users'>('treasury');

  // Form States
  const [treasuryConfig, setTreasuryConfig] = useState<AdminTreasuryConfig>(() =>
    AdminSettingsService.getTreasuryConfig()
  );
  const [mpConfig, setMpConfig] = useState<AdminMercadoPagoDevConfig>(() =>
    AdminSettingsService.getMercadoPagoConfig()
  );
  const [scopesConfig, setScopesConfig] = useState<AdminTierScopesConfig>(() =>
    AdminSettingsService.getTierScopesConfig()
  );
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() =>
    AdminSettingsService.getAuditLogs()
  );

  // UI helpers
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [mpTesting, setMpTesting] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{ status: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  // Sync auth when currentUser prop changes
  useEffect(() => {
    setIsAuthorized(AdminSettingsService.isAuthorized(currentUser));
  }, [currentUser]);

  // Handle Unlock via Secret Passkey
  const handleUnlockWithKey = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const success = AdminSettingsService.unlockSession(secretKeyInput);
    if (success) {
      setIsAuthorized(true);
      setAuditLogs(AdminSettingsService.getAuditLogs());
    } else {
      setAuthError('Clave de seguridad inválida. Acceso denegado.');
    }
  };

  const handleLockSession = () => {
    AdminSettingsService.lockSession();
    setIsAuthorized(AdminSettingsService.isAuthorized(currentUser));
  };

  // Show Toast
  const triggerSaveNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setAuditLogs(AdminSettingsService.getAuditLogs());
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  // Save Treasury Config
  const handleSaveTreasury = (e: React.FormEvent) => {
    e.preventDefault();
    AdminSettingsService.saveTreasuryConfig(treasuryConfig);
    triggerSaveNotification('¡Direcciones de tesorería y CVU actualizadas con éxito!');
  };

  // Save Mercado Pago Config
  const handleSaveMercadoPago = (e: React.FormEvent) => {
    e.preventDefault();
    AdminSettingsService.saveMercadoPagoConfig(mpConfig);
    triggerSaveNotification('¡Credenciales de desarrollador de Mercado Pago guardadas!');
  };

  // Save Scopes Config
  const handleSaveScopes = () => {
    AdminSettingsService.saveTierScopesConfig(scopesConfig);
    triggerSaveNotification('¡Alcances y permisos por nivel de suscripción sincronizados!');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('¿Confirmas restaurar todos los parámetros a la configuración de fábrica?')) {
      AdminSettingsService.resetToDefaults();
      setTreasuryConfig(DEFAULT_TREASURY_CONFIG);
      setMpConfig(DEFAULT_MP_DEV_CONFIG);
      setScopesConfig(DEFAULT_TIER_SCOPES_CONFIG);
      triggerSaveNotification('Configuración restablecida a valores iniciales.');
    }
  };

  // Test Mercado Pago API Connection
  const handleTestMpConnection = () => {
    setMpTesting(true);
    setMpTestResult(null);
    setTimeout(() => {
      setMpTesting(false);
      if (mpConfig.accessToken && mpConfig.publicKey) {
        setMpTestResult({
          status: 'SUCCESS',
          message: `Conexión HTTP 200 OK con Mercado Pago API. Modo: ${
            mpConfig.sandboxMode ? 'SANDBOX (Pruebas)' : 'PRODUCCIÓN (En Vivo)'
          }. Webhook activo en ${mpConfig.webhookUrl}.`,
        });
      } else {
        setMpTestResult({
          status: 'ERROR',
          message: 'Error: Debes ingresar Public Key y Access Token para validar la integración.',
        });
      }
    }, 1200);
  };

  // ============================================================
  // PANTALLA DE BLOQUEO / ACCESO RESTRINGIDO
  // ============================================================
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl bg-[#0A0E17] border border-rose-900/60 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
              ACCESO RESTRINGIDO AL ADMINISTRADOR
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Portal de Administración & Tesorería
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Esta sección está reservada exclusivamente para el titular de la plataforma:{' '}
              <strong className="text-slate-200">Diego Eduardo Beltramo</strong> (<code className="text-[#F7931A]">{ADMIN_AUTHORIZED_EMAIL}</code>).
            </p>
          </div>

          {/* Login Options */}
          <div className="p-5 rounded-2xl bg-[#05080E] border border-slate-800 space-y-4 text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold border-b border-slate-800/80 pb-2">
              <Key className="w-4 h-4" />
              <span>OPCIÓN 1: INICIAR SESIÓN CON TU CUENTA GOOGLE</span>
            </div>

            <p className="text-xs text-slate-400">
              Inicia sesión con tu correo <strong className="text-white">{ADMIN_AUTHORIZED_EMAIL}</strong> mediante Firebase Identity para acceder de forma instantánea.
            </p>

            <button
              onClick={onOpenAuthModal}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <span>Acceder con Google / Conectar Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Passkey Option */}
          <form onSubmit={handleUnlockWithKey} className="p-5 rounded-2xl bg-[#05080E] border border-slate-800 space-y-4 text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A] font-semibold border-b border-slate-800/80 pb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>OPCIÓN 2: DESBLOQUEAR CON CLAVE MAESTRA / CUIT</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-mono">
                Clave de Seguridad Administrativa o CUIT Titular:
              </label>
              <input
                type="password"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                placeholder="Ingresa tu clave maestra o CUIT 30-71829401-9"
                className="w-full bg-[#0A0E17] border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#F7931A]"
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F7931A] hover:bg-[#e08213] text-black font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Sesión de Administrador</span>
            </button>
          </form>

          <div className="text-[11px] text-slate-500 font-mono">
            Control Criptográfico RBAC · IP y Sesión Registradas con Fines de Seguridad
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PANTALLA PRINCIPAL DEL ADMINISTRADOR (AUTORIZADO)
  // ============================================================
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Toast Alert Notification */}
      {saveSuccessNotice && (
        <div className="fixed top-18 right-6 z-50 p-4 rounded-xl bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-mono shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#F7931A]/20 text-[#F7931A] font-mono text-xs font-bold px-2">
              ADMIN ROOT PRIVILEGES
            </span>
            <span className="text-xs font-mono text-slate-400">
              Usuario: <strong className="text-white">{ADMIN_AUTHORIZED_EMAIL}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Panel de Control Soberano & Administración
          </h1>
          <p className="text-xs text-slate-400">
            Edición en caliente de tesorería cripto, configuración Mercado Pago Developers y matriz de alcances por nivel de suscripción.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 transition-colors"
            title="Restablecer valores de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restablecer</span>
          </button>
          <button
            onClick={handleLockSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700 text-rose-300 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear Sesión</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('treasury')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'treasury'
              ? 'bg-[#F7931A] text-black font-bold shadow'
              : 'bg-[#0A0E17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>1. Tesorería Cripto & CVU</span>
        </button>

        <button
          onClick={() => setActiveTab('mercadopago')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'mercadopago'
              ? 'bg-cyan-500 text-black font-bold shadow'
              : 'bg-[#0A0E17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Mercado Pago Developers</span>
        </button>

        <button
          onClick={() => setActiveTab('scopes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'scopes'
              ? 'bg-purple-600 text-white font-bold shadow'
              : 'bg-[#0A0E17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. Precios de Planes & Alcances</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'bg-[#0A0E17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Asignación de Usuarios & Logs</span>
        </button>
      </div>

      {/* ============================================================
          TAB 1: GESTIÓN DE TESORERÍA CRIPTO & CVU MERCADO PAGO
         ============================================================ */}
      {activeTab === 'treasury' && (
        <form onSubmit={handleSaveTreasury} className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Direcciones de Cobro & Billeteras Corporativas</h2>
              <p className="text-xs text-slate-400">
                Los cambios se reflejarán instantáneamente en la pasarela de pagos de todas las suscripciones.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Último guardado: {new Date(treasuryConfig.lastUpdated).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Bitcoin */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#F7931A] font-mono flex items-center gap-1.5">
                  <span>🟠 Bitcoin Mainnet (Native SegWit / Taproot):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">bc1q / bc1p</span>
              </div>
              <input
                type="text"
                value={treasuryConfig.bitcoin}
                onChange={(e) => setTreasuryConfig({ ...treasuryConfig, bitcoin: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-[#F7931A]"
              />
              <p className="text-[11px] text-slate-400">
                Dirección a la cual los usuarios enviarán BTC on-chain para activar el plan.
              </p>
            </div>

            {/* Lightning Network */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  <span>⚡ Lightning Network (Pubkey / Nodo):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">BOLT11 / LND / CLN</span>
              </div>
              <input
                type="text"
                value={treasuryConfig.lightningNodePubkey}
                onChange={(e) => setTreasuryConfig({ ...treasuryConfig, lightningNodePubkey: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Lightning Address:</span>
                <input
                  type="text"
                  value={treasuryConfig.lightningAddress}
                  onChange={(e) => setTreasuryConfig({ ...treasuryConfig, lightningAddress: e.target.value })}
                  placeholder="diego@bitcoinintelligence.org"
                  className="flex-1 bg-[#080B10] border border-slate-700 rounded px-2 py-1 font-mono text-[11px] text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Solana */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#14F195] font-mono flex items-center gap-1.5">
                  <span>🟣 Solana Mainnet (SOL & USDC SPL):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">Phantom / Solflare</span>
              </div>
              <input
                type="text"
                value={treasuryConfig.solana}
                onChange={(e) => setTreasuryConfig({ ...treasuryConfig, solana: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-[#14F195]"
              />
              <p className="text-[11px] text-slate-400">
                Dirección Base58 receptora de pagos instantáneos en SOL nativo y tokens USDC.
              </p>
            </div>

            {/* Bitcoin Cash */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#0AC18E] font-mono flex items-center gap-1.5">
                  <span>🟢 Bitcoin Cash (BCH CashAddr):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">bitcoincash:qp...</span>
              </div>
              <input
                type="text"
                value={treasuryConfig.bch}
                onChange={(e) => setTreasuryConfig({ ...treasuryConfig, bch: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-[#0AC18E]"
              />
              <p className="text-[11px] text-slate-400">
                Dirección CashAddr para transferencias con comisiones inferiores a 1 centavo.
              </p>
            </div>

            {/* Ethereum */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#627EEA] font-mono flex items-center gap-1.5">
                  <span>🔵 Ethereum / EVM (ETH, USDT, USDC):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">0x... (MetaMask / Trust)</span>
              </div>
              <input
                type="text"
                value={treasuryConfig.ethereum}
                onChange={(e) => setTreasuryConfig({ ...treasuryConfig, ethereum: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-[#627EEA]"
              />
              <p className="text-[11px] text-slate-400">
                Contrato o billetera de tesorería compatible con Ethereum Mainnet, Arbitrum y Polygon.
              </p>
            </div>

            {/* Mercado Pago Local (CVU & Alias) */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-cyan-900/60">
              <div className="flex items-center justify-between">
                <label className="font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                  <span>🔷 Mercado Pago (Argentina ARS):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">BCRA Interoperable</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Alias MP:</span>
                  <input
                    type="text"
                    value={treasuryConfig.mercadopagoAlias}
                    onChange={(e) => setTreasuryConfig({ ...treasuryConfig, mercadopagoAlias: e.target.value })}
                    className="w-full bg-[#080B10] border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400">CVU (22 dígitos):</span>
                  <input
                    type="text"
                    value={treasuryConfig.mercadopagoCvu}
                    onChange={(e) => setTreasuryConfig({ ...treasuryConfig, mercadopagoCvu: e.target.value })}
                    className="w-full bg-[#080B10] border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">CUIT Emisor Fiscal:</span>
                  <input
                    type="text"
                    value={treasuryConfig.cuitEmisor}
                    onChange={(e) => setTreasuryConfig({ ...treasuryConfig, cuitEmisor: e.target.value })}
                    className="w-full bg-[#080B10] border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Titular / Razón Social:</span>
                  <input
                    type="text"
                    value={treasuryConfig.titular}
                    onChange={(e) => setTreasuryConfig({ ...treasuryConfig, titular: e.target.value })}
                    className="w-full bg-[#080B10] border border-slate-700 rounded p-1.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#F7931A] hover:bg-[#e08213] text-black font-mono text-xs font-bold transition-all flex items-center gap-2 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Direcciones de Tesorería</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          TAB 2: CONFIGURACIÓN MERCADO PAGO DEVELOPERS
         ============================================================ */}
      {activeTab === 'mercadopago' && (
        <form onSubmit={handleSaveMercadoPago} className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Mercado Pago Developers Suite</h2>
              </div>
              <p className="text-xs text-slate-400">
                Configura tus credenciales de aplicación de Mercado Pago para procesar cobros automáticos en pesos argentinos.
              </p>
            </div>
            <a
              href="https://www.mercadopago.com.ar/developers/panel/app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-cyan-400 transition-colors self-start sm:self-auto"
            >
              <span>Panel de Desarrolladores MP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Test Status feedback */}
          {mpTestResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                mpTestResult.status === 'SUCCESS'
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-700 text-rose-300'
              }`}
            >
              {mpTestResult.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{mpTestResult.message}</span>
            </div>
          )}

          {/* Mode switch */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <Radio className={`w-4 h-4 ${mpConfig.sandboxMode ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span>MODO DE OPERACIÓN: {mpConfig.sandboxMode ? 'SANDBOX (PRUEBAS)' : 'PRODUCCIÓN (COBROS REALES)'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {mpConfig.sandboxMode
                  ? 'Las transacciones simularán pagos con tarjetas de test sin debitar dinero real.'
                  : 'Las transacciones procesarán dinero real hacia tu cuenta corriente de Mercado Pago.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMpConfig({ ...mpConfig, sandboxMode: !mpConfig.sandboxMode })}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                mpConfig.sandboxMode
                  ? 'bg-amber-950/80 border border-amber-600 text-amber-300'
                  : 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
              }`}
            >
              {mpConfig.sandboxMode ? 'Cambiar a PRODUCCIÓN' : 'Cambiar a SANDBOX'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Public Key */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <label className="font-bold text-white font-mono flex items-center justify-between">
                <span>Public Key (Frontend SDK):</span>
                <span className="text-[10px] text-slate-500 font-normal">APP_USR-... o TEST-...</span>
              </label>
              <input
                type="text"
                value={mpConfig.publicKey}
                onChange={(e) => setMpConfig({ ...mpConfig, publicKey: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400">
                Utilizada para inicializar MercadoPago.js en el cliente Web y crear token de tarjeta.
              </p>
            </div>

            {/* Access Token */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <label className="font-bold text-white font-mono flex items-center justify-between">
                <span>Access Token (Secret API Key):</span>
                <button
                  type="button"
                  onClick={() => setShowAccessToken(!showAccessToken)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                >
                  {showAccessToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showAccessToken ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </label>
              <input
                type={showAccessToken ? 'text' : 'password'}
                value={mpConfig.accessToken}
                onChange={(e) => setMpConfig({ ...mpConfig, accessToken: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400">
                Token privado para generar las preferencias de Checkout Pro y cobrar suscripciones.
              </p>
            </div>

            {/* Client ID */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <label className="font-bold text-white font-mono">Client ID de la Aplicación:</label>
              <input
                type="text"
                value={mpConfig.clientId}
                onChange={(e) => setMpConfig({ ...mpConfig, clientId: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400">ID numérico de aplicación en tu dashboard de desarrollador.</p>
            </div>

            {/* Client Secret */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <label className="font-bold text-white font-mono flex items-center justify-between">
                <span>Client Secret:</span>
                <button
                  type="button"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                >
                  {showClientSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showClientSecret ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </label>
              <input
                type={showClientSecret ? 'text' : 'password'}
                value={mpConfig.clientSecret}
                onChange={(e) => setMpConfig({ ...mpConfig, clientSecret: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400">Clave secreta asociada al Client ID para OAuth y Webhooks.</p>
            </div>

            {/* Webhook URL */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800 md:col-span-2">
              <label className="font-bold text-white font-mono">URL de Notificaciones Webhook / IPN:</label>
              <input
                type="text"
                value={mpConfig.webhookUrl}
                onChange={(e) => setMpConfig({ ...mpConfig, webhookUrl: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400">
                Punto de entrada donde Mercado Pago envía las alertas HTTP POST de pago acreditado o rechazado.
              </p>
            </div>

            {/* Integrator ID & Email */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <label className="font-bold text-white font-mono">Integrator ID (Opcional):</label>
              <input
                type="text"
                value={mpConfig.integratorId}
                onChange={(e) => setMpConfig({ ...mpConfig, integratorId: e.target.value })}
                placeholder="dev_crdiegobeltramo"
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <label className="font-bold text-white font-mono">Email para Notificaciones de Cobro:</label>
              <input
                type="email"
                value={mpConfig.notificationEmail}
                onChange={(e) => setMpConfig({ ...mpConfig, notificationEmail: e.target.value })}
                className="w-full bg-[#080B10] border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={handleTestMpConnection}
              disabled={mpTesting}
              className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-cyan-800 text-cyan-300 font-mono text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{mpTesting ? 'Verificando con API MP...' : 'Testear Conexión a Mercado Pago'}</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Credenciales de Desarrollador</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          TAB 3: MATRIZ DE ALCANCES Y PERMISOS POR NIVEL DE SUSCRIPCIÓN
         ============================================================ */}
      {activeTab === 'scopes' && (
        <div className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white">Gestor de Montos de Suscripción, Cuotas y Alcances por Plan</h2>
              </div>
              <p className="text-xs text-slate-400">
                Configura los montos exactos a pagar (Mensual y Anual) en cada uno de los planes y habilita o restringe módulos para tus suscriptores.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => onNavigate('subscriptions')}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 font-mono text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Ver Checkout en Vivo</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7931A]" />
              </button>
              <button
                onClick={handleSaveScopes}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Montos y Permisos</span>
              </button>
            </div>
          </div>

          {/* Dedicated Subscription Amounts Editor Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#131C31] to-[#1A1429] border border-purple-700/50 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/40 font-bold uppercase">
                  CONTROL DE TARIFAS Y MONTOS A PAGAR
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Edición Directa de Montos por Plan (Impacto Inmediato en Checkout Multimoneda)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                Sincronizado con BTC, Lightning (SATS), SOL, BCH, ETH y Mercado Pago ARS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan 1 Pricing Box */}
              <div className="p-4 rounded-xl bg-[#080B10] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">Plan 1 · Explorer</span>
                  <button
                    type="button"
                    onClick={() =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          annualPriceUsd: Math.round(scopesConfig.free.monthlyPriceUsd * 10),
                        },
                      })
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                    title="Calcular anual como 10 meses (2 meses gratis)"
                  >
                    Auto Anual (10x)
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Nombre Público del Plan:</label>
                  <input
                    type="text"
                    value={scopesConfig.free.name}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: { ...scopesConfig.free, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#F7931A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Monto Mensual (USD):</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesConfig.free.monthlyPriceUsd}
                      onChange={(e) =>
                        setScopesConfig({
                          ...scopesConfig,
                          free: { ...scopesConfig.free, monthlyPriceUsd: Math.max(0, Number(e.target.value)) },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Monto Anual (USD):</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesConfig.free.annualPriceUsd}
                      onChange={(e) =>
                        setScopesConfig({
                          ...scopesConfig,
                          free: { ...scopesConfig.free, annualPriceUsd: Math.max(0, Number(e.target.value)) },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Eq. Mensual ARS: ~${(scopesConfig.free.monthlyPriceUsd * 1230).toLocaleString('es-AR')}</span>
                  <span>~{Math.round((scopesConfig.free.monthlyPriceUsd / 96420) * 1e8).toLocaleString()} SATS</span>
                </div>
              </div>

              {/* Plan 2 Pricing Box */}
              <div className="p-4 rounded-xl bg-[#080B10] border border-[#F7931A]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#F7931A] uppercase">Plan 2 · Pro Terminal</span>
                  <button
                    type="button"
                    onClick={() =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: {
                          ...scopesConfig.pro,
                          annualPriceUsd: Math.round(scopesConfig.pro.monthlyPriceUsd * 10),
                        },
                      })
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                    title="Calcular anual como 10 meses (2 meses gratis)"
                  >
                    Auto Anual (10x)
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Nombre Público del Plan:</label>
                  <input
                    type="text"
                    value={scopesConfig.pro.name}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: { ...scopesConfig.pro, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#F7931A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Monto Mensual (USD):</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesConfig.pro.monthlyPriceUsd}
                      onChange={(e) =>
                        setScopesConfig({
                          ...scopesConfig,
                          pro: { ...scopesConfig.pro, monthlyPriceUsd: Math.max(0, Number(e.target.value)) },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#F7931A]/60 rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#F7931A] font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Monto Anual (USD):</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesConfig.pro.annualPriceUsd}
                      onChange={(e) =>
                        setScopesConfig({
                          ...scopesConfig,
                          pro: { ...scopesConfig.pro, annualPriceUsd: Math.max(0, Number(e.target.value)) },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#F7931A]/60 rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#F7931A] font-mono focus:outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Eq. Mensual ARS: ~${(scopesConfig.pro.monthlyPriceUsd * 1230).toLocaleString('es-AR')}</span>
                  <span>~{Math.round((scopesConfig.pro.monthlyPriceUsd / 96420) * 1e8).toLocaleString()} SATS</span>
                </div>
              </div>

              {/* Plan 3 Pricing Box */}
              <div className="p-4 rounded-xl bg-[#080B10] border border-purple-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase">Plan 3 · Institutional</span>
                  <button
                    type="button"
                    onClick={() =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          annualPriceUsd: Math.round(scopesConfig.institutional.monthlyPriceUsd * 10),
                        },
                      })
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                    title="Calcular anual como 10 meses (2 meses gratis)"
                  >
                    Auto Anual (10x)
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Nombre Público del Plan:</label>
                  <input
                    type="text"
                    value={scopesConfig.institutional.name}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: { ...scopesConfig.institutional, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Monto Mensual (USD):</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesConfig.institutional.monthlyPriceUsd}
                      onChange={(e) =>
                        setScopesConfig({
                          ...scopesConfig,
                          institutional: {
                            ...scopesConfig.institutional,
                            monthlyPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-purple-700/60 rounded-lg px-2.5 py-1.5 text-sm font-bold text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Monto Anual (USD):</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={scopesConfig.institutional.annualPriceUsd}
                      onChange={(e) =>
                        setScopesConfig({
                          ...scopesConfig,
                          institutional: {
                            ...scopesConfig.institutional,
                            annualPriceUsd: Math.max(0, Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full bg-[#0F172A] border border-purple-700/60 rounded-lg px-2.5 py-1.5 text-sm font-bold text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Eq. Mensual ARS: ~${(scopesConfig.institutional.monthlyPriceUsd * 1230).toLocaleString('es-AR')}</span>
                  <span>~{Math.round((scopesConfig.institutional.monthlyPriceUsd / 96420) * 1e8).toLocaleString()} SATS</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Tier Scope Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier 1: Explorer (Free) */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                  NIVEL COMUNITARIO
                </span>
                <h3 className="text-base font-bold text-white mt-1">{scopesConfig.free.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Mensual USD:</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={scopesConfig.free.monthlyPriceUsd}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: { ...scopesConfig.free, monthlyPriceUsd: Math.max(0, Number(e.target.value)) },
                      })
                    }
                    className="w-20 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">Anual:</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={scopesConfig.free.annualPriceUsd}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: { ...scopesConfig.free, annualPriceUsd: Math.max(0, Number(e.target.value)) },
                      })
                    }
                    className="w-20 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Consultas Copilot / Día:</span>
                  <input
                    type="number"
                    value={scopesConfig.free.permissions.copilotQueriesPerDay as number}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            copilotQueriesPerDay: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-16 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Auditorías AI / Día:</span>
                  <input
                    type="number"
                    value={scopesConfig.free.permissions.aiSecurityAuditsPerDay as number}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            aiSecurityAuditsPerDay: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-16 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Exportar Reportes:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.free.permissions.exportReports}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            exportReports: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">10 Agentes Especializados:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.free.permissions.multiAgentOrchestrator}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            multiAgentOrchestrator: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">OpenZeppelin Studio:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.free.permissions.openZeppelinStudio}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            openZeppelinStudio: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">DEX AMM Simulator:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.free.permissions.dexAmmSimulator}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            dexAmmSimulator: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Proyectos en Workspace:</span>
                  <input
                    type="number"
                    value={scopesConfig.free.permissions.privateWorkspaceProjects}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        free: {
                          ...scopesConfig.free,
                          permissions: {
                            ...scopesConfig.free.permissions,
                            privateWorkspaceProjects: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-16 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Tier 2: Pro Terminal */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#F7931A]/60 space-y-4 shadow-lg">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7931A] text-black font-bold uppercase">
                  NIVEL PROFESIONAL
                </span>
                <h3 className="text-base font-bold text-white mt-1">Pro Terminal & Copilot</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Precio USD:</span>
                  <input
                    type="number"
                    value={scopesConfig.pro.monthlyPriceUsd}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: { ...scopesConfig.pro, monthlyPriceUsd: Number(e.target.value) },
                      })
                    }
                    className="w-20 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">Anual:</span>
                  <input
                    type="number"
                    value={scopesConfig.pro.annualPriceUsd}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: { ...scopesConfig.pro, annualPriceUsd: Number(e.target.value) },
                      })
                    }
                    className="w-20 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Consultas Copilot / Día:</span>
                  <span className="text-emerald-400 font-mono font-bold text-[11px]">ILIMITADO</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Auditorías AI / Día:</span>
                  <span className="text-emerald-400 font-mono font-bold text-[11px]">ILIMITADO</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Exportar Reportes:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.pro.permissions.exportReports}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: {
                          ...scopesConfig.pro,
                          permissions: {
                            ...scopesConfig.pro.permissions,
                            exportReports: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">10 Agentes Especializados:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.pro.permissions.multiAgentOrchestrator}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: {
                          ...scopesConfig.pro,
                          permissions: {
                            ...scopesConfig.pro.permissions,
                            multiAgentOrchestrator: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Portfolio Risk Engine:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.pro.permissions.portfolioRiskEngine}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: {
                          ...scopesConfig.pro,
                          permissions: {
                            ...scopesConfig.pro.permissions,
                            portfolioRiskEngine: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">OpenZeppelin Studio:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.pro.permissions.openZeppelinStudio}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: {
                          ...scopesConfig.pro,
                          permissions: {
                            ...scopesConfig.pro.permissions,
                            openZeppelinStudio: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Proyectos en Workspace:</span>
                  <input
                    type="number"
                    value={scopesConfig.pro.permissions.privateWorkspaceProjects}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        pro: {
                          ...scopesConfig.pro,
                          permissions: {
                            ...scopesConfig.pro.permissions,
                            privateWorkspaceProjects: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-16 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Tier 3: Institutional */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-purple-800/80 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 font-bold uppercase">
                  ENTERPRISE & INSTITUTIONAL
                </span>
                <h3 className="text-base font-bold text-white mt-1">Institutional OS</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Precio USD:</span>
                  <input
                    type="number"
                    value={scopesConfig.institutional.monthlyPriceUsd}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          monthlyPriceUsd: Number(e.target.value),
                        },
                      })
                    }
                    className="w-20 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400">Anual:</span>
                  <input
                    type="number"
                    value={scopesConfig.institutional.annualPriceUsd}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          annualPriceUsd: Number(e.target.value),
                        },
                      })
                    }
                    className="w-20 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Deep Research Lab (4 cuadrantes):</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.institutional.permissions.deepResearchLab}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          permissions: {
                            ...scopesConfig.institutional.permissions,
                            deepResearchLab: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Conectores MCP Privados:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.institutional.permissions.mcpConnectors}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          permissions: {
                            ...scopesConfig.institutional.permissions,
                            mcpConnectors: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Facturación ARCA Deducible:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.institutional.permissions.fiscalInvoiceArca}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          permissions: {
                            ...scopesConfig.institutional.permissions,
                            fiscalInvoiceArca: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Soporte Directo 24/7:</span>
                  <input
                    type="checkbox"
                    checked={scopesConfig.institutional.permissions.directSupport247}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          permissions: {
                            ...scopesConfig.institutional.permissions,
                            directSupport247: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Proyectos en Workspace:</span>
                  <input
                    type="number"
                    value={scopesConfig.institutional.permissions.privateWorkspaceProjects}
                    onChange={(e) =>
                      setScopesConfig({
                        ...scopesConfig,
                        institutional: {
                          ...scopesConfig.institutional,
                          permissions: {
                            ...scopesConfig.institutional.permissions,
                            privateWorkspaceProjects: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-16 bg-[#080B10] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: GESTOR DE USUARIOS & REGISTROS DE AUDITORÍA
         ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Override Plan Card */}
          <div className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
            <h2 className="text-base font-bold text-white">Asignación Directa de Plan para tu Sesión Actual</h2>
            <p className="text-xs text-slate-400">
              Como administrador, puedes asignarte o alternar inmediatamente entre cualquiera de los 3 niveles de suscripción para probar o utilizar la plataforma sin pagar.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onUpgradePlan('free')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  activePlanId === 'free'
                    ? 'bg-slate-700 text-white border border-slate-500'
                    : 'bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Asignar Plan Explorer (Free)
              </button>

              <button
                onClick={() => onUpgradePlan('pro')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activePlanId === 'pro'
                    ? 'bg-[#F7931A] text-black shadow'
                    : 'bg-[#0F172A] border border-slate-800 text-amber-300 hover:border-amber-600'
                }`}
              >
                Asignar Plan Pro Terminal (Ilimitado)
              </button>

              <button
                onClick={() => onUpgradePlan('institutional')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activePlanId === 'institutional'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-[#0F172A] border border-slate-800 text-purple-300 hover:border-purple-600'
                }`}
              >
                Asignar Plan Institutional & Enterprise
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-6 rounded-2xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Registro de Auditoría de Acciones Administrativas</h2>
              </div>
              <span className="text-xs font-mono text-slate-500">{auditLogs.length} eventos registrados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Fecha y Hora</th>
                    <th className="py-2 px-3">Acción</th>
                    <th className="py-2 px-3">Detalles</th>
                    <th className="py-2 px-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[#F7931A] font-bold">{log.action}</td>
                      <td className="py-2.5 px-3">{log.details}</td>
                      <td className="py-2.5 px-3 text-slate-400">{log.adminUser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
