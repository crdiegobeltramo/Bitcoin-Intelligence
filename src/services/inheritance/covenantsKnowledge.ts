/**
 * BITCOIN INHERITANCE — COVENANTS AUDIT & EVALUATION MATRIX
 * Strict gating: No proposed covenant is active on Bitcoin Mainnet.
 */

import { CovenantEvaluation } from './types';

export const BITCOIN_COVENANTS_MATRIX: CovenantEvaluation[] = [
  {
    proposalName: 'OP_CHECKTEMPLATEVERIFY (CTV)',
    bipNumber: 'BIP 119',
    status: 'TESTNET_INQUISITION',
    mechanism: 'Restringe los outputs hacia los cuales un UTXO puede ser gastado mediante el hash del template de la transacción.',
    inheritanceUsefulness:
      'Permite programar árboles de herencia deterministas donde los fondos solo pueden fluir hacia direcciones pre-acordadas de los herederos sin necesidad de transacciones prefirmadas.',
    mainnetRisk:
      'CRÍTICO: NO ESTÁ ACTIVADO EN MAINNET. Usar este opcode en mainnet resultará en quema irreversible de fondos (OP_NOP4 no vinculante o falla de transacción).',
    isMainnetSafe: false,
    alternativeCompatibleDesign:
      'Utilizar Miniscript P2WSH o P2TR con timelocks estándar (CLTV/CSV) combinados con esquemas multisig N-de-M y descriptores compatibles.',
  },
  {
    proposalName: 'OP_VAULT',
    bipNumber: 'BIP 345',
    status: 'DRAFT_BIP',
    mechanism: 'Diseñado específicamente para custodias y bóvedas con período de desahucio (recovery delay) y autorización forzada.',
    inheritanceUsefulness:
      'Ideal para planes sucesorios con botón de pánico: si un heredero inicia el reclamo, el titular tiene X días para revocar hacia una cold-key.',
    mainnetRisk:
      'NO ACTIVADO EN MAINNET. Requiere soft fork junto con CTV u opcode similar para introspección de transacción.',
    isMainnetSafe: false,
    alternativeCompatibleDesign:
      'Simular vault sucesorio con timelock relativo (OP_CHECKSEQUENCEVERIFY en P2WSH/Taproot) donde el titular mantiene la vía de barrido prioritario.',
  },
  {
    proposalName: 'OP_CAT (Concatenación de Script)',
    bipNumber: 'BIP 347',
    status: 'DRAFT_BIP',
    mechanism: 'Restaura el opcode OP_CAT de Satoshi para concatenar strings en la pila de evaluación de Script.',
    inheritanceUsefulness:
      'Permite introspección de transacción y covenants generalizados para verificar montos, destinos y condiciones de herencia en cadena.',
    mainnetRisk:
      'PROPUESTA EN DEBATE: Solo desplegado en Signet / Inquisition. Cualquier script con OP_CAT fallará en nodos estándar de mainnet.',
    isMainnetSafe: false,
    alternativeCompatibleDesign:
      'Diseñar el plan sucesorio con Miniscript y firmas de umbral Schnorr (MuSig2) en Taproot estándar.',
  },
  {
    proposalName: 'LNHANCE (CTV + CSFS + INTERNALKEY)',
    bipNumber: 'BIP Draft',
    status: 'RESEARCH_ONLY',
    mechanism: 'Combinación minimalista de opcodes para introspección e intercambio de scripts.',
    inheritanceUsefulness:
      'Políticas de gasto avanzadas para LN y micro-herencias directas a canales de pago.',
    mainnetRisk: 'EXPERIMENTAL. No disponible en consenso.',
    isMainnetSafe: false,
    alternativeCompatibleDesign:
      'Flujo estándar de PSBT pre-firmadas o timelocks CLTV convencionales.',
  },
  {
    proposalName: 'SIGHASH_ANYPREVOUT (APO)',
    bipNumber: 'BIP 118',
    status: 'DRAFT_BIP',
    mechanism: 'Permite firmas válidas independientemente del txid/vout previo específico que se esté gastando.',
    inheritanceUsefulness:
      'Permite reutilizar transacciones sucesorias prefirmadas incluso si el titular consolida o mueve UTXOs intermedios.',
    mainnetRisk:
      'NO DISPONIBLE EN MAINNET. Si se intenta gastar una tx prefirmada tradicional cuando el UTXO cambió, la firma se INVALIDA.',
    isMainnetSafe: false,
    alternativeCompatibleDesign:
      'Regla de oro: Si el titular consolida o gasta el UTXO monitoreado, DEBE regenerar y refirmar el PSBT sucesorio inmediatamente.',
  },
];

/**
 * Validates whether a policy requires non-consensus features
 */
export function verifyCovenantConsensusCompliance(scriptOpcodes: string[]): {
  isConsensusCompliant: boolean;
  unsupportedOpcodes: string[];
  warningMessage?: string;
} {
  const NON_MAINNET_OPCODES = ['OP_CHECKTEMPLATEVERIFY', 'OP_VAULT', 'OP_CAT', 'OP_CHECKSIGFROMSTACK'];
  const unsupported = scriptOpcodes.filter((op) => NON_MAINNET_OPCODES.includes(op.toUpperCase()));

  if (unsupported.length > 0) {
    return {
      isConsensusCompliant: false,
      unsupportedOpcodes: unsupported,
      warningMessage: `ADVERTENCIA CRÍTICA: Se detectaron opcodes (${unsupported.join(', ')}) que no forman parte del consenso activo de Bitcoin Mainnet. Estas operaciones están BLOQUEADAS para despliegue en producción.`,
    };
  }

  return {
    isConsensusCompliant: true,
    unsupportedOpcodes: [],
  };
}
