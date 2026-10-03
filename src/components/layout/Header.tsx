import React, { useState, useRef, useEffect } from 'react';
import {
  NavigationSection,
  DataSourceMode,
  BitcoinMarketData,
  SubscriptionPlanId,
  AuthUser,
  PreferredDataProvider
} from '../../types';
import { DATA_PROVIDERS_CONFIG } from '../../services/dataProviders/onchainDataProvider';
import {
  Search,
  Download,
  Terminal,
  Radio,
  Sparkles,
  Wallet,
  UserCheck,
  ShieldAlert,
  Database,
  ChevronDown,
  Check,
  ExternalLink,
  Activity
} from 'lucide-react';

interface HeaderProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  dataMode: DataSourceMode;
  onToggleDataMode: () => void;
  onOpenCommandPalette: () => void;
  marketData: BitcoinMarketData | null;
  onExportReport: () => void;
  activePlanId?: SubscriptionPlanId;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
  preferredProvider?: PreferredDataProvider;
  onSelectProvider?: (provider: PreferredDataProvider) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onNavigate,
  dataMode,
  onToggleDataMode,
  onOpenCommandPalette,
  marketData,
  onExportReport,
  activePlanId = 'free',
  currentUser = null,
  onOpenAuthModal,
  preferredProvider = 'cryptoquant',
  onSelectProvider,
}) => {
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentProviderInfo =
    DATA_PROVIDERS_CONFIG.find((p) => p.id === preferredProvider) || DATA_PROVIDERS_CONFIG[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProviderDropdownOpen(false);
      }
    };

    if (isProviderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProviderDropdownOpen]);

  const handleSelect = (providerId: PreferredDataProvider) => {
    if (onSelectProvider) {
      onSelectProvider(providerId);
    }
    setIsProviderDropdownOpen(false);
  };
  return (
    <header className="sticky top-0 z-40 bg-[#080B10]/90 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="text-left font-display font-black text-lg tracking-tight text-white hover:text-[#F7931A] transition-colors focus-visible:outline-none"
          >
            BITCOIN INTELLIGENCE
          </button>

          {/* Discreet spot price ticker */}
          {marketData && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono-nums border-l border-slate-800 pl-3">
              <span className="text-slate-400">BTC</span>
              <span className="text-white font-medium">
                ${marketData.btcUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              <span
                className={`text-xs ${
                  marketData.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {marketData.change24h >= 0 ? '+' : ''}
                {marketData.change24h}%
              </span>
            </div>
          )}
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-white ${
              currentSection === 'landing' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            Landing
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors hover:text-white ${
              currentSection === 'dashboard' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => onNavigate('daily-intelligence')}
            className={`transition-colors hover:text-white ${
              currentSection === 'daily-intelligence' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => onNavigate('onchain-analytics')}
            className={`transition-colors hover:text-white ${
              currentSection === 'onchain-analytics' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            On-Chain Hub
          </button>
          <button
            onClick={() => onNavigate('bip-watch')}
            className={`transition-colors hover:text-white ${
              currentSection === 'bip-watch' || currentSection === 'core-watch' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            Core & BIPs
          </button>
          <button
            onClick={() => onNavigate('openzeppelin')}
            className={`transition-colors hover:text-white ${
              currentSection === 'openzeppelin' || currentSection === 'smart-contract-lab' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            OpenZeppelin v5
          </button>
          <button
            onClick={() => onNavigate('dex-lab')}
            className={`transition-colors hover:text-white ${
              currentSection === 'dex-lab' || currentSection === 'defi-intelligence' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            DEX & DeFi Lab
          </button>
          <button
            onClick={() => onNavigate('subscriptions')}
            className={`transition-colors hover:text-white flex items-center gap-1 ${
              currentSection === 'subscriptions' ? 'text-[#F7931A] font-semibold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F7931A]" />
            <span>Suscripciones</span>
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`transition-colors hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded border ${
              currentSection === 'admin'
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 font-bold'
                : 'border-rose-900/60 text-rose-400/90 hover:bg-rose-950/40'
            }`}
            title="Portal de Administración & Tesorería (Diego Beltramo)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-mono font-semibold">Admin</span>
          </button>
          <a
            href="https://diegobeltramobitcoin.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors text-[#F7931A] hover:text-amber-300 flex items-center gap-1 text-xs font-mono font-semibold px-2 py-1 rounded border border-[#F7931A]/40 bg-[#F7931A]/10 hover:bg-[#F7931A]/20"
            title="Sitio Oficial de Diego Beltramo"
          >
            <span>DiegoBeltramo.app</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile / Web3 Wallet Login Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                currentUser
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-[#121922] hover:bg-[#1E293B] border-slate-700 text-slate-200'
              }`}
            >
              {currentUser ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[90px]">{currentUser.name}</span>
                </>
              ) : (
                <>
                  <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Conectar Wallet</span>
                </>
              )}
            </button>
          )}

          {/* Active plan badge button */}
          <button
            onClick={() => onNavigate('subscriptions')}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold rounded border transition-colors ${
              activePlanId === 'institutional'
                ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                : activePlanId === 'pro'
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Gestionar plan de suscripción"
          >
            <span>{activePlanId === 'institutional' ? 'ENTERPRISE' : activePlanId === 'pro' ? 'PRO PLAN' : 'FREE PLAN'}</span>
          </button>

          {/* Data Source Provider Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
              title={`Proveedor de datos activo: ${currentProviderInfo.name}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-md bg-[#0F172A] border border-[#1E293B] hover:border-slate-600 text-slate-200 transition-colors focus:outline-none"
              aria-expanded={isProviderDropdownOpen}
              aria-haspopup="true"
            >
              <Database className="w-3.5 h-3.5 text-[#F7931A]" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 hidden xl:inline text-[11px]">Fuente:</span>
                <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[120px]">
                  {currentProviderInfo.shortName}
                </span>
                <span
                  className="hidden 2xl:inline text-[9px] px-1.5 py-0.2 rounded font-bold uppercase"
                  style={{
                    backgroundColor: `${currentProviderInfo.color}22`,
                    color: currentProviderInfo.color,
                    border: `1px solid ${currentProviderInfo.color}44`,
                  }}
                >
                  {currentProviderInfo.badge}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isProviderDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Floating Dropdown Menu */}
            {isProviderDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#090D15] border border-slate-700/80 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="p-3.5 bg-[#0F172A] border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F7931A] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      <span>DATA SOURCE PROVIDER</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{dataMode === 'LIVE' ? 'FEED EN VIVO' : 'MODO DEMO'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Selecciona el proveedor de datos on-chain para calibrar la telemetría y métricas del sistema.
                  </p>
                </div>

                {/* Options List */}
                <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                  {DATA_PROVIDERS_CONFIG.map((provider) => {
                    const isSelected = provider.id === preferredProvider;
                    return (
                      <button
                        key={provider.id}
                        onClick={() => handleSelect(provider.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-[#1E293B] border border-[#F7931A]/60 shadow-sm'
                            : 'hover:bg-[#121922] border border-transparent'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: provider.color }}
                            />
                            <span className="text-xs font-bold text-white font-mono truncate">
                              {provider.name}
                            </span>
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase shrink-0"
                              style={{
                                backgroundColor: `${provider.color}20`,
                                color: provider.color,
                              }}
                            >
                              {provider.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 pl-4">
                            {provider.tagline}
                          </p>
                        </div>

                        <div className="pt-0.5 shrink-0">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#F7931A]/20 border border-[#F7931A] flex items-center justify-center text-[#F7931A]">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-700 hover:border-slate-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer with link to full On-Chain Hub */}
                <div className="p-3 bg-[#06080E] border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    14 Fuentes Totales
                  </span>
                  <button
                    onClick={() => {
                      setIsProviderDropdownOpen(false);
                      onNavigate('onchain-analytics');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
                  >
                    <span>Ver Hub de Métricas & Correlaciones</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Data Mode Toggle: LIVE vs DEMO */}
          <button
            onClick={onToggleDataMode}
            title={dataMode === 'LIVE' ? 'Datos en vivo de APIs públicas' : 'Datos estables de demostración'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-nums rounded-md bg-[#0F172A] border border-[#1E293B] text-slate-300 hover:border-slate-600 transition-colors"
          >
            <Radio className={`w-3 h-3 ${dataMode === 'LIVE' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{dataMode === 'LIVE' ? 'LIVE' : 'DEMO'}</span>
          </button>

          {/* Quick Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] rounded-md transition-colors"
            title="Abrir Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden md:inline text-[10px] bg-[#1E293B] px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};


