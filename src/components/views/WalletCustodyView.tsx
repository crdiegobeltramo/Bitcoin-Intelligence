import React, { useState } from 'react';
import { Key, ShieldCheck, CheckSquare, Square, AlertTriangle, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export const WalletCustodyView: React.FC = () => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'item-seed-offline': true,
    'item-hardware': true,
    'item-passphrase': true,
    'item-multisig': false,
    'item-test-restore': false,
    'item-metal-backup': true,
    'item-inheritance-plan': false,
    'item-watch-only': true,
  });

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems = [
    { id: 'item-seed-offline', label: 'Semilla (12/24 palabras) generada exclusivamente en dispositivo desconectado (Cold Storage / Air-gapped)', impact: 'Crítico' },
    { id: 'item-hardware', label: 'Uso de Hardware Wallet de código abierto o verificable con chip de elemento seguro', impact: 'Crítico' },
    { id: 'item-passphrase', label: 'BIP 39 Passphrase ("palabra 25") para protección contra coerción física y negación plausible', impact: 'Alto' },
    { id: 'item-metal-backup', label: 'Copia de respaldo en placa metálica (acero inoxidable / titanio) resistente a incendio y agua', impact: 'Alto' },
    { id: 'item-test-restore', label: 'Prueba de restauración de semilla realizada antes de depositar fondos significativos', impact: 'Alto' },
    { id: 'item-multisig', label: 'Esquema multifirma M-de-N (ej. 2-de-3 con fabricantes y ubicaciones geográficas distintas)', impact: 'Medio/Avanzado' },
    { id: 'item-watch-only', label: 'Uso de billetera Watch-Only con Descriptor Wallet / xpub en computadora de uso diario', impact: 'Medio' },
    { id: 'item-inheritance-plan', label: 'Protocolo de herencia y traspaso generacional no custodiado documentado con Miniscript o timelock', impact: 'Medio' },
  ];

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const securityScorePercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F7931A]">
            <Key className="w-3.5 h-3.5" />
            <span>SOVEREIGN STORAGE & THREAT MODELING</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">WALLET & CUSTODY INTELLIGENCE</h1>
          <p className="text-xs text-slate-400">
            Modelos de autocustodia soberana, Miniscript, PSBT, Descriptores y verificación de seguridad.
          </p>
        </div>

        {/* Absolute Zero-Custody Rule */}
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/80 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>REGLA INQUEBRANTABLE: Esta aplicación NUNCA solicitará semillas, claves privadas ni passwords.</span>
        </div>
      </div>

      {/* Main Two-Pane: Concepts and Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Checklist */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F7931A]" />
                <span>WALLET SECURITY CHECKLIST</span>
              </h2>
              <p className="text-xs text-slate-400">Audita la robustez de tu esquema de autocustodia.</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-mono-nums font-bold text-white">{securityScorePercent}%</span>
              <div className="text-[10px] text-slate-400">Solidez de Custodia</div>
            </div>
          </div>

          <div className="space-y-2">
            {checklistItems.map((item) => {
              const isChecked = !!checklist[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#0F172A] border-slate-700'
                      : 'bg-[#080B10] border-slate-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <button className="mt-0.5 text-[#F7931A]">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
                  </button>
                  <div className="text-xs flex-1">
                    <span className={isChecked ? 'text-slate-100 font-medium' : 'text-slate-400'}>
                      {item.label}
                    </span>
                    <span className="ml-2 text-[10px] font-mono text-[#F7931A]">[{item.impact}]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Modern Architecture Stack */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Arquitectura Avanzada de Custodia Bitcoin</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="font-semibold text-white">Miniscript & Descriptores de Salida (Output Descriptors)</span>
              <p className="text-slate-300">
                Miniscript estructura el lenguaje de script de Bitcoin en un formato determinista y componible matemáticamente. Permite verificar formalmente políticas de gasto complejas antes de enviar fondos.
              </p>
              <div className="bg-[#080B10] p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto">
                wsh(or_d(pk(key_user),and_v(v:pkh(key_heir),older(52560))))
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="font-semibold text-white">PSBT — BIP 174 (Partially Signed Bitcoin Transactions)</span>
              <p className="text-slate-300">
                Estandariza el intercambio de transacciones sin firmar o parcialmente firmadas entre billeteras de software (coordinadores) y hardware wallets air-gapped vía tarjeta MicroSD o códigos QR animados (UR).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="font-semibold text-white">Taproot Multisig (MuSig2 / BIP 327)</span>
              <p className="text-slate-300">
                Las firmas agregadas MuSig2 sobre Schnorr permiten que un esquema multifirma 3-de-3 se liquide en la red con una sola firma de 64 bytes indistinguible de una clave individual, maximizando la privacidad y abaratando un 60% las comisiones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
