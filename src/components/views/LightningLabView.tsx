import React, { useState } from 'react';
import { Zap, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LightningLabView: React.FC = () => {
  const [nodeABalance, setNodeABalance] = useState(500000); // 500k sats
  const [nodeBBalance, setNodeBBalance] = useState(500000); // 500k sats
  const [paymentAmount, setPaymentAmount] = useState(100000); // 100k sats
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const channelCapacity = 1000000; // 1M sats fixed

  const sendPayment = (fromAtoB: boolean) => {
    if (fromAtoB) {
      if (nodeABalance < paymentAmount) {
        setStatusMessage('Error: Saldo local en Nodo A insuficiente para enrutar el pago.');
        return;
      }
      setNodeABalance((prev) => prev - paymentAmount);
      setNodeBBalance((prev) => prev + paymentAmount);
      setStatusMessage(`Pago HTLC de ${paymentAmount.toLocaleString()} sats liquidado exitosamente de Alice a Bob.`);
    } else {
      if (nodeBBalance < paymentAmount) {
        setStatusMessage('Error: Saldo local en Nodo B insuficiente para enrutar el pago.');
        return;
      }
      setNodeBBalance((prev) => prev - paymentAmount);
      setNodeABalance((prev) => prev + paymentAmount);
      setStatusMessage(`Pago HTLC de ${paymentAmount.toLocaleString()} sats liquidado exitosamente de Bob a Alice.`);
    }
  };

  const resetChannel = () => {
    setNodeABalance(500000);
    setNodeBBalance(500000);
    setStatusMessage('Canal restablecido a equilibrio inicial 50/50.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>LAYER 2 SCALING & PAYMENT CHANNELS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">LIGHTNING NETWORK LAB</h1>
          <p className="text-xs text-slate-400">
            Laboratorio interactivo de canales de pago bidireccionales, contratos HTLC, liquidez y mitigación de channel jamming.
          </p>
        </div>

        <button
          onClick={resetChannel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Canal</span>
        </button>
      </div>

      {/* Interactive Channel Simulator */}
      <div className="p-6 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Simulador de Canal Bidireccional (Capacidad Total: 1,000,000 sats)
          </h2>
          <span className="text-xs font-mono text-slate-400">Commitment Transactions Off-Chain</span>
        </div>

        {/* Visual Liquidity Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono-nums">
            <span className="text-[#F7931A] font-semibold">Alice (Local): {nodeABalance.toLocaleString()} sats</span>
            <span className="text-cyan-400 font-semibold">Bob (Remoto): {nodeBBalance.toLocaleString()} sats</span>
          </div>
          <div className="w-full h-4 bg-[#080B10] rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-[#F7931A] transition-all duration-300"
              style={{ width: `${(nodeABalance / channelCapacity) * 100}%` }}
            />
            <div
              className="bg-cyan-400 transition-all duration-300"
              style={{ width: `${(nodeBBalance / channelCapacity) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <span className="text-slate-400 whitespace-nowrap">Monto del Pago:</span>
            <select
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="bg-[#0A0E17] border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
            >
              <option value={25000}>25,000 sats (~$24)</option>
              <option value={50000}>50,000 sats (~$48)</option>
              <option value={100000}>100,000 sats (~$96)</option>
              <option value={250000}>250,000 sats (~$241)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => sendPayment(true)}
              className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg bg-[#F7931A] hover:bg-[#e08213] text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Alice ➔ Bob</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendPayment(false)}
              className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Bob ➔ Alice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMessage.includes('Error')
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Theoretical Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2 text-xs">
          <h3 className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>HTLC (Hash Time-Locked Contract)</span>
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Permite enrutar pagos atómicos a través de múltiples saltos (hop A → B → C → D). El destinatario final revela el secreto (pre-imagen del hash criptográfico) para reclamar los fondos, liquidando simultáneamente todos los canales intermedios.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2 text-xs">
          <h3 className="font-bold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#F7931A]" />
            <span>Tarifas de Enrutamiento & Liquidez</span>
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Los nodos de enrutamiento cobran una tarifa base mínima fija (base fee en millisats) y una tarifa proporcional (ppm: partes por millón). Rebalancear la liquidez local y remota es crítico para mantener la capacidad de enrutamiento bidireccional.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#1E293B] space-y-2 text-xs">
          <h3 className="font-bold text-white flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Channel Jamming & Mitigaciones</span>
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Ataque donde un adversario bloquea los slots HTLC concurrentes de un canal sin completar pagos, consumiendo liquidez temporal. Se mitiga mediante tarifas por intento no reembolsables (upfront fees) y sistemas de reputación entre nodos.
          </p>
        </div>
      </div>
    </div>
  );
};
