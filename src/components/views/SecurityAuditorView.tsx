import React, { useState } from 'react';
import { SmartContractAuditor } from '../../services/security/smartContractAuditor';
import { AuditFinding } from '../../types';
import { Shield, Play, AlertTriangle, CheckCircle2, AlertOctagon, Info, FileCode, RefreshCw } from 'lucide-react';

const SAMPLE_VULNERABLE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableBankVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // Vulnerabilidad 1: Reentrancia (violación de patrón CEI)
    function withdrawAll() external {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Sin balance");

        // Llamada externa antes de actualizar balance
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Fallo transferencia");

        balances[msg.sender] = 0;
    }

    // Vulnerabilidad 2: tx.origin para autenticacion
    function emergencyDrain(address payable recipient) external {
        require(tx.origin == owner, "Solo owner via tx.origin");
        recipient.transfer(address(this).balance);
    }
}`;

export const SecurityAuditorView: React.FC = () => {
  const [sourceCode, setSourceCode] = useState<string>(SAMPLE_VULNERABLE_CODE);
  const [auditResult, setAuditResult] = useState<ReturnType<typeof SmartContractAuditor.analyzeSolidityCode> | null>(() =>
    SmartContractAuditor.analyzeSolidityCode(SAMPLE_VULNERABLE_CODE)
  );
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const result = SmartContractAuditor.analyzeSolidityCode(sourceCode);
      setAuditResult(result);
      setIsAuditing(false);
    }, 350);
  };

  const handleResetSample = () => {
    setSourceCode(SAMPLE_VULNERABLE_CODE);
    setAuditResult(SmartContractAuditor.analyzeSolidityCode(SAMPLE_VULNERABLE_CODE));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <Shield className="w-3.5 h-3.5" />
            <span>STATIC & HEURISTIC SMART CONTRACT SECURITY AUDITOR</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">AI SMART CONTRACT AUDITOR</h1>
          <p className="text-xs text-slate-400">
            Escaneo de vectores críticos: Reentrancy, manipulación de oráculos, tx.origin, delegatecall, CEI y flash loans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cargar Código de Prueba</span>
          </button>
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isAuditing ? 'Auditando...' : 'Ejecutar Auditoría'}</span>
          </button>
        </div>
      </div>

      {/* Code Input Box */}
      <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">Código Fuente Solidity a Auditar</span>
          <span className="font-mono">{sourceCode.split('\n').length} líneas</span>
        </div>
        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          rows={10}
          className="w-full bg-[#05080E] font-mono text-xs text-slate-200 border border-slate-800 rounded-lg p-3 leading-relaxed focus:outline-none focus:border-rose-500"
          placeholder="Pega aquí tu contrato inteligente Solidity..."
        />
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3.5 rounded-lg bg-[#0C1322] border border-amber-900/60 text-xs text-amber-300 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Preliminary AI Security Review:</strong> Esta herramienta proporciona asistencia técnica automatizada mediante análisis estático y heurístico de vulnerabilidades. Bajo ninguna circunstancia sustituye una auditoría de seguridad formal realizada por una firma especializada independiente.
        </span>
      </div>

      {/* Audit Findings Results */}
      {auditResult && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Resultados del Análisis Preliminar de Seguridad
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{auditResult.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-mono-nums font-bold text-white">
                  {auditResult.securityScore}
                </span>
                <span className="text-sm font-mono text-slate-500">/ 100</span>
                <div className="text-[10px] text-slate-400">Score Preliminar</div>
              </div>
            </div>
          </div>

          {/* Finding Cards */}
          <div className="space-y-4">
            {auditResult.findings.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : f.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : f.severity === 'MEDIUM'
                          ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="font-mono text-slate-400">{f.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300 font-medium">{f.location}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white">{f.title}</h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {f.explanation}
                </p>

                {f.attackScenario !== 'N/A' && (
                  <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-rose-400 uppercase text-[10px]">Escenario de Explotación (PoC Teórico)</span>
                    <p className="text-slate-300 leading-relaxed">{f.attackScenario}</p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-emerald-400 uppercase text-[10px]">Remediación Recomendada</span>
                  <p className="text-slate-300 leading-relaxed">{f.remediation}</p>

                  <div className="bg-[#05080E] p-3 rounded font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-900 leading-relaxed">
                    <pre>{f.fixedCodeSnippet}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
