import React from 'react';
import { QUANTUM_THREAT_MATRIX } from '../../services/knowledge/quantumDatabase';
import { Atom, Shield, AlertTriangle, CheckCircle2, FileText, Info } from 'lucide-react';

export const QuantumRadarView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Atom className="w-3.5 h-3.5" />
            <span>POST-QUANTUM CRYPTOGRAPHY & SHOR ALGORITHM ASSESSMENT</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">QUANTUM SECURITY RADAR</h1>
          <p className="text-xs text-slate-400">
            Monitoreo científico de avances en computación cuántica, criptoanálisis de curvas elípticas y propuestas de mitigación en Bitcoin.
          </p>
        </div>

        <div className="text-xs bg-[#0F172A] border border-cyan-950 p-2.5 rounded-lg max-w-sm text-slate-300">
          <strong className="text-cyan-400">Consenso Académico:</strong> No existe amenaza cuántica operativa inmediata para Bitcoin en la década actual. Los procesadores NISQ actuales carecen de qubits lógicos con corrección de errores requeridos para el algoritmo de Shor.
        </div>
      </div>

      {/* 4 Threat Risk Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Riesgo Teórico</div>
          <div className="text-sm font-semibold text-white">Algoritmo de Shor (1994)</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Resuelve logaritmos discretos en tiempo polinómico sobre secp256k1 si se dispone de una computadora cuántica tolerante a fallos (FTQC).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Riesgo Tecnológico</div>
          <div className="text-sm font-semibold text-cyan-400">Brecha de Ingeniería Física</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Romper secp256k1 en pocas horas requiere ~2,500 a 4,000 qubits lógicos estables (equivalentes a 10 a 20 millones de qubits físicos con corrección de superficie).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Riesgo Operativo</div>
          <div className="text-sm font-semibold text-emerald-400">Protección por Hash de Script</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Direcciones P2PKH / P2WPKH / P2TR que nunca han sido gastadas mantienen oculta la clave pública detrás de un doble hash SHA-256 + RIPEMD-160.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Estado de Investigación</div>
          <div className="text-sm font-semibold text-[#F7931A]">BIP 360 & NIST Post-Quantum</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Se estudian firmas basadas en retículos (Falcon, ML-DSA) y firmas hash (SPHINCS+) integrables mediante soft-fork a través de una nueva versión de testigo (SegWit v2).
          </p>
        </div>
      </div>

      {/* Detailed Cryptographic Primitives Matrix */}
      <div className="bg-[#0A0E17] border border-[#1E293B] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Matriz de Vulnerabilidad por Primitiva Criptográfica en Bitcoin</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono-nums">Estándares FIPS 203 / 204 / 205 (NIST)</span>
        </div>

        <div className="space-y-4">
          {QUANTUM_THREAT_MATRIX.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-300">{item.algorithm}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">Algoritmo Cuántico: {item.quantumAlgorithm}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                    item.estimatedRiskHorizon.includes('Bajo')
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  }`}
                >
                  HORIZONTE: {item.estimatedRiskHorizon.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                <strong className="text-slate-100">Vector de Ataque:</strong> {item.threatVector}
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <strong className="text-slate-100">Medidas de Mitigación en el Protocolo:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                  {item.mitigations.map((m, mIdx) => (
                    <li key={mIdx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded bg-[#080B10] border border-slate-900 text-[11px] text-slate-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">Dictamen Científico:</strong> {item.scientificConfidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
