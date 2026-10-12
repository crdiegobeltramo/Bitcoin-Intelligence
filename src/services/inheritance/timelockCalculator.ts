/**
 * BITCOIN INHERITANCE — TIMELOCK CALCULATOR & CONSENSUS RULES
 * Accurate calculation for BIP 65 (CLTV), BIP 112 (CSV), BIP 68 (nSequence) and MTP
 */

import { TimelockConfig, TimelockType, InheritanceModality } from './types';

// Reference estimated block height in 2026 (Halving April 2024 was at 840,000)
// ~52,560 blocks per year -> ~945,000 in late 2026
export const CURRENT_ESTIMATED_BLOCK_HEIGHT = 896450;
export const AVERAGE_SECONDS_PER_BLOCK = 600; // 10 minutes
export const BLOCKS_PER_DAY = 144;
export const CSV_TIME_GRANULARITY_SECONDS = 512; // BIP 68 type flag 1: 512s per unit

/**
 * Calculates nSequence value compliant with BIP 68
 * Bit 31: 0 = sequence lock active, 1 = sequence lock disabled
 * Bit 22: 0 = blocks based, 1 = 512-seconds based
 * Bits 0-15: value
 */
export function encodeBip68Sequence(type: 'BLOCKS' | 'TIME_512S', value: number): number {
  if (value < 0 || value > 0xffff) {
    throw new Error('El valor de nSequence relativo debe caber en 16 bits (0 a 65535)');
  }
  if (type === 'BLOCKS') {
    // Bit 22 = 0
    return value & 0x0000ffff;
  } else {
    // Bit 22 = 1 (0x00400000)
    return (value & 0x0000ffff) | 0x00400000;
  }
}

/**
 * Calculates nLockTime value compliant with BIP 65
 * If value < 500,000,000 -> Block height
 * If value >= 500,000,000 -> Unix Epoch Timestamp (seconds)
 */
export function encodeBip65LockTime(type: 'HEIGHT' | 'TIMESTAMP', value: number): number {
  if (type === 'HEIGHT') {
    if (value >= 500000000) {
      throw new Error('La altura de bloque para nLockTime debe ser estrictamente menor a 500,000,000');
    }
    return Math.floor(value);
  } else {
    if (value < 500000000) {
      throw new Error('El timestamp UNIX para nLockTime debe ser mayor o igual a 500,000,000 (05 Nov 1985)');
    }
    return Math.floor(value);
  }
}

/**
 * Convert future ISO date to estimated block height
 */
export function estimateBlockHeightFromDate(targetDateIso: string): number {
  const targetMs = new Date(targetDateIso).getTime();
  const nowMs = Date.now();
  const diffSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const diffBlocks = Math.floor(diffSeconds / AVERAGE_SECONDS_PER_BLOCK);
  return CURRENT_ESTIMATED_BLOCK_HEIGHT + diffBlocks;
}

/**
 * Convert block height to estimated date
 */
export function estimateDateFromBlockHeight(targetHeight: number): string {
  const diffBlocks = targetHeight - CURRENT_ESTIMATED_BLOCK_HEIGHT;
  const diffMs = diffBlocks * AVERAGE_SECONDS_PER_BLOCK * 1000;
  const targetMs = Date.now() + diffMs;
  return new Date(targetMs).toISOString();
}

/**
 * Helper to generate default configuration for any of the 3 modalities
 */
export function createDefaultTimelockConfig(modality: InheritanceModality): TimelockConfig {
  const now = new Date();

  if (modality === 'MODALITY_A_TIMELOCK') {
    // 2 years in future for primary timelock
    const targetDate = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
    const targetHeight = CURRENT_ESTIMATED_BLOCK_HEIGHT + 730 * BLOCKS_PER_DAY;
    const epochSec = Math.floor(targetDate.getTime() / 1000);

    return {
      modality,
      timelockType: 'ABSOLUTE_TIMESTAMP',
      targetDateUtc: targetDate.toISOString(),
      targetTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Argentina/Buenos_Aires',
      targetBlockHeight: targetHeight,
      relativePeriodDays: 730,
      relativeBlocksCount: 730 * BLOCKS_PER_DAY,
      nLockTimeValue: epochSec,
      nSequenceValue: 0xfffffffe, // RBF enabled, locktime active
      mtpBufferHours: 2, // ~11 blocks MTP delay
      estimatedEligibilityDate: new Date(targetDate.getTime() + 2 * 3600 * 1000).toISOString(),
      isAbsolute: true,
      clockAccuracyWarning:
        'Bitcoin calcula el tiempo mediante MTP (Median Time Past de los últimos 11 bloques). Esto genera un retardo conservador de aproximadamente 1 a 2 horas respecto al reloj civil. Los mineros no garantizan inclusión en el minuto exacto.',
    };
  }

  if (modality === 'MODALITY_B_SCHEDULED') {
    // 6 months in future for scheduled transfer
    const targetDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const targetHeight = CURRENT_ESTIMATED_BLOCK_HEIGHT + 180 * BLOCKS_PER_DAY;
    const epochSec = Math.floor(targetDate.getTime() / 1000);

    return {
      modality,
      timelockType: 'ABSOLUTE_TIMESTAMP',
      targetDateUtc: targetDate.toISOString(),
      targetTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Argentina/Buenos_Aires',
      targetBlockHeight: targetHeight,
      relativePeriodDays: 180,
      relativeBlocksCount: 180 * BLOCKS_PER_DAY,
      nLockTimeValue: epochSec,
      nSequenceValue: 0xfffffffd, // RBF active
      mtpBufferHours: 2,
      estimatedEligibilityDate: targetDate.toISOString(),
      isAbsolute: true,
      clockAccuracyWarning:
        'Una transacción con nLockTime NO se difunde sola por arte de magia. Debe almacenarse prefirmada y un operador o nodo deberá transmitirla a la mempool cuando MTP >= nLockTime.',
    };
  }

  // MODALITY_C_INACTIVITY (Dead man switch / Heartbeat relativo)
  // 180 days of inactivity = ~25,920 blocks
  const days = 180;
  const blocks = days * BLOCKS_PER_DAY;
  const seqValue = encodeBip68Sequence('BLOCKS', Math.min(blocks, 65535));

  const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return {
    modality,
    timelockType: 'RELATIVE_BLOCKS',
    targetDateUtc: targetDate.toISOString(),
    targetTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Argentina/Buenos_Aires',
    targetBlockHeight: CURRENT_ESTIMATED_BLOCK_HEIGHT + blocks,
    relativePeriodDays: days,
    relativeBlocksCount: blocks,
    nLockTimeValue: 0,
    nSequenceValue: seqValue,
    mtpBufferHours: 0,
    estimatedEligibilityDate: targetDate.toISOString(),
    isAbsolute: false,
    clockAccuracyWarning:
      'El timelock relativo (OP_CHECKSEQUENCEVERIFY / older) empieza a contar desde que se confirma el UTXO. Si el titular realiza una transacción (gasta o refresca los fondos hacia sí mismo), el contador vuelve a CERO (Heartbeat). La inactividad es una métrica técnica de UTXO, NO una certificación médica de defunción.',
  };
}
