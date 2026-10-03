import React, { useState } from 'react';
import { Boxes, ArrowRight, Code2, Database, Shield, CheckCircle } from 'lucide-react';

export const ProtocolExplorerView: React.FC = () => {
  const [selectedScriptType, setSelectedScriptType] = useState<'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2TR'>('P2TR');

  const scriptDetails = {
    P2PKH: {
      name: 'Pay-to-Public-Key-Hash (Legacy / Dirección 1...)',
      lockingScript: 'OP_DUP OP_HASH160 <PubKeyHash> OP_EQUALVERIFY OP_CHECKSIG',
      unlockingScript: '<Sig> <PubKey>',
      weight: 'Base 148 vBytes',
      pros: 'Soporte universal en todo el ecosistema histórico.',
      cons: 'Mayor peso en bloque, sin descuento de witness, maleabilidad de tx.',
    },
    P2SH: {
      name: 'Pay-to-Script-Hash (BIP 16 / Dirección 3...)',
      lockingScript: 'OP_HASH160 <ScriptHash> OP_EQUAL',
      unlockingScript: '<Signatures...> <RedeemScript>',
      weight: 'Base ~200-300 vBytes según multifirma',
      pros: 'Permite multifirmas complejas trasladando el costo al emisor que gasta.',
      cons: 'El script de redención completo se expone públicamente al gastarse.',
    },
    P2WPKH: {
      name: 'Pay-to-Witness-Public-Key-Hash (Native SegWit / bc1q...)',
      lockingScript: '0 <20-byte-PubKeyHash>',
      unlockingScript: 'Testigo: <Sig> <PubKey>',
      weight: '~68 vBytes (Descuento del 75% en datos witness)',
      pros: 'Inmune a la maleabilidad de transacciones, 40% más económico que Legacy.',
      cons: 'Requiere soporte de bech32.',
    },
    P2TR: {
      name: 'Pay-to-Taproot (SegWit v1 / BIP 341 / bc1p...)',
      lockingScript: 'OP_1 <32-byte-XOnlyPubKey>',
      unlockingScript: 'Testigo: <SchnorrSig> (64 bytes fijos) o <ControlBlock + ScriptLeaf>',
      weight: '~57.5 vBytes en gasto por clave simple',
      pros: 'Firmas Schnorr de 64 bytes fijos, indistinguibilidad de multisig (MuSig2) con single-sig, árboles MAST con ramas ocultas.',
      cons: 'Requiere soporte bech32m.',
    },
  };

  const current = scriptDetails[selectedScriptType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Boxes className="w-3.5 h-3.5" />
            <span>BITCOIN PROTOCOL & SCRIPT VISUALIZER</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">EXPLORADOR UTXO & SCRIPT LAB</h1>
          <p className="text-xs text-slate-400">
            Comprensión interactiva del modelo UTXO, anatomía de transacciones y evolución de scripts (P2PKH a Taproot).
          </p>
        </div>
      </div>

      {/* Visual Transaction Pipeline */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Flujo de Validación Criptográfica de una Transacción Bitcoin
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Inputs */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#F7931A]">1. INPUTS (UTXOs Previos)</span>
              <Database className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono-nums">
              <div>TxID: 4a5e1e...89f2:0</div>
              <div>Valor: 1.50000000 BTC</div>
              <div>Secuencia: 0xffffffff</div>
            </div>
            <div className="p-2 rounded bg-[#080B10] text-[11px] font-mono text-slate-400 border border-slate-900">
              Witness / ScriptSig de desbloqueo provisto por el remitente
            </div>
          </div>

          {/* Script Execution Engine */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-cyan-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">2. MÁQUINA DE PILA (STACK)</span>
              <Code2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="text-cyan-200 font-mono">OP_CHECKSIG / Tapscript</div>
              <p className="text-[11px] text-slate-400">
                La pila evalúa la firma digital contra la clave pública y el hash del mensaje de la transacción (Sighash).
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Resultado: TRUE (Válido)</span>
            </div>
          </div>

          {/* Outputs */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">3. OUTPUTS (Nuevos UTXOs)</span>
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono-nums">
              <div>Output 0: 0.25000000 BTC → Destinatario</div>
              <div>Output 1: 1.24991000 BTC → Cambio (Usuario)</div>
              <div>Tarifa minero: 0.00009000 BTC (12 sat/vB)</div>
            </div>
            <div className="p-2 rounded bg-[#080B10] text-[11px] font-mono text-slate-400 border border-slate-900">
              Nuevas condiciones scriptPubKey grabadas en el estado inmutable
            </div>
          </div>
        </div>
      </div>

      {/* Script Standard Comparator */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Comparativa de Tipos de Script en Bitcoin</h2>
          <div className="flex items-center gap-1 p-1 bg-[#0F172A] rounded-lg border border-slate-800">
            {(['P2PKH', 'P2SH', 'P2WPKH', 'P2TR'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedScriptType(type)}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  selectedScriptType === type
                    ? 'bg-[#1E293B] text-[#F7931A] font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white">{current.name}</div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Locking Script (scriptPubKey)</span>
              <div className="p-2 rounded bg-[#080B10] font-mono text-xs text-amber-300 border border-slate-900 overflow-x-auto">
                {current.lockingScript}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Unlocking Script (Witness/ScriptSig)</span>
              <div className="p-2 rounded bg-[#080B10] font-mono text-xs text-cyan-300 border border-slate-900 overflow-x-auto">
                {current.unlockingScript}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Peso Estimado:</span>{' '}
              <strong className="text-white font-mono">{current.weight}</strong>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold">Ventajas Técnicas:</span>{' '}
              <span className="text-slate-300">{current.pros}</span>
            </div>
            <div>
              <span className="text-rose-400 font-semibold">Limitaciones o Costos:</span>{' '}
              <span className="text-slate-300">{current.cons}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
