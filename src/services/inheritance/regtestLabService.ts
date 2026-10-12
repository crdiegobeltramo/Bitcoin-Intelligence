/**
 * BITCOIN INHERITANCE — REGTEST & TESTNET LAB
 * Generates verified bitcoin-cli commands and step-by-step consensus simulation scenarios.
 */

import { InheritancePlan } from './types';

export interface LabStep {
  stepNumber: number;
  title: string;
  command: string;
  description: string;
  expectedResult: string;
  canCopy: boolean;
}

export function generateRegtestCommands(plan: InheritancePlan): LabStep[] {
  const descriptor = plan.policy.descriptorWsh.replace(/"/g, '\\"');
  const blocks = plan.timelock.relativeBlocksCount || 144;

  return [
    {
      stepNumber: 1,
      title: 'Iniciar Nodo Regtest de Bitcoin Core',
      command: `bitcoind -regtest -daemon -fallbackfee=0.0001`,
      description: 'Inicia un entorno de consenso local aislado para pruebas instantáneas sin gastar satoshis reales.',
      expectedResult: 'Bitcoin Core server starting',
      canCopy: true,
    },
    {
      stepNumber: 2,
      title: 'Crear Wallet Descriptor en Modo Watch-Only',
      command: `bitcoin-cli -regtest createwallet "inheritance_lab" true true "" false true`,
      description: 'Crea una wallet descriptor sin claves privadas locales (watch-only) con soporte BIP 380.',
      expectedResult: '{\n  "name": "inheritance_lab",\n  "warning": ""\n}',
      canCopy: true,
    },
    {
      stepNumber: 3,
      title: 'Importar el Output Descriptor de la Herencia',
      command: `bitcoin-cli -regtest -rpcwallet=inheritance_lab importdescriptors '[{"desc": "${descriptor}", "timestamp": "now", "active": false}]'`,
      description: 'Registra el script Miniscript con su checksum oficial en el nodo para rastrear UTXOs y balances.',
      expectedResult: '[\n  {\n    "success": true\n  }\n]',
      canCopy: true,
    },
    {
      stepNumber: 4,
      title: 'Minar Bloques de Fondos y Generar UTXO de Prueba',
      command: `bitcoin-cli -regtest generatetoaddress 101 $(bitcoin-cli -regtest getnewaddress)`,
      description: 'Mina 101 bloques para madurar la recompensa de coinbase y disponer de satoshis para financiar el script sucesorio.',
      expectedResult: '[\n  "blockhash_...\n]',
      canCopy: true,
    },
    {
      stepNumber: 5,
      title: 'Probar Gasto Anticipado del Beneficiario (Fallo Esperado)',
      command: `bitcoin-cli -regtest sendrawtransaction "<raw_heir_signed_tx_hex>"`,
      description: 'Se intenta transmitir la transacción del heredero ANTES de cumplir el timelock. El nodo debe rechazarla por reglas de consenso.',
      expectedResult: 'error code: -26\nerror message: non-BIP68-final (o non-final tx timelock unreached)',
      canCopy: true,
    },
    {
      stepNumber: 6,
      title: 'Avanzar la Blockchain para Satisfacer el Timelock',
      command: `bitcoin-cli -regtest generatetoaddress ${blocks + 1} $(bitcoin-cli -regtest getnewaddress)`,
      description: `Mina ${blocks + 1} bloques para superar el retardo relativo OP_CHECKSEQUENCEVERIFY (${blocks} bloques) o el CLTV.`,
      expectedResult: `Mina satisfactoriamente ${blocks + 1} bloques. La altura de la cadena avanza.`,
      canCopy: true,
    },
    {
      stepNumber: 7,
      title: 'Transmitir Transacción del Beneficiario (Éxito)',
      command: `bitcoin-cli -regtest sendrawtransaction "<raw_heir_signed_tx_hex>"`,
      description: 'Con el timelock cumplido, el nodo valida los opcodes Miniscript y acepta la transacción en la mempool.',
      expectedResult: '"7a2b9e4f8d...txid_confirmado"',
      canCopy: true,
    },
    {
      stepNumber: 8,
      title: 'Minar Bloque de Confirmación Final',
      command: `bitcoin-cli -regtest generatetoaddress 1 $(bitcoin-cli -regtest getnewaddress)`,
      description: 'Se incluye la transacción sucesoria en un bloque válido. Los fondos quedan en la dirección del heredero.',
      expectedResult: '[\n  "blockhash_final_confirmation"\n]',
      canCopy: true,
    },
  ];
}
