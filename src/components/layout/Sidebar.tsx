import React from 'react';
import { NavigationSection } from '../../types';
import {
  Activity,
  FileText,
  LineChart,
  GitBranch,
  BookOpen,
  Cpu,
  Shield,
  Zap,
  Scale,
  Calculator,
  History,
  Bot,
  Code2,
  Lock,
  Boxes,
  Compass,
  PieChart,
  Layers,
  ChevronRight,
  BookMarked,
  Key,
  FolderGit2,
  Atom,
  ShieldAlert,
  BarChart3,
  Globe,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const groups: NavGroup[] = [
    {
      title: 'Plataforma & Terminal',
      items: [
        { id: 'landing', label: 'Landing Interactiva', icon: Compass },
        { id: 'dashboard', label: 'Terminal Principal', icon: Activity },
        { id: 'daily-intelligence', label: 'Daily Intelligence Report', icon: FileText },
        { id: 'trading-view', label: 'TradingView Gráfico', icon: LineChart },
        { id: 'onchain-analytics', label: 'Métricas On-Chain & Macro (14 Fuentes)', icon: BarChart3 },
        { id: 'core-watch', label: 'Bitcoin Core Watch', icon: GitBranch },
        { id: 'bip-watch', label: 'BIP Watch (Propuestas)', icon: Layers },
        { id: 'mining-intelligence', label: 'Minería & Halving', icon: Cpu },
        { id: 'wallet-custody', label: 'Billeteras & Custodia', icon: Key },
        { id: 'quantum-radar', label: 'Radar Post-Cuántica', icon: Atom },
        { id: 'protocol-explorer', label: 'Explorador UTXO & Script', icon: Boxes },
        { id: 'lightning-lab', label: 'Lightning Network Lab', icon: Zap },
        { id: 'regulatory-intelligence', label: 'Inteligencia Regulatoria', icon: Scale },
        { id: 'accounting-tax', label: 'Contabilidad & Impuestos', icon: Calculator },
        { id: 'timeline', label: 'Línea de Tiempo Histórica', icon: History },
      ],
    },
    {
      title: 'Sistema B: Blockchain Development',
      items: [
        { id: 'copilot-wizard', label: 'AI Architecture Copilot', icon: Bot },
        { id: 'smart-contract-lab', label: 'Smart Contract Lab', icon: Code2 },
        { id: 'openzeppelin', label: 'OpenZeppelin v5 Studio', icon: Shield },
        { id: 'security-auditor', label: 'Security Auditor (Solidity)', icon: Shield },
        { id: 'code-workspace', label: 'Web3 Code Workspace', icon: FolderGit2 },
        { id: 'prompt-library', label: 'Prompt Engineering Lab', icon: Compass },
        { id: 'learning-mode', label: 'Learning Mode (Libro)', icon: BookMarked },
      ],
    },
    {
      title: 'Sistema C: DeFi & DEX Lab',
      items: [
        { id: 'dex-lab', label: 'DEX AMM Simulator (x*y=k)', icon: Layers },
        { id: 'defi-intelligence', label: 'DeFi Protocols & Lending', icon: Lock },
        { id: 'risk-engine', label: 'DeFi Risk Engine (8 Pilares)', icon: Shield },
      ],
    },
    {
      title: 'Agentes, Finanzas & Suscripción',
      items: [
        { id: 'subscriptions', label: 'Suscripciones (BTC/LN/MP)', icon: Zap },
        { id: 'agent-orchestrator', label: 'AI Agent Orchestrator', icon: Bot },
        { id: 'portfolio-lab', label: 'Portfolio Risk (VaR/Sharpe)', icon: PieChart },
        { id: 'research-lab', label: 'Deep Research Lab', icon: BookOpen },
        { id: 'docs', label: 'Documentación del Sistema', icon: FileText },
      ],
    },
    {
      title: 'Control Soberano & Tesorería',
      items: [
        { id: 'admin', label: 'Panel de Administrador (Diego)', icon: ShieldAlert },
      ],
    },
  ];

  const handleSelect = (id: NavigationSection) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-57px)] w-72 bg-[#090D15] border-r border-[#1E293B] overflow-y-auto transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Conceptual inspiration tribute header in sidebar */}
          <div className="p-3 rounded-lg bg-[#0C1322] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-mono text-[#F7931A] font-semibold tracking-wider">
              Motor de Conocimiento
            </div>
            <div className="text-xs font-medium text-slate-200 mt-1">
              Claude para el Desarrollo Blockchain
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Por Diego Eduardo Beltramo
            </div>
          </div>

          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors text-left ${
                        isActive
                          ? 'bg-[#1E293B] text-white font-medium border-l-2 border-[#F7931A]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F7931A]' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#F7931A] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Diego Beltramo Official Site Quick Direct Link */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0A0E17]/60">
          <a
            href="https://diegobeltramobitcoin.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 hover:border-[#F7931A]/40 text-slate-300 hover:text-white transition-all text-xs font-mono group"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-[#F7931A] shrink-0" />
              <span className="truncate text-[11px]">diegobeltramobitcoin.netlify.app</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#F7931A] shrink-0" />
          </a>
        </div>
      </aside>
    </>
  );
};
