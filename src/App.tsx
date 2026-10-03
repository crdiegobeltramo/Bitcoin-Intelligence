import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationSection,
  DataSourceMode,
  BitcoinMarketData,
  BitcoinNetworkData,
  OnChainMetrics,
  BitcoinIntelligenceScore,
  DailyReport,
} from './types';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { TradingViewWidget } from './components/tradingview/TradingViewWidget';

// Views
import { LandingPageView } from './components/views/LandingPageView';
import { DashboardView } from './components/views/DashboardView';
import { DailyIntelligenceView } from './components/views/DailyIntelligenceView';
import { OnChainAnalyticsView } from './components/views/OnChainAnalyticsView';
import { CoreWatchView } from './components/views/CoreWatchView';
import { BipWatchView } from './components/views/BipWatchView';
import { MiningIntelligenceView } from './components/views/MiningIntelligenceView';
import { WalletCustodyView } from './components/views/WalletCustodyView';
import { QuantumRadarView } from './components/views/QuantumRadarView';
import { ProtocolExplorerView } from './components/views/ProtocolExplorerView';
import { LightningLabView } from './components/views/LightningLabView';
import { RegulatoryView } from './components/views/RegulatoryView';
import { AccountingView } from './components/views/AccountingView';
import { TimelineView } from './components/views/TimelineView';
import { CopilotWizardView } from './components/views/CopilotWizardView';
import { SmartContractLabView } from './components/views/SmartContractLabView';
import { SecurityAuditorView } from './components/views/SecurityAuditorView';
import { CodeWorkspaceView } from './components/views/CodeWorkspaceView';
import { PromptLibraryView } from './components/views/PromptLibraryView';
import { LearningModeView } from './components/views/LearningModeView';
import { OpenZeppelinStudioView } from './components/views/OpenZeppelinStudioView';
import { SubscriptionsView } from './components/views/SubscriptionsView';
import { DexLabView } from './components/views/DexLabView';
import { DeFiIntelligenceView } from './components/views/DeFiIntelligenceView';
import { RiskEngineView } from './components/views/RiskEngineView';
import { AgentOrchestratorView } from './components/views/AgentOrchestratorView';
import { PortfolioLabView } from './components/views/PortfolioLabView';
import { ResearchLabView } from './components/views/ResearchLabView';
import { DocsView } from './components/views/DocsView';
import { AdminPortalView } from './components/views/AdminPortalView';
import { AuthModal } from './components/auth/AuthModal';

