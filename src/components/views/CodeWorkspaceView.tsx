import React, { useState } from 'react';
import {
  FolderGit2,
  FileCode,
  Folder,
  Play,
  CheckCircle2,
  Terminal,
  Bot,
  Sparkles,
  Zap,
  Shield,
  FileText,
  Copy
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

const INITIAL_FILE_TREE: FileNode[] = [
  {
    id: 'contracts',
    name: 'contracts',
    type: 'folder',
    children: [
      {
        id: 'contracts/BitcoinOracleAMM.sol',
        name: 'BitcoinOracleAMM.sol',
        type: 'file',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BitcoinOracleAMM is ReentrancyGuard {
    IERC20 public immutable btcToken;
    IERC20 public immutable usdcToken;

    uint256 public reserveBtc;
    uint256 public reserveUsdc;

    constructor(address _btc, address _usdc) {
        btcToken = IERC20(_btc);
        usdcToken = IERC20(_usdc);
    }

    function swapBtcForUsdc(uint256 btcIn, uint256 minUsdcOut) external nonReentrant returns (uint256 usdcOut) {
        require(btcIn > 0, "Monto invalido");
        // Invariante x * y = k con 0.3% fee
        uint256 btcWithFee = btcIn * 997;
        usdcOut = (reserveUsdc * btcWithFee) / ((reserveBtc * 1000) + btcWithFee);
        require(usdcOut >= minUsdcOut, "Slippage excesivo");

        reserveBtc += btcIn;
        reserveUsdc -= usdcOut;

        require(btcToken.transferFrom(msg.sender, address(this), btcIn), "Fallo transfer in");
        require(usdcToken.transfer(msg.sender, usdcOut), "Fallo transfer out");
    }
}`,
      },
      {
        id: 'contracts/VaultTimelock.sol',
        name: 'VaultTimelock.sol',
        type: 'file',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VaultTimelock {
    uint256 public constant TIMELOCK_DELAY = 48 hours;
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}`,
      },
    ],
  },
  {
    id: 'test',
    name: 'test',
    type: 'folder',
    children: [
      {
        id: 'test/AMM.test.ts',
        name: 'AMM.test.ts',
        type: 'file',
        content: `import { expect } from "chai";
import { ethers } from "hardhat";

describe("BitcoinOracleAMM", function () {
  it("Deberia rechazar swap si slippage supera minUsdcOut", async function () {
    // Test suite simulation
    expect(true).to.be.true;
  });
});`,
      },
    ],
  },
  {
    id: 'scripts',
    name: 'scripts',
    type: 'folder',
    children: [
      {
        id: 'scripts/deploy.ts',
        name: 'deploy.ts',
        type: 'file',
        content: `import { ethers } from "hardhat";

async function main() {
  console.log("Iniciando despliegue de contratos en L2...");
}

main().catch(console.error);`,
      },
    ],
  },
];

export const CodeWorkspaceView: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState('contracts/BitcoinOracleAMM.sol');
  const [editorContent, setEditorContent] = useState(
    INITIAL_FILE_TREE[0].children![0].content!
  );
  const [activeBottomTab, setActiveBottomTab] = useState<'OUTPUT' | 'AI_ASSISTANT'>('OUTPUT');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '[Foundry v0.2.0]\n$ forge test\n[PASS] test/AMM.test.ts:swapBtcForUsdc() (gas: 74210)\nTest result: ok. 1 passed; 0 failed; finished in 14.2ms'
  );
  const [aiAssistantReply, setAiAssistantReply] = useState<string>(
    'El contrato actual implementa la fórmula de producto constante con una comisión del 0.3% (997/1000). Cuenta con protección nonReentrant. Recomendación: sustituir transfer/transferFrom directos por SafeERC20 para prevenir bloqueos con tokens no estándar como USDT.'
  );

  const handleSelectFile = (file: FileNode) => {
    if (file.content !== undefined) {
      setSelectedFileId(file.id);
      setEditorContent(file.content);
    }
  };

  const handleAction = (action: string) => {
    if (action === 'Explain code') {
      setActiveBottomTab('AI_ASSISTANT');
      setAiAssistantReply(
        `Explicación de "${selectedFileId}":\nEste contrato define un mecanismo de intercambio automático de tokens. Utiliza el invariante de producto constante (x · y = k) para determinar el precio de ejecución de forma endógena según las reservas disponibles.`
      );
    } else if (action === 'Optimize gas') {
      setActiveBottomTab('AI_ASSISTANT');
      setAiAssistantReply(
        `Optimización de Gas:\n1. Declarar variables constantes e inmutables para reducir lecturas SLOAD.\n2. Reemplazar cadenas revert("...") por errores personalizados 'error InsufficientOutput(uint256 got, uint256 min);' ahorrando ~50 gas por llamada fallida.\n3. Habilitar optimizador de Solidity en 200 runs.`
      );
    } else if (action === 'Audit') {
      setActiveBottomTab('AI_ASSISTANT');
      setAiAssistantReply(
        `Auditoría Rápida de Workspace:\n- Invariantes: ReentrancyGuard presente.\n- Observación: Se recomienda usar SafeERC20.safeTransfer en lugar de transfer plano.\n- Checks-Effects-Interactions: Los estados internos (reserveBtc y reserveUsdc) se actualizan antes de las transferencias externas. Conforme a CEI.`
      );
    } else if (action === 'Generate test') {
      setActiveBottomTab('OUTPUT');
      setTerminalOutput(
        `[Foundry Test Generator]\nGenerando suite de prueba basada en propiedades (Fuzzing)...\nArchivo creado: test/FuzzAMM.t.sol\n$ forge test --match-contract FuzzAMM\nRunning 256 fuzz test cases...\n[PASS] testFuzz_ConstantProductInvariant(uint256) (runs: 256, μ: 64120, ~: 64120)`
      );
    } else if (action === 'Run tests') {
      setActiveBottomTab('OUTPUT');
      setTerminalOutput(
        `$ forge test --gas-report\nCompiler run successful!\n| Contract          | Method           | Min  | Avg   | Max   |\n| BitcoinOracleAMM  | swapBtcForUsdc   | 6842 | 74210 | 78900 |\nRan 3 test suites: 3 passed, 0 failed.`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>CLOUD IDE & SMART CONTRACT WORKBENCH</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">WEB3 CODE WORKSPACE</h1>
          <p className="text-xs text-slate-400">
            Editor modular con árbol de archivos, asistente de código IA, auditoría estática y salida de compilación.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleAction('Run tests')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1E293B] hover:bg-slate-700 text-white rounded-md transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ejecutar Tests</span>
          </button>
          <button
            onClick={() => handleAction('Audit')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1E293B] hover:bg-slate-700 text-white rounded-md transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Auditar</span>
          </button>
          <button
            onClick={() => handleAction('Optimize gas')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1E293B] hover:bg-slate-700 text-white rounded-md transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Optimizar Gas</span>
          </button>
          <button
            onClick={() => handleAction('Explain code')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#F7931A] hover:bg-[#e08213] text-white rounded-md transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Explicar Código</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: File Tree + Code Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[460px]">
        {/* Left Column: File Tree */}
        <div className="md:col-span-3 bg-[#0A0E17] border border-[#1E293B] rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Explorador de Archivos</span>
            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="space-y-1 text-xs">
            {INITIAL_FILE_TREE.map((folder) => (
              <div key={folder.id} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold px-2 py-1">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{folder.name}</span>
                </div>
                {folder.children?.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => handleSelectFile(file)}
                      className={`w-full flex items-center gap-2 pl-6 pr-2 py-1 rounded text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#1E293B] text-[#F7931A] font-medium'
                          : 'text-slate-400 hover:text-white hover:bg-[#0F172A]'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="md:col-span-9 bg-[#0A0E17] border border-[#1E293B] rounded-xl flex flex-col overflow-hidden">
          {/* Editor Tab Bar */}
          <div className="bg-[#0C1322] border-b border-[#1E293B] px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <FileCode className="w-4 h-4 text-[#F7931A]" />
              <span>{selectedFileId}</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Solidity ^0.8.24</span>
          </div>

          {/* Editor Body */}
          <div className="flex-1 bg-[#05080E] p-4 font-mono text-xs text-slate-200 overflow-auto leading-relaxed">
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full h-full min-h-[360px] bg-transparent text-slate-200 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom Panel: Terminal Output & AI Assistant Tabs */}
      <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl overflow-hidden">
        <div className="bg-[#0C1322] border-b border-[#1E293B] px-4 py-1.5 flex items-center gap-4 text-xs">
          <button
            onClick={() => setActiveBottomTab('OUTPUT')}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              activeBottomTab === 'OUTPUT'
                ? 'text-[#F7931A] font-bold border-b-2 border-[#F7931A]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Test / Build Output</span>
          </button>
          <button
            onClick={() => setActiveBottomTab('AI_ASSISTANT')}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              activeBottomTab === 'AI_ASSISTANT'
                ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Development Copilot</span>
          </button>
        </div>

        <div className="p-4 bg-[#080B10] font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
          {activeBottomTab === 'OUTPUT' ? (
            <pre className="text-emerald-400 whitespace-pre-wrap">{terminalOutput}</pre>
          ) : (
            <pre className="text-slate-300 whitespace-pre-wrap">{aiAssistantReply}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
