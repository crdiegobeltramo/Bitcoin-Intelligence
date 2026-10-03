import React, { useState } from 'react';
import { OpenZeppelinWizard } from '../../services/security/openzeppelinWizard';
import { OpenZeppelinWizardConfig, NavigationSection } from '../../types';
import { Shield, Copy, Check, Download, ArrowRight, Play, ExternalLink, Sparkles, CheckCircle2, Layers } from 'lucide-react';

interface OpenZeppelinStudioViewProps {
  onNavigate?: (section: NavigationSection) => void;
}

export const OpenZeppelinStudioView: React.FC<OpenZeppelinStudioViewProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<OpenZeppelinWizardConfig>({
    standard: 'ERC20',
    name: 'BitcoinIntelToken',
    symbol: 'BIT',
    premint: '1000000',
    baseUri: 'https://api.bitcoinintelligence.org/metadata/',
    accessControl: 'ownable',
    pausable: true,
    burnable: true,
    mintable: true,
    permit: true,
    votes: false,
    flashMint: false,
    enumerable: false,
    uriStorage: false,
    upgradeability: 'none',
  });

  const [copied, setCopied] = useState(false);

  const generated = OpenZeppelinWizard.generateContract(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(generated.solidityCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generated.solidityCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'Contract'}.sol`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Shield className="w-3.5 h-3.5" />
            <span>OPENZEPPELIN CONTRACTS V5.0 STUDIO · PRODUCTION STANDARD</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">OPENZEPPELIN CONTRACT GENERATOR</h1>
          <p className="text-xs text-slate-400">
            Construcción de contratos inteligentes estándar (ERC-20, ERC-721, ERC-1155, AccessControl, Pausable, Permit) con las directrices de seguridad de OpenZeppelin v5.0.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://docs.openzeppelin.com/contracts/5.x/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 transition-colors"
          >
            <span>Docs Oficiales OZ v5.0</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#1E293B] hover:bg-slate-700 text-white font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Código'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-white font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .sol</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Configuration Form */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Parámetros y Extensiones
            </h2>
            <span className="text-xs font-mono text-[#F7931A]">v5.0.0</span>
          </div>

          {/* Standard Tabs */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-medium">Estándar de Token:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ERC20', 'ERC721', 'ERC1155'] as const).map((std) => (
                <button
                  key={std}
                  onClick={() => setConfig({ ...config, standard: std })}
                  className={`p-2 rounded-lg font-mono text-xs font-bold border transition-colors ${
                    config.standard === std
                      ? 'bg-[#1E293B] text-[#F7931A] border-[#F7931A]'
                      : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {std}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Symbol */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Nombre del Token:</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Símbolo (Ticker):</label>
              <input
                type="text"
                value={config.symbol}
                onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
              />
            </div>
          </div>

          {/* Premint if ERC20 */}
          {config.standard === 'ERC20' && (
            <div className="space-y-1 text-xs">
              <label className="text-slate-400">Emisión Inicial (Premint a initialOwner):</label>
              <input
                type="text"
                value={config.premint || ''}
                onChange={(e) => setConfig({ ...config, premint: e.target.value })}
                placeholder="1000000"
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#F7931A]"
              />
            </div>
          )}

          {/* Access Control Mode */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-medium">Control de Acceso (Access Control):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfig({ ...config, accessControl: 'ownable' })}
                className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                  config.accessControl === 'ownable'
                    ? 'bg-[#1E293B] text-white border-cyan-400'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800'
                }`}
              >
                <div className="font-bold">Ownable2Step</div>
                <div className="text-[10px] text-slate-400">Propietario único con traspaso en 2 pasos seguro</div>
              </button>
              <button
                onClick={() => setConfig({ ...config, accessControl: 'roles' })}
                className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                  config.accessControl === 'roles'
                    ? 'bg-[#1E293B] text-white border-cyan-400'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800'
                }`}
              >
                <div className="font-bold">AccessControl (Roles)</div>
                <div className="text-[10px] text-slate-400">Roles independientes (ADMIN, MINTER, PAUSER)</div>
              </button>
            </div>
          </div>

          {/* Extension Checkboxes */}
          <div className="space-y-2 text-xs pt-1">
            <label className="text-slate-400 font-medium">Extensiones de Funcionalidad:</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mintable}
                  onChange={(e) => setConfig({ ...config, mintable: e.target.checked })}
                  className="accent-[#F7931A]"
                />
                <span className="text-slate-200">Mintable (Acuñable)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.burnable}
                  onChange={(e) => setConfig({ ...config, burnable: e.target.checked })}
                  className="accent-[#F7931A]"
                />
                <span className="text-slate-200">Burnable (Quemable)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pausable}
                  onChange={(e) => setConfig({ ...config, pausable: e.target.checked })}
                  className="accent-[#F7931A]"
                />
                <span className="text-slate-200">Pausable (Emergencia)</span>
              </label>

              {config.standard === 'ERC20' && (
                <>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.permit}
                      onChange={(e) => setConfig({ ...config, permit: e.target.checked })}
                      className="accent-[#F7931A]"
                    />
                    <span className="text-slate-200">Permit (EIP-2612)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.votes}
                      onChange={(e) => setConfig({ ...config, votes: e.target.checked })}
                      className="accent-[#F7931A]"
                    />
                    <span className="text-slate-200">Votes (Gobernanza)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.flashMint}
                      onChange={(e) => setConfig({ ...config, flashMint: e.target.checked })}
                      className="accent-[#F7931A]"
                    />
                    <span className="text-slate-200">FlashMint (EIP-3156)</span>
                  </label>
                </>
              )}

              {config.standard === 'ERC721' && (
                <>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enumerable}
                      onChange={(e) => setConfig({ ...config, enumerable: e.target.checked })}
                      className="accent-[#F7931A]"
                    />
                    <span className="text-slate-200">Enumerable</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded bg-[#0F172A] border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.uriStorage}
                      onChange={(e) => setConfig({ ...config, uriStorage: e.target.checked })}
                      className="accent-[#F7931A]"
                    />
                    <span className="text-slate-200">URI Storage</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions into Workspace or Auditor */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('code-workspace')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Abrir en IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('security-auditor')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auditar con IA</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Security Invariants */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="text-[#F7931A] font-bold">{config.name}.sol</span>
                <span>·</span>
                <span className="text-slate-500">Solidity ^0.8.24</span>
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OpenZeppelin v5 Invariants Active</span>
              </span>
            </div>

            {/* Code Box */}
            <div className="bg-[#05080E] p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[460px] overflow-y-auto">
              <pre>{generated.solidityCode}</pre>
            </div>

            {/* OpenZeppelin v5 Architectural Innovations Note */}
            <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Invariantes y Cambios Clave en OpenZeppelin Contracts v5.0</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-slate-200">Hook Unificado `_update`:</strong> Reemplaza por completo los ganchos anteriores `_beforeTokenTransfer` y `_afterTokenTransfer`, reduciendo costos de gas y previniendo olvidos de invocación super.
                </li>
                <li>
                  <strong className="text-slate-200">Ownable2Step Recomendado:</strong> Protege de forma nativa frente al traspaso irrevocable a direcciones erróneas o contratos sin soporte de retiro.
                </li>
                <li>
                  <strong className="text-slate-200">Compatibilidad con Custom Errors:</strong> Reducción de tamaño del bytecode eliminando strings extensos de revert en favor de errores tipados.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
