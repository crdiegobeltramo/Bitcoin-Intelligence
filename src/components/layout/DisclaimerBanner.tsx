import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#0C1322] border-b border-[#1E293B] px-4 py-2 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#F7931A] shrink-0" />
          <span>
            <strong className="text-slate-200 font-medium">Aviso de Responsabilidad Profesional:</strong> Esta plataforma proporciona análisis técnico, inteligencia de red y herramientas educativas. No constituye asesoramiento financiero, jurídico, contable ni fiscal. No custodia claves privadas ni ejecuta transacciones financieras reales sin confirmación expresa.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
          aria-label="Cerrar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