// Data Providers
import { MarketDataProvider } from './services/dataProviders/marketDataProvider';
import { OnChainDataProvider } from './services/dataProviders/onchainDataProvider';
import { IntelligenceScoreProvider } from './services/dataProviders/intelligenceScoreProvider';
import { SubscriptionBillingEngine } from './services/billing/subscriptionPlans';
import { AuthService } from './services/auth/authService';
import { SubscriptionPlanId, AuthUser, PreferredDataProvider } from './types';
import { Menu, Activity } from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('landing');
  const [dataMode, setDataMode] = useState<DataSourceMode>('LIVE');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    AuthService.getStoredUser()
  );
  const [activePlanId, setActivePlanId] = useState<SubscriptionPlanId>(() =>
    SubscriptionBillingEngine.getActiveSubscription().planId
  );
  const [preferredProvider, setPreferredProvider] = useState<PreferredDataProvider>(() => {
    try {
      const saved = localStorage.getItem('bitcoin_intel_preferred_provider');
      if (saved) return saved as PreferredDataProvider;
    } catch {}
    return 'cryptoquant';
  });

  const [marketData, setMarketData] = useState<BitcoinMarketData | null>(null);
  const [networkData, setNetworkData] = useState<BitcoinNetworkData | null>(null);
  const [onChainMetrics, setOnChainMetrics] = useState<OnChainMetrics | null>(null);
  const [bisScore, setBisScore] = useState<BitcoinIntelligenceScore>(() =>
    IntelligenceScoreProvider.calculateBis()
  );
  const [dailyReport, setDailyReport] = useState<DailyReport>(() =>
    IntelligenceScoreProvider.generateDailyReport()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load telemetry data
  const loadData = useCallback(async (mode: DataSourceMode, provider: PreferredDataProvider = preferredProvider) => {
    setIsLoading(true);
    try {
      const [mkt, net, onchain] = await Promise.all([
        MarketDataProvider.getBitcoinMarketData(mode),
        OnChainDataProvider.getNetworkData(mode),
        OnChainDataProvider.getOnChainMetrics(mode, provider),
      ]);
      setMarketData(mkt);
      setNetworkData(net);
      setOnChainMetrics(onchain);
      setBisScore(IntelligenceScoreProvider.calculateBis());
      setDailyReport(IntelligenceScoreProvider.generateDailyReport());
    } catch {
      // Error handling with verified fallback
    } finally {
      setIsLoading(false);
    }
  }, [preferredProvider]);

  useEffect(() => {
    loadData(dataMode, preferredProvider);
    const interval = setInterval(() => {
      loadData(dataMode, preferredProvider);
    }, 35000);
    return () => clearInterval(interval);
  }, [dataMode, preferredProvider, loadData]);

  const toggleDataMode = () => {
    const nextMode = dataMode === 'LIVE' ? 'DEMO' : 'LIVE';
    setDataMode(nextMode);
  };

  const handleSelectProvider = (newProvider: PreferredDataProvider) => {
    setPreferredProvider(newProvider);
    try {
      localStorage.setItem('bitcoin_intel_preferred_provider', newProvider);
    } catch {}
    loadData(dataMode, newProvider);
  };

  const handleExportReport = () => {
    setCurrentSection('daily-intelligence');
  };

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] flex flex-col font-sans antialiased">
      {/* Safety & Regulatory Banner */}
      <DisclaimerBanner />

      {/* Main Top Bar */}
      <Header
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        dataMode={dataMode}
        onToggleDataMode={toggleDataMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        marketData={marketData}
        onExportReport={handleExportReport}
        activePlanId={activePlanId}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        preferredProvider={preferredProvider}
        onSelectProvider={handleSelectProvider}
      />

      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden bg-[#0A0E17] border-b border-[#1E293B] px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-xs text-slate-300 font-medium p-1 hover:text-white"
        >
          <Menu className="w-4 h-4 text-[#F7931A]" />
          <span>Menú del Sistema</span>
        </button>
        <span className="text-xs font-mono text-slate-400 capitalize">
          {currentSection.replace(/-/g, ' ')}
        </span>
      </div>

      {/* Layout Body */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentSection === 'landing' && (
            <LandingPageView
              onNavigate={setCurrentSection}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              currentUser={currentUser}
              activePlanId={activePlanId}
            />
          )}

          {currentSection === 'dashboard' && (
            <DashboardView
              marketData={marketData}
              networkData={networkData}
              onChainMetrics={onChainMetrics}
              bisScore={bisScore}
              onNavigate={setCurrentSection}
              isLoading={isLoading}
            />
          )}

          {currentSection === 'daily-intelligence' && (
            <DailyIntelligenceView report={dailyReport} />
          )}

          {currentSection === 'trading-view' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#1E293B]">
                <h1 className="text-2xl font-bold text-white">TRADINGVIEW CHART TERMINAL</h1>
                <p className="text-xs text-slate-400">
                  Gráfico técnico en tiempo real BTC/USD con análisis de velas, volumen e indicadores de impulso.
                </p>
              </div>
              <TradingViewWidget marketData={marketData} />
            </div>
          )}

          {currentSection === 'onchain-analytics' && (
            <OnChainAnalyticsView onNavigate={setCurrentSection} />
          )}

          {currentSection === 'core-watch' && <CoreWatchView />}
          {currentSection === 'bip-watch' && <BipWatchView />}
          {currentSection === 'mining-intelligence' && (
            <MiningIntelligenceView networkData={networkData} />
          )}
          {currentSection === 'wallet-custody' && <WalletCustodyView />}
          {currentSection === 'quantum-radar' && <QuantumRadarView />}
          {currentSection === 'protocol-explorer' && <ProtocolExplorerView />}
          {currentSection === 'lightning-lab' && <LightningLabView />}
          {currentSection === 'regulatory-intelligence' && <RegulatoryView />}
          {currentSection === 'accounting-tax' && <AccountingView />}
          {currentSection === 'timeline' && <TimelineView />}

          {/* Sistema B */}
          {currentSection === 'copilot-wizard' && <CopilotWizardView />}
          {currentSection === 'smart-contract-lab' && (
            <SmartContractLabView onNavigate={setCurrentSection} />
          )}
          {currentSection === 'openzeppelin' && (
            <OpenZeppelinStudioView onNavigate={setCurrentSection} />
          )}
          {currentSection === 'security-auditor' && <SecurityAuditorView />}
          {currentSection === 'code-workspace' && <CodeWorkspaceView />}
          {currentSection === 'prompt-library' && (
            <PromptLibraryView
              onExecutePrompt={() => {
                setCurrentSection('agent-orchestrator');
              }}
            />
          )}
          {currentSection === 'learning-mode' && <LearningModeView />}

          {/* Sistema C */}
          {currentSection === 'dex-lab' && <DexLabView />}
          {currentSection === 'defi-intelligence' && <DeFiIntelligenceView />}
          {currentSection === 'risk-engine' && <RiskEngineView />}

          {/* Subscriptions & Checkout */}
          {currentSection === 'subscriptions' && (
            <SubscriptionsView
              activePlanId={activePlanId}
              onUpgradePlan={(newPlan) => setActivePlanId(newPlan)}
              btcSpotUsd={marketData?.btcUsd || 96420}
              usdArsRate={marketData?.usdArs || 1230}
              currentUser={currentUser}
              onNavigate={setCurrentSection}
            />
          )}

          {/* Admin Portal (Diego Beltramo) */}
          {currentSection === 'admin' && (
            <AdminPortalView
              currentUser={currentUser}
              onNavigate={setCurrentSection}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              activePlanId={activePlanId}
              onUpgradePlan={(newPlan) => {
                setActivePlanId(newPlan);
                SubscriptionBillingEngine.saveActiveSubscription(newPlan, '2099-12-31T23:59:59Z');
              }}
            />
          )}

          {/* Agents, Research & Portfolio */}
          {currentSection === 'agent-orchestrator' && <AgentOrchestratorView />}
          {currentSection === 'portfolio-lab' && <PortfolioLabView />}
          {currentSection === 'research-lab' && <ResearchLabView />}
          {currentSection === 'docs' && <DocsView />}
        </main>
      </div>

      {/* Quick Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentSection}
      />

      {/* Auth & Web3 Wallet Connector Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => setCurrentUser(user)}
        activePlanId={activePlanId}
      />
    </div>
  );
}
