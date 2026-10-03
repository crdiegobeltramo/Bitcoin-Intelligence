import React, { useState } from 'react';
import { AuthService } from '../../services/auth/authService';
import { AuthUser, AuthProviderType, SubscriptionPlanId } from '../../types';
import { X, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, LogOut, Wallet } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onUserChange: (user: AuthUser | null) => void;
  activePlanId?: SubscriptionPlanId;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  activePlanId = 'free',
}) => {
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (provider: AuthProviderType) => {
    setLoadingProvider(provider);
    setErrorMessage(null);
    try {
      let user: AuthUser;
      if (provider === 'google') {
        user = await AuthService.loginWithGoogle(activePlanId);
      } else if (provider === 'metamask') {
        user = await AuthService.loginWithMetaMask(activePlanId);
      } else if (provider === 'trustwallet') {
        user = await AuthService.loginWithTrustWallet(activePlanId);
      } else {
        user = await AuthService.loginWithPhantom(activePlanId);
      }
      onUserChange(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    onUserChange(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-md bg-[#0A0E17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#0C1322] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#F7931A]" />
            <h2 className="text-base font-bold text-white">
              {currentUser ? 'Cuenta & Billetera Conectada' : 'Iniciar Sesión / Conectar Wallet'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Active User Profile View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">PROVEEDOR ACTIVO:</span>
                  <div className="flex items-center gap-1.5">
                    {currentUser.email === 'crdiegobeltramo@gmail.com' && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                        ADMIN ROOT
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#1E293B] text-cyan-300 uppercase">
                      {currentUser.provider}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-slate-700 flex items-center justify-center font-bold text-white font-mono">
                    {currentUser.provider === 'google' ? 'G' : 'W'}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {currentUser.email || currentUser.walletAddress}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono-nums">
                  <span>Red: {currentUser.network || 'Universal Web3'}</span>
                  <span className="text-emerald-400 font-medium">Autenticado</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar Sesión / Wallet</span>
              </button>
            </div>
          ) : (
            /* Login Options */
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Accede a tu perfil, proyectos guardados, historial de auditorías y planes mediante Google o tu billetera Web3 preferida:
              </p>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* 1. Google (Firebase Auth) */}
              <button
                onClick={() => handleLogin('google')}
                disabled={loadingProvider !== null}
                className="w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-slate-900 text-sm">
                    G
                  </div>
                  <div className="text-left">
                    <div>Continuar con Google</div>
                    <div className="text-[10px] text-slate-500 font-normal">Firebase Authentication & OAuth</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </button>

              {/* 2. MetaMask (EVM) */}
              <button
                onClick={() => handleLogin('metamask')}
                disabled={loadingProvider !== null}
                className="w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#F7931A] flex items-center justify-center font-bold text-sm">
                    🦊
                  </div>
                  <div className="text-left">
                    <div>MetaMask (EVM)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Ethereum, Arbitrum, Polygon, BNB Chain</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </button>

              {/* 3. Trust Wallet */}
              <button
                onClick={() => handleLogin('trustwallet')}
                disabled={loadingProvider !== null}
                className="w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    🛡️
                  </div>
                  <div className="text-left">
                    <div>Trust Wallet</div>
                    <div className="text-[10px] text-slate-500 font-normal">Billetera Multi-Cadena & WalletConnect</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </button>

              {/* 4. Phantom (Solana) */}
              <button
                onClick={() => handleLogin('phantom')}
                disabled={loadingProvider !== null}
                className="w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    👻
                  </div>
                  <div className="text-left">
                    <div>Phantom (Solana)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Solana Mainnet-Beta & SOL SPL</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {/* Privacy and Zero Custody Notice */}
          <div className="p-3 rounded-lg bg-[#080B10] border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Seguridad Soberana:</strong> El inicio de sesión se realiza mediante firma criptográfica de desafío (*personal_sign*). Jamás se solicitan claves privadas ni frases semilla.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
