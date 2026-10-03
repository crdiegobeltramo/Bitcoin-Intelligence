import React, { useState, useEffect } from 'react';
import { NavigationSection } from '../../types';
import {
  Search,
  Activity,
  FileText,
  Layers,
  Shield,
  Code2,
  FolderGit2,
  PieChart,
  BookOpen,
  ArrowRight,
  X,
  Compass
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavigationSection) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  section: NavigationSection;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const commands: CommandItem[] = [
    { id: 'c-landing', title: 'Landing Page Interactiva & Manifiesto', category: 'Plataforma', section: 'landing', icon: Compass, hint: 'Framework B.I.T.C.O.I.N., Pilares Web3, Libros' },
    { id: 'c-terminal', title: 'Abrir Bitcoin Intelligence Terminal', category: 'Bitcoin', section: 'dashboard', icon: Activity, hint: 'BTC Spot, Hashrate, Mempool' },
    { id: 'c-onchain', title: 'Métricas On-Chain & Correlaciones (14 Fuentes)', category: 'Bitcoin', section: 'onchain-analytics', icon: Activity, hint: 'LookIntoBitcoin, CryptoQuant, BitBo, NodeCharts, Mataf, Stenox' },
    { id: 'c-daily', title: 'Generar Daily Intelligence Report', category: 'Bitcoin', section: 'daily-intelligence', icon: FileText, hint: 'BIS Score y Top Eventos' },
    { id: 'c-bip', title: 'Explorar BIP Watch & Propuestas', category: 'Bitcoin Core', section: 'bip-watch', icon: Layers, hint: 'BIP 340, 341, 119, 360' },
    { id: 'c-core', title: 'Monitorear Bitcoin Core Commits & PRs', category: 'Bitcoin Core', section: 'core-watch', icon: Code2, hint: 'Cluster mempool, P2P v2' },
    { id: 'c-audit', title: 'Auditar Smart Contract con IA', category: 'Seguridad', section: 'security-auditor', icon: Shield, hint: 'Reentrancy, Oracle, CEI' },
    { id: 'c-oz', title: 'OpenZeppelin v5 Contract Studio', category: 'Desarrollo', section: 'openzeppelin', icon: Shield, hint: 'ERC20, ERC721, ERC1155, AccessControl, Permit' },
    { id: 'c-copilot', title: 'Iniciar Copiloto de Arquitectura Web3', category: 'Desarrollo', section: 'copilot-wizard', icon: Compass, hint: 'Requerimientos y diseño' },
    { id: 'c-lab', title: 'Laboratorio de Contratos Inteligentes', category: 'Desarrollo', section: 'smart-contract-lab', icon: Code2, hint: 'ERC-20, Staking, Multisig' },
    { id: 'c-workspace', title: 'Abrir Web3 Code Workspace (IDE)', category: 'Desarrollo', section: 'code-workspace', icon: FolderGit2, hint: 'Editor y Terminal' },
    { id: 'c-subs', title: 'Gestionar Planes de Suscripción (BTC, LN, SOL, BCH, ETH, MP)', category: 'Suscripciones', section: 'subscriptions', icon: Layers, hint: 'Checkout multimoneda y facturación' },
    { id: 'c-admin', title: 'Panel de Administrador & Tesorería (Diego Beltramo)', category: 'Administración', section: 'admin', icon: Shield, hint: 'Editar BTC, Lightning, MP Developers, Alcances' },
    { id: 'c-dex', title: 'Simulador de AMM & DEX (x · y = k)', category: 'DeFi', section: 'dex-lab', icon: Layers, hint: 'Slippage, Impermanent Loss' },
    { id: 'c-defi', title: 'Protocolos DeFi & Health Factor', category: 'DeFi', section: 'defi-intelligence', icon: Shield, hint: 'Lending, Borrowing, Flash Loans' },
    { id: 'c-agents', title: 'Consola de AI Multi-Agentes', category: 'Agentes', section: 'agent-orchestrator', icon: Compass, hint: '10 agentes especializados' },
    { id: 'c-portfolio', title: 'Analizador de Cartera Cuantitativa (VaR/Sharpe)', category: 'Finanzas', section: 'portfolio-lab', icon: PieChart, hint: 'Sortino, CAGR, Max Drawdown' },
    { id: 'c-research', title: 'Laboratorio de Investigación Factual', category: 'Investigación', section: 'research-lab', icon: BookOpen, hint: 'Fact vs Opinion' },
    { id: 'c-reg', title: 'Revisar Marco Regulatorio (CNV, MiCA, SEC)', category: 'Regulación', section: 'regulatory-intelligence', icon: Layers, hint: 'PSAV y licencias' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setSearchTerm('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.hint && c.hint.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (section: NavigationSection) => {
    onNavigate(section);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center border-b border-[#1E293B] px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escribe un comando, módulo o concepto (ej. AMM, auditoría, BIP, mempool)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No se encontraron comandos que coincidan con &quot;{searchTerm}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.section)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#1E293B] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded bg-[#0A0E17] border border-slate-800 text-[#F7931A]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.category} · {item.hint}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#F7931A] shrink-0 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              );
            })
          )}
        </div>

        <div className="bg-[#090D15] border-t border-[#1E293B] px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono-nums">
          <span>Navegar con teclado o ratón</span>
          <span>Presiona ESC para cerrar</span>
        </div>
      </div>
    </div>
  );
};
